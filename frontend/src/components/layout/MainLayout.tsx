'use client'

import React, { useState } from 'react'
import { Header } from './Header'
import { LeftSide } from './LeftSide'
import { useChatStore } from '@/stores/chat-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuthStore()
  const { activeChat } = useChatStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Carregando...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Verificando autenticação
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className={cn(
          'flex-shrink-0 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-80',
          'lg:flex'
        )}>
          <LeftSide isCollapsed={sidebarCollapsed} />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={cn(
          'lg:hidden fixed left-0 top-16 bottom-0 w-80 z-50 transform transition-transform duration-300 ease-in-out',
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        )}>
          <LeftSide isCollapsed={false} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeChat ? (
            // Chat View
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
              {/* Chat Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {activeChat.title || 'Chat'}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {activeChat.participants?.length || 0} participante(s)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Chat actions could go here */}
                  </div>
                </div>
              </div>
              
              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {children}
              </div>
              
              {/* Message Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Bem-vindo ao GRF Talk!
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Selecione uma conversa ou inicie uma nova para começar a conversar com seus contatos.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Suas conversas aparecerão na barra lateral</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Clique no botão + para criar uma nova conversa</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}