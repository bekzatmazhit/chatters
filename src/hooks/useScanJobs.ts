/**
 * Hook: useScanJobs
 * 
 * Manages scan job lifecycle:
 * - Start new scan
 * - Track progress via realtime
 * - Get job status
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ScanJobStatus {
  id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  ai_model: string;
  error_message?: string;
  created_at: string;
  finished_at?: string;
}

export interface ScanProgress {
  total: number;
  queued: number;
  running: number;
  done: number;
  failed: number;
}

export function useScanJobs(projectId?: string) {
  const [jobs, setJobs] = useState<ScanJobStatus[]>([]);
  const [progress, setProgress] = useState<ScanProgress>({
    total: 0,
    queued: 0,
    running: 0,
    done: 0,
    failed: 0,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate progress from jobs
  useEffect(() => {
    const total = jobs.length;
    const queued = jobs.filter(j => j.status === 'queued').length;
    const running = jobs.filter(j => j.status === 'running').length;
    const done = jobs.filter(j => j.status === 'done').length;
    const failed = jobs.filter(j => j.status === 'failed').length;

    setProgress({ total, queued, running, done, failed });
    setIsScanning(queued > 0 || running > 0);
  }, [jobs]);

  // Start a new scan
  const startScan = useCallback(async (options?: {
    project_id?: string;
    workspace_id?: string;
    prompt_ids?: string[];
    model_ids?: string[];
    persona_ids?: string[];
    project_ids?: string[];
    triggered_by?: 'manual' | 'scheduled' | 'bulk';
  }) => {
    try {
      setError(null);
      setIsScanning(true);

      // MOCK MODE: Always simulate jobs per user request
      const MOCK_MODE = true;
      if (MOCK_MODE) {
        const mockJobIds = ['mock-job-1', 'mock-job-2', 'mock-job-3', 'mock-job-4'];
        
        const initialJobs: ScanJobStatus[] = mockJobIds.map((id, index) => ({
          id,
          status: 'queued' as const,
          ai_model: ['chatgpt', 'claude', 'gemini', 'perplexity'][index],
          created_at: new Date().toISOString(),
        }));
        
        setJobs(initialJobs);
        
        // Simulate progress
        mockJobIds.forEach((id, index) => {
          setTimeout(() => {
            setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'running' } : j));
            setTimeout(() => {
              setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'done', finished_at: new Date().toISOString() } : j));
            }, 1500 + Math.random() * 1500);
          }, 500 + index * 800);
        });
        
        return {
          job_ids: mockJobIds,
          queued: mockJobIds.length,
          skipped: 0,
        };
      }

      // Live mode (currently unreachable due to MOCK_MODE = true)
      const { data, error: invokeError } = await supabase.functions.invoke('enqueue-scan', {
        body: {
          project_id: options?.project_id || projectId,
          workspace_id: options?.workspace_id,
          prompt_ids: options?.prompt_ids,
          model_ids: options?.model_ids,
          persona_ids: options?.persona_ids,
          project_ids: options?.project_ids,
          triggered_by: options?.triggered_by ?? 'manual',
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (!data || !data.job_ids || data.job_ids.length === 0) {
        throw new Error(data?.message || 'No jobs created');
      }

      const initialJobs: ScanJobStatus[] = data.job_ids.map((id: string) => ({
        id,
        status: 'queued' as const,
        ai_model: 'unknown',
        created_at: new Date().toISOString(),
      }));

      setJobs(initialJobs);

      return {
        job_ids: data.job_ids,
        queued: data.queued,
        skipped: data.skipped_due_to_limit || 0,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start scan';
      setError(errorMessage);
      setIsScanning(false);
      throw err;
    }
  }, [projectId]);

  // Subscribe to realtime updates for specific jobs
  const subscribeToJobs = useCallback((jobIds: string[]) => {
    if (!jobIds || jobIds.length === 0) return () => {};

    const channel = supabase
      .channel(`scan_jobs_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scan_jobs',
          filter: `id=in.(${jobIds.join(',')})`,
        },
        (payload) => {
          console.log('Scan job update:', payload);

          if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as ScanJobStatus;

            setJobs((prev) =>
              prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to all jobs for a project (for history view)
  const subscribeToProjectJobs = useCallback((projId: string) => {
    const channel = supabase
      .channel(`project_scan_jobs_${projId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_jobs',
          filter: `project_id=eq.${projId}`,
        },
        (payload) => {
          console.log('New scan job:', payload);
          const newJob = payload.new as ScanJobStatus;
          setJobs((prev) => [newJob, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scan_jobs',
          filter: `project_id=eq.${projId}`,
        },
        (payload) => {
          const updatedJob = payload.new as ScanJobStatus;
          setJobs((prev) =>
            prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to new mentions (for immediate UI updates)
  const subscribeToMentions = useCallback((projId: string, onNewMention?: (mention: any) => void) => {
    const channel = supabase
      .channel(`project_mentions_${projId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mentions',
          filter: `project_id=eq.${projId}`,
        },
        (payload) => {
          console.log('New mention:', payload);
          if (onNewMention) {
            onNewMention(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Clear current scan state
  const clearScan = useCallback(() => {
    setJobs([]);
    setProgress({ total: 0, queued: 0, running: 0, done: 0, failed: 0 });
    setIsScanning(false);
    setError(null);
  }, []);

  return {
    jobs,
    progress,
    isScanning,
    error,
    startScan,
    subscribeToJobs,
    subscribeToProjectJobs,
    subscribeToMentions,
    clearScan,
  };
}
