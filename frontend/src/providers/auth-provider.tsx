'use client'

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { User, LoginCredentials, RegisterCredentials } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
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

  // useMemo deve ser chamado sempre, antes de qualquer retorno condicional
  const value: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    register,
  }), [user, isLoading, login, logout, register])

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, []) // Removido checkAuth da dependência para evitar loops

  if (!mounted) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}