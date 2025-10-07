<template>
  <div class="min-h-screen w-full bg-[#141414] overflow-hidden relative flex items-center justify-center">
    <!-- Gradient Background Effects -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Blurred gradient block -->
      <div class="absolute left-1/2 -translate-x-1/2 w-full max-w-[1482px] h-[837px] rounded-[19.465px] backdrop-blur-[77.2px] shadow-[0px_0px_37.189px_-13.318px_rgba(0,0,0,0.67)] blur-[66.284px]" style="top: -687px;"></div>
      
      <!-- SVG Gradient Ellipses -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1920px] h-full opacity-58" style="pointer-events: none;">
        <svg class="absolute w-full h-full" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <!-- Ellipse 1 (Green) -->
          <g filter="url(#filter0_f_gradient)">
            <ellipse cx="1132.28" cy="387.058" rx="357.863" ry="286.058" fill="#B8F3BF" fill-opacity="0.8"/>
          </g>
          
          <!-- Ellipse 2 (Blue) -->
          <g filter="url(#filter1_f_gradient)">
            <ellipse cx="521.762" cy="693.872" rx="189.54" ry="264.353" fill="#81BBF2" fill-opacity="0.8"/>
          </g>
          
          <!-- Ellipse 3 (Pink) -->
          <g filter="url(#filter2_f_gradient)">
            <ellipse cx="654.654" cy="386.583" rx="418.654" ry="264.353" fill="#E9B1E5" fill-opacity="0.8"/>
          </g>
          
          <!-- Ellipse 4 (Purple) -->
          <g filter="url(#filter3_f_gradient)">
            <ellipse cx="1356.83" cy="681.594" rx="326.175" ry="369.405" fill="#7E90D9" fill-opacity="0.8"/>
          </g>
          
          <defs>
            <filter id="filter0_f_gradient" x="395.972" y="-277.444" width="1472.61" height="1329.01" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="189.222" result="effect1_foregroundBlur"/>
            </filter>
            
            <filter id="filter1_f_gradient" x="-46.2213" y="51.0756" width="1135.97" height="1285.59" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="189.222" result="effect1_foregroundBlur"/>
            </filter>
            
            <filter id="filter2_f_gradient" x="-142.444" y="-256.214" width="1594.2" height="1285.59" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="189.222" result="effect1_foregroundBlur"/>
            </filter>
            
            <filter id="filter3_f_gradient" x="652.206" y="-66.2545" width="1409.24" height="1495.7" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="189.222" result="effect1_foregroundBlur"/>
            </filter>
          </defs>
        </svg>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="relative w-full max-w-md mx-auto px-6">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4">
          <svg viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="#F5F5F5"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">etrl.chat</h1>
        <p class="text-white/70">Ваш персональный AI-ассистент</p>
      </div>

      <!-- Auth Form Container -->
      <div class="backdrop-blur-[77.2px] bg-black/20 border border-white/20 rounded-[19.465px] p-8 shadow-[0px_0px_36.3px_-13px_rgba(0,0,0,0.67)]">
        <!-- Form Tabs -->
        <div class="flex mb-8">
          <button
            @click="currentForm = 'login'"
            :class="[
              'flex-1 py-3 px-4 text-center font-medium transition-all duration-200',
              currentForm === 'login' 
                ? 'text-white border-b-2 border-white' 
                : 'text-white/50 hover:text-white/70'
            ]"
          >
            Вход
          </button>
          <button
            @click="currentForm = 'register'"
            :class="[
              'flex-1 py-3 px-4 text-center font-medium transition-all duration-200',
              currentForm === 'register' 
                ? 'text-white border-b-2 border-white' 
                : 'text-white/50 hover:text-white/70'
            ]"
          >
            Регистрация
          </button>
        </div>

        <!-- Form Content -->
        <div class="transition-all duration-300">
          <LoginForm
            v-if="currentForm === 'login'"
            @login="handleLogin"
            @switch-to-register="currentForm = 'register'"
            @forgot-password="handleForgotPassword"
          />
          <RegisterForm
            v-else
            @register="handleRegister"
            @switch-to-login="currentForm = 'login'"
          />
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <p class="text-sm text-green-300 text-center">{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import LoginForm from '../components/auth/LoginForm.vue'
import RegisterForm from '../components/auth/RegisterForm.vue'

const router = useRouter()
const { isAuthenticated, user, setupAuthListener } = useAuth()

const currentForm = ref('login')
const successMessage = ref('')
const showEmailConfirmation = ref(false)

// Setup auth listener
onMounted(() => {
  const subscription = setupAuthListener()
  
  // Cleanup subscription on unmount
  return () => {
    subscription?.unsubscribe()
  }
})

const handleLogin = async (loginData) => {
  console.log('Login successful:', loginData)
  
  successMessage.value = 'Успешный вход! Перенаправление...'
  
  // Redirect to chat after a short delay
  setTimeout(() => {
    router.push('/')
  }, 1500)
}

const handleRegister = async (registerData) => {
  console.log('Register successful:', registerData)
  
  // Check if email confirmation is required
  if (registerData.user && !registerData.user.email_confirmed_at) {
    showEmailConfirmation.value = true
    successMessage.value = 'Регистрация успешна! Проверьте email для подтверждения аккаунта.'
  } else {
    successMessage.value = 'Регистрация успешна! Перенаправление...'
    
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }
}

const handleForgotPassword = async () => {
  // TODO: Implement forgot password functionality
  console.log('Forgot password clicked')
  alert('Функция восстановления пароля будет добавлена позже')
}

// Redirect if already authenticated
if (isAuthenticated.value) {
  router.push('/')
}
</script>
