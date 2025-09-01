import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.loyaltyTier = (user as any).loyaltyTier
      }
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
        (session.user as any).loyaltyTier = token.loyaltyTier
        (session.user as any).provider = token.provider
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Send welcome email
      await sendWelcomeEmail(user.email!)
      
      // Initialize loyalty program
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loyaltyPoints: 100, // Welcome bonus
          memberSince: new Date(),
        },
      })
    },
    async signIn({ user, account, isNewUser }) {
      // Log sign-in event
      console.log(`User ${user.email} signed in via ${account?.provider}`)
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      })
    },
  },
}

// Helper function for sending welcome email
async function sendWelcomeEmail(email: string) {
  // Implementation would use SendGrid or similar service
  console.log(`Sending welcome email to ${email}`)
}