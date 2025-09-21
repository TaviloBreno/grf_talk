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
  
  // Debug logs temporários
  console.log('🔍 ChatContainer Debug:', {
    chat: chat?.id ? `Chat ${chat.id}` : 'No chat',
    currentUser: currentUser?.id ? `User ${currentUser.id}` : 'No user',
    messagesCount: chat?.id ? (messages[chat.id] || []).length : 0
  })
  
  // Early return if no chat - removendo verificação de currentUser
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
      console.log('🚀 Enviando mensagem:', content)
      await sendMessage(chat.id, {
        content: content.trim(),
        type: 'text',
        attachments: []
      })
      console.log('✅ Mensagem enviada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    }
  }

  // Get messages for the active chat
  const chatMessages = chat?.id ? messages[chat.id] || [] : []
  
  // Get other participant info
  const otherParticipant = chat?.user || chat?.to_user || chat?.from_user
  const participantName = otherParticipant?.name || otherParticipant?.email || 'Chat'

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat Header Simples */}
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

      {/* Messages Area - SIMPLIFICADO */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {chatMessages.length > 0 ? (
            chatMessages.map((message) => (
              <div 
                key={message.id}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.from_user?.id === currentUser?.id
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div>{message.body}</div>
                <div className="text-xs opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm mt-2">Comece a conversar com {participantName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Footer - SEMPRE VISÍVEL */}
      <div 
        className="border-t bg-white dark:bg-gray-800 p-4"
        style={{ minHeight: '80px', backgroundColor: '#f0f0f0' }}
      >
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '40px' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleSendMessage(e.currentTarget.value.trim())
                e.currentTarget.value = ''
              }
            }}
          />
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            style={{ minHeight: '40px' }}
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
        {/* Debug info - SEMPRE VISÍVEL */}
        <div className="text-xs text-gray-700 mt-2 bg-yellow-100 p-2 rounded">
          Debug: Chat ID: {chat?.id} | User ID: {currentUser?.id} | Messages: {chatMessages.length}
        </div>
      </div>
    </div>
  )
}

export default ChatContainer