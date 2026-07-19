-- Таблица workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS для workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Таблица projects (создаем, если нет)
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Добавляем нужные колонки в projects, если они уже существовали, но без нужных полей
ALTER TABLE public.projects 
    ADD COLUMN IF NOT EXISTS domain text,
    ADD COLUMN IF NOT EXISTS logo_url text,
    ADD COLUMN IF NOT EXISTS color text DEFAULT '#10b981',
    ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS tracked_ai_models text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS competitors text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS tracked_prompts text[] DEFAULT '{}'::text[];

-- Включаем RLS для projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Политики для workspaces (Удаляем старые перед созданием, чтобы избежать ошибки "уже существует")
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.workspaces;
CREATE POLICY "Users can view their own workspaces" ON public.workspaces FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can create their own workspaces" ON public.workspaces;
CREATE POLICY "Users can create their own workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own workspaces" ON public.workspaces;
CREATE POLICY "Users can update their own workspaces" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own workspaces" ON public.workspaces;
CREATE POLICY "Users can delete their own workspaces" ON public.workspaces FOR DELETE USING (auth.uid() = owner_id);

-- Политики для projects
DROP POLICY IF EXISTS "Users can view projects in their workspaces" ON public.projects;
CREATE POLICY "Users can view projects in their workspaces" ON public.projects FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.workspaces WHERE workspaces.id = projects.workspace_id AND workspaces.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert projects in their workspaces" ON public.projects;
CREATE POLICY "Users can insert projects in their workspaces" ON public.projects FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.workspaces WHERE workspaces.id = workspace_id AND workspaces.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update projects in their workspaces" ON public.projects;
CREATE POLICY "Users can update projects in their workspaces" ON public.projects FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.workspaces WHERE workspaces.id = projects.workspace_id AND workspaces.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete projects in their workspaces" ON public.projects;
CREATE POLICY "Users can delete projects in their workspaces" ON public.projects FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.workspaces WHERE workspaces.id = projects.workspace_id AND workspaces.owner_id = auth.uid()));

