import apiClient, { handleApiError, createFormDataRequest } from '@/lib/api-client'
import type { 
  ApiResponse, 
  PaginatedResponse,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AuthUser,
  User
} from '@/types'

// Authentication API requests
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> => {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Register user
  register: async (data: RegisterCredentials): Promise<ApiResponse<AuthUser>> => {
    try {
      const response = await apiClient.post('/auth/register', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Logout user
  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get('/auth/profile')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/auth/reset-password', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/auth/change-password', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/auth/verify-email', { token })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Resend verification email
  resendVerification: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/auth/resend-verification')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Enable 2FA
  enable2FA: async (password: string): Promise<ApiResponse<{ qrCode: string; secret: string }>> => {
    try {
      const response = await apiClient.post('/auth/2fa/enable', { password })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Verify 2FA setup
  verify2FA: async (code: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/auth/2fa/verify', { code })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Disable 2FA
  disable2FA: async (password: string, code: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/auth/2fa/disable', { password, code })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Check authentication status
  checkAuth: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}