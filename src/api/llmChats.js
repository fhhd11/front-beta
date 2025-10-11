import { supabase } from '../config/supabase.js'

/**
 * API для работы с LLM чатами в Supabase
 */
export const llmChatsApi = {
  /**
   * Получить все чаты пользователя
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getChats() {
    try {
      // Проверка аутентификации
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session when fetching chats')
        return { data: null, error: new Error('User not authenticated') }
      }

      const { data, error } = await supabase
        .from('llm_chats')
        .select('*')
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error fetching chats:', error)
      }
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching chats:', error)
      return { data: null, error }
    }
  },

  /**
   * Создать новый чат
   * @param {string} title - Название чата
   * @returns {Promise<{data: Object, error: any}>}
   */
  async createChat(title = 'Новый чат') {
    try {
      // Проверка аутентификации
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session when creating chat')
        return { data: null, error: new Error('User not authenticated') }
      }

      const { data, error } = await supabase
        .from('llm_chats')
        .insert([{ 
          title,
          user_id: session.user.id  // Явно указываем user_id
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error creating chat:', error)
      }
      
      return { data, error }
    } catch (error) {
      console.error('Error creating chat:', error)
      return { data: null, error }
    }
  },

  /**
   * Обновить название чата
   * @param {string} chatId - ID чата
   * @param {string} title - Новое название
   * @returns {Promise<{data: Object, error: any}>}
   */
  async updateChatTitle(chatId, title) {
    try {
      const { data, error } = await supabase
        .from('llm_chats')
        .update({ title })
        .eq('id', chatId)
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error updating chat title:', error)
      return { data: null, error }
    }
  },

  /**
   * Удалить чат (каскадно удаляет все сообщения)
   * @param {string} chatId - ID чата
   * @returns {Promise<{error: any}>}
   */
  async deleteChat(chatId) {
    try {
      const { error } = await supabase
        .from('llm_chats')
        .delete()
        .eq('id', chatId)
      
      return { error }
    } catch (error) {
      console.error('Error deleting chat:', error)
      return { error }
    }
  },

  /**
   * Обновить время последнего обновления чата
   * @param {string} chatId - ID чата
   * @returns {Promise<{error: any}>}
   */
  async updateChatTimestamp(chatId) {
    try {
      const { error } = await supabase
        .from('llm_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId)
      
      return { error }
    } catch (error) {
      console.error('Error updating chat timestamp:', error)
      return { error }
    }
  },

  /**
   * Получить все сообщения чата
   * @param {string} chatId - ID чата
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getMessages(chatId) {
    try {
      const { data, error } = await supabase
        .from('llm_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching messages:', error)
      return { data: null, error }
    }
  },

  /**
   * Добавить сообщение в чат
   * @param {string} chatId - ID чата
   * @param {string} role - Роль ('user' или 'assistant')
   * @param {string} content - Содержимое сообщения
   * @param {string|null} parentId - ID родительского сообщения (для ветвления)
   * @param {Object} imageData - Данные изображения (опционально)
   * @returns {Promise<{data: Object, error: any}>}
   */
  async addMessage(chatId, role, content, parentId = null, imageData = null) {
    try {
      const messageData = { 
        chat_id: chatId, 
        role, 
        content
      }

      // Добавляем parent_id только если он не null и не undefined
      if (parentId) {
        messageData.parent_id = parentId
      }

      // Добавляем данные изображения если они есть
      if (imageData) {
        if (imageData.imageUrl) messageData.image_url = imageData.imageUrl
        if (imageData.imagePath) messageData.image_path = imageData.imagePath
        if (imageData.isImage !== undefined) messageData.is_image = imageData.isImage
        if (imageData.imagePrompt) messageData.image_prompt = imageData.imagePrompt
      }

      
      const { data, error } = await supabase
        .from('llm_messages')
        .insert([messageData])
        .select()
        .single()
      
      // Обновляем timestamp чата при добавлении сообщения
      if (!error) {
        await this.updateChatTimestamp(chatId)
      }
      
      return { data, error }
    } catch (error) {
      console.error('Error adding message:', error)
      return { data: null, error }
    }
  },

  /**
   * Добавить сообщение с изображением
   * @param {string} chatId - ID чата
   * @param {string} prompt - Промпт для генерации изображения
   * @param {string} imageUrl - URL изображения
   * @param {string} imagePath - Путь к изображению в storage
   * @returns {Promise<{data: Object, error: any}>}
   */
  async addImageMessage(chatId, prompt, imageUrl, imagePath) {
    try {
      const imageData = {
        imageUrl,
        imagePath,
        isImage: true,
        imagePrompt: prompt
      }

      return await this.addMessage(
        chatId, 
        'assistant', 
        `Сгенерировано изображение по запросу: "${prompt}"`, 
        null, 
        imageData
      )
    } catch (error) {
      console.error('Error adding image message:', error)
      return { data: null, error }
    }
  },

  /**
   * Удалить сообщение (каскадно удалит потомков благодаря ON DELETE CASCADE)
   * @param {string} messageId - ID сообщения
   * @returns {Promise<{error: any}>}
   */
  async deleteMessage(messageId) {
    try {
      const { error } = await supabase
        .from('llm_messages')
        .delete()
        .eq('id', messageId)
      
      return { error }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { error }
    }
  },

  /**
   * Удалить все сообщения после указанного (для ветвления)
   * @param {string} chatId - ID чата
   * @param {string} afterMessageId - ID сообщения, после которого удаляются все
   * @returns {Promise<{error: any}>}
   */
  async deleteMessagesAfter(chatId, afterMessageId) {
    try {
      // Получаем timestamp сообщения
      const { data: message, error: fetchError } = await supabase
        .from('llm_messages')
        .select('created_at')
        .eq('id', afterMessageId)
        .single()
      
      if (fetchError) return { error: fetchError }
      
      // Удаляем все сообщения созданные после этого
      const { error } = await supabase
        .from('llm_messages')
        .delete()
        .eq('chat_id', chatId)
        .gt('created_at', message.created_at)
      
      return { error }
    } catch (error) {
      console.error('Error deleting messages after:', error)
      return { error }
    }
  },

  /**
   * Получить количество сообщений в чате
   * @param {string} chatId - ID чата
   * @returns {Promise<{count: number, error: any}>}
   */
  async getMessageCount(chatId) {
    try {
      const { count, error } = await supabase
        .from('llm_messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chatId)
      
      return { count, error }
    } catch (error) {
      console.error('Error getting message count:', error)
      return { count: 0, error }
    }
  }
}

