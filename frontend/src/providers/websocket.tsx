'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { Message, TypingUser } from '@/types/chat'
import type { User, ConnectionStatus } from '@/types'
import { useAuthStore } from '@/stores/auth-store'
import { PollingManager } from '@/lib/polling-manager'

interface WebSocketContextType {
  socket: null
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
  serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser[]>>({})
  const [lastPollTimestamp, setLastPollTimestamp] = useState<number | null>(null)
  const pollingManagerRef = useRef<PollingManager | null>(null)
  
  const { user } = useAuthStore()
  
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  // Event polling system
  useEffect(() => {
    const token = getAuthToken()
    
    if (!user || !token) {
      setIsConnected(false)
      setConnectionStatus('disconnected')
      
      // Stop existing polling
      if (pollingManagerRef.current) {
        pollingManagerRef.current.stopPolling()
        pollingManagerRef.current = null
      }
      return
    }

    setConnectionStatus('connecting')

    // Create polling manager if it doesn't exist
    if (!pollingManagerRef.current) {
      pollingManagerRef.current = new PollingManager({
        baseInterval: 3000,
        maxInterval: 15000,
        backoffMultiplier: 1.5,
        maxRetries: 5
      })
    }

    const pollFunction = async () => {
      try {
        const url = new URL(`${serverUrl}/events/poll/`)
        if (lastPollTimestamp) {
          url.searchParams.set('since', lastPollTimestamp.toString())
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - will be handled by PollingManager
            throw new Error(`Rate limited: ${response.status}`)
          }
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setLastPollTimestamp(data.timestamp)

        // Process events
        data.events.forEach((event: any) => {
          console.log('Processing event:', event)
          
          switch (event.type) {
            case 'new_message':
              window.dispatchEvent(new CustomEvent('websocket:message:new', { 
                detail: event.data.message 
              }))
              break
              
            case 'message_updated':
              window.dispatchEvent(new CustomEvent('websocket:message:updated', { 
                detail: event.data.message 
              }))
              break
              
            case 'message_deleted':
              window.dispatchEvent(new CustomEvent('websocket:message:deleted', { 
                detail: {
                  messageId: event.data.message_id,
                  chatId: event.data.chat_id
                }
              }))
              break
              
            case 'chat_updated':
              window.dispatchEvent(new CustomEvent('websocket:chat:updated', { 
                detail: event.data.chat 
              }))
              break
          }
        })

        if (!isConnected) {
          setIsConnected(true)
          setConnectionStatus('connected')
        }

      } catch (error) {
        console.error('Event polling error:', error)
        setConnectionStatus('error')
        setIsConnected(false)
        throw error // Re-throw to let PollingManager handle backoff
      }
    }

    // Start polling
    pollingManagerRef.current.startPolling(pollFunction)

    return () => {
      if (pollingManagerRef.current) {
        pollingManagerRef.current.stopPolling()
      }
    }
  }, [user, serverUrl]) // Simplified dependencies

  // Cleanup and tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (pollingManagerRef.current) {
        // Adjust polling based on tab visibility
        pollingManagerRef.current.setActiveState(!document.hidden)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const joinChat = useCallback((chatId: string) => {
    // No action needed for polling-based system
  }, [])

  const leaveChat = useCallback((chatId: string) => {
    // No action needed for polling-based system
  }, [])

  const sendMessage = useCallback((chatId: string, message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Messages are sent via REST API, not WebSocket
  }, [])

  const sendTyping = useCallback((chatId: string, isTyping: boolean) => {
    // Typing indicators not implemented in polling system yet
  }, [])

  const markMessageAsRead = useCallback((chatId: string, messageId: string) => {
    // Mark as read via REST API
  }, [])

  const value: WebSocketContextType = {
    socket: null,
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