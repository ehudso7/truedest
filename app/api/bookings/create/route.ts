/**
 * Booking Creation API Route
 *
 * Creates a new booking with flight or hotel details.
 * Integrates with Amadeus for GDS booking and Stripe for payments.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { amadeusService } from '@/lib/services/amadeus'
import { stripeService } from '@/lib/services/stripe'
import { pusherService } from '@/lib/services/pusher'
import { z } from 'zod'

// Booking request validation schema
const bookingRequestSchema = z.object({
  type: z.enum(['FLIGHT', 'HOTEL']),
  flightOffer: z.record(z.unknown()).optional(),
  hotelOffer: z.record(z.unknown()).optional(),
  travelers: z.array(z.object({
    id: z.string(),
    dateOfBirth: z.string(),
    name: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
    }),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    contact: z.object({
      emailAddress: z.string().email(),
      phones: z.array(z.object({
        deviceType: z.string(),
        countryCallingCode: z.string(),
        number: z.string(),
      })).optional(),
    }).optional(),
  })).min(1),
  contact: z.object({
    emailAddress: z.string().email(),
    phone: z.string().optional(),
  }),
  specialRequests: z.string().max(500).optional(),
  paymentMethod: z.string().optional(),
  useLoyaltyPoints: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Authenticate user
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse and validate request
    const body = await request.json()
    const validatedData = bookingRequestSchema.parse(body)

    const { type, flightOffer, hotelOffer, travelers, contact, specialRequests, paymentMethod, useLoyaltyPoints } = validatedData

    // Validate offer data based on type
    if (type === 'FLIGHT' && !flightOffer) {
      return NextResponse.json(
        { error: 'Flight offer data required', code: 'MISSING_FLIGHT_OFFER' },
        { status: 400 }
      )
    }

    if (type === 'HOTEL' && !hotelOffer) {
      return NextResponse.json(
        { error: 'Hotel offer data required', code: 'MISSING_HOTEL_OFFER' },
        { status: 400 }
      )
    }

    // Generate booking reference
    const bookingReference = generateBookingReference()

    // Calculate pricing
    let totalAmount = 0
    let currency = 'USD'

    if (type === 'FLIGHT' && flightOffer) {
      const offer = flightOffer as Record<string, unknown>
      const price = offer.price as Record<string, unknown>
      totalAmount = parseFloat(price.grandTotal as string) || 0
      currency = (price.currency as string) || 'USD'
    } else if (type === 'HOTEL' && hotelOffer) {
      const offer = hotelOffer as Record<string, unknown>
      const price = offer.price as Record<string, unknown>
      totalAmount = parseFloat(price.total as string) || 0
      currency = (price.currency as string) || 'USD'
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid price data', code: 'INVALID_PRICE' },
        { status: 400 }
      )
    }

    // Apply loyalty points if requested
    let loyaltyPointsUsed = 0
    if (useLoyaltyPoints) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true },
      })

      // 10 points = $1
      const maxPointsValue = Math.floor(totalAmount * 10)
      const availablePoints = user?.loyaltyPoints || 0
      loyaltyPointsUsed = Math.min(availablePoints, maxPointsValue)
      totalAmount -= loyaltyPointsUsed / 10
    }

    // Calculate loyalty points to earn (1 point per dollar)
    const loyaltyPointsEarned = Math.floor(totalAmount)

    // Extract travel dates
    let travelDate: Date
    let returnDate: Date | null = null

    if (type === 'FLIGHT' && flightOffer) {
      const offer = flightOffer as Record<string, unknown>
      const itineraries = offer.itineraries as Array<Record<string, unknown>> | undefined

      // Validate itineraries structure
      if (!itineraries || !Array.isArray(itineraries) || itineraries.length === 0) {
        return NextResponse.json(
          { error: 'Invalid flight offer: missing itineraries', code: 'INVALID_OFFER' },
          { status: 400 }
        )
      }

      const segments = itineraries[0]?.segments as Array<Record<string, unknown>> | undefined
      if (!segments || !Array.isArray(segments) || segments.length === 0) {
        return NextResponse.json(
          { error: 'Invalid flight offer: missing segments', code: 'INVALID_OFFER' },
          { status: 400 }
        )
      }

      const departure = segments[0]?.departure as Record<string, unknown> | undefined
      if (!departure?.at) {
        return NextResponse.json(
          { error: 'Invalid flight offer: missing departure time', code: 'INVALID_OFFER' },
          { status: 400 }
        )
      }

      travelDate = new Date(departure.at as string)

      if (itineraries.length > 1) {
        const returnSegments = itineraries[1]?.segments as Array<Record<string, unknown>> | undefined
        if (returnSegments && Array.isArray(returnSegments) && returnSegments.length > 0) {
          const returnDeparture = returnSegments[0]?.departure as Record<string, unknown> | undefined
          if (returnDeparture?.at) {
            returnDate = new Date(returnDeparture.at as string)
          }
        }
      }
    } else if (type === 'HOTEL' && hotelOffer) {
      const offer = hotelOffer as Record<string, unknown>
      if (!offer.checkInDate || !offer.checkOutDate) {
        return NextResponse.json(
          { error: 'Invalid hotel offer: missing check-in/check-out dates', code: 'INVALID_OFFER' },
          { status: 400 }
        )
      }
      travelDate = new Date(offer.checkInDate as string)
      returnDate = new Date(offer.checkOutDate as string)
    } else {
      travelDate = new Date()
    }

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        userId,
        type,
        status: 'PENDING',
        totalAmount,
        currency,
        loyaltyPointsUsed,
        loyaltyPointsEarned,
        paymentStatus: 'PENDING',
        paymentMethod,
        travelDate,
        returnDate,
        adults: travelers.length,
        specialRequests,
      },
    })

    // Create type-specific booking details
    if (type === 'FLIGHT' && flightOffer) {
      await createFlightBookingDetails(booking.id, flightOffer as Record<string, unknown>, travelers)
    } else if (type === 'HOTEL' && hotelOffer) {
      await createHotelBookingDetails(booking.id, hotelOffer as Record<string, unknown>, travelers)
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalAmount,
      currency,
      bookingId: booking.id,
      userId,
      metadata: {
        bookingReference,
        type,
      },
    })

    // Send real-time notification
    try {
      await pusherService.sendNotification({
        userId,
        type: 'booking',
        title: 'Booking Created',
        message: `Your booking ${bookingReference} has been created and is awaiting payment.`,
        data: { bookingId: booking.id },
        actionUrl: `/booking/${booking.id}`,
      })
    } catch (notifyError) {
      console.error('[BOOKING] Notification error:', notifyError)
      // Non-critical, continue
    }

    // Deduct loyalty points if used
    if (loyaltyPointsUsed > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: {
            decrement: loyaltyPointsUsed,
          },
        },
      })
    }

    const responseTime = Date.now() - startTime
    console.log(`[BOOKING] Created ${bookingReference} for user ${userId} in ${responseTime}ms`)

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        bookingReference,
        totalAmount,
        currency,
        loyaltyPointsUsed,
        loyaltyPointsEarned,
        paymentClientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('[BOOKING] Creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid booking data',
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
        error: 'Failed to create booking. Please try again.',
        code: 'BOOKING_ERROR',
      },
      { status: 500 }
    )
  }
}

// Helper functions

function generateBookingReference(): string {
  const prefix = 'TD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

function generateConfirmationNumber(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

function parseDuration(duration: string): number {
  // Parse ISO 8601 duration (e.g., PT2H30M) to minutes
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  return hours * 60 + minutes
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

async function createFlightBookingDetails(
  bookingId: string,
  flightOffer: Record<string, unknown>,
  travelers: Array<Record<string, unknown>>
) {
  const itineraries = flightOffer.itineraries as Array<Record<string, unknown>>
  const price = flightOffer.price as Record<string, unknown>
  const travelerPricings = flightOffer.travelerPricings as Array<Record<string, unknown>>

  for (const itinerary of itineraries) {
    const segments = itinerary.segments as Array<Record<string, unknown>>

    for (const segment of segments) {
      const departure = segment.departure as Record<string, unknown>
      const arrival = segment.arrival as Record<string, unknown>
      const aircraft = segment.aircraft as Record<string, unknown> | undefined
      const fareDetails = travelerPricings?.[0]?.fareDetailsBySegment?.[0] as Record<string, unknown> | undefined

      await prisma.flightBooking.create({
        data: {
          bookingId,
          flightNumber: `${segment.carrierCode}${segment.number}`,
          airline: segment.carrierCode as string,
          aircraftType: aircraft?.code as string | undefined,
          departureAirport: departure.iataCode as string,
          departureCity: departure.iataCode as string, // Would use lookup service in production
          departureCountry: 'US', // Would use lookup service in production
          arrivalAirport: arrival.iataCode as string,
          arrivalCity: arrival.iataCode as string,
          arrivalCountry: 'US',
          departureTime: new Date(departure.at as string),
          arrivalTime: new Date(arrival.at as string),
          duration: parseDuration(segment.duration as string),
          bookingClass: (fareDetails?.cabin as string) || 'ECONOMY',
          cabinClass: (fareDetails?.class as string) || 'Y',
          seatNumbers: [],
          basePrice: parseFloat(price.base as string) || 0,
          taxes: parseFloat((price.fees as Array<Record<string, unknown>>)?.[0]?.amount as string || '0'),
          total: parseFloat(price.grandTotal as string) || 0,
          status: 'PENDING',
        },
      })
    }
  }
}

async function createHotelBookingDetails(
  bookingId: string,
  hotelOffer: Record<string, unknown>,
  travelers: Array<Record<string, unknown>>
) {
  const hotel = hotelOffer.hotel as Record<string, unknown>
  const price = hotelOffer.price as Record<string, unknown>
  const room = hotelOffer.room as Record<string, unknown> | undefined
  const address = hotel.address as Record<string, unknown> | undefined
  const checkInDate = hotelOffer.checkInDate as string
  const checkOutDate = hotelOffer.checkOutDate as string

  const mainTraveler = travelers[0] as Record<string, unknown>
  const travelerName = mainTraveler?.name as Record<string, unknown>

  await prisma.hotelBooking.create({
    data: {
      bookingId,
      hotelId: hotel.hotelId as string,
      hotelName: hotel.name as string,
      hotelAddress: (address?.lines as string[])?.join(', ') || '',
      hotelCity: hotel.cityCode as string,
      hotelCountry: (address?.countryCode as string) || '',
      starRating: parseInt(hotel.rating as string) || undefined,
      latitude: hotel.latitude as number | undefined,
      longitude: hotel.longitude as number | undefined,
      roomType: (room?.typeEstimated as Record<string, unknown>)?.category as string || 'Standard',
      roomCount: 1,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      nights: calculateNights(checkInDate, checkOutDate),
      guestName: `${travelerName?.firstName || ''} ${travelerName?.lastName || ''}`.trim() || 'Guest',
      guestEmail: (mainTraveler?.contact as Record<string, unknown>)?.emailAddress as string | undefined,
      roomRate: parseFloat(price.base as string || price.total as string) || 0,
      taxes: parseFloat((price.taxes as Array<Record<string, unknown>>)?.[0]?.amount as string || '0'),
      total: parseFloat(price.total as string) || 0,
      status: 'PENDING',
      confirmationNumber: generateConfirmationNumber(),
    },
  })
}
