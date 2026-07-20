-- Migration: Setup pg_cron for scheduled scans
-- Requires pg_cron extension (enabled in Supabase by default)

-- =====================================================
-- Enable pg_cron extension
-- =====================================================
create extension if not exists pg_cron;

-- =====================================================
-- Create cron job: scheduler-tick (runs every hour)
-- =====================================================
select cron.schedule(
  'scan-scheduler-hourly',
  '0 * * * *', -- Every hour at :00
  $$
  select
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/scheduler-tick',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

-- =====================================================
-- RPC: calculate_daily_sov (aggregate helper)
-- =====================================================
create or replace function calculate_daily_sov(
  p_project_id uuid,
  p_date date
)
returns void
language plpgsql
security definer
as $$
declare
  v_total_mentions int;
  v_brand_mentions int;
  v_sov_percent numeric;
  v_avg_sentiment numeric;
begin
  -- Count mentions for the date
  select
    count(*) as total,
    count(*) filter (where brand_mentioned) as brand_count,
    avg(sentiment_score) filter (where brand_mentioned) as avg_sent
  into v_total_mentions, v_brand_mentions, v_avg_sentiment
  from mentions
  where project_id = p_project_id
    and created_at::date = p_date;
  
  -- Calculate SOV percentage
  if v_total_mentions > 0 then
    v_sov_percent := (v_brand_mentions::numeric / v_total_mentions::numeric) * 100;
  else
    v_sov_percent := 0;
  end if;
  
  -- Upsert into sov_history
  insert into sov_history (project_id, date, sov_percent, mentions_count, avg_sentiment)
  values (p_project_id, p_date, v_sov_percent, v_brand_mentions, v_avg_sentiment)
  on conflict (project_id, date)
  do update set
    sov_percent = excluded.sov_percent,
    mentions_count = excluded.mentions_count,
    avg_sentiment = excluded.avg_sentiment,
    updated_at = now();
end;
$$;

-- =====================================================
-- RPC: increment_ai_usage (quota helper)
-- =====================================================
create or replace function increment_ai_usage(
  p_workspace_id uuid,
  p_period_start date
)
returns void
language plpgsql
security definer
as $$
begin
  -- Try to increment existing record
  update ai_usage_limits
  set used = used + 1,
      updated_at = now()
  where workspace_id = p_workspace_id
    and period_start = p_period_start;
  
  -- If no record exists, create one with default limit
  if not found then
    insert into ai_usage_limits (workspace_id, period_start, period_end, limit_total, used)
    values (
      p_workspace_id,
      p_period_start,
      (p_period_start + interval '1 month' - interval '1 day')::date,
      10000, -- Default monthly limit
      1
    );
  end if;
end;
$$;

-- =====================================================
-- Database Webhook trigger for scan_jobs (optional)
-- =====================================================
-- This webhook automatically calls process-scan-job when a new job is inserted
-- Uncomment if you prefer webhook-based processing over cron polling

/*
create or replace function notify_new_scan_job()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Call process-scan-job Edge Function asynchronously
  perform
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/process-scan-job',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
      ),
      body := jsonb_build_object('job_id', new.id)
    );
  
  return new;
end;
$$;

drop trigger if exists on_scan_job_insert on scan_jobs;
create trigger on_scan_job_insert
  after insert on scan_jobs
  for each row
  when (new.status = 'queued')
  execute function notify_new_scan_job();
*/

-- =====================================================
-- Cron job: process queued jobs (alternative to webhook)
-- =====================================================
-- This polls for queued jobs every 30 seconds and processes them
-- Use this if webhooks are not reliable or you want rate limiting

select cron.schedule(
  'process-queued-scans',
  '*/1 * * * *', -- Every minute
  $$
  select
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/process-scan-job',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

-- =====================================================
-- Utility: View cron jobs
-- =====================================================
comment on extension pg_cron is 'Job scheduler for PostgreSQL';

-- To view active cron jobs, run:
-- select * from cron.job;

-- To unschedule a job:
-- select cron.unschedule('scan-scheduler-hourly');
-- select cron.unschedule('process-queued-scans');
