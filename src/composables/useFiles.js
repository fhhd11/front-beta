import { ref, computed } from 'vue'
import { filesApi, fileUtils } from '../api/files.js'
import { useAuth } from './useAuth.js'

/**
 * Composable for managing user files and folders
 */
export function useFiles() {
  const { user } = useAuth()
  
  // State
  const userSource = ref(null)
  const files = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)
  const isUploading = ref(false)

  // Computed
  const hasFiles = computed(() => files.value.length > 0)
  const sortedFiles = computed(() => {
    return [...files.value].sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at)
    })
  })

  /**
   * Get or create user source (file storage)
   * Source name is based on user ID
   */
  const ensureUserSource = async () => {
    if (!user.value?.id) {
      throw new Error('User not authenticated')
    }

    try {
      isLoading.value = true
      error.value = null

      const sourceName = `user_${user.value.id}_files`

      // Try to get existing source
      const { data: existingSource, error: getError } = await filesApi.getSourceByName(sourceName)

      if (existingSource && !getError) {
        userSource.value = existingSource
        return existingSource
      }

      // Create new source if it doesn't exist
      const { data: newSource, error: createError } = await filesApi.createSource({
        name: sourceName,
        description: `File storage for user ${user.value.id}`,
        metadata: {
          user_id: user.value.id,
          created_by: 'file_manager'
        }
      })

      if (createError) {
        throw new Error(createError)
      }

      userSource.value = newSource
      return newSource

    } catch (err) {
      console.error('Error ensuring user source:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load files from user source
   */
  const loadFiles = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Ensure source exists
      const source = await ensureUserSource()

      // Get files from source
      const { data: sourceFiles, error: filesError } = await filesApi.getSourceFiles(source.id)

      if (filesError) {
        throw new Error(filesError)
      }

      files.value = sourceFiles || []

    } catch (err) {
      console.error('Error loading files:', err)
      error.value = err.message
      files.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upload file to user source
   */
  const uploadFile = async (file) => {
    try {
      isUploading.value = true
      uploadProgress.value = 0
      error.value = null

      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      // Check file size (10MB max)
      if (!fileUtils.isValidFileSize(file, 10)) {
        throw new Error('File size exceeds 10MB limit')
      }

      // Ensure source exists
      const source = await ensureUserSource()

      // Simulate progress (since we don't have real progress)
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10
        }
      }, 200)

      // Upload file
      const { data: uploadedFile, error: uploadError } = await filesApi.uploadFile(
        source.id,
        file,
        {
          metadata: {
            original_name: file.name,
            size: file.size,
            type: file.type,
            uploaded_at: new Date().toISOString()
          }
        }
      )

      clearInterval(progressInterval)
      uploadProgress.value = 100

      if (uploadError) {
        throw new Error(uploadError)
      }

      // Reload files list
      await loadFiles()

      return uploadedFile

    } catch (err) {
      console.error('Error uploading file:', err)
      error.value = err.message
      throw err
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  /**
   * Delete file from user source
   */
  const deleteFile = async (fileId) => {
    try {
      isLoading.value = true
      error.value = null

      if (!userSource.value) {
        await ensureUserSource()
      }

      const { error: deleteError } = await filesApi.deleteFile(userSource.value.id, fileId)

      if (deleteError) {
        throw new Error(deleteError)
      }

      // Remove from local list
      files.value = files.value.filter(f => f.id !== fileId)

    } catch (err) {
      console.error('Error deleting file:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Attach user source to agent
   */
  const attachToAgent = async (agentId) => {
    try {
      error.value = null

      if (!userSource.value) {
        await ensureUserSource()
      }

      const { error: attachError } = await filesApi.attachSourceToAgent(
        agentId,
        userSource.value.id
      )

      if (attachError) {
        throw new Error(attachError)
      }

      return true

    } catch (err) {
      console.error('Error attaching source to agent:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * Detach user source from agent
   */
  const detachFromAgent = async (agentId) => {
    try {
      error.value = null

      if (!userSource.value) {
        return true // Nothing to detach
      }

      const { error: detachError } = await filesApi.detachSourceFromAgent(
        agentId,
        userSource.value.id
      )

      if (detachError) {
        throw new Error(detachError)
      }

      return true

    } catch (err) {
      console.error('Error detaching source from agent:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * Get file metadata
   */
  const getFileMetadata = async (fileId) => {
    try {
      error.value = null

      if (!userSource.value) {
        await ensureUserSource()
      }

      const { data: metadata, error: metadataError } = await filesApi.getFileMetadata(
        userSource.value.id,
        fileId
      )

      if (metadataError) {
        throw new Error(metadataError)
      }

      return metadata

    } catch (err) {
      console.error('Error getting file metadata:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * Clear all files (for cleanup)
   */
  const clearFiles = () => {
    files.value = []
    userSource.value = null
    error.value = null
  }

  return {
    // State
    userSource,
    files,
    sortedFiles,
    isLoading,
    error,
    uploadProgress,
    isUploading,
    hasFiles,

    // Methods
    ensureUserSource,
    loadFiles,
    uploadFile,
    deleteFile,
    attachToAgent,
    detachFromAgent,
    getFileMetadata,
    clearFiles,

    // Utils
    formatFileSize: fileUtils.formatFileSize,
    getFileExtension: fileUtils.getFileExtension
  }
}

