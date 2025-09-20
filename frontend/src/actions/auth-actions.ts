'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type ChangePasswordFormData,
} from '@/schemas/auth-schema'

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'
const USER_COOKIE = 'user_data'

// Helper function to make API requests
async function makeApiRequest(endpoint: string, options: RequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  
  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Ocorreu um erro inesperado')
  }

  return data
}

// Login action
export async function loginAction(formData: LoginFormData) {
  try {
    // Validate form data
    const validatedData = loginSchema.parse(formData)

    // Make API request
    const result = await makeApiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    })

    if (result.success) {
      const { user, accessToken, refreshToken } = result.data

      // Set cookies
      const cookieStore = await cookies()
      
      cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes
      })

      cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      cookieStore.set(USER_COOKIE, JSON.stringify(user), {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return { success: true, user }
    }

    return { success: false, error: result.message || 'Erro no login' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        fieldErrors: error.flatten().fieldErrors,
      }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Register action
export async function registerAction(formData: RegisterFormData) {
  try {
    // Validate form data
    const validatedData = registerSchema.parse(formData)

    // Remove confirmPassword and acceptTerms from API request
    const { confirmPassword, acceptTerms, ...apiData } = validatedData

    // Make API request
    const result = await makeApiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(apiData),
    })

    if (result.success) {
      const { user, accessToken, refreshToken } = result.data

      // Set cookies
      const cookieStore = await cookies()
      
      cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes
      })

      cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      cookieStore.set(USER_COOKIE, JSON.stringify(user), {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return { success: true, user }
    }

    return { success: false, error: result.message || 'Erro no registro' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        fieldErrors: error.flatten().fieldErrors,
      }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Logout action
export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    // Call API logout if token exists
    if (accessToken) {
      try {
        await makeApiRequest('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error)
      }
    }

    // Clear cookies
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)
    cookieStore.delete(USER_COOKIE)

    return { success: true }
  } catch (error) {
    // Always return success for logout to ensure user is logged out locally
    return { success: true }
  }
}

// Forgot password action
export async function forgotPasswordAction(formData: ForgotPasswordFormData) {
  try {
    // Validate form data
    const validatedData = forgotPasswordSchema.parse(formData)

    // Make API request
    const result = await makeApiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    })

    if (result.success) {
      return { success: true, message: 'Email de recuperação enviado com sucesso' }
    }

    return { success: false, error: result.message || 'Erro ao enviar email' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        fieldErrors: error.flatten().fieldErrors,
      }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Reset password action
export async function resetPasswordAction(formData: ResetPasswordFormData) {
  try {
    // Validate form data
    const validatedData = resetPasswordSchema.parse(formData)

    // Remove confirmPassword from API request
    const { confirmPassword, ...apiData } = validatedData

    // Make API request
    const result = await makeApiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(apiData),
    })

    if (result.success) {
      return { success: true, message: 'Senha alterada com sucesso' }
    }

    return { success: false, error: result.message || 'Erro ao alterar senha' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        fieldErrors: error.flatten().fieldErrors,
      }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Change password action
export async function changePasswordAction(formData: ChangePasswordFormData) {
  try {
    // Validate form data
    const validatedData = changePasswordSchema.parse(formData)

    // Remove confirmPassword from API request
    const { confirmPassword, ...apiData } = validatedData

    // Get access token
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      redirect('/auth/login')
    }

    // Make API request
    const result = await makeApiRequest('/auth/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(apiData),
    })

    if (result.success) {
      return { success: true, message: 'Senha alterada com sucesso' }
    }

    return { success: false, error: result.message || 'Erro ao alterar senha' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        fieldErrors: error.flatten().fieldErrors,
      }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Verify email action
export async function verifyEmailAction(token: string) {
  try {
    const result = await makeApiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })

    if (result.success) {
      return { success: true, message: 'Email verificado com sucesso' }
    }

    return { success: false, error: result.message || 'Token inválido ou expirado' }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Resend verification email action
export async function resendVerificationAction() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      redirect('/auth/login')
    }

    const result = await makeApiRequest('/auth/resend-verification', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (result.success) {
      return { success: true, message: 'Email de verificação reenviado' }
    }

    return { success: false, error: result.message || 'Erro ao reenviar email' }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Get current user action
export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    const userCookie = cookieStore.get(USER_COOKIE)?.value

    if (!accessToken || !userCookie) {
      return { success: false, user: null }
    }

    try {
      // Try to get fresh user data from API
      const result = await makeApiRequest('/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (result.success) {
        // Update user cookie with fresh data
        cookieStore.set(USER_COOKIE, JSON.stringify(result.data), {
          ...COOKIE_OPTIONS,
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        return { success: true, user: result.data }
      }
    } catch (apiError) {
      // If API fails, try to use cached user data
      console.warn('Failed to fetch fresh user data, using cached data:', apiError)
    }

    // Fallback to cached user data
    try {
      const user = JSON.parse(userCookie)
      return { success: true, user }
    } catch (parseError) {
      console.error('Failed to parse user cookie:', parseError)
      return { success: false, user: null }
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return { success: false, user: null }
  }
}

// Refresh token action
export async function refreshTokenAction() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' }
    }

    const result = await makeApiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })

    if (result.success) {
      const { accessToken, refreshToken: newRefreshToken } = result.data

      // Update cookies
      cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes
      })

      if (newRefreshToken) {
        cookieStore.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
          ...COOKIE_OPTIONS,
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })
      }

      return { success: true }
    }

    return { success: false, error: result.message || 'Token refresh failed' }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erro interno do servidor' }
  }
}