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
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      nonStop,
      maxPrice,
    } = body

    // Validate required fields
    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Search flights using Amadeus
    const flights = await amadeusService.searchFlights({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults: Number(adults),
      children: Number(children) || 0,
      infants: Number(infants) || 0,
      travelClass,
      nonStop,
      maxPrice,
    })

    // Log search in history
    if (session?.user) {
      await prisma.searchHistory.create({
        data: {
          userId: (session.user as any).id,
          searchType: 'FLIGHT',
          query: body,
          resultsCount: flights.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: flights,
      count: flights.length,
    })
  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const date = searchParams.get('date')
    const adults = searchParams.get('adults') || '1'

    if (!origin || !destination || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const flights = await amadeusService.searchFlights({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: date,
      adults: Number(adults),
    })

    return NextResponse.json({
      success: true,
      data: flights,
    })
  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    )
  }
}