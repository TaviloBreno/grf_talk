// Main API exports
export { authApi } from './auth-api'
export { userApi } from './user-api'
export { chatApi } from './chat-api'

// Re-export utilities
export { default as apiClient, handleApiError, createFormDataRequest, createCancelToken, checkApiHealth } from '@/lib/api-client'