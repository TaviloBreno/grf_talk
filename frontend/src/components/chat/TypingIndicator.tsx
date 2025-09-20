'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { TypingUser } from '@/types/chat'

interface TypingIndicatorProps {
  users: TypingUser[]
  className?: string
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  const [dots, setDots] = useState('')

  // Animate dots
  useEffect(() => {
    if (users.length === 0) return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [users.length])

  if (users.length === 0) {
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
    if (users.length === 1) {
      return `${users[0].name} está digitando${dots}`
    } else if (users.length === 2) {
      return `${users[0].name} e ${users[1].name} estão digitando${dots}`
    } else {
      return `${users[0].name} e mais ${users.length - 1} pessoas estão digitando${dots}`
    }
  }

  return (
    <div className={cn(
      'flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50',
      className
    )}>
      {/* Avatars */}
      <div className="flex -space-x-1">
        {users.slice(0, 3).map((user: TypingUser) => (
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