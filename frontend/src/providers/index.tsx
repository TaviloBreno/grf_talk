'use client'

import React from 'react'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from './auth-provider'
import { ToastProvider } from './toast-provider'
import { WebSocketProvider } from './websocket'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <WebSocketProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}