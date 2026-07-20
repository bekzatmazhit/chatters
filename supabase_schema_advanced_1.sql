-- Фичи следующего уровня: Индустриальные бенчмарки и Связка с трафиком

-- 1. Обновление таблицы projects
ALTER TABLE public.projects 
    ADD COLUMN IF NOT EXISTS niche text;

-- 2. Таблица индустриальных бенчмарков
CREATE TABLE IF NOT EXISTS public.niche_benchmarks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    niche text NOT NULL,
    metric_date date NOT NULL,
    median_sov numeric NOT NULL,
    p90_sov numeric NOT NULL, -- Топ-10%
    sample_size int NOT NULL, -- Должно быть >= 5 для показа в UI
    calculated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(niche, metric_date)
);

-- 3. Таблица корреляции с трафиком
CREATE TABLE IF NOT EXISTS public.traffic_correlations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    date date NOT NULL,
    citation_events_count int NOT NULL DEFAULT 0,
    sessions_count int,
    referral_source text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, date, referral_source)
);

-- Включаем RLS
ALTER TABLE public.niche_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_correlations ENABLE ROW LEVEL SECURITY;

-- Политики (простые)
CREATE POLICY "Allow access on niche_benchmarks" ON public.niche_benchmarks FOR ALL USING (true);
CREATE POLICY "Allow access on traffic_correlations" ON public.traffic_correlations FOR ALL USING (true);
