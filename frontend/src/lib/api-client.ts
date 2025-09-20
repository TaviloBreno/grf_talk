import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
// import { useAuthStore } from '@/stores/auth-store'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    // Add auth token to requests
    // const authStore = useAuthStore.getState()
    // const token = authStore.user?.accessToken
    
    // TODO: Get token from cookies or other storage method
    const token = null
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        timestamp: new Date().toISOString(),
      })
    }

    return config
  },
  (error: AxiosError) => {
    console.error('🚨 Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString(),
      })
    }

    return response
  },
  async (error: AxiosError) => {
    // const authStore = useAuthStore.getState()
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // TODO: Implement token refresh logic
      // const refreshToken = authStore.user?.refreshToken
      
      // Try to refresh token if available
      // if (refreshToken && !error.config?.url?.includes('/auth/refresh')) {
      //   try {
      //     const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      //       refreshToken,
      //     })
          
      //     const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data
          
      //     // Update auth store with new tokens
      //     authStore.setTokens(accessToken, newRefreshToken)
          
      //     // Retry original request with new token
      //     if (error.config && error.config.headers) {
      //       error.config.headers.Authorization = `Bearer ${accessToken}`
      //       return apiClient.request(error.config)
      //     }
      //   } catch (refreshError) {
      //     // Refresh failed, logout user
      //     console.error('Token refresh failed:', refreshError)
      //     authStore.logout()
          
      //     // Redirect to login if not already there
      //     if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
      //       window.location.href = '/auth/login?expired=true'
      //     }
      //   }
      // } else {
      //   // No refresh token available, logout user
      //   authStore.logout()
        
      //   // Redirect to login if not already there
      //   if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
      //     window.location.href = '/auth/login'
      //   }
      // }
      
      // For now, just redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message)
      
      // Show user-friendly message for network errors
      const errorMessage = error.code === 'NETWORK_ERROR' 
        ? 'Problema de conexão. Verifique sua internet e tente novamente.'
        : 'Erro de conexão com o servidor. Tente novamente em alguns segundos.'
      
      return Promise.reject({
        ...error,
        message: errorMessage,
        isNetworkError: true,
      })
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        ...error,
        message: 'Requisição expirou. Tente novamente.',
        isTimeoutError: true,
      })
    }

    // Handle server errors (5xx)
    if (error.response.status >= 500) {
      return Promise.reject({
        ...error,
        message: 'Erro interno do servidor. Tente novamente em alguns minutos.',
        isServerError: true,
      })
    }

    return Promise.reject(error)
  }
)

// Utility function to handle API errors
export const handleApiError = (error: any) => {
  if (error.isNetworkError) {
    return {
      message: error.message,
      type: 'network',
    }
  }

  if (error.isTimeoutError) {
    return {
      message: error.message,
      type: 'timeout',
    }
  }

  if (error.isServerError) {
    return {
      message: error.message,
      type: 'server',
    }
  }

  if (error.response?.data) {
    const { message, errors } = error.response.data
    
    return {
      message: message || 'Ocorreu um erro inesperado',
      errors: errors || {},
      status: error.response.status,
      type: 'api',
    }
  }

  return {
    message: error.message || 'Ocorreu um erro inesperado',
    type: 'unknown',
  }
}

// File upload configuration
export const createFormDataRequest = (data: Record<string, any>, files?: File[]) => {
  const formData = new FormData()
  
  // Add regular fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value.toString())
      }
    }
  })
  
  // Add files
  if (files) {
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
  }
  
  return formData
}

// Request cancellation utility
export const createCancelToken = () => {
  const source = axios.CancelToken.source()
  return {
    token: source.token,
    cancel: source.cancel,
  }
}

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health')
    return true
  } catch (error) {
    console.error('API Health Check Failed:', error)
    return false
  }
}

export default apiClient