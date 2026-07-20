/**
 * Hook: useTier
 *
 * Resolves the current workspace's subscription tier and exposes the
 * per-tier frequency capability map used to gate the PromptFrequencySelect.
 *
 * Tier is stored on the `workspaces` table (subscription_tier column, see
 * migration 20260720000001_per_prompt_frequency.sql). The active workspace
 * is derived from the current project (projects.workspace_id).
 *
 * On any error or missing data we fall back to the most restrictive tier
 * ('starter') so we never over-entitle a user.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Tier = 'starter' | 'growth' | 'agency';

export type Frequency = 'daily' | 'weekly' | 'manual';

/**
 * Which frequencies each tier is allowed to assign to a tracked_prompt.
 * - starter: weekly + manual only (daily is upsell)
 * - growth:  all three
 * - agency:  all three (custom intervals would extend this later)
 */
export const FREQUENCY_CAPABILITY: Record<Tier, Frequency[]> = {
  starter: ['weekly', 'manual'],
  growth: ['daily', 'weekly', 'manual'],
  agency: ['daily', 'weekly', 'manual'],
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  manual: 'Вручную',
};

export const FREQUENCY_HINTS: Record<Frequency, string> = {
  daily: 'Раз в сутки — для топ-3-5 приоритетных запросов',
  weekly: 'Раз в неделю — для длинного хвоста нишевых запросов',
  manual: 'Только по кнопке — для разовых проверок',
};

const VALID_TIERS: Tier[] = ['starter', 'growth', 'agency'];

function isValidTier(value: unknown): value is Tier {
  return typeof value === 'string' && (VALID_TIERS as string[]).includes(value);
}

interface UseTierOptions {
  /** Project id used to resolve the owning workspace. */
  projectId?: string;
  /** Workspace id, if known directly (skips the project lookup). */
  workspaceId?: string;
}

interface UseTierResult {
  tier: Tier;
  allowedFrequencies: Frequency[];
  loading: boolean;
}

export function useTier(options: UseTierOptions = {}): UseTierResult {
  const { projectId, workspaceId } = options;
  const [tier, setTier] = useState<Tier>('starter');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!projectId && !workspaceId) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        let wsId = workspaceId;

        if (!wsId && projectId) {
          const { data: proj, error } = await supabase
            .from('projects')
            .select('workspace_id')
            .eq('id', projectId)
            .maybeSingle();

          if (error) throw error;
          wsId = proj?.workspace_id ?? undefined;
        }

        if (!wsId) {
          // No workspace context — stay on the safe default.
          if (!cancelled) setTier('starter');
          return;
        }

        const { data: ws, error } = await supabase
          .from('workspaces')
          .select('subscription_tier')
          .eq('id', wsId)
          .maybeSingle();

        if (error) throw error;

        if (!cancelled) {
          setTier(isValidTier(ws?.subscription_tier) ? ws!.subscription_tier : 'starter');
        }
      } catch (err) {
        console.warn('useTier: failed to resolve tier, defaulting to starter', err);
        if (!cancelled) setTier('starter');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    resolve();

    return () => {
      cancelled = true;
    };
  }, [projectId, workspaceId]);

  return {
    tier,
    allowedFrequencies: FREQUENCY_CAPABILITY[tier],
    loading,
  };
}

/**
 * Compute the next `next_scan_at` timestamp for a prompt given its frequency.
 * Kept in lockstep with the backend helper in
 * supabase/functions/scheduler-tick/index.ts (computeNextScanAt).
 *
 * 'manual' returns null (never auto-scheduled).
 */
export function computeNextScanAt(
  frequency: Frequency,
  from: Date = new Date(),
): string | null {
  switch (frequency) {
    case 'daily':
      return new Date(from.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case 'weekly':
      return new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'manual':
      return null;
  }
}
