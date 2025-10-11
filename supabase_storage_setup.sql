-- Настройка Supabase Storage для генерации изображений в LLM чате
-- Выполнить этот скрипт в Supabase SQL Editor

-- 1. Создание bucket для изображений
INSERT INTO storage.buckets (id, name, public)
VALUES ('llm-generated-images', 'llm-generated-images', true);

-- 2. Настройка RLS политик для storage bucket
-- Политика для загрузки файлов (только авторизованные пользователи могут загружать свои файлы)
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'llm-generated-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика для чтения файлов (все пользователи могут читать изображения)
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'llm-generated-images');

-- Политика для удаления файлов (только владелец может удалять свои файлы)
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'llm-generated-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Расширение таблицы llm_messages для поддержки изображений
ALTER TABLE llm_messages 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_path TEXT,
ADD COLUMN IF NOT EXISTS is_image BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS image_prompt TEXT;

-- 4. Создание индекса для быстрого поиска сообщений с изображениями
CREATE INDEX IF NOT EXISTS idx_llm_messages_is_image ON llm_messages(is_image);

-- 5. Обновление существующих RLS политик для llm_messages (если нужно)
-- Политика уже должна существовать, но убедимся что она корректная
DROP POLICY IF EXISTS "Users can view their own messages" ON llm_messages;
CREATE POLICY "Users can view their own messages" ON llm_messages
FOR SELECT USING (
  chat_id IN (
    SELECT id FROM llm_chats WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own messages" ON llm_messages;
CREATE POLICY "Users can insert their own messages" ON llm_messages
FOR INSERT WITH CHECK (
  chat_id IN (
    SELECT id FROM llm_chats WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own messages" ON llm_messages;
CREATE POLICY "Users can update their own messages" ON llm_messages
FOR UPDATE USING (
  chat_id IN (
    SELECT id FROM llm_chats WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own messages" ON llm_messages;
CREATE POLICY "Users can delete their own messages" ON llm_messages
FOR DELETE USING (
  chat_id IN (
    SELECT id FROM llm_chats WHERE user_id = auth.uid()
  )
);
