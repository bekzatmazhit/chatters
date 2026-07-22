-- Добавляем политики для таблицы personas
-- Запустите этот скрипт в SQL Editor внутри вашего Supabase Dashboard.

-- Разрешаем чтение
CREATE POLICY "Allow select on personas" 
ON public.personas 
FOR SELECT 
USING (true);

-- Разрешаем вставку
CREATE POLICY "Allow insert on personas" 
ON public.personas 
FOR INSERT 
WITH CHECK (true);

-- Разрешаем обновление
CREATE POLICY "Allow update on personas" 
ON public.personas 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Разрешаем удаление
CREATE POLICY "Allow delete on personas" 
ON public.personas 
FOR DELETE 
USING (true);

-- Включаем RLS
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
