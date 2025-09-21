import { StateCreator } from 'zustand'
import type { UISliceState, UISliceActions, ChatStoreState } from '../types'

/**
 * UI State Management Slice
 * 
 * Handles UI-related state like theme, sidebar, typing indicators
 * Following Single Responsibility Principle
 */
export interface UISlice extends UISliceState, UISliceActions {}

export const createUISlice: StateCreator<
  ChatStoreState,
  [["zustand/immer", never]],
  [],
  UISlice
> = (set, get) => ({
  // Initial state
  isDarkMode: false,
  sidebarCollapsed: false,
  typingUsers: {},

  // Toggle sidebar collapsed state
  toggleSidebar: () => {
    set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    })
  },

  // Set dark mode
  setDarkMode: (isDark: boolean) => {
    set((state) => {
      state.isDarkMode = isDark
    })
    
    // Apply theme to document
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  },

  // Set typing users for a chat
  setTypingUsers: (chatId: string, users: string[]) => {
    set((state) => {
      state.typingUsers[chatId] = users
    })
  },

  // Clear typing users for a chat
  clearTypingUsers: (chatId: string) => {
    set((state) => {
      delete state.typingUsers[chatId]
    })
  }
})