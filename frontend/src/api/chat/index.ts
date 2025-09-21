/**
 * Chat API Services
 * 
 * This module exports all chat-related API services organized by responsibility.
 * Following SOLID principles:
 * - Single Responsibility: Each service handles one domain
 * - Open/Closed: Easy to extend with new services
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Services depend on abstractions (ApiResponse, types)
 */

export { chatService } from './chat-service'
export { messageService } from './message-service'
export { participantService } from './participant-service'
export { fileService, inviteService } from './utils-service'

// Re-export for backward compatibility and unified API
import { chatService } from './chat-service'
import { messageService } from './message-service'
import { participantService } from './participant-service'
import { fileService, inviteService } from './utils-service'

/**
 * Unified Chat API - for backward compatibility
 * @deprecated Use individual services instead
 */
export const chatApi = {
  // Chat management
  ...chatService,
  
  // Message management
  ...messageService,
  
  // Participant management
  ...participantService,
  
  // File management
  ...fileService,
  
  // Invitation management
  ...inviteService,
}