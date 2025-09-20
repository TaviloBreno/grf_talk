'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'

export default function DashboardPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const { chatList, loadChats } = useChatStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isAuthenticated) {
      loadChats()
    }
  }, [isAuthenticated, loadChats])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Não autenticado</h1>
          <p className="text-gray-600 mb-4">Você precisa fazer login para acessar o dashboard.</p>
          <a 
            href="/auth/login" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Fazer Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {user?.name}</span>
              <button 
                onClick={() => useAuthStore.getState().logout()}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Informações do Usuário
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.email}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Role: </span>
                  <span className="text-gray-500">{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Chats Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{chatList.length}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Chats Ativos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {chatList.length} conversas
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/chats" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Ver todos os chats
                  </a>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Status da Aplicação
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Sistema Online
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    Todos os sistemas funcionando
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Chats */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Chats Recentes
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Suas conversas mais recentes
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {chatList.length > 0 ? (
                  chatList.slice(0, 5).map((chat) => (
                    <li key={chat.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-bold">
                                {chat.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {chat.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {chat.description || 'Sem descrição'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {chat.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {chat.participants.length} participantes
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="px-4 py-4 text-center text-gray-500">
                      Nenhum chat encontrado. Crie seu primeiro chat!
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}