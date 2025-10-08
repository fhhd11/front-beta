import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { chatApi, messageUtils } from '../api/chat.js'
import { SSEClient, createAuthenticatedSSEClient, parseSSEData } from '../utils/sseClient.js'
import { apiClient } from '../api/client.js'
import { cleanStreamingText } from '../utils/markdownUtils.js'

export function useChat() {
  const { lettaAgentId, isAuthenticated, session } = useAuth()

  // State
  const messages = ref([])
  const isLoading = ref(false)
  const isSending = ref(false)
  const error = ref(null)
  const hasMoreMessages = ref(true)
  const lastMessageId = ref(null)
  
  // Streaming state
  const isStreaming = ref(false)
  const streamingMessage = ref(null)
  const sseClient = ref(null)

  // Computed
  const agentMessages = computed(() => 
    messages.value.filter(msg => msg.role === 'agent')
  )
  
  const userMessages = computed(() => 
    messages.value.filter(msg => msg.role === 'user')
  )

  const hasMessages = computed(() => messages.value.length > 0)

  // Load message history
  const loadMessages = async (options = {}) => {
    if (!lettaAgentId.value) {
      console.warn('No agent ID available for loading messages')
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const { data, error: apiError } = await chatApi.getMessages(lettaAgentId.value, {
        limit: 50,
        order: 'desc',
        ...options
      })

      if (apiError) {
        throw new Error(apiError)
      }

      // Convert Letta messages to internal format and filter out null values (system messages)
      const convertedMessages = data
        .map(messageUtils.convertToInternalFormat)
        .filter(msg => msg !== null)
      
      console.log('Converted messages:', convertedMessages)
      
      // Sort by timestamp (oldest first for display)
      const sortedMessages = messageUtils.sortByTimestamp(convertedMessages, 'asc')
      
      console.log('Sorted messages:', sortedMessages)
      
      // Process messages to group reasoning + assistant and filter empty content
      const processedMessages = messageUtils.processMessages(sortedMessages)
      
      console.log('Processed messages:', processedMessages)
      
      messages.value = processedMessages
      
      // Update pagination info
      if (data.length > 0) {
        lastMessageId.value = data[data.length - 1].id
        hasMoreMessages.value = data.length === (options.limit || 50)
      } else {
        hasMoreMessages.value = false
      }

      console.log('Messages loaded:', messages.value.length)
      
    } catch (err) {
      console.error('Error loading messages:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!hasMoreMessages.value || isLoading.value) return

    try {
      isLoading.value = true

      const { data, error: apiError } = await chatApi.getMessages(lettaAgentId.value, {
        before: lastMessageId.value,
        limit: 50,
        order: 'desc'
      })

      if (apiError) {
        throw new Error(apiError)
      }

      if (data.length > 0) {
        const convertedMessages = data
          .map(messageUtils.convertToInternalFormat)
          .filter(msg => msg !== null)
        const sortedMessages = messageUtils.sortByTimestamp(convertedMessages, 'asc')
        const processedMessages = messageUtils.processMessages(sortedMessages)
        
        // Prepend older messages
        messages.value = [...processedMessages, ...messages.value]
        lastMessageId.value = data[data.length - 1].id
        hasMoreMessages.value = data.length === 50
      } else {
        hasMoreMessages.value = false
      }

    } catch (err) {
      console.error('Error loading more messages:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Send a message with streaming
  const sendMessageStream = async (content, options = {}) => {
    if (!lettaAgentId.value) {
      throw new Error('No agent ID available')
    }

    if (!content || !content.trim()) {
      throw new Error('Message content is required')
    }

    try {
      isSending.value = true
      isStreaming.value = true
      error.value = null

      // Add user message to local state immediately
      const userMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        messageType: 'user_message',
        isTemporary: true
      }
      
      messages.value.push(userMessage)

      // Prepare streaming message placeholder and add to messages immediately
      const tempStreamingMessage = {
        id: `streaming-${Date.now()}`,
        role: 'agent',
        content: '',
        reasoning: null,
        toolCalls: [],
        timestamp: new Date(),
        messageType: 'streaming',
        isStreaming: true
      }
      
      streamingMessage.value = tempStreamingMessage
      // Add to messages array immediately so user sees "typing" indicator without delay
      messages.value.push(tempStreamingMessage)

      // Get streaming endpoint and payload
      const { endpoint, payload, error: prepError } = await chatApi.sendMessageStream(
        lettaAgentId.value,
        content.trim(),
        options
      )

      if (prepError) {
        throw new Error(prepError)
      }

      // Get auth token for SSE connection
      const token = session.value?.access_token
      console.log('Session:', session.value)
      console.log('Token available:', !!token)
      if (!token) {
        throw new Error('No authentication token available')
      }

      // Create SSE client
      const baseURL = apiClient.baseURL
      sseClient.value = createAuthenticatedSSEClient(baseURL, token)

      // Connect to SSE endpoint with payload
      await sseClient.value.connect(endpoint, {}, payload)

      // Set up event listeners
      sseClient.value.on('message', (data, event) => {
        console.log('SSE message received:', data)
        console.log('SSE event type:', event?.type)
        const parsedData = parseSSEData(data)
        console.log('Parsed data type:', typeof parsedData)
        console.log('Parsed data keys:', Object.keys(parsedData))
        
        if (parsedData === '[DONE]' || (typeof parsedData === 'object' && parsedData.content === '[DONE]')) {
          console.log('SSE stream completed with [DONE]')
          handleStreamingComplete(data)
        } else {
          handleStreamingMessage(data)
        }
      })

      sseClient.value.on('error', (data, event) => {
        console.error('SSE error:', data)
        handleStreamingError(data)
      })

      sseClient.value.on('done', (data, event) => {
        console.log('SSE stream completed:', data)
        handleStreamingComplete(data)
      })

    } catch (err) {
      console.error('Error sending streaming message:', err)
      error.value = err.message
      
      // Clean up on error
      cleanupStreaming()
      
      // Remove temporary messages on error
      const tempIndex = messages.value.findIndex(msg => msg.isTemporary || msg.isStreaming)
      if (tempIndex !== -1) {
        messages.value.splice(tempIndex, 1)
      }
      
      throw err
    } finally {
      isSending.value = false
    }
  }

  // Handle streaming message data
  const handleStreamingMessage = (data) => {
    if (!streamingMessage.value) return

    const parsedData = parseSSEData(data)
    console.log('Parsed streaming data:', parsedData)

    // Handle usage statistics - extract assistant message if not received yet
    if (parsedData.message_type === 'usage_statistics') {
      console.log('Usage statistics received')
      console.log('Current content:', streamingMessage.value.content)
      
      // Check if we have an assistant message in steps_messages
      if (parsedData.steps_messages && Array.isArray(parsedData.steps_messages)) {
        // Iterate through all step messages
        for (const stepMessages of parsedData.steps_messages) {
          if (Array.isArray(stepMessages)) {
            for (const msg of stepMessages) {
              console.log('Step message:', msg.message_type, 'content:', msg.content)
              
              // Process assistant_message if we haven't received it yet
              if (msg.message_type === 'assistant_message' && !streamingMessage.value.content) {
                console.log('Found assistant message in steps_messages:', msg.content)
                streamingMessage.value = {
                  ...streamingMessage.value,
                  content: msg.content || '',
                  id: msg.id || streamingMessage.value.id
                }
                
                // Force UI update
                const streamingIndex = messages.value.findIndex(m => m.isStreaming)
                if (streamingIndex !== -1) {
                  messages.value.splice(streamingIndex, 1, { ...streamingMessage.value })
                }
              }
            }
          }
        }
      }
    }

    // Handle different message types
    if (parsedData.message_type === 'reasoning_message') {
      // Update reasoning (check both 'reasoning' and 'content' fields)
      const reasoningChunk = parsedData.reasoning || parsedData.content || ''
      console.log('Processing reasoning message:', {
        reasoning: parsedData.reasoning,
        content: parsedData.content,
        reasoningText: reasoningChunk,
        chunkLength: reasoningChunk.length
      })
      if (reasoningChunk) {
        // Get existing reasoning text or empty string
        const currentReasoning = streamingMessage.value.reasoning?.reasoning || ''
        console.log('Current reasoning length:', currentReasoning.length, 'Adding chunk:', reasoningChunk)
        
        // Check if this is the first chunk and it starts with punctuation (incomplete)
        const isFirstChunk = currentReasoning.length === 0
        const startsWithPunctuation = /^[,.\-!?]/.test(reasoningChunk.trim())
        
        if (isFirstChunk && startsWithPunctuation) {
          console.warn('⚠️ First reasoning chunk starts with punctuation, likely incomplete. Skipping:', reasoningChunk)
          return // Skip this chunk, wait for the real first chunk
        }
        
        // Create new object to trigger reactivity - APPEND chunk to existing text
        streamingMessage.value = {
          ...streamingMessage.value,
          reasoning: {
            id: `${parsedData.id}-reasoning`,
            reasoning: currentReasoning + reasoningChunk,  // ✅ Append instead of replace
            timestamp: new Date(parsedData.date || Date.now())
          }
        }
        console.log('Updated streaming reasoning, total length:', streamingMessage.value.reasoning.reasoning.length, 'Full text:', streamingMessage.value.reasoning.reasoning)
      }
    } else if (parsedData.message_type === 'assistant_message') {
      // Handle assistant message content (could be full content or token chunks)
      if (parsedData.content) {
        console.log('Processing assistant message, content length:', parsedData.content.length, 'content:', parsedData.content)
        
        // Check if this is the first content chunk and it starts with space (incomplete)
        const currentContent = streamingMessage.value.content || ''
        const isFirstContentChunk = currentContent.length === 0
        const startsWithSpace = /^\s/.test(parsedData.content)
        
        if (isFirstContentChunk && startsWithSpace) {
          console.warn('⚠️ First content chunk starts with space, likely incomplete. Skipping:', parsedData.content)
          return // Skip this chunk, wait for the real first chunk
        }
        
        // Check if this is a complete message (likely the final chunk)
        const isCompleteMessage = parsedData.content.length > 50 && 
          parsedData.content.includes('?') && 
          parsedData.content.includes('!') &&
          currentContent.length > 0
        
        if (isCompleteMessage) {
          console.warn('⚠️ Detected complete message chunk, replacing content instead of appending')
          // Replace content instead of appending - clean the content
          const cleanedContent = cleanStreamingText(parsedData.content)
          streamingMessage.value = {
            ...streamingMessage.value,
            content: cleanedContent, // Replace with cleaned content
            id: parsedData.id || streamingMessage.value.id
          }
        } else {
          // Normal token-by-token streaming - clean the content before appending
          const cleanedContent = cleanStreamingText(parsedData.content)
          streamingMessage.value = {
            ...streamingMessage.value,
            content: streamingMessage.value.content + cleanedContent,
            id: parsedData.id || streamingMessage.value.id
          }
        }
        console.log('Updated streaming content, total length:', streamingMessage.value.content.length)
      }
    } else if (parsedData.message_type === 'tool_call_message') {
      // Handle tool call messages
      console.log('Processing tool call message:', parsedData)
      if (parsedData.tool_call) {
        const toolCallMessage = messageUtils.convertToInternalFormat(parsedData)
        if (toolCallMessage) {
          // Add tool call to streaming message
          if (!streamingMessage.value.toolCalls) {
            streamingMessage.value.toolCalls = []
          }
          streamingMessage.value.toolCalls.push(toolCallMessage)
        }
      }
    } else if (parsedData.message_type === 'tool_return_message') {
      // Handle tool return messages
      console.log('Processing tool return message:', parsedData)
      if (parsedData.tool_return && streamingMessage.value.toolCalls) {
        // Find matching tool call and add return value
        const toolReturnMessage = messageUtils.convertToInternalFormat(parsedData)
        if (toolReturnMessage) {
          const matchingToolCall = streamingMessage.value.toolCalls.find(tc => 
            tc.toolCallId === toolReturnMessage.toolCallId
          )
          if (matchingToolCall) {
            matchingToolCall.toolReturn = toolReturnMessage
          }
        }
      }
    } else if (parsedData.message_type === 'user_message') {
      // Replace temporary user message with real one
      const tempUserIndex = messages.value.findIndex(msg => msg.isTemporary && msg.role === 'user')
      if (tempUserIndex !== -1) {
        const realUserMessage = messageUtils.convertToInternalFormat(parsedData)
        if (realUserMessage) {
          messages.value[tempUserIndex] = realUserMessage
        }
      }
    } else if (parsedData.content && !parsedData.message_type) {
      // Handle raw token chunks when stream_tokens is true
      // These might come as plain content without message_type
      const cleanedContent = cleanStreamingText(parsedData.content)
      streamingMessage.value = {
        ...streamingMessage.value,
        content: streamingMessage.value.content + cleanedContent
      }
    } else if (parsedData.delta && parsedData.delta.content) {
      // Handle delta format for token streaming
      const cleanedContent = cleanStreamingText(parsedData.delta.content)
      streamingMessage.value = {
        ...streamingMessage.value,
        content: streamingMessage.value.content + cleanedContent
      }
    } else if (typeof parsedData === 'string' && parsedData !== '[DONE]') {
      // Handle plain text tokens
      const cleanedContent = cleanStreamingText(parsedData)
      streamingMessage.value = {
        ...streamingMessage.value,
        content: streamingMessage.value.content + cleanedContent
      }
    }
    
    // Force reactivity update for real-time display
    if (streamingMessage.value) {
      const streamingIndex = messages.value.findIndex(msg => msg.isStreaming)
      console.log('Force UI update - streaming index:', streamingIndex)
      if (streamingIndex !== -1) {
        // Use splice to trigger reactivity in Vue 3 - create completely new object
        const updatedMessage = {
          ...streamingMessage.value,
          // Add timestamp to force reactivity
          _updateTime: Date.now()
        }
        messages.value.splice(streamingIndex, 1, updatedMessage)
        console.log('UI updated with message:', {
          content: updatedMessage.content,
          reasoning: updatedMessage.reasoning?.reasoning,
          isStreaming: updatedMessage.isStreaming,
          updateTime: updatedMessage._updateTime
        })
      } else {
        // First data arrived - add streaming message to array
        console.log('Adding streaming message to array (first data)')
        const newMessage = {
          ...streamingMessage.value,
          _updateTime: Date.now()
        }
        messages.value.push(newMessage)
      }
    }
  }

  // Handle streaming error
  const handleStreamingError = (data) => {
    console.error('Streaming error:', data)
    error.value = 'Streaming error occurred'
    cleanupStreaming()
  }

  // Handle streaming completion
  const handleStreamingComplete = (data) => {
    console.log('Streaming completed:', data)
    
    // Convert streaming message to final format
    if (streamingMessage.value) {
      console.log('Streaming message before finalization:', {
        id: streamingMessage.value.id,
        content: streamingMessage.value.content,
        reasoning: streamingMessage.value.reasoning,
        isStreaming: streamingMessage.value.isStreaming
      })
      
      const finalMessage = {
        ...streamingMessage.value,
        isStreaming: false,
        messageType: 'assistant', // Change from 'streaming' to 'assistant'
        id: streamingMessage.value.id || `final-${Date.now()}` // Keep original ID if available
      }
      
      console.log('Final message created:', {
        id: finalMessage.id,
        content: finalMessage.content,
        reasoning: finalMessage.reasoning,
        isStreaming: finalMessage.isStreaming
      })
      
      // Replace streaming message with final message using splice for reactivity
      const streamingIndex = messages.value.findIndex(msg => msg.isStreaming)
      if (streamingIndex !== -1) {
        // Create completely new object to force reactivity
        const finalMessageWithUpdate = {
          ...finalMessage,
          _updateTime: Date.now()
        }
        messages.value.splice(streamingIndex, 1, finalMessageWithUpdate)
        console.log('Final message set in array:', finalMessageWithUpdate)
      }
    }
    
    // Always cleanup, even if no streaming message
    cleanupStreaming()
  }

  // Clean up streaming resources
  const cleanupStreaming = () => {
    console.log('Cleaning up streaming resources')
    
    if (sseClient.value) {
      try {
        sseClient.value.disconnect()
      } catch (error) {
        console.error('Error disconnecting SSE client:', error)
      }
      sseClient.value = null
    }
    
    isStreaming.value = false
    streamingMessage.value = null
    
    console.log('Streaming cleanup complete')
  }

  // Send a message (now uses non-streaming method by default)
  const sendMessage = async (content, options = {}) => {
    // Use streaming only if explicitly enabled
    const useStreaming = options.stream === true
    delete options.stream // Remove stream option to avoid conflicts
    
    if (useStreaming) {
      return sendMessageStream(content, options)
    } else {
      // Use non-streaming method (load from history after sending)
      return sendMessageLegacy(content, options)
    }
  }

  // Legacy send message method (non-streaming) - now default method
  const sendMessageLegacy = async (content, options = {}) => {
    if (!lettaAgentId.value) {
      throw new Error('No agent ID available')
    }

    if (!content || !content.trim()) {
      throw new Error('Message content is required')
    }

    // Variables to track temporary message IDs
    let tempUserId = null
    let typingId = null

    try {
      isSending.value = true
      error.value = null

      // Add user message to local state immediately for better UX
      tempUserId = `temp-${Date.now()}`
      const userMessage = {
        id: tempUserId,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        messageType: 'user_message',
        isTemporary: true
      }
      
      messages.value.push(userMessage)

      // Add "agent typing" placeholder immediately
      typingId = `typing-${Date.now()}`
      const agentTypingMessage = {
        id: typingId,
        role: 'agent',
        content: '',
        reasoning: null,
        toolCalls: [],
        timestamp: new Date(),
        messageType: 'typing',
        isTyping: true
      }
      
      messages.value.push(agentTypingMessage)

      // Send to API using non-streaming messages endpoint
      const { data, error: apiError } = await chatApi.sendMessageToMessages(
        lettaAgentId.value, 
        content.trim(), 
        options
      )

      if (apiError) {
        throw new Error(apiError)
      }

      console.log('Received response from Letta API:', data)

      // Remove temporary messages first
      messages.value = messages.value.filter(msg => 
        !msg.isTemporary && !msg.isTyping
      )

      // Process the response data directly instead of reloading all messages
      // Letta API returns: {messages: [...], stop_reason: {...}, usage: {...}}
      if (data && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
        console.log('Processing', data.messages.length, 'messages from response')
        
        // Convert Letta messages to internal format
        const newMessages = data.messages
          .map(messageUtils.convertToInternalFormat)
          .filter(msg => msg !== null)
        
        console.log('Converted', newMessages.length, 'messages')
        
        // Sort by timestamp
        const sortedMessages = messageUtils.sortByTimestamp(newMessages, 'asc')
        
        // Process messages to group reasoning + assistant
        const processedMessages = messageUtils.processMessages(sortedMessages)
        
        console.log('Processed', processedMessages.length, 'message groups')
        
        // Add new messages to existing messages
        messages.value.push(...processedMessages)
      } else {
        console.warn('No messages in response or empty array, falling back to loadMessages')
        console.warn('Response structure:', { hasData: !!data, hasMessages: !!(data?.messages), isArray: Array.isArray(data?.messages), length: data?.messages?.length })
        // Fallback: reload messages if response doesn't contain expected data
        await loadMessages({ limit: 50, order: 'desc' })
      }

    } catch (err) {
      console.error('Error sending message:', err)
      error.value = err.message
      
      // Remove temporary messages on error
      messages.value = messages.value.filter(msg => 
        msg.id !== tempUserId && msg.id !== typingId
      )
      
      throw err
    } finally {
      isSending.value = false
    }
  }

  // Clear messages
  const clearMessages = () => {
    messages.value = []
    lastMessageId.value = null
    hasMoreMessages.value = true
    error.value = null
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Reset messages (API call + local clear)
  const resetMessages = async (options = {}) => {
    if (!lettaAgentId.value) {
      throw new Error('No agent ID available')
    }

    try {
      isLoading.value = true
      error.value = null

      // Call API to reset messages on server
      const { data, error: apiError } = await chatApi.resetMessages(lettaAgentId.value, options)

      if (apiError) {
        throw new Error(apiError)
      }

      // Clear local messages
      clearMessages()

      // Reload messages if default initial messages were added
      if (options.add_default_initial_messages) {
        await loadMessages()
      }

      console.log('Messages reset successfully')
      return { success: true }

    } catch (err) {
      console.error('Error resetting messages:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Auto-load messages when agent ID changes
  watch(lettaAgentId, (newAgentId, oldAgentId) => {
    // Only load if agent ID actually changed or is being set for the first time
    if (newAgentId && isAuthenticated.value && newAgentId !== oldAgentId) {
      console.log('Agent ID changed, loading messages:', { newAgentId, oldAgentId })
      clearMessages()
      loadMessages()
    }
  }, { immediate: true })

  return {
    // State
    messages: computed(() => messages.value),
    isLoading: computed(() => isLoading.value),
    isSending: computed(() => isSending.value),
    isStreaming: computed(() => isStreaming.value),
    error: computed(() => error.value),
    hasMoreMessages: computed(() => hasMoreMessages.value),
    
    // Computed
    agentMessages,
    userMessages,
    hasMessages,
    
    // Methods
    loadMessages,
    loadMoreMessages,
    sendMessage,
    sendMessageStream,
    sendMessageLegacy,
    clearMessages,
    clearError,
    cleanupStreaming,
    resetMessages
  }
}
