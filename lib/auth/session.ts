/**
 * Session Utilities
 *
 * Provides type-safe session handling utilities for server-side code.
 */

import { getServerSession as nextAuthGetServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from './config'
import type { ExtendedSession, ExtendedUser } from './types'
import { prisma } from '@/lib/prisma'

/**
 * Get the current server session with extended user information
 */
export async function getSession(): Promise<ExtendedSession | null> {
  const session = await nextAuthGetServerSession(authOptions)
  return session as ExtendedSession | null
}

/**
 * Get the current user from session (throws if not authenticated)
 */
export async function getCurrentUser(): Promise<ExtendedUser> {
  const session = await getSession()

  if (!session?.user) {
    throw new AuthenticationError('Not authenticated')
  }

  return session.user
}

/**
 * Get the current user ID from session (throws if not authenticated)
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser()
  return user.id
}

/**
 * Check if user is authenticated (doesn't throw)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session?.user
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: 'USER' | 'ADMIN' | 'SUPPORT' | 'PARTNER'): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === role
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('ADMIN')
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<ExtendedSession> {
  const session = await getSession()

  if (!session?.user) {
    throw new AuthenticationError('Authentication required')
  }

  return session
}

/**
 * Require specific role - throws if not authenticated or wrong role
 */
export async function requireRole(role: 'USER' | 'ADMIN' | 'SUPPORT' | 'PARTNER'): Promise<ExtendedSession> {
  const session = await requireAuth()

  if (session.user.role !== role && session.user.role !== 'ADMIN') {
    throw new AuthorizationError(`Role '${role}' required`)
  }

  return session
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<ExtendedSession> {
  const session = await requireAuth()

  if (session.user.role !== 'ADMIN') {
    throw new AuthorizationError('Admin access required')
  }

  return session
}

/**
 * Get fresh user data from database
 */
export async function getFreshUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      phone: true,
      dateOfBirth: true,
      nationality: true,
      passportNumber: true,
      passportExpiry: true,
      preferredCurrency: true,
      preferredLanguage: true,
      role: true,
      status: true,
      twoFactorEnabled: true,
      loyaltyPoints: true,
      loyaltyTier: true,
      memberSince: true,
      preferences: true,
      notificationPrefs: true,
      stripeCustomerId: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

/**
 * Custom authentication error
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Custom authorization error
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}
