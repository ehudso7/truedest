/**
 * Flight Search API Route
 *
 * Searches for flights using Amadeus GDS with proper validation,
 * caching, and error handling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { amadeusService } from '@/lib/services/amadeus'
import { flightSearchSchema } from '@/lib/validations'
import { ZodError } from 'zod'

// Cache for flight searches (in production, use Redis)
const searchCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get session (optional for search)
    const session = await getServerSession(authOptions)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = flightSearchSchema.parse(body)

    // Generate cache key
    const cacheKey = JSON.stringify(validatedData)
    const cached = searchCache.get(cacheKey)

    // Check cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[FLIGHT_SEARCH] Cache hit for ${validatedData.originLocationCode}->${validatedData.destinationLocationCode}`)
      return NextResponse.json({
        success: true,
        data: cached.data,
        count: Array.isArray(cached.data) ? cached.data.length : 0,
        cached: true,
        responseTime: Date.now() - startTime,
      })
    }

    // Search flights using Amadeus
    const flights = await amadeusService.searchFlights({
      originLocationCode: validatedData.originLocationCode,
      destinationLocationCode: validatedData.destinationLocationCode,
      departureDate: validatedData.departureDate,
      returnDate: validatedData.returnDate,
      adults: validatedData.adults,
      children: validatedData.children,
      infants: validatedData.infants,
      travelClass: validatedData.travelClass,
      nonStop: validatedData.nonStop,
      maxPrice: validatedData.maxPrice,
      max: validatedData.max,
    })

    // Cache results
    searchCache.set(cacheKey, { data: flights, timestamp: Date.now() })

    // Log search in history (if authenticated)
    if (session?.user?.id) {
      await prisma.searchHistory.create({
        data: {
          userId: session.user.id,
          searchType: 'FLIGHT',
          query: validatedData,
          resultsCount: flights.length,
        },
      }).catch(err => {
        console.error('[FLIGHT_SEARCH] Failed to log search history:', err)
      })
    }

    const responseTime = Date.now() - startTime
    console.log(`[FLIGHT_SEARCH] ${validatedData.originLocationCode}->${validatedData.destinationLocationCode}: ${flights.length} results in ${responseTime}ms`)

    return NextResponse.json({
      success: true,
      data: flights,
      count: flights.length,
      cached: false,
      responseTime,
    })

  } catch (error) {
    console.error('[FLIGHT_SEARCH] Error:', error)

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid search parameters',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle Amadeus API errors
    if (error instanceof Error && error.message.includes('Amadeus')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to search flights at this time. Please try again.',
          code: 'GDS_ERROR',
        },
        { status: 503 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search flights',
        code: 'SEARCH_ERROR',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Build search params from query string
    const params = {
      originLocationCode: searchParams.get('origin') || '',
      destinationLocationCode: searchParams.get('destination') || '',
      departureDate: searchParams.get('date') || searchParams.get('departureDate') || '',
      returnDate: searchParams.get('returnDate') || undefined,
      adults: searchParams.get('adults') || '1',
      children: searchParams.get('children') || '0',
      infants: searchParams.get('infants') || '0',
      travelClass: searchParams.get('class') || searchParams.get('travelClass') || 'ECONOMY',
      nonStop: searchParams.get('nonStop') || 'false',
      maxPrice: searchParams.get('maxPrice') || undefined,
      max: searchParams.get('max') || '50',
    }

    // Validate
    const validatedData = flightSearchSchema.parse(params)

    // Search flights
    const flights = await amadeusService.searchFlights({
      originLocationCode: validatedData.originLocationCode,
      destinationLocationCode: validatedData.destinationLocationCode,
      departureDate: validatedData.departureDate,
      returnDate: validatedData.returnDate,
      adults: validatedData.adults,
      children: validatedData.children,
      infants: validatedData.infants,
      travelClass: validatedData.travelClass,
      nonStop: validatedData.nonStop,
      maxPrice: validatedData.maxPrice,
      max: validatedData.max,
    })

    return NextResponse.json({
      success: true,
      data: flights,
      count: flights.length,
    })

  } catch (error) {
    console.error('[FLIGHT_SEARCH] GET Error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid search parameters',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search flights',
        code: 'SEARCH_ERROR',
      },
      { status: 500 }
    )
  }
}
