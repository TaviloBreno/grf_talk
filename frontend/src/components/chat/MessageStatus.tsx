import React from 'react'
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MessageStatus } from '@/types/chat'

interface MessageStatusProps {
  status?: MessageStatus
  viewedAt?: string
  isOwn: boolean
  className?: string
}

export function MessageStatus({ status, viewedAt, isOwn, className }: MessageStatusProps) {
  // Only show status for own messages
  if (!isOwn) return null

  const getStatusIcon = () => {
    // If message was viewed, show double check in blue
    if (viewedAt) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />
    }

    // Otherwise show status based on message status
    switch (status) {
      case 'sending':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Check className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    if (viewedAt) return 'Visto'
    
    switch (status) {
      case 'sending':
        return 'Enviando...'
      case 'sent':
        return 'Enviado'
      case 'delivered':
        return 'Entregue'
      case 'read':
        return 'Visto'
      case 'failed':
        return 'Falhou'
      default:
        return 'Enviado'
    }
  }

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      title={getStatusText()}
    >
      {getStatusIcon()}
    </div>
  )
}

export default MessageStatus