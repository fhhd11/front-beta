import { apiClient, API_ENDPOINTS } from './client.js'

// User API service
export const userApi = {
  // Get current user information including letta_agent_id
  async getMe() {
    try {
      const { data, error } = await apiClient.get(API_ENDPOINTS.ME)
      
      if (error) {
        throw error
      }

      return {
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          letta_agent_id: data.letta_agent_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          // Add any other user fields from your backend
          ...data
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      return {
        data: null,
        error: error.message || 'Failed to fetch user information'
      }
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { data, error } = await apiClient.put(API_ENDPOINTS.USER_PROFILE, updates)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return {
        data: null,
        error: error.message || 'Failed to update profile'
      }
    }
  },

  // Get user's agent information
  async getAgentInfo() {
    try {
      const { data, error } = await apiClient.get(API_ENDPOINTS.AGENT_INFO)
      
      if (error) {
        throw error
      }

      return {
        data: {
          id: data.id,
          name: data.name,
          status: data.status,
          created_at: data.created_at,
          // Add any other agent fields from your backend
          ...data
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching agent info:', error)
      return {
        data: null,
        error: error.message || 'Failed to fetch agent information'
      }
    }
  }
}

// User data types and interfaces (for TypeScript-like documentation)
export const UserTypes = {
  // User object structure from /api/v1/me
  User: {
    id: 'string',
    email: 'string',
    name: 'string',
    letta_agent_id: 'string',
    created_at: 'string',
    updated_at: 'string'
  },

  // Agent object structure
  Agent: {
    id: 'string',
    name: 'string',
    status: 'string', // 'active', 'inactive', 'training', etc.
    created_at: 'string'
  }
}
