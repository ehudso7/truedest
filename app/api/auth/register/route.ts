/**
 * User Registration API Route
 *
 * Creates a new user account with email/password credentials.
 * Uses Prisma for database operations and proper validation.
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { registerSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User already exists',
          code: 'USER_EXISTS',
        },
        { status: 409 }
      )
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        phone: validatedData.phone,
        preferredCurrency: validatedData.preferredCurrency,
        preferredLanguage: validatedData.preferredLanguage,
        loyaltyPoints: 100, // Welcome bonus
        memberSince: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        preferredCurrency: true,
        preferredLanguage: true,
        createdAt: true,
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

    console.log(`[AUTH] New user registered: ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user,
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)

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

    // Handle Prisma unique constraint errors using error codes
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        {
          error: 'Email already registered',
          code: 'USER_EXISTS',
        },
        { status: 409 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Failed to create account. Please try again.',
        code: 'REGISTRATION_FAILED',
      },
      { status: 500 }
    )
  }
}
