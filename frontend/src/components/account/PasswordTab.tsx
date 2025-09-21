'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Lock, Save } from 'lucide-react'
import { PasswordTabProps } from '@/types/account'

/**
 * Password Tab Component
 * 
 * Handles password change functionality
 * Following Single Responsibility Principle
 */
export function PasswordTab({
  passwordData,
  onPasswordChange,
  onPasswordSubmit,
  errors,
  successMessage,
  errorMessage,
  isLoading
}: PasswordTabProps) {
  return (
    <Card data-testid="password-tab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Alterar Senha
        </CardTitle>
        <CardDescription>
          Mantenha sua conta segura com uma senha forte
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Messages */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Password Fields */}
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha atual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => onPasswordChange('currentPassword', e.target.value)}
                className={errors.currentPassword ? 'border-red-500' : ''}
                placeholder="Digite sua senha atual"
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => onPasswordChange('newPassword', e.target.value)}
                className={errors.newPassword ? 'border-red-500' : ''}
                placeholder="Digite sua nova senha"
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => onPasswordChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'border-red-500' : ''}
                placeholder="Confirme sua nova senha"
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Password Requirements */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Requisitos da senha:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Mínimo de 8 caracteres</li>
            <li>• Pelo menos uma letra maiúscula</li>
            <li>• Pelo menos uma letra minúscula</li>
            <li>• Pelo menos um número</li>
            <li>• Pelo menos um caractere especial (@, #, $, etc.)</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={onPasswordSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}