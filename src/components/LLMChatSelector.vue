<template>
  <!-- Dropdown menu -->
  <transition name="dropdown-fade">
    <div v-if="isOpen" class="llm-chat-dropdown">
      <!-- Dropdown content -->
      <div class="dropdown-content bg-gradient-to-br from-[rgba(20,20,20,0.98)] to-[rgba(30,30,30,0.98)] rounded-xl shadow-2xl border border-white/10 w-80 max-h-[70vh] flex flex-col backdrop-blur-xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-white/10">
          <h3 class="text-sm font-medium text-white/80">Ваши чаты</h3>
          <button 
            @click="handleCreateChat"
            :disabled="isCreatingChat"
            class="text-xs px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all disabled:opacity-50"
            title="Создать новый чат"
          >
            {{ isCreatingChat ? '...' : '+ Новый' }}
          </button>
        </div>

        <!-- Chat list -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1 min-h-[200px] max-h-[400px]">
          <!-- Loading state -->
          <div v-if="isLoadingChats" class="flex items-center justify-center py-8">
            <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>

          <!-- Empty state -->
          <div v-else-if="chats.length === 0" class="flex flex-col items-center justify-center py-8 text-white/50">
            <svg class="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <p class="text-xs">Нет чатов</p>
          </div>

          <!-- Chat items -->
          <div 
            v-else
            v-for="chat in chats" 
            :key="chat.id"
            :class="[
              'chat-item group relative flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all',
              currentChatId === chat.id 
                ? 'bg-white/15 border border-white/20' 
                : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10',
              chat.isTemporary ? 'opacity-70' : ''
            ]"
          >
            <!-- Chat content -->
            <div 
              class="flex-1 min-w-0"
              @click="selectChat(chat.id)"
            >
              <!-- Title (editable) -->
              <div v-if="editingChatId === chat.id" class="flex items-center gap-1">
                <input
                  ref="editInput"
                  v-model="editedTitle"
                  @keydown.enter="saveTitle(chat.id)"
                  @keydown.escape="cancelEdit"
                  @blur="saveTitle(chat.id)"
                  class="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 outline-none focus:border-blue-400"
                  @click.stop
                />
              </div>
              <div v-else class="flex items-center gap-2">
                <h3 class="text-white font-medium text-sm truncate flex-1">
                  {{ chat.title }}
                  <span v-if="chat.isTemporary" class="text-xs text-white/40 ml-1">(не сохранен)</span>
                </h3>
              </div>
              <p class="text-white/40 text-xs mt-0.5">
                {{ chat.isTemporary ? 'Создан сейчас' : formatDate(chat.updated_at) }}
              </p>
            </div>

            <!-- Action buttons (показываем при hover или если это текущий чат) -->
            <div 
              class="flex items-center gap-1 flex-shrink-0"
              :class="currentChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
            >
              <!-- Edit button -->
              <button 
                @click.stop="startEdit(chat)"
                class="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-all"
                title="Переименовать"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              
              <!-- Delete button -->
              <button 
                @click.stop="confirmDelete(chat)"
                class="p-1.5 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all"
                title="Удалить"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>

            <!-- Active indicator -->
            <div 
              v-if="currentChatId === chat.id" 
              class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r"
            ></div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="chatsError" class="mx-2 mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-xs">
          {{ chatsError }}
        </div>
      </div>
    </div>
  </transition>

  <!-- Confirm delete modal (отдельное overlay) -->
  <transition name="modal-fade">
    <div v-if="chatToDelete" class="fixed inset-0 z-[60] flex items-center justify-center p-4" @click.self="cancelDelete">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative bg-gradient-to-br from-[rgba(30,30,30,0.98)] to-[rgba(40,40,40,0.98)] rounded-xl shadow-2xl border border-white/10 p-6 max-w-sm w-full">
        <h3 class="text-lg font-medium text-white mb-3">Удалить чат?</h3>
        <p class="text-white/60 text-sm mb-6">
          Вы уверены, что хотите удалить чат "{{ chatToDelete.title }}"? Это действие нельзя отменить.
        </p>
        <div class="flex gap-3">
          <button 
            @click="cancelDelete"
            class="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
          >
            Отмена
          </button>
          <button 
            @click="deleteChat"
            :disabled="isDeletingChat"
            class="flex-1 px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white font-medium transition-all disabled:opacity-50"
          >
            {{ isDeletingChat ? 'Удаление...' : 'Удалить' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useLLMChats } from '../composables/useLLMChats.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'chat-selected'])

const {
  chats,
  currentChatId,
  isLoadingChats,
  chatsError,
  createTemporaryChat,
  switchChat,
  deleteChat: deleteChatFromApi,
  updateChatTitle
} = useLLMChats()

const isCreatingChat = ref(false)
const isDeletingChat = ref(false)
const chatToDelete = ref(null)
const editingChatId = ref(null)
const editedTitle = ref('')
const editInput = ref(null)

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? 'Только что' : `${minutes} мин назад`
    }
    return `${hours} ч назад`
  } else if (days === 1) {
    return 'Вчера'
  } else if (days < 7) {
    return `${days} дн назад`
  } else {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }
}

const closeDropdown = () => {
  emit('close')
}

const selectChat = (chatId) => {
  if (editingChatId.value) return // Не переключать если редактируем
  
  switchChat(chatId)
  emit('chat-selected', chatId)
  closeDropdown()
}

// Редактирование названия
const startEdit = (chat) => {
  editingChatId.value = chat.id
  editedTitle.value = chat.title
  nextTick(() => {
    editInput.value?.[0]?.focus()
    editInput.value?.[0]?.select()
  })
}

const cancelEdit = () => {
  editingChatId.value = null
  editedTitle.value = ''
}

const saveTitle = async (chatId) => {
  if (!editedTitle.value.trim() || editedTitle.value === chats.value.find(c => c.id === chatId)?.title) {
    cancelEdit()
    return
  }
  
  const success = await updateChatTitle(chatId, editedTitle.value.trim())
  if (success) {
    cancelEdit()
  }
}

const handleCreateChat = () => {
  // Проверяем, есть ли уже временный чат
  const existingTempChat = chats.value.find(c => c.isTemporary)
  
  if (existingTempChat) {
    // Если есть, переключаемся на него
    emit('chat-selected', existingTempChat.id)
    closeDropdown()
  } else {
    // Создаем новый временный чат
    const newChat = createTemporaryChat('Новый чат')
    if (newChat) {
      emit('chat-selected', newChat.id)
      closeDropdown()
    }
  }
}

const confirmDelete = (chat) => {
  chatToDelete.value = chat
}

const cancelDelete = () => {
  chatToDelete.value = null
}

const deleteChat = async () => {
  if (!chatToDelete.value) return
  
  const chatIdToDelete = chatToDelete.value.id
  const isTemp = chatToDelete.value.isTemporary
  isDeletingChat.value = true
  
  try {
    let success = true
    
    // Если чат не временный, удаляем из БД
    if (!isTemp) {
      success = await deleteChatFromApi(chatIdToDelete)
    } else {
      // Для временного чата просто удаляем из локального списка
      const tempIndex = chats.value.findIndex(c => c.id === chatIdToDelete)
      if (tempIndex !== -1) {
        chats.value.splice(tempIndex, 1)
      }
    }
    
    if (success) {
      chatToDelete.value = null
      
      // If deleted current chat, emit event to reload new current chat
      if (chatIdToDelete === currentChatId.value) {
        emit('chat-selected', currentChatId.value)
      }
      
      // Close dropdown after delete
      closeDropdown()
    }
  } finally {
    isDeletingChat.value = false
  }
}
</script>

<style scoped>
/* Dropdown positioning */
.llm-chat-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 50;
}

/* Dropdown content */
.dropdown-content {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dropdown fade animation */
.dropdown-fade-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Modal fade animation (for delete confirmation) */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Chat item */
.chat-item {
  transition: all 0.15s ease;
}
</style>

