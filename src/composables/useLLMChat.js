import { ref, computed } from 'vue'
import { llmApi, parseSSEStream } from '../api/llm.js'
import { llmChatsApi } from '../api/llmChats.js'
import { imageGenerationApi } from '../api/imageGeneration.js'
import { supabase } from '../config/supabase.js'

// Global LLM chat state (separate from agent chat)
const llmMessages = ref([])
const isLLMLoading = ref(false)
const isLLMSending = ref(false)
const isLLMStreaming = ref(false)
const llmError = ref(null)
const currentStreamingMessage = ref(null)
const loadedChatId = ref(null) // ID загруженного чата

/**
 * Composable for managing LLM chat (non-agent chat)
 * Uses LiteLLM API with OpenAI-compatible interface
 */
export function useLLMChat() {
  const hasMessages = computed(() => llmMessages.value.length > 0)

  /**
   * Convert messages to OpenAI format
   */
  const convertToOpenAIFormat = (messages) => {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
  }

  /**
   * Load messages for a specific chat from database
   * @param {string} chatId - ID чата для загрузки
   */
  const loadChatMessages = async (chatId) => {
    if (!chatId) {
      llmMessages.value = []
      loadedChatId.value = null
      return
    }

    isLLMLoading.value = true
    llmError.value = null

    try {
      const { data, error } = await llmChatsApi.getMessages(chatId)
      
      if (error) {
        console.error('Error loading chat messages:', error)
        llmError.value = error.message || 'Ошибка загрузки сообщений'
        llmMessages.value = []
        return
      }

      // Преобразуем сообщения из БД в формат UI
      llmMessages.value = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        parent_id: msg.parent_id,
        isStreaming: false,
        // Добавляем поля изображения
        image_url: msg.image_url,
        image_path: msg.image_path,
        is_image: msg.is_image,
        image_prompt: msg.image_prompt
      }))
      
      loadedChatId.value = chatId
    } catch (err) {
      console.error('Exception loading chat messages:', err)
      llmError.value = 'Произошла ошибка при загрузке сообщений'
      llmMessages.value = []
    } finally {
      isLLMLoading.value = false
    }
  }

  /**
   * Generate chat title based on first message
   * @param {string} firstMessage - Первое сообщение пользователя
   * @returns {Promise<string>} - Сгенерированное название
   */
  const generateChatTitle = async (firstMessage) => {
    try {
      // Fallback: берем первые 3-4 слова из запроса пользователя
      const createFallbackTitle = (message) => {
        const words = message.trim().split(/\s+/).slice(0, 4)
        return words.join(' ').substring(0, 50)
      }
      
      // Пробуем сгенерировать через LLM
      const titlePrompt = [
        {
          role: 'user',
          content: `Запрос: "${firstMessage}"\n\nСоздай краткое название (2-4 слова) на русском для этого чата. Просто название, без пояснений:`
        }
      ]
      
      const response = await llmApi.chat(titlePrompt, { max_tokens: 30, temperature: 0.7 })
      
      if (!response.content || response.content.trim().length === 0) {
        return createFallbackTitle(firstMessage)
      }
      
      let generatedTitle = response.content.trim()
        .replace(/^["'«»\-]|["'«»]$/g, '')
        .replace(/[:;.!?,]$/g, '')
        .trim()
        .substring(0, 50)
      
      // Валидация: если не прошло или слишком короткое - используем fallback
      if (generatedTitle.length < 3 || generatedTitle === 'Новый чат') {
        return createFallbackTitle(firstMessage)
      }
      
      return generatedTitle
    } catch (error) {
      return firstMessage.trim().split(/\s+/).slice(0, 4).join(' ').substring(0, 50)
    }
  }

  /**
   * Send message to LLM and save to database
   * @param {string} messageText - Текст сообщения
   * @param {string} chatId - ID текущего чата
   * @param {Object} chatInfo - Информация о чате (для генерации названия)
   * @param {Function} saveTemporaryChatFn - Функция для сохранения временного чата
   * @param {Function} updateChatTitleFn - Функция для обновления названия чата
   */
  const sendLLMMessage = async (messageText, chatId, chatInfo = null, saveTemporaryChatFn = null, updateChatTitleFn = null) => {
    if (!chatId) {
      llmError.value = 'Не выбран чат'
      return
    }

    try {
      isLLMSending.value = true
      isLLMStreaming.value = true
      llmError.value = null

      // ВАЖНО: Запоминаем, был ли чат временным ДО любых изменений
      const wasTemporary = chatInfo?.isTemporary === true
      const initialTitle = chatInfo?.title || 'Новый чат'

      // Add user message to UI СРАЗУ (до сохранения чата)
      const tempUserId = `user-temp-${Date.now()}`
      const userMessage = {
        id: tempUserId,
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString(),
        isStreaming: false
      }
      llmMessages.value.push(userMessage)

      // Если чат временный, сохраняем его в БД перед отправкой сообщения
      let realChatId = chatId
      if (wasTemporary && saveTemporaryChatFn) {
        const savedChat = await saveTemporaryChatFn(chatId, initialTitle)
        if (savedChat) {
          realChatId = savedChat.id
        } else {
          throw new Error('Failed to save temporary chat')
        }
      }

      // Определяем, нужно ли генерировать название
      let shouldGenerateTitleLater = false
      
      if (initialTitle === 'Новый чат') {
        if (wasTemporary) {
          // Для временных чатов - это всегда первое сообщение
          shouldGenerateTitleLater = true
        } else {
          // Для не-временных чатов проверяем количество сообщений
          const { count } = await llmChatsApi.getMessageCount(realChatId)
          shouldGenerateTitleLater = (count || 0) === 0
        }
      }

      // Save user message to database (используем realChatId)
      const { data: userMsgData, error: userMsgError } = await llmChatsApi.addMessage(
        realChatId,
        'user',
        messageText
      )

      if (userMsgError) {
        throw new Error(userMsgError.message || 'Ошибка сохранения сообщения')
      }

      // Update message ID from temp to real
      if (userMsgData) {
        userMessage.id = userMsgData.id
        userMessage.timestamp = userMsgData.created_at
      }

      // Prepare messages for API (convert to OpenAI format)
      const apiMessages = convertToOpenAIFormat(llmMessages.value)

      // Get streaming response from LiteLLM
      const stream = await llmApi.streamChat(apiMessages)
      
      // Process stream
      let assistantMessage = null
      
      for await (const chunk of parseSSEStream(stream)) {
        // Создаем сообщение только при получении первого чанка
        if (!assistantMessage) {
          assistantMessage = {
            id: `assistant-temp-${Date.now()}`,
            role: 'assistant',
            content: chunk,
            isStreaming: true,
            timestamp: new Date().toISOString()
          }
          llmMessages.value.push(assistantMessage)
          currentStreamingMessage.value = assistantMessage
          
          // Сбрасываем флаги отправки сразу после первого чанка
          isLLMSending.value = false
          isLLMStreaming.value = false
        } else {
          // Добавляем к существующему сообщению
          assistantMessage.content += chunk
        }
      }

      // Mark streaming as complete and save to DB
      if (assistantMessage) {
        assistantMessage.isStreaming = false
        
        const fullContent = assistantMessage.content
        
        // Save assistant message to database in background (используем realChatId)
        llmChatsApi.addMessage(realChatId, 'assistant', fullContent).then(result => {
          if (result.data && assistantMessage) {
            // Обновляем ID assistant сообщения на реальный
            assistantMessage.id = result.data.id
            assistantMessage.isStreaming = false
          }
        }).catch(err => {
          console.error('[sendLLMMessage] Failed to save assistant message to DB:', err)
        })
      }

      // Генерируем название если это было первое сообщение
      if (shouldGenerateTitleLater) {
        generateChatTitle(messageText).then(async (newTitle) => {
          if (newTitle && newTitle.length >= 3) {
            // Используем функцию из composable для обновления (обновит и UI)
            if (updateChatTitleFn) {
              await updateChatTitleFn(realChatId, newTitle)
            } else {
              // Fallback если функция не передана
              await llmChatsApi.updateChatTitle(realChatId, newTitle)
            }
          }
        }).catch(() => {
          // Тихо игнорируем ошибку генерации названия
        })
      }

    } catch (error) {
      console.error('Error sending LLM message:', error)
      llmError.value = error.message || 'Failed to send message to LLM'
      
      // Remove incomplete streaming message (если был создан)
      if (currentStreamingMessage.value) {
        const index = llmMessages.value.findIndex(m => m.id === currentStreamingMessage.value.id)
        if (index !== -1) {
          llmMessages.value.splice(index, 1)
        }
      }
      
      // Reset states on error
      currentStreamingMessage.value = null
      isLLMSending.value = false
      isLLMStreaming.value = false
      
      throw error
    }
  }

  /**
   * Clear LLM chat history
   */
  const clearLLMMessages = () => {
    llmMessages.value = []
    currentStreamingMessage.value = null
    llmError.value = null
  }

  /**
   * Clear error
   */
  const clearLLMError = () => {
    llmError.value = null
  }

  /**
   * Delete specific message
   */
  const deleteLLMMessage = (messageId) => {
    const index = llmMessages.value.findIndex(m => m.id === messageId)
    if (index !== -1) {
      llmMessages.value.splice(index, 1)
    }
  }

  /**
   * Retry last message (if failed)
   * @param {string} chatId - ID текущего чата
   * @param {Object} chatInfo - Информация о чате
   * @param {Function} saveTemporaryChatFn - Функция для сохранения временного чата
   * @param {Function} updateChatTitleFn - Функция для обновления названия чата
   */
  const retryLastLLMMessage = async (chatId, chatInfo = null, saveTemporaryChatFn = null, updateChatTitleFn = null) => {
    if (llmMessages.value.length === 0 || !chatId) return

    // Find last user message
    const lastUserMessage = [...llmMessages.value].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) return

    // Remove any assistant messages after the last user message
    const lastUserIndex = llmMessages.value.findIndex(m => m.id === lastUserMessage.id)
    llmMessages.value = llmMessages.value.slice(0, lastUserIndex + 1)

    // Retry sending
    await sendLLMMessage(lastUserMessage.content, chatId, chatInfo, saveTemporaryChatFn, updateChatTitleFn)
  }

  /**
   * Edit last user message and create alternative branch
   * @param {string} newContent - Новый текст сообщения
   * @param {string} chatId - ID текущего чата
   * @param {Object} chatInfo - Информация о чате
   * @param {Function} saveTemporaryChatFn - Функция для сохранения временного чата
   * @param {Function} updateChatTitleFn - Функция для обновления названия чата
   */
  const editLastUserMessage = async (newContent, chatId, chatInfo = null, saveTemporaryChatFn = null, updateChatTitleFn = null) => {
    if (!chatId || !newContent.trim()) return

    try {
      // Find last user message
      const lastUserMessageIndex = llmMessages.value.findLastIndex(m => m.role === 'user')
      if (lastUserMessageIndex === -1) return

      const lastUserMessage = llmMessages.value[lastUserMessageIndex]


      // Если последнее пользовательское сообщение не временное, удаляем его и все после него из БД
      if (lastUserMessage.id && !lastUserMessage.id.startsWith('user-temp-')) {
        // Получаем все сообщения которые нужно удалить (последнее пользовательское и все после)
        const messagesToDelete = llmMessages.value.slice(lastUserMessageIndex)
        
        
        // Фильтруем сообщения для удаления (удаляем все кроме временных)
        const filteredMessages = messagesToDelete.filter(msg => 
          msg.id && 
          !msg.id.startsWith('assistant-temp-') && 
          !msg.id.startsWith('user-temp-')
        )
        
        // Удаляем все сообщения параллельно для скорости
        const deletePromises = filteredMessages.map(msg => llmChatsApi.deleteMessage(msg.id))
        await Promise.all(deletePromises)
      }

      // Remove messages from UI
      llmMessages.value = llmMessages.value.slice(0, lastUserMessageIndex)

      // Send new message with edited content
      await sendLLMMessage(newContent, chatId, chatInfo, saveTemporaryChatFn, updateChatTitleFn)
    } catch (error) {
      console.error('Error editing last message:', error)
      llmError.value = error.message || 'Ошибка редактирования сообщения'
    }
  }

  /**
   * Get conversation context (for debugging or export)
   */
  const getLLMContext = () => {
    return {
      messages: llmMessages.value,
      messageCount: llmMessages.value.length,
      hasError: !!llmError.value,
      isStreaming: isLLMStreaming.value,
      loadedChatId: loadedChatId.value
    }
  }

  /**
   * Генерация изображения
   * @param {string} prompt - Промпт для генерации изображения
   * @param {string} chatId - ID чата
   * @param {Object} chatInfo - Информация о чате
   * @param {Function} saveTemporaryChatFn - Функция сохранения временного чата
   * @param {Function} updateChatTitleFn - Функция обновления названия чата
   */
  const generateImage = async (prompt, chatId, chatInfo = null, saveTemporaryChatFn = null, updateChatTitleFn = null) => {
    if (!prompt.trim() || !chatId) return

    try {
      // Проверяем аутентификацию
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('User not authenticated')
      }

      // Устанавливаем состояние загрузки
      isLLMSending.value = true
      llmError.value = null

      // Если чат временный, сохраняем его
      let realChatId = chatId
      if (chatId.startsWith('temp-') && saveTemporaryChatFn) {
        const savedChat = await saveTemporaryChatFn(chatId)
        realChatId = savedChat?.id || chatId
      }

      // Добавляем пользовательское сообщение в UI (оптимистичное обновление)
      const userMessage = {
        id: `user-temp-${Date.now()}`,
        role: 'user',
        content: `Сгенерировать изображение: ${prompt}`,
        timestamp: new Date().toISOString(),
        isImage: true,
        imagePrompt: prompt
      }
      llmMessages.value.push(userMessage)

      // Сохраняем пользовательское сообщение в БД
      const { data: savedUserMessage, error: userError } = await llmChatsApi.addMessage(
        realChatId, 
        'user', 
        userMessage.content,
        null,
        {
          imagePrompt: prompt,
          isImage: false // Пользовательское сообщение - это текст, не изображение
        }
      )

      if (userError) throw userError

      // Обновляем ID сообщения в UI
      userMessage.id = savedUserMessage.id

      // Добавляем индикатор генерации изображения
      const generatingMessage = {
        id: `assistant-temp-${Date.now()}`,
        role: 'assistant',
        content: 'Генерирую изображение...',
        timestamp: new Date().toISOString(),
        isImage: true,
        imagePrompt: prompt,
        isGenerating: true
      }
      llmMessages.value.push(generatingMessage)

      // Генерируем изображение и загружаем в storage
      const imageResult = await imageGenerationApi.generateAndUploadImage(
        prompt, 
        session.user.id, 
        realChatId
      )

      // Удаляем индикатор генерации
      llmMessages.value = llmMessages.value.filter(m => m.id !== generatingMessage.id)

      // Создаем сообщение с изображением
      const imageMessage = {
        id: `assistant-temp-${Date.now()}`,
        role: 'assistant',
        content: `Сгенерировано изображение по запросу: "${prompt}"`,
        timestamp: new Date().toISOString(),
        isImage: true,
        imagePrompt: prompt,
        imageUrl: imageResult.url,
        imagePath: imageResult.path,
        fileName: imageResult.fileName
      }

      // Добавляем сообщение в UI
      llmMessages.value.push(imageMessage)

      // Сохраняем сообщение с изображением в БД
      
      const { data: savedImageMessage, error: imageError } = await llmChatsApi.addImageMessage(
        realChatId,
        prompt,
        imageResult.url,
        imageResult.path
      )

      if (imageError) {
        console.error('Error saving image message:', imageError)
        throw imageError
      }


      // Обновляем ID сообщения в UI
      imageMessage.id = savedImageMessage.id
      imageMessage.image_url = savedImageMessage.image_url
      imageMessage.image_path = savedImageMessage.image_path
      imageMessage.is_image = savedImageMessage.is_image

      // Генерируем название чата если это было первое сообщение
      if (chatInfo && chatInfo.isTemporary && updateChatTitleFn) {
        const title = await generateChatTitle(prompt)
        await updateChatTitleFn(realChatId, title)
      }

    } catch (error) {
      console.error('Error generating image:', error)
      llmError.value = error.message || 'Ошибка генерации изображения'
      
      // Удаляем временные сообщения при ошибке
      llmMessages.value = llmMessages.value.filter(m => 
        !m.id.startsWith('user-temp-') && 
        !m.id.startsWith('assistant-temp-')
      )
    } finally {
      isLLMSending.value = false
    }
  }

  return {
    // State
    llmMessages: computed(() => llmMessages.value),
    isLLMLoading: computed(() => isLLMLoading.value),
    isLLMSending: computed(() => isLLMSending.value),
    isLLMStreaming: computed(() => isLLMStreaming.value),
    llmError: computed(() => llmError.value),
    hasLLMMessages: hasMessages,
    loadedChatId: computed(() => loadedChatId.value),

    // Methods
    loadChatMessages,
    sendLLMMessage,
    clearLLMMessages,
    clearLLMError,
    deleteLLMMessage,
    retryLastLLMMessage,
    editLastUserMessage,
    getLLMContext,
    generateChatTitle,
    generateImage
  }
}

// Export reactive state for global access if needed
export { llmMessages, isLLMLoading, isLLMSending, isLLMStreaming, llmError }

