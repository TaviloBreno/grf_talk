'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useWebSocket } from '@/providers/websocket'
import { useEffect, useCallback } from 'react'
import type { Chat, Message, TypingUser } from '@/types/chat'
import type { User } from '@/types'

interface MessageCache {
  [chatId: string]: {
    messages: Message[]
    lastUpdated: number
    hasMore: boolean
    isLoading: boolean
  }
}

interface ChatState {
  // Core data
  chats: Chat[]
  activeChat: Chat | null
  selectedChatId: string | null
  messageCache: MessageCache
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Real-time state
  onlineUsers: User[]
  typingUsers: Record<string, TypingUser[]>
  
  // Performance
  lastActivity: number
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline'
}

interface ChatActions {
  // Chat management
  setChats: (chats: Chat[]) => void
  setActiveChat: (chat: Chat | null) => void
  selectChat: (chatId: string) => void
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  
  // Message management
  setMessages: (chatId: string, messages: Message[]) => void
  addMessage: (chatId: string, message: Message) => void
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (chatId: string, messageId: string) => void
  
  // Cache management
  clearCache: () => void
  clearChatCache: (chatId: string) => void
  optimizeCache: () => void
  
  // Real-time updates
  setOnlineUsers: (users: User[]) => void
  setTypingUsers: (chatId: string, users: TypingUser[]) => void
  
  // Error handling
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  
  // Performance
  updateActivity: () => void
  setConnectionQuality: (quality: 'excellent' | 'good' | 'poor' | 'offline') => void
}

type ChatStore = ChatState & ChatActions

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      activeChat: null,
      selectedChatId: null,
      messageCache: {},
      isLoading: false,
      error: null,
      onlineUsers: [],
      typingUsers: {},
      lastActivity: Date.now(),
      connectionQuality: 'offline',

      // Chat management
      setChats: (chats: Chat[]) => {
        set({ chats })
      },

      setActiveChat: (chat: Chat | null) => {
        set({ activeChat: chat })
        get().updateActivity()
      },

      selectChat: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId)
        set({ selectedChatId: chatId, activeChat: chat || null })
        get().updateActivity()
      },

      updateChat: (chatId: string, updates: Partial<Chat>) => {
        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId ? { ...chat, ...updates } : chat
          ),
          activeChat: state.activeChat?.id === chatId 
            ? { ...state.activeChat, ...updates }
            : state.activeChat
        }))
      },

      // Message management
      setMessages: (chatId: string, messages: Message[]) => {
        set(state => ({
          messageCache: {
            ...state.messageCache,
            [chatId]: {
              messages: messages.sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              ),
              lastUpdated: Date.now(),
              hasMore: messages.length >= 50, // Assume more if we have 50+
              isLoading: false
            }
          }
        }))
        get().updateActivity()
      },

      addMessage: (chatId: string, message: Message) => {
        set(state => {
          const currentCache = state.messageCache[chatId]
          
          // Avoid duplicates
          const existingMessage = currentCache?.messages.find(m => m.id === message.id)
          if (existingMessage) return state

          const updatedMessages = currentCache 
            ? [...currentCache.messages, message].sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )
            : [message]

          return {
            messageCache: {
              ...state.messageCache,
              [chatId]: {
                ...currentCache,
                messages: updatedMessages,
                lastUpdated: Date.now(),
                isLoading: false
              }
            }
          }
        })
        get().updateActivity()
      },

      updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => {
        set(state => {
          const currentCache = state.messageCache[chatId]
          if (!currentCache) return state

          return {
            messageCache: {
              ...state.messageCache,
              [chatId]: {
                ...currentCache,
                messages: currentCache.messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      deleteMessage: (chatId: string, messageId: string) => {
        set(state => {
          const currentCache = state.messageCache[chatId]
          if (!currentCache) return state

          return {
            messageCache: {
              ...state.messageCache,
              [chatId]: {
                ...currentCache,
                messages: currentCache.messages.filter(msg => msg.id !== messageId),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      // Cache management
      clearCache: () => {
        set({ messageCache: {} })
      },

      clearChatCache: (chatId: string) => {
        set(state => {
          const newCache = { ...state.messageCache }
          delete newCache[chatId]
          return { messageCache: newCache }
        })
      },

      optimizeCache: () => {
        const MAX_MESSAGES_PER_CHAT = 100
        const MAX_CACHE_AGE = 24 * 60 * 60 * 1000 // 24 hours
        const now = Date.now()

        set(state => {
          const optimizedCache: MessageCache = {}

          Object.entries(state.messageCache).forEach(([chatId, cache]) => {
            // Skip if too old
            if (now - cache.lastUpdated > MAX_CACHE_AGE) {
              return
            }

            // Keep only recent messages
            const recentMessages = cache.messages
              .slice(-MAX_MESSAGES_PER_CHAT)
              .filter(msg => now - new Date(msg.createdAt).getTime() < MAX_CACHE_AGE)

            if (recentMessages.length > 0) {
              optimizedCache[chatId] = {
                ...cache,
                messages: recentMessages
              }
            }
          })

          return { messageCache: optimizedCache }
        })
      },

      // Real-time updates
      setOnlineUsers: (users: User[]) => {
        set({ onlineUsers: users })
      },

      setTypingUsers: (chatId: string, users: TypingUser[]) => {
        set(state => ({
          typingUsers: {
            ...state.typingUsers,
            [chatId]: users
          }
        }))
      },

      // Error handling
      setError: (error: string | null) => {
        set({ error })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Performance tracking
      updateActivity: () => {
        set({ lastActivity: Date.now() })
      },

      setConnectionQuality: (quality: 'excellent' | 'good' | 'poor' | 'offline') => {
        set({ connectionQuality: quality })
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messageCache: state.messageCache,
        chats: state.chats,
        lastActivity: state.lastActivity
      })
    }
  )
)

// Hook for WebSocket integration with chat store
export function useChatWebSocket() {
  const { 
    socket, 
    isConnected, 
    connectionStatus,
    onlineUsers: wsOnlineUsers,
    typingUsers: wsTypingUsers 
  } = useWebSocket()
  
  const {
    addMessage,
    updateMessage,
    deleteMessage,
    updateChat,
    setOnlineUsers,
    setTypingUsers,
    setConnectionQuality,
    optimizeCache
  } = useChatStore()

  // Sync WebSocket online users with store
  useEffect(() => {
    setOnlineUsers(wsOnlineUsers)
  }, [wsOnlineUsers, setOnlineUsers])

  // Sync WebSocket typing users with store
  useEffect(() => {
    Object.entries(wsTypingUsers).forEach(([chatId, users]) => {
      setTypingUsers(chatId, users)
    })
  }, [wsTypingUsers, setTypingUsers])

  // Update connection quality based on WebSocket status
  useEffect(() => {
    switch (connectionStatus) {
      case 'connected':
        setConnectionQuality(isConnected ? 'excellent' : 'good')
        break
      case 'connecting':
        setConnectionQuality('poor')
        break
      case 'disconnected':
      case 'error':
        setConnectionQuality('offline')
        break
    }
  }, [connectionStatus, isConnected, setConnectionQuality])

  // Listen for WebSocket events
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message: Message = event.detail
      addMessage(message.chatId, message)
    }

    const handleUpdatedMessage = (event: CustomEvent) => {
      const message: Message = event.detail
      updateMessage(message.chatId, message.id, message)
    }

    const handleDeletedMessage = (event: CustomEvent) => {
      const { messageId, chatId } = event.detail
      deleteMessage(chatId, messageId)
    }

    const handleUpdatedChat = (event: CustomEvent) => {
      const chat: Chat = event.detail
      updateChat(chat.id, chat)
    }

    // Add event listeners
    window.addEventListener('websocket:message:new', handleNewMessage as EventListener)
    window.addEventListener('websocket:message:updated', handleUpdatedMessage as EventListener)
    window.addEventListener('websocket:message:deleted', handleDeletedMessage as EventListener)
    window.addEventListener('websocket:chat:updated', handleUpdatedChat as EventListener)

    return () => {
      window.removeEventListener('websocket:message:new', handleNewMessage as EventListener)
      window.removeEventListener('websocket:message:updated', handleUpdatedMessage as EventListener)
      window.removeEventListener('websocket:message:deleted', handleDeletedMessage as EventListener)
      window.removeEventListener('websocket:chat:updated', handleUpdatedChat as EventListener)
    }
  }, [addMessage, updateMessage, deleteMessage, updateChat])

  // Periodic cache optimization
  useEffect(() => {
    const interval = setInterval(() => {
      optimizeCache()
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [optimizeCache])

  return {
    socket,
    isConnected,
    connectionStatus
  }
}

export default useChatStore