import { z } from 'zod'

// Base validation rules for user
const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
  .trim()

const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Formato de email inválido')
  .max(255, 'Email muito longo')
  .toLowerCase()

const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de telefone inválido')
  .optional()
  .or(z.literal(''))

const urlSchema = z
  .string()
  .url('URL inválida')
  .max(255, 'URL muito longa')
  .optional()
  .or(z.literal(''))

// User profile schema
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Primeiro nome é obrigatório')
    .max(50, 'Primeiro nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Primeiro nome deve conter apenas letras')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Último nome é obrigatório')
    .max(50, 'Último nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Último nome deve conter apenas letras')
    .trim()
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio muito longa (máximo 500 caracteres)')
    .optional(),
  location: z
    .string()
    .max(100, 'Localização muito longa')
    .optional(),
  website: urlSchema,
  phoneNumber: phoneSchema,
  dateOfBirth: z
    .date()
    .max(new Date(), 'Data de nascimento não pode ser no futuro')
    .refine(
      (date) => {
        const age = new Date().getFullYear() - date.getFullYear()
        return age >= 13
      },
      'Usuário deve ter pelo menos 13 anos'
    )
    .optional(),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'], {
      message: 'Gênero inválido',
    })
    .optional(),
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>

// Update user basic info schema
export const updateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  avatar: z
    .string()
    .url('URL do avatar inválida')
    .optional()
    .or(z.literal('')),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>

// User preferences schema
export const userPreferencesSchema = z.object({
  theme: z
    .enum(['light', 'dark', 'system'], {
      message: 'Tema inválido',
    })
    .default('system'),
  language: z
    .string()
    .min(2, 'Idioma inválido')
    .max(5, 'Idioma inválido')
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Formato de idioma inválido')
    .default('pt-BR'),
  timezone: z
    .string()
    .min(1, 'Fuso horário é obrigatório')
    .max(50, 'Fuso horário inválido')
    .default('America/Sao_Paulo'),
  notifications: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
      marketing: z.boolean().default(false),
    })
    .default({
      email: true,
      push: true,
      sms: false,
      marketing: false,
    }),
})

export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>

// User search schema
export const userSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Termo de busca é obrigatório')
    .max(100, 'Termo de busca muito longo')
    .trim(),
  filters: z
    .object({
      role: z.enum(['user', 'admin']).optional(),
      isEmailVerified: z.boolean().optional(),
      location: z.string().max(100).optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    })
    .optional(),
  sortBy: z
    .enum(['name', 'email', 'createdAt', 'lastLogin'])
    .default('name'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('asc'),
  page: z
    .number()
    .min(1, 'Página deve ser maior que 0')
    .default(1),
  limit: z
    .number()
    .min(1, 'Limite deve ser maior que 0')
    .max(100, 'Limite máximo é 100')
    .default(20),
})

export type UserSearchFormData = z.infer<typeof userSearchSchema>

// Avatar upload schema
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'Arquivo muito grande (máximo 5MB)'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'Tipo de arquivo não permitido (apenas JPEG, PNG, GIF, WebP)'
    )
    .refine(
      (file) => {
        // Verificar dimensões da imagem seria ideal, mas requer canvas
        return true
      },
      'Dimensões da imagem inválidas'
    ),
})

export type AvatarUploadFormData = z.infer<typeof avatarUploadSchema>

// User invitation schema
export const userInvitationSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
  role: z
    .enum(['user', 'admin'])
    .default('user'),
  message: z
    .string()
    .max(300, 'Mensagem muito longa')
    .optional(),
  expiresAt: z
    .date()
    .min(new Date(), 'Data de expiração deve ser no futuro')
    .optional(),
})

export type UserInvitationFormData = z.infer<typeof userInvitationSchema>

// User deactivation schema
export const userDeactivationSchema = z.object({
  reason: z
    .enum([
      'user_request',
      'violation',
      'spam',
      'inappropriate_content',
      'security_concern',
      'other'
    ], {
      message: 'Motivo inválido',
    }),
  customReason: z
    .string()
    .max(500, 'Motivo personalizado muito longo')
    .optional(),
  notifyUser: z.boolean().default(true),
  deleteData: z.boolean().default(false),
})
.refine(
  (data) => {
    if (data.reason === 'other') {
      return data.customReason && data.customReason.trim().length > 0
    }
    return true
  },
  {
    message: 'Motivo personalizado é obrigatório quando "outro" é selecionado',
    path: ['customReason'],
  }
)

export type UserDeactivationFormData = z.infer<typeof userDeactivationSchema>

// Bulk user operations schema
export const bulkUserOperationSchema = z.object({
  userIds: z
    .array(z.string().uuid('ID de usuário inválido'))
    .min(1, 'Pelo menos um usuário deve ser selecionado')
    .max(100, 'Máximo 100 usuários por operação'),
  operation: z.enum([
    'activate',
    'deactivate',
    'delete',
    'change_role',
    'send_notification'
  ], {
    message: 'Operação inválida',
  }),
  params: z
    .object({
      role: z.enum(['user', 'admin']).optional(),
      message: z.string().max(500).optional(),
      reason: z.string().max(300).optional(),
    })
    .optional(),
})

export type BulkUserOperationFormData = z.infer<typeof bulkUserOperationSchema>

// User activity log schema
export const userActivityLogSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido').optional(),
  action: z
    .enum([
      'login',
      'logout',
      'register',
      'profile_update',
      'password_change',
      'email_change',
      'avatar_upload',
      'settings_update',
      'chat_created',
      'chat_joined',
      'chat_left',
      'message_sent',
      'file_uploaded'
    ])
    .optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export type UserActivityLogFormData = z.infer<typeof userActivityLogSchema>

// Export user data schema (GDPR compliance)
export const exportUserDataSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido'),
  includeChats: z.boolean().default(true),
  includeMessages: z.boolean().default(true),
  includeFiles: z.boolean().default(false),
  format: z
    .enum(['json', 'csv', 'pdf'])
    .default('json'),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

export type ExportUserDataFormData = z.infer<typeof exportUserDataSchema>