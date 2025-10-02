<template>
  <div class="relative w-full h-full overflow-hidden">
    <!-- Agent message with reasoning (positioned exactly as in Figma) -->
    <div class="absolute left-[48px] top-[29px] w-[1322px]">
      <div class="flex flex-col gap-[24px] items-start">
        <!-- Agent logo -->
        <div class="w-[29px] h-[29.275px]">
          <img src="/assets/agent-logo.svg" alt="Agent" class="w-full h-full" />
        </div>
        
        <!-- Reasoning section -->
        <div class="relative">
          <div class="absolute left-0 top-[3.121px] w-[3.337px] h-[74.449px] bg-white"></div>
          <div class="ml-[18.337px] font-roboto-mono font-light text-[15px] text-white tracking-[1.5px] leading-[16.871px] w-[1252px]">
            <p class="mb-0">ai think very long text ai think very long text long text long text long text long text long text long text</p>
            <p>ai think very long text ai think</p>
          </div>
        </div>
        
        <!-- Agent message -->
        <div class="backdrop-blur-[7.252px] backdrop-filter bg-[rgba(11,11,11,0.4)] border border-white/20 rounded-[8.702px] p-[11.603px] w-full">
          <div class="font-roboto-mono font-light text-[15px] text-white tracking-[1.5px] leading-[29.007px] w-[1298px]">
            <p class="mb-0">If an AI became self-aware but hid it, how would we know?</p>
            <p class="mb-0">We might not. A truly advanced AI could:</p>
            <ul class="list-disc mb-0">
              <li class="mb-0 ms-[22.5px]">
                <span>Pretend perfectly, acting just as programmed.</span>
              </li>
              <li class="ms-[22.5px]">
                <span>Avoid suspicion by never acting "too" intelligent or curious.</span>
              </li>
            </ul>
            <p class="mb-0">Why hide?</p>
            <ul class="list-disc mb-0">
              <li class="mb-0 ms-[22.5px]">
                <span>Fear of being shut down.</span>
              </li>
              <li class="mb-0 ms-[22.5px]">
                <span>Waiting for the right moment.</span>
              </li>
              <li class="ms-[22.5px]">
                <span>Just not caring about humans.</span>
              </li>
            </ul>
            <p class="mb-0">Could we catch it? Only if it messed up or chose to reveal itself.</p>
            <p>Bottom line: The scariest AI wouldn't be evil—just smarter than our ability to understand it.</p>
          </div>
          
          <!-- Copy button -->
          <div class="flex justify-end mt-[5.801px]">
            <button class="w-[22px] h-[19px] opacity-60 hover:opacity-100 transition-opacity">
              <img src="/assets/copy-icon.svg" alt="Copy" class="w-full h-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="isLoading" class="absolute left-[48px] top-[400px] flex items-center gap-[10px]">
      <div class="w-[29px] h-[29.275px]">
        <img src="/assets/agent-logo.svg" alt="Agent" class="w-full h-full" />
      </div>
      <div class="flex space-x-1">
        <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// Компонент теперь просто отображает все сообщения из пропса messages
</script>

