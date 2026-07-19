-- Базовые таблицы пайплайна сканирования, 
-- которые необходимы перед накаткой фичи "Персонажи" (т.к. они расширяются).

-- 1. Таблица отслеживаемых промптов
CREATE TABLE IF NOT EXISTS public.tracked_prompts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    prompt_text text NOT NULL,
    ai_models text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Таблица задач сканирования (запусков)
CREATE TABLE IF NOT EXISTS public.scan_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    prompt_text text NOT NULL,
    model text NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    response_text text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Таблица упоминаний (результаты парсинга)
CREATE TABLE IF NOT EXISTS public.mentions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    scan_job_id uuid REFERENCES public.scan_jobs(id) ON DELETE SET NULL,
    brand_name text,
    is_found boolean DEFAULT false,
    sentiment_score numeric,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS для базовой защиты
ALTER TABLE public.tracked_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

-- Простые политики: владелец воркспейса имеет доступ (по аналогии с проектами)
-- Для простоты на данном этапе можно добавить политики или оставить их пустыми, 
-- если доступ идет только через Edge Functions (service role). 
-- Чтобы фронтенд мог читать (как в нашем приложении):

CREATE POLICY "Allow select on tracked_prompts" ON public.tracked_prompts FOR SELECT USING (true);
CREATE POLICY "Allow select on scan_jobs" ON public.scan_jobs FOR SELECT USING (true);
CREATE POLICY "Allow select on mentions" ON public.mentions FOR SELECT USING (true);

CREATE POLICY "Allow insert on tracked_prompts" ON public.tracked_prompts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on scan_jobs" ON public.scan_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on mentions" ON public.mentions FOR INSERT WITH CHECK (true);
