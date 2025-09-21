'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Palette, Eye, EyeOff, Type, AlignJustify } from 'lucide-react'
import { SettingsTabProps } from '@/types/chat-settings'

/**
 * Appearance Settings Tab Component
 * 
 * Handles theme, font size, spacing, and visual preferences
 * Following Single Responsibility Principle
 */
export function AppearanceTab({ settings, onUpdateSetting }: SettingsTabProps) {
  return (
    <div className="space-y-6" data-testid="appearance-settings">
      {/* Theme Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <Label htmlFor="theme">Tema</Label>
        </div>
        <Select
          value={settings.theme}
          onValueChange={(value: 'light' | 'dark' | 'system') => 
            onUpdateSetting('theme', value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Escuro</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          <Label>Tamanho da Fonte: {settings.fontSize}px</Label>
        </div>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([value]: [number]) => onUpdateSetting('fontSize', value)}
          min={10}
          max={24}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Pequeno (10px)</span>
          <span>Grande (24px)</span>
        </div>
      </div>

      {/* Message Spacing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlignJustify className="h-4 w-4" />
          <Label>Espaçamento das Mensagens: {settings.messageSpacing}px</Label>
        </div>
        <Slider
          value={[settings.messageSpacing]}
          onValueChange={([value]: [number]) => onUpdateSetting('messageSpacing', value)}
          min={0}
          max={20}
          step={2}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Compacto (0px)</span>
          <span>Espaçoso (20px)</span>
        </div>
      </div>

      {/* Visual Options */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Elementos Visuais
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-avatars">Mostrar Avatares</Label>
              <p className="text-sm text-muted-foreground">
                Exibir fotos de perfil nas mensagens
              </p>
            </div>
            <Switch
              id="show-avatars"
              checked={settings.showAvatars}
              onCheckedChange={(checked: boolean) => onUpdateSetting('showAvatars', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-timestamps">Mostrar Horários</Label>
              <p className="text-sm text-muted-foreground">
                Exibir timestamp nas mensagens
              </p>
            </div>
            <Switch
              id="show-timestamps"
              checked={settings.showTimestamps}
              onCheckedChange={(checked: boolean) => onUpdateSetting('showTimestamps', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact-mode">Modo Compacto</Label>
              <p className="text-sm text-muted-foreground">
                Interface mais condensada para melhor uso do espaço
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={settings.compactMode}
              onCheckedChange={(checked: boolean) => onUpdateSetting('compactMode', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}