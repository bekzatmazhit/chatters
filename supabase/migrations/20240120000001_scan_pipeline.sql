-- Migration: Core scan pipeline tables
-- scan_jobs: queue for scan tasks (prompt × model combinations)
-- mentions: structured results from AI model responses

-- =====================================================
-- TABLE: scan_jobs
-- =====================================================
create table if not exists scan_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  prompt_id uuid references tracked_prompts(id) on delete cascade not null,
  ai_model text not null check (ai_model in ('chatgpt', 'claude', 'gemini', 'perplexity')),
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  triggered_by text not null check (triggered_by in ('manual', 'scheduled', 'bulk')),
  error_message text,
  retry_count int not null default 0 check (retry_count >= 0 and retry_count <= 3),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  
  -- Constraints
  constraint scan_jobs_timestamps_order check (
    (started_at is null or started_at >= created_at) and
    (finished_at is null or (started_at is not null and finished_at >= started_at))
  )
);

-- Indexes for scan_jobs
create index if not exists scan_jobs_project_status_idx on scan_jobs (project_id, status);
create index if not exists scan_jobs_status_created_idx on scan_jobs (status, created_at) where status = 'queued';
create index if not exists scan_jobs_project_created_idx on scan_jobs (project_id, created_at desc);

comment on table scan_jobs is 'Queue for AI model scan tasks (one job per prompt×model combination)';
comment on column scan_jobs.triggered_by is 'Source of scan: manual (user button), scheduled (cron), bulk (mass operation)';
comment on column scan_jobs.retry_count is 'Number of retries after transient failures (max 3)';

-- =====================================================
-- TABLE: mentions (extend or create)
-- =====================================================
create table if not exists mentions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  prompt_id uuid references tracked_prompts(id) on delete cascade not null,
  scan_job_id uuid references scan_jobs(id) on delete set null,
  ai_model text not null check (ai_model in ('chatgpt', 'claude', 'gemini', 'perplexity')),
  
  -- Raw response
  raw_response text not null,
  
  -- Extracted structured data
  brand_mentioned boolean not null,
  position int check (position is null or position > 0),
  sentiment_score numeric check (sentiment_score is null or (sentiment_score >= -1 and sentiment_score <= 1)),
  competitors_mentioned jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  
  -- Metadata
  is_manual boolean not null default false,
  extraction_degraded boolean not null default false,
  created_at timestamptz not null default now(),
  
  -- Constraints
  constraint mentions_position_if_mentioned check (
    (not brand_mentioned and position is null) or brand_mentioned
  ),
  constraint mentions_sentiment_if_mentioned check (
    (not brand_mentioned and sentiment_score is null) or brand_mentioned
  )
);

-- Indexes for mentions
create index if not exists mentions_project_created_idx on mentions (project_id, created_at desc);
create index if not exists mentions_prompt_model_idx on mentions (prompt_id, ai_model, created_at desc);
create index if not exists mentions_scan_job_idx on mentions (scan_job_id);
create index if not exists mentions_brand_mentioned_idx on mentions (project_id, brand_mentioned, created_at desc);

comment on table mentions is 'Structured AI model responses with brand visibility data';
comment on column mentions.raw_response is 'Complete text response from AI model';
comment on column mentions.position is 'Brand position among all mentioned companies (1=first, null=not mentioned)';
comment on column mentions.sentiment_score is 'Sentiment: -1 (negative) to 1 (positive), null if not mentioned';
comment on column mentions.competitors_mentioned is 'Array of {name: string, position: number}';
comment on column mentions.sources is 'Array of {domain: string, url?: string} citations';
comment on column mentions.extraction_degraded is 'True if LLM extraction failed and fallback regex was used';

-- =====================================================
-- TABLE: sov_history (daily aggregates)
-- =====================================================
create table if not exists sov_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  date date not null,
  sov_percent numeric not null check (sov_percent >= 0 and sov_percent <= 100),
  mentions_count int not null default 0 check (mentions_count >= 0),
  avg_sentiment numeric check (avg_sentiment is null or (avg_sentiment >= -1 and avg_sentiment <= 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint sov_history_unique_project_date unique (project_id, date)
);

create index if not exists sov_history_project_date_idx on sov_history (project_id, date desc);

comment on table sov_history is 'Daily Share of Voice aggregates per project';
comment on column sov_history.sov_percent is 'Percentage of prompts where brand was mentioned';
comment on column sov_history.mentions_count is 'Total brand mentions on this date';
comment on column sov_history.avg_sentiment is 'Average sentiment score for mentions on this date';

-- =====================================================
-- TABLE: ai_usage_limits (workspace-level quotas)
-- =====================================================
create table if not exists ai_usage_limits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  period_start date not null,
  period_end date not null,
  limit_total int not null check (limit_total > 0),
  used int not null default 0 check (used >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint ai_usage_limits_unique_workspace_period unique (workspace_id, period_start)
);

create index if not exists ai_usage_limits_workspace_period_idx on ai_usage_limits (workspace_id, period_start desc);

comment on table ai_usage_limits is 'Monthly AI API usage quotas per workspace';
comment on column ai_usage_limits.used is 'Number of AI API calls consumed in this period';

-- =====================================================
-- TABLE: triggers (alert conditions)
-- =====================================================
create table if not exists triggers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  metric text not null check (metric in ('sov', 'mentions', 'sentiment', 'hallucinations')),
  operator text not null check (operator in ('<', '>', '=', '<=', '>=')),
  threshold_value numeric not null,
  ai_model text check (ai_model is null or ai_model in ('chatgpt', 'claude', 'gemini', 'perplexity')),
  notification_channel text check (notification_channel is null or notification_channel in ('telegram', 'slack', 'email')),
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists triggers_project_active_idx on triggers (project_id, is_active);

comment on table triggers is 'Automated alert rules for metric thresholds';
comment on column triggers.metric is 'Metric to monitor: sov, mentions, sentiment, hallucinations';
comment on column triggers.ai_model is 'Optional: trigger only for specific AI model';

-- =====================================================
-- TABLE: alerts (triggered alerts)
-- =====================================================
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  trigger_id uuid references triggers(id) on delete set null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'viewed', 'resolved')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alerts_project_status_idx on alerts (project_id, status, created_at desc);
create index if not exists alerts_trigger_idx on alerts (trigger_id, created_at desc);

comment on table alerts is 'Triggered alerts from threshold violations';
comment on column alerts.metadata is 'Additional context: current value, threshold, etc.';

-- =====================================================
-- TABLE: activity_events (timeline)
-- =====================================================
create table if not exists activity_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  event_type text not null check (event_type in ('metric', 'hallucination', 'trigger', 'integration', 'scan_completed')),
  title text not null,
  description text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_project_created_idx on activity_events (project_id, created_at desc);
create index if not exists activity_events_type_idx on activity_events (event_type, created_at desc);

comment on table activity_events is 'Timeline of all project events (metrics, triggers, scans)';

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to relevant tables
drop trigger if exists sov_history_updated_at on sov_history;
create trigger sov_history_updated_at before update on sov_history
  for each row execute function update_updated_at_column();

drop trigger if exists ai_usage_limits_updated_at on ai_usage_limits;
create trigger ai_usage_limits_updated_at before update on ai_usage_limits
  for each row execute function update_updated_at_column();

drop trigger if exists triggers_updated_at on triggers;
create trigger triggers_updated_at before update on triggers
  for each row execute function update_updated_at_column();

drop trigger if exists alerts_updated_at on alerts;
create trigger alerts_updated_at before update on alerts
  for each row execute function update_updated_at_column();
