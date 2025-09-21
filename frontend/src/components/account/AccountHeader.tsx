'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface AccountHeaderProps {
  onBack: () => void
}

/**
 * Account Header Component
 * 
 * Handles the account page header with navigation
 * Following Single Responsibility Principle
 */
export function AccountHeader({ onBack }: AccountHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
              data-testid="back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Configurações da Conta
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerencie suas informações pessoais e preferências
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}