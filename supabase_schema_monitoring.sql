-- Базовые таблицы для подвкладок Мониторинга

-- 1. Таблица триггеров
CREATE TABLE IF NOT EXISTS public.triggers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    metric text NOT NULL, -- 'SOV', 'Упоминания', 'AIO-Скор', etc.
    operator text NOT NULL, -- '<', '>', '='
    value text NOT NULL,
    channel text NOT NULL, -- 'Slack', 'Telegram', 'Email'
    model text, -- опционально, к какой модели привязан
    last_triggered timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Таблица алертов
CREATE TABLE IF NOT EXISTS public.alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    trigger_id uuid REFERENCES public.triggers(id) ON DELETE SET NULL,
    message text NOT NULL,
    status text DEFAULT 'new', -- 'new', 'viewed', 'resolved'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Таблица хронологии событий
CREATE TABLE IF NOT EXISTS public.activity_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    event_type text NOT NULL, -- 'metric', 'hallucination', 'trigger', 'integration'
    title text NOT NULL,
    description text,
    details jsonb, -- Расширенная информация для модалки/деталей
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS
ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Простые политики на чтение и запись
CREATE POLICY "Allow access on triggers" ON public.triggers FOR ALL USING (true);
CREATE POLICY "Allow access on alerts" ON public.alerts FOR ALL USING (true);
CREATE POLICY "Allow access on activity_events" ON public.activity_events FOR ALL USING (true);
