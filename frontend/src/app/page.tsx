'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Avoid multiple redirects
    if (hasRedirected.current) return
    
    const timeoutId = setTimeout(() => {
      if (!hasRedirected.current) {
        hasRedirected.current = true
        if (isAuthenticated && user) {
          router.push('/chat')
        } else {
          router.push('/auth/signin')
        }
      }
    }, 200) // Small delay to ensure auth state is settled

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
