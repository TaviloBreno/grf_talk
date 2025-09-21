'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface HeaderLeftProps {
  onToggleSidebar: () => void
  isMobile?: boolean
  title?: string
}

export function HeaderLeft({ onToggleSidebar, isMobile = false, title = 'GRF Talk' }: HeaderLeftProps) {
  return (
    <div className="flex items-center gap-3">
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          aria-label="Abrir menu lateral"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      <h1 className="font-semibold text-lg">{title}</h1>
    </div>
  )
}