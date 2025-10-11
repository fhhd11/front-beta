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
const postRegistrationLoading = ref(false) // Loading state after registration

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
        // Don't throw error for CORS issues, just log and continue
        if (profileError.includes('CORS') || profileError.includes('fetch')) {
          console.warn('CORS or network issue detected, continuing without profile data')
          return
        }
        return
      }

      userProfile.value = profileData
      lettaAgentId.value = profileData.letta_agent_id
    } catch (err) {
      console.error('Error loading user profile:', err)
      // Don't throw error for network/CORS issues
      if (err.message && (err.message.includes('fetch') || err.message.includes('CORS'))) {
        console.warn('Network/CORS issue detected, continuing without profile data')
        return
      }
    }
  }

  // Wait for user data and agent to be ready after registration
  const waitForUserDataReady = async (maxAttempts = 30, intervalMs = 2000) => {
    postRegistrationLoading.value = true
    
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          // Try to load user profile
          await loadUserProfile()
          
          // Check if we have both user profile and agent ID
          if (userProfile.value && lettaAgentId.value) {
            postRegistrationLoading.value = false
            return { success: true, data: userProfile.value }
          }
          
        } catch (profileError) {
          console.warn(`Profile load attempt ${attempt} failed:`, profileError)
          // Continue to next attempt for network errors
          if (!profileError.message || !profileError.message.includes('fetch')) {
            // For other errors, wait a bit longer before retry
            await new Promise(resolve => setTimeout(resolve, intervalMs * 0.5))
          }
        }
        
        // Wait before next attempt
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, intervalMs))
        }
      }
      
      // If we reach here, max attempts exceeded
      console.warn('User data not ready after maximum attempts')
      postRegistrationLoading.value = false
      return { 
        success: false, 
        error: 'Данные пользователя не готовы после максимального количества попыток. Попробуйте обновить страницу.' 
      }
      
    } catch (err) {
      console.error('Error waiting for user data:', err)
      postRegistrationLoading.value = false
      return { 
        success: false, 
        error: err.message || 'Ошибка при ожидании данных пользователя' 
      }
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
      // Don't set error for network/CORS issues, just log them
      if (err.message && (err.message.includes('fetch') || err.message.includes('CORS'))) {
        console.warn('Network/CORS issue during auth initialization, continuing with Supabase auth only')
        error.value = null
      } else {
        error.value = err.message
        user.value = null
        session.value = null
        userProfile.value = null
        lettaAgentId.value = null
      }
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

      // If registration was successful, wait for user data to be ready
      if (data.user) {
        const waitResult = await waitForUserDataReady()
        
        if (!waitResult.success) {
          console.warn('User data not ready after registration:', waitResult.error)
          // Set error for user to see, but don't fail the registration completely
          error.value = waitResult.error
        }
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
    postRegistrationLoading: computed(() => postRegistrationLoading.value),
    
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
    loadUserProfile,
    waitForUserDataReady
  }
}

// Export reactive state for global access
export { user, session, loading, error }
