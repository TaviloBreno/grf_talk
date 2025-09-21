'use client'

import { HeaderLeft } from './header/HeaderLeft'
import { HeaderRight } from './header/HeaderRight'

interface ChatHeaderProps {
  onToggleSidebar: () => void
  onNewChat: () => void
  isMobile?: boolean
}

/**
 * Main Chat Header Component
 * 
 * Refactored for better maintainability:
 * - Separated concerns into focused components
 * - Reduced complexity from 309 lines to ~25 lines
 * - Improved testability and reusability
 * - Following SOLID principles
 */
export function ChatHeader({ onToggleSidebar, onNewChat, isMobile = false }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <HeaderLeft onToggleSidebar={onToggleSidebar} isMobile={isMobile} />
      <HeaderRight isMobile={isMobile} onNewChat={onNewChat} />
    </div>
  )
}

// Export default para compatibilidade
export default ChatHeader
