-- Фича 5: Прогноз и Форкаст (Сценарный анализ SOV)

CREATE TABLE IF NOT EXISTS public.forecasts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    horizon_days int NOT NULL, -- 30, 60, 90
    baseline_projection jsonb NOT NULL, -- Массив объектов { date, value }
    optimistic_projection jsonb NOT NULL, -- Массив объектов { date, value }
    calculated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, horizon_days)
);

-- Включаем RLS
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

-- Политики (простые)
CREATE POLICY "Allow access on forecasts" ON public.forecasts FOR ALL USING (true);
