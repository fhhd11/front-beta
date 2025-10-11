import { ref, computed } from 'vue'
import { filesApi, fileUtils } from '../api/files.js'
import { useAuth } from './useAuth.js'
import { userApi } from '../api/user.js'

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
   * Attach source to agent if not already attached
   */
  const attachSourceToAgentIfNeeded = async (sourceId) => {
    try {
      // Get fresh user profile to ensure letta_agent_id is available
      const { data: profile, error: profileError } = await userApi.getMe()
      
      if (profileError || !profile) {
        console.warn('Could not get user profile for source attachment:', profileError)
        return
      }

      const agentId = profile.letta_agent_id
      
      if (!agentId) {
        console.warn('No agent ID in profile, skipping source attachment', { 
          hasProfile: !!profile, 
          userId: profile?.id,
          agentId: profile?.letta_agent_id 
        })
        return
      }

      console.log('Attaching source to agent:', { agentId, sourceId })

      // Check if source is already attached
      const { data: attachedSources, error: getError } = await filesApi.getAgentSources(agentId)
      
      if (!getError && attachedSources) {
        const isAttached = attachedSources.some(source => source.id === sourceId || source === sourceId)
        
        if (isAttached) {
          console.log('Source already attached to agent')
          return
        }
      }

      // Attach source to agent
      const { error: attachError } = await filesApi.attachSourceToAgent(agentId, sourceId)
      
      if (attachError) {
        console.error('Error attaching source to agent:', attachError)
        // Don't throw - source is created, attachment is optional
      } else {
        console.log('Source successfully attached to agent')
      }
    } catch (err) {
      console.error('Error in attachSourceToAgentIfNeeded:', err)
      // Don't throw - this is a non-critical operation
    }
  }

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

      console.log('getSourceByName result:', { existingSource, getError })

      if (existingSource && !getError) {
        console.log('Existing source found:', existingSource)
        
        // API returns just the source ID as a string, wrap it in an object
        const sourceObj = typeof existingSource === 'string' 
          ? { id: existingSource, name: sourceName }
          : existingSource
        
        userSource.value = sourceObj
        return sourceObj
      }

      // Get agent's embedding_config to use for the source
      let agentEmbeddingConfig = null
      
      // Get fresh user profile to ensure letta_agent_id is available
      const { data: profile, error: profileError } = await userApi.getMe()
      
      console.log('Getting agent embedding_config...', {
        hasProfile: !!profile,
        profileError,
        userId: profile?.id,
        agentId: profile?.letta_agent_id
      })
      
      if (profile?.letta_agent_id && !profileError) {
        const { data: agentData, error: agentError } = await filesApi.getAgent(profile.letta_agent_id)
        
        console.log('Agent data received:', {
          hasData: !!agentData,
          hasError: !!agentError,
          error: agentError,
          embeddingConfig: agentData?.embedding_config
        })
        
        if (agentData && !agentError) {
          agentEmbeddingConfig = agentData.embedding_config
          console.log('Using agent embedding_config:', agentEmbeddingConfig)
        } else {
          console.warn('Could not get agent embedding_config:', { agentError })
        }
      } else {
        console.warn('No letta_agent_id available, cannot get embedding_config', { profileError })
      }

      // Create new source if it doesn't exist
      const { data: newSource, error: createError } = await filesApi.createSource({
        name: sourceName,
        description: `File storage for user ${user.value.id}`,
        metadata: {
          user_id: user.value.id,
          created_by: 'file_manager'
        },
        embedding_config: agentEmbeddingConfig
      })

      if (createError) {
        // If source already exists (409 Conflict), try to get it again
        if (createError.includes('409') || createError.includes('Conflict') || createError.includes('already exists')) {
          console.log('Source already exists (409), fetching again...')
          const { data: retrySource, error: retryError } = await filesApi.getSourceByName(sourceName)
          
          if (retrySource && !retryError) {
            const sourceObj = typeof retrySource === 'string' 
              ? { id: retrySource, name: sourceName }
              : retrySource
            
            userSource.value = sourceObj
            return sourceObj
          }
        }
        
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

      console.log('Source from ensureUserSource:', source)
      console.log('Source ID:', source?.id)

      if (!source || !source.id) {
        throw new Error('Source ID is missing')
      }

      // Attach source to agent (when loading files, user is definitely loaded)
      await attachSourceToAgentIfNeeded(source.id)

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

      // Attach source to agent (after ensureUserSource, when user is definitely loaded)
      await attachSourceToAgentIfNeeded(source.id)

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

