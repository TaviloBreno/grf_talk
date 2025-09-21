'use client''use client'



import { useState, useEffect } from 'react'import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'import { Button } from '@/components/ui/button'

import {import { Input } from '@/components/ui/input'

  Dialog,import { Label } from '@/components/ui/label'

  DialogContent,import { Switch } from '@/components/ui/switch'

  DialogHeader,import { Slider } from '@/components/ui/slider'

  DialogTitle,import { Textarea } from '@/components/ui/textarea'

  DialogTrigger,import {

} from '@/components/ui/dialog'  Dialog,

import {  DialogContent,

  Tabs,  DialogHeader,

  TabsContent,  DialogTitle,

  TabsList,  DialogTrigger,

  TabsTrigger,} from '@/components/ui/dialog'

} from '@/components/ui/tabs'import {

import {   Select,

  Settings,   SelectContent,

  Save,   SelectItem,

  RotateCcw,   SelectTrigger,

  Download,  SelectValue,

  Palette,} from '@/components/ui/select'

  Bell,import {

  Shield,  Tabs,

  Image,  TabsContent,

  Cog  TabsList,

} from 'lucide-react'  TabsTrigger,

import { cn } from '@/lib/utils'} from '@/components/ui/tabs'

import { ChatSettings, ChatSettingsProps, DEFAULT_SETTINGS } from '@/types/chat-settings'import { 

import { SettingsService, SettingsApplicationService } from '@/services/settings-service'  Settings, 

import {   Bell, 

  AppearanceTab,   Shield, 

  NotificationsTab,   Palette, 

  PrivacyTab,   Download, 

  MediaTab,   Trash2,

  AdvancedTab   Volume2,

} from './settings'  VolumeX,

  Eye,

/**  EyeOff,

 * Chat Settings Dialog Component  Clock,

 *   MessageSquare,

 * Refactored for better maintainability:  Users,

 * - Separated concerns into focused tab components  Image,

 * - Reduced complexity from 664 lines to ~120 lines  FileText,

 * - Improved modularity and testability  Save,

 * - Following SOLID principles  RotateCcw

 */} from 'lucide-react'

export function ChatSettingsDialog({ chatId, className }: ChatSettingsProps) {import { cn } from '@/lib/utils'

  const [isOpen, setIsOpen] = useState(false)import { useChatStore } from '@/stores/chat'

  const [hasChanges, setHasChanges] = useState(false)import { useAuthStore } from '@/stores/auth'

  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS)

interface ChatSettings {

  // Load settings on component mount  // Appearance

  useEffect(() => {  theme: 'light' | 'dark' | 'system'

    const loadedSettings = SettingsService.loadSettings()  fontSize: number

    setSettings(loadedSettings)  messageSpacing: number

    SettingsApplicationService.applySettings(loadedSettings)  showAvatars: boolean

  }, [])  showTimestamps: boolean

  compactMode: boolean

  // Update setting handler  

  const updateSetting = <K extends keyof ChatSettings>(  // Notifications

    key: K,  enableNotifications: boolean

    value: ChatSettings[K]  enableSounds: boolean

  ): void => {  notificationSound: string

    setSettings(prev => ({ ...prev, [key]: value }))  mutedChats: string[]

    setHasChanges(true)  notifyOnMention: boolean

  }  notifyOnDM: boolean

  

  // Save settings  // Privacy

  const saveSettings = (): void => {  showOnlineStatus: boolean

    SettingsService.saveSettings(settings)  showLastSeen: boolean

    SettingsApplicationService.applySettings(settings)  showReadReceipts: boolean

    setHasChanges(false)  allowGroupInvites: boolean

  }  blockUnknownUsers: boolean

  

  // Reset settings to defaults  // Media

  const resetSettings = (): void => {  autoDownloadImages: boolean

    const defaultSettings = SettingsService.resetSettings()  autoDownloadFiles: boolean

    setSettings(defaultSettings)  maxFileSize: number

    SettingsApplicationService.applySettings(defaultSettings)  imageQuality: 'low' | 'medium' | 'high'

    setHasChanges(false)  

  }  // Advanced

  messageRetention: number // days

  // Export settings  enableEncryption: boolean

  const exportSettings = (): void => {  backupEnabled: boolean

    SettingsService.exportSettings(settings)  dataUsageOptimization: boolean

  }}



  const tabs = [interface ChatSettingsProps {

    {  chatId?: string

      id: 'appearance',  className?: string

      label: 'Aparência',}

      icon: Palette,

      component: AppearanceTabexport function ChatSettingsDialog({ chatId, className }: ChatSettingsProps) {

    },  const [isOpen, setIsOpen] = useState(false)

    {  const [hasChanges, setHasChanges] = useState(false)

      id: 'notifications',  const [settings, setSettings] = useState<ChatSettings>({

      label: 'Notificações',    // Default settings

      icon: Bell,    theme: 'system',

      component: NotificationsTab    fontSize: 14,

    },    messageSpacing: 8,

    {    showAvatars: true,

      id: 'privacy',    showTimestamps: true,

      label: 'Privacidade',    compactMode: false,

      icon: Shield,    

      component: PrivacyTab    enableNotifications: true,

    },    enableSounds: true,

    {    notificationSound: 'default',

      id: 'media',    mutedChats: [],

      label: 'Mídia',    notifyOnMention: true,

      icon: Image,    notifyOnDM: true,

      component: MediaTab    

    },    showOnlineStatus: true,

    {    showLastSeen: true,

      id: 'advanced',    showReadReceipts: true,

      label: 'Avançado',    allowGroupInvites: true,

      icon: Cog,    blockUnknownUsers: false,

      component: AdvancedTab    

    }    autoDownloadImages: true,

  ]    autoDownloadFiles: false,

    maxFileSize: 50, // MB

  return (    imageQuality: 'medium',

    <Dialog open={isOpen} onOpenChange={setIsOpen}>    

      <DialogTrigger asChild>    messageRetention: 30,

        <Button     enableEncryption: true,

          variant="ghost"     backupEnabled: true,

          size="sm"     dataUsageOptimization: false

          className={cn("gap-2", className)}  })

          data-testid="settings-trigger"

        >  const { clearCache, optimizeCache } = useChatStore()

          <Settings className="h-4 w-4" />  const { user } = useAuthStore()

          Configurações

        </Button>  // Load settings from localStorage

      </DialogTrigger>  useEffect(() => {

          const savedSettings = localStorage.getItem('chat-settings')

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">    if (savedSettings) {

        <DialogHeader>      try {

          <DialogTitle className="flex items-center gap-2">        const parsed = JSON.parse(savedSettings)

            <Settings className="h-5 w-5" />        setSettings(prev => ({ ...prev, ...parsed }))

            Configurações do Chat      } catch (error) {

          </DialogTitle>        console.error('Failed to load chat settings:', error)

        </DialogHeader>      }

    }

        <Tabs defaultValue="appearance" className="flex flex-col h-full">  }, [])

          <TabsList className="grid w-full grid-cols-5">

            {tabs.map((tab) => (  // Save settings to localStorage

              <TabsTrigger   const saveSettings = () => {

                key={tab.id}     localStorage.setItem('chat-settings', JSON.stringify(settings))

                value={tab.id}    setHasChanges(false)

                className="flex items-center gap-1 text-xs"    

              >    // Apply settings immediately

                <tab.icon className="h-3 w-3" />    applySettings(settings)

                <span className="hidden sm:inline">{tab.label}</span>  }

              </TabsTrigger>

            ))}  // Apply settings to the application

          </TabsList>  const applySettings = (newSettings: ChatSettings) => {

    // Theme

          <div className="flex-1 overflow-y-auto p-1">    if (newSettings.theme !== 'system') {

            {tabs.map((tab) => (      document.documentElement.classList.toggle('dark', newSettings.theme === 'dark')

              <TabsContent key={tab.id} value={tab.id} className="mt-0">    }

                <tab.component

                  settings={settings}    // Font size

                  onUpdateSetting={updateSetting}    document.documentElement.style.setProperty('--chat-font-size', `${newSettings.fontSize}px`)

                  hasChanges={hasChanges}    

                />    // Message spacing

              </TabsContent>    document.documentElement.style.setProperty('--message-spacing', `${newSettings.messageSpacing}px`)

            ))}

          </div>    // Compact mode

    document.documentElement.classList.toggle('compact-mode', newSettings.compactMode)

          {/* Action Buttons */}

          <div className="flex items-center justify-between gap-2 pt-4 border-t">    // Notification permissions

            <div className="flex gap-2">    if (newSettings.enableNotifications && 'Notification' in window) {

              <Button      Notification.requestPermission()

                variant="outline"    }

                size="sm"  }

                onClick={exportSettings}

                className="flex items-center gap-1"  const updateSetting = <K extends keyof ChatSettings>(

              >    key: K, 

                <Download className="h-3 w-3" />    value: ChatSettings[K]

                Exportar  ) => {

              </Button>    setSettings(prev => ({ ...prev, [key]: value }))

                  setHasChanges(true)

              <Button  }

                variant="outline"

                size="sm"  const resetSettings = () => {

                onClick={resetSettings}    const defaultSettings: ChatSettings = {

                className="flex items-center gap-1 text-red-600 hover:text-red-700"      theme: 'system',

              >      fontSize: 14,

                <RotateCcw className="h-3 w-3" />      messageSpacing: 8,

                Resetar      showAvatars: true,

              </Button>      showTimestamps: true,

            </div>      compactMode: false,

      

            <div className="flex gap-2">      enableNotifications: true,

              <Button      enableSounds: true,

                variant="outline"      notificationSound: 'default',

                onClick={() => setIsOpen(false)}      mutedChats: [],

              >      notifyOnMention: true,

                Cancelar      notifyOnDM: true,

              </Button>      

                    showOnlineStatus: true,

              <Button      showLastSeen: true,

                onClick={saveSettings}      showReadReceipts: true,

                disabled={!hasChanges}      allowGroupInvites: true,

                className="flex items-center gap-1"      blockUnknownUsers: false,

              >      

                <Save className="h-3 w-3" />      autoDownloadImages: true,

                Salvar      autoDownloadFiles: false,

              </Button>      maxFileSize: 50,

            </div>      imageQuality: 'medium',

          </div>      

        </Tabs>      messageRetention: 30,

      </DialogContent>      enableEncryption: true,

    </Dialog>      backupEnabled: true,

  )      dataUsageOptimization: false

}    }

    

export default ChatSettingsDialog    setSettings(defaultSettings)
    setHasChanges(true)
  }

  const handleClearCache = () => {
    clearCache()
    // Show success feedback
  }

  const handleOptimizeCache = () => {
    optimizeCache()
    // Show success feedback
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'chat-settings.json'
    link.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Configurações do Chat</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              Privacidade
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <Image className="h-4 w-4" />
              Mídia
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Settings className="h-4 w-4" />
              Avançado
            </TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6 overflow-y-auto max-h-96">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Tema</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => updateSetting('theme', value as any)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Tamanho da fonte: {settings.fontSize}px
                </Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]: number[]) => updateSetting('fontSize', value)}
                  min={12}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Espaçamento entre mensagens: {settings.messageSpacing}px
                </Label>
                <Slider
                  value={[settings.messageSpacing]}
                  onValueChange={([value]: number[]) => updateSetting('messageSpacing', value)}
                  min={4}
                  max={16}
                  step={2}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-avatars">Mostrar avatares</Label>
                  <Switch
                    id="show-avatars"
                    checked={settings.showAvatars}
                    onCheckedChange={(checked) => updateSetting('showAvatars', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-timestamps">Mostrar horários</Label>
                  <Switch
                    id="show-timestamps"
                    checked={settings.showTimestamps}
                    onCheckedChange={(checked) => updateSetting('showTimestamps', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-mode">Modo compacto</Label>
                  <Switch
                    id="compact-mode"
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6 overflow-y-auto max-h-96">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Notificações</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receber notificações de novas mensagens
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Sons</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reproduzir som para notificações
                  </p>
                </div>
                <Switch
                  checked={settings.enableSounds}
                  onCheckedChange={(checked) => updateSetting('enableSounds', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Notificar quando mencionado</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receber notificações quando for mencionado
                  </p>
                </div>
                <Switch
                  checked={settings.notifyOnMention}
                  onCheckedChange={(checked) => updateSetting('notifyOnMention', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Notificar mensagens diretas</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receber notificações de mensagens diretas
                  </p>
                </div>
                <Switch
                  checked={settings.notifyOnDM}
                  onCheckedChange={(checked) => updateSetting('notifyOnDM', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6 overflow-y-auto max-h-96">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Status online</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrar quando estou online
                  </p>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Última vez online</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrar quando foi visto pela última vez
                  </p>
                </div>
                <Switch
                  checked={settings.showLastSeen}
                  onCheckedChange={(checked) => updateSetting('showLastSeen', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Confirmação de leitura</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrar quando li as mensagens
                  </p>
                </div>
                <Switch
                  checked={settings.showReadReceipts}
                  onCheckedChange={(checked) => updateSetting('showReadReceipts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Convites para grupos</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permitir convites para grupos
                  </p>
                </div>
                <Switch
                  checked={settings.allowGroupInvites}
                  onCheckedChange={(checked) => updateSetting('allowGroupInvites', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Bloquear usuários desconhecidos</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bloquear mensagens de usuários não conhecidos
                  </p>
                </div>
                <Switch
                  checked={settings.blockUnknownUsers}
                  onCheckedChange={(checked) => updateSetting('blockUnknownUsers', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Media Settings */}
          <TabsContent value="media" className="space-y-6 overflow-y-auto max-h-96">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Download automático de imagens</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Baixar imagens automaticamente
                  </p>
                </div>
                <Switch
                  checked={settings.autoDownloadImages}
                  onCheckedChange={(checked) => updateSetting('autoDownloadImages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Download automático de arquivos</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Baixar arquivos automaticamente
                  </p>
                </div>
                <Switch
                  checked={settings.autoDownloadFiles}
                  onCheckedChange={(checked) => updateSetting('autoDownloadFiles', checked)}
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Tamanho máximo de arquivo: {settings.maxFileSize}MB
                </Label>
                <Slider
                  value={[settings.maxFileSize]}
                  onValueChange={([value]: number[]) => updateSetting('maxFileSize', value)}
                  min={1}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Qualidade de imagem</Label>
                <Select
                  value={settings.imageQuality}
                  onValueChange={(value) => updateSetting('imageQuality', value as any)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6 overflow-y-auto max-h-96">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  Retenção de mensagens: {settings.messageRetention} dias
                </Label>
                <Slider
                  value={[settings.messageRetention]}
                  onValueChange={([value]: number[]) => updateSetting('messageRetention', value)}
                  min={7}
                  max={365}
                  step={7}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Criptografia</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Criptografar mensagens de ponta a ponta
                  </p>
                </div>
                <Switch
                  checked={settings.enableEncryption}
                  onCheckedChange={(checked) => updateSetting('enableEncryption', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Backup automático</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fazer backup das conversas automaticamente
                  </p>
                </div>
                <Switch
                  checked={settings.backupEnabled}
                  onCheckedChange={(checked) => updateSetting('backupEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Otimização de dados</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reduzir uso de dados móveis
                  </p>
                </div>
                <Switch
                  checked={settings.dataUsageOptimization}
                  onCheckedChange={(checked) => updateSetting('dataUsageOptimization', checked)}
                />
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-medium mb-3 block">Gerenciar Cache</Label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleOptimizeCache}
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Otimizar Cache
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearCache}
                    className="w-full justify-start text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Cache
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSettings} size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar padrões
            </Button>
            <Button variant="outline" onClick={exportSettings} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={!hasChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChatSettingsDialog