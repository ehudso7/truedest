/**
 * Database Seed Script
 *
 * Seeds the database with sample data for development and testing.
 * Run with: npx ts-node prisma/seed.ts
 * Or: npm run db:seed (if configured in package.json)
 */

import { PrismaClient, UserRole, LoyaltyTier, BookingType, BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Guard against accidental production execution
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Refusing to run seed script in production. ' +
      'If you really need to seed production, set SEED_ALLOW_PRODUCTION=true'
    )
  }

  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ALLOW_PRODUCTION) {
    throw new Error('Seed script blocked in production environment')
  }

  console.log('🌱 Starting database seed...\n')

  // Clean up existing data
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...')
    await prisma.ticketMessage.deleteMany()
    await prisma.supportTicket.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.searchHistory.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.review.deleteMany()
    await prisma.priceAlert.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.activityBooking.deleteMany()
    await prisma.carRental.deleteMany()
    await prisma.hotelBooking.deleteMany()
    await prisma.flightBooking.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  }

  // Create demo users
  console.log('👤 Creating users...')

  const hashedPassword = await bcrypt.hash('Demo123!', 12)

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@truedest.com',
      name: 'Demo User',
      password: hashedPassword,
      phone: '+1-555-0100',
      preferredCurrency: 'USD',
      preferredLanguage: 'en',
      role: UserRole.USER,
      loyaltyPoints: 1500,
      loyaltyTier: LoyaltyTier.SILVER,
      memberSince: new Date('2024-01-15'),
      preferences: {
        budget: 'moderate',
        travelStyle: 'culture',
        interests: ['history', 'food', 'photography'],
        seatPreference: 'window',
      },
      notificationPrefs: {
        email: {
          bookingConfirmation: true,
          flightUpdates: true,
          priceAlerts: true,
          promotions: false,
          newsletter: true,
        },
        push: {
          enabled: true,
          flightUpdates: true,
          priceAlerts: true,
          chatMessages: true,
        },
      },
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@truedest.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      loyaltyPoints: 10000,
      loyaltyTier: LoyaltyTier.PLATINUM,
      memberSince: new Date('2023-01-01'),
    },
  })

  const supportUser = await prisma.user.create({
    data: {
      email: 'support@truedest.com',
      name: 'Support Agent',
      password: hashedPassword,
      role: UserRole.SUPPORT,
      loyaltyPoints: 0,
      loyaltyTier: LoyaltyTier.BRONZE,
    },
  })

  console.log(`  ✅ Created ${3} users`)

  // Create sample bookings
  console.log('✈️ Creating bookings...')

  const booking1 = await prisma.booking.create({
    data: {
      bookingReference: 'TD2024ABC123',
      userId: demoUser.id,
      type: BookingType.FLIGHT,
      status: BookingStatus.COMPLETED,
      totalAmount: 599.99,
      currency: 'USD',
      taxAmount: 65.50,
      loyaltyPointsUsed: 0,
      loyaltyPointsEarned: 599,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: 'CREDIT_CARD',
      travelDate: new Date('2024-03-15'),
      returnDate: new Date('2024-03-22'),
      adults: 1,
      specialRequests: 'Vegetarian meal',
    },
  })

  await prisma.flightBooking.create({
    data: {
      bookingId: booking1.id,
      flightNumber: 'UA123',
      airline: 'UA',
      airlineName: 'United Airlines',
      aircraftType: '737-800',
      departureAirport: 'JFK',
      departureCity: 'New York',
      departureCountry: 'USA',
      arrivalAirport: 'LHR',
      arrivalCity: 'London',
      arrivalCountry: 'UK',
      departureTime: new Date('2024-03-15T22:00:00Z'),
      arrivalTime: new Date('2024-03-16T10:00:00Z'),
      duration: 420, // 7 hours
      bookingClass: 'ECONOMY',
      cabinClass: 'Y',
      seatNumbers: ['24A'],
      basePrice: 499.99,
      taxes: 65.50,
      total: 565.49,
      status: 'COMPLETED',
      pnr: 'ABC123',
      ticketNumber: '0162345678901',
    },
  })

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      userId: demoUser.id,
      amount: 599.99,
      currency: 'USD',
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.COMPLETED,
      gatewayProvider: 'stripe',
      transactionId: 'pi_demo_123456',
      cardLast4: '4242',
      cardBrand: 'visa',
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      bookingReference: 'TD2024DEF456',
      userId: demoUser.id,
      type: BookingType.HOTEL,
      status: BookingStatus.CONFIRMED,
      totalAmount: 1299.00,
      currency: 'USD',
      taxAmount: 156.00,
      loyaltyPointsUsed: 500,
      loyaltyPointsEarned: 1299,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: 'CREDIT_CARD',
      travelDate: new Date('2024-04-10'),
      returnDate: new Date('2024-04-14'),
      adults: 2,
    },
  })

  await prisma.hotelBooking.create({
    data: {
      bookingId: booking2.id,
      hotelId: 'HTL_RITZ_PARIS',
      hotelName: 'The Ritz Paris',
      hotelAddress: '15 Place Vendôme',
      hotelCity: 'Paris',
      hotelCountry: 'France',
      starRating: 5,
      latitude: 48.8682,
      longitude: 2.3292,
      roomType: 'Deluxe Room',
      roomCount: 1,
      checkInDate: new Date('2024-04-10'),
      checkOutDate: new Date('2024-04-14'),
      nights: 4,
      guestName: 'Demo User',
      guestEmail: 'demo@truedest.com',
      roomRate: 285.75,
      taxes: 156.00,
      total: 1299.00,
      mealPlan: 'BB',
      status: 'CONFIRMED',
      confirmationNumber: 'RITZ24042024',
    },
  })

  console.log(`  ✅ Created ${2} bookings`)

  // Create price alerts
  console.log('🔔 Creating price alerts...')

  await prisma.priceAlert.create({
    data: {
      userId: demoUser.id,
      alertType: 'FLIGHT',
      searchCriteria: {
        origin: 'JFK',
        destination: 'TYO',
        departureDate: '2024-06-01',
        returnDate: '2024-06-15',
        class: 'BUSINESS',
      },
      originCode: 'JFK',
      destinationCode: 'TYO',
      departureDate: new Date('2024-06-01'),
      returnDate: new Date('2024-06-15'),
      cabinClass: 'BUSINESS',
      targetPrice: 3500,
      currentPrice: 4200,
      lowestPrice: 3800,
      highestPrice: 5200,
      currency: 'USD',
      isActive: true,
      notifyOnAnyDrop: false,
      dropPercentage: 10,
    },
  })

  await prisma.priceAlert.create({
    data: {
      userId: demoUser.id,
      alertType: 'HOTEL',
      searchCriteria: {
        city: 'PAR',
        checkIn: '2024-07-01',
        checkOut: '2024-07-05',
        stars: 4,
      },
      cityCode: 'PAR',
      checkInDate: new Date('2024-07-01'),
      checkOutDate: new Date('2024-07-05'),
      starRating: 4,
      targetPrice: 200,
      currentPrice: 250,
      currency: 'USD',
      isActive: true,
      notifyOnAnyDrop: true,
    },
  })

  console.log(`  ✅ Created ${2} price alerts`)

  // Create notifications
  console.log('📬 Creating notifications...')

  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'WELCOME',
        title: 'Welcome to TrueDest!',
        message: 'Start exploring amazing destinations and book your next adventure.',
        actionUrl: '/explore',
        read: true,
        readAt: new Date(),
      },
      {
        userId: demoUser.id,
        type: 'BOOKING_CONFIRMATION',
        title: 'Booking Confirmed!',
        message: 'Your flight to London has been confirmed. Check your email for details.',
        actionUrl: '/trips/TD2024ABC123',
        read: true,
        readAt: new Date(),
      },
      {
        userId: demoUser.id,
        type: 'PRICE_DROP',
        title: 'Price Drop Alert!',
        message: 'Flights to Tokyo dropped 15%! Book now before prices go up.',
        actionUrl: '/search?origin=JFK&destination=TYO',
        read: false,
      },
      {
        userId: demoUser.id,
        type: 'REMINDER',
        title: 'Trip Reminder',
        message: 'Your Paris trip is in 2 weeks. Don\'t forget to check your itinerary!',
        actionUrl: '/trips/TD2024DEF456',
        read: false,
      },
    ],
  })

  console.log(`  ✅ Created ${4} notifications`)

  // Create search history
  console.log('🔍 Creating search history...')

  await prisma.searchHistory.createMany({
    data: [
      {
        userId: demoUser.id,
        searchType: 'FLIGHT',
        query: { origin: 'JFK', destination: 'CDG', date: '2024-04-10', adults: 2 },
        resultsCount: 45,
      },
      {
        userId: demoUser.id,
        searchType: 'HOTEL',
        query: { city: 'Paris', checkIn: '2024-04-10', checkOut: '2024-04-14', guests: 2 },
        resultsCount: 128,
      },
      {
        userId: demoUser.id,
        searchType: 'FLIGHT',
        query: { origin: 'JFK', destination: 'TYO', date: '2024-06-01', adults: 1, class: 'BUSINESS' },
        resultsCount: 23,
      },
    ],
  })

  console.log(`  ✅ Created ${3} search history entries`)

  // Create wishlist items
  console.log('❤️ Creating wishlist...')

  await prisma.wishlist.createMany({
    data: [
      {
        userId: demoUser.id,
        entityType: 'DESTINATION',
        entityId: 'dest_bali',
        title: 'Bali, Indonesia',
        description: 'Beautiful beaches and temples',
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        price: 1200,
        currency: 'USD',
      },
      {
        userId: demoUser.id,
        entityType: 'HOTEL',
        entityId: 'hotel_mbs_sg',
        title: 'Marina Bay Sands, Singapore',
        description: 'Iconic infinity pool with city views',
        imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b0ac9495?w=800',
        price: 450,
        currency: 'USD',
      },
    ],
  })

  console.log(`  ✅ Created ${2} wishlist items`)

  // Create a support ticket
  console.log('🎫 Creating support ticket...')

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-2024-001',
      userId: demoUser.id,
      category: 'BOOKING',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      subject: 'Need to change seat assignment',
      description: 'I would like to change my seat from 24A to a window seat closer to the front if possible.',
      bookingReference: 'TD2024ABC123',
      assignedTo: supportUser.id,
      resolvedAt: new Date(),
      resolution: 'Seat changed to 12A as requested.',
    },
  })

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket.id,
        senderId: demoUser.id,
        senderType: 'USER',
        message: 'Hi, I would like to change my seat. Is seat 12A available?',
        attachments: [],
      },
      {
        ticketId: ticket.id,
        senderId: supportUser.id,
        senderType: 'SUPPORT',
        message: 'Hello! Yes, seat 12A is available. I\'ve changed your seat assignment. You\'ll receive an updated confirmation email shortly.',
        attachments: [],
      },
      {
        ticketId: ticket.id,
        senderId: demoUser.id,
        senderType: 'USER',
        message: 'Thank you so much!',
        attachments: [],
      },
    ],
  })

  console.log(`  ✅ Created ${1} support ticket with messages`)

  // Summary
  console.log('\n✅ Database seed completed successfully!\n')
  console.log('📋 Summary:')
  console.log(`   • Users: 3 (demo@truedest.com / Demo123!)`)
  console.log(`   • Bookings: 2`)
  console.log(`   • Price Alerts: 2`)
  console.log(`   • Notifications: 4`)
  console.log(`   • Search History: 3`)
  console.log(`   • Wishlist Items: 2`)
  console.log(`   • Support Tickets: 1`)
  console.log('\n🚀 Ready to start the application!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
