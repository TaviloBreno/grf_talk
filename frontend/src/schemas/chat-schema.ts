import { z } from 'zod'

// Base validation rules for chat
const chatTitleSchema = z
  .string()
  .min(1, 'Título do chat é obrigatório')
  .max(100, 'Título muito longo')
  .trim()

const chatDescriptionSchema = z
  .string()
  .max(500, 'Descrição muito longa')
  .optional()

const messageContentSchema = z
  .string()
  .min(1, 'Mensagem não pode estar vazia')
  .max(2000, 'Mensagem muito longa')
  .trim()

// Chat creation schema
export const createChatSchema = z.object({
  title: chatTitleSchema,
  description: chatDescriptionSchema,
  type: z.enum(['private', 'group', 'channel'], {
    message: 'Tipo de chat inválido',
  }),
  participantIds: z
    .array(z.string().uuid('ID de participante inválido'))
    .min(1, 'Pelo menos um participante é necessário')
    .max(100, 'Muitos participantes'),
  isPublic: z.boolean().optional().default(false),
  allowInvites: z.boolean().optional().default(true),
  allowFileSharing: z.boolean().optional().default(true),
  maxFileSize: z
    .number()
    .min(1, 'Tamanho mínimo de arquivo é 1MB')
    .max(100, 'Tamanho máximo de arquivo é 100MB')
    .optional()
    .default(10),
})

export type CreateChatFormData = z.infer<typeof createChatSchema>

// Update chat schema
export const updateChatSchema = z.object({
  title: chatTitleSchema.optional(),
  description: chatDescriptionSchema,
  isPublic: z.boolean().optional(),
  allowInvites: z.boolean().optional(),
  allowFileSharing: z.boolean().optional(),
  maxFileSize: z
    .number()
    .min(1, 'Tamanho mínimo de arquivo é 1MB')
    .max(100, 'Tamanho máximo de arquivo é 100MB')
    .optional(),
  messageRetention: z
    .number()
    .min(1, 'Retenção mínima é 1 dia')
    .max(365, 'Retenção máxima é 365 dias')
    .optional(),
  moderationLevel: z
    .enum(['none', 'low', 'medium', 'high'])
    .optional(),
})

export type UpdateChatFormData = z.infer<typeof updateChatSchema>

// Send message schema
export const sendMessageSchema = z.object({
  content: messageContentSchema,
  type: z
    .enum(['text', 'image', 'video', 'audio', 'file', 'system', 'announcement'])
    .optional()
    .default('text'),
  replyTo: z.string().uuid('ID de mensagem inválido').optional(),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1, 'Nome do arquivo é obrigatório'),
        size: z.number().min(1, 'Tamanho do arquivo inválido'),
        type: z.string().min(1, 'Tipo do arquivo é obrigatório'),
      })
    )
    .max(5, 'Máximo 5 anexos por mensagem')
    .optional(),
})

export type SendMessageFormData = z.infer<typeof sendMessageSchema>

// Update message schema
export const updateMessageSchema = z.object({
  content: messageContentSchema,
})

export type UpdateMessageFormData = z.infer<typeof updateMessageSchema>

// Add participant schema
export const addParticipantSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido'),
  role: z
    .enum(['admin', 'moderator', 'member'])
    .optional()
    .default('member'),
})

export type AddParticipantFormData = z.infer<typeof addParticipantSchema>

// Update participant schema
export const updateParticipantSchema = z.object({
  role: z.enum(['admin', 'moderator', 'member']),
  permissions: z
    .object({
      canSendMessages: z.boolean().optional().default(true),
      canSendMedia: z.boolean().optional().default(true),
      canDeleteOwnMessages: z.boolean().optional().default(true),
      canDeleteAnyMessages: z.boolean().optional().default(false),
      canInviteUsers: z.boolean().optional().default(false),
      canKickUsers: z.boolean().optional().default(false),
      canChangeChatSettings: z.boolean().optional().default(false),
    })
    .optional(),
})

export type UpdateParticipantFormData = z.infer<typeof updateParticipantSchema>

// Search messages schema
export const searchMessagesSchema = z.object({
  query: z
    .string()
    .min(1, 'Termo de busca é obrigatório')
    .max(100, 'Termo de busca muito longo')
    .trim(),
  chatId: z.string().uuid('ID de chat inválido').optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  messageType: z
    .enum(['text', 'image', 'video', 'audio', 'file', 'system', 'announcement'])
    .optional(),
  senderId: z.string().uuid('ID de remetente inválido').optional(),
})

export type SearchMessagesFormData = z.infer<typeof searchMessagesSchema>

// Message reaction schema
export const addReactionSchema = z.object({
  emoji: z
    .string()
    .min(1, 'Emoji é obrigatório')
    .max(10, 'Emoji muito longo')
    .regex(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, 'Emoji inválido'),
})

export type AddReactionFormData = z.infer<typeof addReactionSchema>

// File upload schema
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Arquivo muito grande (máximo 10MB)')
    .refine(
      (file) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
          'audio/mp3',
          'audio/wav',
          'audio/ogg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ]
        return allowedTypes.includes(file.type)
      },
      'Tipo de arquivo não permitido'
    ),
})

export type FileUploadFormData = z.infer<typeof fileUploadSchema>

// Pagination schema
export const chatPaginationSchema = z.object({
  page: z
    .number()
    .min(1, 'Página deve ser maior que 0')
    .optional()
    .default(1),
  limit: z
    .number()
    .min(1, 'Limite deve ser maior que 0')
    .max(100, 'Limite máximo é 100')
    .optional()
    .default(20),
})

export type ChatPaginationData = z.infer<typeof chatPaginationSchema>

// Chat invite schema
export const chatInviteSchema = z.object({
  chatId: z.string().uuid('ID de chat inválido'),
  email: z
    .string()
    .email('Email inválido')
    .optional(),
  userId: z.string().uuid('ID de usuário inválido').optional(),
  expiresAt: z
    .date()
    .min(new Date(), 'Data de expiração deve ser no futuro')
    .optional(),
  message: z
    .string()
    .max(200, 'Mensagem de convite muito longa')
    .optional(),
})
.refine(
  (data) => data.email || data.userId,
  'Email ou ID de usuário é obrigatório'
)

export type ChatInviteFormData = z.infer<typeof chatInviteSchema>

// Chat notification settings schema
export const chatNotificationSchema = z.object({
  chatId: z.string().uuid('ID de chat inválido'),
  enableNotifications: z.boolean(),
  muteUntil: z.date().optional(),
  notificationTypes: z
    .object({
      messages: z.boolean().optional().default(true),
      mentions: z.boolean().optional().default(true),
      reactions: z.boolean().optional().default(false),
      fileUploads: z.boolean().optional().default(true),
    })
    .optional(),
})

export type ChatNotificationFormData = z.infer<typeof chatNotificationSchema>

// API request validation schemas
export const createChatRequestSchema = createChatSchema.omit({
  participantIds: true,
}).extend({
  participantEmails: z
    .array(z.string().email('Email inválido'))
    .optional(),
  participantIds: z
    .array(z.string().uuid('ID inválido'))
    .optional(),
})

export type CreateChatRequest = z.infer<typeof createChatRequestSchema>