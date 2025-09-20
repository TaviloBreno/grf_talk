'use client'

import React from 'react'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from './auth-provider'
import { ToastProvider } from './toast-provider'

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
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}