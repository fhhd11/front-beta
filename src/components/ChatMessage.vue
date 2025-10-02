<template>
  <div 
    class="flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 w-full"
    :class="{ 
      'items-start': !isUser,
      'items-end max-w-full sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[409px] ml-auto': isUser 
    }"
  >
    <!-- User message wrapper with flip effect -->
    <div 
      v-if="isUser" 
      class="flex items-center justify-center w-full"
    >
      <div class="flex-none rotate-180 scale-y-[-1] w-full">
        <div class="flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-[10.046px] items-start w-full">
          <!-- User Avatar -->
          <div class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-[25.115px] xl:h-[25.115px] flex-shrink-0">
            <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <circle cx="12.5573" cy="12.5573" r="12.5573" transform="matrix(-1 0 0 1 25.3672 0)" fill="url(#paint0_linear_user)"/>
              <circle cx="12.5573" cy="12.5573" r="12.1136" transform="matrix(-1 0 0 1 25.3672 0)" stroke="url(#paint1_linear_user)" stroke-opacity="0.08" stroke-width="0.887339"/>
              <defs>
                <linearGradient id="paint0_linear_user" x1="5.90931" y1="-2.95465" x2="22.5292" y2="28.4385" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#62FF7A"/>
                  <stop offset="1" stop-color="#A8FFA3"/>
                </linearGradient>
                <linearGradient id="paint1_linear_user" x1="12.5573" y1="3.93309e-08" x2="10.6055" y2="26.7659" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white"/>
                  <stop offset="1" stop-color="#999999" stop-opacity="0.4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <!-- User Message Box -->
          <div class="message-blur rounded-[6px] sm:rounded-[7px] md:rounded-[7.2px] lg:rounded-[7.4px] xl:rounded-[7.534px] p-2 sm:p-3 md:p-4 lg:p-5 xl:p-[10.046px] w-full flex flex-col gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-[5.023px] items-end justify-center relative overflow-hidden">
            <div class="flex items-center justify-center w-full">
              <div class="flex-none rotate-180 scale-y-[-1] w-full">
                <p class="font-['Roboto_Mono'] font-light text-xs sm:text-sm md:text-base lg:text-lg xl:text-[15px] text-white tracking-[1px] sm:tracking-[1.2px] md:tracking-[1.3px] lg:tracking-[1.4px] xl:tracking-[1.5px] leading-[1.6] sm:leading-[1.7] md:leading-[1.8] lg:leading-[2] xl:leading-[25.115px] m-0">
                  {{ message.content }}
                </p>
              </div>
            </div>
            
            <!-- Copy button for user -->
            <div class="flex items-center justify-center">
              <div class="flex-none rotate-180 scale-y-[-1]">
                <button 
                  @click="copyMessage"
                  class="relative opacity-70 hover:opacity-100 transition-all duration-200 p-[1.507px] flex items-center gap-[7.534px] group"
                  :class="{
                    'opacity-100 scale-110': copied,
                    'opacity-50': copyError
                  }"
                  :title="copyError ? 'Copy failed' : copied ? 'Copied!' : 'Copy message'"
                  :disabled="copied || copyError"
                >
                  <!-- Success checkmark -->
                  <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" class="w-3 h-3 animate-pulse">
                    <path d="M9.5 3.5L4.5 8.5L1.5 5.5" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  
                  <!-- Error X -->
                  <svg v-else-if="copyError" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" class="w-3 h-3 animate-pulse">
                    <path d="M8.5 2.5L2.5 8.5M2.5 2.5L8.5 8.5" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  
                  <!-- Default copy icon -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" class="w-3 h-3 transition-all group-hover:opacity-100">
                    <path d="M7.58496 3.95289C7.58496 3.5976 7.44382 3.25687 7.1926 3.00564C6.94137 2.75442 6.60064 2.61328 6.24535 2.61328H1.8925C1.71658 2.61328 1.54238 2.64793 1.37985 2.71525C1.21732 2.78257 1.06964 2.88125 0.945249 3.00564C0.820855 3.13004 0.722179 3.27772 0.654857 3.44024C0.587535 3.60277 0.552886 3.77697 0.552886 3.95289V8.30575C0.552886 8.48167 0.587535 8.65586 0.654857 8.81839C0.722179 8.98092 0.820855 9.1286 0.945249 9.25299C1.06964 9.37739 1.21732 9.47606 1.37985 9.54339C1.54238 9.61071 1.71658 9.64536 1.8925 9.64536H6.24535C6.42127 9.64536 6.59547 9.61071 6.758 9.54339C6.92053 9.47606 7.0682 9.37739 7.1926 9.25299C7.31699 9.1286 7.41567 8.98092 7.48299 8.81839C7.55031 8.65586 7.58496 8.48167 7.58496 8.30575V3.95289Z" stroke="white" stroke-opacity="0.7" stroke-width="1.00458" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9.08153 7.50935C9.23573 7.42173 9.36399 7.29486 9.45327 7.14161C9.54255 6.98837 9.58967 6.81422 9.58984 6.63687V1.61396C9.58984 1.06144 9.13778 0.609375 8.58526 0.609375H3.56235C3.18563 0.609375 2.9807 0.802757 2.80891 1.11167" stroke="white" stroke-opacity="0.7" stroke-width="1.00458" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent messages (no flip) -->
    <template v-else>
      <!-- Agent Avatar -->
      <div class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-[29px] xl:h-[29.275px] flex-shrink-0">
        <svg viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="#F5F5F5"/>
        </svg>
      </div>

      <!-- Reasoning Section -->
      <div 
        v-if="message.reasoning" 
        class="relative w-full mb-3 sm:mb-4 md:mb-6 cursor-pointer group"
        @click="toggleReasoning"
      >
        <div class="w-[2px] sm:w-[2.5px] md:w-[3.337px] bg-white absolute left-0 top-[2px] sm:top-[2.5px] md:top-[3.121px] bottom-0 transition-opacity group-hover:opacity-80"></div>
        <div 
          class="ml-3 sm:ml-4 md:ml-[18.337px] text-white/70 font-['Roboto_Mono'] font-light text-xs sm:text-sm md:text-[15px] leading-[1.3] sm:leading-[1.4] md:leading-[16.871px] tracking-[1px] sm:tracking-[1.2px] md:tracking-[1.5px] overflow-hidden pr-2 transition-all duration-300 ease-in-out"
          :class="isReasoningExpanded ? 'max-h-[400px] sm:max-h-[450px] md:max-h-[500px] overflow-y-auto scrollbar-hidden' : 'max-h-[30px] sm:max-h-[35px] md:max-h-[40px]'"
        >
          <p v-for="(line, index) in message.reasoning.split('\n')" :key="index" :class="{ 'mb-0': index === message.reasoning.split('\n').length - 1 }">
            {{ line }}
          </p>
        </div>
        <!-- Expand/Collapse indicator -->
        <div 
          class="ml-3 sm:ml-4 md:ml-[18.337px] mt-1 sm:mt-1.5 md:mt-2 text-white/50 text-[10px] sm:text-xs font-['Roboto_Mono'] hover:text-white/80 transition-colors"
        >
          {{ isReasoningExpanded ? '▲ Свернуть' : '▼ Развернуть рассуждения' }}
        </div>
      </div>

      <!-- Agent Message Box -->
      <div class="message-blur rounded-[6px] sm:rounded-[7px] md:rounded-[8px] lg:rounded-[8.4px] xl:rounded-[8.702px] p-2 sm:p-3 md:p-4 lg:p-5 xl:p-[11.603px] w-full flex flex-col gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-[5.801px] items-start relative overflow-hidden">
        <div class="font-['Roboto_Mono'] font-light text-xs sm:text-sm md:text-base lg:text-lg xl:text-[15px] text-white tracking-[1px] sm:tracking-[1.2px] md:tracking-[1.3px] lg:tracking-[1.4px] xl:tracking-[1.5px] leading-[1.6] sm:leading-[1.8] md:leading-[2] lg:leading-[2.2] xl:leading-[29.007px] whitespace-pre-wrap">
          {{ message.content }}
        </div>
        
        <!-- Copy button for agent -->
        <div class="flex items-center justify-center">
          <div class="flex-none rotate-180 scale-y-[-1]">
            <button 
              @click="copyMessage"
              class="relative opacity-70 hover:opacity-100 transition-all duration-200 p-[1.74px] flex items-center gap-[8.702px] justify-end overflow-clip group"
              :class="{
                'opacity-100 scale-110': copied,
                'opacity-50': copyError
              }"
              :title="copyError ? 'Copy failed' : copied ? 'Copied!' : 'Copy message'"
              :disabled="copied || copyError"
            >
              <div class="flex items-center justify-center">
                <div class="flex-none rotate-180 scale-y-[-1]">
                  <!-- Success checkmark -->
                  <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" class="w-3 h-3 animate-pulse">
                    <path d="M9.5 3.5L4.5 8.5L1.5 5.5" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  
                  <!-- Error X -->
                  <svg v-else-if="copyError" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" class="w-3 h-3 animate-pulse">
                    <path d="M8.5 2.5L2.5 8.5M2.5 2.5L8.5 8.5" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  
                  <!-- Default copy icon -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" class="w-3 h-3 transition-all group-hover:opacity-100">
                    <path d="M7.58496 3.95289C7.58496 3.5976 7.44382 3.25687 7.1926 3.00564C6.94137 2.75442 6.60064 2.61328 6.24535 2.61328H1.8925C1.71658 2.61328 1.54238 2.64793 1.37985 2.71525C1.21732 2.78257 1.06964 2.88125 0.945249 3.00564C0.820855 3.13004 0.722179 3.27772 0.654857 3.44024C0.587535 3.60277 0.552886 3.77697 0.552886 3.95289V8.30575C0.552886 8.48167 0.587535 8.65586 0.654857 8.81839C0.722179 8.98092 0.820855 9.1286 0.945249 9.25299C1.06964 9.37739 1.21732 9.47606 1.37985 9.54339C1.54238 9.61071 1.71658 9.64536 1.8925 9.64536H6.24535C6.42127 9.64536 6.59547 9.61071 6.758 9.54339C6.92053 9.47606 7.0682 9.37739 7.1926 9.25299C7.31699 9.1286 7.41567 8.98092 7.48299 8.81839C7.55031 8.65586 7.58496 8.48167 7.58496 8.30575V3.95289Z" stroke="white" stroke-opacity="0.7" stroke-width="1.00458" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9.08153 7.50935C9.23573 7.42173 9.36399 7.29486 9.45327 7.14161C9.54255 6.98837 9.58967 6.81422 9.58984 6.63687V1.61396C9.58984 1.06144 9.13778 0.609375 8.58526 0.609375H3.56235C3.18563 0.609375 2.9807 0.802757 2.80891 1.11167" stroke="white" stroke-opacity="0.7" stroke-width="1.00458" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { copyToClipboard, getCopyErrorMessage } from '../utils/copyUtils.js'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isUser: {
    type: Boolean,
    default: false
  }
})

const copied = ref(false)
const isReasoningExpanded = ref(false)
const copyError = ref(false)

const copyMessage = async () => {
  try {
    // Reset error state
    copyError.value = false
    
    // Use utility function for copying
    const success = await copyToClipboard(props.message.content)
    
    if (success) {
      // Show success feedback
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } else {
      throw new Error('Copy operation failed')
    }
    
  } catch (err) {
    console.error('Failed to copy message:', err)
    copyError.value = true
    setTimeout(() => {
      copyError.value = false
    }, 3000)
  }
}

const toggleReasoning = () => {
  isReasoningExpanded.value = !isReasoningExpanded.value
}
</script>
