import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/api/auth-api'
import type { User, LoginCredentials, RegisterCredentials } from '@/types'
import {
  loginAction,
  registerAction,
  logoutAction,
  getCurrentUserAction,
  refreshTokenAction,
} from '@/actions/auth-actions'

// Auth store state interface
interface AuthState {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Login action
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null })

          const result = await loginAction(credentials)

          if (result.success && result.user) {
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: result.error || 'Falha no login',
            })
            throw new Error(result.error || 'Falha no login')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro no login'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      // Register action
      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true, error: null })

          // Add acceptTerms: true to credentials if not present
          const fullCredentials = {
            ...credentials,
            acceptTerms: true, // Assume terms are accepted when calling register
          }

          const result = await registerAction(fullCredentials)

          if (result.success && result.user) {
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: result.error || 'Falha no registro',
            })
            throw new Error(result.error || 'Falha no registro')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro no registro'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      // Logout action
      logout: async () => {
        try {
          set({ isLoading: true, error: null })

          await logoutAction()

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })

          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        } catch (error) {
          // Always clear local state even if API call fails
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })

          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
      },

      // Check authentication status
      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null })

          const result = await getCurrentUserAction()

          if (result.success && result.user) {
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      // Refresh authentication
      refreshAuth: async () => {
        try {
          const result = await refreshTokenAction()

          if (result.success) {
            // Token refreshed successfully, get updated user data
            await get().checkAuth()
          } else {
            // Refresh failed, logout user
            await get().logout()
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          await get().logout()
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Set user
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Set error
      setError: (error: string | null) => {
        set({ error })
      },

      // Set tokens (for API client usage)
      setTokens: (accessToken: string, refreshToken: string) => {
        // This is mainly used by the API client for token refresh
        // The actual token storage is handled by server actions
        console.log('Tokens updated via store')
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => {
        // Use sessionStorage for better security
        // User data will be cleared when browser is closed
        if (typeof window !== 'undefined') {
          return sessionStorage
        }
        // Fallback storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        // Only persist user data, not loading states or errors
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Clear loading states when rehydrating
        if (state) {
          state.isLoading = false
          state.error = null
        }
      },
    }
  )
)

// Selectors for easier state access
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)

// Actions for easier access
export const useAuthActions = () => {
  const store = useAuthStore()
  return {
    login: store.login,
    register: store.register,
    logout: store.logout,
    checkAuth: store.checkAuth,
    refreshAuth: store.refreshAuth,
    clearError: store.clearError,
    setUser: store.setUser,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}