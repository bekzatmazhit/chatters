-- Таблица workspaces
CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS для workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Политики для workspaces
CREATE POLICY "Users can view their own workspaces"
    ON public.workspaces FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own workspaces"
    ON public.workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own workspaces"
    ON public.workspaces FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own workspaces"
    ON public.workspaces FOR DELETE
    USING (auth.uid() = owner_id);


-- Таблица projects
CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    domain text,
    logo_url text,
    color text DEFAULT '#10b981',
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    tracked_ai_models text[] DEFAULT '{}'::text[],
    competitors text[] DEFAULT '{}'::text[],
    tracked_prompts text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS для projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Политики для projects (через проверку владения workspace)
CREATE POLICY "Users can view projects in their workspaces"
    ON public.projects FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.workspaces
        WHERE workspaces.id = projects.workspace_id
        AND workspaces.owner_id = auth.uid()
      )
    );

CREATE POLICY "Users can insert projects in their workspaces"
    ON public.projects FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.workspaces
        WHERE workspaces.id = workspace_id
        AND workspaces.owner_id = auth.uid()
      )
    );

CREATE POLICY "Users can update projects in their workspaces"
    ON public.projects FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.workspaces
        WHERE workspaces.id = projects.workspace_id
        AND workspaces.owner_id = auth.uid()
      )
    );

CREATE POLICY "Users can delete projects in their workspaces"
    ON public.projects FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.workspaces
        WHERE workspaces.id = projects.workspace_id
        AND workspaces.owner_id = auth.uid()
      )
    );
