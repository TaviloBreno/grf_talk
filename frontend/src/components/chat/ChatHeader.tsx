'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/stores/auth-store'
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
  const [users, setUsers] = useState([
    { id: 1, name: 'Maria Santos', email: 'user2@grftalk.com', avatar: 'https://ui-avatars.com/api/?name=MS&size=200&background=85e68e&color=ffffff&bold=true&format=png', initials: 'MS' },
    { id: 2, name: 'Pedro Oliveira', email: 'user3@grftalk.com', avatar: 'https://ui-avatars.com/api/?name=PO&size=200&background=856be6&color=ffffff&bold=true&format=png', initials: 'PO' },
    { id: 3, name: 'Usuário Teste', email: 'teste@grftalk.com', avatar: 'https://ui-avatars.com/api/?name=UT&size=200&background=e68885&color=ffffff&bold=true&format=png', initials: 'UT' },
    { id: 4, name: 'Super Admin', email: 'admin@grftalk.com', avatar: 'https://ui-avatars.com/api/?name=SA&size=200&background=f39c12&color=ffffff&bold=true&format=png', initials: 'SA' },
  ])

  const startChat = (user: any) => {
    console.log('Iniciando chat com:', user.name)
    // Aqui você implementaria a lógica para criar um novo chat
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Selecione um usuário para iniciar uma conversa</span>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
            onClick={() => startChat(user)}
          >
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Export default para compatibilidade
export default ChatHeader