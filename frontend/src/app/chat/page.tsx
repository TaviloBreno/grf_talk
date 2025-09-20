'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import { useEffect } from 'react'

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const { activeChat } = useChatStore()

  useEffect(() => {
    // Initialize chat data when component mounts
    console.log('Chat page mounted, user:', user?.name)
  }, [user])

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Carregando...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Iniciando aplicação
          </p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      {activeChat ? (
        <div className="space-y-4">
          {/* Sample messages - in real app, these would come from the store */}
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
              <p className="text-gray-900 dark:text-white text-sm">
                Olá! Como você está?
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                10:30
              </span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="bg-blue-600 rounded-lg p-3 max-w-xs">
              <p className="text-white text-sm">
                Oi! Estou bem, obrigado! E você?
              </p>
              <span className="text-xs text-blue-200 mt-1 block">
                10:32
              </span>
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
              <p className="text-gray-900 dark:text-white text-sm">
                Também estou bem! Que bom te ver por aqui.
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                10:33
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Nenhuma conversa selecionada</p>
        </div>
      )}
    </MainLayout>
  )
}