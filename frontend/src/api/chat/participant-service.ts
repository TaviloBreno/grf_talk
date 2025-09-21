import apiClient, { handleApiError } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type { ChatParticipant } from '@/types/chat'
import type { 
  AddParticipantFormData, 
  UpdateParticipantFormData 
} from '@/schemas/chat-schema'

/**
 * Chat participants management API service
 * Handles operations related to chat participants
 */
export const participantService = {
  /**
   * Join chat
   */
  joinChat: async (chatId: string): Promise<ApiResponse<ChatParticipant>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/join`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Leave chat
   */
  leaveChat: async (chatId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/leave`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get chat participants
   */
  getParticipants: async (chatId: string): Promise<ApiResponse<ChatParticipant[]>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/participants`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Add participant to chat
   */
  addParticipant: async (chatId: string, data: AddParticipantFormData): Promise<ApiResponse<ChatParticipant>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/participants`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update participant role/permissions
   */
  updateParticipant: async (
    chatId: string, 
    userId: string, 
    data: UpdateParticipantFormData
  ): Promise<ApiResponse<ChatParticipant>> => {
    try {
      const response = await apiClient.put(`/chats/${chatId}/participants/${userId}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Remove participant from chat
   */
  removeParticipant: async (chatId: string, userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/chats/${chatId}/participants/${userId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}