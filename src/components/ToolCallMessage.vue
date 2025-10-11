<template>
  <div class="tool-call-message">
    <!-- Tool Call Header -->
    <div class="tool-call-header">
      <div class="tool-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="tool-info">
        <span class="tool-name">{{ toolCall?.name || 'Unknown Tool' }}</span>
        <span class="tool-status" :class="statusClass">{{ statusText }}</span>
      </div>
      <button 
        v-if="canExpand"
        @click="toggleExpanded"
        class="expand-button"
        :class="{ expanded: isExpanded }"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Tool Details Container -->
    <div class="tool-details-container">
      <!-- Tool Arguments (if available) -->
      <transition name="expand">
        <div v-if="isExpanded && toolCall?.arguments" class="tool-arguments">
          <div class="arguments-header">
            <span class="arguments-label">Аргументы:</span>
          </div>
          <div class="arguments-content">
            <pre class="arguments-json">{{ formattedArguments }}</pre>
          </div>
        </div>
      </transition>

      <!-- Tool Return Value (animated) -->
      <div v-if="toolReturn && (toolReturn.toolReturn || toolReturn.originalToolReturnMessage?.status === 'success' || toolReturn.originalToolReturnMessage?.status === 'error')" class="tool-return" :class="{ expanded: isExpanded }">
        <!-- Return Header (only visible when expanded) -->
        <div class="return-header" :class="{ visible: isExpanded }">
          <span class="return-label">Результат: <span class="return-status" :class="returnStatusClass">{{ returnStatusText }}</span></span>
        </div>
        
        <!-- Return Content -->
        <div class="return-content">
          <transition name="content-slide" mode="out-in">
            <pre v-if="!isExpanded" key="collapsed" class="return-json">{{ truncatedReturn }}</pre>
            <pre v-else key="expanded" class="return-json">{{ formattedReturn }}</pre>
          </transition>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="toolReturn?.originalToolReturnMessage?.is_err || toolReturn?.originalToolReturnMessage?.status === 'error'" class="tool-error">
      <div class="error-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="error-text">Ошибка выполнения инструмента</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  toolCall: {
    type: Object,
    required: true
  },
  toolReturn: {
    type: Object,
    default: null
  },
  // For debugging - pass the full message objects
  toolCallMessage: {
    type: Object,
    default: null
  },
  toolReturnMessage: {
    type: Object,
    default: null
  }
})

const isExpanded = ref(false)

const canExpand = computed(() => {
  return props.toolCall && props.toolCall.arguments
})

const statusClass = computed(() => {
  if (props.toolReturn?.originalToolReturnMessage?.is_err || props.toolReturn?.originalToolReturnMessage?.status === 'error') return 'status-error'
  if (props.toolReturn?.originalToolReturnMessage?.status === 'success' || props.toolReturn?.toolReturn) return 'status-success'
  return 'status-pending'
})

const statusText = computed(() => {
  if (props.toolReturn?.originalToolReturnMessage?.is_err || props.toolReturn?.originalToolReturnMessage?.status === 'error') return 'Ошибка'
  if (props.toolReturn?.originalToolReturnMessage?.status === 'success' || props.toolReturn?.toolReturn) return 'Выполнено'
  return 'Выполняется...'
})

const returnStatusClass = computed(() => {
  if (props.toolReturn?.originalToolReturnMessage?.is_err || props.toolReturn?.originalToolReturnMessage?.status === 'error') return 'status-error'
  return 'status-success'
})

const returnStatusText = computed(() => {
  if (props.toolReturn?.originalToolReturnMessage?.is_err || props.toolReturn?.originalToolReturnMessage?.status === 'error') return 'Ошибка'
  return 'Успешно'
})

const formattedArguments = computed(() => {
  if (!props.toolCall?.arguments) return ''
  try {
    const parsed = typeof props.toolCall.arguments === 'string' 
      ? JSON.parse(props.toolCall.arguments) 
      : props.toolCall.arguments
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return props.toolCall.arguments
  }
})

const formattedReturn = computed(() => {
  // Check different possible locations for tool return data
  const toolReturnData = props.toolReturn?.toolReturn || props.toolReturn?.tool_return || props.toolReturn?.content || props.toolReturn
  if (!toolReturnData) return ''
  
  try {
    const parsed = typeof toolReturnData === 'string' 
      ? JSON.parse(toolReturnData) 
      : toolReturnData
    
    // Special formatting for web_search results
    if (parsed.query && parsed.results && Array.isArray(parsed.results)) {
      let formatted = `Запрос: ${parsed.query}\n\n`
      parsed.results.forEach((result, index) => {
        formatted += `${index + 1}. ${result.title}\n`
        if (result.summary) {
          formatted += `   ${result.summary.substring(0, 200)}${result.summary.length > 200 ? '...' : ''}\n`
        }
        formatted += `   URL: ${result.url}\n\n`
      })
      return formatted
    }
    
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return toolReturnData
  }
})

const truncatedReturn = computed(() => {
  const fullReturn = formattedReturn.value
  if (!fullReturn) return ''
  
  // Get first line and limit it to reasonable length
  const firstLine = fullReturn.split('\n')[0]
  if (firstLine.length <= 100) return firstLine
  return firstLine.substring(0, 100) + '...'
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.tool-call-message {
  @apply bg-white/5 border border-white/10 rounded-lg p-3 mb-2;
  @apply font-['Roboto_Mono'] text-sm;
}

.tool-call-header {
  @apply flex items-center gap-3;
}

.tool-icon {
  @apply text-blue-400 flex-shrink-0;
}

.tool-info {
  @apply flex-1 flex items-center justify-between;
}

.tool-name {
  @apply text-white font-medium;
}

.tool-status {
  @apply text-xs px-2 py-1 rounded-full;
}

.status-pending {
  @apply bg-yellow-500/20 text-yellow-300 border border-yellow-500/30;
}

.status-success {
  @apply bg-green-500/20 text-green-300 border border-green-500/30;
}

.status-error {
  @apply bg-red-500/20 text-red-300 border border-red-500/30;
}

.expand-button {
  @apply text-white/60 hover:text-white/80 transition-all duration-300 p-1;
  @apply flex-shrink-0;
}

.expand-button svg {
  @apply transition-transform duration-300;
}

.expand-button.expanded svg {
  @apply rotate-180;
}

.tool-details-container {
  @apply space-y-3;
}

.tool-arguments {
  @apply pt-3 border-t border-white/10;
}

.tool-return {
  @apply mt-2;
  transition: all 0.3s ease-in-out;
}

.tool-return.expanded {
  /* Additional styles for expanded state if needed */
}

.arguments-header {
  @apply flex items-center justify-between mb-2;
}

.return-header {
  @apply mb-2;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.return-header.visible {
  opacity: 1;
  max-height: 50px;
}

.arguments-label,
.return-label {
  @apply text-white/70 text-xs font-medium;
}

.return-status {
  @apply text-xs px-2 py-1 rounded-full;
}

.arguments-content,
.return-content {
  @apply bg-black/20 rounded p-2;
}

.return-content.collapsed {
  @apply overflow-hidden;
}

.arguments-json,
.return-json {
  @apply text-white/80 text-xs leading-relaxed;
  @apply overflow-x-auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.expanded-content {
  opacity: 1;
  max-height: none;
  transition: all 0.3s ease-in-out;
}

.collapsed-content {
  opacity: 1;
  max-height: none;
  transition: all 0.3s ease-in-out;
}

/* Animation styles */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
}

.expand-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.expand-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.content-fade-enter-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.content-fade-leave-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.content-fade-enter-to,
.content-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Smooth transition for content changes */
.return-content {
  position: relative;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.return-content.expanded {
  /* Additional styles for expanded state if needed */
}

.content-slide-enter-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.content-slide-leave-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.content-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.content-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.content-slide-enter-to,
.content-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.tool-error {
  @apply flex items-center gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded;
}

.error-icon {
  @apply text-red-400 flex-shrink-0;
}

.error-text {
  @apply text-red-300 text-xs;
}
</style>
