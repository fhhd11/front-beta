import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../config/supabase.js'
import ChatPage from '../views/ChatPage.vue'
import AuthPage from '../views/AuthPage.vue'

const routes = [
  {
    path: '/',
    name: 'Chat',
    component: ChatPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  try {
    // Get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth check error:', error)
    }
    
    const isAuthenticated = !!session?.user
    
    if (to.meta.requiresAuth && !isAuthenticated) {
      // Redirect to auth page if not authenticated
      next('/auth')
    } else if (to.path === '/auth' && isAuthenticated) {
      // Redirect to chat if already authenticated
      next('/')
    } else {
      next()
    }
  } catch (error) {
    console.error('Router guard error:', error)
    // On error, redirect to auth page
    if (to.meta.requiresAuth) {
      next('/auth')
    } else {
      next()
    }
  }
})

export default router
