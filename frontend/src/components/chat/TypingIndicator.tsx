'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface TypingUser {
  id: string
  name: string
  avatar?: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
  className?: string
}

export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  const [dots, setDots] = useState('')

  // Animate dots
  useEffect(() => {
    if (typingUsers.length === 0) return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [typingUsers.length])

  if (typingUsers.length === 0) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} está digitando${dots}`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} e ${typingUsers[1].name} estão digitando${dots}`
    } else {
      return `${typingUsers[0].name} e mais ${typingUsers.length - 1} pessoas estão digitando${dots}`
    }
  }

  return (
    <div className={cn(
      'flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50',
      className
    )}>
      {/* Avatars */}
      <div className="flex -space-x-1">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="h-6 w-6 border-2 border-white dark:border-gray-800">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Typing text */}
      <span className="text-sm">
        {getTypingText()}
      </span>

      {/* Animated dots */}
      <div className="flex space-x-1">
        <div 
          className={cn(
            'w-2 h-2 bg-gray-400 rounded-full animate-bounce',
            '[animation-delay:-0.3s]'
          )} 
        />
        <div 
          className={cn(
            'w-2 h-2 bg-gray-400 rounded-full animate-bounce',
            '[animation-delay:-0.15s]'
          )} 
        />
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
        />
      </div>
    </div>
  )
}

export default TypingIndicator