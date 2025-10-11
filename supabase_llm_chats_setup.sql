-- SQL скрипт для создания системы чатов LLM в Supabase
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- Создание таблицы для чатов
CREATE TABLE IF NOT EXISTS llm_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Новый чат',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_llm_chats_user_id ON llm_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_chats_updated_at ON llm_chats(updated_at DESC);

-- Создание таблицы для сообщений
CREATE TABLE IF NOT EXISTS llm_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES llm_chats(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES llm_messages(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  branch_index INTEGER DEFAULT 0
);

-- Создание индексов для сообщений
CREATE INDEX IF NOT EXISTS idx_llm_messages_chat_id ON llm_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_llm_messages_parent_id ON llm_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_llm_messages_created_at ON llm_messages(created_at ASC);

-- Включение Row Level Security (RLS)
ALTER TABLE llm_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_messages ENABLE ROW LEVEL SECURITY;

-- Удаление существующих политик (если есть)
DROP POLICY IF EXISTS "Users can view their own chats" ON llm_chats;
DROP POLICY IF EXISTS "Users can insert their own chats" ON llm_chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON llm_chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON llm_chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON llm_messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON llm_messages;
DROP POLICY IF EXISTS "Users can delete messages in their chats" ON llm_messages;

-- Политики безопасности для llm_chats
CREATE POLICY "Users can view their own chats" ON llm_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" ON llm_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" ON llm_chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" ON llm_chats
  FOR DELETE USING (auth.uid() = user_id);

-- Политики безопасности для llm_messages
CREATE POLICY "Users can view messages in their chats" ON llm_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM llm_chats 
      WHERE llm_chats.id = llm_messages.chat_id 
      AND llm_chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their chats" ON llm_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM llm_chats 
      WHERE llm_chats.id = llm_messages.chat_id 
      AND llm_chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their chats" ON llm_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM llm_chats 
      WHERE llm_chats.id = llm_messages.chat_id 
      AND llm_chats.user_id = auth.uid()
    )
  );

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_llm_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at при изменении
DROP TRIGGER IF EXISTS update_llm_chats_timestamp ON llm_chats;
CREATE TRIGGER update_llm_chats_timestamp
  BEFORE UPDATE ON llm_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_llm_chat_timestamp();

-- Готово! Таблицы и политики безопасности созданы.

