import apiClient, { handleApiError } from '@/lib/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { Message, SendMessageData, UpdateMessageData } from '@/types/chat'
import type { 
  SendMessageFormData, 
  UpdateMessageFormData,
  SearchMessagesFormData,
  AddReactionFormData,
  ChatPaginationData
} from '@/schemas/chat-schema'
import { createFormDataRequest } from '@/lib/api-client'

/**
 * Message management API service
 * Handles CRUD operations for chat messages
 */
export const messageService = {
  /**
   * Get chat messages with pagination
   */
  getMessages: async (
    chatId: string, 
    params?: ChatPaginationData
  ): Promise<ApiResponse<PaginatedResponse<Message>>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/messages`, { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Send message to chat
   */
  sendMessage: async (chatId: string, data: SendMessageFormData): Promise<ApiResponse<Message>> => {
    try {
      // Convert 'content' to 'body' for backend compatibility
      let requestData: any = {
        ...data,
        body: data.content, // Backend expects 'body', not 'content'
      }
      
      // Remove 'content' to avoid confusion
      delete requestData.content
      
      // Handle file attachments
      if (data.attachments && data.attachments.length > 0) {
        requestData = createFormDataRequest(
          { body: data.content, type: data.type, replyTo: data.replyTo },
          data.attachments as File[]
        )
      }

      const response = await apiClient.post(`/chats/${chatId}/messages/`, requestData, {
        headers: data.attachments?.length 
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update message
   */
  updateMessage: async (
    chatId: string, 
    messageId: string, 
    data: UpdateMessageFormData
  ): Promise<ApiResponse<Message>> => {
    try {
      const response = await apiClient.put(`/chats/${chatId}/messages/${messageId}/`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete message
   */
  deleteMessage: async (chatId: string, messageId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/chats/${chatId}/messages/${messageId}/`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Search messages across chats
   */
  searchMessages: async (params: SearchMessagesFormData): Promise<ApiResponse<PaginatedResponse<Message>>> => {
    try {
      const response = await apiClient.get('/messages/search', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Add reaction to message
   */
  addReaction: async (messageId: string, data: AddReactionFormData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/messages/${messageId}/reactions`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Remove reaction from message
   */
  removeReaction: async (messageId: string, emoji: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Pin message
   */
  pinMessage: async (messageId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/messages/${messageId}/pin`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Unpin message
   */
  unpinMessage: async (messageId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/messages/${messageId}/unpin`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get pinned messages for chat
   */
  getPinnedMessages: async (chatId: string): Promise<ApiResponse<Message[]>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/pinned-messages`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}