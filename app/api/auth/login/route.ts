/**
 * Login API Route (Legacy Support)
 *
 * This route provides a REST API for login validation.
 * For actual session management, use NextAuth's signIn() on the client.
 *
 * Note: This endpoint validates credentials but doesn't create sessions.
 * Use the NextAuth CSRF-protected endpoints for actual authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        image: true,
        role: true,
        status: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        preferredCurrency: true,
        preferredLanguage: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      )
    }

    // Check if user has a password (might be OAuth-only account)
    if (!user.password) {
      return NextResponse.json(
        {
          error: 'Please sign in with your social account',
          code: 'OAUTH_ACCOUNT',
        },
        { status: 400 }
      )
    }

    // Check user status
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        {
          error: 'Your account has been suspended',
          code: 'ACCOUNT_SUSPENDED',
        },
        { status: 403 }
      )
    }

    if (user.status === 'DELETED') {
      return NextResponse.json(
        {
          error: 'This account has been deleted',
          code: 'ACCOUNT_DELETED',
        },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      )
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    })

    console.log(`[AUTH] User logged in: ${user.id}`)

    // Return user data (without password)
    // Note: Actual session is created by NextAuth's signIn() on client
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Credentials verified. Use NextAuth signIn() for session.',
      user: userWithoutPassword,
    })

  } catch (error) {
    console.error('Login error:', error)

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Login failed. Please try again.',
        code: 'LOGIN_FAILED',
      },
      { status: 500 }
    )
  }
}
