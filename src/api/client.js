import { supabase } from '../config/supabase.js'
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/api.js'

// API client class
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
  }

  // Get authorization headers
  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const headers = await this.getAuthHeaders()
      
      const config = {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      }

      const response = await fetch(url, config)
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Get user-friendly error message
        let errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`
        
        switch (response.status) {
          case HTTP_STATUS.UNAUTHORIZED:
            errorMessage = ERROR_MESSAGES.UNAUTHORIZED
            break
          case HTTP_STATUS.FORBIDDEN:
            errorMessage = ERROR_MESSAGES.FORBIDDEN
            break
          case HTTP_STATUS.NOT_FOUND:
            errorMessage = ERROR_MESSAGES.NOT_FOUND
            break
          case HTTP_STATUS.UNPROCESSABLE_ENTITY:
            errorMessage = ERROR_MESSAGES.VALIDATION_ERROR
            break
          case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          case HTTP_STATUS.BAD_GATEWAY:
          case HTTP_STATUS.SERVICE_UNAVAILABLE:
            errorMessage = ERROR_MESSAGES.SERVER_ERROR
            break
        }
        
        throw new ApiError(errorMessage, response.status, errorData)
      }

      // Parse JSON response
      const data = await response.json()
      return { data, error: null }
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Network or other errors
      throw new ApiError(
        error.message || ERROR_MESSAGES.NETWORK_ERROR,
        0,
        { originalError: error }
      )
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    })
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  }

  // PATCH request
  async patch(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      ...(data && { body: JSON.stringify(data) }),
      ...options
    })
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    })
  }

  // POST request with FormData (for file uploads)
  async postFormData(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }

      // Don't set Content-Type for FormData - browser will set it with boundary
      const headers = {
        'Authorization': `Bearer ${session.access_token}`
      }
      
      const config = {
        method: 'POST',
        body: formData,
        headers: {
          ...headers,
          ...options.headers
        },
        ...options
      }

      const response = await fetch(url, config)
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Log error details for debugging
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: JSON.parse(JSON.stringify(errorData)),
          endpoint
        })
        console.error('Error detail:', errorData.detail || errorData.message || 'No detail provided')
        
        let errorMessage = errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        
        switch (response.status) {
          case HTTP_STATUS.UNAUTHORIZED:
            errorMessage = ERROR_MESSAGES.UNAUTHORIZED
            break
          case HTTP_STATUS.FORBIDDEN:
            errorMessage = ERROR_MESSAGES.FORBIDDEN
            break
          case HTTP_STATUS.NOT_FOUND:
            errorMessage = ERROR_MESSAGES.NOT_FOUND
            break
          case HTTP_STATUS.UNPROCESSABLE_ENTITY:
            // Keep detailed error message for 422
            errorMessage = errorData.detail || errorData.message || ERROR_MESSAGES.VALIDATION_ERROR
            break
          case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          case HTTP_STATUS.BAD_GATEWAY:
          case HTTP_STATUS.SERVICE_UNAVAILABLE:
            errorMessage = ERROR_MESSAGES.SERVER_ERROR
            break
        }
        
        throw new ApiError(errorMessage, response.status, errorData)
      }

      // Parse JSON response
      const data = await response.json()
      return { data, error: null }
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      throw new ApiError(
        error.message || ERROR_MESSAGES.NETWORK_ERROR,
        0,
        { originalError: error }
      )
    }
  }
}

// Custom API Error class
class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }

  // Check if error is authentication related
  isAuthError() {
    return this.status === 401 || this.status === 403
  }

  // Check if error is network related
  isNetworkError() {
    return this.status === 0
  }

  // Check if error is server related
  isServerError() {
    return this.status >= 500
  }
}

// Create and export API client instance
export const apiClient = new ApiClient()

// Export error class for use in components
export { ApiError }

// Import endpoints from config
import { ENDPOINTS } from '../config/api.js'

// Export endpoints for backward compatibility
export const API_ENDPOINTS = {
  // User endpoints
  ME: ENDPOINTS.USER.ME,
  USER_PROFILE: ENDPOINTS.USER.PROFILE,
  
  // Agent endpoints (deprecated - using Letta API directly)
  // AGENT_INFO: ENDPOINTS.AGENT.INFO,
  // AGENT_MESSAGES: ENDPOINTS.AGENT.MESSAGES,
  // AGENT_MEMORY: ENDPOINTS.AGENT.MEMORY,
  
  // Chat endpoints
  SEND_MESSAGE: ENDPOINTS.CHAT.SEND_MESSAGE,
  GET_MESSAGES: ENDPOINTS.CHAT.GET_MESSAGES,
  GET_HISTORY: ENDPOINTS.CHAT.GET_HISTORY
}
