'use client'

import React, { useState, useMemo } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { 
  Filter, 
  Search, 
  Users, 
  User, 
  Archive, 
  Star, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Clock,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Chat } from '@/types/chat'

export type ChatFilterType = 'all' | 'unread' | 'groups' | 'direct' | 'archived' | 'starred' | 'muted'
export type ChatSortType = 'recent' | 'name' | 'unread-count' | 'created'
export type SortOrder = 'asc' | 'desc'

interface ChatFilters {
  search: string
  type: ChatFilterType
  sort: ChatSortType
  order: SortOrder
  showOnline: boolean
  showArchived: boolean
}

interface ChatFiltersProps {
  className?: string
}

export function ChatFilters({ className }: ChatFiltersProps) {
  const { chatList } = useChatStore()
  const [filters, setFilters] = useState<ChatFilters>({
    search: '',
    type: 'all',
    sort: 'recent',
    order: 'desc',
    showOnline: true,
    showArchived: false
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Filter and sort chats based on current filters
  const filteredChats = useMemo(() => {
    let result = [...chatList]

    // Search filter
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim()
      result = result.filter(chat => 
        chat.name?.toLowerCase().includes(query) ||
        chat.title?.toLowerCase().includes(query) ||
        chat.participants.some(p => 
          p.user.name.toLowerCase().includes(query) ||
          p.user.email.toLowerCase().includes(query)
        ) ||
        chat.lastMessage?.content?.toLowerCase().includes(query)
      )
    }

    // Type filter
    switch (filters.type) {
      case 'unread':
        result = result.filter(chat => chat.unreadCount && chat.unreadCount > 0)
        break
      case 'groups':
        result = result.filter(chat => chat.type === 'group')
        break
      case 'direct':
        result = result.filter(chat => chat.type === 'private')
        break
      case 'archived':
        result = result.filter(chat => chat.isArchived)
        break
      case 'starred':
        result = result.filter(chat => chat.isStarred)
        break
      case 'muted':
        result = result.filter(chat => chat.isMuted)
        break
    }

    // Archive filter
    if (!filters.showArchived) {
      result = result.filter(chat => !chat.isArchived)
    }

    // Sort
    result.sort((a, b) => {
      let compareValue = 0

      switch (filters.sort) {
        case 'recent':
          const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
          const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
          compareValue = bTime - aTime
          break
        case 'name':
          const aName = a.name || a.title || ''
          const bName = b.name || b.title || ''
          compareValue = aName.localeCompare(bName)
          break
        case 'unread-count':
          compareValue = (b.unreadCount || 0) - (a.unreadCount || 0)
          break
        case 'created':
          compareValue = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
      }

      return filters.order === 'asc' ? compareValue : -compareValue
    })

    return result
  }, [chatList, filters])

  // Update filtered chats when filters change
  useMemo(() => {
    // Count active filters
    let count = 0
    if (filters.search.trim()) count++
    if (filters.type !== 'all') count++
    if (filters.sort !== 'recent') count++
    if (filters.order !== 'desc') count++
    if (!filters.showOnline) count++
    if (filters.showArchived) count++
    
    setActiveFiltersCount(count)
  }, [filteredChats, filters])

  const updateFilter = <K extends keyof ChatFilters>(
    key: K,
    value: ChatFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      sort: 'recent',
      order: 'desc',
      showOnline: true,
      showArchived: false
    })
  }

  const getFilterTypeLabel = (type: ChatFilterType) => {
    switch (type) {
      case 'all': return 'Todas'
      case 'unread': return 'Não lidas'
      case 'groups': return 'Grupos'
      case 'direct': return 'Diretas'
      case 'archived': return 'Arquivadas'
      case 'starred': return 'Favoritas'
      case 'muted': return 'Silenciadas'
      default: return 'Todas'
    }
  }

  const getSortLabel = (sort: ChatSortType) => {
    switch (sort) {
      case 'recent': return 'Recentes'
      case 'name': return 'Nome'
      case 'unread-count': return 'Não lidas'
      case 'created': return 'Criadas'
      default: return 'Recentes'
    }
  }

  const getTypeIcon = (type: ChatFilterType) => {
    switch (type) {
      case 'unread': return MessageCircle
      case 'groups': return Users
      case 'direct': return User
      case 'archived': return Archive
      case 'starred': return Star
      case 'muted': return VolumeX
      default: return MessageCircle
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar conversas..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateFilter('search', '')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {React.createElement(getTypeIcon(filters.type), { className: 'h-3 w-3' })}
              {getFilterTypeLabel(filters.type)}
              {filters.type !== 'all' && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {filteredChats.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Tipo de conversa</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(['all', 'unread', 'groups', 'direct', 'archived', 'starred', 'muted'] as ChatFilterType[]).map(type => {
              const Icon = getTypeIcon(type)
              const count = type === 'all' ? chatList.length :
                chatList.filter(chat => {
                  switch (type) {
                    case 'unread': return chat.unreadCount && chat.unreadCount > 0
                    case 'groups': return chat.type === 'group'
                    case 'direct': return chat.type === 'private'
                    case 'archived': return chat.isArchived
                    case 'starred': return chat.isStarred
                    case 'muted': return chat.isMuted
                    default: return true
                  }
                }).length

              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => updateFilter('type', type)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {getFilterTypeLabel(type)}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {count}
                  </Badge>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {filters.order === 'asc' ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              )}
              {getSortLabel(filters.sort)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(['recent', 'name', 'unread-count', 'created'] as ChatSortType[]).map(sort => (
              <DropdownMenuItem
                key={sort}
                onClick={() => updateFilter('sort', sort)}
              >
                {getSortLabel(sort)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.order === 'asc'}
              onCheckedChange={(checked: boolean) => updateFilter('order', checked ? 'asc' : 'desc')}
            >
              Ordem crescente
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Additional Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-3 w-3" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Opções adicionais</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.showOnline}
              onCheckedChange={(checked: boolean) => updateFilter('showOnline', checked)}
            >
              Mostrar apenas online
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.showArchived}
              onCheckedChange={(checked: boolean) => updateFilter('showArchived', checked)}
            >
              Incluir arquivadas
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
            <X className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filter Summary */}
      {(filters.search || filters.type !== 'all' || activeFiltersCount > 0) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {filteredChats.length} de {chatList.length} conversas
          </span>
          {filters.search && (
            <Badge variant="outline" className="text-xs">
              "{filters.search}"
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatFilters