'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Search,
  Info,
  Archive,
  Trash2,
  UserPlus,
  Settings,
  VolumeX,
  Volume2,
  Star,
  Pin,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Chat, Contact } from '@/types/chat'
import type { User } from '@/types'

interface ChatHeaderProps {
  chat?: Chat
  contact?: Contact
  currentUser?: User
  isGroup?: boolean
  onBack?: () => void
  onVoiceCall?: () => void
  onVideoCall?: () => void
  onSearch?: () => void
  onInfo?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onMute?: () => void
  onUnmute?: () => void
  onStar?: () => void
  onPin?: () => void
  onAddMembers?: () => void
  className?: string
}

export function ChatHeader({
  chat,
  contact,
  currentUser,
  isGroup = false,
  onBack,
  onVoiceCall,
  onVideoCall,
  onSearch,
  onInfo,
  onArchive,
  onDelete,
  onMute,
  onUnmute,
  onStar,
  onPin,
  onAddMembers,
  className
}: ChatHeaderProps) {
  const [isMuted, setIsMuted] = useState(chat?.isMuted || false)

  // Get display data based on whether it's a group or individual chat
  const displayData = isGroup 
    ? {
        name: chat?.name || 'Grupo',
        avatar: chat?.avatar,
        status: chat?.participants ? `${chat.participants.length} participantes` : '',
        isOnline: false
      }
    : {
        name: contact?.name || 'Usuário',
        avatar: contact?.avatar,
        status: contact?.status || '',
        isOnline: contact?.isOnline || false
      }

  const handleMuteToggle = () => {
    if (isMuted) {
      onUnmute?.()
    } else {
      onMute?.()
    }
    setIsMuted(!isMuted)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Há muito tempo'
    
    const now = new Date()
    const diff = now.getTime() - lastSeen.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora mesmo'
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return lastSeen.toLocaleDateString()
  }

  const getStatusText = () => {
    if (isGroup) {
      return displayData.status
    }
    
    if (displayData.isOnline) {
      return 'Online'
    }
    
    if (contact?.lastSeen) {
      return `Visto ${formatLastSeen(contact.lastSeen)}`
    }
    
    return displayData.status || 'Offline'
  }

  const getStatusColor = () => {
    if (isGroup) return 'text-gray-500'
    return displayData.isOnline ? 'text-green-500' : 'text-gray-500'
  }

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
      className
    )}>
      {/* Left Section - Back button and User Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={displayData.avatar} alt={displayData.name} />
            <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
              {getInitials(displayData.name)}
            </AvatarFallback>
          </Avatar>
          
          {/* Online Status Indicator */}
          {!isGroup && displayData.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
          )}
        </div>

        {/* User/Group Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h2 className="font-medium text-gray-900 dark:text-white truncate">
              {displayData.name}
            </h2>
            
            {/* Badges for special statuses */}
            {chat?.isPinned && (
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                <Pin className="h-3 w-3" />
              </Badge>
            )}
            
            {chat?.isStarred && (
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                <Star className="h-3 w-3" />
              </Badge>
            )}
            
            {isMuted && (
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                <VolumeX className="h-3 w-3" />
              </Badge>
            )}
          </div>
          
          <p className={cn(
            'text-sm truncate',
            getStatusColor()
          )}>
            {getStatusText()}
          </p>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearch}
          className="hidden sm:flex"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Voice Call Button */}
        {!isGroup && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onVoiceCall}
            className="hidden sm:flex"
          >
            <Phone className="h-5 w-5" />
          </Button>
        )}

        {/* Video Call Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onVideoCall}
          className="hidden sm:flex"
        >
          <Video className="h-5 w-5" />
        </Button>

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48">
            {/* Mobile-only actions */}
            <div className="sm:hidden">
              <DropdownMenuItem onClick={onSearch}>
                <Search className="mr-2 h-4 w-4" />
                Pesquisar
              </DropdownMenuItem>
              
              {!isGroup && (
                <>
                  <DropdownMenuItem onClick={onVoiceCall}>
                    <Phone className="mr-2 h-4 w-4" />
                    Chamada de voz
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onVideoCall}>
                    <Video className="mr-2 h-4 w-4" />
                    Chamada de vídeo
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
            </div>

            {/* Common actions */}
            <DropdownMenuItem onClick={onInfo}>
              <Info className="mr-2 h-4 w-4" />
              {isGroup ? 'Info do grupo' : 'Info do contato'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onStar}>
              <Star className="mr-2 h-4 w-4" />
              {chat?.isStarred ? 'Remover estrela' : 'Adicionar estrela'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onPin}>
              <Pin className="mr-2 h-4 w-4" />
              {chat?.isPinned ? 'Desafixar' : 'Fixar conversa'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleMuteToggle}>
              {isMuted ? (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Ativar som
                </>
              ) : (
                <>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Silenciar
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Group-specific actions */}
            {isGroup && (
              <>
                <DropdownMenuItem onClick={onAddMembers}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar membros
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Archive and Delete */}
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="mr-2 h-4 w-4" />
              {chat?.isArchived ? 'Desarquivar' : 'Arquivar'}
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Deletar conversa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default ChatHeader