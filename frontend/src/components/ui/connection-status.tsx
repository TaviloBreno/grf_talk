'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWebSocket } from '@/providers/websocket'
import { useChatStore } from '@/stores/chat-store'
import type { ConnectionStatus } from '@/types'

interface ConnectionStatusProps {
  className?: string
  showDetails?: boolean
}

export function ConnectionStatus({ className, showDetails = false }: ConnectionStatusProps) {
  const { connectionStatus, isConnected } = useWebSocket()
  const [showReconnect, setShowReconnect] = useState(false)

  // Show reconnect button after 10 seconds of being disconnected
  useEffect(() => {
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      const timer = setTimeout(() => {
        setShowReconnect(true)
      }, 10000)

      return () => clearTimeout(timer)
    } else {
      setShowReconnect(false)
    }
  }, [connectionStatus])

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          label: 'Conectado',
          variant: 'default' as const,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        }
      case 'connecting':
        return {
          icon: Loader2,
          label: 'Conectando...',
          variant: 'secondary' as const,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          animate: true
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Desconectado',
          variant: 'destructive' as const,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        }
      case 'error':
        return {
          icon: AlertTriangle,
          label: 'Erro de conexão',
          variant: 'destructive' as const,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        }
      default:
        return {
          icon: WifiOff,
          label: 'Offline',
          variant: 'secondary' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20'
        }
    }
  }

  const handleReconnect = () => {
    // Trigger reconnection by reloading the page
    window.location.reload()
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  if (!showDetails) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs', config.bgColor)}>
          <IconComponent 
            className={cn('h-3 w-3', config.color, config.animate && 'animate-spin')} 
          />
          <span className={config.color}>{config.label}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border', config.bgColor, className)}>
      <div className="flex items-center gap-2">
        <IconComponent 
          className={cn('h-4 w-4', config.color, config.animate && 'animate-spin')} 
        />
        <div>
          <div className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </div>
          {showDetails && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {connectionStatus === 'connected' && 'Conectado com sucesso'}
              {connectionStatus === 'connecting' && 'Estabelecendo conexão...'}
              {(connectionStatus === 'disconnected' || connectionStatus === 'error') && 
                'Tentando reconectar automaticamente'
              }
            </div>
          )}
        </div>
      </div>

      {/* Reconnect button */}
      {showReconnect && (connectionStatus === 'disconnected' || connectionStatus === 'error') && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReconnect}
          className="ml-auto"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reconectar
        </Button>
      )}
    </div>
  )
}

export default ConnectionStatus