'use client'

import React from 'react'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ChatListProps {
  onChatSelect?: () => void
}

export function ChatList({ onChatSelect }: ChatListProps) {
  const { chats, selectedChatId, selectChat } = useChatStore()
  const { user } = useAuthStore()

  const handleChatClick = (chatId: string) => {
    selectChat(chatId)
    onChatSelect?.()
  }

  const getLastMessagePreview = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'Nenhuma mensagem'
    }

    const lastMessage = chat.messages[chat.messages.length - 1]
    
    switch (lastMessage.type) {
      case 'text':
        return lastMessage.content
      case 'image':
        return '📷 Imagem'
      case 'audio':
        return '🎵 Áudio'
      case 'file':
        return '📄 Arquivo'
      default:
        return 'Mensagem'
    }
  }

  const getLastMessageTime = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) {
      return ''
    }

    const lastMessage = chat.messages[chat.messages.length - 1]
    return formatDistanceToNow(new Date(lastMessage.timestamp), {
      addSuffix: true,
      locale: ptBR
    })
  }

  const getOtherParticipant = (chat: any) => {
    if (chat.type === 'group') {
      return {
        name: chat.name,
        avatar: chat.avatar,
        id: chat.id
      }
    }

    // Para chats privados, encontrar o outro participante
    const otherParticipant = chat.participants?.find((p: any) => p.id !== user?.id)
    return otherParticipant || {
      name: 'Usuário Desconhecido',
      avatar: null,
      id: 'unknown'
    }
  }

  if (!chats || chats.length === 0) {
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
      {chats.map((chat) => {
        const otherParticipant = getOtherParticipant(chat)
        const lastMessagePreview = getLastMessagePreview(chat)
        const lastMessageTime = getLastMessageTime(chat)
        const isSelected = selectedChatId === chat.id
        const unreadCount = chat.unreadCount || 0

        return (
          <button
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
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