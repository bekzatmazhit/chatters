-- Фича 6: Публичный бесплатный аудит

CREATE TABLE IF NOT EXISTS public.public_audits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_name text NOT NULL,
    fingerprint text,
    status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    result jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_public_audits_fingerprint ON public.public_audits(fingerprint);

-- Включаем RLS
ALTER TABLE public.public_audits ENABLE ROW LEVEL SECURITY;

-- Политики (простые для лидгена: разрешаем вставлять анонимно, если нужно)
CREATE POLICY "Allow anonymous insert on public_audits" ON public.public_audits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select on public_audits for creator" ON public.public_audits FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update on public_audits" ON public.public_audits FOR UPDATE TO anon, authenticated USING (true);
