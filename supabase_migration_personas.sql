-- Миграция: Добавление сущности "Персонажи" в систему сканирования
-- Эта миграция расширяет пайплайн сканирования новым измерением - профилями пользователей.

-- 1. Таблица профилей пользователей (Персонажей)
create table personas (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  name text not null, -- "родитель школьника", "абитуриент"
  role text, -- свободный текст или короткий тег
  city text, -- "Алматы", "Астана" и т.д., опционально
  language text default 'ru', -- ru | kz | en
  context_notes text, -- доп. контекст: "переживает за бюджет", "торопится с решением"
  icon_emoji text, -- для визуального различия в UI без загрузки картинок
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Варианты промптов, адаптированные под персонажа
create table persona_prompt_variants (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid references personas(id) not null,
  tracked_prompt_id uuid references tracked_prompts(id) not null,
  generated_query_text text not null,
  status text not null default 'approved', -- 'pending_review' | 'approved' | 'edited'
  created_at timestamptz not null default now(),
  unique (persona_id, tracked_prompt_id)
);

-- 3. Расширение существующих таблиц пайплайна
alter table scan_jobs add column persona_id uuid references personas(id); -- null = обычный скан без персонажа
alter table mentions add column persona_id uuid references personas(id);
alter table tracked_prompts add column run_for_personas uuid[] default '{}'; -- список persona_id, для которых прогонять этот промпт помимо базового
