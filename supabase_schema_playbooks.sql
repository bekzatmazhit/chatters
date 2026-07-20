-- Фича 8: Плейбуки (Автоматизация реакции)

CREATE TABLE IF NOT EXISTS public.playbooks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    trigger_condition jsonb NOT NULL, 
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.playbook_steps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    playbook_id uuid NOT NULL REFERENCES public.playbooks(id) ON DELETE CASCADE,
    step_order int NOT NULL,
    action_type text NOT NULL, 
    action_config jsonb NOT NULL, 
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_steps ENABLE ROW LEVEL SECURITY;

-- Политики (простые)
CREATE POLICY "Allow access on playbooks" ON public.playbooks FOR ALL USING (true);
CREATE POLICY "Allow access on playbook_steps" ON public.playbook_steps FOR ALL USING (true);
