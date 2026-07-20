/**
 * Hook: useRescanTrigger
 *
 * Centralizes the "smart ad-hoc rescan" UX. After the user changes their
 * brand presence (completes an AIO task or adds/edits a Brand Fact), the
 * owning component calls `promptRescan({ projectId, scope })`. This:
 *
 *   1. Suppresses the modal if already shown for this project this session
 *      (sessionStorage flag) — one nag per browser session per project.
 *   2. Otherwise opens the <RescanPromptModal>. The host renders it and
 *      passes back the user's choice.
 *   3. On "Запустить скан": enqueues a manual scan for ALL active prompts
 *      of the project and surfaces a toast + (optionally) a progress modal.
 *
 * The host component owns the visual rendering; this hook owns the logic,
 * the suppression state, and the actual scan invocation.
 */

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useScanJobs } from '@/hooks/useScanJobs';
import { useToast } from '@/hooks/use-toast';
import type { RescanScope } from '@/components/RescanPromptModal';

interface RescanContext {
  projectId: string;
  scope: RescanScope;
}

interface UseRescanTriggerResult {
  /** Whether the rescan modal is currently open. */
  isModalOpen: boolean;
  /** The pending context, or null when modal is closed. */
  pending: RescanContext | null;
  /** Count of active prompts that would be included in the ad-hoc scan. */
  relatedPromptCount: number;
  /** True while a scan is being enqueued. */
  isLaunching: boolean;
  /** Show the modal (unless already shown this session for this project). */
  promptRescan: (ctx: RescanContext) => Promise<void>;
  /** Close the modal without scanning. */
  dismiss: () => void;
  /** User accepted: enqueue a manual scan for the project's active prompts. */
  runScan: () => Promise<void>;
}

function sessionKey(projectId: string): string {
  return `rescan_prompt_dismissed_${projectId}`;
}

export function useRescanTrigger(): UseRescanTriggerResult {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pending, setPending] = useState<RescanContext | null>(null);
  const [relatedPromptCount, setRelatedPromptCount] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);

  const { startScan, subscribeToJobs } = useScanJobs();
  const toastApi = typeof useToast === 'function' ? useToast() : { toast: () => 0, dismiss: () => {}, toasts: [] };
  const { toast } = toastApi;

  const promptRescan = useCallback(async (ctx: RescanContext) => {
    // Once-per-session-per-project suppression.
    try {
      if (sessionStorage.getItem(sessionKey(ctx.projectId)) === '1') {
        return;
      }
    } catch {
      // sessionStorage can throw in some privacy modes; treat as not-set.
    }

    // Count active prompts so the modal can preview scope.
    let count = 0;
    try {
      const { data, error } = await supabase
        .from('tracked_prompts')
        .select('id')
        .eq('project_id', ctx.projectId)
        .eq('is_active', true);
      if (!error && data) count = data.length;
    } catch (err) {
      console.warn('useRescanTrigger: failed to count prompts', err);
    }

    setRelatedPromptCount(count);
    setPending(ctx);
    setIsModalOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    if (!pending) return;
    // Mark dismissed for this session so we don't nag again until reload.
    try {
      sessionStorage.setItem(sessionKey(pending.projectId), '1');
    } catch {
      // Ignore storage failures.
    }
    setIsModalOpen(false);
    setPending(null);
  }, [pending]);

  const runScan = useCallback(async () => {
    if (!pending) return;
    const { projectId } = pending;

    setIsLaunching(true);
    try {
      const result = await startScan({
        project_id: projectId,
        triggered_by: 'manual',
      });

      // Subscribe for realtime progress (the host can mount a progress modal
      // if it wants; the subscription keeps state fresh either way).
      if (result?.job_ids?.length) {
        subscribeToJobs(result.job_ids);
      }

      toast({
        title: 'Внеплановое сканирование запущено',
        description: `Создано ${result.queued} задач${
          result.skipped > 0 ? `, пропущено ${result.skipped} (лимит квоты)` : ''
        }`,
      });

      // Mark dismissed so we don't re-prompt for the same project this session.
      try {
        sessionStorage.setItem(sessionKey(projectId), '1');
      } catch {
        // Ignore.
      }

      setIsModalOpen(false);
      setPending(null);
    } catch (err) {
      console.error('useRescanTrigger: failed to start scan', err);
      toast({
        title: 'Не удалось запустить скан',
        description: err instanceof Error ? err.message : 'Попробуйте позже',
        variant: 'destructive',
      });
    } finally {
      setIsLaunching(false);
    }
  }, [pending, startScan, subscribeToJobs, toast]);

  return {
    isModalOpen,
    pending,
    relatedPromptCount,
    isLaunching,
    promptRescan,
    dismiss,
    runScan,
  };
}
