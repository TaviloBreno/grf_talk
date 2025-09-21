'use client'

import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquarePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import ChatFooter from './ChatFooter'
import MessageItem from './MessageItem'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { useChatStore } from '@/stores/chat-store'
import { useAuthStore } from '@/stores/auth-store'
import type { Message } from '@/types/chat'

interface ChatContainerProps {
  className?: string
}

export function ChatContainer({
  className
}: ChatContainerProps) {
  // Store integration
  const { activeChat: chat, messages, sendMessage, loadMessages, updateMessage, deleteMessage } = useChatStore()
  const { user: currentUser } = useAuthStore()
  
  // Load messages when active chat changes
  useEffect(() => {
    if (chat?.id) {
      loadMessages(chat.id)
    }
  }, [chat?.id, loadMessages])

  // Poll for new messages every 1 second when a chat is active
  useEffect(() => {
    if (!chat?.id) return
    
    const interval = setInterval(() => {
      loadMessages(chat.id)
    }, 1000) // Check for new messages every 1 second

    return () => {
      clearInterval(interval)
    }
  }, [chat?.id, loadMessages])
  
  // Early return if no chat
  if (!chat) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center space-y-4">
          <MessageSquarePlus className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Selecione uma conversa</h3>
            <p className="text-muted-foreground">Escolha um chat para visualizar as mensagens</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSendMessage = async (content: string) => {
    if (!chat?.id || !content.trim()) return
    
    try {
      await sendMessage(chat.id, {
        content: content.trim(),
        type: 'text',
        attachments: []
      })
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    }
  }

  const handleEditMessage = async (message: Message) => {
    if (!chat?.id) return
    
    const newContent = prompt('Editar mensagem:', message.body)
    if (newContent && newContent.trim() !== message.body) {
      try {
        await updateMessage(chat.id, message.id, { body: newContent.trim() })
      } catch (error) {
        console.error('Erro ao editar mensagem:', error)
        alert('Erro ao editar mensagem')
      }
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!chat?.id) return
    
    if (confirm('Tem certeza que deseja deletar esta mensagem?')) {
      try {
        await deleteMessage(chat.id, messageId)
      } catch (error) {
        console.error('Erro ao deletar mensagem:', error)
        alert('Erro ao deletar mensagem')
      }
    }
  }

  // Get messages for the active chat
  const chatMessages = chat?.id ? messages[chat.id] || [] : []
  
  // Get other participant info (based on ChatList implementation)
  const participantName = chat?.name || chat?.title || 'Chat'

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">
              {participantName?.[0]?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">{participantName}</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 overflow-auto">
        <div className="space-y-4">
          {chatMessages.length > 0 ? (
            chatMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUser={currentUser!}
                isOwn={message.from_user?.id === currentUser?.id}
                showAvatar={true}
                showTimestamp={true}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm mt-2">Comece a conversar com {participantName}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Footer */}
      <div className="flex-shrink-0">
        <ChatFooter onSendMessage={handleSendMessage} />
      </div>

      {/* Connection Status - positioned absolutely to not interfere with layout */}
      <div className="absolute bottom-20 right-4">
        <ConnectionStatus />
      </div>
    </div>
  )
}

export default ChatContainer