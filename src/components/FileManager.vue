<template>
  <div class="file-manager">
    <!-- File Manager Button -->
    <button 
      @click="toggleMenu"
      :disabled="isDisabled"
      class="file-manager-button"
      :class="{ 'has-files': hasFiles }"
      title="Управление файлами"
    >
      <!-- Folder Icon -->
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
        <path 
          d="M3 8C3 6.89543 3.89543 6 5 6H9L11 8H19C20.1046 8 21 8.89543 21 10V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8Z" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :fill="hasFiles ? 'rgba(59, 130, 246, 0.2)' : 'none'"
        />
      </svg>
      
      <!-- File count badge -->
      <span v-if="hasFiles" class="file-count-badge">{{ files.length }}</span>
    </button>

    <!-- File Menu Dropdown -->
    <Transition name="slide-fade">
      <div v-if="isMenuOpen" class="file-menu" @click.stop>
        <!-- Menu Header -->
        <div class="menu-header">
          <h3 class="menu-title">Мои файлы</h3>
          <button @click="toggleMenu" class="close-button" title="Закрыть">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Upload Area -->
        <div class="upload-area">
          <input 
            ref="fileInput"
            type="file"
            @change="handleFileSelect"
            class="hidden-input"
            multiple
            :disabled="isUploading || isLoading"
          />
          
          <button 
            @click="triggerFileSelect"
            :disabled="isUploading || isLoading"
            class="upload-button"
          >
            <svg v-if="!isUploading" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
              <path d="M12 4V16M12 4L8 8M12 4L16 8M4 17V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V17" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
            <div v-else class="spinner"></div>
            <span>{{ isUploading ? 'Загрузка...' : 'Загрузить файлы' }}</span>
          </button>

          <!-- Upload Progress -->
          <div v-if="isUploading" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ error }}</span>
          <button @click="error = null" class="close-error">×</button>
        </div>

        <!-- Files List -->
        <div class="files-list">
          <!-- Loading State -->
          <div v-if="isLoading && !hasFiles" class="loading-state">
            <div class="spinner"></div>
            <span>Загрузка файлов...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="!hasFiles && !isLoading" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-lg">
              <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
            <p>Нет загруженных файлов</p>
            <p class="empty-hint">Загрузите файлы, чтобы агент мог работать с ними</p>
          </div>

          <!-- Files Grid -->
          <div v-else class="files-grid">
            <div 
              v-for="file in sortedFiles" 
              :key="file.id"
              class="file-item"
            >
              <div class="file-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              
              <div class="file-info">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <span v-if="file.size || file.file_size" class="file-size">
                    {{ formatFileSize(file.size || file.file_size) }}
                  </span>
                  <span v-if="file.created_at" class="file-date">
                    {{ formatDate(file.created_at) }}
                  </span>
                </div>
              </div>

              <button 
                @click="handleDeleteFile(file.id)"
                class="delete-button"
                title="Удалить файл"
                :disabled="isLoading"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Menu Footer -->
        <div v-if="hasFiles" class="menu-footer">
          <span class="file-count">Всего файлов: {{ files.length }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useFiles } from '../composables/useFiles.js'

const props = defineProps({
  isDisabled: {
    type: Boolean,
    default: false
  }
})

// File management
const {
  files,
  sortedFiles,
  isLoading,
  error,
  uploadProgress,
  isUploading,
  hasFiles,
  loadFiles,
  uploadFile,
  deleteFile,
  formatFileSize
} = useFiles()

// UI state
const isMenuOpen = ref(false)
const fileInput = ref(null)

// Toggle menu
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  
  // Load files when opening menu for the first time
  if (isMenuOpen.value && !hasFiles.value && !isLoading.value) {
    loadFiles()
  }
}

// Trigger file input
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// Handle file selection
const handleFileSelect = async (event) => {
  const selectedFiles = Array.from(event.target.files || [])
  
  if (selectedFiles.length === 0) return

  // Upload files one by one
  for (const file of selectedFiles) {
    try {
      await uploadFile(file)
    } catch (err) {
      console.error('Error uploading file:', err)
      // Continue with other files even if one fails
    }
  }

  // Clear input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Handle file deletion
const handleDeleteFile = async (fileId) => {
  if (!confirm('Вы уверены, что хотите удалить этот файл?')) {
    return
  }

  try {
    await deleteFile(fileId)
  } catch (err) {
    console.error('Error deleting file:', err)
  }
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин. назад`
  if (diffHours < 24) return `${diffHours} ч. назад`
  if (diffDays < 7) return `${diffDays} дн. назад`

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Close menu on click outside
const handleClickOutside = (event) => {
  const fileManager = event.target.closest('.file-manager')
  if (!fileManager && isMenuOpen.value) {
    isMenuOpen.value = false
  }
}

// Load files on mount
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.file-manager {
  position: relative;
  display: flex;
  align-items: center;
}

.file-manager-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.file-manager-button:hover:not(:disabled) {
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.1);
}

.file-manager-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.file-manager-button.has-files {
  color: rgb(59, 130, 246);
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.icon-lg {
  width: 48px;
  height: 48px;
  opacity: 0.3;
}

.file-count-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: rgb(59, 130, 246);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 8px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-menu {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 0;
  width: 320px;
  max-height: 480px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.close-button {
  padding: 4px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.upload-area {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.hidden-input {
  display: none;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: rgb(96, 165, 250);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.5);
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-progress {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgb(59, 130, 246);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 40px;
  text-align: right;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: none;
  border-right: none;
  color: rgb(248, 113, 113);
  font-size: 13px;
}

.close-error {
  margin-left: auto;
  padding: 0 4px;
  background: transparent;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-error:hover {
  opacity: 1;
}

.files-list {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
  max-height: 300px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  gap: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px !important;
  opacity: 0.7;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.files-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.file-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(96, 165, 250);
}

.file-icon svg {
  width: 24px;
  height: 24px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.file-size::after {
  content: '•';
  margin-left: 8px;
}

.delete-button {
  flex-shrink: 0;
  padding: 6px;
  background: transparent;
  border: none;
  color: rgba(239, 68, 68, 0.7);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-button:hover:not(:disabled) {
  color: rgb(239, 68, 68);
  background: rgba(239, 68, 68, 0.1);
}

.delete-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.delete-button svg {
  width: 16px;
  height: 16px;
}

.menu-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.file-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateY(10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(5px);
  opacity: 0;
}

/* Mobile styles */
@media (max-width: 640px) {
  .file-menu {
    width: 280px;
    max-height: 400px;
  }

  .files-list {
    max-height: 240px;
  }
}

/* Scrollbar styles */
.files-list::-webkit-scrollbar {
  width: 6px;
}

.files-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

