import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production'

// Helper to get user from token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return await db.users.findById(decoded.id)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, details, totalAmount } = body

    if (!type || !details || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await db.bookings.create({
      userId: user.id,
      type,
      status: 'confirmed',
      totalAmount,
      details
    })

    // Award loyalty points (10% of amount)
    const pointsEarned = Math.floor(totalAmount * 0.1)
    await db.users.update(user.id, {
      loyaltyPoints: user.loyaltyPoints + pointsEarned
    })

    return NextResponse.json({
      success: true,
      data: {
        booking,
        pointsEarned
      }
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const bookings = await db.bookings.findByUserId(user.id)

    return NextResponse.json({
      success: true,
      data: bookings
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to get bookings' },
      { status: 500 }
    )
  }
}