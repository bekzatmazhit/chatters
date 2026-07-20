-- Базовые таблицы для Хаба Интеграций

-- 1. Таблица подключенных интеграций
CREATE TABLE IF NOT EXISTS public.integrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    provider text NOT NULL, -- 'slack', 'telegram', 'google-search-console', etc.
    status text NOT NULL DEFAULT 'disconnected', -- 'connected', 'disconnected', 'pending'
    config jsonb DEFAULT '{}'::jsonb, -- токены, chat_id и прочие настройки
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, provider)
);

-- 2. Таблица заявок на новые интеграции
CREATE TABLE IF NOT EXISTS public.integration_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    service_name text NOT NULL,
    requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_requests ENABLE ROW LEVEL SECURITY;

-- Простые политики на чтение и запись
CREATE POLICY "Allow access on integrations" ON public.integrations FOR ALL USING (true);
CREATE POLICY "Allow access on integration_requests" ON public.integration_requests FOR ALL USING (true);
