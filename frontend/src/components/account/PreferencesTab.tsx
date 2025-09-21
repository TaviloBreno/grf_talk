'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  AlertCircle, 
  Palette, 
  Bell, 
  Shield, 
  Globe, 
  Monitor, 
  Sun, 
  Moon,
  Save 
} from 'lucide-react'
import { PreferencesTabProps } from '@/types/account'

/**
 * Preferences Tab Component
 * 
 * Handles user preferences and settings
 * Following Single Responsibility Principle
 */
export function PreferencesTab({
  preferencesData,
  onPreferencesChange,
  onPreferencesSubmit,
  errors,
  successMessage,
  errorMessage,
  isLoading
}: PreferencesTabProps) {
  const updateNotificationSetting = (key: string, value: boolean) => {
    onPreferencesChange({
      notifications: {
        ...preferencesData.notifications,
        [key]: value
      }
    })
  }

  const updatePrivacySetting = (key: string, value: string | boolean) => {
    onPreferencesChange({
      privacy: {
        ...preferencesData.privacy,
        [key]: value
      }
    })
  }

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor }
  ]

  const languages = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español' }
  ]

  const visibilityOptions = [
    { value: 'everyone', label: 'Todos' },
    { value: 'contacts', label: 'Apenas contatos' },
    { value: 'nobody', label: 'Ninguém' }
  ]

  return (
    <Card data-testid="preferences-tab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Preferências
        </CardTitle>
        <CardDescription>
          Personalize sua experiência no aplicativo
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

        {/* Appearance Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select
                value={preferencesData.theme}
                onValueChange={(value: string) => onPreferencesChange({ theme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center gap-2">
                        <theme.icon className="h-4 w-4" />
                        {theme.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={preferencesData.language}
                onValueChange={(value: string) => onPreferencesChange({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {lang.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber emails sobre novas mensagens
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferencesData.notifications.email}
                onCheckedChange={(checked: boolean) => updateNotificationSetting('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações no dispositivo
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={preferencesData.notifications.push}
                onCheckedChange={(checked: boolean) => updateNotificationSetting('push', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="desktop-notifications">Notificações na Área de Trabalho</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificações na tela
                </p>
              </div>
              <Switch
                id="desktop-notifications"
                checked={preferencesData.notifications.desktop}
                onCheckedChange={(checked: boolean) => updateNotificationSetting('desktop', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-notifications">Sons de Notificação</Label>
                <p className="text-sm text-muted-foreground">
                  Reproduzir sons para novas mensagens
                </p>
              </div>
              <Switch
                id="sound-notifications"
                checked={preferencesData.notifications.sound}
                onCheckedChange={(checked: boolean) => updateNotificationSetting('sound', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidade
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-online-status">Mostrar Status Online</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que outros vejam quando você está online
                </p>
              </div>
              <Switch
                id="show-online-status"
                checked={preferencesData.privacy.showOnlineStatus}
                onCheckedChange={(checked: boolean) => updatePrivacySetting('showOnlineStatus', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="read-receipts">Confirmações de Leitura</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar confirmações quando ler mensagens
                </p>
              </div>
              <Switch
                id="read-receipts"
                checked={preferencesData.privacy.readReceipts}
                onCheckedChange={(checked: boolean) => updatePrivacySetting('readReceipts', checked)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Visibilidade do Perfil</Label>
                <Select
                  value={preferencesData.privacy.profileVisibility}
                  onValueChange={(value: string) => updatePrivacySetting('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-seen-visibility">Última Visualização</Label>
                <Select
                  value={preferencesData.privacy.lastSeenVisibility}
                  onValueChange={(value: string) => updatePrivacySetting('lastSeenVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onPreferencesSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Salvando...' : 'Salvar preferências'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}