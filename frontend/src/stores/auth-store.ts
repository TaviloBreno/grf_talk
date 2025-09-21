import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, LoginCredentials, RegisterCredentials } from '@/types'

// Client-side API functions
async function makeApiRequest(endpoint: string, options: RequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
  
  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Para incluir cookies
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ makeApiRequest failed:', {
      status: response.status,
      statusText: response.statusText,
      url: `${apiUrl}${endpoint}`,
      data: data
    })
    throw new Error(data.message || data.detail || `Erro ${response.status}: ${response.statusText}`)
  }

  return data
}

async function clientLoginAction(credentials: LoginCredentials) {
  try {
    console.log('🔑 Iniciando login com:', credentials.email)
    
    const result = await makeApiRequest('/accounts/signin/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    console.log('📡 Resposta da API:', result)

    if (result.success) {
      const { user, accessToken, refreshToken } = result.data
      
      console.log('✅ Login bem-sucedido, usuário:', user)
      
      // Armazenar tokens no localStorage E nos cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user_data', JSON.stringify(user))
        console.log('💾 Tokens salvos no localStorage')
        
        // TAMBÉM salvar nos cookies para o middleware
        document.cookie = `access_token=${accessToken}; path=/; max-age=${15 * 60}` // 15 minutos
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 dias
        document.cookie = `user_data=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 dias
        console.log('🍪 Tokens salvos nos cookies')
      }

      return { success: true, user }
    }

    console.log('❌ Login falhou:', result.message)
    return { success: false, error: result.message || 'Erro no login' }
  } catch (error) {
    console.error('🚨 Erro durante login:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Erro desconhecido' }
  }
}

async function clientRegisterAction(credentials: RegisterCredentials) {
  try {
    const result = await makeApiRequest('/accounts/signup/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (result.success) {
      const { user, accessToken, refreshToken } = result.data
      
      // Armazenar tokens no localStorage como fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user_data', JSON.stringify(user))
      }

      return { success: true, user }
    }

    return { success: false, error: result.message || 'Erro no registro' }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Erro desconhecido' }
  }
}

async function clientLogoutAction() {
  try {
    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
    }
    
    // Tentar fazer logout no servidor (não crítico se falhar)
    try {
      await makeApiRequest('/accounts/logout/', {
        method: 'POST',
      })
    } catch (error) {
      // Ignorar erros de logout do servidor
      console.warn('Erro ao fazer logout no servidor:', error)
    }

    return { success: true }
  } catch (error) {
    return { success: true } // Sempre considerar logout como sucesso no cliente
  }
}

// Additional types for account management
interface UpdateProfileData {
  name?: string
  email?: string
  avatar?: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

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
  updateProfile: (data: UpdateProfileData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
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
          console.log('🚀 Store: Iniciando processo de login')
          set({ isLoading: true, error: null })

          const result = await clientLoginAction(credentials)
          console.log('📥 Store: Resultado recebido:', result)

          if (result.success && result.user) {
            console.log('✅ Store: Login bem-sucedido, atualizando estado...')
            
            const newState = {
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            }
            console.log('📊 Store: Novo estado:', newState)
            
            // Atualizar estado
            set(newState)
            
            // Aguardar um pouco e verificar se o estado foi persistido
            setTimeout(() => {
              const currentState = get()
              console.log('🔍 Store: Estado atual após set:', {
                isAuthenticated: currentState.isAuthenticated, 
                user: currentState.user?.name,
                userId: currentState.user?.id
              })
              
              // Verificar localStorage também
              try {
                const stored = localStorage.getItem('auth-store')
                console.log('💾 Store: Dados no localStorage:', stored ? JSON.parse(stored) : 'nenhum')
              } catch (e) {
                console.log('❌ Store: Erro ao ler localStorage:', e)
              }
            }, 50)
            
          } else {
            console.log('❌ Store: Login falhou, limpando estado')
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: result.error || 'Falha no login',
            })
            throw new Error(result.error || 'Falha no login')
          }
        } catch (error) {
          console.error('🚨 Store: Erro no processo de login:', error)
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

          const result = await clientRegisterAction(credentials)

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

          await clientLogoutAction()

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })

          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin'
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

          // Check localStorage for user data
          if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user_data')
            const accessToken = localStorage.getItem('access_token')
            
            if (userData && accessToken) {
              const user = JSON.parse(userData)
              set({
                user,
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
          // For now, just check localStorage
          await get().checkAuth()
        } catch (error) {
          // If refresh fails, logout user
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

      // Update profile
      updateProfile: async (data: UpdateProfileData) => {
        try {
          set({ isLoading: true, error: null })

          // Simulate API call - in real app this would call an updateProfile action
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Update user data locally
          const currentUser = get().user
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              ...data,
            }
            set({
              user: updatedUser,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error('Usuário não encontrado')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      // Change password
      changePassword: async (data: ChangePasswordData) => {
        try {
          set({ isLoading: true, error: null })

          // Validate passwords match
          if (data.newPassword !== data.confirmPassword) {
            throw new Error('Senhas não coincidem')
          }

          // Simulate API call - in real app this would call a changePassword action
          await new Promise(resolve => setTimeout(resolve, 1000))

          set({
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => {
        // Use localStorage instead of sessionStorage for persistence
        if (typeof window !== 'undefined') {
          return localStorage
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
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    clearError: store.clearError,
    setUser: store.setUser,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}