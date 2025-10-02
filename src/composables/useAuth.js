import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase, authHelpers } from '../config/supabase.js'
import { userApi } from '../api/user.js'

// Global auth state
const user = ref(null)
const session = ref(null)
const userProfile = ref(null) // Extended user info from backend
const lettaAgentId = ref(null) // User's Letta agent ID
const loading = ref(true)
const error = ref(null)

// Auth state management
export function useAuth() {
  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.user_metadata?.role === 'admin')
  const userEmail = computed(() => user.value?.email)
  const userName = computed(() => userProfile.value?.name || user.value?.user_metadata?.name || user.value?.email?.split('@')[0])
  const hasAgent = computed(() => !!lettaAgentId.value)

  // Load user profile from backend
  const loadUserProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await userApi.getMe()
      
      if (profileError) {
        console.warn('Failed to load user profile:', profileError)
        return
      }

      userProfile.value = profileData
      lettaAgentId.value = profileData.letta_agent_id
      
      console.log('User profile loaded:', {
        name: profileData.name,
        email: profileData.email,
        letta_agent_id: profileData.letta_agent_id
      })
    } catch (err) {
      console.error('Error loading user profile:', err)
    }
  }

  // Initialize auth state
  const initAuth = async () => {
    try {
      loading.value = true
      error.value = null

      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await authHelpers.getCurrentSession()
      
      if (sessionError) {
        throw sessionError
      }

      session.value = currentSession
      user.value = currentSession?.user || null

      // If user is authenticated, load profile from backend
      if (currentSession?.user) {
        await loadUserProfile()
      }

    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = err.message
      user.value = null
      session.value = null
      userProfile.value = null
      lettaAgentId.value = null
    } finally {
      loading.value = false
    }
  }

  // Sign up with email and password
  const signUp = async (email, password, userData = {}) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            ...userData
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      return { data, error: null }
    } catch (err) {
      console.error('Sign up error:', err)
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        throw signInError
      }

      // Load user profile after successful sign in
      if (data.user) {
        await loadUserProfile()
      }

      return { data, error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      loading.value = true
      error.value = null

      const { error: signOutError } = await authHelpers.signOut()

      if (signOutError) {
        throw signOutError
      }

      // Clear local state
      user.value = null
      session.value = null
      userProfile.value = null
      lettaAgentId.value = null

      return { error: null }
    } catch (err) {
      console.error('Sign out error:', err)
      error.value = err.message
      return { error: err }
    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (resetError) {
        throw resetError
      }

      return { data, error: null }
    } catch (err) {
      console.error('Reset password error:', err)
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates
      })

      if (updateError) {
        throw updateError
      }

      return { data, error: null }
    } catch (err) {
      console.error('Update profile error:', err)
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Setup auth state listener
  const setupAuthListener = () => {
    const { data: { subscription } } = authHelpers.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      
      if (event === 'SIGNED_IN') {
        user.value = session?.user || null
        session.value = session
        
        // Load user profile when signed in
        if (session?.user) {
          await loadUserProfile()
        }
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        session.value = null
        userProfile.value = null
        lettaAgentId.value = null
      } else if (event === 'TOKEN_REFRESHED') {
        session.value = session
      }
    })

    return subscription
  }

  // Lifecycle hooks
  onMounted(() => {
    initAuth()
  })

  return {
    // State
    user: computed(() => user.value),
    session: computed(() => session.value),
    userProfile: computed(() => userProfile.value),
    lettaAgentId: computed(() => lettaAgentId.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Computed
    isAuthenticated,
    isAdmin,
    userEmail,
    userName,
    hasAgent,
    
    // Methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
    initAuth,
    setupAuthListener,
    loadUserProfile
  }
}

// Export reactive state for global access
export { user, session, loading, error }
