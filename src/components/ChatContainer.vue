<template>
  <div class="relative w-full h-full overflow-hidden">
    <!-- Messages will be rendered here dynamically -->
    <div v-if="messages.length === 0 && !isLoading" class="flex items-center justify-center h-full">
      <div class="text-center text-white/60">
        <div class="w-[29px] h-[29.275px] mx-auto mb-4">
          <img src="/assets/agent-logo.svg" alt="Agent" class="w-full h-full" />
        </div>
        <p class="text-lg font-light">Начните диалог с вашим AI-ассистентом</p>
        <p class="text-sm mt-2">Задайте любой вопрос или попросите помощи</p>
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

// Компонент готов для отображения сообщений из API
// В будущем здесь будет логика для отображения сообщений с reasoning
</script>

