/**
 * Edge Function: scheduler-tick
 *
 * Called by pg_cron (hourly) to enqueue scans for individual tracked_prompts
 * whose `next_scan_at` has elapsed.
 *
 * NEW per-prompt scheduling model (replaces the old project-level scan):
 *   1. Select active prompts with frequency in ('daily','weekly')
 *      AND next_scan_at <= now().
 *   2. Group by project_id to batch the enqueue-scan calls.
 *   3. For each project: invoke enqueue-scan with triggered_by='scheduled'.
 *   4. On success: set last_scanned_at = now() and recompute next_scan_at
 *      based on the prompt's frequency.
 *   5. On quota / rate-limit failure: do NOT advance next_scan_at so the
 *      prompt stays eligible and the next tick retries it.
 *
 * 'manual' prompts are never auto-enqueued; they only run via explicit
 * user triggers (ScanButton, ad-hoc rescan after AIO task / fact update).
 *
 * Invoked by: pg_cron schedule ('0 * * * *' - every hour)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Only these frequencies are eligible for automatic scheduling.
const SCHEDULABLE_FREQUENCIES = ['daily', 'weekly'] as const;
type SchedulableFrequency = (typeof SCHEDULABLE_FREQUENCIES)[number];

/**
 * Compute the next `next_scan_at` for a prompt based on its frequency.
 * Kept in lockstep with the client-side helper in src/hooks/useTier.ts.
 */
function computeNextScanAt(
  frequency: SchedulableFrequency,
  from: Date = new Date(),
): string {
  const offsetMs =
    frequency === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  return new Date(from.getTime() + offsetMs).toISOString();
}

interface DuePrompt {
  id: string;
  project_id: string;
  frequency: SchedulableFrequency;
}

interface ProjectResult {
  project_id: string;
  prompt_ids: string[];
  queued: number;
  skipped_due_to_limit: number;
  advanced: boolean;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Service-role client: cron has no user session.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const now = new Date();
    console.log(`Scheduler tick at ${now.toISOString()}`);

    // =====================================================
    // Step 1: Fetch due prompts (single indexed query)
    // =====================================================
    const { data: duePrompts, error: fetchError } = await supabaseClient
      .from('tracked_prompts')
      .select('id, project_id, frequency')
      .eq('is_active', true)
      .in('frequency', SCHEDULABLE_FREQUENCIES as unknown as string[])
      .lte('next_scan_at', now.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch due prompts: ${fetchError.message}`);
    }

    if (!duePrompts || duePrompts.length === 0) {
      console.log('No prompts due');
      return jsonResponse({
        message: 'No prompts due',
        processed: 0,
        enqueued: 0,
        projects: [],
        timestamp: now.toISOString(),
      });
    }

    console.log(`Found ${duePrompts.length} due prompts`);

    // =====================================================
    // Step 2: Group by project_id (batch enqueues per project)
    // =====================================================
    const promptsByProject = new Map<string, DuePrompt[]>();
    for (const prompt of duePrompts as DuePrompt[]) {
      const bucket = promptsByProject.get(prompt.project_id) ?? [];
      bucket.push(prompt);
      promptsByProject.set(prompt.project_id, bucket);
    }

    console.log(`Grouped into ${promptsByProject.size} projects`);

    // =====================================================
    // Step 3: Enqueue per project, then advance schedules on success
    // =====================================================
    let totalEnqueued = 0;
    const projectResults: ProjectResult[] = [];

    for (const [projectId, prompts] of promptsByProject.entries()) {
      const promptIds = prompts.map((p) => p.id);

      try {
        // Cap batch size per project to avoid one huge enqueue blowing
        // through the entire workspace's monthly quota in a single tick.
        const BATCH = 50;
        const batchIds = promptIds.slice(0, BATCH);
        const deferredIds = promptIds.slice(BATCH);

        const { data, error } = await supabaseClient.functions.invoke(
          'enqueue-scan',
          {
            body: {
              project_id: projectId,
              prompt_ids: batchIds,
              triggered_by: 'scheduled',
            },
          },
        );

        if (error) {
          throw error;
        }

        const queued: number = data?.queued ?? 0;
        const skipped: number = data?.skipped_due_to_limit ?? 0;
        totalEnqueued += queued;

        // Quota exhausted (or near-exhausted): do NOT advance next_scan_at
        // for ANY of this project's due prompts — they stay eligible and
        // retry on the next tick once quota refreshes or jobs drain.
        const quotaHit = skipped > 0 || queued === 0;

        if (quotaHit) {
          console.warn(
            `Project ${projectId}: quota/limit hit (queued=${queued}, skipped=${skipped}). ` +
              'Deferring schedule advance; prompts will retry next tick.',
          );

          projectResults.push({
            project_id: projectId,
            prompt_ids: batchIds,
            queued,
            skipped_due_to_limit: skipped,
            advanced: false,
          });
          continue;
        }

        // Success: advance last_scanned_at + next_scan_at for the prompts
        // we actually enqueued. Deferred (overflow) prompts are NOT advanced
        // so they're picked up on a subsequent tick.
        const advancedIds = batchIds;
        await advancePromptSchedules(supabaseClient, advancedIds, prompts, now);

        projectResults.push({
          project_id: projectId,
          prompt_ids: advancedIds,
          queued,
          skipped_due_to_limit: 0,
          advanced: true,
        });

        if (deferredIds.length > 0) {
          console.log(
            `Project ${projectId}: deferred ${deferredIds.length} overflow prompts to next tick`,
          );
        }
      } catch (error) {
        // Network / 5xx / unexpected: leave prompts due so they retry.
        console.error(
          `Failed to enqueue for project ${projectId}:`,
          error,
        );

        projectResults.push({
          project_id: projectId,
          prompt_ids,
          queued: 0,
          skipped_due_to_limit: 0,
          advanced: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // =====================================================
    // Step 4: Summary
    // =====================================================
    const response = {
      message: `Processed ${duePrompts.length} prompts, enqueued ${totalEnqueued} jobs`,
      processed: duePrompts.length,
      enqueued: totalEnqueued,
      projects: projectResults,
      timestamp: now.toISOString(),
    };

    console.log('Scheduler tick completed:', response);

    return jsonResponse(response);
  } catch (error) {
    console.error('Error in scheduler-tick:', error);

    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      500,
    );
  }
});

// =====================================================
// Helpers
// =====================================================

/**
 * Advance last_scanned_at + next_scan_at for a set of prompts that were
 * successfully enqueued. Each prompt's next_scan_at depends on its own
 * frequency, so we group updates accordingly.
 */
async function advancePromptSchedules(
  supabaseClient: ReturnType<typeof createClient>,
  promptIds: string[],
  prompts: DuePrompt[],
  now: Date,
): Promise<void> {
  // Single bulk update of last_scanned_at (same for all).
  const { error: tsError } = await supabaseClient
    .from('tracked_prompts')
    .update({ last_scanned_at: now.toISOString() })
    .in('id', promptIds);

  if (tsError) {
    console.warn('Failed to update last_scanned_at:', tsError);
  }

  // Per-frequency next_scan_at update.
  const byFreq = new Map<SchedulableFrequency, string[]>();
  for (const p of prompts) {
    if (!promptIds.includes(p.id)) continue;
    const arr = byFreq.get(p.frequency) ?? [];
    arr.push(p.id);
    byFreq.set(p.frequency, arr);
  }

  for (const [freq, ids] of byFreq.entries()) {
    const nextScanAt = computeNextScanAt(freq, now);
    const { error } = await supabaseClient
      .from('tracked_prompts')
      .update({ next_scan_at: nextScanAt })
      .in('id', ids);

    if (error) {
      console.warn(`Failed to set next_scan_at for frequency=${freq}:`, error);
    }
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
