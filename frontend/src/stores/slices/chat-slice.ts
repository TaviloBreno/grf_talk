import { StateCreator } from 'zustand'
import { chatApi } from '@/api/chat-api'
import type { Chat } from '@/types/chat'
import type { ChatSliceState, ChatSliceActions, ChatStoreState } from '../types'

/**
 * Chat Management Slice
 * 
 * Handles chat operations like loading, creating, updating chats
 * Following Single Responsibility Principle
 */
export interface ChatSlice extends ChatSliceState, ChatSliceActions {}

export const createChatSlice: StateCreator<
  ChatStoreState,
  [["zustand/immer", never]],
  [],
  ChatSlice
> = (set, get) => ({
  // Initial state
  activeChat: null,
  chatList: [],
  isLoading: false,
  error: null,

  // Set active chat
  setActiveChat: (chat: Chat | null) => {
    set((state) => {
      state.activeChat = chat
    })

    // Load messages for the active chat if loadMessages exists
    if (chat?.id && get().loadMessages) {
      get().loadMessages(chat.id)
    }
  },

  // Load user chats
  loadChats: async () => {
    set((state) => {
      state.isLoading = true
      state.error = null
    })

    try {
      const response = await chatApi.getChats({ page: 1, limit: 50 })
      
      if (response.success && response.data?.data) {
        set((state) => {
          state.chatList = response.data?.data || []
          state.isLoading = false
        })
      } else {
        const errorMessage = response.message || 'Erro ao carregar chats'
        set((state) => {
          state.error = errorMessage
          state.isLoading = false
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar chats'
      set((state) => {
        state.error = errorMessage
        state.isLoading = false
      })
    }
  },

  // Create new chat
  createChat: async (participantId: string, data?: Partial<Chat>) => {
    set((state) => {
      state.isLoading = true
      state.error = null
    })

    try {
      // Prepare data according to API requirements
      const chatData = {
        title: data?.title || 'Nova Conversa',
        type: (data?.type || 'private') as 'private' | 'group' | 'channel',
        participantIds: [participantId],
        isPublic: false,
        allowInvites: true,
        allowFileSharing: true,
        maxFileSize: 50,
        description: data?.description || ''
      }

      const response = await chatApi.createChat(chatData)
      
      if (response.success && response.data) {
        const newChat = response.data
        
        set((state) => {
          state.chatList.unshift(newChat)
          state.activeChat = newChat
          state.isLoading = false
        })
      } else {
        const errorMessage = response.message || 'Erro ao criar chat'
        set((state) => {
          state.error = errorMessage
          state.isLoading = false
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar chat'
      set((state) => {
        state.error = errorMessage
        state.isLoading = false
      })
    }
  },

  // Update chat
  updateChat: async (chatId: string, data: Partial<Chat>) => {
    set((state) => {
      state.isLoading = true
      state.error = null
    })

    try {
      const response = await chatApi.updateChat(chatId, data)
      
      if (response.success && response.data) {
        const updatedChat = response.data
        
        set((state) => {
          const chatIndex = state.chatList.findIndex(chat => chat.id === chatId)
          if (chatIndex !== -1) {
            state.chatList[chatIndex] = updatedChat
          }
          
          if (state.activeChat?.id === chatId) {
            state.activeChat = updatedChat
          }
          
          state.isLoading = false
        })
      } else {
        const errorMessage = response.message || 'Erro ao atualizar chat'
        set((state) => {
          state.error = errorMessage
          state.isLoading = false
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar chat'
      set((state) => {
        state.error = errorMessage
        state.isLoading = false
      })
    }
  },

  // Delete chat
  deleteChat: async (chatId: string) => {
    set((state) => {
      state.isLoading = true
      state.error = null
    })

    try {
      const response = await chatApi.deleteChat(chatId)
      
      if (response.success) {
        set((state) => {
          state.chatList = state.chatList.filter(chat => chat.id !== chatId)
          
          if (state.activeChat?.id === chatId) {
            state.activeChat = null
          }
          
          state.isLoading = false
        })
      } else {
        const errorMessage = response.message || 'Erro ao deletar chat'
        set((state) => {
          state.error = errorMessage
          state.isLoading = false
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar chat'
      set((state) => {
        state.error = errorMessage
        state.isLoading = false
      })
    }
  },

  // Clear chat error
  clearChatError: () => {
    set((state) => {
      state.error = null
    })
  }
})