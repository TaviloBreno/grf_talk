'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Users, User as UserIcon, X, UserPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat-store'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '@/types/index'

interface NewChatDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewChatDialog({ trigger, open: controlledOpen, onOpenChange }: NewChatDialogProps) {
  const { user } = useAuthStore()
  const { createChat, isLoading } = useChatStore()
  
  const [internalOpen, setInternalOpen] = useState(false)
  const [chatType, setChatType] = useState<'private' | 'group'>('private')
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  
  const handleOpenChange = (open: boolean) => {
    if (isControlled) {
      onOpenChange?.(open)
    } else {
      setInternalOpen(open)
    }
  }

  // Mock user data - in real app, this would come from an API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
        avatar: '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        avatar: '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@exemplo.com',
        avatar: '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Ana Oliveira',
        email: 'ana@exemplo.com',
        avatar: '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    // Filter out current user
    const filtered = mockUsers.filter(u => u.id !== user?.id)
    setAvailableUsers(filtered)
  }, [user])

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
    } else {
      setSearchResults(availableUsers)
    }
  }, [searchQuery, availableUsers])

  const handleUserSelect = (user: User) => {
    if (chatType === 'private') {
      // For private chats, only allow one user
      setSelectedUsers([user])
    } else {
      // For group chats, toggle user selection
      setSelectedUsers(prev => {
        const isSelected = prev.some(u => u.id === user.id)
        if (isSelected) {
          return prev.filter(u => u.id !== user.id)
        } else {
          return [...prev, user]
        }
      })
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return

    try {
      const chatData = {
        type: chatType as 'private' | 'group',
        title: chatType === 'private' ? '' : groupName,
        description: chatType === 'group' ? groupDescription : undefined,
        participantIds: selectedUsers.map(u => u.id),
      }

      await createChat(chatData)
      
      // Reset form
      setGroupName('')
      setGroupDescription('')
      setSelectedUsers([])
      setSearchQuery('')
      setChatType('private')
      handleOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
    }
  }

  const resetForm = () => {
    setGroupName('')
    setGroupDescription('')
    setSelectedUsers([])
    setSearchQuery('')
    setChatType('private')
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const canCreateChat = () => {
    if (selectedUsers.length === 0) return false
    if (chatType === 'group' && !groupName.trim()) return false
    return true
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[500px] max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Nova Conversa</span>
          </DialogTitle>
          <DialogDescription>
            Crie uma nova conversa privada ou em grupo
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={chatType} onValueChange={(value) => setChatType(value as 'private' | 'group')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="private" className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>Privada</span>
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Grupo</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="space-y-4 mt-4">
              <div>
                <Label>Selecionar Contato</Label>
                <div className="mt-2">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar contatos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {selectedUsers.length > 0 && (
                    <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Selecionado:</span>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedUsers[0].avatar} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(selectedUsers[0].name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{selectedUsers[0].name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => handleRemoveUser(selectedUsers[0].id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className={cn(
                          'flex items-center p-2 rounded-lg cursor-pointer transition-colors',
                          'hover:bg-gray-50 dark:hover:bg-gray-800',
                          selectedUsers.some(u => u.id === user.id) && 'bg-blue-50 dark:bg-blue-900/20'
                        )}
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-blue-600 text-white text-sm">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        {selectedUsers.some(u => u.id === user.id) && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="group" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="groupName">Nome do Grupo</Label>
                  <Input
                    id="groupName"
                    placeholder="Digite o nome do grupo..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="groupDescription">Descrição (Opcional)</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="Descreva o propósito do grupo..."
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Adicionar Participantes</Label>
                  <div className="mt-2">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar contatos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {selectedUsers.length > 0 && (
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {selectedUsers.length} participante(s) selecionado(s)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedUsers.map((user) => (
                            <Badge
                              key={user.id}
                              variant="secondary"
                              className="flex items-center space-x-1"
                            >
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{user.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-3 w-3 hover:bg-red-100"
                                onClick={() => handleRemoveUser(user.id)}
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className={cn(
                            'flex items-center p-2 rounded-lg cursor-pointer transition-colors',
                            'hover:bg-gray-50 dark:hover:bg-gray-800',
                            selectedUsers.some(u => u.id === user.id) && 'bg-blue-50 dark:bg-blue-900/20'
                          )}
                        >
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-blue-600 text-white text-sm">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          {selectedUsers.some(u => u.id === user.id) ? (
                            <Check className="h-4 w-4 text-blue-600" />
                          ) : (
                            <UserPlus className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => { resetForm(); handleOpenChange(false) }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateChat} 
            disabled={!canCreateChat() || isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? 'Criando...' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}