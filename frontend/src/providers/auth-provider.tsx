'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoading, login, logout, register, checkAuth } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [checkAuth])

  if (!mounted) {
    return null
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}