'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ChatList } from '@/components/chat/ChatList'
import { ChatFilters } from '@/components/chat/ChatFilters'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuthStore()
  const { chats, activeChat, setActiveChat } = useChatStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  console.log('🏠 Chat Page: Estado atual:', { isAuthenticated, user: !!user, isLoading, isInitialized })

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize and check authentication
  useEffect(() => {
    const initializeAuth = async () => {
      // Aguardar um pouco para o Zustand persist carregar
      await new Promise(resolve => setTimeout(resolve, 100))
      setIsInitialized(true)
      
      console.log('🔍 Chat Page: Verificando autenticação após inicialização')
      
      if (!isAuthenticated && !user) {
        console.log('❌ Chat Page: Não autenticado, redirecionando para login')
        router.push('/auth/signin')
      } else {
        console.log('✅ Chat Page: Usuário autenticado, carregando chat')
      }
    }

    initializeAuth()
  }, [])

  // Mostrar loading enquanto não inicializou ou está carregando
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  // Se não está autenticado após inicialização, mostrar loading (será redirecionado)
  if (!isAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Redirecionando...</span>
      </div>
    )
  }

  const handleNewChat = () => {
    // Implementar lógica para novo chat
    console.log('Novo chat')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="h-screen bg-background">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <ChatHeader 
            onToggleSidebar={toggleSidebar}
            onNewChat={handleNewChat}
            isMobile={true}
          />

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-background">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Conversas</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="p-4">
                  <ChatFilters />
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ChatList onChatSelect={() => setSidebarOpen(false)} />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Chat Area */}
          {!sidebarOpen && (
            <div className="flex-1 overflow-hidden">
              {activeChat ? (
                <ChatContainer />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <MessageSquarePlus className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Bem-vindo ao GRF Talk</h3>
                      <p className="text-muted-foreground">Selecione uma conversa para começar</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          {/* Sidebar */}
          <ResizablePanel
            defaultSize={30}
            minSize={20}
            maxSize={50}
            className={cn(
              "transition-all duration-300",
              !sidebarOpen && "min-w-0 max-w-0"
            )}
          >
            <div className="flex flex-col h-full bg-card border-r">
              {/* Sidebar Header */}
              <ChatHeader 
                onToggleSidebar={toggleSidebar}
                onNewChat={handleNewChat}
                isMobile={false}
              />

              {/* Chat Filters */}
              <div className="p-4 border-b">
                <ChatFilters />
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                <ChatList />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Chat Area */}
          <ResizablePanel defaultSize={70}>
            <div className="flex flex-col h-full">
              {/* Toggle Sidebar Button */}
              <div className="absolute top-4 left-4 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className={cn(
                    "transition-all duration-300",
                    sidebarOpen && "opacity-0 pointer-events-none"
                  )}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Content */}
              {activeChat ? (
                <ChatContainer />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <MessageSquarePlus className="h-24 w-24 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-2xl font-semibold">Bem-vindo ao GRF Talk</h3>
                      <p className="text-muted-foreground mt-2">
                        Selecione uma conversa para começar ou inicie um novo chat
                      </p>
                      <Button
                        onClick={handleNewChat}
                        className="mt-4"
                      >
                        <MessageSquarePlus className="h-4 w-4 mr-2" />
                        Novo Chat
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  )
}