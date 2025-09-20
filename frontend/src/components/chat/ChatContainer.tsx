'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import ChatHeader from './ChatHeader'
import ChatFooter from './ChatFooter'
import MessageItem from './MessageItem'
import TypingIndicator from './TypingIndicator'
import type { Chat, Message, TypingUser } from '@/types/chat'
import type { User } from '@/types'

interface ChatContainerProps {
  chat: Chat
  messages: Message[]
  currentUser: User
  typingUsers: TypingUser[]
  isLoading: boolean
  className?: string
  onSendMessage: (content: string, attachments?: File[]) => void
  onEditMessage: (messageId: string, content: string) => void
  onDeleteMessage: (messageId: string) => void
  onReactToMessage: (messageId: string, emoji: string) => void
  onStarMessage: (messageId: string) => void
  onReplyToMessage: (message: Message) => void
  onLoadMoreMessages: () => void
  onTypingStart: () => void
  onTypingStop: () => void
}

export function ChatContainer({
  chat,
  messages,
  currentUser,
  typingUsers,
  isLoading,
  className,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onStarMessage,
  onReplyToMessage,
  onLoadMoreMessages,
  onTypingStart,
  onTypingStop
}: ChatContainerProps) {
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      })
    }
  }, [])

  // Handle scroll events to show/hide scroll button
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    const { scrollTop, scrollHeight, clientHeight } = target
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    
    // Show button if user scrolled up more than 100px from bottom
    setShowScrollButton(distanceFromBottom > 100)
    
    // Load more messages when near top
    if (scrollTop < 100 && !isLoading) {
      onLoadMoreMessages()
    }
  }, [isLoading, onLoadMoreMessages])

  // Auto scroll on new messages (only if user is near bottom)
  useEffect(() => {
    if (messages.length > 0) {
      const scrollArea = scrollAreaRef.current
      if (scrollArea) {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight
        
        // Auto scroll if user is within 200px of bottom
        if (distanceFromBottom < 200) {
          setTimeout(() => scrollToBottom(), 100)
        }
      }
    }
  }, [messages, scrollToBottom])

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom(false)
  }, [chat.id, scrollToBottom])

  // Group messages by date
  const groupMessagesByDate = useCallback((messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ''
    let currentGroup: Message[] = []

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString()
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup })
        }
        currentDate = messageDate
        currentGroup = [message]
      } else {
        currentGroup.push(message)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup })
    }

    return groups
  }, [])

  // Group consecutive messages from same sender
  const groupConsecutiveMessages = useCallback((messages: Message[]) => {
    return messages.map((message, index) => {
      const prevMessage = messages[index - 1]
      const nextMessage = messages[index + 1]
      
      const isSameSender = prevMessage && prevMessage.senderId === message.senderId
      const isNextSameSender = nextMessage && nextMessage.senderId === message.senderId
      
      // Check if messages are within 5 minutes of each other
      const timeDiff = prevMessage 
        ? new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()
        : 0
      
      const isGrouped = isSameSender && timeDiff < 5 * 60 * 1000 // 5 minutes
      const showAvatar = !isGrouped || !isNextSameSender
      
      return {
        ...message,
        showAvatar,
        isGrouped
      }
    })
  }, [])

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }
  }

  const handleSendMessage = (content: string, attachments?: File[]) => {
    // Clear reply state after sending
    if (replyingTo) {
      setReplyingTo(null)
    }
    
    onSendMessage(content, attachments)
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
    onReplyToMessage(message)
  }

  const handleEdit = (message: Message) => {
    setEditingMessage(message)
    // Focus footer input with message content for editing
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-gray-900', className)}>
      {/* Chat Header */}
      <ChatHeader 
        chat={chat}
        currentUser={currentUser}
        className="border-b border-gray-200 dark:border-gray-700"
      />

      {/* Messages Area */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-full"
          onScrollCapture={handleScroll}
        >
          <div className="p-4 space-y-4">
            {/* Loading indicator for older messages */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Message groups by date */}
            {messageGroups.map((group) => (
              <div key={group.date} className="space-y-1">
                {/* Date header */}
                <div className="flex justify-center my-6">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                    {formatDateHeader(group.date)}
                  </div>
                </div>

                {/* Messages for this date */}
                {groupConsecutiveMessages(group.messages).map((message, index) => {
                  const isOwn = message.senderId === currentUser.id
                  
                  return (
                    <div key={message.id} ref={index === group.messages.length - 1 ? lastMessageRef : undefined}>
                      <MessageItem
                        message={message}
                        currentUser={currentUser}
                        isOwn={isOwn}
                        showAvatar={message.showAvatar}
                        showTimestamp={!message.isGrouped}
                        isGrouped={message.isGrouped}
                        onReply={handleReply}
                        onEdit={handleEdit}
                        onDelete={onDeleteMessage}
                        onReact={onReactToMessage}
                        onStar={onStarMessage}
                      />
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="px-4">
                <TypingIndicator users={typingUsers} />
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => scrollToBottom()}
              className="rounded-full shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Reply preview */}
        {replyingTo && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Respondendo a {replyingTo.sender.name}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {replyingTo.content}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelReply}
                className="ml-2 shrink-0"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Footer */}
      <ChatFooter
        onSendMessage={handleSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        onCancelReply={handleCancelReply}
        onCancelEdit={handleCancelEdit}
        className="border-t border-gray-200 dark:border-gray-700"
      />
    </div>
  )
}

export default ChatContainer