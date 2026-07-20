/**
 * Edge Function: enqueue-scan
 * 
 * Creates scan jobs (prompt × model combinations) and adds them to the queue
 * 
 * Input:
 * - project_id?: string - scan one specific project
 * - workspace_id?: string - scan all active projects in workspace
 * - prompt_ids?: string[] - limit to specific prompts (optional)
 * - triggered_by?: 'manual' | 'scheduled' | 'bulk' - source of scan
 * 
 * Returns:
 * - job_ids: string[] - created scan_job IDs for realtime tracking
 * - queued: number - total jobs created
 * - skipped_due_to_limit: number - jobs not created due to quota
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnqueueRequest {
  project_id?: string;
  workspace_id?: string;
  project_ids?: string[];
  prompt_ids?: string[];
  model_ids?: string[];
  persona_ids?: string[];
  triggered_by?: 'manual' | 'scheduled' | 'bulk';
}

interface EnqueueResponse {
  job_ids: string[];
  queued: number;
  skipped_due_to_limit: number;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: EnqueueRequest = await req.json();
    const {
      project_id,
      workspace_id,
      project_ids,
      prompt_ids,
      model_ids,
      persona_ids,
      triggered_by = 'manual',
    } = body;

    if (!project_id && !workspace_id && (!project_ids || project_ids.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Either project_id, workspace_id or project_ids is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // =====================================================
    // Step 1: Determine projects to scan
    // =====================================================
    let projectIds: string[] = [];

    if (project_id) {
      // Single project scan
      projectIds = [project_id];
    } else if (project_ids && project_ids.length > 0) {
      projectIds = project_ids;
    } else if (workspace_id) {
      // Multi-project scan: get all active projects in workspace
      const { data: projects, error: projectsError } = await supabaseClient
        .from('projects')
        .select('id')
        .eq('workspace_id', workspace_id)
        .eq('is_active', true);

      if (projectsError) {
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }

      projectIds = projects?.map((p) => p.id) || [];

      if (projectIds.length === 0) {
        return new Response(
          JSON.stringify({
            job_ids: [],
            queued: 0,
            skipped_due_to_limit: 0,
            message: 'No active projects found in workspace',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // =====================================================
    // Step 2: Check AI usage quota
    // =====================================================
    const workspaceId = workspace_id || (await getWorkspaceIdForProject(supabaseClient, projectIds[0]));
    
    if (!workspaceId) {
      throw new Error('Could not determine workspace_id');
    }

    const currentPeriodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const { data: usageLimit, error: usageLimitError } = await supabaseClient
      .from('ai_usage_limits')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('period_start', currentPeriodStart)
      .single();

    if (usageLimitError && usageLimitError.code !== 'PGRST116') {
      console.warn('Failed to fetch usage limits:', usageLimitError);
    }

    const limitTotal = usageLimit?.limit_total || 10000; // Default limit
    const limitUsed = usageLimit?.used || 0;
    const limitRemaining = Math.max(0, limitTotal - limitUsed);

    // =====================================================
    // Step 3: Collect prompts to scan
    // =====================================================
    const jobsToCreate: Array<{
      project_id: string;
      prompt_id: string;
      ai_model: string;
      persona_id?: string;
      triggered_by: string;
    }> = [];

    for (const projId of projectIds) {
      // Fetch active tracked prompts for this project
      let query = supabaseClient
        .from('tracked_prompts')
        .select('id, ai_models')
        .eq('project_id', projId)
        .eq('is_active', true);

      if (prompt_ids && prompt_ids.length > 0) {
        query = query.in('id', prompt_ids);
      }

      const { data: prompts, error: promptsError } = await query;

      if (promptsError) {
        console.error(`Failed to fetch prompts for project ${projId}:`, promptsError);
        continue;
      }

      if (!prompts || prompts.length === 0) {
        console.warn(`No active prompts found for project ${projId}`);
        continue;
      }

      // Create job for each prompt × model combination, optionally expanded by persona
      for (const prompt of prompts) {
        const models = prompt.ai_models && prompt.ai_models.length > 0
          ? prompt.ai_models
          : ['chatgpt', 'claude', 'gemini', 'perplexity'];

        const targetModels = model_ids && model_ids.length > 0
          ? models.filter((model) => model_ids.includes(model))
          : models;

        if (targetModels.length === 0) {
          continue;
        }

        if (persona_ids && persona_ids.length > 0) {
          for (const model of targetModels) {
            for (const personaId of persona_ids) {
              jobsToCreate.push({
                project_id: projId,
                prompt_id: prompt.id,
                ai_model: model,
                persona_id: personaId,
                triggered_by,
              });
            }
          }
        } else {
          for (const model of targetModels) {
            jobsToCreate.push({
              project_id: projId,
              prompt_id: prompt.id,
              ai_model: model,
              triggered_by,
            });
          }
        }
      }
    }

    // =====================================================
    // Step 4: Apply quota limit and create jobs
    // =====================================================
    const jobsToQueue = jobsToCreate.slice(0, limitRemaining);
    const jobsSkipped = jobsToCreate.length - jobsToQueue.length;

    if (jobsToQueue.length === 0) {
      return new Response(
        JSON.stringify({
          job_ids: [],
          queued: 0,
          skipped_due_to_limit: jobsSkipped,
          message: jobsSkipped > 0 ? 'AI usage quota exceeded' : 'No jobs to create',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert scan jobs
    const { data: createdJobs, error: insertError } = await supabaseClient
      .from('scan_jobs')
      .insert(jobsToQueue)
      .select('id');

    if (insertError) {
      throw new Error(`Failed to create scan jobs: ${insertError.message}`);
    }

    const jobIds = createdJobs?.map((j) => j.id) || [];

    // =====================================================
    // Step 5: Create activity event
    // =====================================================
    if (projectIds.length === 1) {
      await supabaseClient.from('activity_events').insert({
        project_id: projectIds[0],
        event_type: 'scan_completed',
        title: `Запущена проверка: ${jobsToQueue.length} задач`,
        description: `Проверка видимости бренда через ${jobsToQueue.length} запросов к AI-моделям`,
        details: {
          job_ids: jobIds,
          triggered_by,
          models: [...new Set(jobsToQueue.map((j) => j.ai_model))],
        },
      });
    }

    // =====================================================
    // Response
    // =====================================================
    const response: EnqueueResponse = {
      job_ids: jobIds,
      queued: jobIds.length,
      skipped_due_to_limit: jobsSkipped,
      message:
        jobsSkipped > 0
          ? `Enqueued ${jobIds.length} jobs, skipped ${jobsSkipped} due to quota limit`
          : `Enqueued ${jobIds.length} scan jobs successfully`,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enqueue-scan:', error);

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
// Helper: Get workspace_id for a project
// =====================================================
async function getWorkspaceIdForProject(supabaseClient: any, projectId: string): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('projects')
    .select('workspace_id')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Failed to fetch workspace_id:', error);
    return null;
  }

  return data?.workspace_id || null;
}
