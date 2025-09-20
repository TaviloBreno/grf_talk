'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'
import type { Message, Chat, TypingUser } from '@/types/chat'
import type { User } from '@/types'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  sendMessage: (chatId: string, message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>) => void
  sendTyping: (chatId: string, isTyping: boolean) => void
  markMessageAsRead: (chatId: string, messageId: string) => void
  onlineUsers: User[]
  typingUsers: Record<string, TypingUser[]>
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: React.ReactNode
  serverUrl?: string
}

export function WebSocketProvider({ 
  children, 
  serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001'
}: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser[]>>({})
  
  const { user, isAuthenticated } = useAuthStore()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    const connect = () => {
      setConnectionStatus('connecting')
      
      const newSocket = io(serverUrl, {
        auth: {
          userId: user.id,
          token: localStorage.getItem('auth-token')
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      })

      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        
        // Join user to their personal room for direct messages
        newSocket.emit('user:online', { userId: user.id })
      })

      newSocket.on('disconnect', (reason: string) => {
        console.log('❌ WebSocket disconnected:', reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        
        // Auto-reconnect logic
        if (reason === 'io server disconnect') {
          // Server disconnected, manual reconnection needed
          handleReconnect()
        }
      })

      newSocket.on('connect_error', (error: Error) => {
        console.error('🔴 WebSocket connection error:', error)
        setConnectionStatus('error')
        handleReconnect()
      })

      // User presence events
      newSocket.on('user:online', (userData: User) => {
        setOnlineUsers(prev => {
          const exists = prev.find(u => u.id === userData.id)
          if (exists) return prev
          return [...prev, userData]
        })
      })

      newSocket.on('user:offline', (userId: string) => {
        setOnlineUsers(prev => prev.filter(u => u.id !== userId))
      })

      newSocket.on('users:online', (users: User[]) => {
        setOnlineUsers(users)
      })

      // Typing events
      newSocket.on('typing:start', ({ chatId, user: typingUser }: { chatId: string, user: TypingUser }) => {
        setTypingUsers(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []).filter(u => u.id !== typingUser.id), typingUser]
        }))
      })

      newSocket.on('typing:stop', ({ chatId, userId }: { chatId: string, userId: string }) => {
        setTypingUsers(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter(u => u.id !== userId)
        }))
      })

      // Message events
      newSocket.on('message:new', (message: Message) => {
        // This will be handled by the chat store or context
        window.dispatchEvent(new CustomEvent('websocket:message:new', { detail: message }))
      })

      newSocket.on('message:updated', (message: Message) => {
        window.dispatchEvent(new CustomEvent('websocket:message:updated', { detail: message }))
      })

      newSocket.on('message:deleted', ({ messageId, chatId }: { messageId: string, chatId: string }) => {
        window.dispatchEvent(new CustomEvent('websocket:message:deleted', { detail: { messageId, chatId } }))
      })

      newSocket.on('message:read', ({ messageId, chatId, userId }: { messageId: string, chatId: string, userId: string }) => {
        window.dispatchEvent(new CustomEvent('websocket:message:read', { detail: { messageId, chatId, userId } }))
      })

      // Chat events
      newSocket.on('chat:updated', (chat: Chat) => {
        window.dispatchEvent(new CustomEvent('websocket:chat:updated', { detail: chat }))
      })

      newSocket.on('chat:user_joined', ({ chatId, user: newUser }: { chatId: string, user: User }) => {
        window.dispatchEvent(new CustomEvent('websocket:chat:user_joined', { detail: { chatId, user: newUser } }))
      })

      newSocket.on('chat:user_left', ({ chatId, userId }: { chatId: string, userId: string }) => {
        window.dispatchEvent(new CustomEvent('websocket:chat:user_left', { detail: { chatId, userId } }))
      })

      setSocket(newSocket)
    }

    const handleReconnect = () => {
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
        
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, delay)
      } else {
        console.error('❌ Max reconnection attempts reached')
        setConnectionStatus('error')
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.disconnect()
      }
    }
  }, [isAuthenticated, user, serverUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.emit('user:offline', { userId: user?.id })
        socket.disconnect()
      }
    }
  }, [socket, user])

  // WebSocket methods
  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:join', { chatId })
    }
  }

  const leaveChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:leave', { chatId })
    }
  }

  const sendMessage = (chatId: string, message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (socket && isConnected) {
      socket.emit('message:send', { chatId, message })
    }
  }

  const sendTyping = (chatId: string, isTyping: boolean) => {
    if (socket && isConnected && user) {
      if (isTyping) {
        socket.emit('typing:start', { 
          chatId, 
          user: { 
            id: user.id, 
            name: user.name, 
            avatar: user.avatar 
          } 
        })
      } else {
        socket.emit('typing:stop', { chatId, userId: user.id })
      }
    }
  }

  const markMessageAsRead = (chatId: string, messageId: string) => {
    if (socket && isConnected && user) {
      socket.emit('message:read', { chatId, messageId, userId: user.id })
    }
  }

  const contextValue: WebSocketContextType = {
    socket,
    isConnected,
    connectionStatus,
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
    markMessageAsRead,
    onlineUsers,
    typingUsers
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export default WebSocketProvider