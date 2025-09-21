'use client'

import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquarePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import ChatFooter from './ChatFooter'
import MessageItem from './MessageItem'
import ConnectionStatus from '@/components/ui/connection-status'
import { useChatStore } from '@/stores/chat-store'
import { useAuthStore } from '@/stores/auth-store'

interface ChatContainerProps {
  className?: string
}

export function ChatContainer({
  className
}: ChatContainerProps) {
  // Store integration
  const { activeChat: chat, messages, sendMessage, loadMessages } = useChatStore()
  const { user: currentUser } = useAuthStore()
  
  // Load messages when active chat changes
  useEffect(() => {
    if (chat?.id) {
      loadMessages(chat.id)
    }
  }, [chat?.id, loadMessages])

  // Poll for new messages every 3 seconds when a chat is active
  useEffect(() => {
    if (!chat?.id) return
    
    const interval = setInterval(() => {
      loadMessages(chat.id)
    }, 3000) // Check for new messages every 3 seconds

    return () => {
      clearInterval(interval)
    }
  }, [chat?.id, loadMessages])
  
  // Get messages for the active chat
  const chatMessages = chat?.id ? messages[chat.id] || [] : []
  
  // Get other participant info
  const otherParticipant = chat?.user || chat?.to_user || chat?.from_user
  const participantName = otherParticipant?.name || otherParticipant?.email || 'Chat'
  
  // Early return if no chat or user
  if (!chat || !currentUser) {
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

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!chat?.id || !content.trim()) return
    
    try {
      await sendMessage(chat.id, {
        content: content.trim(),
        type: 'text',
        attachments: attachments || []
      })
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      
      // Mostrar mensagem de erro mais específica
      let errorMessage = 'Erro ao enviar mensagem'
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        } else if ('type' in error && error.type === 'api' && 'status' in error) {
          const msg = 'message' in error && typeof error.message === 'string' ? error.message : 'Falha na API'
          errorMessage = `Erro ${error.status}: ${msg}`
        }
      }
      
      // TODO: Mostrar toast ou notificação para o usuário
      alert(errorMessage)
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat Header Simples para container de chat */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
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
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chatMessages.length > 0 ? (
            chatMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUser={currentUser}
                isOwn={message.from_user?.id === currentUser.id}
                showAvatar={true}
                showTimestamp={true}
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
      <div className="mt-auto border-t bg-white p-4">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            className="flex-1 border rounded-lg px-3 py-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleSendMessage(e.currentTarget.value.trim())
                e.currentTarget.value = ''
              }
            }}
          />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement
              if (input && input.value.trim()) {
                handleSendMessage(input.value.trim())
                input.value = ''
              }
            }}
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />
    </div>
  )
}

export default ChatContainer