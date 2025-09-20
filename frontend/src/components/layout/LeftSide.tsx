'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, MoreHorizontal, MessageCircle, Pin, Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat-store'
import { useAuthStore } from '@/stores/auth-store'
import type { Chat } from '@/types/chat'

interface LeftSideProps {
  isCollapsed?: boolean
  onNewChat?: () => void
}

export function LeftSide({ isCollapsed = false, onNewChat }: LeftSideProps) {
  const { user } = useAuthStore()
  const { 
    chatList, 
    activeChat, 
    setActiveChat, 
    isLoading,
    loadChats,
    searchQuery,
    setSearchQuery,
    searchResults
  } = useChatStore()
  
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])

  // Load chats on component mount
  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user, fetchChats])

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchChats(searchQuery)
      setFilteredChats(filtered)
    } else {
      setFilteredChats(chats)
    }
  }, [searchQuery, chats, searchChats])

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat.id)
  }

  const handleNewChat = () => {
    onNewChat?.()
  }

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5

    if (diffInHours < 1) {
      return 'Agora'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d`
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  const getParticipantName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Grupo sem nome'
    }
    
    // For direct chats, find the other participant
    const otherParticipant = chat.participants?.find(p => p.userId !== user?.id)
    return otherParticipant?.user?.name || 'Usuário'
  }

  const getParticipantAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.avatar
    }
    
    const otherParticipant = chat.participants?.find(p => p.userId !== user?.id)
    return otherParticipant?.user?.avatar
  }

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.lastMessage) {
      return 'Nenhuma mensagem'
    }

    const isOwnMessage = chat.lastMessage.senderId === user?.id
    const senderName = isOwnMessage ? 'Você' : chat.lastMessage.sender?.name || 'Alguém'
    const messageText = chat.lastMessage.content.length > 50 
      ? `${chat.lastMessage.content.substring(0, 50)}...`
      : chat.lastMessage.content

    return chat.type === 'group' 
      ? `${senderName}: ${messageText}`
      : messageText
  }

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          className="h-10 w-10"
        >
          <Plus className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 flex flex-col space-y-2 overflow-y-auto">
          {filteredChats.slice(0, 8).map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              size="icon"
              onClick={() => handleChatSelect(chat)}
              className={cn(
                'h-10 w-10 relative',
                activeChat === chat.id && 'bg-blue-100 dark:bg-blue-900'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={getParticipantAvatar(chat)} />
                <AvatarFallback className="text-xs">
                  {getParticipantName(chat).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {chat.unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                >
                  {chat.unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversas
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Carregando conversas...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
          </div>
        ) : (
          <div className="py-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={cn(
                  'flex items-center p-3 mx-2 rounded-lg cursor-pointer transition-colors',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  activeChat === chat.id && 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                )}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getParticipantAvatar(chat)} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getParticipantName(chat).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === 'group' && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      'font-medium text-sm truncate',
                      chat.unreadCount > 0 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {getParticipantName(chat)}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatLastMessageTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                      {chat.isPinned && (
                        <Pin className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className={cn(
                      'text-sm truncate',
                      chat.unreadCount > 0 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {getLastMessagePreview(chat)}
                    </p>
                    
                    <div className="flex items-center space-x-1">
                      {chat.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Pin className="mr-2 h-4 w-4" />
                            {chat.isPinned ? 'Desafixar' : 'Fixar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Arquivar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}