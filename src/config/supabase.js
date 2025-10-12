import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto refresh tokens
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session in URL
    detectSessionInUrl: true,
    // Storage key for session
    storageKey: 'etrl-chat-auth-token',
    // Storage implementation
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key)
        } catch (error) {
          console.error('Error getting item from localStorage:', error)
          return null
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.error('Error setting item in localStorage:', error)
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.error('Error removing item from localStorage:', error)
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'etrl-chat'
    }
  }
})

// Auth helper functions
export const authHelpers = {
  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Get current session
  getCurrentSession: () => {
    return supabase.auth.getSession()
  },

  // Sign out
  signOut: () => {
    return supabase.auth.signOut()
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  },

  // Refresh session if needed
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return false
      }
      return !!data.session
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }
}
