import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { amadeusService } from '@/lib/services/amadeus'
import { stripeService } from '@/lib/services/stripe'
import { pusherService } from '@/lib/services/pusher'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const body = await request.json()

    const {
      type,
      flightOffer,
      hotelOffer,
      travelers,
      contact,
      specialRequests,
      paymentMethod,
      useLoyaltyPoints,
    } = body

    // Generate booking reference
    const bookingReference = generateBookingReference()

    // Calculate total amount based on booking type
    let totalAmount = 0
    let currency = 'USD'
    
    if (type === 'FLIGHT' && flightOffer) {
      totalAmount = parseFloat(flightOffer.price.grandTotal)
      currency = flightOffer.price.currency
    } else if (type === 'HOTEL' && hotelOffer) {
      totalAmount = parseFloat(hotelOffer.price.total)
      currency = hotelOffer.price.currency
    }

    // Apply loyalty points if requested
    let loyaltyPointsUsed = 0
    if (useLoyaltyPoints) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true },
      })
      
      const maxPointsToUse = Math.min(user?.loyaltyPoints || 0, Math.floor(totalAmount * 10))
      loyaltyPointsUsed = maxPointsToUse
      totalAmount -= loyaltyPointsUsed / 10 // 10 points = $1
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
        loyaltyPointsEarned: Math.floor(totalAmount),
        paymentStatus: 'PENDING',
        paymentMethod,
        travelDate: new Date(flightOffer?.itineraries[0]?.segments[0]?.departure?.at || hotelOffer?.checkInDate),
        returnDate: flightOffer?.itineraries[1]?.segments[0]?.departure?.at 
          ? new Date(flightOffer.itineraries[1].segments[0].departure.at)
          : hotelOffer?.checkOutDate 
          ? new Date(hotelOffer.checkOutDate)
          : undefined,
        adults: travelers?.length || 1,
        specialRequests,
      },
    })

    // Create specific booking details based on type
    if (type === 'FLIGHT' && flightOffer) {
      // Create flight booking with Amadeus
      const amadeusBooking = await amadeusService.createFlightBooking(flightOffer, travelers)
      
      // Store flight details
      for (const itinerary of flightOffer.itineraries) {
        for (const segment of itinerary.segments) {
          await prisma.flightBooking.create({
            data: {
              bookingId: booking.id,
              flightNumber: `${segment.carrierCode}${segment.number}`,
              airline: segment.carrierCode,
              aircraftType: segment.aircraft?.code,
              departureAirport: segment.departure.iataCode,
              departureCity: segment.departure.iataCode, // Would need city lookup
              departureCountry: 'TBD',
              arrivalAirport: segment.arrival.iataCode,
              arrivalCity: segment.arrival.iataCode, // Would need city lookup
              arrivalCountry: 'TBD',
              departureTime: new Date(segment.departure.at),
              arrivalTime: new Date(segment.arrival.at),
              duration: parseDuration(segment.duration),
              bookingClass: flightOffer.travelerPricings[0].fareDetailsBySegment[0].cabin,
              seatNumbers: [],
              basePrice: parseFloat(flightOffer.price.base),
              taxes: parseFloat(flightOffer.price.fees?.[0]?.amount || '0'),
              total: parseFloat(flightOffer.price.grandTotal),
              status: 'CONFIRMED',
              pnr: amadeusBooking.id,
            },
          })
        }
      }
    } else if (type === 'HOTEL' && hotelOffer) {
      await prisma.hotelBooking.create({
        data: {
          bookingId: booking.id,
          hotelId: hotelOffer.hotel.hotelId,
          hotelName: hotelOffer.hotel.name,
          hotelAddress: hotelOffer.hotel.address?.lines?.join(', ') || '',
          hotelCity: hotelOffer.hotel.cityCode,
          hotelCountry: hotelOffer.hotel.address?.countryCode || '',
          starRating: hotelOffer.hotel.rating,
          roomType: hotelOffer.room?.typeEstimated?.category || 'Standard',
          roomCount: 1,
          checkInDate: new Date(hotelOffer.checkInDate),
          checkOutDate: new Date(hotelOffer.checkOutDate),
          nights: calculateNights(hotelOffer.checkInDate, hotelOffer.checkOutDate),
          guestName: `${travelers[0].name.firstName} ${travelers[0].name.lastName}`,
          specialRequests,
          roomRate: parseFloat(hotelOffer.price.base || hotelOffer.price.total),
          taxes: parseFloat(hotelOffer.price.taxes?.[0]?.amount || '0'),
          total: parseFloat(hotelOffer.price.total),
          status: 'CONFIRMED',
          confirmationNumber: generateConfirmationNumber(),
        },
      })
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
    await pusherService.sendNotification({
      userId,
      type: 'booking',
      title: 'Booking Created',
      message: `Your booking ${bookingReference} has been created and is awaiting payment.`,
      data: { bookingId: booking.id },
      actionUrl: `/booking/payment/${booking.id}`,
    })

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

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        bookingReference,
        totalAmount,
        currency,
        paymentClientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
      },
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// Helper functions
function generateBookingReference(): string {
  const prefix = 'TB'
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