import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearAuth: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock user data for development
          const mockUser: User = {
            id: '1',
            name: 'Usuário Teste',
            email: email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            role: 'user',
            isOnline: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          const mockToken = 'mock-jwt-token-' + Date.now()
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            token: mockToken,
            isLoading: false 
          })
          
          // Store token in localStorage
          localStorage.setItem('auth-token', mockToken)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock user creation
          const mockUser: User = {
            id: Date.now().toString(),
            name: data.name,
            email: data.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
            role: 'user',
            isOnline: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          const mockToken = 'mock-jwt-token-' + Date.now()
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            token: mockToken,
            isLoading: false 
          })
          
          // Store token in localStorage
          localStorage.setItem('auth-token', mockToken)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token')
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null 
        })
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) throw new Error('User not authenticated')
        
        set({ isLoading: true })
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const updatedUser = {
            ...user,
            ...data,
            updatedAt: new Date()
          }
          
          set({ user: updatedUser, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true })
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
        localStorage.setItem('auth-token', token)
      },

      clearAuth: () => {
        localStorage.removeItem('auth-token')
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null 
        })
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token 
      })
    }
  )
)