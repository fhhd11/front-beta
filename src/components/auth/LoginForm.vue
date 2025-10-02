<template>
  <div class="w-full max-w-md mx-auto">
    <form @submit.prevent="handleLogin" class="space-y-6">
      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-white mb-2">
          Email
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="Введите ваш email"
          :disabled="isLoading"
        />
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-white mb-2">
          Пароль
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="w-full px-4 py-3 pr-12 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm transition-all"
            placeholder="Введите ваш пароль"
            :disabled="isLoading"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            :disabled="isLoading"
          >
            <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            class="w-4 h-4 text-white bg-black/20 border-white/20 rounded focus:ring-white/30 focus:ring-2"
            :disabled="isLoading"
          />
          <span class="ml-2 text-sm text-white/70">Запомнить меня</span>
        </label>
        <button
          type="button"
          @click="$emit('forgot-password')"
          class="text-sm text-white/70 hover:text-white transition-colors"
          :disabled="isLoading"
        >
          Забыли пароль?
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
        <p class="text-sm text-red-300">{{ error }}</p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading || !isFormValid"
        class="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
      >
        <span v-if="isLoading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Вход...
        </span>
        <span v-else>Войти</span>
      </button>
    </form>

    <!-- Switch to Register -->
    <div class="mt-6 text-center">
      <p class="text-white/70">
        Нет аккаунта?
        <button
          @click="$emit('switch-to-register')"
          class="text-white hover:text-white/80 font-medium transition-colors"
          :disabled="isLoading"
        >
          Зарегистрироваться
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth.js'

const emit = defineEmits(['login', 'switch-to-register', 'forgot-password'])

const { signIn, loading, error: authError, clearError } = useAuth()

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const localError = ref('')

const isFormValid = computed(() => {
  return form.value.email && form.value.password && form.value.email.includes('@')
})

const error = computed(() => {
  return localError.value || authError.value
})

const isLoading = computed(() => loading.value)

const handleLogin = async () => {
  if (!isFormValid.value) return
  
  localError.value = ''
  clearError()
  
  try {
    const { data, error: signInError } = await signIn(form.value.email, form.value.password)
    
    if (signInError) {
      // Handle specific error messages
      if (signInError.message.includes('Invalid login credentials')) {
        localError.value = 'Неверный email или пароль'
      } else if (signInError.message.includes('Email not confirmed')) {
        localError.value = 'Пожалуйста, подтвердите ваш email'
      } else if (signInError.message.includes('Too many requests')) {
        localError.value = 'Слишком много попыток входа. Попробуйте позже'
      } else {
        localError.value = signInError.message
      }
      return
    }
    
    // Success - emit login event
    emit('login', {
      email: form.value.email,
      user: data.user
    })
    
  } catch (err) {
    localError.value = 'Ошибка входа. Проверьте данные и попробуйте снова.'
    console.error('Login error:', err)
  }
}
</script>
