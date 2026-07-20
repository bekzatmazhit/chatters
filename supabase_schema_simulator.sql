-- Фича 1: Симулятор "Что если"

CREATE TABLE IF NOT EXISTS public.simulations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    input_type text NOT NULL CHECK (input_type IN ('draft_content', 'fact_change', 'source_addition')),
    input_content text NOT NULL,
    target_prompt_ids uuid[] NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    result jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_simulations_project_id ON public.simulations(project_id);

-- Включаем RLS
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Политики (простые)
CREATE POLICY "Allow access on simulations" ON public.simulations FOR ALL USING (true);
