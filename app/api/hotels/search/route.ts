import { NextRequest, NextResponse } from 'next/server'
import { amadeusService } from '@/lib/services/amadeus'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      roomQuantity,
      radius,
      radiusUnit,
      hotelName,
      amenities,
      ratings,
      priceRange,
    } = body

    // Validate required fields
    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Search hotels using Amadeus
    const hotels = await amadeusService.searchHotels({
      cityCode,
      checkInDate,
      checkOutDate,
      adults: Number(adults),
      roomQuantity: Number(roomQuantity) || 1,
      radius,
      radiusUnit,
      hotelName,
      amenities,
      ratings,
      priceRange,
    })

    // Log search in history
    if (session?.user) {
      await prisma.searchHistory.create({
        data: {
          userId: (session.user as any).id,
          searchType: 'HOTEL',
          query: body,
          resultsCount: hotels.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: hotels,
      count: hotels.length,
    })
  } catch (error) {
    console.error('Hotel search error:', error)
    return NextResponse.json(
      { error: 'Failed to search hotels' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const adults = searchParams.get('adults') || '1'
    const rooms = searchParams.get('rooms') || '1'

    if (!city || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const hotels = await amadeusService.searchHotels({
      cityCode: city,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: Number(adults),
      roomQuantity: Number(rooms),
    })

    return NextResponse.json({
      success: true,
      data: hotels,
    })
  } catch (error) {
    console.error('Hotel search error:', error)
    return NextResponse.json(
      { error: 'Failed to search hotels' },
      { status: 500 }
    )
  }
}