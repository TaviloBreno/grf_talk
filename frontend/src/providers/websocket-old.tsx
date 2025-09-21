'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { Message, TypingUser } from '@/types/chat'
import type { User, ConnectionStatus } from '@/types'
import { useAuthStore } from '@/stores/auth-store'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionStatus: ConnectionStatus
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
  serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:8000'
}: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser[]>>({})
  
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!user || !token) return

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    setSocket(newSocket)
    setConnectionStatus('connecting')

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      setConnectionStatus('connected')
      
      // Authenticate user
      newSocket.emit('authenticate', { user_id: user.id })
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
      setConnectionStatus('disconnected')
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setConnectionStatus('error')
    })

    // Message events
    newSocket.on('new_message', (data) => {
      console.log('New message received:', data)
      // Dispatch custom event for stores to handle
      window.dispatchEvent(new CustomEvent('websocket:message:new', { detail: data.message }))
    })

    newSocket.on('message_updated', (data) => {
      console.log('Message updated:', data)
      window.dispatchEvent(new CustomEvent('websocket:message:updated', { detail: data.message }))
    })

    newSocket.on('message_deleted', (data) => {
      console.log('Message deleted:', data)
      window.dispatchEvent(new CustomEvent('websocket:message:deleted', { detail: data }))
    })

    return () => {
      newSocket.close()
    }
  }, [user, token, serverUrl])

  const joinChat = useCallback((chatId: string) => {
    if (socket) {
      socket.emit('join_chat', { chat_id: chatId })
    }
  }, [socket])

  const leaveChat = useCallback((chatId: string) => {
    if (socket) {
      socket.emit('leave_chat', { chat_id: chatId })
    }
  }, [socket])

  const sendMessage = useCallback((chatId: string, message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (socket) {
      socket.emit('send_message', { chat_id: chatId, ...message })
    }
  }, [socket])

  const sendTyping = useCallback((chatId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit(isTyping ? 'typing_start' : 'typing_stop', { chat_id: chatId })
    }
  }, [socket])

  const markMessageAsRead = useCallback((chatId: string, messageId: string) => {
    if (socket) {
      socket.emit('mark_read', { chat_id: chatId, message_id: messageId })
    }
  }, [socket])

  const value: WebSocketContextType = {
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
    <WebSocketContext.Provider value={value}>
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