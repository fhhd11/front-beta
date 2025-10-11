import { ref, computed } from 'vue'
import { llmChatsApi } from '../api/llmChats.js'

// Глобальное состояние списка чатов
const chats = ref([])
const currentChatId = ref(null)
const isLoadingChats = ref(false)
const chatsError = ref(null)

/**
 * Composable для управления списком LLM чатов
 */
export function useLLMChats() {
  // Текущий выбранный чат
  const currentChat = computed(() => 
    chats.value.find(c => c.id === currentChatId.value)
  )

  /**
   * Загрузить список чатов пользователя
   */
  const loadChats = async () => {
    isLoadingChats.value = true
    chatsError.value = null
    
    try {
      const { data, error } = await llmChatsApi.getChats()
      
      if (error) {
        console.error('Error loading chats:', error)
        chatsError.value = error.message || 'Ошибка загрузки чатов'
        return
      }

      chats.value = data || []
      
      // Восстановить последний выбранный чат из localStorage
      const savedChatId = localStorage.getItem('currentLLMChatId')
      
      // Игнорируем временные чаты (начинаются с temp-)
      if (savedChatId && !savedChatId.startsWith('temp-') && chats.value.some(c => c.id === savedChatId)) {
        // Если сохраненный чат существует, выбрать его
        currentChatId.value = savedChatId
      } else if (chats.value.length > 0) {
        // Иначе выбрать первый чат
        currentChatId.value = chats.value[0].id
        localStorage.setItem('currentLLMChatId', chats.value[0].id)
      } else {
        // Если чатов нет, создать временный чат
        createTemporaryChat()
      }
    } catch (err) {
      console.error('Exception loading chats:', err)
      chatsError.value = 'Произошла ошибка при загрузке чатов'
    } finally {
      isLoadingChats.value = false
    }
  }

  /**
   * Создать временный чат (без сохранения в БД)
   * @param {string} title - Название чата
   * @returns {Object} Временный чат
   */
  const createTemporaryChat = (title = 'Новый чат') => {
    const tempChat = {
      id: `temp-${Date.now()}`,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isTemporary: true // Флаг временного чата
    }
    
    // Добавить в начало списка
    chats.value.unshift(tempChat)
    // Выбрать временный чат
    currentChatId.value = tempChat.id
    localStorage.setItem('currentLLMChatId', tempChat.id)
    
    return tempChat
  }

  /**
   * Сохранить временный чат в БД и заменить его реальным
   * @param {string} tempChatId - ID временного чата
   * @param {string} title - Название чата
   * @returns {Promise<Object|null>} Созданный чат или null
   */
  const saveTemporaryChat = async (tempChatId, title = 'Новый чат') => {
    chatsError.value = null
    
    try {
      const { data, error } = await llmChatsApi.createChat(title)
      
      if (error) {
        console.error('Error saving temporary chat:', error)
        chatsError.value = error.message || 'Ошибка сохранения чата'
        return null
      }

      if (data) {
        // Заменить временный чат на реальный
        const tempIndex = chats.value.findIndex(c => c.id === tempChatId)
        if (tempIndex !== -1) {
          chats.value[tempIndex] = data
        } else {
          chats.value.unshift(data)
        }
        
        // Обновить currentChatId
        currentChatId.value = data.id
        localStorage.setItem('currentLLMChatId', data.id)
        
        return data
      }
    } catch (err) {
      console.error('Exception saving temporary chat:', err)
      chatsError.value = 'Произошла ошибка при сохранении чата'
      return null
    }
  }

  /**
   * Переключиться на другой чат
   * @param {string} chatId - ID чата для переключения
   */
  const switchChat = (chatId) => {
    if (currentChatId.value === chatId) return
    
    currentChatId.value = chatId
    localStorage.setItem('currentLLMChatId', chatId)
  }

  /**
   * Удалить чат
   * @param {string} chatId - ID чата для удаления
   * @returns {Promise<boolean>} true если успешно удален
   */
  const deleteChat = async (chatId) => {
    chatsError.value = null
    
    try {
      const { error } = await llmChatsApi.deleteChat(chatId)
      
      if (error) {
        console.error('Error deleting chat:', error)
        chatsError.value = error.message || 'Ошибка удаления чата'
        return false
      }

      // Удалить из списка
      chats.value = chats.value.filter(c => c.id !== chatId)
      
      // Если удален текущий чат, переключиться на другой
      if (currentChatId.value === chatId) {
        if (chats.value.length > 0) {
          currentChatId.value = chats.value[0].id
          localStorage.setItem('currentLLMChatId', chats.value[0].id)
        } else {
          // Если чатов не осталось, создать временный чат
          createTemporaryChat()
        }
      }
      
      return true
    } catch (err) {
      console.error('Exception deleting chat:', err)
      chatsError.value = 'Произошла ошибка при удалении чата'
      return false
    }
  }

  /**
   * Обновить название чата
   * @param {string} chatId - ID чата
   * @param {string} title - Новое название
   * @returns {Promise<boolean>} true если успешно обновлено
   */
  const updateChatTitle = async (chatId, title) => {
    chatsError.value = null
    
    try {
      // Optimistic update - обновляем сразу в UI
      const chat = chats.value.find(c => c.id === chatId)
      if (chat) {
        chat.title = title
      }

      const { data, error } = await llmChatsApi.updateChatTitle(chatId, title)
      
      if (error) {
        console.error('Error updating chat title:', error)
        chatsError.value = error.message || 'Ошибка обновления названия'
        
        // Rollback on error
        if (chat) {
          // Восстанавливаем старое название (если есть в data)
          const originalChat = chats.value.find(c => c.id === chatId)
          if (originalChat && data) {
            originalChat.title = data.title
          }
        }
        return false
      }
      
      return true
    } catch (err) {
      console.error('Exception updating chat title:', err)
      chatsError.value = 'Произошла ошибка при обновлении названия'
      return false
    }
  }

  /**
   * Обновить timestamp чата (для сортировки)
   * @param {string} chatId - ID чата
   */
  const touchChat = async (chatId) => {
    try {
      await llmChatsApi.updateChatTimestamp(chatId)
      
      // Обновить в локальном списке
      const chat = chats.value.find(c => c.id === chatId)
      if (chat) {
        chat.updated_at = new Date().toISOString()
        // Пересортировать список
        chats.value.sort((a, b) => 
          new Date(b.updated_at) - new Date(a.updated_at)
        )
      }
    } catch (err) {
      console.error('Error touching chat:', err)
    }
  }

  /**
   * Очистить ошибки
   */
  const clearError = () => {
    chatsError.value = null
  }

  return {
    // State
    chats: computed(() => chats.value),
    currentChatId: computed(() => currentChatId.value),
    currentChat,
    isLoadingChats: computed(() => isLoadingChats.value),
    chatsError: computed(() => chatsError.value),
    
    // Methods
    loadChats,
    createTemporaryChat,
    saveTemporaryChat,
    switchChat,
    deleteChat,
    updateChatTitle,
    touchChat,
    clearError
  }
}

// Экспорт reactive state для глобального доступа если нужно
export { chats, currentChatId, isLoadingChats, chatsError }

