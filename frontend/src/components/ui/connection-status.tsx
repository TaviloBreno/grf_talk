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
import { useChatStore } from '@/stores/chat'

interface ConnectionStatusProps {
  className?: string
  showDetails?: boolean
}

export function ConnectionStatus({ className, showDetails = false }: ConnectionStatusProps) {
  const { connectionStatus, isConnected } = useWebSocket()
  const { connectionQuality, lastActivity } = useChatStore()
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
          icon: connectionQuality === 'excellent' ? CheckCircle2 : Wifi,
          label: isConnected ? 'Online' : 'Conectado',
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

  const getQualityIndicator = () => {
    switch (connectionQuality) {
      case 'excellent':
        return { bars: 4, color: 'bg-green-500' }
      case 'good':
        return { bars: 3, color: 'bg-yellow-500' }
      case 'poor':
        return { bars: 2, color: 'bg-orange-500' }
      case 'offline':
        return { bars: 0, color: 'bg-gray-400' }
      default:
        return { bars: 0, color: 'bg-gray-400' }
    }
  }

  const handleReconnect = () => {
    // Trigger reconnection by reloading the page
    window.location.reload()
  }

  const config = getStatusConfig()
  const quality = getQualityIndicator()
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
              {connectionStatus === 'connected' && (
                <>
                  Qualidade: {connectionQuality} • 
                  Última atividade: {new Date(lastActivity).toLocaleTimeString('pt-BR')}
                </>
              )}
              {connectionStatus === 'connecting' && 'Estabelecendo conexão...'}
              {(connectionStatus === 'disconnected' || connectionStatus === 'error') && 
                'Tentando reconectar automaticamente'
              }
            </div>
          )}
        </div>
      </div>

      {/* Signal strength indicator */}
      {connectionStatus === 'connected' && (
        <div className="flex items-end gap-px ml-auto">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={cn(
                'w-1 rounded-sm transition-colors',
                bar <= quality.bars ? quality.color : 'bg-gray-300 dark:bg-gray-600'
              )}
              style={{ height: `${bar * 3 + 2}px` }}
            />
          ))}
        </div>
      )}

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