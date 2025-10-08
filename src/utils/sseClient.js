// Server-Sent Events client for streaming responses using fetch
export class SSEClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL
    this.options = {
      timeout: 30000, // 30 seconds default timeout
      retryDelay: 1000, // 1 second retry delay
      maxRetries: 3,
      ...options
    }
    this.controller = null
    this.reader = null
    this.isConnected = false
    this.listeners = new Map()
    this.decoder = new TextDecoder()
  }

  // Connect to SSE endpoint with custom headers and payload
  connect(endpoint, headers = {}, payload = null) {
    return new Promise((resolve, reject) => {
      try {
        // Close existing connection if any
        this.disconnect()

        // Build full URL
        const url = `${this.baseURL}${endpoint}`
        
        // Create AbortController for cancellation
        this.controller = new AbortController()
        
        // Set up timeout
        const timeoutId = setTimeout(() => {
          if (!this.isConnected) {
            this.controller?.abort()
            reject(new Error('SSE connection timeout'))
          }
        }, this.options.timeout)

        // Prepare request options
        const requestOptions = {
          method: 'POST', // Use POST for Letta streaming API
          headers: {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...headers
          },
          signal: this.controller.signal
        }

        // Add payload if provided
        if (payload) {
          requestOptions.body = JSON.stringify(payload)
        }

        // Make fetch request with custom headers
        fetch(url, requestOptions)
        .then(response => {
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          if (!response.body) {
            throw new Error('Response body is null')
          }

          this.isConnected = true
          console.log('SSE connection opened via fetch')
          
          // Start reading the stream
          this.reader = response.body.getReader()
          this.processStream()
          
          resolve(response)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          console.error('SSE connection error:', error)
          this.isConnected = false
          reject(error)
        })

      } catch (error) {
        console.error('Failed to create SSE connection:', error)
        reject(error)
      }
    })
  }

  // Process the streaming response
  async processStream() {
    try {
      while (this.isConnected && this.reader) {
        const { done, value } = await this.reader.read()
        
        if (done) {
          console.log('SSE stream ended naturally')
          this.isConnected = false
          
          // Trigger 'done' event when stream ends
          const doneCallbacks = this.listeners.get('done') || []
          doneCallbacks.forEach(callback => {
            try {
              callback('[DONE]', { type: 'done' })
            } catch (callbackError) {
              console.error('Error in done callback:', callbackError)
            }
          })
          
          break
        }

        // Decode the chunk
        const chunk = this.decoder.decode(value, { stream: true })
        
        // Process SSE events
        this.parseSSEEvents(chunk)
      }
    } catch (error) {
      console.error('Error processing SSE stream:', error)
      this.isConnected = false
      
      // Trigger error event
      const errorCallbacks = this.listeners.get('error') || []
      errorCallbacks.forEach(callback => {
        try {
          callback({ error: error.message }, { type: 'error' })
        } catch (callbackError) {
          console.error('Error in error callback:', callbackError)
        }
      })
    } finally {
      // Always ensure we're marked as disconnected
      if (this.isConnected) {
        console.log('SSE stream processing complete, marking as disconnected')
        this.isConnected = false
      }
    }
  }

  // Parse SSE events from chunk
  parseSSEEvents(chunk) {
    const lines = chunk.split('\n')
    let eventType = 'message'
    let data = ''
    let id = ''
    let retry = ''

    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (trimmedLine === '') {
        // Empty line indicates end of event
        if (data) {
          this.emitEvent(eventType, data, id, retry)
        }
        // Reset for next event
        eventType = 'message'
        data = ''
        id = ''
        retry = ''
      } else if (trimmedLine.startsWith('event:')) {
        eventType = trimmedLine.substring(6).trim()
      } else if (trimmedLine.startsWith('data:')) {
        data += trimmedLine.substring(5).trim() + '\n'
      } else if (trimmedLine.startsWith('id:')) {
        id = trimmedLine.substring(3).trim()
      } else if (trimmedLine.startsWith('retry:')) {
        retry = trimmedLine.substring(6).trim()
      }
    }
  }

  // Emit SSE event to listeners
  emitEvent(eventType, data, id, retry) {
    const callbacks = this.listeners.get(eventType) || []
    
    // Try to parse JSON data
    let parsedData = data.trim()
    try {
      parsedData = JSON.parse(parsedData)
    } catch (parseError) {
      // Keep as string if not JSON
    }

    const event = {
      type: eventType,
      data: parsedData,
      id,
      retry
    }

    callbacks.forEach(callback => {
      try {
        callback(parsedData, event)
      } catch (error) {
        console.error('Error in SSE event handler:', error)
      }
    })
  }

  // Add event listener
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType).push(callback)
  }

  // Remove event listener
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return

    const callbacks = this.listeners.get(eventType)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }

    if (callbacks.length === 0) {
      this.listeners.delete(eventType)
    }
  }

  // Disconnect and cleanup
  disconnect() {
    this.isConnected = false
    
    if (this.reader) {
      try {
        this.reader.cancel()
      } catch (error) {
        // Ignore cancellation errors
        console.log('Reader cancellation error (ignored):', error.message)
      }
      this.reader = null
    }
    
    if (this.controller) {
      try {
        this.controller.abort()
      } catch (error) {
        // Ignore abort errors
        console.log('Controller abort error (ignored):', error.message)
      }
      this.controller = null
    }
    
    this.listeners.clear()
  }

  // Get connection state
  get readyState() {
    return this.isConnected ? 1 : 0 // OPEN : CLOSED
  }
}

// Helper function to create SSE client with authentication
export function createAuthenticatedSSEClient(baseURL, token, options = {}) {
  const client = new SSEClient(baseURL, options)
  
  // Override connect method to add Authorization header
  const originalConnect = client.connect.bind(client)
  
  client.connect = (endpoint, headers = {}, payload = null) => {
    // Add Authorization header with Bearer token
    const authenticatedHeaders = {
      'Authorization': `Bearer ${token}`,
      ...headers
    }
    
    console.log('Connecting to SSE endpoint with auth:', endpoint)
    console.log('Payload:', payload)
    return originalConnect(endpoint, authenticatedHeaders, payload)
  }
  
  return client
}

// Helper function to parse SSE data
export function parseSSEData(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (error) {
      return { content: data }
    }
  }
  return data
}

// Helper function to handle SSE errors gracefully
export function handleSSEError(error, retryCallback = null, maxRetries = 3) {
  console.error('SSE Error:', error)
  
  if (retryCallback && maxRetries > 0) {
    console.log(`Retrying SSE connection... (${maxRetries} attempts left)`)
    setTimeout(() => {
      retryCallback()
    }, 1000)
  }
}
