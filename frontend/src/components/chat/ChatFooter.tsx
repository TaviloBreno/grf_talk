'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send,
  Paperclip,
  Image,
  FileText,
  X,
  Loader2,
  Camera,
  Mic,
  Bold,
  Italic,
  Underline
} from 'lucide-react'
import { cn } from '@/lib/utils'
import EmojiPicker from './EmojiPicker'
import AudioRecorder from './AudioRecorder'
import type { Message } from '@/types/chat'

interface ChatFooterProps {
  onSendMessage: (content: string, attachments?: File[]) => Promise<void> | void
  onSendAudio?: (audioBlob: Blob, duration: number) => Promise<void>
  onTypingStart?: () => void
  onTypingStop?: () => void
  replyingTo?: Message | null
  editingMessage?: Message | null
  onCancelReply?: () => void
  onCancelEdit?: () => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  allowAttachments?: boolean
  allowAudio?: boolean
  allowFormatting?: boolean
  className?: string
}

interface AttachmentPreview {
  file: File
  url: string
  type: 'image' | 'file'
}

export function ChatFooter({
  onSendMessage,
  onSendAudio,
  onTypingStart,
  onTypingStop,
  replyingTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  disabled = false,
  placeholder = 'Digite uma mensagem...',
  maxLength = 1000,
  allowAttachments = true,
  allowAudio = true,
  allowFormatting = false,
  className
}: ChatFooterProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  // Handle typing indicator
  useEffect(() => {
    if (onTypingStart && message.trim()) {
      onTypingStart()
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop?.()
      }, 1000)
    } else if (onTypingStop) {
      onTypingStop()
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message, onTypingStart, onTypingStop])

  // Clean up typing indicator on unmount
  useEffect(() => {
    return () => {
      if (onTypingStop) {
        onTypingStop()
      }
    }
  }, [onTypingStop])

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim()
    
    if (!trimmedMessage && attachments.length === 0) {
      return
    }
    
    if (isLoading) {
      return
    }

    try {
      setIsLoading(true)
      
      const files = attachments.map(att => att.file)
      await onSendMessage(trimmedMessage, files.length > 0 ? files : undefined)
      
      // Clear form
      setMessage('')
      setAttachments([])
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendAudio = async (audioBlob: Blob, duration: number) => {
    if (!onSendAudio) return

    try {
      setIsLoading(true)
      await onSendAudio(audioBlob, duration)
      setShowAudioRecorder(false)
    } catch (error) {
      console.error('Error sending audio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const processFiles = (files: File[]) => {
    if (files.length === 0) return

    const newAttachments: AttachmentPreview[] = []
    
    files.forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} é muito grande. Máximo permitido: 10MB`)
        return
      }

      const url = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'file'
      
      newAttachments.push({ file, url, type })
    })

    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev]
      // Revoke object URL to free memory
      URL.revokeObjectURL(newAttachments[index].url)
      newAttachments.splice(index, 1)
      return newAttachments
    })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openImageDialog = () => {
    imageInputRef.current?.click()
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newMessage = message.substring(0, start) + emoji + message.substring(end)
    
    setMessage(newMessage)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const applyFormatting = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = message.substring(start, end)
    
    if (selectedText) {
      let formattedText = ''
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`
          break
        case 'italic':
          formattedText = `*${selectedText}*`
          break
        case 'underline':
          formattedText = `__${selectedText}__`
          break
      }
      
      const newMessage = message.substring(0, start) + formattedText + message.substring(end)
      setMessage(newMessage)
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
      }, 0)
    }
  }

  const canSend = (message.trim().length > 0 || attachments.length > 0) && !isLoading && !disabled

  // Clear file inputs
  const clearFileInputs = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  useEffect(() => {
    clearFileInputs()
  }, [attachments])

  // If showing audio recorder
  if (showAudioRecorder) {
    return (
      <div className={cn(
        'border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4',
        className
      )}>
        <AudioRecorder
          onAudioReady={handleSendAudio}
          onCancel={() => setShowAudioRecorder(false)}
          disabled={disabled || isLoading}
        />
      </div>
    )
  }

  return (
    <div className={cn(
      'border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[80px]',
      className
    )}>
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="relative group bg-gray-100 dark:bg-gray-700 rounded-lg p-2 max-w-[200px]"
              >
                <div className="flex items-center space-x-2">
                  {attachment.type === 'image' ? (
                    <div className="relative">
                      <img
                        src={attachment.url}
                        alt={attachment.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(attachment.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        {/* Formatting toolbar */}
        {allowFormatting && isFocused && (
          <div className="flex items-center space-x-1 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormatting('bold')}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormatting('italic')}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormatting('underline')}
              className="h-8 w-8 p-0"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className={cn(
          'flex items-end space-x-2 rounded-lg border transition-colors',
          isFocused 
            ? 'border-blue-500 dark:border-blue-400' 
            : 'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50'
        )}>
          {/* Attachment Buttons */}
          <div className="flex items-center shrink-0 mb-1">
            {allowAttachments && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openImageDialog}
                  disabled={disabled || isLoading}
                  className="h-10 w-10"
                >
                  <Camera className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openFileDialog}
                  disabled={disabled || isLoading}
                  className="h-10 w-10"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Emoji Picker */}
            <EmojiPicker
              onEmojiSelect={insertEmoji}
              disabled={disabled || isLoading}
            />

            {/* Audio Recorder */}
            {allowAudio && onSendAudio && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAudioRecorder(true)}
                disabled={disabled || isLoading}
                className="h-10 w-10"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              maxLength={maxLength}
              className="min-h-[44px] max-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!canSend}
            size="icon"
            className={cn(
              'shrink-0 mb-1 transition-all duration-200 h-10 w-10',
              canSend 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Character Count */}
        {message.length > maxLength * 0.8 && (
          <div className="flex justify-end mt-1">
            <span className={cn(
              'text-xs',
              message.length >= maxLength 
                ? 'text-red-500' 
                : 'text-gray-500'
            )}>
              {message.length}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

export default ChatFooter