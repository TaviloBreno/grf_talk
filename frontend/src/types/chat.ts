import { User } from './index'

export interface TypingUser {
  id: string
  name: string
  avatar?: string
}

// Contact related types
export interface Contact {
  id: string
  name: string
  avatar?: string
  email?: string
  phoneNumber?: string
  status?: string
  isOnline: boolean
  lastSeen?: Date
  isFavorite: boolean
  isBlocked: boolean
  userId: string
  user?: User
  createdAt: Date
  updatedAt: Date
}

// Chat related types
export interface Chat {
  id: string
  title: string
  name?: string // For display purposes
  avatar?: string // For display purposes
  description?: string
  type: 'private' | 'group' | 'channel'
  participants: ChatParticipant[]
  messages: Message[]
  lastMessage?: Message
  isActive: boolean
  isPinned?: boolean
  isStarred?: boolean
  isMuted?: boolean
  isArchived?: boolean
  settings: ChatSettings
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatParticipant {
  id: string
  userId: string
  chatId: string
  user: User
  role: 'admin' | 'moderator' | 'member'
  joinedAt: Date
  lastReadAt?: Date
  permissions: ChatPermissions
}

export interface ChatPermissions {
  canSendMessages: boolean
  canSendMedia: boolean
  canDeleteOwnMessages: boolean
  canDeleteAnyMessages: boolean
  canInviteUsers: boolean
  canKickUsers: boolean
  canChangeChatSettings: boolean
}

export interface ChatSettings {
  isPublic: boolean
  allowInvites: boolean
  allowFileSharing: boolean
  maxFileSize: number
  messageRetention: number // days
  moderationLevel: 'none' | 'low' | 'medium' | 'high'
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  sender: User
  content: string
  type: MessageType
  status: MessageStatus
  attachments: MessageAttachment[]
  replyTo?: string
  reactions: MessageReaction[]
  isEdited: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'file' 
  | 'system' 
  | 'announcement'

export type MessageStatus = 
  | 'sending' 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed'

export interface MessageAttachment {
  id: string
  messageId: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string
  duration?: number // for audio/video
  dimensions?: {
    width: number
    height: number
  }
  createdAt: Date
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  user: User
  emoji: string
  createdAt: Date
}

// Chat creation and update types
export interface CreateChatData {
  title: string
  description?: string
  type: 'private' | 'group' | 'channel'
  participantIds: string[]
  settings?: Partial<ChatSettings>
}

export interface UpdateChatData {
  title?: string
  description?: string
  settings?: Partial<ChatSettings>
}

export interface SendMessageData {
  content: string
  type?: MessageType
  replyTo?: string
  attachments?: File[]
}

export interface UpdateMessageData {
  content: string
}

// Chat UI state types
export interface ChatUIState {
  activeChat: Chat | null
  chatList: Chat[]
  messages: Record<string, Message[]>
  isLoading: boolean
  error: string | null
  typingUsers: Record<string, string[]> // chatId -> userIds
  searchQuery: string
  searchResults: Message[]
  selectedMessages: string[]
  replyingTo: Message | null
}

// Chat store actions
export interface ChatActions {
  setActiveChat: (chat: Chat | null) => void
  loadChats: () => Promise<void>
  createChat: (data: CreateChatData) => Promise<Chat>
  updateChat: (chatId: string, data: UpdateChatData) => Promise<Chat>
  deleteChat: (chatId: string) => Promise<void>
  loadMessages: (chatId: string, page?: number) => Promise<void>
  sendMessage: (chatId: string, data: SendMessageData) => Promise<Message>
  updateMessage: (messageId: string, data: UpdateMessageData) => Promise<Message>
  deleteMessage: (messageId: string) => Promise<void>
  joinChat: (chatId: string) => Promise<void>
  leaveChat: (chatId: string) => Promise<void>
  addParticipant: (chatId: string, userId: string) => Promise<void>
  removeParticipant: (chatId: string, userId: string) => Promise<void>
  searchMessages: (query: string, chatId?: string) => Promise<void>
  markAsRead: (chatId: string) => Promise<void>
  setTyping: (chatId: string, isTyping: boolean) => void
  clearError: () => void
}