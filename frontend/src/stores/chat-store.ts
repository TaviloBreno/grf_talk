import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { chatApi } from '@/api/chat-api'
import type {
  Chat,
  Message,
  ChatParticipant,
  CreateChatData,
  UpdateChatData,
  SendMessageData,
  UpdateMessageData,
  ChatUIState,
  ChatActions,
} from '@/types/chat'

// Extended state interface combining UI state and actions
interface ChatStoreState extends ChatUIState, ChatActions {
  // Additional UI state
  isDarkMode: boolean
  sidebarCollapsed: boolean
  
  // Additional actions
  toggleSidebar: () => void
  setDarkMode: (isDark: boolean) => void
  resetStore: () => void
}

const initialState: ChatUIState = {
  activeChat: null,
  chatList: [],
  messages: {},
  isLoading: false,
  error: null,
  typingUsers: {},
  searchQuery: '',
  searchResults: [],
  selectedMessages: [],
  replyingTo: null,
}

export const useChatStore = create<ChatStoreState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      ...initialState,
      isDarkMode: false,
      sidebarCollapsed: false,

      // Set active chat
      setActiveChat: (chat: Chat | null) => {
        set((state) => {
          state.activeChat = chat
          state.selectedMessages = []
          state.replyingTo = null
          state.error = null
        })

        // Load messages for the active chat
        if (chat) {
          get().loadMessages(chat.id)
        }
      },

      // Load user chats
      loadChats: async () => {
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          const response = await chatApi.getChats({ page: 1, limit: 50 })
          
          if (response.success) {
            set((state) => {
              state.chatList = response.data?.data || []
              state.isLoading = false
            })
          } else {
            set((state) => {
              state.error = response.message || 'Erro ao carregar chats'
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
      createChat: async (data: CreateChatData) => {
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          const response = await chatApi.createChat(data)
          
          if (response.success && response.data) {
            const newChat = response.data

            set((state) => {
              state.chatList.unshift(newChat)
              state.activeChat = newChat
              state.isLoading = false
            })

            return newChat
          } else {
            const errorMessage = response.message || 'Erro ao criar chat'
            set((state) => {
              state.error = errorMessage
              state.isLoading = false
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao criar chat'
          set((state) => {
            state.error = errorMessage
            state.isLoading = false
          })
          throw error
        }
      },

      // Update chat
      updateChat: async (chatId: string, data: UpdateChatData) => {
        try {
          const response = await chatApi.updateChat(chatId, data)
          
          if (response.success && response.data) {
            const updatedChat = response.data

            set((state) => {
              const index = state.chatList.findIndex(chat => chat.id === chatId)
              if (index !== -1) {
                state.chatList[index] = updatedChat
              }
              
              if (state.activeChat?.id === chatId) {
                state.activeChat = updatedChat
              }
            })

            return updatedChat
          } else {
            const errorMessage = response.message || 'Erro ao atualizar chat'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar chat'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Delete chat
      deleteChat: async (chatId: string) => {
        try {
          const response = await chatApi.deleteChat(chatId)
          
          if (response.success) {
            set((state) => {
              state.chatList = state.chatList.filter(chat => chat.id !== chatId)
              
              if (state.activeChat?.id === chatId) {
                state.activeChat = null
              }
              
              delete state.messages[chatId]
            })
          } else {
            const errorMessage = response.message || 'Erro ao deletar chat'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar chat'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Load messages for a chat
      loadMessages: async (chatId: string, page = 1) => {
        try {
          const response = await chatApi.getMessages(chatId, { page, limit: 50 })
          
          if (response.success && response.data) {
            const messages = response.data.data

            set((state) => {
              if (page === 1) {
                // First page, replace all messages
                state.messages[chatId] = messages
              } else {
                // Additional pages, prepend to existing messages
                state.messages[chatId] = [
                  ...messages,
                  ...(state.messages[chatId] || [])
                ]
              }
            })
          } else {
            const errorMessage = response.message || 'Erro ao carregar mensagens'
            set((state) => {
              state.error = errorMessage
            })
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar mensagens'
          set((state) => {
            state.error = errorMessage
          })
        }
      },

      // Send message
      sendMessage: async (chatId: string, data: SendMessageData) => {
        try {
          const response = await chatApi.sendMessage(chatId, data)
          
          if (response.success && response.data) {
            const newMessage = response.data

            set((state) => {
              if (!state.messages[chatId]) {
                state.messages[chatId] = []
              }
              state.messages[chatId].push(newMessage)
              
              // Update last message in chat list
              const chatIndex = state.chatList.findIndex(chat => chat.id === chatId)
              if (chatIndex !== -1) {
                state.chatList[chatIndex].lastMessage = newMessage
                state.chatList[chatIndex].updatedAt = newMessage.createdAt
              }
              
              state.replyingTo = null
            })

            return newMessage
          } else {
            const errorMessage = response.message || 'Erro ao enviar mensagem'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Update message
      updateMessage: async (messageId: string, data: UpdateMessageData) => {
        try {
          const response = await chatApi.updateMessage(messageId, data)
          
          if (response.success && response.data) {
            const updatedMessage = response.data

            set((state) => {
              Object.keys(state.messages).forEach(chatId => {
                const messageIndex = state.messages[chatId].findIndex(msg => msg.id === messageId)
                if (messageIndex !== -1) {
                  state.messages[chatId][messageIndex] = updatedMessage
                }
              })
            })

            return updatedMessage
          } else {
            const errorMessage = response.message || 'Erro ao atualizar mensagem'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar mensagem'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Delete message
      deleteMessage: async (messageId: string) => {
        try {
          const response = await chatApi.deleteMessage(messageId)
          
          if (response.success) {
            set((state) => {
              Object.keys(state.messages).forEach(chatId => {
                state.messages[chatId] = state.messages[chatId].filter(msg => msg.id !== messageId)
              })
            })
          } else {
            const errorMessage = response.message || 'Erro ao deletar mensagem'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar mensagem'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Join chat
      joinChat: async (chatId: string) => {
        try {
          const response = await chatApi.joinChat(chatId)
          
          if (response.success) {
            // Reload chats to get updated list
            await get().loadChats()
          } else {
            const errorMessage = response.message || 'Erro ao entrar no chat'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao entrar no chat'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Leave chat
      leaveChat: async (chatId: string) => {
        try {
          const response = await chatApi.leaveChat(chatId)
          
          if (response.success) {
            set((state) => {
              state.chatList = state.chatList.filter(chat => chat.id !== chatId)
              
              if (state.activeChat?.id === chatId) {
                state.activeChat = null
              }
              
              delete state.messages[chatId]
            })
          } else {
            const errorMessage = response.message || 'Erro ao sair do chat'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao sair do chat'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Add participant
      addParticipant: async (chatId: string, userId: string) => {
        try {
          const response = await chatApi.addParticipant(chatId, { userId })
          
          if (response.success) {
            // Reload chat to get updated participants
            if (get().activeChat?.id === chatId) {
              const chatResponse = await chatApi.getChatById(chatId)
              if (chatResponse.success && chatResponse.data) {
                set((state) => {
                  state.activeChat = chatResponse.data
                })
              }
            }
          } else {
            const errorMessage = response.message || 'Erro ao adicionar participante'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar participante'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Remove participant
      removeParticipant: async (chatId: string, userId: string) => {
        try {
          const response = await chatApi.removeParticipant(chatId, userId)
          
          if (response.success) {
            // Reload chat to get updated participants
            if (get().activeChat?.id === chatId) {
              const chatResponse = await chatApi.getChatById(chatId)
              if (chatResponse.success && chatResponse.data) {
                set((state) => {
                  state.activeChat = chatResponse.data
                })
              }
            }
          } else {
            const errorMessage = response.message || 'Erro ao remover participante'
            set((state) => {
              state.error = errorMessage
            })
            throw new Error(errorMessage)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao remover participante'
          set((state) => {
            state.error = errorMessage
          })
          throw error
        }
      },

      // Search messages
      searchMessages: async (query: string, chatId?: string) => {
        try {
          set((state) => {
            state.searchQuery = query
            state.isLoading = true
          })

          const response = await chatApi.searchMessages({ query, chatId })
          
          if (response.success && response.data) {
            set((state) => {
              state.searchResults = response.data.data
              state.isLoading = false
            })
          } else {
            set((state) => {
              state.searchResults = []
              state.isLoading = false
              state.error = response.message || 'Erro na busca'
            })
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro na busca'
          set((state) => {
            state.searchResults = []
            state.isLoading = false
            state.error = errorMessage
          })
        }
      },

      // Mark chat as read
      markAsRead: async (chatId: string) => {
        try {
          await chatApi.markAsRead(chatId)
        } catch (error) {
          console.error('Error marking chat as read:', error)
        }
      },

      // Set typing status
      setTyping: (chatId: string, isTyping: boolean) => {
        // This would typically be handled by WebSocket
        chatApi.setTyping(chatId, isTyping).catch(console.error)
      },

      // Clear error
      clearError: () => {
        set((state) => {
          state.error = null
        })
      },

      // Toggle sidebar
      toggleSidebar: () => {
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed
        })
      },

      // Set dark mode
      setDarkMode: (isDark: boolean) => {
        set((state) => {
          state.isDarkMode = isDark
        })
      },

      // Reset store
      resetStore: () => {
        set(() => ({
          ...initialState,
          isDarkMode: false,
          sidebarCollapsed: false,
        }))
      },
    })),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        // Persist only UI preferences, not chat data
        isDarkMode: state.isDarkMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// Selectors for easier state access
export const useActiveChat = () => useChatStore((state) => state.activeChat)
export const useChatList = () => useChatStore((state) => state.chatList)
export const useChatMessages = (chatId?: string) => 
  useChatStore((state) => chatId ? state.messages[chatId] || [] : [])
export const useChatLoading = () => useChatStore((state) => state.isLoading)
export const useChatError = () => useChatStore((state) => state.error)
export const useSearchResults = () => useChatStore((state) => state.searchResults)
export const useTypingUsers = (chatId?: string) => 
  useChatStore((state) => chatId ? state.typingUsers[chatId] || [] : [])

// Actions for easier access
export const useChatActions = () => {
  const store = useChatStore()
  return {
    setActiveChat: store.setActiveChat,
    loadChats: store.loadChats,
    createChat: store.createChat,
    updateChat: store.updateChat,
    deleteChat: store.deleteChat,
    loadMessages: store.loadMessages,
    sendMessage: store.sendMessage,
    updateMessage: store.updateMessage,
    deleteMessage: store.deleteMessage,
    joinChat: store.joinChat,
    leaveChat: store.leaveChat,
    addParticipant: store.addParticipant,
    removeParticipant: store.removeParticipant,
    searchMessages: store.searchMessages,
    markAsRead: store.markAsRead,
    setTyping: store.setTyping,
    clearError: store.clearError,
    toggleSidebar: store.toggleSidebar,
    setDarkMode: store.setDarkMode,
    resetStore: store.resetStore,
  }
}