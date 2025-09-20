import { z } from 'zod'

// Base validation rules
const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Formato de email inválido')
  .max(255, 'Email muito longo')

const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
  )

const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .max(100, 'Senha muito longa'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register schema
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'Você deve aceitar os termos de uso'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Senha atual é obrigatória')
      .max(100, 'Senha muito longa'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Update profile schema
export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  firstName: z
    .string()
    .max(50, 'Primeiro nome muito longo')
    .optional(),
  lastName: z
    .string()
    .max(50, 'Último nome muito longo')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio muito longa')
    .optional(),
  location: z
    .string()
    .max(100, 'Localização muito longa')
    .optional(),
  website: z
    .string()
    .url('URL inválida')
    .max(255, 'URL muito longa')
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de telefone inválido')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z
    .date()
    .max(new Date(), 'Data de nascimento não pode ser no futuro')
    .optional(),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .optional(),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
})

export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>

// Two-factor authentication schemas
export const enable2FASchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type Enable2FAFormData = z.infer<typeof enable2FASchema>

export const verify2FASchema = z.object({
  code: z
    .string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d+$/, 'Código deve conter apenas números'),
})

export type Verify2FAFormData = z.infer<typeof verify2FASchema>

// Session management schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

export type RefreshTokenData = z.infer<typeof refreshTokenSchema>

// API request validation
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const registerRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type RegisterRequest = z.infer<typeof registerRequestSchema>