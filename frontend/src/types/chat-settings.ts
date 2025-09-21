export interface ChatSettings {
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

export interface ChatSettingsProps {
  chatId?: string
  className?: string
}

export interface SettingsTabProps {
  settings: ChatSettings
  onUpdateSetting: <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => void
  hasChanges: boolean
}

export type NotificationSound = 'default' | 'pop' | 'chime' | 'bell' | 'none'
export type ImageQuality = 'low' | 'medium' | 'high'
export type Theme = 'light' | 'dark' | 'system'

export const DEFAULT_SETTINGS: ChatSettings = {
  // Appearance
  theme: 'system',
  fontSize: 14,
  messageSpacing: 8,
  showAvatars: true,
  showTimestamps: true,
  compactMode: false,
  
  // Notifications
  enableNotifications: true,
  enableSounds: true,
  notificationSound: 'default',
  mutedChats: [],
  notifyOnMention: true,
  notifyOnDM: true,
  
  // Privacy
  showOnlineStatus: true,
  showLastSeen: true,
  showReadReceipts: true,
  allowGroupInvites: true,
  blockUnknownUsers: false,
  
  // Media
  autoDownloadImages: true,
  autoDownloadFiles: false,
  maxFileSize: 50, // MB
  imageQuality: 'medium',
  
  // Advanced
  messageRetention: 30,
  enableEncryption: true,
  backupEnabled: true,
  dataUsageOptimization: false
}