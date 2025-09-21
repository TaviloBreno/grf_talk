/**
 * Chat API - Refactored for better maintainability
 * 
 * This file now serves as a facade for the new modular chat services.
 * The original chatApi is maintained for backward compatibility while
 * the implementation has been split into focused services.
 * 
 * @deprecated Consider importing individual services from '@/api/chat' instead
 */

// Re-export the unified API for backward compatibility
export { chatApi } from './chat'

// Named exports for specific services
export { 
  chatService,
  messageService, 
  participantService,
  fileService,
  inviteService 
} from './chat'