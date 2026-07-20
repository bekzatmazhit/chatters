/**
 * Edge Function: process-scan-job (Worker)
 * 
 * Processes queued scan jobs:
 * 1. Pick job from queue (status='queued')
 * 2. Call AI provider
 * 3. Extract structured data (LLM-as-judge)
 * 4. Write to mentions table
 * 5. Update aggregates
 * 6. Evaluate triggers
 * 7. Increment AI usage quota
 * 
 * Can be invoked:
 * - By Database Webhook on scan_jobs insert
 * - By pg_cron periodic polling
 * - Manually via HTTP POST with job_id
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { runProvider, isRetryableError, ProviderError } from '../_shared/ai-providers.ts';
import { extractMentionData } from '../_shared/extract-mention-data.ts';
import { updateAggregates } from '../_shared/update-aggregates.ts';
import { evaluateTriggers } from '../_shared/evaluate-triggers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRIES = 2;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for background workers
    );

    // Get job_id from request body (if provided) or pick next from queue
    const body = await req.json().catch(() => ({}));
    const jobId = body.job_id;

    let job: any;

    if (jobId) {
      // Process specific job
      const { data, error } = await supabaseClient
        .from('scan_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !data) {
        throw new Error(`Job ${jobId} not found`);
      }

      job = data;
    } else {
      // Pick next queued job (FIFO with lock)
      const { data, error } = await supabaseClient
        .from('scan_jobs')
        .select('*')
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ message: 'No jobs in queue' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      job = data;
    }

    // =====================================================
    // Process the job
    // =====================================================
    await processJob(supabaseClient, job);

    return new Response(
      JSON.stringify({
        success: true,
        job_id: job.id,
        message: 'Job processed successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-scan-job:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// =====================================================
// Main job processing logic
// =====================================================
async function processJob(supabaseClient: any, job: any): Promise<void> {
  const { id: jobId, project_id, prompt_id, ai_model, retry_count } = job;

  try {
    console.log(`Processing job ${jobId}: ${ai_model} for prompt ${prompt_id}`);

    // Step 1: Mark job as running
    await supabaseClient
      .from('scan_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', jobId);

    // Step 2: Fetch prompt text and project context
    const { data: prompt, error: promptError } = await supabaseClient
      .from('tracked_prompts')
      .select('prompt_text')
      .eq('id', prompt_id)
      .single();

    if (promptError || !prompt) {
      throw new Error(`Failed to fetch prompt: ${promptError?.message}`);
    }

    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('name, domain, competitors, name_aliases, workspace_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      throw new Error(`Failed to fetch project: ${projectError?.message}`);
    }

    // Step 3: Call AI provider
    const providerResponse = await runProvider(ai_model, prompt.prompt_text);

    console.log(`Provider ${ai_model} responded with ${providerResponse.rawText.length} chars`);

    // Step 4: Extract structured data
    const extractedData = await extractMentionData(
      providerResponse.rawText,
      {
        name: project.name,
        domain: project.domain,
        competitors: project.competitors,
        name_aliases: project.name_aliases,
      },
      providerResponse.sources // Native sources for Perplexity
    );

    console.log(`Extracted: brand_mentioned=${extractedData.brand_mentioned}, position=${extractedData.position}`);

    // Step 5: Write mention to database
    const { data: mention, error: mentionError } = await supabaseClient
      .from('mentions')
      .insert({
        project_id,
        prompt_id,
        scan_job_id: jobId,
        ai_model,
        raw_response: providerResponse.rawText,
        brand_mentioned: extractedData.brand_mentioned,
        position: extractedData.position,
        sentiment_score: extractedData.sentiment_score,
        competitors_mentioned: extractedData.competitors_mentioned,
        sources: extractedData.sources_mentioned,
        extraction_degraded: extractedData.extraction_degraded,
        is_manual: false,
      })
      .select()
      .single();

    if (mentionError) {
      throw new Error(`Failed to insert mention: ${mentionError.message}`);
    }

    console.log(`Created mention ${mention.id}`);

    // Step 6: Mark job as done
    await supabaseClient
      .from('scan_jobs')
      .update({
        status: 'done',
        finished_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', jobId);

    // Step 7: Update aggregates
    await updateAggregates(supabaseClient, project_id);

    // Step 8: Evaluate triggers
    await evaluateTriggers(supabaseClient, project_id);

    // Step 9: Increment AI usage quota
    await incrementUsageQuota(supabaseClient, project.workspace_id);

    console.log(`Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);

    // Determine if error is retryable
    const isRetryable = isRetryableError(error);
    const canRetry = retry_count < MAX_RETRIES && isRetryable;

    if (canRetry) {
      // Re-queue for retry
      await supabaseClient
        .from('scan_jobs')
        .update({
          status: 'queued',
          retry_count: retry_count + 1,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', jobId);

      console.log(`Job ${jobId} re-queued for retry (attempt ${retry_count + 1})`);
    } else {
      // Mark as failed
      await supabaseClient
        .from('scan_jobs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', jobId);

      console.log(`Job ${jobId} marked as failed after ${retry_count} retries`);
    }

    throw error;
  }
}

// =====================================================
// Increment AI usage quota
// =====================================================
async function incrementUsageQuota(supabaseClient: any, workspaceId: string): Promise<void> {
  try {
    const currentPeriodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];

    // Try to increment existing limit
    const { error: updateError } = await supabaseClient.rpc('increment_ai_usage', {
      p_workspace_id: workspaceId,
      p_period_start: currentPeriodStart,
    });

    if (updateError) {
      console.warn('RPC increment_ai_usage failed, using manual update:', updateError);

      // Fallback: manual increment
      const { data: existing } = await supabaseClient
        .from('ai_usage_limits')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('period_start', currentPeriodStart)
        .single();

      if (existing) {
        await supabaseClient
          .from('ai_usage_limits')
          .update({ used: existing.used + 1 })
          .eq('id', existing.id);
      } else {
        // Create new limit entry
        const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];

        await supabaseClient.from('ai_usage_limits').insert({
          workspace_id: workspaceId,
          period_start: currentPeriodStart,
          period_end: periodEnd,
          limit_total: 10000, // Default limit
          used: 1,
        });
      }
    }

    console.log(`Incremented AI usage for workspace ${workspaceId}`);
  } catch (error) {
    console.error('Failed to increment usage quota:', error);
    // Don't throw - quota tracking is non-critical
  }
}
