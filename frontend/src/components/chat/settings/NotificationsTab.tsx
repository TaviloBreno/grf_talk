'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Volume2, VolumeX, MessageSquare, Users } from 'lucide-react'
import { SettingsTabProps } from '@/types/chat-settings'

/**
 * Notifications Settings Tab Component
 * 
 * Handles notification preferences and sound settings
 * Following Single Responsibility Principle
 */
export function NotificationsTab({ settings, onUpdateSetting }: SettingsTabProps) {
  const notificationSounds = [
    { value: 'default', label: 'Padrão' },
    { value: 'pop', label: 'Pop' },
    { value: 'chime', label: 'Sino' },
    { value: 'bell', label: 'Campainha' },
    { value: 'none', label: 'Nenhum' }
  ]

  return (
    <div className="space-y-6" data-testid="notifications-settings">
      {/* Main Notifications Toggle */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notificações Gerais
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enable-notifications">Ativar Notificações</Label>
            <p className="text-sm text-muted-foreground">
              Receber notificações de novas mensagens
            </p>
          </div>
          <Switch
            id="enable-notifications"
            checked={settings.enableNotifications}
            onCheckedChange={(checked: boolean) => onUpdateSetting('enableNotifications', checked)}
          />
        </div>
      </div>

      {/* Sound Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          {settings.enableSounds ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          Sons
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enable-sounds">Ativar Sons</Label>
            <p className="text-sm text-muted-foreground">
              Reproduzir sons para notificações
            </p>
          </div>
          <Switch
            id="enable-sounds"
            checked={settings.enableSounds}
            onCheckedChange={(checked: boolean) => onUpdateSetting('enableSounds', checked)}
            disabled={!settings.enableNotifications}
          />
        </div>

        {settings.enableSounds && settings.enableNotifications && (
          <div className="space-y-2">
            <Label htmlFor="notification-sound">Som da Notificação</Label>
            <Select
              value={settings.notificationSound}
              onValueChange={(value: string) => onUpdateSetting('notificationSound', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o som" />
              </SelectTrigger>
              <SelectContent>
                {notificationSounds.map((sound) => (
                  <SelectItem key={sound.value} value={sound.value}>
                    {sound.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Specific Notification Types */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Tipos de Notificação
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-mention">Menções</Label>
              <p className="text-sm text-muted-foreground">
                Quando você for mencionado em grupos
              </p>
            </div>
            <Switch
              id="notify-mention"
              checked={settings.notifyOnMention}
              onCheckedChange={(checked: boolean) => onUpdateSetting('notifyOnMention', checked)}
              disabled={!settings.enableNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-dm">Mensagens Diretas</Label>
              <p className="text-sm text-muted-foreground">
                Notificações para conversas privadas
              </p>
            </div>
            <Switch
              id="notify-dm"
              checked={settings.notifyOnDM}
              onCheckedChange={(checked: boolean) => onUpdateSetting('notifyOnDM', checked)}
              disabled={!settings.enableNotifications}
            />
          </div>
        </div>
      </div>

      {/* Muted Chats Info */}
      {settings.mutedChats.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <VolumeX className="h-4 w-4" />
            Conversas Silenciadas
          </h4>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Você tem {settings.mutedChats.length} conversa(s) silenciada(s).
              Para reativar notificações, acesse as configurações individuais de cada conversa.
            </p>
          </div>
        </div>
      )}

      {/* Notification Permissions */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Dica:</strong> Se não estiver recebendo notificações, verifique se as permissões 
          estão habilitadas nas configurações do seu navegador.
        </p>
      </div>
    </div>
  )
}