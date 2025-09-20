import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Route configurations
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register', 
  '/auth/forgot-password',
  '/auth/reset-password',
]

const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/chats',
  '/settings',
]

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
]

const ADMIN_ROUTES = [
  '/admin',
]

// Helper functions
const isAuthRoute = (pathname: string): boolean => {
  return AUTH_ROUTES.some(route => pathname.startsWith(route))
}

const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

const isAdminRoute = (pathname: string): boolean => {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.includes(pathname) || 
         pathname.startsWith('/api/') ||
         pathname.startsWith('/_next/') ||
         pathname.startsWith('/favicon') ||
         pathname.includes('.')
}

// JWT verification helper
async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// API call to verify token with backend
async function verifyTokenWithAPI(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data.success ? data.data : null
    }
    
    return null
  } catch (error) {
    console.error('API token verification failed:', error)
    return null
  }
}

// Token refresh helper
async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        return {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || refreshToken,
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return response
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value
  const userCookie = request.cookies.get('user_data')?.value

  // Handle authentication routes
  if (isAuthRoute(pathname)) {
    // If user is already authenticated, redirect to dashboard
    if (accessToken && userCookie) {
      const user = await verifyJWT(accessToken) || await verifyTokenWithAPI(accessToken)
      
      if (user) {
        const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    
    // Allow access to auth routes for unauthenticated users
    return response
  }

  // Handle protected routes
  if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
    // Check if user has access token
    if (!accessToken) {
      // Try to refresh token if refresh token exists
      if (refreshToken) {
        const refreshResult = await refreshAccessToken(refreshToken)
        
        if (refreshResult) {
          // Set new tokens in response cookies
          response.cookies.set('access_token', refreshResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
          })

          if (refreshResult.refreshToken !== refreshToken) {
            response.cookies.set('refresh_token', refreshResult.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60, // 7 days
            })
          }

          // Continue with the refreshed token
          return response
        }
      }

      // No valid token, redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify access token
    let user = await verifyJWT(accessToken)
    
    // If JWT verification fails, try API verification
    if (!user) {
      user = await verifyTokenWithAPI(accessToken)
    }

    // If token is invalid, try to refresh
    if (!user && refreshToken) {
      const refreshResult = await refreshAccessToken(refreshToken)
      
      if (refreshResult) {
        // Set new tokens in response cookies
        response.cookies.set('access_token', refreshResult.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60, // 15 minutes
        })

        if (refreshResult.refreshToken !== refreshToken) {
          response.cookies.set('refresh_token', refreshResult.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
          })
        }

        // Continue with the refreshed token
        return response
      }
    }

    // If still no valid user, redirect to login
    if (!user) {
      // Clear invalid cookies
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      response.cookies.delete('user_data')

      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('expired', 'true')
      return NextResponse.redirect(loginUrl)
    }

    // Check admin routes
    if (isAdminRoute(pathname)) {
      let userRole: string | null = null
      
      if (user && typeof user === 'object' && 'role' in user) {
        userRole = user.role as string
      } else if (userCookie) {
        try {
          const userData = JSON.parse(userCookie)
          userRole = userData.role
        } catch (error) {
          console.error('Failed to parse user cookie:', error)
        }
      }
      
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Add user info to request headers for server components
    if (user && typeof user === 'object') {
      const userId = (user as any).id || (user as any).userId || ''
      const userRole = (user as any).role || ''
      const userEmail = (user as any).email || ''
      
      response.headers.set('x-user-id', String(userId))
      response.headers.set('x-user-role', String(userRole))
      response.headers.set('x-user-email', String(userEmail))
    }
  }

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}