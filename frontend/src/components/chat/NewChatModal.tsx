'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, UserPlus, Loader2 } from 'lucide-react'
import { userApi } from '@/api/user-api'
import { chatApi } from '@/api/chat-api'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import type { User } from '@/types'

interface NewChatModalProps {
  open: boolean
  onClose: () => void
  onChatCreated?: (chatId: string) => void
}

export function NewChatModal({ open, onClose, onChatCreated }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const { user: currentUser } = useAuthStore()
  const { loadChats, setActiveChat } = useChatStore()

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setUsers([])
      return
    }

    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return

    setIsLoading(true)
    try {
      const response = await userApi.searchUsers({
        query: searchQuery,
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1,
        limit: 10
      })

      if (response.success && response.data) {
        // Filter out current user
        const filteredUsers = response.data.data.filter(
          (user: User) => user.id !== currentUser?.id
        )
        setUsers(filteredUsers)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChat = async (user: User) => {
    setIsCreating(true)
    setSelectedUser(user)

    try {
      // O backend Django espera 'email' para criar chat
      const response = await chatApi.createChat({
        email: user.email
      })

      if (response.success && response.data) {
        // Recarregar lista de chats
        await loadChats()
        
        // Selecionar o novo chat (backend retorna o chat diretamente)
        setActiveChat(response.data)
        
        // Chamar callback se fornecido
        onChatCreated?.(response.data.id)
        
        // Fechar modal
        handleClose()
      }
    } catch (error) {
      console.error('Erro ao criar chat:', error)
    } finally {
      setIsCreating(false)
      setSelectedUser(null)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setUsers([])
    setSelectedUser(null)
    setIsCreating(false)
    onClose()
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Novo Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar usuário</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Digite o nome ou email do usuário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isCreating}
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Digite pelo menos 2 caracteres para buscar
              </p>
            )}

            {searchQuery.length >= 2 && users.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum usuário encontrado
              </p>
            )}

            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCreateChat(user)}
                  disabled={isCreating}
                >
                  {isCreating && selectedUser?.id === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Conversar'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}