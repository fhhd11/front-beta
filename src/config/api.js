// API Configuration
export const API_CONFIG = {
  // Base URL for your backend API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // API version
  VERSION: 'v1',
  
  // Request timeout (in milliseconds)
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    attempts: 3,
    delay: 1000
  }
}

// API endpoints configuration
export const ENDPOINTS = {
  // User endpoints
  USER: {
    ME: '/api/v1/me',
    PROFILE: '/api/v1/user/profile',
    UPDATE_PROFILE: '/api/v1/user/profile'
  },
  
  // Agent endpoints (deprecated - using Letta API directly)
  // AGENT: {
  //   INFO: '/api/v1/agent',
  //   MESSAGES: '/api/v1/agent/messages',
  //   MEMORY: '/api/v1/agent/memory',
  //   STATUS: '/api/v1/agent/status'
  // },
  
  // Chat endpoints
  CHAT: {
    SEND_MESSAGE: '/api/v1/chat/message',
    GET_MESSAGES: '/api/v1/chat/messages',
    GET_HISTORY: '/api/v1/chat/history',
    DELETE_MESSAGE: '/api/v1/chat/messages/:id'
  }
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  UNAUTHORIZED: 'Сессия истекла. Пожалуйста, войдите снова.',
  FORBIDDEN: 'У вас нет прав для выполнения этого действия.',
  NOT_FOUND: 'Запрашиваемый ресурс не найден.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка.'
}
