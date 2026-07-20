-- Фича 3: Спроси свои данные (Чат с аналитикой)

CREATE TABLE IF NOT EXISTS public.chat_threads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Индексы для быстрого поиска по thread_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);

-- Включаем RLS
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Политики (простые)
CREATE POLICY "Allow access on chat_threads" ON public.chat_threads FOR ALL USING (true);
CREATE POLICY "Allow access on chat_messages" ON public.chat_messages FOR ALL USING (true);
