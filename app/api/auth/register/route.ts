import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { users } from '@/lib/users-store'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    if (users.has(email)) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userId = uuidv4()
    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    // Store user
    users.set(email, newUser)

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Return user data and token
    return NextResponse.json({
      user: {
        id: userId,
        name,
        email
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}