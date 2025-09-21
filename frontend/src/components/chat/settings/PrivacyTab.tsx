'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Shield, Eye, EyeOff, Clock, Users, UserX } from 'lucide-react'
import { SettingsTabProps } from '@/types/chat-settings'

/**
 * Privacy Settings Tab Component
 * 
 * Handles privacy and visibility preferences
 * Following Single Responsibility Principle
 */
export function PrivacyTab({ settings, onUpdateSetting }: SettingsTabProps) {
  return (
    <div className="space-y-6" data-testid="privacy-settings">
      {/* Online Status */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Status Online
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-online-status">Mostrar Status Online</Label>
            <p className="text-sm text-muted-foreground">
              Permitir que outros vejam quando você está online
            </p>
          </div>
          <Switch
            id="show-online-status"
            checked={settings.showOnlineStatus}
            onCheckedChange={(checked: boolean) => onUpdateSetting('showOnlineStatus', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-last-seen">Mostrar Última Visualização</Label>
            <p className="text-sm text-muted-foreground">
              Permitir que outros vejam quando você esteve online pela última vez
            </p>
          </div>
          <Switch
            id="show-last-seen"
            checked={settings.showLastSeen}
            onCheckedChange={(checked: boolean) => onUpdateSetting('showLastSeen', checked)}
            disabled={!settings.showOnlineStatus}
          />
        </div>
      </div>

      {/* Read Receipts */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Confirmações de Leitura
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-read-receipts">Enviar Confirmações de Leitura</Label>
            <p className="text-sm text-muted-foreground">
              Informar aos remetentes quando suas mensagens foram lidas
            </p>
          </div>
          <Switch
            id="show-read-receipts"
            checked={settings.showReadReceipts}
            onCheckedChange={(checked: boolean) => onUpdateSetting('showReadReceipts', checked)}
          />
        </div>
        
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Atenção:</strong> Desabilitar confirmações de leitura também impedirá que você 
            veja quando suas mensagens foram lidas por outros.
          </p>
        </div>
      </div>

      {/* Group Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Configurações de Grupo
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allow-group-invites">Permitir Convites para Grupos</Label>
            <p className="text-sm text-muted-foreground">
              Permitir que outros usuários te adicionem a grupos
            </p>
          </div>
          <Switch
            id="allow-group-invites"
            checked={settings.allowGroupInvites}
            onCheckedChange={(checked: boolean) => onUpdateSetting('allowGroupInvites', checked)}
          />
        </div>
      </div>

      {/* Blocking */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <UserX className="h-4 w-4" />
          Bloqueio e Segurança
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="block-unknown-users">Bloquear Usuários Desconhecidos</Label>
            <p className="text-sm text-muted-foreground">
              Automaticamente bloquear mensagens de usuários não conhecidos
            </p>
          </div>
          <Switch
            id="block-unknown-users"
            checked={settings.blockUnknownUsers}
            onCheckedChange={(checked: boolean) => onUpdateSetting('blockUnknownUsers', checked)}
          />
        </div>
        
        {settings.blockUnknownUsers && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Aviso:</strong> Com esta opção ativa, você pode não receber mensagens 
              importantes de novos contatos. Use com cautela.
            </p>
          </div>
        )}
      </div>

      {/* Privacy Summary */}
      <div className="space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Resumo da Privacidade
        </h4>
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
          <div className="space-y-1">
            <p className="text-sm font-medium">Status Visível</p>
            <p className="text-xs text-muted-foreground">
              {settings.showOnlineStatus ? 'Sim' : 'Não'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Confirmações</p>
            <p className="text-xs text-muted-foreground">
              {settings.showReadReceipts ? 'Ativas' : 'Desativadas'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Convites de Grupo</p>
            <p className="text-xs text-muted-foreground">
              {settings.allowGroupInvites ? 'Permitidos' : 'Bloqueados'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Proteção</p>
            <p className="text-xs text-muted-foreground">
              {settings.blockUnknownUsers ? 'Alta' : 'Normal'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}