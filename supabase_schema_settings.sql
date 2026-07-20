-- Базовые таблицы для Настроек Проекта

-- 1. Таблица регулярных отчетов
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    frequency text NOT NULL DEFAULT 'weekly',
    day_time text NOT NULL DEFAULT 'понедельник 09:00',
    recipients text[] DEFAULT '{}'::text[],
    format text NOT NULL DEFAULT 'pdf',
    content_flags jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id) -- Один конфиг отчета на проект (для простоты)
);

-- 2. Таблица настроек White-Label (может быть на уровне workspace, но делаем для проекта как опцию)
CREATE TABLE IF NOT EXISTS public.white_label_settings (
    project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    logo_url text,
    brand_color text DEFAULT '#111827',
    custom_domain text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Добавляем колонку plan в workspaces, если её нет (для проверки PRO)
ALTER TABLE public.workspaces 
    ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';

-- Убедимся, что таблицы используют ON DELETE CASCADE для projects
-- (В наших предыдущих скриптах мы уже прописывали ON DELETE CASCADE для:
-- tracked_prompts, scan_jobs, mentions, triggers, alerts, activity_events, integrations, integration_requests.
-- Если где-то забыли, вот страховочный скрипт для основных):
-- 
-- ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_project_id_fkey;
-- ALTER TABLE public.integrations ADD CONSTRAINT integrations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Включаем RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;

-- Политики на чтение и запись
CREATE POLICY "Allow access on scheduled_reports" ON public.scheduled_reports FOR ALL USING (true);
CREATE POLICY "Allow access on white_label_settings" ON public.white_label_settings FOR ALL USING (true);
