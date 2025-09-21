'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Image, FileText, Download, HardDrive } from 'lucide-react'
import { SettingsTabProps } from '@/types/chat-settings'

/**
 * Media Settings Tab Component
 * 
 * Handles media download and quality preferences
 * Following Single Responsibility Principle
 */
export function MediaTab({ settings, onUpdateSetting }: SettingsTabProps) {
  const imageQualityOptions = [
    { value: 'low', label: 'Baixa (economiza dados)', description: 'Compressão alta, menor qualidade' },
    { value: 'medium', label: 'Média (balanceada)', description: 'Boa qualidade e tamanho moderado' },
    { value: 'high', label: 'Alta (melhor qualidade)', description: 'Máxima qualidade, maior tamanho' }
  ]

  const formatFileSize = (sizeInMB: number): string => {
    if (sizeInMB >= 1000) {
      return `${(sizeInMB / 1000).toFixed(1)} GB`
    }
    return `${sizeInMB} MB`
  }

  return (
    <div className="space-y-6" data-testid="media-settings">
      {/* Auto Download Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Automático
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-download-images">Download Automático de Imagens</Label>
            <p className="text-sm text-muted-foreground">
              Baixar imagens automaticamente quando recebidas
            </p>
          </div>
          <Switch
            id="auto-download-images"
            checked={settings.autoDownloadImages}
            onCheckedChange={(checked: boolean) => onUpdateSetting('autoDownloadImages', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-download-files">Download Automático de Arquivos</Label>
            <p className="text-sm text-muted-foreground">
              Baixar documentos e outros arquivos automaticamente
            </p>
          </div>
          <Switch
            id="auto-download-files"
            checked={settings.autoDownloadFiles}
            onCheckedChange={(checked: boolean) => onUpdateSetting('autoDownloadFiles', checked)}
          />
        </div>
      </div>

      {/* File Size Limit */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          <Label>Tamanho Máximo para Download: {formatFileSize(settings.maxFileSize)}</Label>
        </div>
        <Slider
          value={[settings.maxFileSize]}
          onValueChange={([value]: [number]) => onUpdateSetting('maxFileSize', value)}
          min={1}
          max={1000}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>1 MB</span>
          <span>1 GB</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Arquivos maiores que este limite não serão baixados automaticamente
        </p>
      </div>

      {/* Image Quality */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Image className="h-4 w-4" />
          Qualidade de Imagem
        </h4>
        
        <div className="space-y-2">
          <Label htmlFor="image-quality">Qualidade de Imagem</Label>
          <Select
            value={settings.imageQuality}
            onValueChange={(value: 'low' | 'medium' | 'high') => 
              onUpdateSetting('imageQuality', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a qualidade" />
            </SelectTrigger>
            <SelectContent>
              {imageQualityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Storage Info */}
      <div className="space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Informações de Armazenamento
        </h4>
        <div className="p-4 bg-muted rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Imagens baixadas automaticamente:</span>
            <span className="text-sm font-medium">
              {settings.autoDownloadImages ? 'Sim' : 'Não'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Arquivos baixados automaticamente:</span>
            <span className="text-sm font-medium">
              {settings.autoDownloadFiles ? 'Sim' : 'Não'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Limite de tamanho:</span>
            <span className="text-sm font-medium">
              {formatFileSize(settings.maxFileSize)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Qualidade de imagem:</span>
            <span className="text-sm font-medium capitalize">
              {imageQualityOptions.find(opt => opt.value === settings.imageQuality)?.label || settings.imageQuality}
            </span>
          </div>
        </div>
      </div>

      {/* Data Usage Warning */}
      {(settings.autoDownloadImages || settings.autoDownloadFiles) && settings.maxFileSize > 100 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Atenção:</strong> Com as configurações atuais, o consumo de dados pode ser elevado. 
            Considere ajustar as configurações se você tem uma conexão limitada.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Dica:</strong> Para economizar dados móveis, desative o download automático 
          ou reduza o tamanho máximo dos arquivos quando estiver usando dados móveis.
        </p>
      </div>
    </div>
  )
}