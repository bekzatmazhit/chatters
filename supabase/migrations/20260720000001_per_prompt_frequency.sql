-- =====================================================
-- Migration: Per-prompt scan frequency + workspace tier
-- =====================================================
-- Apply this via the Supabase dashboard SQL editor or `supabase db push`.
-- Idempotent: safe to re-run.
--
-- Business context:
--   LLMs don't retrain daily, so scanning identical prompts every day wastes
--   API credits. We move from a single global project scan frequency to a
--   per-tracked_prompt frequency (daily | weekly | manual), gated by the
--   workspace's subscription tier. The scheduler reads `next_scan_at`
--   directly instead of recomputing due-ness client-side.
-- =====================================================

-- =====================================================
-- 1a. tracked_prompts: per-prompt scheduling columns
-- =====================================================
alter table tracked_prompts
  add column if not exists frequency text
    check (frequency is null or frequency in ('daily', 'weekly', 'manual')),
  add column if not exists last_scanned_at timestamptz,
  add column if not exists next_scan_at timestamptz;

-- Drop the old hourly/monthly-style default if a previous deploy set one;
-- the only valid auto-schedulable values are now daily | weekly | manual.
update tracked_prompts
  set frequency = 'weekly'
  where frequency is null
     or frequency not in ('daily', 'weekly', 'manual');

-- Backfill next_scan_at: anything missing a schedule gets "due next week".
-- Prompts that have never been scanned become due immediately (next_scan_at = now)
-- so the first scheduler tick picks them up.
update tracked_prompts
  set next_scan_at = case
    when last_scanned_at is null then now()
    when frequency = 'daily'     then last_scanned_at + interval '1 day'
    when frequency = 'weekly'    then last_scanned_at + interval '7 days'
    -- 'manual' prompts are never auto-scheduled; leave null.
    else null
  end
  where frequency in ('daily', 'weekly')
    and next_scan_at is null;

-- Add a NOT NULL constraint now that everything has a value (only for
-- auto-schedulable prompts). We keep frequency nullable for legacy rows
-- that may still be in-flight during rollout; the app treats null as weekly.
alter table tracked_prompts
  alter column frequency set default 'weekly';

comment on column tracked_prompts.frequency is 'Per-prompt scan cadence: daily | weekly | manual (manual = only via explicit trigger)';
comment on column tracked_prompts.last_scanned_at is 'Timestamp of the last successful scan that included this prompt';
comment on column tracked_prompts.next_scan_at is 'When the scheduler should next enqueue this prompt (null for manual)';

-- Hot path index for the scheduler query:
--   select ... where is_active and frequency in ('daily','weekly') and next_scan_at <= now()
create index if not exists tracked_prompts_due_idx
  on tracked_prompts (next_scan_at)
  where is_active = true and frequency in ('daily', 'weekly');

-- =====================================================
-- 1b. workspaces: subscription tier (source of truth for gating)
-- =====================================================
alter table workspaces
  add column if not exists subscription_tier text
    default 'starter'
    check (subscription_tier in ('starter', 'growth', 'agency'));

-- Existing workspaces default to starter; upgrade manually per customer.
update workspaces
  set subscription_tier = 'starter'
  where subscription_tier is null;

comment on column workspaces.subscription_tier is 'Pricing tier: starter | growth | agency. Gates per-prompt scan frequency options.';
