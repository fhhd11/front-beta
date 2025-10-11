import { apiClient } from './client.js'

/**
 * Files API service for Letta folders and files management
 * Based on Letta API documentation: https://docs.letta.com/api-reference/overview
 */
export const filesApi = {
  // ==================== Folders API ====================
  
  /**
   * Get list of folders
   * GET /api/v1/folders
   */
  async getFolders(options = {}) {
    try {
      const {
        limit = 100,
        offset = 0,
        order = 'desc',
        order_by = 'created_at'
      } = options

      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (offset) params.append('offset', offset.toString())
      if (order) params.append('order', order)
      if (order_by) params.append('order_by', order_by)

      const queryString = params.toString()
      // Don't add trailing slash when there are query params to avoid 307 redirect
      const endpoint = queryString
        ? `/api/v1/letta/folders?${queryString}`
        : `/api/v1/letta/folders/`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data: data || [],
        error: null
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
      return {
        data: [],
        error: error.message || 'Failed to fetch folders'
      }
    }
  },

  /**
   * Get folder by ID
   * GET /api/v1/folders/{folder_id}
   */
  async getFolder(folderId) {
    try {
      // Don't use trailing slash for GET - causes 307 redirect
      const endpoint = `/api/v1/letta/folders/${folderId}`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error fetching folder:', error)
      return {
        data: null,
        error: error.message || 'Failed to fetch folder'
      }
    }
  },

  /**
   * Get folder by name
   * GET /api/v1/folders/name/{folder_name}
   */
  async getFolderByName(folderName) {
    try {
      // Don't use trailing slash for GET - causes 307 redirect
      const endpoint = `/api/v1/letta/folders/name/${encodeURIComponent(folderName)}`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error fetching folder by name:', error)
      return {
        data: null,
        error: error.message || 'Failed to fetch folder'
      }
    }
  },

  /**
   * Create a new folder
   * POST /api/v1/folders
   */
  async createFolder(folderData) {
    try {
      const {
        name,
        description = '',
        metadata = {}
      } = folderData

      if (!name) {
        throw new Error('Folder name is required')
      }

      const payload = {
        name,
        description,
        metadata
      }

      // Use trailing slash for POST to avoid 307 redirect
      const endpoint = `/api/v1/letta/folders/`
      
      const { data, error } = await apiClient.post(endpoint, payload)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      return {
        data: null,
        error: error.message || 'Failed to create folder'
      }
    }
  },

  /**
   * Update folder
   * PATCH /api/v1/folders/{folder_id}
   */
  async updateFolder(folderId, updates) {
    try {
      // Use trailing slash for PATCH to avoid 307 redirect
      const endpoint = `/api/v1/letta/folders/${folderId}/`
      
      const { data, error } = await apiClient.patch(endpoint, updates)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error updating folder:', error)
      return {
        data: null,
        error: error.message || 'Failed to update folder'
      }
    }
  },

  /**
   * Delete folder
   * DELETE /api/v1/folders/{folder_id}
   */
  async deleteFolder(folderId) {
    try {
      // Don't use trailing slash for DELETE - causes 401 (inconsistent Letta API behavior)
      const endpoint = `/api/v1/letta/folders/${folderId}`
      
      const { data, error } = await apiClient.delete(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      return {
        data: null,
        error: error.message || 'Failed to delete folder'
      }
    }
  },

  // ==================== Sources API (for files) ====================
  
  /**
   * Get sources (file storage) list
   * GET /api/v1/sources
   */
  async getSources(options = {}) {
    try {
      const {
        limit = 100,
        offset = 0,
        order = 'desc',
        order_by = 'created_at'
      } = options

      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (offset) params.append('offset', offset.toString())
      if (order) params.append('order', order)
      if (order_by) params.append('order_by', order_by)

      const queryString = params.toString()
      // Don't add trailing slash when there are query params to avoid 307 redirect
      const endpoint = queryString
        ? `/api/v1/letta/sources?${queryString}`
        : `/api/v1/letta/sources/`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data: data || [],
        error: null
      }
    } catch (error) {
      console.error('Error fetching sources:', error)
      return {
        data: [],
        error: error.message || 'Failed to fetch sources'
      }
    }
  },

  /**
   * Create a source (storage for files)
   * POST /api/v1/sources
   */
  async createSource(sourceData) {
    try {
      const {
        name,
        description = '',
        metadata = {},
        embedding_config = null
      } = sourceData

      if (!name) {
        throw new Error('Source name is required')
      }

      // Don't specify embedding_config - inherit from agent settings
      // This ensures the source uses the same embedding endpoint (proxy) as the agent
      const payload = {
        name,
        description,
        metadata
      }
      
      // Only add embedding_config if explicitly provided
      if (embedding_config) {
        payload.embedding_config = embedding_config
      }

      // Use trailing slash for POST to avoid 307 redirect
      const endpoint = `/api/v1/letta/sources/`
      
      const { data, error } = await apiClient.post(endpoint, payload)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error creating source:', error)
      return {
        data: null,
        error: error.message || 'Failed to create source'
      }
    }
  },

  /**
   * Get source by name
   * GET /api/v1/sources/name/{source_name}
   */
  async getSourceByName(sourceName) {
    try {
      // Don't use trailing slash for GET - causes 307 redirect
      const endpoint = `/api/v1/letta/sources/name/${encodeURIComponent(sourceName)}`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error fetching source by name:', error)
      return {
        data: null,
        error: error.message || 'Failed to fetch source'
      }
    }
  },

  // ==================== Files API ====================
  
  /**
   * Get files in a folder
   * GET /api/v1/folders/{folder_id}/files
   */
  async getFolderFiles(folderId, options = {}) {
    try {
      const {
        limit = 100,
        offset = 0
      } = options

      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (offset) params.append('offset', offset.toString())

      const queryString = params.toString()
      // Don't add trailing slash when there are query params to avoid 307 redirect
      const endpoint = queryString
        ? `/api/v1/letta/folders/${folderId}/files?${queryString}`
        : `/api/v1/letta/folders/${folderId}/files/`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data: data || [],
        error: null
      }
    } catch (error) {
      console.error('Error fetching folder files:', error)
      return {
        data: [],
        error: error.message || 'Failed to fetch folder files'
      }
    }
  },

  /**
   * Get files from a source
   * GET /api/v1/sources/{source_id}/files
   */
  async getSourceFiles(sourceId, options = {}) {
    try {
      const {
        limit = 100,
        offset = 0
      } = options

      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (offset) params.append('offset', offset.toString())

      const queryString = params.toString()
      // Don't add trailing slash when there are query params to avoid 307 redirect
      const endpoint = queryString 
        ? `/api/v1/letta/sources/${sourceId}/files?${queryString}`
        : `/api/v1/letta/sources/${sourceId}/files/`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data: data || [],
        error: null
      }
    } catch (error) {
      console.error('Error fetching source files:', error)
      return {
        data: [],
        error: error.message || 'Failed to fetch source files'
      }
    }
  },

  /**
   * Upload file to a source
   * POST /api/v1/sources/{source_id}/upload
   */
  async uploadFile(sourceId, file, options = {}) {
    try {
      const {
        metadata = {}
      } = options

      const formData = new FormData()
      // Use 'file' as field name
      formData.append('file', file, file.name)
      
      console.log('Uploading file:', {
        sourceId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value: value instanceof File ? `File: ${value.name}` : value
        }))
      })

      // Don't use trailing slash for /upload endpoint - it causes 307 redirect
      const endpoint = `/api/v1/letta/sources/${sourceId}/upload`
      
      // Use special form data upload method
      const { data, error } = await apiClient.postFormData(endpoint, formData)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        data: null,
        error: error.message || 'Failed to upload file'
      }
    }
  },

  /**
   * Delete file from source
   * DELETE /api/v1/sources/{source_id}/{file_id}
   * Following Letta API pattern for folders: DELETE /v1/folders/{folder_id}/{file_id}
   */
  async deleteFile(sourceId, fileId) {
    try {
      // Use same pattern as folders - no /files/ in path, no trailing slash
      const endpoint = `/api/v1/letta/sources/${sourceId}/${fileId}`
      
      console.log('Deleting file:', { sourceId, fileId, endpoint })
      
      const { data, error } = await apiClient.delete(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        data: null,
        error: error.message || 'Failed to delete file'
      }
    }
  },

  /**
   * Get file metadata
   * GET /api/v1/sources/{source_id}/files/{file_id}
   */
  async getFileMetadata(sourceId, fileId) {
    try {
      // Don't use trailing slash for GET - causes 307 redirect
      const endpoint = `/api/v1/letta/sources/${sourceId}/files/${fileId}`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error fetching file metadata:', error)
      return {
        data: null,
        error: error.message || 'Failed to fetch file metadata'
      }
    }
  },

  /**
   * Attach source to agent
   * PATCH /api/v1/agents/{agent_id}/sources/attach/{source_id}
   */
  async attachSourceToAgent(agentId, sourceId) {
    try {
      // Use /attach/ endpoint with PATCH method (following Letta API pattern for folders)
      const endpoint = `/api/v1/letta/agents/${agentId}/sources/attach/${sourceId}`
      
      const { data, error } = await apiClient.patch(endpoint, {})
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error attaching source to agent:', error)
      return {
        data: null,
        error: error.message || 'Failed to attach source to agent'
      }
    }
  },

  /**
   * Detach source from agent
   * PATCH /api/v1/agents/{agent_id}/sources/detach/{source_id}
   */
  async detachSourceFromAgent(agentId, sourceId) {
    try {
      // Use /detach/ endpoint with PATCH method (following Letta API pattern for folders)
      const endpoint = `/api/v1/letta/agents/${agentId}/sources/detach/${sourceId}`
      
      const { data, error} = await apiClient.patch(endpoint, {})
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error detaching source from agent:', error)
      return {
        data: null,
        error: error.message || 'Failed to detach source from agent'
      }
    }
  },

  /**
   * Get agent details (including embedding_config)
   * GET /api/v1/agents/{agent_id}
   */
  async getAgent(agentId) {
    try {
      // Don't use trailing slash for GET - causes 307 redirect
      const endpoint = `/api/v1/letta/agents/${agentId}`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error fetching agent details:', error)
      return {
        data: null,
        error: error.message || 'Failed to fetch agent details'
      }
    }
  },

  /**
   * Get sources attached to agent
   * GET /api/v1/agents/{agent_id}/sources
   */
  async getAgentSources(agentId) {
    try {
      // Don't use trailing slash for GET - causes 307 redirect
      const endpoint = `/api/v1/letta/agents/${agentId}/sources`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data: data || [],
        error: null
      }
    } catch (error) {
      console.error('Error fetching agent sources:', error)
      return {
        data: [],
        error: error.message || 'Failed to fetch agent sources'
      }
    }
  }
}

/**
 * Helper utilities for file operations
 */
export const fileUtils = {
  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  },

  /**
   * Get file extension
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
  },

  /**
   * Validate file type
   */
  isValidFileType(file, allowedTypes = []) {
    if (allowedTypes.length === 0) return true
    
    const extension = fileUtils.getFileExtension(file.name).toLowerCase()
    return allowedTypes.includes(extension)
  },

  /**
   * Validate file size
   */
  isValidFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }
}

