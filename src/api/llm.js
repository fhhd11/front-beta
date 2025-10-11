import { apiClient } from './client.js'

// LLM API service for direct LLM chat (not agent)
export const llmApi = {
  /**
   * Send message to LLM and get streaming response
   * @param {Array} messages - Array of chat messages [{role: 'user'|'assistant', content: string}]
   * @param {Object} options - Additional options
   * @returns {Promise<ReadableStream>} - Streaming response
   */
  async streamChat(messages, options = {}) {
    try {
      const litellmBaseUrl = import.meta.env.VITE_LITELLM_BASE_URL
      const model = import.meta.env.VITE_LITELLM_MODEL || 'gemini-2.0-flash-exp'
      
      console.log('Environment check:', {
        litellmBaseUrl,
        model,
        allEnvVars: import.meta.env
      })
      
      if (!litellmBaseUrl) {
        throw new Error('VITE_LITELLM_BASE_URL is not configured')
      }

      // Get litellm_key from user profile (similar to how we get letta_agent_id)
      const { data: userData } = await apiClient.get('/api/v1/me')
      const litellmKey = userData?.litellm_key
      
      if (!litellmKey) {
        throw new Error('LiteLLM key not found in user profile')
      }

      // Make request to LiteLLM using OpenAI-compatible API
      const response = await fetch(`${litellmBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${litellmKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          ...options
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`LiteLLM API error: ${response.status} ${errorText}`)
      }

      return response.body
    } catch (error) {
      console.error('Error in LLM stream chat:', error)
      throw error
    }
  },

  /**
   * Send message to LLM and get non-streaming response
   * @param {Array} messages - Array of chat messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response with message content
   */
  async chat(messages, options = {}) {
    try {
      const litellmBaseUrl = import.meta.env.VITE_LITELLM_BASE_URL
      const model = import.meta.env.VITE_LITELLM_MODEL || 'gemini-2.0-flash-exp'
      
      if (!litellmBaseUrl) {
        throw new Error('VITE_LITELLM_BASE_URL is not configured')
      }

      // Get litellm_key from user profile
      const { data: userData } = await apiClient.get('/api/v1/me')
      const litellmKey = userData?.litellm_key
      
      if (!litellmKey) {
        throw new Error('LiteLLM key not found in user profile')
      }

      // Make request to LiteLLM using OpenAI-compatible API
      const response = await fetch(`${litellmBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${litellmKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          ...options
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`LiteLLM API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
        model: data.model
      }
    } catch (error) {
      console.error('Error in LLM chat:', error)
      throw error
    }
  }
}

// Helper function to parse SSE stream from LiteLLM
export async function* parseSSEStream(stream) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith(':')) continue
        
        // Parse SSE data
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6)
          
          // Skip [DONE] marker
          if (data === '[DONE]') continue
          
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            
            if (content) {
              yield content
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', data, e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * Generate image using LiteLLM Images API
 * @param {string} prompt - Image generation prompt
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Response with generated image
 */
export async function generateImage(prompt, options = {}) {
  try {
    const litellmBaseUrl = import.meta.env.VITE_LITELLM_BASE_URL
    const model = options.model || 'gemini/gemini-2.5-flash-image'
    
    if (!litellmBaseUrl) {
      throw new Error('VITE_LITELLM_BASE_URL is not configured')
    }

    // Get litellm_key from user profile
    const { data: userData } = await apiClient.get('/api/v1/me')
    const litellmKey = userData?.litellm_key
    
    if (!litellmKey) {
      throw new Error('LiteLLM key not found in user profile')
    }

    // Make request to LiteLLM Images API
    const response = await fetch(`${litellmBaseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${litellmKey}`
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        response_format: 'b64_json',
        ...options
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LiteLLM Images API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Image generation API response:', data)
    
    return data
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

