import { StateCreator } from 'zustand'
import { messageService } from '@/api/chat/message-service'
import type { Message } from '@/types/chat'
import type { SearchSliceState, SearchSliceActions, ChatStoreState } from '../types'

/**
 * Search Management Slice
 * 
 * Handles message search functionality
 * Following Single Responsibility Principle
 */
export interface SearchSlice extends SearchSliceState, SearchSliceActions {}

export const createSearchSlice: StateCreator<
  ChatStoreState,
  [["zustand/immer", never]],
  [],
  SearchSlice
> = (set, get) => ({
  // Initial state
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchError: null,
  searchHistory: [],

  // Set search query
  setSearchQuery: (query: string) => {
    set((state) => {
      state.searchQuery = query
    })
  },

  // Search messages across chats
  searchMessages: async (query: string) => {
    if (!query.trim()) {
      set((state) => {
        state.searchResults = []
        state.searchQuery = ''
      })
      return
    }

    set((state) => {
      state.isSearching = true
      state.searchError = null
      state.searchQuery = query
    })

    try {
      const response = await messageService.searchMessages({ 
        query
      })
      
      if (response.success && response.data?.data) {
        const results = response.data.data
        
        set((state) => {
          state.searchResults = results
          state.isSearching = false
          
          // Add to search history if not already present
          if (!state.searchHistory.includes(query)) {
            state.searchHistory.unshift(query)
            // Keep only last 10 searches
            if (state.searchHistory.length > 10) {
              state.searchHistory = state.searchHistory.slice(0, 10)
            }
          }
        })
      } else {
        const errorMessage = response.message || 'Erro ao buscar mensagens'
        set((state) => {
          state.searchError = errorMessage
          state.isSearching = false
          state.searchResults = []
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar mensagens'
      set((state) => {
        state.searchError = errorMessage
        state.isSearching = false
        state.searchResults = []
      })
    }
  },

  // Clear search results
  clearSearchResults: () => {
    set((state) => {
      state.searchResults = []
      state.searchQuery = ''
      state.searchError = null
    })
  },

  // Clear search error
  clearSearchError: () => {
    set((state) => {
      state.searchError = null
    })
  },

  // Add query to search history manually
  addToSearchHistory: (query: string) => {
    if (!query.trim()) return

    set((state) => {
      if (!state.searchHistory.includes(query)) {
        state.searchHistory.unshift(query)
        // Keep only last 10 searches
        if (state.searchHistory.length > 10) {
          state.searchHistory = state.searchHistory.slice(0, 10)
        }
      }
    })
  },

  // Clear search history
  clearSearchHistory: () => {
    set((state) => {
      state.searchHistory = []
    })
  }
})