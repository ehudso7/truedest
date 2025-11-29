/**
 * Authentication Type Definitions
 *
 * Provides type-safe session and user types for the application.
 */

import { type DefaultSession, type DefaultUser } from 'next-auth'
import { type JWT as DefaultJWT } from 'next-auth/jwt'
import type { UserRole, LoyaltyTier, UserStatus } from '@prisma/client'

/**
 * Extended user type with custom properties
 */
export interface ExtendedUser extends DefaultUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: UserRole
  loyaltyTier: LoyaltyTier
  loyaltyPoints: number
  status: UserStatus
  preferredCurrency: string
  preferredLanguage: string
  stripeCustomerId?: string | null
  emailVerified?: Date | null
}

/**
 * Extended session type with custom user properties
 */
export interface ExtendedSession extends DefaultSession {
  user: ExtendedUser
  accessToken?: string
  provider?: string
}

/**
 * Extended JWT type with custom claims
 */
export interface ExtendedJWT extends DefaultJWT {
  id: string
  email: string
  role: UserRole
  loyaltyTier: LoyaltyTier
  loyaltyPoints: number
  status: UserStatus
  preferredCurrency: string
  preferredLanguage: string
  stripeCustomerId?: string | null
  accessToken?: string
  provider?: string
}

/**
 * User preferences stored in JSON field
 */
export interface UserPreferences {
  budget?: 'budget' | 'moderate' | 'luxury'
  travelStyle?: 'adventure' | 'relaxation' | 'culture' | 'business'
  interests?: string[]
  dietaryRestrictions?: string[]
  accessibilityNeeds?: string[]
  seatPreference?: 'window' | 'aisle' | 'middle'
  mealPreference?: string
}

/**
 * Notification preferences stored in JSON field
 */
export interface NotificationPreferences {
  email: {
    bookingConfirmation: boolean
    flightUpdates: boolean
    priceAlerts: boolean
    promotions: boolean
    newsletter: boolean
  }
  push: {
    enabled: boolean
    flightUpdates: boolean
    priceAlerts: boolean
    chatMessages: boolean
  }
  sms: {
    enabled: boolean
    flightUpdates: boolean
    bookingReminders: boolean
  }
}

// Module augmentation for NextAuth types
declare module 'next-auth' {
  interface Session extends ExtendedSession {}
  interface User extends ExtendedUser {}
}

declare module 'next-auth/jwt' {
  interface JWT extends ExtendedJWT {}
}
