'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquarePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import ChatFooter from './ChatFooter'
import ConnectionStatus from '@/components/ui/connection-status'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth-store'

interface ChatContainerProps {
  className?: string
}

export function ChatContainer({
  className
}: ChatContainerProps) {
  // Store integration
  const { activeChat: chat } = useChatStore()
  const { user: currentUser } = useAuthStore()
  
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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat Header Simples para container de chat */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">
              {chat?.name?.[0]?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">{chat?.name || 'Chat'}</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Mock messages for now */}
          <div className="text-center text-muted-foreground py-8">
            <p>Mensagens serão exibidas aqui</p>
            <p className="text-sm mt-2">Chat: {chat.name}</p>
          </div>
        </div>
      </ScrollArea>

      {/* Chat Footer */}
      <ChatFooter
        onSendMessage={(content: string, attachments?: File[]) => {
          console.log('Enviando mensagem:', { content, attachments })
        }}
        disabled={false}
      />

      {/* Connection Status */}
      <ConnectionStatus />
    </div>
  )
}

export default ChatContainer