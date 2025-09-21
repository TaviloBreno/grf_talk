import apiClient, { handleApiError, createFormDataRequest } from '@/lib/api-client'
import type { 
  ApiResponse, 
  PaginatedResponse
} from '@/types'
import type {
  Chat,
  Message,
  ChatParticipant,
  CreateChatData,
  UpdateChatData,
  SendMessageData,
  UpdateMessageData
} from '@/types/chat'
import type {
  CreateChatFormData,
  UpdateChatFormData,
  SendMessageFormData,
  UpdateMessageFormData,
  AddParticipantFormData,
  UpdateParticipantFormData,
  SearchMessagesFormData,
  AddReactionFormData,
  ChatPaginationData,
  ChatInviteFormData,
  ChatNotificationFormData
} from '@/schemas/chat-schema'

// Chat API requests
export const chatApi = {
  // Get all user chats
  getChats: async (params?: ChatPaginationData): Promise<ApiResponse<PaginatedResponse<Chat>>> => {
    try {
      const response = await apiClient.get('/chats', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get chat by ID
  getChatById: async (chatId: string): Promise<ApiResponse<Chat>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new chat
  createChat: async (data: CreateChatFormData): Promise<ApiResponse<Chat>> => {
    try {
      const response = await apiClient.post('/chats', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update chat
  updateChat: async (chatId: string, data: UpdateChatFormData): Promise<ApiResponse<Chat>> => {
    try {
      const response = await apiClient.put(`/chats/${chatId}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete chat
  deleteChat: async (chatId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/chats/${chatId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Join chat
  joinChat: async (chatId: string): Promise<ApiResponse<ChatParticipant>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/join`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Leave chat
  leaveChat: async (chatId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/leave`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get chat participants
  getParticipants: async (chatId: string): Promise<ApiResponse<ChatParticipant[]>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/participants`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Add participant to chat
  addParticipant: async (chatId: string, data: AddParticipantFormData): Promise<ApiResponse<ChatParticipant>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/participants`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update participant
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

  // Remove participant from chat
  removeParticipant: async (chatId: string, userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/chats/${chatId}/participants/${userId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get chat messages
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

  // Send message
  sendMessage: async (chatId: string, data: SendMessageFormData): Promise<ApiResponse<Message>> => {
    try {
      let requestData: unknown = data
      
      // Handle file attachments
      if (data.attachments && data.attachments.length > 0) {
        requestData = createFormDataRequest(
          { content: data.content, type: data.type, replyTo: data.replyTo },
          data.attachments as File[]
        )
      }

      const response = await apiClient.post(`/chats/${chatId}/messages`, requestData, {
        headers: data.attachments?.length 
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update message
  updateMessage: async (messageId: string, data: UpdateMessageFormData): Promise<ApiResponse<Message>> => {
    try {
      const response = await apiClient.put(`/messages/${messageId}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete message
  deleteMessage: async (messageId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/messages/${messageId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Search messages
  searchMessages: async (params: SearchMessagesFormData): Promise<ApiResponse<PaginatedResponse<Message>>> => {
    try {
      const response = await apiClient.get('/messages/search', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Add reaction to message
  addReaction: async (messageId: string, data: AddReactionFormData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/messages/${messageId}/reactions`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Remove reaction from message
  removeReaction: async (messageId: string, emoji: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Mark chat as read
  markAsRead: async (chatId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/read`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Set typing status
  setTyping: async (chatId: string, isTyping: boolean): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/typing`, { isTyping })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Send chat invite
  sendInvite: async (data: ChatInviteFormData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/chats/invite', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Accept chat invite
  acceptInvite: async (inviteToken: string): Promise<ApiResponse<Chat>> => {
    try {
      const response = await apiClient.post('/chats/invite/accept', { token: inviteToken })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Decline chat invite
  declineInvite: async (inviteToken: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/chats/invite/decline', { token: inviteToken })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update chat notification settings
  updateNotificationSettings: async (data: ChatNotificationFormData): Promise<ApiResponse<void>> => {
    try {
      const { chatId, ...settings } = data
      const response = await apiClient.put(`/chats/${chatId}/notifications`, settings)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get chat statistics
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

  // Upload file to chat
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

  // Get chat files
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

  // Delete file from chat
  deleteFile: async (fileId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/files/${fileId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Pin message
  pinMessage: async (messageId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/messages/${messageId}/pin`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Unpin message
  unpinMessage: async (messageId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/messages/${messageId}/unpin`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get pinned messages
  getPinnedMessages: async (chatId: string): Promise<ApiResponse<Message[]>> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/pinned-messages`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}