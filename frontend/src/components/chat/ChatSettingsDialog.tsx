'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Clock,
  MessageSquare,
  Users,
  Image,
  FileText,
  Save,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'

interface ChatSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system'
  fontSize: number
  messageSpacing: number
  showAvatars: boolean
  showTimestamps: boolean
  compactMode: boolean
  
  // Notifications
  enableNotifications: boolean
  enableSounds: boolean
  notificationSound: string
  mutedChats: string[]
  notifyOnMention: boolean
  notifyOnDM: boolean
  
  // Privacy
  showOnlineStatus: boolean
  showLastSeen: boolean
  showReadReceipts: boolean
  allowGroupInvites: boolean
  blockUnknownUsers: boolean
  
  // Media
  autoDownloadImages: boolean
  autoDownloadFiles: boolean
  maxFileSize: number
  imageQuality: 'low' | 'medium' | 'high'
  
  // Advanced
  messageRetention: number // days
  enableEncryption: boolean
  backupEnabled: boolean
  dataUsageOptimization: boolean
}

interface ChatSettingsProps {
  chatId?: string
  className?: string
}

export function ChatSettingsDialog({ chatId, className }: ChatSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState<ChatSettings>({
    // Default settings
    theme: 'system',
    fontSize: 14,
    messageSpacing: 8,
    showAvatars: true,
    showTimestamps: true,
    compactMode: false,
    
    enableNotifications: true,
    enableSounds: true,
    notificationSound: 'default',
    mutedChats: [],
    notifyOnMention: true,
    notifyOnDM: true,
    
    showOnlineStatus: true,
    showLastSeen: true,
    showReadReceipts: true,
    allowGroupInvites: true,
    blockUnknownUsers: false,
    
    autoDownloadImages: true,
    autoDownloadFiles: false,
    maxFileSize: 50, // MB
    imageQuality: 'medium',
    
    messageRetention: 30,
    enableEncryption: true,
    backupEnabled: true,
    dataUsageOptimization: false
  })

  const { clearCache, optimizeCache } = useChatStore()
  const { user } = useAuthStore()

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chat-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to load chat settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('chat-settings', JSON.stringify(settings))
    setHasChanges(false)
    
    // Apply settings immediately
    applySettings(settings)
  }

  // Apply settings to the application
  const applySettings = (newSettings: ChatSettings) => {
    // Theme
    if (newSettings.theme !== 'system') {
      document.documentElement.classList.toggle('dark', newSettings.theme === 'dark')
    }

    // Font size
    document.documentElement.style.setProperty('--chat-font-size', `${newSettings.fontSize}px`)
    
    // Message spacing
    document.documentElement.style.setProperty('--message-spacing', `${newSettings.messageSpacing}px`)

    // Compact mode
    document.documentElement.classList.toggle('compact-mode', newSettings.compactMode)

    // Notification permissions
    if (newSettings.enableNotifications && 'Notification' in window) {
      Notification.requestPermission()
    }
  }

  const updateSetting = <K extends keyof ChatSettings>(
    key: K, 
    value: ChatSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const resetSettings = () => {
    const defaultSettings: ChatSettings = {
      theme: 'system',
      fontSize: 14,
      messageSpacing: 8,
      showAvatars: true,
      showTimestamps: true,
      compactMode: false,
      
      enableNotifications: true,
      enableSounds: true,
      notificationSound: 'default',
      mutedChats: [],
      notifyOnMention: true,
      notifyOnDM: true,
      
      showOnlineStatus: true,
      showLastSeen: true,
      showReadReceipts: true,
      allowGroupInvites: true,
      blockUnknownUsers: false,
      
      autoDownloadImages: true,
      autoDownloadFiles: false,
      maxFileSize: 50,
      imageQuality: 'medium',
      
      messageRetention: 30,
      enableEncryption: true,
      backupEnabled: true,
      dataUsageOptimization: false
    }
    
    setSettings(defaultSettings)
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