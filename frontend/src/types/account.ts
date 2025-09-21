export interface ProfileFormData {
  name: string
  email: string
  avatar?: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface PreferencesData {
  theme: string
  language: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
    sound: boolean
  }
  privacy: {
    showOnlineStatus: boolean
    readReceipts: boolean
    profileVisibility: 'everyone' | 'contacts' | 'nobody'
    lastSeenVisibility: 'everyone' | 'contacts' | 'nobody'
  }
}

export interface FormErrors {
  [key: string]: string
}

export interface AccountTabProps {
  errors: FormErrors
  successMessage: string | null
  errorMessage: string | null
  isLoading: boolean
  onClearMessages: () => void
}

export interface ProfileTabProps extends AccountTabProps {
  profileData: ProfileFormData
  onProfileChange: (field: keyof ProfileFormData, value: string) => void
  onProfileSubmit: () => Promise<void>
}

export interface PasswordTabProps extends AccountTabProps {
  passwordData: PasswordFormData
  onPasswordChange: (field: keyof PasswordFormData, value: string) => void
  onPasswordSubmit: () => Promise<void>
}

export interface PreferencesTabProps extends AccountTabProps {
  preferencesData: PreferencesData
  onPreferencesChange: (data: Partial<PreferencesData>) => void
  onPreferencesSubmit: () => Promise<void>
}