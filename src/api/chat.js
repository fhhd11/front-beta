import { apiClient } from './client.js'

// Chat API service for Letta integration
export const chatApi = {
  // Get message history for an agent
  async getMessages(agentId, options = {}) {
    try {
      const {
        before = null,
        after = null,
        limit = 100,
        order = 'desc',
        order_by = 'created_at',
        group_id = null,
        include_err = false
      } = options

      // Build query parameters (removed client-side tool-loop parameters)
      const params = new URLSearchParams()
      if (before) params.append('before', before)
      if (after) params.append('after', after)
      if (limit) params.append('limit', limit.toString())
      if (order) params.append('order', order)
      if (order_by) params.append('order_by', order_by)
      if (group_id) params.append('group_id', group_id)
      if (include_err !== undefined) params.append('include_err', include_err.toString())

      const queryString = params.toString()
      const endpoint = `/api/v1/letta/agents/${agentId}/messages${queryString ? `?${queryString}` : ''}`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data: data || [],
        error: null
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      return {
        data: [],
        error: error.message || 'Failed to fetch messages'
      }
    }
  },

  // Send a message to an agent (create a run)
  async sendMessage(agentId, message, options = {}) {
    try {
      const {
        group_id = null,
        stream = false
      } = options

      const payload = {
        input: message,
        ...(group_id && { group_id }),
        ...(stream && { stream })
      }

      const endpoint = `/api/v1/letta/agents/${agentId}/runs`
      
      const { data, error } = await apiClient.post(endpoint, payload)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return {
        data: null,
        error: error.message || 'Failed to send message'
      }
    }
  },

  // Send a message directly to messages endpoint (non-streaming)
  async sendMessageToMessages(agentId, message, options = {}) {
    try {
      const {
        group_id = null,
        max_steps = 50,
        include_return_message_types = null,
        enable_thinking = true,
        background = false
      } = options

      // Build query parameters (removed client-side tool-loop parameters)
      const params = new URLSearchParams()
      if (group_id) params.append('group_id', group_id)
      if (max_steps) params.append('max_steps', max_steps.toString())
      if (include_return_message_types) params.append('include_return_message_types', include_return_message_types.join(','))
      if (enable_thinking !== undefined) params.append('enable_thinking', enable_thinking.toString())
      if (background !== undefined) params.append('background', background.toString())

      const queryString = params.toString()
      const endpoint = `/api/v1/letta/agents/${agentId}/messages${queryString ? `?${queryString}` : ''}`

      // Prepare payload for non-streaming request
      const payload = {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: message
              }
            ]
          }
        ]
      }

      const { data, error } = await apiClient.post(endpoint, payload)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error sending message to messages endpoint:', error)
      return {
        data: null,
        error: error.message || 'Failed to send message'
      }
    }
  },

  // Send a message with streaming response using SSE
  async sendMessageStream(agentId, message, options = {}) {
    try {
      const {
        group_id = null,
        max_steps = 50,
        include_return_message_types = null,
        enable_thinking = true,
        stream_tokens = true,
        include_pings = false,
        background = false
      } = options

      // Build query parameters for SSE endpoint (removed client-side tool-loop parameters)
      const params = new URLSearchParams()
      if (group_id) params.append('group_id', group_id)
      if (max_steps) params.append('max_steps', max_steps.toString())
      if (include_return_message_types) params.append('include_return_message_types', include_return_message_types.join(','))
      if (enable_thinking !== undefined) params.append('enable_thinking', enable_thinking.toString())
      if (stream_tokens !== undefined) params.append('stream_tokens', stream_tokens.toString())
      if (include_pings !== undefined) params.append('include_pings', include_pings.toString())
      if (background !== undefined) params.append('background', background.toString())

      const queryString = params.toString()
      const endpoint = `/api/v1/letta/agents/${agentId}/messages/stream${queryString ? `?${queryString}` : ''}`

      // Prepare payload for streaming
      const payload = {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: message
              }
            ]
          }
        ]
      }

      // Return the endpoint and payload for SSE client to use
      return {
        endpoint,
        payload,
        error: null
      }
    } catch (error) {
      console.error('Error preparing streaming message:', error)
      return {
        endpoint: null,
        payload: null,
        error: error.message || 'Failed to prepare streaming message'
      }
    }
  },

  // Get a specific message by ID
  async getMessage(agentId, messageId) {
    try {
      const endpoint = `/api/v1/letta/agents/${agentId}/messages/${messageId}`
      
      const { data, error } = await apiClient.get(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error fetching message:', error)
      return {
        data: null,
        error: error.message || 'Failed to fetch message'
      }
    }
  },

  // Delete a message
  async deleteMessage(agentId, messageId) {
    try {
      const endpoint = `/api/v1/letta/agents/${agentId}/messages/${messageId}`
      
      const { data, error } = await apiClient.delete(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      return {
        data: null,
        error: error.message || 'Failed to delete message'
      }
    }
  },

  // Reset all messages for an agent
  async resetMessages(agentId, options = {}) {
    try {
      const {
        add_default_initial_messages = false
      } = options

      // Build query parameters
      const params = new URLSearchParams()
      if (add_default_initial_messages !== undefined) {
        params.append('add_default_initial_messages', add_default_initial_messages.toString())
      }

      const queryString = params.toString()
      const endpoint = `/api/v1/letta/agents/${agentId}/reset-messages${queryString ? `?${queryString}` : ''}`
      
      const { data, error } = await apiClient.patch(endpoint)
      
      if (error) {
        throw error
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      console.error('Error resetting messages:', error)
      return {
        data: null,
        error: error.message || 'Failed to reset messages'
      }
    }
  }
}

// Message types based on Letta API documentation
export const MessageTypes = {
  // System message
  SystemMessage: {
    id: 'string',
    date: 'string', // ISO 8601 format
    name: 'string',
    message_type: 'system_message',
    otid: 'string',
    sender_id: 'string',
    step_id: 'string',
    is_err: 'boolean',
    seq_id: 'number',
    run_id: 'string',
    content: 'string'
  },

  // User message
  UserMessage: {
    id: 'string',
    date: 'string',
    name: 'string',
    message_type: 'user_message',
    otid: 'string',
    sender_id: 'string',
    step_id: 'string',
    is_err: 'boolean',
    seq_id: 'number',
    run_id: 'string',
    content: 'string'
  },

  // Assistant message
  AssistantMessage: {
    id: 'string',
    date: 'string',
    name: 'string',
    message_type: 'assistant_message',
    otid: 'string',
    sender_id: 'string',
    step_id: 'string',
    is_err: 'boolean',
    seq_id: 'number',
    run_id: 'string',
    content: 'string'
  },

  // Reasoning message
  ReasoningMessage: {
    id: 'string',
    date: 'string',
    name: 'string',
    message_type: 'reasoning_message',
    otid: 'string',
    sender_id: 'string',
    step_id: 'string',
    is_err: 'boolean',
    seq_id: 'number',
    run_id: 'string',
    content: 'string',
    reasoning: 'string'
  },

  // Tool call message
  ToolCallMessage: {
    id: 'string',
    date: 'string',
    name: 'string',
    message_type: 'tool_call_message',
    otid: 'string',
    sender_id: 'string',
    step_id: 'string',
    is_err: 'boolean',
    seq_id: 'number',
    run_id: 'string',
    content: 'string'
  }
}

// Helper functions for message processing
export const messageUtils = {
  // Convert Letta message to our internal format
  convertToInternalFormat(lettaMessage) {
    // Skip system messages - they shouldn't be displayed in chat UI
    // System messages are internal Letta messages used for agent configuration
    if (lettaMessage.message_type === 'system_message') {
      return null
    }

    // Skip heartbeat messages and other system content disguised as user messages
    if (lettaMessage.content) {
      try {
        // Check if content is a JSON string containing system information
        const parsedContent = JSON.parse(lettaMessage.content)
        if (parsedContent.type === 'heartbeat' || 
            parsedContent.type === 'login' ||
            parsedContent.type === 'system_alert' ||
            parsedContent.reason?.includes('[This is an automated system message hidden from the user]')) {
          return null
        }
      } catch (e) {
        // If it's not JSON, check for other system message patterns
        if (lettaMessage.content.includes('[This is an automated system message hidden from the user]') ||
            lettaMessage.content.includes('"type": "heartbeat"') ||
            lettaMessage.content.includes('"type": "login"') ||
            lettaMessage.content.includes('"type": "system_alert"')) {
          return null
        }
      }
    }

    // Keep tool-related messages for display
    // if (lettaMessage.message_type === 'tool_call_message' || 
    //     lettaMessage.message_type === 'tool_return_message') {
    //   return null
    // }

    // Debug logging for tool messages only
    if (lettaMessage.message_type === 'tool_call_message') {
      console.log('Converting tool call message:', {
        id: lettaMessage.id,
        tool_call: lettaMessage.tool_call
      })
    }
    
    if (lettaMessage.message_type === 'tool_return_message') {
      console.log('Converting tool return message:', {
        id: lettaMessage.id,
        tool_return: lettaMessage.tool_return,
        tool_call_id: lettaMessage.tool_call_id
      })
    }

    const convertedMessage = {
      id: `${lettaMessage.id}-${lettaMessage.message_type}`, // Make ID unique by combining with message type
      originalId: lettaMessage.id, // Keep original ID for reference
      role: messageUtils.getRoleFromMessageType(lettaMessage.message_type),
      content: lettaMessage.content || '',
      reasoning: lettaMessage.reasoning || null,
      timestamp: new Date(lettaMessage.date),
      messageType: lettaMessage.message_type,
      senderId: lettaMessage.sender_id,
      stepId: lettaMessage.step_id,
      runId: lettaMessage.run_id,
      isError: lettaMessage.is_err,
      seqId: lettaMessage.seq_id
    }

    // Add tool-specific fields
    if (lettaMessage.message_type === 'tool_call_message') {
      convertedMessage.toolCall = lettaMessage.tool_call || null
      // Also store the full message for debugging
      convertedMessage.originalToolCallMessage = lettaMessage
    }
    
    if (lettaMessage.message_type === 'tool_return_message') {
      convertedMessage.toolReturn = lettaMessage.tool_return || null
      convertedMessage.toolCallId = lettaMessage.tool_call_id || null
      // Also store the full message for debugging
      convertedMessage.originalToolReturnMessage = lettaMessage
    }

    return convertedMessage
  },

  // Get role from message type
  getRoleFromMessageType(messageType) {
    switch (messageType) {
      case 'user_message':
        return 'user'
      case 'assistant_message':
      case 'reasoning_message':
        return 'agent'
      case 'system_message':
        return 'system'
      case 'tool_call_message':
      case 'tool_return_message':
        return 'tool'
      default:
        return 'unknown'
    }
  },

  // Filter messages by role
  filterByRole(messages, role) {
    return messages.filter(msg => messageUtils.getRoleFromMessageType(msg.message_type) === role)
  },

  // Sort messages by timestamp
  sortByTimestamp(messages, order = 'asc') {
    return [...messages].sort((a, b) => {
      const dateA = new Date(a.timestamp)
      const dateB = new Date(b.timestamp)
      return order === 'asc' ? dateA - dateB : dateB - dateA
    })
  },

  // Group related messages (reasoning + assistant + tool calls) and filter out empty content
  processMessages(messages) {
    const processed = []
    let currentAgentGroup = null
    let currentToolCalls = []

    for (const message of messages) {
      
      // Skip messages with empty content (except reasoning and tool messages)
      if (!message.content && 
          message.messageType !== 'reasoning_message' && 
          message.messageType !== 'tool_call_message' && 
          message.messageType !== 'tool_return_message') {
        console.log('Skipping empty message:', message.messageType)
        continue
      }

      // If this is a user message, finalize current agent group and start fresh
      if (message.role === 'user') {
        if (currentAgentGroup) {
          processed.push(currentAgentGroup)
          currentAgentGroup = null
          currentToolCalls = []
        }
        processed.push(message)
        continue
      }

      // All agent-related messages (reasoning, tool calls, assistant) go into one group
      if (message.role === 'agent' || 
          message.messageType === 'reasoning_message' || 
          message.messageType === 'tool_call_message' || 
          message.messageType === 'tool_return_message' || 
          message.messageType === 'assistant_message') {
        
        // Create agent group if it doesn't exist
        if (!currentAgentGroup) {
          currentAgentGroup = {
            id: message.id,
            role: 'agent',
            blocks: [], // Array to store all blocks in order
            timestamp: message.timestamp,
            messageType: 'grouped'
          }
        }

        // Add different message types to the group in order
        if (message.messageType === 'reasoning_message') {
          currentAgentGroup.blocks.push({
            type: 'reasoning',
            data: message
          })
          // Update group ID to use reasoning message ID
          currentAgentGroup.id = message.id
        } else if (message.messageType === 'tool_call_message') {
          currentAgentGroup.blocks.push({
            type: 'tool_call',
            data: message
          })
          currentToolCalls.push(message)
        } else if (message.messageType === 'tool_return_message') {
          console.log('Processing tool return message:', message)
          // Find matching tool call block and add return value
          if (currentAgentGroup.blocks.length > 0) {
            // Find the last tool_call block
            const lastToolCallBlock = [...currentAgentGroup.blocks].reverse().find(block => block.type === 'tool_call')
            if (lastToolCallBlock) {
              console.log('Found matching tool call block, adding return value')
              lastToolCallBlock.data.toolReturn = message
            } else {
              console.log('No matching tool call block found')
            }
          }
        } else if (message.messageType === 'assistant_message') {
          currentAgentGroup.blocks.push({
            type: 'assistant',
            data: message
          })
          // Update group ID to use assistant message ID
          currentAgentGroup.id = message.id
        }
      } else {
        // Other message types - finalize current agent group and add this message
        if (currentAgentGroup) {
          processed.push(currentAgentGroup)
          currentAgentGroup = null
          currentToolCalls = []
        }
        processed.push(message)
      }
    }

    // Add any remaining agent group
    if (currentAgentGroup) {
      processed.push(currentAgentGroup)
    }
    
    return processed
  }
}
