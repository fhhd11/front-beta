// LiteLLM configuration
export const LITELLM_CONFIG = {
  baseUrl: import.meta.env.VITE_LITELLM_BASE_URL || 'https://litellm-production-a2b5.up.railway.app',
  model: import.meta.env.VITE_LITELLM_MODEL || 'gemini-2.5-flash'
}

// Log configuration for debugging
console.log('LiteLLM Config:', LITELLM_CONFIG)
console.log('Environment vars:', {
  VITE_LITELLM_BASE_URL: import.meta.env.VITE_LITELLM_BASE_URL,
  VITE_LITELLM_MODEL: import.meta.env.VITE_LITELLM_MODEL
})
