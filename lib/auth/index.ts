/**
 * Authentication Module Exports
 *
 * Centralized exports for all authentication-related functionality.
 */

export { authOptions } from './config'
export type {
  ExtendedUser,
  ExtendedSession,
  ExtendedJWT,
  UserPreferences,
  NotificationPreferences,
} from './types'

// Re-export commonly used NextAuth functions
export { getServerSession } from 'next-auth'
