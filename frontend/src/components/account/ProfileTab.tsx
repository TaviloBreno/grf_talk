'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, AlertCircle, Camera, User, Mail, Save } from 'lucide-react'
import { ProfileTabProps } from '@/types/account'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Profile Tab Component
 * 
 * Handles user profile information editing
 * Following Single Responsibility Principle
 */
export function ProfileTab({
  profileData,
  onProfileChange,
  onProfileSubmit,
  errors,
  successMessage,
  errorMessage,
  isLoading,
  onClearMessages
}: ProfileTabProps) {
  const { user } = useAuthStore()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onProfileChange('avatar', result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card data-testid="profile-tab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações do Perfil
        </CardTitle>
        <CardDescription>
          Atualize suas informações pessoais e foto de perfil
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

        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={profileData.avatar || user?.avatar} 
              alt={profileData.name || user?.name} 
            />
            <AvatarFallback className="text-lg">
              {(profileData.name || user?.name)?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="avatar-upload">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                <Camera className="h-4 w-4" />
                <span>Alterar foto</span>
              </div>
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              JPG, PNG ou GIF. Máximo 5MB.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => onProfileChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Seu nome completo"
              />
              <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => onProfileChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="seu@email.com"
              />
              <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={onProfileSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}