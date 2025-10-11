<template>
  <div class="llm-chat-container h-full overflow-y-auto scrollbar-hidden p-3 sm:p-4 md:p-4 lg:p-5 xl:p-8 2xl:p-10">
    <div class="flex flex-col gap-3 sm:gap-4 md:gap-4 lg:gap-5 xl:gap-7 2xl:gap-8">
      <!-- Welcome message if no messages -->
      <div v-if="!hasMessages" class="flex flex-col items-center justify-center gap-4 text-white/60 mt-20">
        <svg class="w-16 h-16 opacity-40" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="currentColor"/>
        </svg>
        <div class="text-center">
          <p class="text-lg font-light mb-2">Чат с LLM моделью</p>
          <p class="text-sm opacity-70">Начните диалог с искусственным интеллектом</p>
        </div>
      </div>

      <!-- Messages -->
      <div v-for="(message, index) in messages" :key="message.id" :class="{ 'flex justify-end': message.role === 'user' }">
        <!-- User message -->
        <div v-if="message.role === 'user'" class="relative group">
          <!-- Editing form -->
          <div v-if="editingMessageId === message.id" class="flex flex-col gap-2 max-w-[80%]">
            <textarea
              v-model="editedContent"
              class="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 resize-none focus:outline-none focus:border-white/40 min-h-[100px]"
              placeholder="Редактировать сообщение..."
              @keydown.enter.ctrl="saveEditedMessage"
              @keydown.escape="cancelEditing"
            ></textarea>
            <div class="flex gap-2 justify-end">
              <button
                @click="cancelEditing"
                class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors text-sm"
              >
                Отмена
              </button>
              <button
                @click="saveEditedMessage"
                class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors text-sm"
                :disabled="!editedContent.trim()"
              >
                Отправить (Ctrl+Enter)
              </button>
            </div>
          </div>
          
          <!-- Normal message display -->
          <div v-else>
            <ChatMessage :message="message" :is-user="true" />
            <!-- Edit button for last user message -->
            <button
              v-if="isLastUserMessage(index) && !isSending && !isStreaming"
              @click="startEditingMessage(message)"
              class="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              title="Редактировать и создать новую ветку"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Assistant message -->
        <div v-else class="flex flex-col gap-4 w-full agent-message-appear">
          <!-- Assistant Avatar -->
          <div class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-[29px] xl:h-[29.275px] flex-shrink-0">
            <svg viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="#F5F5F5"/>
            </svg>
          </div>
          
          <!-- Message content -->
          <div class="ml-3 sm:ml-4 md:ml-5 lg:ml-6 xl:ml-8">
            <!-- Image Message -->
            <div v-if="message.is_image" class="image-message">
              <!-- Generation indicator -->
              <div v-if="message.isGenerating" class="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-blue-400 text-sm">Генерирую изображение...</span>
              </div>
              
              <!-- Generated image -->
              <div v-else-if="message.image_url" class="relative inline-block">
                <img 
                  :src="message.image_url" 
                  :alt="`Generated image: ${message.image_prompt}`"
                  class="max-w-[300px] h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                  loading="lazy"
                  @error="handleImageError"
                  @click="toggleImageActions(message.id)"
                />
                
                <!-- Download button - показать только при клике -->
                <div v-if="expandedImageId === message.id" 
                     class="absolute top-2 right-2 bg-black/70 hover:bg-black/90 rounded-full p-2 transition-colors">
                  <button 
                    @click="downloadImage(message.image_url, message.fileName)"
                    class="text-white hover:text-blue-300 transition-colors"
                    title="Скачать изображение"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Regular text message -->
            <div v-else>
              <ChatMessage :message="message" :is-user="false" />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Indicator (когда ждем ответа или первого чанка) -->
      <div v-if="showLoadingIndicator" class="flex items-start gap-2.5 agent-loading">
        <svg class="w-7 h-7 md:w-[29px] md:h-[29px] flex-shrink-0" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="#F5F5F5"/>
        </svg>
        <div class="flex items-center gap-2">
          <div class="flex gap-1">
            <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
          <span class="text-sm text-white/70 font-['Roboto_Mono']">Печатает...</span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
        <div class="flex items-center justify-between">
          <p class="text-sm">{{ error }}</p>
          <button @click="$emit('clear-error')" class="text-red-300 hover:text-red-200 ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isSending: {
    type: Boolean,
    default: false
  },
  isStreaming: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['clear-error', 'edit-message'])

const hasMessages = computed(() => props.messages.length > 0)

// Показывать индикатор загрузки только если идет отправка и еще нет streaming сообщения
// Также не показывать если генерируется изображение
const showLoadingIndicator = computed(() => {
  const hasStreamingMessage = props.messages.some(msg => msg.isStreaming)
  const hasGeneratingImage = props.messages.some(msg => msg.isGenerating)
  return (props.isSending || props.isStreaming) && !hasStreamingMessage && !hasGeneratingImage
})

const editingMessageId = ref(null)
const editedContent = ref('')
const expandedImageId = ref(null)

// Check if this is the last user message
const isLastUserMessage = (index) => {
  const lastUserMsgIndex = props.messages.findLastIndex(m => m.role === 'user')
  return index === lastUserMsgIndex
}

// Start editing a message
const startEditingMessage = (message) => {
  editingMessageId.value = message.id
  editedContent.value = message.content
  // Focus on textarea after DOM update
  nextTick(() => {
    const textarea = document.querySelector('textarea[placeholder="Редактировать сообщение..."]')
    if (textarea) {
      textarea.focus()
    }
  })
}

// Cancel editing
const cancelEditing = () => {
  editingMessageId.value = null
  editedContent.value = ''
}

// Save edited message
const saveEditedMessage = () => {
  if (!editedContent.value.trim()) return
  
  emit('edit-message', editedContent.value)
  cancelEditing()
}

// Image handling functions
const downloadImage = async (imageUrl, fileName = 'generated-image.png') => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading image:', error)
    // Fallback: open image in new tab
    window.open(imageUrl, '_blank')
  }
}


const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src)
  event.target.style.display = 'none'
}

const toggleImageActions = (messageId) => {
  // Если кликнули на уже развернутое изображение - сворачиваем
  if (expandedImageId.value === messageId) {
    expandedImageId.value = null
  } else {
    // Иначе разворачиваем это изображение
    expandedImageId.value = messageId
  }
}
</script>

<style scoped>
/* Scrollbar hidden utility */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
  scroll-behavior: auto;
}

/* Message appearance animation */
.agent-message-appear {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Typing indicator fade animation */
.fade-enter-active {
  animation: fadeIn 0.3s ease-in-out;
}

.fade-leave-active {
  animation: fadeOut 0.3s ease-in-out;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Loading animation */
.agent-loading {
  animation: fadeIn 0.3s ease-in-out;
}
</style>

