/**
 * NextAuth Configuration
 *
 * Unified authentication configuration using NextAuth.js with Prisma adapter.
 * Supports OAuth providers (Google, Facebook, Apple) and credentials-based auth.
 */

import { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { type Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { ExtendedUser } from './types'

// Helper to safely get env vars with defaults for optional providers
function getEnvVar(key: string, required: boolean = false): string {
  const value = process.env[key]
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || ''
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/welcome',
  },

  providers: [
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code',
              },
            },
          }),
        ]
      : []),

    // Credentials Provider (Email/Password)
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user) {
          throw new Error('No account found with this email')
        }

        if (!user.password) {
          throw new Error('Please sign in with your social account')
        }

        if (user.status === 'SUSPENDED') {
          throw new Error('Your account has been suspended')
        }

        if (user.status === 'DELETED') {
          throw new Error('This account has been deleted')
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        // Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          loyaltyTier: user.loyaltyTier,
          loyaltyPoints: user.loyaltyPoints,
          status: user.status,
          preferredCurrency: user.preferredCurrency,
          preferredLanguage: user.preferredLanguage,
          stripeCustomerId: user.stripeCustomerId,
          emailVerified: user.emailVerified,
        } as ExtendedUser
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user is suspended or deleted
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { status: true },
        })

        if (dbUser?.status === 'SUSPENDED') {
          return '/auth/error?error=AccountSuspended'
        }
        if (dbUser?.status === 'DELETED') {
          return '/auth/error?error=AccountDeleted'
        }
      }

      return true
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.email = dbUser.email
          token.role = dbUser.role
          token.loyaltyTier = dbUser.loyaltyTier
          token.loyaltyPoints = dbUser.loyaltyPoints
          token.status = dbUser.status
          token.preferredCurrency = dbUser.preferredCurrency
          token.preferredLanguage = dbUser.preferredLanguage
          token.stripeCustomerId = dbUser.stripeCustomerId
        }
      }

      // OAuth access token
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }

      // Session update (when user updates their profile)
      if (trigger === 'update' && session) {
        // Refresh user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        })

        if (dbUser) {
          token.name = dbUser.name
          token.email = dbUser.email
          token.role = dbUser.role
          token.loyaltyTier = dbUser.loyaltyTier
          token.loyaltyPoints = dbUser.loyaltyPoints
          token.preferredCurrency = dbUser.preferredCurrency
          token.preferredLanguage = dbUser.preferredLanguage
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role
        session.user.loyaltyTier = token.loyaltyTier
        session.user.loyaltyPoints = token.loyaltyPoints
        session.user.status = token.status
        session.user.preferredCurrency = token.preferredCurrency
        session.user.preferredLanguage = token.preferredLanguage
        session.user.stripeCustomerId = token.stripeCustomerId
        session.accessToken = token.accessToken
        session.provider = token.provider
      }
      return session
    },
  },

  events: {
    async createUser({ user }) {
      // Initialize loyalty program for new users
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loyaltyPoints: 100, // Welcome bonus
          memberSince: new Date(),
        },
      })

      // Create welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'WELCOME',
          title: 'Welcome to TrueDest!',
          message: 'Your account has been created. You\'ve earned 100 loyalty points as a welcome bonus!',
          actionUrl: '/dashboard',
        },
      })

      // Log event for analytics
      console.log(`[AUTH] New user created: ${user.email}`)
    },

    async signIn({ user, account, isNewUser }) {
      console.log(`[AUTH] User signed in: ${user.email} via ${account?.provider || 'credentials'}`)

      // Update last login timestamp
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() },
        })
      }
    },

    async signOut({ token }) {
      console.log(`[AUTH] User signed out: ${token?.email}`)
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

// Export auth options
export default authOptions
