'use client'

import { ThemeToggle } from './ThemeToggle'
import { NewChatButton } from './NewChatButton'
import { UserMenu } from './UserMenu'

interface HeaderRightProps {
  isMobile?: boolean
  onNewChat?: () => void
}

export function HeaderRight({ isMobile = false, onNewChat }: HeaderRightProps) {
  return (
    <div className="flex items-center gap-2">
      {/* New Chat Button */}
      <NewChatButton isMobile={isMobile} onChatCreated={onNewChat} />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* User Menu */}
      <UserMenu isMobile={isMobile} />
    </div>
  )
}