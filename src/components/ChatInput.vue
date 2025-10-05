<template>
  <div class="flex items-center justify-end gap-2 sm:gap-3 md:gap-[10.314px] w-full h-12 sm:h-12 md:h-14 lg:h-16 xl:h-[72px]" style="max-width: 749px; max-height: 72px;">
    <!-- Единый контейнер композера с input и кнопкой -->
    <div class="flex items-center gap-2 sm:gap-3 md:gap-[10.314px] bg-gradient-to-r from-[rgba(0,0,0,0.65)] from-[75.481%] to-[rgba(25,25,25,0.475)] rounded-[10px] sm:rounded-[12px] md:rounded-[14px] lg:rounded-[15.471px] backdrop-blur-[77.2px] px-3 sm:px-4 md:px-6 lg:px-8 xl:px-[26.816px] py-3 sm:py-3 md:py-4 lg:py-5 xl:py-[15.471px] h-full w-full will-change-auto">
      <input 
        v-model="messageInput"
        ref="inputRef"
        type="text" 
        :placeholder="isSummarizing ? 'Суммаризация контекста...' : (isStreaming ? 'Агент печатает...' : 'text,photo,video,code')"
        :disabled="isStreaming"
        class="flex-1 bg-transparent text-[#4E4E4E] font-['Roboto_Mono'] text-xs sm:text-sm md:text-base lg:text-lg xl:text-[16.406px] font-normal tracking-[1.5px] sm:tracking-[2px] md:tracking-[2.5px] lg:tracking-[3px] xl:tracking-[3.4452px] lowercase outline-none border-none placeholder:text-[#4E4E4E] leading-[2] disabled:opacity-50 disabled:cursor-not-allowed"
        @keydown.enter="handleSend"
        @keydown.escape="clearInput"
      />
      <!-- Context Indicator -->
      <button 
        v-if="contextUsage"
        @click="toggleContextDetails"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        data-context-indicator
        class="flex-shrink-0 w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-[25.336px] xl:h-[26.115px] hover:opacity-80 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed relative"
        :class="{ 'opacity-60': isStreaming }"
        :disabled="isStreaming"
      >
        <!-- Percentage Circle -->
        <div class="w-full h-full relative">
          <!-- Background Circle -->
          <svg class="w-full h-full absolute inset-0" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
            <!-- Progress Arc -->
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              stroke-width="2" 
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              :class="progressColorClass"
              transform="rotate(-90 12 12)"
            />
          </svg>
          
        </div>

        <!-- Context Warning Dialog -->
        <div 
          v-if="showWarning && isNearLimit && !showContextTooltip" 
          class="context-warning-container"
          style="z-index: 9999;"
        >
          <div class="context-warning-dialog">
            <div class="warning-header">
              <div class="warning-icon">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="warning-content">
                <h4 class="warning-title">Контекст заполнен</h4>
                <p class="warning-text">При следующем сообщении произойдет автоматическая оптимизация истории чата</p>
              </div>
            </div>
            <!-- Warning Arrow -->
            <div class="warning-arrow"></div>
          </div>
        </div>

        <!-- Tooltip -->
        <div 
          v-if="showContextTooltip" 
          class="context-tooltip-container"
          style="z-index: 9999;"
        >
          <div class="context-tooltip">
            <div class="tooltip-header">
              <span class="tooltip-title">Контекстное окно</span>
              <span class="tooltip-status" :class="statusClass">{{ statusText }}</span>
            </div>
            <div class="tooltip-content">
              <div class="tooltip-item">
                <span class="tooltip-label">Использовано:</span>
                <span class="tooltip-value">{{ contextUsage.current.toLocaleString() }}</span>
              </div>
              <div class="tooltip-item">
                <span class="tooltip-label">Лимит:</span>
                <span class="tooltip-value">{{ contextUsage.max.toLocaleString() }}</span>
              </div>
              <div class="tooltip-item" v-if="memoryStats">
                <span class="tooltip-label">Сообщения:</span>
                <span class="tooltip-value">{{ memoryStats.messages }}</span>
              </div>
              <div class="tooltip-item" v-if="memoryStats && memoryStats.system > 0">
                <span class="tooltip-label">Система:</span>
                <span class="tooltip-value">{{ memoryStats.system.toLocaleString() }}</span>
              </div>
            </div>
            <!-- Tooltip Arrow -->
            <div class="tooltip-arrow"></div>
          </div>
        </div>
      </button>

      <button 
        @click="handleSend"
        :disabled="!messageInput.trim() || isStreaming || isSummarizing"
        class="flex-shrink-0 w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-[25.336px] xl:h-[26.115px] hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed relative"
      >
        <!-- Loading spinner for summarization -->
        <div v-if="isSummarizing" class="absolute inset-0 flex items-center justify-center">
          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        
        <!-- Send icon -->
        <svg v-else viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <path d="M0.664062 3.33002C0.664063 1.4657 2.78507 0.346099 4.55098 1.27826L24.5834 11.8526C26.4104 12.817 26.4864 15.2379 24.719 16.1709L4.68659 26.7452C2.91918 27.6782 0.664063 26.4075 0.664063 24.4787L0.664062 3.33002Z" fill="white"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'

const emit = defineEmits(['send-message'])

const props = defineProps({
  isStreaming: {
    type: Boolean,
    default: false
  },
  contextUsage: {
    type: Object,
    default: null
  },
  memoryStats: {
    type: Object,
    default: null
  },
  isNearLimit: {
    type: Boolean,
    default: false
  },
  isAtLimit: {
    type: Boolean,
    default: false
  },
  isSummarizing: {
    type: Boolean,
    default: false
  }
})

const messageInput = ref('')
const inputRef = ref(null)
const showContextTooltip = ref(false)
const showWarning = ref(false)
const isMobile = ref(false)
let hoverTimeout = null

// Computed properties for context indicator
const circumference = computed(() => 2 * Math.PI * 10) // radius = 10

const strokeDashoffset = computed(() => {
  if (!props.contextUsage) return circumference.value
  const progress = props.contextUsage.percentage / 100
  return circumference.value * (1 - progress)
})

const progressColorClass = computed(() => {
  if (props.isAtLimit) return 'text-red-500'
  if (props.isNearLimit) return 'text-yellow-500'
  return 'text-blue-500'
})

const progressTextClass = computed(() => {
  if (props.isAtLimit) return 'text-red-500'
  if (props.isNearLimit) return 'text-yellow-500'
  return 'text-blue-500'
})

const statusText = computed(() => {
  if (props.isAtLimit) return 'Критично'
  if (props.isNearLimit) return 'Предупреждение'
  return 'Норма'
})

const statusClass = computed(() => {
  if (props.isAtLimit) return 'status-danger'
  if (props.isNearLimit) return 'status-warning'
  return 'status-normal'
})

const toggleContextDetails = () => {
  if (isMobile.value) {
    // On mobile, toggle on click
    showContextTooltip.value = !showContextTooltip.value
    // Hide warning when showing tooltip
    if (showContextTooltip.value) {
      showWarning.value = false
    }
  }
  // On desktop, this will be handled by mouse events
}

const handleMouseEnter = () => {
  if (!isMobile.value) {
    // Очищаем предыдущий таймер
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      hoverTimeout = null
    }
    
    // Показываем тултип с небольшой задержкой
    hoverTimeout = setTimeout(() => {
      showContextTooltip.value = true
      showWarning.value = false
    }, 100)
  }
}

const handleMouseLeave = () => {
  if (!isMobile.value) {
    // Очищаем таймер показа
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      hoverTimeout = null
    }
    
    // Скрываем тултип с небольшой задержкой
    hoverTimeout = setTimeout(() => {
      showContextTooltip.value = false
    }, 100)
  }
}

const handleClickOutside = (event) => {
  // Only handle on mobile
  if (isMobile.value && showContextTooltip.value) {
    const contextButton = event.target.closest('[data-context-indicator]')
    if (!contextButton) {
      showContextTooltip.value = false
    }
  }
}

// Watch for near limit state changes to show warning
watch(() => props.isNearLimit, (newValue, oldValue) => {
  // Show warning when reaching near limit and not already shown
  if (newValue && !oldValue && !showContextTooltip.value) {
    showWarning.value = true
  }
  
  // Hide warning when going back to normal
  if (!newValue && oldValue) {
    showWarning.value = false
  }
})

// Hide warning when user starts typing
watch(() => messageInput.value, () => {
  if (messageInput.value && showWarning.value) {
    showWarning.value = false
  }
})

const handleSend = () => {
  if (messageInput.value.trim()) {
    // Hide warning when sending message
    showWarning.value = false
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

const handleGlobalKeydown = (event) => {
  // Проверяем, что фокус не на поле ввода
  if (document.activeElement !== inputRef.value) {
    // Игнорируем специальные клавиши
    const ignoredKeys = [
      'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'Alt', 'Control', 'Meta', 'Shift', 'CapsLock', 'NumLock', 'ScrollLock',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete',
      'PrintScreen', 'Pause', 'ContextMenu'
    ]
    
    // Проверяем, что это не комбинация клавиш с Ctrl, Alt или Meta
    const isModifierPressed = event.ctrlKey || event.altKey || event.metaKey
    
    // Если это обычная клавиша и не комбинация, устанавливаем фокус
    if (!isModifierPressed && !ignoredKeys.includes(event.key) && event.key.length === 1) {
      event.preventDefault()
      inputRef.value?.focus()
      // Если поле ввода пустое, добавляем введенный символ
      if (!messageInput.value) {
        messageInput.value = event.key
      }
    }
  }
}

const handleResize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 768 || 'ontouchstart' in window
  
  // Если изменился тип устройства, обновляем обработчики событий
  if (wasMobile !== isMobile.value) {
    if (isMobile.value) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  }
}

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
  
  // Определяем мобильное устройство
  isMobile.value = window.innerWidth < 768 || 'ontouchstart' in window
  
  // Добавляем глобальный обработчик клавиатуры
  document.addEventListener('keydown', handleGlobalKeydown)
  
  // Добавляем обработчик изменения размера окна
  window.addEventListener('resize', handleResize)
  
  // Добавляем обработчик кликов вне элемента для мобильных
  if (isMobile.value) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  // Убираем глобальный обработчик при размонтировании
  document.removeEventListener('keydown', handleGlobalKeydown)
  window.removeEventListener('resize', handleResize)
  
  // Убираем обработчик кликов
  document.removeEventListener('click', handleClickOutside)
  
  // Очищаем таймеры
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
})
</script>

<style scoped>
/* Context Warning Container */
.context-warning-container {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

/* Context Tooltip Container */
.context-tooltip-container {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

/* Context Warning Dialog Styles */
.context-warning-dialog {
  background: linear-gradient(135deg, rgba(180, 83, 9, 0.95) 0%, rgba(146, 64, 14, 0.95) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 8px;
  padding: 10px 12px;
  min-width: 200px;
  max-width: 260px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
  animation: slideInUp 0.3s ease-out;
  position: relative;
}

.warning-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.warning-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: #fbbf24;
  margin-top: 1px;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 13px;
  font-weight: 600;
  color: #fef3c7;
  margin: 0 0 3px 0;
  line-height: 1.3;
}

.warning-text {
  font-size: 11px;
  color: rgba(254, 243, 199, 0.9);
  line-height: 1.4;
  margin: 0;
}

.warning-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(251, 191, 36, 0.4);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Context Tooltip Styles */
.context-tooltip {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 200px;
  max-width: 280px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  width: max-content;
}

.tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.tooltip-title {
  font-size: 14px;
  color: white;
  font-weight: 500;
  flex-shrink: 0;
}

.tooltip-status {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  flex-shrink: 0;
  white-space: nowrap;
}

.status-normal {
  @apply bg-green-500/20 text-green-300 border border-green-500/30;
}

.status-warning {
  @apply bg-yellow-500/20 text-yellow-300 border border-yellow-500/30;
}

.status-danger {
  @apply bg-red-500/20 text-red-300 border border-red-500/30;
}

.tooltip-content {
  @apply space-y-1;
}

.tooltip-item {
  @apply flex justify-between items-center;
  @apply text-xs;
}

.tooltip-label {
  @apply text-white/70;
}

.tooltip-value {
  @apply text-white font-mono font-medium;
}

.tooltip-arrow {
  @apply absolute top-full left-1/2 -translate-x-1/2;
  @apply w-0 h-0;
  @apply border-l-[6px] border-r-[6px] border-t-[6px];
  @apply border-l-transparent border-r-transparent border-t-white/20;
}

/* Very small mobile screens */
@media (max-width: 375px) {
  .context-tooltip {
    min-width: 160px;
    max-width: 220px;
    padding: 8px 10px;
  }
  
  .tooltip-header {
    gap: 4px;
  }
  
  .tooltip-title {
    font-size: 11px;
  }
  
  .tooltip-status {
    font-size: 8px;
    padding: 1px 4px;
  }
}

/* Mobile optimizations to prevent flickering */
@media (max-width: 640px) {
  .backdrop-blur-77 {
    backdrop-filter: blur(20px);
  }
  
  /* Reduce transition complexity on mobile */
  .transition-opacity {
    transition: opacity 0.2s ease;
  }
  
  .context-warning-container {
    left: auto;
    right: 0;
    transform: none;
  }
  
  .context-tooltip-container {
    left: auto;
    right: 0;
    transform: none;
  }
  
  .context-warning-dialog {
    min-width: 180px;
    max-width: 220px;
    padding: 8px 10px;
    margin-bottom: 8px;
  }
  
  .warning-header {
    gap: 6px;
  }
  
  .warning-icon {
    width: 14px;
    height: 14px;
  }
  
  .warning-title {
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .warning-text {
    font-size: 10px;
    line-height: 1.3;
  }
  
  .context-tooltip {
    min-width: 180px;
    max-width: 260px;
    padding: 10px 12px;
  }
  
  .tooltip-header {
    gap: 6px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tooltip-title {
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .tooltip-status {
    font-size: 9px;
    padding: 2px 5px;
    align-self: flex-start;
  }
}

/* Tablet styles */
@media (min-width: 640px) and (max-width: 1024px) {
  .context-tooltip {
    min-width: 200px;
    max-width: 280px;
    padding: 11px 14px;
  }
  
  .tooltip-header {
    gap: 10px;
    flex-direction: row;
    align-items: center;
  }
  
  .tooltip-title {
    font-size: 13px;
    margin-bottom: 0;
  }
  
  .tooltip-status {
    font-size: 11px;
    padding: 3px 7px;
  }
}

/* Large desktop styles */
@media (min-width: 1440px) {
  .context-tooltip {
    min-width: 220px;
    max-width: 320px;
    padding: 14px 18px;
  }
  
  .tooltip-header {
    gap: 14px;
  }
  
  .tooltip-title {
    font-size: 15px;
  }
  
  .tooltip-status {
    font-size: 12px;
    padding: 5px 10px;
  }
}
</style>
