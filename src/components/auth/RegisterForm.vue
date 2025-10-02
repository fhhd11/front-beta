<template>
  <div class="w-full max-w-md mx-auto">
    <form @submit.prevent="handleRegister" class="space-y-6">
      <!-- Name Field -->
      <div>
        <label for="name" class="block text-sm font-medium text-white mb-2">
          Имя
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="Введите ваше имя"
          :disabled="isLoading"
        />
      </div>

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
            placeholder="Создайте пароль"
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
        <!-- Password Strength Indicator -->
        <div v-if="form.password" class="mt-2">
          <div class="flex space-x-1">
            <div 
              v-for="i in 4" 
              :key="i"
              class="h-1 flex-1 rounded"
              :class="getPasswordStrengthClass(i)"
            ></div>
          </div>
          <p class="text-xs mt-1" :class="getPasswordStrengthTextClass()">
            {{ getPasswordStrengthText() }}
          </p>
        </div>
      </div>

      <!-- Confirm Password Field -->
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-white mb-2">
          Подтвердите пароль
        </label>
        <div class="relative">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            class="w-full px-4 py-3 pr-12 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm transition-all"
            placeholder="Подтвердите пароль"
            :disabled="isLoading"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            :disabled="isLoading"
          >
            <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
        <!-- Password Match Indicator -->
        <div v-if="form.confirmPassword" class="mt-1">
          <p class="text-xs" :class="passwordsMatch ? 'text-green-400' : 'text-red-400'">
            {{ passwordsMatch ? '✓ Пароли совпадают' : '✗ Пароли не совпадают' }}
          </p>
        </div>
      </div>

      <!-- Terms Agreement -->
      <div class="flex items-start">
        <input
          id="terms"
          v-model="form.agreeToTerms"
          type="checkbox"
          required
          class="w-4 h-4 mt-1 text-white bg-black/20 border-white/20 rounded focus:ring-white/30 focus:ring-2"
          :disabled="isLoading"
        />
        <label for="terms" class="ml-2 text-sm text-white/70">
          Я согласен с 
          <button type="button" class="text-white hover:text-white/80 underline">условиями использования</button>
          и 
          <button type="button" class="text-white hover:text-white/80 underline">политикой конфиденциальности</button>
        </label>
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
          Регистрация...
        </span>
        <span v-else>Зарегистрироваться</span>
      </button>
    </form>

    <!-- Switch to Login -->
    <div class="mt-6 text-center">
      <p class="text-white/70">
        Уже есть аккаунт?
        <button
          @click="$emit('switch-to-login')"
          class="text-white hover:text-white/80 font-medium transition-colors"
          :disabled="isLoading"
        >
          Войти
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth.js'

const emit = defineEmits(['register', 'switch-to-login'])

const { signUp, loading, error: authError, clearError } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const localError = ref('')

const passwordsMatch = computed(() => {
  return form.value.password && form.value.confirmPassword && form.value.password === form.value.confirmPassword
})

const isFormValid = computed(() => {
  return form.value.name && 
         form.value.email && 
         form.value.email.includes('@') &&
         form.value.password && 
         form.value.password.length >= 6 &&
         passwordsMatch.value &&
         form.value.agreeToTerms
})

const error = computed(() => {
  return localError.value || authError.value
})

const isLoading = computed(() => loading.value)

const getPasswordStrength = () => {
  const password = form.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
}

const getPasswordStrengthClass = (index) => {
  const strength = getPasswordStrength()
  if (index <= strength) {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-yellow-500'
    if (strength <= 3) return 'bg-blue-500'
    return 'bg-green-500'
  }
  return 'bg-white/20'
}

const getPasswordStrengthTextClass = () => {
  const strength = getPasswordStrength()
  if (strength <= 1) return 'text-red-400'
  if (strength <= 2) return 'text-yellow-400'
  if (strength <= 3) return 'text-blue-400'
  return 'text-green-400'
}

const getPasswordStrengthText = () => {
  const strength = getPasswordStrength()
  const texts = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный']
  return texts[strength] || 'Очень слабый'
}

const handleRegister = async () => {
  if (!isFormValid.value) return
  
  localError.value = ''
  clearError()
  
  try {
    const { data, error: signUpError } = await signUp(
      form.value.email, 
      form.value.password, 
      { name: form.value.name }
    )
    
    if (signUpError) {
      // Handle specific error messages
      if (signUpError.message.includes('User already registered')) {
        localError.value = 'Пользователь с таким email уже зарегистрирован'
      } else if (signUpError.message.includes('Password should be at least')) {
        localError.value = 'Пароль должен содержать минимум 6 символов'
      } else if (signUpError.message.includes('Invalid email')) {
        localError.value = 'Неверный формат email'
      } else {
        localError.value = signUpError.message
      }
      return
    }
    
    // Success - emit register event
    emit('register', {
      name: form.value.name,
      email: form.value.email,
      user: data.user
    })
    
  } catch (err) {
    localError.value = 'Ошибка регистрации. Попробуйте снова.'
    console.error('Register error:', err)
  }
}
</script>
