import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { apiClient } from '../api/client.js'

export function useContextWindow() {
  const { lettaAgentId, isAuthenticated, session } = useAuth()

  // State
  const contextData = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const lastUpdateTime = ref(null)

  // Computed properties
  const contextUsage = computed(() => {
    if (!contextData.value) return null
    
    return {
      current: contextData.value.context_window_size_current,
      max: contextData.value.context_window_size_max,
      percentage: Math.round((contextData.value.context_window_size_current / contextData.value.context_window_size_max) * 100)
    }
  })

  const memoryStats = computed(() => {
    if (!contextData.value) return null
    
    return {
      messages: contextData.value.num_messages || 0,
      archival: contextData.value.num_archival_memory || 0,
      recall: contextData.value.num_recall_memory || 0,
      summary: contextData.value.num_tokens_summary_memory || 0,
      core: contextData.value.num_tokens_core_memory || 0,
      system: contextData.value.num_tokens_system || 0
    }
  })

  const isNearLimit = computed(() => {
    if (!contextUsage.value) return false
    return contextUsage.value.percentage >= 80
  })

  const isAtLimit = computed(() => {
    if (!contextUsage.value) return false
    return contextUsage.value.percentage >= 95
  })

        // Fetch context window data
        const fetchContextData = async () => {
          if (!lettaAgentId.value) {
            console.warn('No agent ID available for fetching context data')
            return
          }

          try {
            isLoading.value = true
            error.value = null

            const endpoint = `/api/v1/letta/agents/${lettaAgentId.value}/context`
            const { data, error: apiError } = await apiClient.get(endpoint)

            if (apiError) {
              throw apiError
            }

            contextData.value = data
            lastUpdateTime.value = new Date()
            
          } catch (err) {
            console.error('Error fetching context data:', err)
            error.value = err.message
          } finally {
            isLoading.value = false
          }
        }

        // Summarize agent conversation
        const summarizeConversation = async (maxMessageLength = 10) => {
          if (!lettaAgentId.value) {
            console.warn('No agent ID available for conversation summarization')
            return false
          }

          try {
            // Используем query параметры в URL для GET-подобного POST запроса
            const endpoint = `/api/v1/letta/agents/${lettaAgentId.value}/summarize?max_message_length=${maxMessageLength}`
            const { error: apiError } = await apiClient.post(endpoint, {})

            if (apiError) {
              throw apiError
            }
            
            // Refresh context data after summarization
            await fetchContextData()
            
            return true
          } catch (err) {
            console.error('Error summarizing conversation:', err)
            error.value = err.message
            return false
          }
        }

        // Check if summarization is needed and perform it
        const checkAndSummarize = async () => {
          if (!contextUsage.value) {
            return false
          }

          // Summarize if usage is at warning level (80%+) or higher
          if (contextUsage.value.percentage >= 80) {
            try {
              const success = await summarizeConversation(10) // Keep last 10 messages
              return success
            } catch (err) {
              console.error('Error in checkAndSummarize:', err)
              return false
            }
          }

          return false
        }

  // Auto-refresh context data periodically
  const startAutoRefresh = (intervalMs = 30000) => { // 30 seconds default
    const interval = setInterval(fetchContextData, intervalMs)
    
    // Return cleanup function
    return () => clearInterval(interval)
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

        // Auto-fetch when agent ID changes
        watch(lettaAgentId, (newAgentId) => {
          if (newAgentId && isAuthenticated.value) {
            fetchContextData()
          }
        }, { immediate: true })

        return {
          // State
          contextData: computed(() => contextData.value),
          isLoading: computed(() => isLoading.value),
          error: computed(() => error.value),
          lastUpdateTime: computed(() => lastUpdateTime.value),
          
          // Computed
          contextUsage,
          memoryStats,
          isNearLimit,
          isAtLimit,

          // Methods
          fetchContextData,
          summarizeConversation,
          checkAndSummarize,
          startAutoRefresh,
          clearError
        }
}
