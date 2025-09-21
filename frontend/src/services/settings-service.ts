import { ChatSettings, DEFAULT_SETTINGS } from '@/types/chat-settings'

const SETTINGS_KEY = 'chat-settings'

/**
 * Settings Storage Service
 * 
 * Handles loading, saving, and managing chat settings in localStorage
 * Following Single Responsibility Principle
 */
export class SettingsService {
  /**
   * Load settings from localStorage
   */
  static loadSettings(): ChatSettings {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.error('Failed to load chat settings:', error)
    }
    return DEFAULT_SETTINGS
  }

  /**
   * Save settings to localStorage
   */
  static saveSettings(settings: ChatSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save chat settings:', error)
    }
  }

  /**
   * Reset settings to defaults
   */
  static resetSettings(): ChatSettings {
    const defaultSettings = { ...DEFAULT_SETTINGS }
    this.saveSettings(defaultSettings)
    return defaultSettings
  }

  /**
   * Export settings as JSON file
   */
  static exportSettings(settings: ChatSettings): void {
    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `chat-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export settings:', error)
    }
  }

  /**
   * Import settings from file
   */
  static async importSettings(file: File): Promise<ChatSettings | null> {
    try {
      const text = await file.text()
      const imported = JSON.parse(text)
      
      // Validate imported settings
      const validated = this.validateSettings(imported)
      if (validated) {
        this.saveSettings(validated)
        return validated
      }
    } catch (error) {
      console.error('Failed to import settings:', error)
    }
    return null
  }

  /**
   * Validate settings object structure
   */
  private static validateSettings(settings: any): ChatSettings | null {
    if (!settings || typeof settings !== 'object') {
      return null
    }

    // Create validated settings with defaults for missing properties
    const validated: ChatSettings = { ...DEFAULT_SETTINGS }
    
    // Validate and apply each setting if present and valid
    const validators = {
      theme: (val: any) => ['light', 'dark', 'system'].includes(val),
      fontSize: (val: any) => typeof val === 'number' && val >= 10 && val <= 24,
      messageSpacing: (val: any) => typeof val === 'number' && val >= 0 && val <= 20,
      showAvatars: (val: any) => typeof val === 'boolean',
      showTimestamps: (val: any) => typeof val === 'boolean',
      compactMode: (val: any) => typeof val === 'boolean',
      enableNotifications: (val: any) => typeof val === 'boolean',
      enableSounds: (val: any) => typeof val === 'boolean',
      notificationSound: (val: any) => typeof val === 'string',
      mutedChats: (val: any) => Array.isArray(val),
      notifyOnMention: (val: any) => typeof val === 'boolean',
      notifyOnDM: (val: any) => typeof val === 'boolean',
      showOnlineStatus: (val: any) => typeof val === 'boolean',
      showLastSeen: (val: any) => typeof val === 'boolean',
      showReadReceipts: (val: any) => typeof val === 'boolean',
      allowGroupInvites: (val: any) => typeof val === 'boolean',
      blockUnknownUsers: (val: any) => typeof val === 'boolean',
      autoDownloadImages: (val: any) => typeof val === 'boolean',
      autoDownloadFiles: (val: any) => typeof val === 'boolean',
      maxFileSize: (val: any) => typeof val === 'number' && val > 0 && val <= 1000,
      imageQuality: (val: any) => ['low', 'medium', 'high'].includes(val),
      messageRetention: (val: any) => typeof val === 'number' && val >= 1 && val <= 365,
      enableEncryption: (val: any) => typeof val === 'boolean',
      backupEnabled: (val: any) => typeof val === 'boolean',
      dataUsageOptimization: (val: any) => typeof val === 'boolean'
    }

    for (const [key, validator] of Object.entries(validators)) {
      if (settings[key] !== undefined && validator(settings[key])) {
        (validated as any)[key] = settings[key]
      }
    }

    return validated
  }
}

/**
 * Settings Application Service
 * 
 * Applies settings to the application UI and behavior
 */
export class SettingsApplicationService {
  /**
   * Apply theme settings to document
   */
  static applyTheme(theme: ChatSettings['theme']): void {
    if (theme === 'system') {
      // Remove explicit theme classes, let system preference take over
      document.documentElement.classList.remove('dark', 'light')
    } else {
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(theme)
    }
  }

  /**
   * Apply font size settings to chat container
   */
  static applyFontSize(fontSize: number): void {
    document.documentElement.style.setProperty('--chat-font-size', `${fontSize}px`)
  }

  /**
   * Apply message spacing settings
   */
  static applyMessageSpacing(spacing: number): void {
    document.documentElement.style.setProperty('--message-spacing', `${spacing}px`)
  }

  /**
   * Apply all visual settings
   */
  static applySettings(settings: ChatSettings): void {
    this.applyTheme(settings.theme)
    this.applyFontSize(settings.fontSize)
    this.applyMessageSpacing(settings.messageSpacing)
    
    // Apply compact mode
    if (settings.compactMode) {
      document.documentElement.classList.add('compact-mode')
    } else {
      document.documentElement.classList.remove('compact-mode')
    }
  }
}