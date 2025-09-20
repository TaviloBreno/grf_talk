'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Check, 
  CheckCheck, 
  Clock, 
  MoreVertical, 
  Reply, 
  Star, 
  Copy, 
  Trash2, 
  Edit3,
  Download,
  Play,
  Pause,
  FileText,
  Image as ImageIcon,
  Video,
  Headphones
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message, MessageReaction, MessageStatus } from '@/types/chat'
import type { User } from '@/types'

interface MessageItemProps {
  message: Message
  currentUser: User
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  isGrouped?: boolean
  onReply?: (message: Message) => void
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
  onReact?: (messageId: string, emoji: string) => void
  onStar?: (messageId: string) => void
  className?: string
}

export function MessageItem({
  message,
  currentUser,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  isGrouped = false,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onStar,
  className
}: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoje'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(messageDate)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getDeliveryIcon = () => {
    if (!isOwn) return null
    
    // Use the message status or default to read for demo
    const status: MessageStatus = message.status || 'read'
    
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'failed':
        return <Clock className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
  }

  const handleAudioPlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="relative group">
                <img
                  src={attachment.url}
                  alt={attachment.originalName}
                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(attachment.url, '_blank')}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {message.content && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {message.content}
              </p>
            )}
          </div>
        )

      case 'audio':
        const audioAttachment = message.attachments[0]
        return (
          <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAudioPlayPause}
              className="shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Headphones className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Áudio</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{audioAttachment?.duration || '0:00'}</span>
                <span>•</span>
                <span>{formatFileSize(audioAttachment?.fileSize || 0)}</span>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioAttachment?.url}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )

      case 'file':
        return (
          <div className="space-y-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => window.open(attachment.url, '_blank')}
              >
                <div className="shrink-0">
                  {attachment.mimeType.startsWith('video/') ? (
                    <Video className="h-8 w-8 text-blue-500" />
                  ) : (
                    <FileText className="h-8 w-8 text-blue-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>

                <Download className="h-4 w-4 text-gray-400" />
              </div>
            ))}
            {message.content && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {message.content}
              </p>
            )}
          </div>
        )

      case 'system':
        return (
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              {message.content}
            </Badge>
          </div>
        )

      default:
        return (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {message.content}
          </p>
        )
    }
  }

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null

    // Group reactions by emoji
    const groupedReactions = message.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = []
      }
      acc[reaction.emoji].push(reaction)
      return acc
    }, {} as Record<string, MessageReaction[]>)

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(groupedReactions).map(([emoji, reactions]) => {
          const hasCurrentUser = reactions.some(r => r.userId === currentUser.id)
          
          return (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              onClick={() => onReact?.(message.id, emoji)}
              className={cn(
                'h-6 px-2 py-0 text-xs rounded-full border',
                hasCurrentUser 
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              )}
            >
              <span className="mr-1">{emoji}</span>
              <span>{reactions.length}</span>
            </Button>
          )
        })}
      </div>
    )
  }

  if (message.type === 'system') {
    return (
      <div className={cn('flex justify-center my-4', className)}>
        {renderMessageContent()}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
        isOwn && 'flex-row-reverse',
        isGrouped && 'mt-1',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {showAvatar && !isGrouped && (
        <div className="shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {getInitials(message.sender.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Spacer for grouped messages */}
      {!showAvatar && isGrouped && <div className="w-8 shrink-0" />}

      {/* Message Content */}
      <div className={cn('flex-1 min-w-0', isOwn && 'flex flex-col items-end')}>
        {/* Sender Name & Timestamp */}
        {showAvatar && !isGrouped && (
          <div className={cn(
            'flex items-baseline gap-2 mb-1',
            isOwn && 'flex-row-reverse'
          )}>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {isOwn ? 'Você' : message.sender.name}
            </span>
            {showTimestamp && (
              <span className="text-xs text-gray-500">
                {formatTime(message.createdAt)}
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'relative rounded-lg px-3 py-2 max-w-lg',
            isOwn 
              ? 'bg-blue-600 text-white ml-auto' 
              : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
          )}
        >
          {renderMessageContent()}

          {/* Message Footer */}
          <div className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOwn ? 'text-blue-100 justify-end' : 'text-gray-500'
          )}>
            {message.isEdited && (
              <span className="italic">editado</span>
            )}
            
            {showTimestamp && isGrouped && (
              <span>{formatTime(message.createdAt)}</span>
            )}
            
            {getDeliveryIcon()}
          </div>
        </div>

        {/* Reactions */}
        {renderReactions()}
      </div>

      {/* Actions Menu */}
      {isHovered && (
        <div className={cn(
          'opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
          isOwn && 'order-first'
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
              <DropdownMenuItem onClick={() => onReply?.(message)}>
                <Reply className="mr-2 h-4 w-4" />
                Responder
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onStar?.(message.id)}>
                <Star className="mr-2 h-4 w-4" />
                Favoritar
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleCopyMessage}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {isOwn && (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(message)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(message.id)}
                    className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

export default MessageItem