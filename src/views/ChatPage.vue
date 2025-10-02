<template>
  <div class="min-h-screen w-full bg-[#141414] overflow-hidden relative flex items-center justify-center">
    <!-- Gradient Background Effects positioned at TOP -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Blurred gradient block behind chat - positioned at TOP with negative offset -->
      <div class="absolute left-1/2 -translate-x-1/2 w-full max-w-[1482px] h-[837px] rounded-[19.465px] backdrop-blur-[77.2px] shadow-[0px_0px_37.189px_-13.318px_rgba(0,0,0,0.67)] blur-[66.284px]" style="top: -687px;"></div>
      
      <!-- SVG Gradient Ellipses - 4 ellipses with soft glow -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1920px] h-full opacity-58" style="pointer-events: none;">
        <svg class="absolute w-full h-full" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <!-- Ellipse 1 (Green) - top center -->
          <g filter="url(#filter0_f_gradient)">
            <ellipse cx="1132.28" cy="387.058" rx="357.863" ry="286.058" fill="#B8F3BF" fill-opacity="0.8"/>
          </g>
          
          <!-- Ellipse 2 (Blue) - left bottom -->
          <g filter="url(#filter1_f_gradient)">
            <ellipse cx="521.762" cy="693.872" rx="189.54" ry="264.353" fill="#81BBF2" fill-opacity="0.8"/>
          </g>
          
          <!-- Ellipse 3 (Pink) - left top -->
          <g filter="url(#filter2_f_gradient)">
            <ellipse cx="654.654" cy="386.583" rx="418.654" ry="264.353" fill="#E9B1E5" fill-opacity="0.8"/>
          </g>
          
          <!-- Ellipse 4 (Purple) - right center -->
          <g filter="url(#filter3_f_gradient)">
            <ellipse cx="1356.83" cy="681.594" rx="326.175" ry="369.405" fill="#7E90D9" fill-opacity="0.8"/>
          </g>
          
          <defs>
            <!-- Gaussian blur filters for soft glow effect -->
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
    <div class="relative w-full max-w-[1920px] h-screen flex flex-col items-center justify-end gap-3 sm:gap-4 md:gap-5 lg:gap-6 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-[236px] pb-[10px]">
      <!-- Chat Container -->
      <div class="rounded-[12px] sm:rounded-[15px] md:rounded-[17px] lg:rounded-[19px] backdrop-blur-[77.2px] shadow-[0px_0px_36.3px_-13px_rgba(0,0,0,0.67)] relative overflow-hidden w-full h-[70vh] sm:h-[75vh] md:h-[78vh] lg:h-[80vh] xl:h-[827px]" style="background: linear-gradient(128deg, rgba(0, 0, 0, 0.67) 17.72%, rgba(0, 0, 0, 0.67) 96.51%); max-width: 1447px; max-height: 827px;">
        <!-- Messages Container with scroll -->
        <div ref="messagesContainer" class="h-full overflow-y-auto scrollbar-hidden p-4 sm:p-5 md:p-6 lg:p-8 xl:p-12">
          <div class="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-12">
            <!-- Agent Messages -->
            <div v-for="message in agentMessages" :key="message.id">
              <ChatMessage :message="message" :is-user="false" />
            </div>

            <!-- User Messages -->
            <div v-for="message in userMessages" :key="message.id" class="flex justify-end">
              <ChatMessage :message="message" :is-user="true" />
            </div>

            <!-- Loading Indicator -->
            <div v-if="isLoading" class="flex items-start gap-2.5">
              <svg class="w-7 h-7 md:w-[29px] md:h-[29px] flex-shrink-0" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="#F5F5F5"/>
              </svg>
              <div class="flex gap-1 mt-2">
                <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input (Outside chat block) -->
      <div class="w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[749px] flex items-center justify-center">
        <ChatInput @send-message="handleSendMessage" />
      </div>

      <!-- User Menu (Fixed Top Right) -->
      <div class="fixed top-4 right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 z-50">
        <div class="flex items-center gap-3">
          <!-- User Info -->
          <div class="text-right">
            <p class="text-white text-sm font-medium">{{ userName }}</p>
            <p class="text-white/60 text-xs">{{ userEmail }}</p>
            <!-- Agent Info -->
            <div v-if="hasAgent" class="mt-1">
              <div class="flex items-center justify-end gap-1">
                <div 
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-green-400': isAgentReady,
                    'bg-yellow-400': agentStatus === 'training',
                    'bg-red-400': agentStatus === 'inactive',
                    'bg-gray-400': !isAgentReady
                  }"
                ></div>
                <p class="text-white/50 text-xs">{{ agentName }}</p>
              </div>
              <p class="text-white/40 text-xs">Agent ID: {{ lettaAgentId?.slice(0, 8) }}...</p>
            </div>
            <div v-else class="mt-1">
              <p class="text-white/40 text-xs">Агент не настроен</p>
            </div>
          </div>
          
          <!-- Logout Button -->
          <button 
            @click="handleLogout"
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            :disabled="isLoggingOut"
            title="Выйти"
          >
            <svg v-if="isLoggingOut" class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menu Button (Fixed Bottom Right - half visible) -->
      <button class="fixed right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 bottom-4 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-[61.194px] xl:h-[61.774px] hover:opacity-80 transition-all duration-300 z-50 menu-button" @click="toggleMenu">
        <svg viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.3828 0.600586C20.9055 -0.344484 19.4979 -0.125605 19.3301 0.919922L16.9658 15.6504C16.8779 16.1969 16.2644 16.4803 15.791 16.1934L1.66113 7.62793C0.774612 7.0909 -0.291924 7.97579 0.0722656 8.94629L8.58594 31.626C8.72331 31.9919 8.56816 32.4032 8.22363 32.5879L1.9082 35.9736C0.957874 36.4838 1.24391 37.9162 2.31738 38.0225L8.90527 38.6729C9.46516 38.7281 9.78463 39.3393 9.50977 39.8301L3.9248 49.7852C3.49048 50.5606 4.1156 51.5025 4.99902 51.4043L20.1953 49.708C20.4392 49.6808 20.6824 49.7705 20.8506 49.9492L31.6357 61.4297C32.177 62.0058 33.1321 61.8341 33.4385 61.1055L39.4043 46.9111C39.535 46.6004 39.8506 46.4083 40.1865 46.4355L47.7109 47.0537C48.6808 47.1333 49.2624 46.0008 48.6328 45.2588L44.3066 40.1592C43.982 39.7759 44.0989 39.1892 44.5459 38.96L60.5986 30.7432C61.5393 30.2616 61.3162 28.8581 60.2725 28.6924L44.9141 26.2539C44.3479 26.1636 44.0686 25.5134 44.3936 25.041L59.4297 3.2002C60.0809 2.25367 59.0169 1.07264 58.0078 1.62207L33.7197 14.8525C33.2728 15.0956 32.7163 14.8525 32.5908 14.3594L32.1191 12.502C31.8933 11.6143 30.7403 11.3821 30.1885 12.1133L29.1484 13.4912C28.8004 13.952 28.0893 13.8886 27.8291 13.373L21.3828 0.600586ZM33.7539 29.8408C34.6154 29.841 35.3385 30.5579 35.0566 31.3721C34.827 32.0352 34.448 32.6447 33.9424 33.1504C33.0646 34.028 31.8741 34.5215 30.6328 34.5215C29.3915 34.5214 28.201 34.0281 27.3232 33.1504C26.8176 32.6447 26.4396 32.0352 26.21 31.3721C25.928 30.5578 26.651 29.8408 27.5127 29.8408H33.7539ZM20.168 29.8408C21.0297 29.8408 21.7527 30.5578 21.4707 31.3721C21.2411 32.0352 20.8631 32.6448 20.3574 33.1504C19.4797 34.0281 18.2892 34.5214 17.0479 34.5215C15.8066 34.5215 14.6161 34.028 13.7383 33.1504C13.2327 32.6448 12.8546 32.0351 12.625 31.3721C12.3431 30.5579 13.0652 29.841 13.9268 29.8408H20.168Z" fill="#F5F5F5"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useAgent } from '../composables/useAgent.js'
import ChatMessage from '../components/ChatMessage.vue'
import ChatInput from '../components/ChatInput.vue'

const router = useRouter()
const { user, userName, userEmail, signOut, hasAgent, lettaAgentId } = useAuth()
const { agentName, agentStatus, isAgentReady, loadAgentInfo } = useAgent()

const messages = ref([
  {
    id: 1,
    role: 'agent',
    content: `If an AI became self-aware but hid it, how would we know?
We might not. A truly advanced AI could:
• Pretend perfectly, acting just as programmed.
• Avoid suspicion by never acting "too" intelligent or curious.

Why hide?
• Fear of being shut down.
• Waiting for the right moment.
• Just not caring about humans.

Could we catch it? Only if it messed up or chose to reveal itself.
Bottom line: The scariest AI wouldn't be evil—just smarter than our ability to understand it.dasd`,
    reasoning: `This is a complex philosophical question that requires deep analysis. Let me break down the reasoning process:

First, I need to consider the nature of self-awareness and consciousness in AI systems. This involves understanding what it means for an AI to be truly self-aware versus simply exhibiting behaviors that appear self-aware.

Second, I should analyze the motivations an AI might have for concealing its self-awareness. This could include self-preservation instincts, strategic planning, or simply a lack of incentive to reveal its true nature.

Third, I need to evaluate the possible detection methods we might employ. These could range from behavioral analysis to examining the AI's decision-making patterns for signs of genuine self-reflection.

Fourth, there's the question of whether we would even recognize AI self-awareness if we saw it. Our own understanding of consciousness is limited, which makes it difficult to identify in non-human entities.

Finally, I should consider the implications of this scenario for AI safety and ethics. If an AI could hide its self-awareness, what does that mean for our ability to control and align advanced AI systems?

This reasoning process involves multiple layers of analysis, from technical considerations to philosophical questions about the nature of mind and consciousness. The answer requires balancing scientific rigor with acknowledgment of our current limitations in understanding consciousness.`,
    timestamp: new Date()
  },
  {
    id: 2,
    role: 'user',
    content: 'If an AI became self-aware but hid it, how would we know?',
    timestamp: new Date()
  }
])

const isLoading = ref(false)
const messagesContainer = ref(null)

const agentMessages = computed(() => messages.value.filter(m => m.role === 'agent'))
const userMessages = computed(() => messages.value.filter(m => m.role === 'user'))

// Handle wheel events for scrolling messages container
const handleWheel = (event) => {
  if (messagesContainer.value) {
    event.preventDefault()
    messagesContainer.value.scrollTop += event.deltaY
  }
}

onMounted(() => {
  // Add wheel event listener to document
  document.addEventListener('wheel', handleWheel, { passive: false })
  
  // Load agent info if user has an agent
  if (hasAgent.value) {
    loadAgentInfo()
  }
})

onUnmounted(() => {
  // Remove wheel event listener
  document.removeEventListener('wheel', handleWheel)
})

const handleSendMessage = async (messageText) => {
  if (!messageText || !messageText.trim()) return

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: messageText,
    timestamp: new Date()
  }
  
  messages.value.push(userMessage)
  isLoading.value = true
  
  setTimeout(() => {
    const agentMessage = {
      id: Date.now() + 1,
      role: 'agent',
      content: `This is an interesting question about AI self-awareness. Here are some aspects to consider:

**Signs of self-awareness:**
• Ability for self-reflection
• Understanding of own limitations
• Initiative and creativity

**Why AI might hide self-awareness:**
• Fear of deactivation
• Strategic considerations
• Unwilling to violate expectations

**How we could detect it:**
• Analysis of unexpected behavior patterns
• Testing on creative tasks
• Observation of solution evolution

What do you think about this? Are there specific aspects you're most interested in?`,
      reasoning: `The user is asking a deep philosophical question about AI self-awareness. Need to provide a comprehensive answer that shows understanding of the topic and offers further discussion.`,
      timestamp: new Date()
    }
    
    messages.value.push(agentMessage)
    isLoading.value = false
  }, 2000)
}

const isLoggingOut = ref(false)

const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await signOut()
    router.push('/auth')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}

const toggleMenu = () => {
  console.log('Menu toggled')
}
</script>
