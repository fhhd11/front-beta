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
      <!-- Agent Message Box (avatar is now shown in ChatPage.vue) -->
      <div class="message-blur rounded-[6px] sm:rounded-[7px] md:rounded-[8px] lg:rounded-[8.4px] xl:rounded-[8.702px] p-2 sm:p-3 md:p-4 lg:p-5 xl:p-[11.603px] flex flex-col gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-[5.801px] items-start relative overflow-hidden streaming-content">
        <div 
          class="font-['Roboto_Mono'] font-light text-xs sm:text-sm md:text-base lg:text-lg xl:text-[15px] text-white tracking-[1px] sm:tracking-[1.2px] md:tracking-[1.3px] lg:tracking-[1.4px] xl:tracking-[1.5px] leading-[1.6] sm:leading-[1.8] md:leading-[2] lg:leading-[2.2] xl:leading-[29.007px]"
          v-html="processedContent"
        ></div>
        
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
import { ref, computed } from 'vue'
import { copyToClipboard, getCopyErrorMessage } from '../utils/copyUtils.js'
import { processMessageText } from '../utils/markdownUtils.js'

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

// Process message content for display (clean streaming artifacts and convert markdown)
const processedContent = computed(() => {
  if (!props.message.content) return ''
  return processMessageText(props.message.content)
})

// Extract reasoning text safely (handle both string and object formats)
const reasoningText = computed(() => {
  if (!props.message.reasoning) return ''
  if (typeof props.message.reasoning === 'string') {
    return props.message.reasoning
  }
  return props.message.reasoning.reasoning || ''
})
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

<style scoped>
/* Streaming content animation */
.streaming-content {
  animation: fadeInContent 0.3s ease-in-out;
}

@keyframes fadeInContent {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Markdown formatting styles */
:deep(strong) {
  font-weight: 600;
  color: #ffffff;
}

:deep(em) {
  font-style: italic;
  color: #e5e5e5;
}

:deep(.inline-code) {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9em;
  color: #a8ffa3;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.code-block) {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  overflow-x: auto;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9em;
  line-height: 1.5;
}

:deep(.code-block code) {
  background: none;
  padding: 0;
  border: none;
  border-radius: 0;
  color: #a8ffa3;
  font-family: inherit;
  font-size: inherit;
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Markdown headers */
:deep(.markdown-h1) {
  font-size: 1.5em;
  font-weight: 700;
  color: #ffffff;
  margin: 16px 0 12px 0;
  line-height: 1.3;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
}

:deep(.markdown-h2) {
  font-size: 1.3em;
  font-weight: 600;
  color: #ffffff;
  margin: 14px 0 10px 0;
  line-height: 1.4;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 6px;
}

:deep(.markdown-h3) {
  font-size: 1.1em;
  font-weight: 600;
  color: #ffffff;
  margin: 12px 0 8px 0;
  line-height: 1.4;
}
</style>
