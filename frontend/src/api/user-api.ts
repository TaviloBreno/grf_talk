import apiClient, { handleApiError, createFormDataRequest } from '@/lib/api-client'
import type { 
  ApiResponse, 
  PaginatedResponse,
  User,
  UserProfile
} from '@/types'
import type {
  UserProfileFormData,
  UpdateUserFormData,
  UserPreferencesFormData,
  UserSearchFormData,
  AvatarUploadFormData,
  UserInvitationFormData,
  UserDeactivationFormData,
  BulkUserOperationFormData,
  UserActivityLogFormData,
  ExportUserDataFormData
} from '@/schemas/user-schema'

// User API requests
export const userApi = {
  // Get all users (admin only)
  getUsers: async (params?: {
    page?: number
    limit?: number
    search?: string
    role?: 'user' | 'admin'
  }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    try {
      const response = await apiClient.get('/users', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get user profile
  getUserProfile: async (userId?: string): Promise<ApiResponse<UserProfile>> => {
    try {
      const endpoint = userId ? `/users/${userId}/profile` : '/users/me/profile'
      const response = await apiClient.get(endpoint)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update user basic info
  updateUser: async (data: UpdateUserFormData): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put('/users/me', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update user profile
  updateProfile: async (data: UserProfileFormData): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.put('/users/me/profile', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update user preferences
  updatePreferences: async (data: UserPreferencesFormData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.put('/users/me/preferences', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = createFormDataRequest({}, [file])
      const response = await apiClient.post('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete avatar
  deleteAvatar: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete('/users/me/avatar')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Search users
  searchUsers: async (params: UserSearchFormData): Promise<ApiResponse<PaginatedResponse<User>>> => {
    try {
      const response = await apiClient.get('/users/search', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Invite user
  inviteUser: async (data: UserInvitationFormData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/users/invite', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Deactivate user (admin only)
  deactivateUser: async (userId: string, data: UserDeactivationFormData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/users/${userId}/deactivate`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Activate user (admin only)
  activateUser: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/users/${userId}/activate`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Bulk user operations (admin only)
  bulkOperation: async (data: BulkUserOperationFormData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/users/bulk-operation', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get user activity log
  getActivityLog: async (params: UserActivityLogFormData): Promise<ApiResponse<PaginatedResponse<any>>> => {
    try {
      const response = await apiClient.get('/users/activity-log', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Export user data (GDPR compliance)
  exportUserData: async (params: ExportUserDataFormData): Promise<ApiResponse<{ downloadUrl: string }>> => {
    try {
      const response = await apiClient.post('/users/export-data', params)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete user account (user self-deletion)
  deleteAccount: async (password: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete('/users/me', { 
        data: { password } 
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get user statistics (admin only)
  getUserStats: async (): Promise<ApiResponse<{
    totalUsers: number
    activeUsers: number
    newUsersToday: number
    newUsersThisWeek: number
    newUsersThisMonth: number
    usersByRole: Record<string, number>
    usersByStatus: Record<string, number>
  }>> => {
    try {
      const response = await apiClient.get('/users/stats')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Block user
  blockUser: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/users/${userId}/block`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Unblock user
  unblockUser: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/users/${userId}/unblock`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get blocked users
  getBlockedUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await apiClient.get('/users/me/blocked')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Follow user
  followUser: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/users/${userId}/follow`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Unfollow user
  unfollowUser: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/users/${userId}/unfollow`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get followers
  getFollowers: async (userId?: string): Promise<ApiResponse<User[]>> => {
    try {
      const endpoint = userId ? `/users/${userId}/followers` : '/users/me/followers'
      const response = await apiClient.get(endpoint)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get following
  getFollowing: async (userId?: string): Promise<ApiResponse<User[]>> => {
    try {
      const endpoint = userId ? `/users/${userId}/following` : '/users/me/following'
      const response = await apiClient.get(endpoint)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}