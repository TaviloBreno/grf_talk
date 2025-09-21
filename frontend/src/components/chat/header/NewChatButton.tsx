'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MessageSquarePlus } from 'lucide-react'

interface NewChatButtonProps {
  isMobile?: boolean
  onChatCreated?: () => void
}

export function NewChatButton({ isMobile = false, onChatCreated }: NewChatButtonProps) {
  const [showDialog, setShowDialog] = useState(false)

  const handleChatCreated = () => {
    setShowDialog(false)
    onChatCreated?.()
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5"
          data-testid="new-chat-button"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {!isMobile && <span>Nova Conversa</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
          <DialogDescription>
            Selecione um usuário da lista para iniciar uma nova conversa.
          </DialogDescription>
        </DialogHeader>
        <div>
          {/* Placeholder for NewChatDialog content */}
          <p>Nova conversa em desenvolvimento...</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}