import type { Chat, Message, ChatParticipant } from '@/types/chat'

// Chat management state and actions
export interface ChatSliceState {
  activeChat: Chat | null
  chatList: Chat[]
  isLoading: boolean
  error: string | null
}

export interface ChatSliceActions {
  setActiveChat: (chat: Chat | null) => void
  loadChats: () => Promise<void>
  createChat: (participantId: string, data?: Partial<Chat>) => Promise<void>
  updateChat: (chatId: string, data: Partial<Chat>) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  clearChatError: () => void
}

// Message management state and actions
export interface MessageSliceState {
  messages: Record<string, Message[]>
  selectedMessages: string[]
  replyingTo: Message | null
  isLoadingMessages: boolean
  messageError: string | null
}

export interface MessageSliceActions {
  loadMessages: (chatId: string, page?: number) => Promise<void>
  sendMessage: (chatId: string, content: string, type?: string, attachments?: any[]) => Promise<void>
  updateMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  selectMessage: (messageId: string) => void
  selectMultipleMessages: (messageIds: string[]) => void
  clearSelectedMessages: () => void
  setReplyingTo: (message: Message | null) => void
  clearMessageError: () => void
}

// Search state and actions
export interface SearchSliceState {
  searchQuery: string
  searchResults: Message[]
  isSearching: boolean
  searchError: string | null
  searchHistory: string[]
}

export interface SearchSliceActions {
  setSearchQuery: (query: string) => void
  searchMessages: (query: string, chatId?: string) => Promise<void>
  clearSearchResults: () => void
  clearSearchError: () => void
  addToSearchHistory: (query: string) => void
  clearSearchHistory: () => void
}

// UI state and actions
export interface UISliceState {
  isDarkMode: boolean
  sidebarCollapsed: boolean
  typingUsers: Record<string, string[]> // chatId -> array of user names
}

export interface UISliceActions {
  toggleSidebar: () => void
  setDarkMode: (isDark: boolean) => void
  setTypingUsers: (chatId: string, users: string[]) => void
  clearTypingUsers: (chatId: string) => void
}

// Combined store state
export interface ChatStoreState extends 
  ChatSliceState,
  MessageSliceState,
  SearchSliceState,
  UISliceState,
  ChatSliceActions,
  MessageSliceActions,
  SearchSliceActions,
  UISliceActions {
  // Global actions
  resetStore: () => void
}