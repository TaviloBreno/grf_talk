import apiClient, { handleApiError, createFormDataRequest } from '@/lib/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { 
  ChatInviteFormData,
  ChatNotificationFormData 
} from '@/schemas/chat-schema'

/**
 * File management API service
 * Handles file uploads and management for chats
 */
export const fileService = {
  /**
   * Upload file to chat
   */
  uploadFile: async (chatId: string, file: File): Promise<ApiResponse<{ url: string; fileId: string }>> => {
    try {
      const formData = createFormDataRequest({}, [file])
      const response = await apiClient.post(`/chats/${chatId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get chat files
   */
  getChatFiles: async (
    chatId: string, 
    params?: { type?: string; page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/files`, { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete file from chat
   */
  deleteFile: async (fileId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/files/${fileId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Chat invitation API service
 * Handles chat invitations and notifications
 */
export const inviteService = {
  /**
   * Send chat invite
   */
  sendInvite: async (data: ChatInviteFormData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/chats/invite', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Accept chat invite
   */
  acceptInvite: async (inviteToken: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post('/chats/invite/accept', { token: inviteToken })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Decline chat invite
   */
  declineInvite: async (inviteToken: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/chats/invite/decline', { token: inviteToken })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update chat notification settings
   */
  updateNotificationSettings: async (data: ChatNotificationFormData): Promise<ApiResponse<void>> => {
    try {
      const { chatId, ...settings } = data
      const response = await apiClient.put(`/chats/${chatId}/notifications`, settings)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}