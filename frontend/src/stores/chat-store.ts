import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import { createChatSlice } from './slices/chat-slice'
import { createMessageSlice } from './slices/message-slice'
import { createSearchSlice } from './slices/search-slice'
import { createUISlice } from './slices/ui-slice'
import type { ChatStoreState } from './types'

/**
 * Modular Chat Store using Zustand Slices
 * 
 * Refactored from single large store into focused slices following SOLID principles:
 * - ChatSlice: Chat management (CRUD operations)
 * - MessageSlice: Message handling (send, edit, delete, real-time updates)
 * - SearchSlice: Message search functionality
 * - UISlice: UI state management (theme, sidebar, typing indicators)
 * 
 * Benefits:
 * - Single Responsibility: Each slice handles one concern
 * - Open/Closed: Easy to extend with new slices
 * - Interface Segregation: Consumers only depend on needed functionality
 * - Dependency Inversion: Slices depend on abstractions (types)
 */
export const useChatStore = create<ChatStoreState>()(
  subscribeWithSelector(
    immer(
      (...a) => ({
        // Chat management slice
        ...createChatSlice(...a),
        
        // Message management slice
        ...createMessageSlice(...a),
        
        // Search functionality slice
        ...createSearchSlice(...a),
        
        // UI state management slice
        ...createUISlice(...a),
        
        // Global store actions
        resetStore: () => {
          // Reset all slices to initial state
          a[0](() => ({
            // Chat slice
            activeChat: null,
            chatList: [],
            isLoading: false,
            error: null,
            
            // Message slice
            messages: {},
            selectedMessages: [],
            replyingTo: null,
            isLoadingMessages: false,
            messageError: null,
            
            // Search slice
            searchQuery: '',
            searchResults: [],
            isSearching: false,
            searchError: null,
            searchHistory: [],
            
            // UI slice
            isDarkMode: false,
            sidebarCollapsed: false,
            typingUsers: {}
          }))
        }
      })
    )
  )
)

// Export types for external use
export type { ChatStoreState } from './types'

// Export individual slice hooks for focused component subscriptions
export const useChatSlice = () => useChatStore((state) => ({
  activeChat: state.activeChat,
  chatList: state.chatList,
  isLoading: state.isLoading,
  error: state.error,
  setActiveChat: state.setActiveChat,
  loadChats: state.loadChats,
  createChat: state.createChat,
  updateChat: state.updateChat,
  deleteChat: state.deleteChat,
  clearChatError: state.clearChatError
}))

export const useMessageSlice = () => useChatStore((state) => ({
  messages: state.messages,
  selectedMessages: state.selectedMessages,
  replyingTo: state.replyingTo,
  isLoadingMessages: state.isLoadingMessages,
  messageError: state.messageError,
  loadMessages: state.loadMessages,
  sendMessage: state.sendMessage,
  updateMessage: state.updateMessage,
  deleteMessage: state.deleteMessage,
  selectMessage: state.selectMessage,
  selectMultipleMessages: state.selectMultipleMessages,
  clearSelectedMessages: state.clearSelectedMessages,
  setReplyingTo: state.setReplyingTo,
  clearMessageError: state.clearMessageError
}))

export const useSearchSlice = () => useChatStore((state) => ({
  searchQuery: state.searchQuery,
  searchResults: state.searchResults,
  isSearching: state.isSearching,
  searchError: state.searchError,
  searchHistory: state.searchHistory,
  setSearchQuery: state.setSearchQuery,
  searchMessages: state.searchMessages,
  clearSearchResults: state.clearSearchResults,
  clearSearchError: state.clearSearchError,
  addToSearchHistory: state.addToSearchHistory,
  clearSearchHistory: state.clearSearchHistory
}))

export const useUISlice = () => useChatStore((state) => ({
  isDarkMode: state.isDarkMode,
  sidebarCollapsed: state.sidebarCollapsed,
  typingUsers: state.typingUsers,
  toggleSidebar: state.toggleSidebar,
  setDarkMode: state.setDarkMode,
  setTypingUsers: state.setTypingUsers,
  clearTypingUsers: state.clearTypingUsers
}))

// Utility hooks for common use cases
export const useActiveChatMessages = () => useChatStore((state) => {
  const chatId = state.activeChat?.id
  return chatId ? state.messages[chatId] || [] : []
})

export const useTypingUsersForChat = (chatId: string) => useChatStore((state) => 
  state.typingUsers[chatId] || []
)

export const useUnreadCounts = () => useChatStore((state) => {
  const counts: Record<string, number> = {}
  state.chatList.forEach(chat => {
    counts[chat.id] = chat.unreadCount || 0
  })
  return counts
})