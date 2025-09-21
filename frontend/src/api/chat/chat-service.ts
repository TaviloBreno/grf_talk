import apiClient, { handleApiError } from '@/lib/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { Chat, CreateChatData, UpdateChatData } from '@/types/chat'
import type { 
  CreateChatFormData, 
  UpdateChatFormData,
  ChatPaginationData
} from '@/schemas/chat-schema'

/**
 * Chat management API service
 * Handles CRUD operations for chats
 */
export const chatService = {
  /**
   * Get all user chats with optional pagination
   */
  getChats: async (params?: ChatPaginationData): Promise<ApiResponse<PaginatedResponse<Chat>>> => {
    try {
      const response = await apiClient.get('/chats', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get chat by ID
   */
  getChatById: async (chatId: string): Promise<ApiResponse<Chat>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Create new chat
   */
  createChat: async (data: CreateChatFormData | { email: string }): Promise<ApiResponse<Chat>> => {
    try {
      const response = await apiClient.post('/chats', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update chat
   */
  updateChat: async (chatId: string, data: UpdateChatFormData): Promise<ApiResponse<Chat>> => {
    try {
      const response = await apiClient.put(`/chats/${chatId}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete chat
   */
  deleteChat: async (chatId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/chats/${chatId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Mark chat as read
   */
  markAsRead: async (chatId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/read`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Set typing status
   */
  setTyping: async (chatId: string, isTyping: boolean): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/typing`, { isTyping })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get chat statistics
   */
  getChatStats: async (chatId: string): Promise<ApiResponse<{
    totalMessages: number
    totalParticipants: number
    messagesThisWeek: number
    activeUsers: number
    topSenders: Array<{ userId: string; messageCount: number }>
  }>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/stats`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}