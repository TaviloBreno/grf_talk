'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  Image, 
  Video, 
  Mic,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat'
import type { Message, MessageType } from '@/types/chat'
import type { User as UserType } from '@/types'

interface SearchFilters {
  query: string
  messageType: MessageType | 'all'
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  sender: string | 'all'
  customDateStart?: Date
  customDateEnd?: Date
}

interface MessageSearchProps {
  chatId: string
  onMessageSelect?: (message: Message) => void
  className?: string
}

export function MessageSearch({ chatId, onMessageSelect, className }: MessageSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    messageType: 'all',
    dateRange: 'all',
    sender: 'all'
  })
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { messageCache } = useChatStore()
  const chatMessages = messageCache[chatId]?.messages || []

  // Get unique senders from chat messages
  const uniqueSenders = Array.from(
    new Map(
      chatMessages.map(msg => [msg.senderId, msg.sender])
    ).values()
  )

  // Perform search
  const performSearch = (searchFilters: SearchFilters) => {
    setIsSearching(true)
    
    setTimeout(() => {
      let results = chatMessages

      // Filter by query
      if (searchFilters.query.trim()) {
        const query = searchFilters.query.toLowerCase().trim()
        results = results.filter(msg => 
          msg.content.toLowerCase().includes(query) ||
          msg.sender.name.toLowerCase().includes(query)
        )
      }

      // Filter by message type
      if (searchFilters.messageType !== 'all') {
        results = results.filter(msg => msg.type === searchFilters.messageType)
      }

      // Filter by sender
      if (searchFilters.sender !== 'all') {
        results = results.filter(msg => msg.senderId === searchFilters.sender)
      }

      // Filter by date range
      if (searchFilters.dateRange !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (searchFilters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'custom':
            if (searchFilters.customDateStart) {
              startDate = searchFilters.customDateStart
            } else {
              startDate = new Date(0)
            }
            break
          default:
            startDate = new Date(0)
        }

        const endDate = searchFilters.dateRange === 'custom' && searchFilters.customDateEnd
          ? searchFilters.customDateEnd
          : now

        results = results.filter(msg => {
          const msgDate = new Date(msg.createdAt)
          return msgDate >= startDate && msgDate <= endDate
        })
      }

      // Sort by relevance (exact matches first, then by date)
      if (searchFilters.query.trim()) {
        const query = searchFilters.query.toLowerCase().trim()
        results.sort((a, b) => {
          const aExact = a.content.toLowerCase().includes(query)
          const bExact = b.content.toLowerCase().includes(query)
          
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      } else {
        results.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }

      setSearchResults(results)
      setIsSearching(false)
    }, 300) // Debounce
  }

  // Handle search input change
  useEffect(() => {
    if (filters.query || filters.messageType !== 'all' || filters.dateRange !== 'all' || filters.sender !== 'all') {
      performSearch(filters)
    } else {
      setSearchResults([])
    }
  }, [filters, chatMessages])

  // Focus search input when dialog opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleMessageClick = (message: Message) => {
    onMessageSelect?.(message)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      messageType: 'all',
      dateRange: 'all',
      sender: 'all'
    })
  }

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Mic className="h-4 w-4" />
      case 'file':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatMessageDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
      }
      return part
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Mensagens</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Digite para buscar mensagens..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10 pr-10"
            />
            {filters.query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={filters.messageType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, messageType: value as any }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="image">Imagem</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="audio">Áudio</SelectItem>
                <SelectItem value="file">Arquivo</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-2"
            >
              <Filter className="h-3 w-3" />
              Filtros
              {showAdvancedFilters ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>

            {(filters.query || filters.messageType !== 'all' || filters.dateRange !== 'all' || filters.sender !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Remetente</label>
                  <Select
                    value={filters.sender}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os remetentes</SelectItem>
                      {uniqueSenders.map(sender => (
                        <SelectItem key={sender.id} value={sender.id}>
                          {sender.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          {(searchResults.length > 0 || filters.query) && (
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {isSearching ? 'Buscando...' : `${searchResults.length} resultado(s) encontrado(s)`}
              </span>
            </div>
          )}
        </div>

        {/* Search Results */}
        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      {getMessageTypeIcon(message.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.sender.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {message.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatMessageDate(new Date(message.createdAt))}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {highlightText(message.content, filters.query)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : filters.query || filters.messageType !== 'all' || filters.dateRange !== 'all' || filters.sender !== 'all' ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma mensagem encontrada</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Digite algo para começar a buscar</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default MessageSearch