import { StateCreator } from 'zustand'
import { messageService } from '@/api/chat/message-service'
import type { Message } from '@/types/chat'
import type { MessageSliceState, MessageSliceActions, ChatStoreState } from '../types'

/**
 * Message Management Slice
 * 
 * Handles message operations like loading, sending, editing messages
 * Following Single Responsibility Principle
 */
export interface MessageSlice extends MessageSliceState, MessageSliceActions {}

export const createMessageSlice: StateCreator<
  ChatStoreState,
  [["zustand/immer", never]],
  [],
  MessageSlice
> = (set, get) => ({
  // Initial state
  messages: {},
  selectedMessages: [],
  replyingTo: null,
  isLoadingMessages: false,
  messageError: null,

  // Load messages for a chat
  loadMessages: async (chatId: string, page?: number) => {
    set((state) => {
      state.isLoadingMessages = true
      state.messageError = null
    })

    try {
      const response = await messageService.getMessages(chatId, { 
        page: page || 1, 
        limit: 50 
      })
      
      if (response.success && response.data?.data) {
        set((state) => {
          state.messages[chatId] = response.data?.data || []
          state.isLoadingMessages = false
        })
      } else {
        const errorMessage = response.message || 'Erro ao carregar mensagens'
        set((state) => {
          state.messageError = errorMessage
          state.isLoadingMessages = false
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar mensagens'
      set((state) => {
        state.messageError = errorMessage
        state.isLoadingMessages = false
      })
    }
  },

  // Send new message
  sendMessage: async (chatId: string, content: string, type?: string, attachments?: any[]) => {
    set((state) => {
      state.messageError = null
    })

    try {
      const messageData = {
        content,
        type: (type || 'text') as 'text' | 'image' | 'video' | 'audio' | 'file' | 'system' | 'announcement',
        replyTo: get().replyingTo?.id,
        attachments: attachments || []
      }

      const response = await messageService.sendMessage(chatId, messageData)
      
      if (response.success && response.data) {
        const newMessage = response.data
        
        set((state) => {
          if (!state.messages[chatId]) {
            state.messages[chatId] = []
          }
          state.messages[chatId].push(newMessage)
          state.replyingTo = null // Clear reply after sending
        })
      } else {
        const errorMessage = response.message || 'Erro ao enviar mensagem'
        set((state) => {
          state.messageError = errorMessage
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem'
      set((state) => {
        state.messageError = errorMessage
      })
    }
  },

  // Update existing message
  updateMessage: async (messageId: string, content: string) => {
    set((state) => {
      state.messageError = null
    })

    try {
      // Need to find the chat ID for this message
      let chatId = ''
      Object.keys(get().messages).forEach(cId => {
        const message = get().messages[cId].find(msg => msg.id === messageId)
        if (message) {
          chatId = cId
        }
      })

      if (!chatId) {
        set((state) => {
          state.messageError = 'Mensagem não encontrada'
        })
        return
      }

      const response = await messageService.updateMessage(chatId, messageId, { body: content })
      
      if (response.success && response.data) {
        const updatedMessage = response.data
        
        set((state) => {
          const messageIndex = state.messages[chatId].findIndex(msg => msg.id === messageId)
          if (messageIndex !== -1) {
            state.messages[chatId][messageIndex] = updatedMessage
          }
        })
      } else {
        const errorMessage = response.message || 'Erro ao editar mensagem'
        set((state) => {
          state.messageError = errorMessage
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao editar mensagem'
      set((state) => {
        state.messageError = errorMessage
      })
    }
  },

  // Delete message
  deleteMessage: async (messageId: string) => {
    set((state) => {
      state.messageError = null
    })

    try {
      // Need to find the chat ID for this message
      let chatId = ''
      Object.keys(get().messages).forEach(cId => {
        const message = get().messages[cId].find(msg => msg.id === messageId)
        if (message) {
          chatId = cId
        }
      })

      if (!chatId) {
        set((state) => {
          state.messageError = 'Mensagem não encontrada'
        })
        return
      }

      const response = await messageService.deleteMessage(chatId, messageId)
      
      if (response.success) {
        set((state) => {
          state.messages[chatId] = state.messages[chatId].filter(msg => msg.id !== messageId)
          // Remove from selected messages if selected
          state.selectedMessages = state.selectedMessages.filter(id => id !== messageId)
        })
      } else {
        const errorMessage = response.message || 'Erro ao deletar mensagem'
        set((state) => {
          state.messageError = errorMessage
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar mensagem'
      set((state) => {
        state.messageError = errorMessage
      })
    }
  },

  // Select single message
  selectMessage: (messageId: string) => {
    set((state) => {
      if (state.selectedMessages.includes(messageId)) {
        state.selectedMessages = state.selectedMessages.filter(id => id !== messageId)
      } else {
        state.selectedMessages.push(messageId)
      }
    })
  },

  // Select multiple messages
  selectMultipleMessages: (messageIds: string[]) => {
    set((state) => {
      state.selectedMessages = [...new Set([...state.selectedMessages, ...messageIds])]
    })
  },

  // Clear selected messages
  clearSelectedMessages: () => {
    set((state) => {
      state.selectedMessages = []
    })
  },

  // Set replying to message
  setReplyingTo: (message: Message | null) => {
    set((state) => {
      state.replyingTo = message
    })
  },

  // Clear message error
  clearMessageError: () => {
    set((state) => {
      state.messageError = null
    })
  }
})