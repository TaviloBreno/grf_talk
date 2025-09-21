'use client'

import React from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ChatListProps {
  onChatSelect?: () => void
}

export function ChatList({ onChatSelect }: ChatListProps) {
  const { chatList, activeChat, setActiveChat, messages, isLoading, error } = useChatStore()
  const { user } = useAuthStore()

  // Debug: Log chat list
  console.log('🔍 ChatList Debug:', { 
    chatList, 
    chatListLength: chatList?.length, 
    isLoading, 
    error,
    user: user?.id 
  })

  const handleChatClick = (chat: any) => {
    setActiveChat(chat)
    onChatSelect?.()
  }

  const getLastMessagePreview = (chat: any) => {
    // Backend já fornece last_message no chat
    if (!chat.last_message) {
      return 'Nenhuma mensagem'
    }

    const lastMessage = chat.last_message
    
    switch (lastMessage.type) {
      case 'text':
        return lastMessage.body || lastMessage.content || 'Mensagem de texto'
      case 'image':
        return '📷 Imagem'
      case 'audio':
        return '🎵 Áudio'
      case 'file':
        return '📄 Arquivo'
      default:
        return lastMessage.body || lastMessage.content || 'Mensagem'
    }
  }

  const getLastMessageTime = (chat: any) => {
    if (!chat.last_message) {
      return ''
    }

    try {
      return formatDistanceToNow(new Date(chat.last_message.created_at), {
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return ''
    }
  }

  const getOtherParticipant = (chat: any) => {
    // Backend já fornece o 'user' (outro participante do chat)
    return {
      name: chat.user?.name || chat.user?.email || 'Usuário Desconhecido',
      avatar: chat.user?.avatar,
      id: chat.user?.id || 'unknown'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="text-center">
          <p className="text-sm text-red-500">Erro ao carregar conversas</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!chatList || chatList.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Nenhuma conversa encontrada</p>
          <p className="text-xs mt-1">Inicie um novo chat para começar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {chatList.map((chat) => {
        const otherParticipant = getOtherParticipant(chat)
        const lastMessagePreview = getLastMessagePreview(chat)
        const lastMessageTime = getLastMessageTime(chat)
        const isSelected = activeChat?.id === chat.id
        const unreadCount = (chat as any).unseen_count || 0

        return (
          <button
            key={chat.id}
            onClick={() => handleChatClick(chat)}
            className={cn(
              "w-full p-3 text-left hover:bg-accent transition-colors rounded-lg",
              isSelected && "bg-accent"
            )}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={otherParticipant.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {otherParticipant.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {otherParticipant.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {lastMessageTime && (
                      <span className="text-xs text-muted-foreground">
                        {lastMessageTime}
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <Badge variant="default" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Last Message */}
                <p className={cn(
                  "text-xs truncate",
                  unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                )}>
                  {lastMessagePreview}
                </p>

                {/* Chat Type Indicator */}
                {chat.type === 'group' && (
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-muted-foreground">
                      👥 {chat.participants?.length || 0} participantes
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}