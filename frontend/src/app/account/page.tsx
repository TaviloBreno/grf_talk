'use client''use client'



import { useState, useEffect } from 'react'import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'import { useRouter } from 'next/navigation'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'import { Button } from '@/components/ui/button'

import { useAuthStore } from '@/stores/auth-store'import { Input } from '@/components/ui/input'

import { User, Lock, Palette } from 'lucide-react'import { Label } from '@/components/ui/label'

import { import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

  ProfileFormData, import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

  PasswordFormData, import { Alert, AlertDescription } from '@/components/ui/alert'

  PreferencesData, import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

  FormErrors import { Separator } from '@/components/ui/separator'

} from '@/types/account'import { Switch } from '@/components/ui/switch'

import { import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

  AccountHeader,import { useAuthStore } from '@/stores/auth-store'

  ProfileTab, import { 

  PasswordTab,   ArrowLeft, 

  PreferencesTab   CheckCircle, 

} from '@/components/account'  AlertCircle, 

  User, 

/**  Mail, 

 * Account Page Component  Lock, 

 *   Save,

 * Refactored for better maintainability:  Camera,

 * - Separated concerns into focused tab components  Bell,

 * - Reduced complexity from 812 lines to ~250 lines  Shield,

 * - Improved modularity and testability  Palette,

 * - Following SOLID principles  Globe,

 */  Monitor,

export default function AccountPage() {  Sun,

  const router = useRouter()  Moon

  const { user, updateProfile, changePassword, isLoading } = useAuthStore()} from 'lucide-react'

import { cn } from '@/lib/utils'

  const [activeTab, setActiveTab] = useState('profile')

  interface ProfileFormData {

  // Form data states  name: string

  const [profileData, setProfileData] = useState<ProfileFormData>({  email: string

    name: '',  avatar?: string

    email: '',}

    avatar: ''

  })interface PasswordFormData {

  currentPassword: string

  const [passwordData, setPasswordData] = useState<PasswordFormData>({  newPassword: string

    currentPassword: '',  confirmPassword: string

    newPassword: '',}

    confirmPassword: ''

  })interface PreferencesData {

  theme: string

  const [preferencesData, setPreferencesData] = useState<PreferencesData>({  language: string

    theme: 'system',  notifications: {

    language: 'pt-BR',    email: boolean

    notifications: {    push: boolean

      email: true,    sound: boolean

      push: true,    desktop: boolean

      desktop: true,  }

      sound: true  privacy: {

    },    showOnlineStatus: boolean

    privacy: {    readReceipts: boolean

      showOnlineStatus: true,    profileVisibility: string

      readReceipts: true,    lastSeenVisibility: string

      profileVisibility: 'everyone',  }

      lastSeenVisibility: 'everyone'}

    }

  })interface FormErrors {

  name?: string

  // UI states  email?: string

  const [errors, setErrors] = useState<FormErrors>({})  avatar?: string

  const [successMessage, setSuccessMessage] = useState<string | null>(null)  currentPassword?: string

  const [errorMessage, setErrorMessage] = useState<string | null>(null)  newPassword?: string

  confirmPassword?: string

  // Update profile data when user changes}

  useEffect(() => {

    if (user) {export default function AccountPage() {

      setProfileData({  const router = useRouter()

        name: user.name || '',  const { user, updateProfile, changePassword, isLoading } = useAuthStore()

        email: user.email || '',

        avatar: user.avatar || ''  const [activeTab, setActiveTab] = useState('profile')

      })

    }  const [profileData, setProfileData] = useState<ProfileFormData>({

  }, [user])    name: user?.name || '',

    email: user?.email || '',

  // Auto-clear messages after 5 seconds    avatar: user?.avatar || ''

  useEffect(() => {  })

    if (successMessage || errorMessage) {

      const timer = setTimeout(() => {  const [passwordData, setPasswordData] = useState<PasswordFormData>({

        setSuccessMessage(null)    currentPassword: '',

        setErrorMessage(null)    newPassword: '',

      }, 5000)    confirmPassword: ''

  })

      return () => clearTimeout(timer)

    }  const [preferencesData, setPreferencesData] = useState<PreferencesData>({

  }, [successMessage, errorMessage])    theme: 'system',

    language: 'pt',

  // Clear all messages    notifications: {

  const clearMessages = (): void => {      email: true,

    setSuccessMessage(null)      push: true,

    setErrorMessage(null)      sound: true,

    setErrors({})      desktop: false

  }    },

    privacy: {

  // Navigation handlers      showOnlineStatus: true,

  const handleBack = (): void => {      readReceipts: true,

    router.push('/chat')      profileVisibility: 'everyone',

  }      lastSeenVisibility: 'everyone'

    }

  // Profile handlers  })

  const handleProfileChange = (field: keyof ProfileFormData, value: string): void => {

    setProfileData(prev => ({ ...prev, [field]: value }))  const [errors, setErrors] = useState<FormErrors>({})

    // Clear specific error when user starts typing  const [successMessage, setSuccessMessage] = useState<string | null>(null)

    if (errors[field]) {  const [errorMessage, setErrorMessage] = useState<string | null>(null)

      setErrors(prev => ({ ...prev, [field]: '' }))

    }  // Update profile data when user changes

  }  useEffect(() => {

    if (user) {

  const validateProfileForm = (): boolean => {      setProfileData({

    const newErrors: FormErrors = {}        name: user.name || '',

        email: user.email || '',

    if (!profileData.name.trim()) {        avatar: user.avatar || ''

      newErrors.name = 'Nome é obrigatório'      })

    } else if (profileData.name.trim().length < 2) {    }

      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'  }, [user])

    }

  // Auto-clear messages after 5 seconds

    if (!profileData.email.trim()) {  useEffect(() => {

      newErrors.email = 'Email é obrigatório'    if (successMessage || errorMessage) {

    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {      const timer = setTimeout(() => {

      newErrors.email = 'Email inválido'        setSuccessMessage(null)

    }        setErrorMessage(null)

      }, 5000)

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0      return () => clearTimeout(timer)

  }    }

  }, [successMessage, errorMessage])

  const handleProfileSubmit = async (): Promise<void> => {

    clearMessages()  const validateProfileForm = () => {

        const newErrors: FormErrors = {}

    if (!validateProfileForm()) return

    if (!profileData.name.trim()) {

    try {      newErrors.name = 'Nome é obrigatório'

      await updateProfile(profileData)    } else if (profileData.name.trim().length < 2) {

      setSuccessMessage('Perfil atualizado com sucesso!')      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'

    } catch (error) {    }

      setErrorMessage('Erro ao atualizar perfil. Tente novamente.')

    }    if (!profileData.email.trim()) {

  }      newErrors.email = 'Email é obrigatório'

    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {

  // Password handlers      newErrors.email = 'Email inválido'

  const handlePasswordChange = (field: keyof PasswordFormData, value: string): void => {    }

    setPasswordData(prev => ({ ...prev, [field]: value }))

    // Clear specific error when user starts typing    setErrors(newErrors)

    if (errors[field]) {    return Object.keys(newErrors).length === 0

      setErrors(prev => ({ ...prev, [field]: '' }))  }

    }

  }  const validatePasswordForm = () => {

    const newErrors: FormErrors = {}

  const validatePasswordForm = (): boolean => {

    const newErrors: FormErrors = {}    if (!passwordData.currentPassword) {

      newErrors.currentPassword = 'Senha atual é obrigatória'

    if (!passwordData.currentPassword) {    }

      newErrors.currentPassword = 'Senha atual é obrigatória'

    }    if (!passwordData.newPassword) {

      newErrors.newPassword = 'Nova senha é obrigatória'

    if (!passwordData.newPassword) {    } else if (passwordData.newPassword.length < 6) {

      newErrors.newPassword = 'Nova senha é obrigatória'      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres'

    } else if (passwordData.newPassword.length < 8) {    }

      newErrors.newPassword = 'Nova senha deve ter pelo menos 8 caracteres'

    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(passwordData.newPassword)) {    if (!passwordData.confirmPassword) {

      newErrors.newPassword = 'Nova senha deve conter ao menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'

    }    } else if (passwordData.newPassword !== passwordData.confirmPassword) {

      newErrors.confirmPassword = 'Senhas não coincidem'

    if (!passwordData.confirmPassword) {    }

      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'

    } else if (passwordData.newPassword !== passwordData.confirmPassword) {    setErrors(newErrors)

      newErrors.confirmPassword = 'Senhas não conferem'    return Object.keys(newErrors).length === 0

    }  }



    setErrors(newErrors)  const handleProfileInputChange = (field: keyof ProfileFormData, value: string) => {

    return Object.keys(newErrors).length === 0    setProfileData(prev => ({

  }      ...prev,

      [field]: value

  const handlePasswordSubmit = async (): Promise<void> => {    }))

    clearMessages()

        if (errors[field]) {

    if (!validatePasswordForm()) return      setErrors(prev => ({

        ...prev,

    try {        [field]: undefined

      await changePassword(passwordData.currentPassword, passwordData.newPassword)      }))

      setSuccessMessage('Senha alterada com sucesso!')    }

      setPasswordData({

        currentPassword: '',    clearMessages()

        newPassword: '',  }

        confirmPassword: ''

      })  const handlePasswordInputChange = (field: keyof PasswordFormData, value: string) => {

    } catch (error) {    setPasswordData(prev => ({

      setErrorMessage('Erro ao alterar senha. Verifique sua senha atual.')      ...prev,

    }      [field]: value

  }    }))



  // Preferences handlers    if (errors[field]) {

  const handlePreferencesChange = (data: Partial<PreferencesData>): void => {      setErrors(prev => ({

    setPreferencesData(prev => ({ ...prev, ...data }))        ...prev,

  }        [field]: undefined

      }))

  const handlePreferencesSubmit = async (): Promise<void> => {    }

    clearMessages()

        clearMessages()

    try {  }

      // Save preferences to localStorage or API

      localStorage.setItem('user-preferences', JSON.stringify(preferencesData))  const handlePreferencesChange = (section: keyof PreferencesData, field: string, value: any) => {

      setSuccessMessage('Preferências salvas com sucesso!')    setPreferencesData(prev => ({

    } catch (error) {      ...prev,

      setErrorMessage('Erro ao salvar preferências. Tente novamente.')      [section]: typeof prev[section] === 'object' && prev[section] !== null

    }        ? { ...prev[section] as any, [field]: value }

  }        : value

    }))

  const tabs = [  }

    {

      id: 'profile',  const clearMessages = () => {

      label: 'Perfil',    if (successMessage) setSuccessMessage(null)

      icon: User,    if (errorMessage) setErrorMessage(null)

      component: ProfileTab,  }

      props: {

        profileData,  const handleProfileSubmit = async (e: React.FormEvent) => {

        onProfileChange: handleProfileChange,    e.preventDefault()

        onProfileSubmit: handleProfileSubmit

      }    if (!validateProfileForm()) {

    },      return

    {    }

      id: 'password',

      label: 'Senha',    try {

      icon: Lock,      await updateProfile({

      component: PasswordTab,        name: profileData.name.trim(),

      props: {        email: profileData.email.trim(),

        passwordData,        avatar: profileData.avatar

        onPasswordChange: handlePasswordChange,      })

        onPasswordSubmit: handlePasswordSubmit

      }      setSuccessMessage('Perfil atualizado com sucesso!')

    },    } catch (error: any) {

    {      setErrorMessage(error.message || 'Erro ao atualizar perfil')

      id: 'preferences',    }

      label: 'Preferências',  }

      icon: Palette,

      component: PreferencesTab,  const handlePasswordSubmit = async (e: React.FormEvent) => {

      props: {    e.preventDefault()

        preferencesData,

        onPreferencesChange: handlePreferencesChange,    if (!validatePasswordForm()) {

        onPreferencesSubmit: handlePreferencesSubmit      return

      }    }

    }

  ]    try {

      await changePassword({

  return (        currentPassword: passwordData.currentPassword,

    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">        newPassword: passwordData.newPassword,

      <AccountHeader onBack={handleBack} />        confirmPassword: passwordData.confirmPassword

      })

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">      setPasswordData({

          <TabsList className="grid w-full grid-cols-3">        currentPassword: '',

            {tabs.map((tab) => (        newPassword: '',

              <TabsTrigger        confirmPassword: ''

                key={tab.id}      })

                value={tab.id}

                className="flex items-center gap-2"      setSuccessMessage('Senha alterada com sucesso!')

              >    } catch (error: any) {

                <tab.icon className="h-4 w-4" />      setErrorMessage(error.message || 'Erro ao alterar senha')

                <span className="hidden sm:inline">{tab.label}</span>    }

              </TabsTrigger>  }

            ))}

          </TabsList>  const handlePreferencesSubmit = async () => {

    try {

          {tabs.map((tab) => (      // Simulate API call to save preferences

            <TabsContent key={tab.id} value={tab.id}>      await new Promise(resolve => setTimeout(resolve, 1000))

              <tab.component      

                {...tab.props}      setSuccessMessage('Preferências salvas com sucesso!')

                errors={errors}    } catch (error: any) {

                successMessage={successMessage}      setErrorMessage('Erro ao salvar preferências')

                errorMessage={errorMessage}    }

                isLoading={isLoading}  }

                onClearMessages={clearMessages}

              />  const getUserInitials = (name: string) => {

            </TabsContent>    return name

          ))}      .split(' ')

        </Tabs>      .map(n => n.charAt(0))

      </div>      .join('')

    </div>      .toUpperCase()

  )      .slice(0, 2)

}  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: Implementar upload de arquivo
      console.log('Upload de avatar:', file)
      
      // Por enquanto, simular URL local
      const reader = new FileReader()
      reader.onloadend = () => {
        handleProfileInputChange('avatar', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configurações da Conta
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Mensagens */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>

          {/* Tab Perfil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e foto de perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white text-lg">
                        {getUserInitials(profileData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <Camera className="h-4 w-4" />
                          <span>Alterar foto</span>
                        </div>
                      </Label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        JPG, PNG até 2MB
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileInputChange('name', e.target.value)}
                        className={cn(
                          'pl-10',
                          errors.name && 'border-red-500 focus:border-red-500'
                        )}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                        className={cn(
                          'pl-10',
                          errors.email && 'border-red-500 focus:border-red-500'
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Segurança */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Senha Atual */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        className={cn(
                          'pl-10',
                          errors.currentPassword && 'border-red-500 focus:border-red-500'
                        )}
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500">{errors.currentPassword}</p>
                    )}
                  </div>

                  {/* Nova Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        className={cn(
                          'pl-10',
                          errors.newPassword && 'border-red-500 focus:border-red-500'
                        )}
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-500">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        className={cn(
                          'pl-10',
                          errors.confirmPassword && 'border-red-500 focus:border-red-500'
                        )}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Preferências */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Aparência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize o tema e idioma da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tema */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Tema</Label>
                    <p className="text-sm text-gray-500">
                      Escolha entre tema claro, escuro ou automático
                    </p>
                  </div>
                  <Select
                    value={preferencesData.theme}
                    onValueChange={(value) => handlePreferencesChange('theme', '', value)}
                  >
                    <SelectTrigger className="w-48">
                      <div className="flex items-center gap-2">
                        {getThemeIcon(preferencesData.theme)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Escuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Automático
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Idioma */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Idioma</Label>
                    <p className="text-sm text-gray-500">
                      Selecione o idioma da interface
                    </p>
                  </div>
                  <Select
                    value={preferencesData.language}
                    onValueChange={(value) => handlePreferencesChange('language', '', value)}
                  >
                    <SelectTrigger className="w-48">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como e quando receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-gray-500">
                      Receber notificações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.notifications.email}
                    onCheckedChange={(checked) => 
                      handlePreferencesChange('notifications', 'email', checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-gray-500">
                      Receber notificações push no navegador
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.notifications.push}
                    onCheckedChange={(checked) => 
                      handlePreferencesChange('notifications', 'push', checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Sons de Notificação</Label>
                    <p className="text-sm text-gray-500">
                      Reproduzir sons quando receber mensagens
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.notifications.sound}
                    onCheckedChange={(checked) => 
                      handlePreferencesChange('notifications', 'sound', checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações Desktop</Label>
                    <p className="text-sm text-gray-500">
                      Mostrar notificações na área de trabalho
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.notifications.desktop}
                    onCheckedChange={(checked) => 
                      handlePreferencesChange('notifications', 'desktop', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacidade
                </CardTitle>
                <CardDescription>
                  Controle suas configurações de privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Mostrar Status Online</Label>
                    <p className="text-sm text-gray-500">
                      Permitir que outros vejam quando você está online
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => 
                      handlePreferencesChange('privacy', 'showOnlineStatus', checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Confirmação de Leitura</Label>
                    <p className="text-sm text-gray-500">
                      Enviar confirmação quando ler mensagens
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.privacy.readReceipts}
                    onCheckedChange={(checked) => 
                      handlePreferencesChange('privacy', 'readReceipts', checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Visibilidade do Perfil</Label>
                    <p className="text-sm text-gray-500">
                      Quem pode ver suas informações de perfil
                    </p>
                  </div>
                  <Select
                    value={preferencesData.privacy.profileVisibility}
                    onValueChange={(value) => 
                      handlePreferencesChange('privacy', 'profileVisibility', value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Todos</SelectItem>
                      <SelectItem value="contacts">Apenas Contatos</SelectItem>
                      <SelectItem value="nobody">Ninguém</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Última Vez Visto</Label>
                    <p className="text-sm text-gray-500">
                      Quem pode ver quando você esteve online pela última vez
                    </p>
                  </div>
                  <Select
                    value={preferencesData.privacy.lastSeenVisibility}
                    onValueChange={(value) => 
                      handlePreferencesChange('privacy', 'lastSeenVisibility', value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Todos</SelectItem>
                      <SelectItem value="contacts">Apenas Contatos</SelectItem>
                      <SelectItem value="nobody">Ninguém</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Botão Salvar Preferências */}
            <div className="flex justify-end">
              <Button onClick={handlePreferencesSubmit} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}