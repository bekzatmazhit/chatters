-- Добавляем политики UPDATE и DELETE для таблицы tracked_prompts
-- Запустите этот скрипт в SQL Editor внутри вашего Supabase Dashboard.

-- Политика для обновления промптов (чтобы можно было менять is_active, frequency и т.д.)
CREATE POLICY "Allow update on tracked_prompts" 
ON public.tracked_prompts 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Политика для удаления промптов
CREATE POLICY "Allow delete on tracked_prompts" 
ON public.tracked_prompts 
FOR DELETE 
USING (true);
