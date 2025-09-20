'use client'

import React, { createContext, useContext } from 'react'
import { toast, Toaster } from 'sonner'

interface ToastContextType {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const value: ToastContextType = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="top-right" richColors />
    </ToastContext.Provider>
  )
}