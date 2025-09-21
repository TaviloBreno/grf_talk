'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquarePlus, 
  Menu, 
  Sun, 
  Moon, 
  LogOut, 
  Settings,
  User,
  Users
} from 'lucide-react'

interface ChatHeaderProps {
  onToggleSidebar: () => void
  onNewChat: () => void
  isMobile?: boolean
}

export function ChatHeader({ onToggleSidebar, onNewChat, isMobile = false }: ChatHeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuthStore()
  const { setActiveChat } = useChatStore()
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/auth/signin')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      {/* Left side - Menu and Title */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="font-semibold text-lg">GRF Talk</h1>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* New Chat Button */}
        <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <MessageSquarePlus className="h-4 w-4" />
              {!isMobile && <span>Nova Conversa</span>}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conversa</DialogTitle>
              <DialogDescription>
                Selecione um usuário da lista para iniciar uma nova conversa.
              </DialogDescription>
            </DialogHeader>
            <NewChatContent onClose={() => setShowNewChatDialog(false)} />
          </DialogContent>
        </Dialog>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isMobile && <span>{user?.name}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Componente para o conteúdo do diálogo de nova conversa
function NewChatContent({ onClose }: { onClose: () => void }) {
  const { setActiveChat } = useChatStore()
  const { user: currentUser } = useAuthStore()
  const [isCreating, setIsCreating] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar usuários da API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        
        // Usar userApi ao invés de fetch direto
        const { userApi } = await import('@/api/user-api')
        const response = await userApi.getUsers()
        
        if (response.success && response.data) {
          console.log('📥 Usuários carregados:', response.data)
          // Filtrar o usuário atual da lista - response.data.data contém o array de usuários
          const allUsers = response.data.data || []
          const filteredUsers = allUsers.filter((user: any) => 
            user.email !== currentUser?.email && user.id !== currentUser?.id
          )
          setUsers(filteredUsers)
        } else {
          console.error('Erro ao carregar usuários da API')
          throw new Error('Falha na resposta da API')
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        
        // Fallback para usuários mockados (sem o usuário atual)
        const mockUsers = [
          { id: 1, name: 'Maria Santos', email: 'user2@grftalk.com', avatar: 'https://ui-avatars.com/api/?name=MS&size=200&background=85e68e&color=ffffff&bold=true&format=png' },
          { id: 2, name: 'Pedro Oliveira', email: 'user3@grftalk.com', avatar: 'https://ui-avatars.com/api/?name=PO&size=200&background=856be6&color=ffffff&bold=true&format=png' },
          { id: 3, name: 'Usuário Teste', email: 'teste@grftalk.com', avatar: 'https://ui-avatars.com/api/?name=UT&size=200&background=e68885&color=ffffff&bold=true&format=png' },
          { id: 4, name: 'Super Admin', email: 'admin@grftalk.com', avatar: 'https://ui-avatars.com/api/?name=SA&size=200&background=f39c12&color=ffffff&bold=true&format=png' },
        ].filter(user => user.email !== currentUser?.email)
        setUsers(mockUsers)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [currentUser])

  const startChat = async (selectedUser: any) => {
    if (isCreating) return
    
    try {
      setIsCreating(true)
      console.log('🚀 Iniciando chat com:', selectedUser.name)
      
      // Usar o apiClient que já tem autenticação configurada
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
      const accessToken = localStorage.getItem('access_token')
      
      console.log('📡 Enviando request para:', `${apiUrl}/chats/`)
      console.log('📨 Dados enviados:', { email: selectedUser.email })
      console.log('🔑 Token:', accessToken ? 'Presente' : 'Ausente')
      
      const response = await fetch(`${apiUrl}/chats/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: selectedUser.email
        })
      })
      
      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro do servidor:', errorData)
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }
      
      const chatData = await response.json()
      console.log('✅ Chat criado/encontrado com sucesso:', chatData)
      
      // Converter os dados do Django para o formato esperado pela store
      const chat = {
        id: chatData.id.toString(), // Converter para string se necessário
        title: chatData.user?.name || 'Chat',
        name: chatData.user?.name || 'Chat',
        avatar: chatData.user?.avatar,
        description: undefined,
        type: 'private' as const,
        participants: [], // Será populado conforme necessário
        messages: [],
        lastMessage: chatData.last_message,
        unreadCount: chatData.unseen_count || 0,
        isActive: true,
        settings: {
          isPublic: false,
          allowInvites: true,
          allowFileSharing: true,
          maxFileSize: 10,
          messageRetention: 30,
          moderationLevel: 'none' as const,
        },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date(chatData.viewed_at),
      }
      
      // Definir como chat ativo
      setActiveChat(chat)
      console.log('🎯 Chat definido como ativo:', chat)
      
      // Fechar o modal
      onClose()
      
    } catch (error) {
      console.error('❌ Erro ao criar chat:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao criar chat: ${errorMessage}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Selecione um usuário para iniciar uma conversa</span>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Carregando usuários...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum usuário disponível</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors ${
                isCreating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => !isCreating && startChat(user)}
            >
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user.name || user.email}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {isCreating && (
                <div className="text-xs text-muted-foreground">Criando...</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Export default para compatibilidade
export default ChatHeader