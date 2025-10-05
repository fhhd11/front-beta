<template>
  <div class="context-indicator" v-if="contextUsage">
    <!-- Context Info Panel -->
    <div class="context-info-panel">
      <div class="info-header">
        <div class="info-title">Контекстное окно</div>
        <div class="info-status" :class="{ 'warning': isNearLimit, 'danger': isAtLimit }">
          {{ statusText }}
        </div>
      </div>
      
      <div class="info-content">
        <div class="info-item">
          <span class="info-label">Использовано:</span>
          <span class="info-value">{{ contextUsage.current.toLocaleString() }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Лимит:</span>
          <span class="info-value">{{ contextUsage.max.toLocaleString() }}</span>
        </div>
        <div class="info-item" v-if="memoryStats">
          <span class="info-label">Сообщения:</span>
          <span class="info-value">{{ memoryStats.messages }}</span>
        </div>
        <div class="info-item" v-if="memoryStats && memoryStats.system > 0">
          <span class="info-label">Система:</span>
          <span class="info-value">{{ memoryStats.system.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :class="{ 
            'near-limit': isNearLimit,
            'at-limit': isAtLimit
          }"
          :style="{ width: `${contextUsage.percentage}%` }"
        ></div>
        <div class="progress-text">{{ contextUsage.percentage }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  contextUsage: {
    type: Object,
    required: true
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
  showDetails: {
    type: Boolean,
    default: false
  }
})

// Status text based on usage
const statusText = computed(() => {
  if (props.isAtLimit) return 'Критично'
  if (props.isNearLimit) return 'Предупреждение'
  return 'Норма'
})

// No additional lifecycle hooks needed for this component
</script>

<style scoped>
.context-indicator {
  @apply w-64;
}

.context-info-panel {
  @apply w-full;
  @apply bg-black/20 backdrop-blur-sm;
  @apply border border-white/10 rounded-lg;
  @apply p-4;
}

.info-header {
  @apply flex items-center justify-between;
  @apply mb-4;
}

.info-title {
  @apply text-sm text-white font-medium;
}

.info-status {
  @apply text-xs px-2 py-1 rounded-full;
  @apply bg-green-500/20 text-green-300 border border-green-500/30;
}

.info-status.warning {
  @apply bg-yellow-500/20 text-yellow-300 border border-yellow-500/30;
}

.info-status.danger {
  @apply bg-red-500/20 text-red-300 border border-red-500/30;
}

.info-content {
  @apply space-y-3 mb-4;
}

.info-item {
  @apply flex justify-between items-center;
  @apply text-sm;
}

.info-label {
  @apply text-white/70;
}

.info-value {
  @apply text-white font-mono font-medium;
}

.progress-bar {
  @apply relative w-full h-3;
  @apply bg-white/10 rounded-full;
  @apply overflow-hidden;
}

.progress-fill {
  @apply h-full;
  @apply bg-gradient-to-r from-blue-400 to-green-400;
  @apply transition-all duration-500 ease-out;
  @apply rounded-full;
}

.progress-fill.near-limit {
  @apply from-yellow-400 to-orange-400;
}

.progress-fill.at-limit {
  @apply from-red-400 to-red-600;
}

.progress-text {
  @apply absolute inset-0;
  @apply flex items-center justify-center;
  @apply text-xs text-white/90 font-mono font-medium;
  @apply pointer-events-none;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .context-indicator {
    @apply w-56;
  }
  
  .context-info-panel {
    @apply p-3;
  }
  
  .info-title {
    @apply text-xs;
  }
  
  .info-item {
    @apply text-xs;
  }
  
  .progress-bar {
    @apply h-2;
  }
  
  .progress-text {
    @apply text-[10px];
  }
}
</style>
