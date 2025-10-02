<template>
  <div class="flex items-center justify-end gap-2 sm:gap-3 md:gap-[10.314px] w-full h-10 sm:h-12 md:h-14 lg:h-16 xl:h-[72px]" style="max-width: 749px; max-height: 72px;">
    <!-- Единый контейнер композера с input и кнопкой -->
    <div class="flex items-center gap-2 sm:gap-3 md:gap-[10.314px] bg-gradient-to-r from-[rgba(0,0,0,0.65)] from-[75.481%] to-[rgba(25,25,25,0.475)] rounded-[10px] sm:rounded-[12px] md:rounded-[14px] lg:rounded-[15.471px] backdrop-blur-[77.2px] px-3 sm:px-4 md:px-6 lg:px-8 xl:px-[26.816px] py-2 sm:py-3 md:py-4 lg:py-5 xl:py-[15.471px] h-full w-full">
      <input 
        v-model="messageInput"
        ref="inputRef"
        type="text" 
        placeholder="text,photo,video,code"
        class="flex-1 bg-transparent text-[#4E4E4E] font-['Roboto_Mono'] text-xs sm:text-sm md:text-base lg:text-lg xl:text-[16.406px] font-normal tracking-[1.5px] sm:tracking-[2px] md:tracking-[2.5px] lg:tracking-[3px] xl:tracking-[3.4452px] lowercase outline-none border-none placeholder:text-[#4E4E4E] leading-[2]"
        @keydown.enter="handleSend"
        @keydown.escape="clearInput"
      />
      <button 
        @click="handleSend"
        :disabled="!messageInput.trim()"
        class="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-[25.336px] xl:h-[26.115px] hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <path d="M0.664062 3.33002C0.664063 1.4657 2.78507 0.346099 4.55098 1.27826L24.5834 11.8526C26.4104 12.817 26.4864 15.2379 24.719 16.1709L4.68659 26.7452C2.91918 27.6782 0.664063 26.4075 0.664063 24.4787L0.664062 3.33002Z" fill="white"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const emit = defineEmits(['send-message'])

const messageInput = ref('')
const inputRef = ref(null)

const handleSend = () => {
  if (messageInput.value.trim()) {
    emit('send-message', messageInput.value.trim())
    messageInput.value = ''
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const clearInput = () => {
  messageInput.value = ''
  inputRef.value?.focus()
}

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>
