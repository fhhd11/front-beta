import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'
import { userApi } from '../api/user.js'

// Agent state
const agentInfo = ref(null)
const agentLoading = ref(false)
const agentError = ref(null)

export function useAgent() {
  const { lettaAgentId, isAuthenticated, userProfile } = useAuth()

  // Computed properties
  const hasAgent = computed(() => !!lettaAgentId.value)
  const agentId = computed(() => lettaAgentId.value)
  const agentName = computed(() => agentInfo.value?.name || 'Мой AI-ассистент')
  const agentStatus = computed(() => agentInfo.value?.status || 'unknown')

  // Load agent information
  const loadAgentInfo = async () => {
    if (!hasAgent.value) {
      console.warn('No agent ID available')
      return
    }

    try {
      agentLoading.value = true
      agentError.value = null

      const { data, error } = await userApi.getAgentInfo()
      
      if (error) {
        throw new Error(error)
      }

      agentInfo.value = data
      console.log('Agent info loaded:', data)
      
    } catch (err) {
      console.error('Error loading agent info:', err)
      agentError.value = err.message
    } finally {
      agentLoading.value = false
    }
  }

  // Check if agent is ready for interaction
  const isAgentReady = computed(() => {
    return hasAgent.value && agentStatus.value === 'active'
  })

  // Get agent display info
  const getAgentDisplayInfo = () => {
    return {
      id: agentId.value,
      name: agentName.value,
      status: agentStatus.value,
      isReady: isAgentReady.value,
      hasAgent: hasAgent.value
    }
  }

  // Clear agent error
  const clearAgentError = () => {
    agentError.value = null
  }

  return {
    // State
    agentInfo: computed(() => agentInfo.value),
    agentLoading: computed(() => agentLoading.value),
    agentError: computed(() => agentError.value),
    
    // Computed
    hasAgent,
    agentId,
    agentName,
    agentStatus,
    isAgentReady,
    
    // Methods
    loadAgentInfo,
    getAgentDisplayInfo,
    clearAgentError
  }
}
