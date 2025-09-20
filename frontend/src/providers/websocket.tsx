'use client'

import { createContext, useContext } from 'react'
import type { Message, TypingUser } from '@/types/chat'
import type { User } from '@/types'

interface WebSocketContextType {
  socket: null
  isConnected: false
  connectionStatus: 'disconnected'
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
  // WebSocket temporariamente desabilitado para resolver problemas de performance
  const value: WebSocketContextType = {
    socket: null,
    isConnected: false,
    connectionStatus: 'disconnected',
    joinChat: () => {},
    leaveChat: () => {},
    sendMessage: () => {},
    sendTyping: () => {},
    markMessageAsRead: () => {},
    onlineUsers: [],
    typingUsers: {}
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