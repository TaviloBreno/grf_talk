'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  Shield, 
  Database, 
  Wifi, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw,
  AlertTriangle 
} from 'lucide-react'
import { SettingsTabProps } from '@/types/chat-settings'
import { useChatStore } from '@/stores/chat-store'

/**
 * Advanced Settings Tab Component
 * 
 * Handles advanced features like encryption, backup, and data management
 * Following Single Responsibility Principle
 */
export function AdvancedTab({ settings, onUpdateSetting, hasChanges }: SettingsTabProps) {
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleClearCache = () => {
    // Clear localStorage cache
    localStorage.removeItem('chat-cache')
    localStorage.removeItem('message-cache')
    // Show success message
    console.log('Cache cleared successfully')
  }

  const handleOptimizeCache = () => {
    // Optimize cache by removing old entries
    const now = Date.now()
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)
    
    // Clean up old cache entries (this is a simplified example)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache-') || key.startsWith('temp-')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}')
          if (item.timestamp && item.timestamp < oneWeekAgo) {
            localStorage.removeItem(key)
          }
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem(key)
        }
      }
    })
    
    console.log('Cache optimized successfully')
  }

  const handleImportSettings = async () => {
    if (!importFile) return
    
    try {
      const text = await importFile.text()
      const imported = JSON.parse(text)
      
      // Validate and apply imported settings
      Object.keys(imported).forEach(key => {
        if (key in settings) {
          onUpdateSetting(key as keyof typeof settings, imported[key])
        }
      })
      
      setImportFile(null)
      console.log('Settings imported successfully')
    } catch (error) {
      console.error('Failed to import settings:', error)
    }
  }

  const formatRetentionTime = (days: number): string => {
    if (days >= 365) {
      return `${Math.floor(days / 365)} ano(s)`
    } else if (days >= 30) {
      return `${Math.floor(days / 30)} mês(es)`
    }
    return `${days} dia(s)`
  }

  return (
    <div className="space-y-6" data-testid="advanced-settings">
      {/* Message Retention */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Retenção de Mensagens
        </h4>
        
        <div className="space-y-3">
          <Label>Manter mensagens por: {formatRetentionTime(settings.messageRetention)}</Label>
          <Slider
            value={[settings.messageRetention]}
            onValueChange={([value]: [number]) => onUpdateSetting('messageRetention', value)}
            min={1}
            max={365}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 dia</span>
            <span>1 ano</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Mensagens mais antigas que este período serão automaticamente removidas do dispositivo
          </p>
        </div>
      </div>

      {/* Security */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Segurança
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enable-encryption">Criptografia Ponta a Ponta</Label>
            <p className="text-sm text-muted-foreground">
              Proteger mensagens com criptografia avançada
            </p>
          </div>
          <Switch
            id="enable-encryption"
            checked={settings.enableEncryption}
            onCheckedChange={(checked: boolean) => onUpdateSetting('enableEncryption', checked)}
          />
        </div>
        
        {!settings.enableEncryption && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <strong>Aviso:</strong> Sem criptografia, suas mensagens podem ser interceptadas por terceiros.
            </p>
          </div>
        )}
      </div>

      {/* Backup */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Backup
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="backup-enabled">Backup Automático</Label>
            <p className="text-sm text-muted-foreground">
              Fazer backup das configurações e dados importantes
            </p>
          </div>
          <Switch
            id="backup-enabled"
            checked={settings.backupEnabled}
            onCheckedChange={(checked: boolean) => onUpdateSetting('backupEnabled', checked)}
          />
        </div>
      </div>

      {/* Data Usage Optimization */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Otimização de Dados
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="data-optimization">Otimização de Uso de Dados</Label>
            <p className="text-sm text-muted-foreground">
              Reduzir o consumo de dados com compressão e cache inteligente
            </p>
          </div>
          <Switch
            id="data-optimization"
            checked={settings.dataUsageOptimization}
            onCheckedChange={(checked: boolean) => onUpdateSetting('dataUsageOptimization', checked)}
          />
        </div>
      </div>

      {/* Cache Management */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Gerenciamento de Cache
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleOptimizeCache}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Otimizar Cache
          </Button>
          
          <Button
            variant="outline"
            onClick={handleClearCache}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Cache
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          O cache armazena dados temporários para melhorar a performance. 
          Limpar o cache pode liberar espaço, mas pode tornar o carregamento mais lento temporariamente.
        </p>
      </div>

      {/* Settings Import/Export */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar/Exportar Configurações
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="import-file">Importar Configurações</Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            {importFile && (
              <Button
                onClick={handleImportSettings}
                className="w-full"
                size="sm"
              >
                Importar
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Exportar Configurações</Label>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => {
                // Export functionality handled by parent component
                console.log('Export settings')
              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Reset Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2 text-red-600">
          <RotateCcw className="h-4 w-4" />
          Resetar Configurações
        </h4>
        
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
            <strong>Atenção:</strong> Esta ação irá restaurar todas as configurações para os valores padrão. 
            Esta ação não pode ser desfeita.
          </p>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => {
              // Reset functionality handled by parent component
              console.log('Reset settings')
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Resetar Todas as Configurações
          </Button>
        </div>
      </div>

      {/* Save Indicator */}
      {hasChanges && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Você tem alterações não salvas. Clique em "Salvar" para aplicar as mudanças.
          </p>
        </div>
      )}
    </div>
  )
}