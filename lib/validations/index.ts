/**
 * Validation Schemas
 *
 * Centralized Zod schemas for API request validation.
 */

import { z } from 'zod'

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional(),
  preferredCurrency: z.string().length(3).default('USD'),
  preferredLanguage: z.string().length(2).default('en'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().datetime().optional(),
  preferredCurrency: z.string().length(3).optional(),
  preferredLanguage: z.string().length(2).optional(),
  preferences: z.record(z.any()).optional(),
  notificationPrefs: z.record(z.any()).optional(),
})

// ============================================================================
// FLIGHT SEARCH SCHEMAS
// ============================================================================

export const flightSearchSchema = z.object({
  originLocationCode: z
    .string()
    .length(3, 'Origin must be a 3-letter IATA code')
    .toUpperCase(),
  destinationLocationCode: z
    .string()
    .length(3, 'Destination must be a 3-letter IATA code')
    .toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  children: z.coerce.number().int().min(0).max(9).default(0),
  infants: z.coerce.number().int().min(0).max(9).default(0),
  travelClass: z
    .enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
    .default('ECONOMY'),
  nonStop: z.coerce.boolean().default(false),
  maxPrice: z.coerce.number().positive().optional(),
  max: z.coerce.number().int().min(1).max(250).default(50),
})

// ============================================================================
// HOTEL SEARCH SCHEMAS
// ============================================================================

export const hotelSearchSchema = z.object({
  cityCode: z.string().min(2).max(10).toUpperCase(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  roomQuantity: z.coerce.number().int().min(1).max(9).default(1),
  radius: z.coerce.number().positive().default(5),
  radiusUnit: z.enum(['KM', 'MILE']).default('KM'),
  hotelName: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  ratings: z.array(z.number().int().min(1).max(5)).optional(),
  priceRange: z.string().optional(),
})

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

const travelerSchema = z.object({
  id: z.string(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
  }),
  gender: z.enum(['MALE', 'FEMALE']),
  contact: z.object({
    emailAddress: z.string().email(),
    phones: z.array(
      z.object({
        deviceType: z.enum(['MOBILE', 'LANDLINE']),
        countryCallingCode: z.string(),
        number: z.string(),
      })
    ),
  }),
  documents: z
    .array(
      z.object({
        documentType: z.enum(['PASSPORT', 'ID_CARD', 'VISA']),
        number: z.string(),
        expiryDate: z.string(),
        issuanceCountry: z.string().length(2),
        nationality: z.string().length(2),
        holder: z.boolean().default(true),
      })
    )
    .optional(),
})

export const createFlightBookingSchema = z.object({
  type: z.literal('FLIGHT'),
  flightOffer: z.record(z.any()), // Amadeus flight offer object
  travelers: z.array(travelerSchema).min(1),
  contact: z.object({
    emailAddress: z.string().email(),
    phone: z.string(),
  }),
  specialRequests: z.string().max(500).optional(),
  paymentMethod: z.string().optional(),
  useLoyaltyPoints: z.boolean().default(false),
})

export const createHotelBookingSchema = z.object({
  type: z.literal('HOTEL'),
  hotelOffer: z.record(z.any()), // Amadeus hotel offer object
  guests: z.array(
    z.object({
      name: z.object({
        firstName: z.string().min(1).max(50),
        lastName: z.string().min(1).max(50),
      }),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
  ),
  specialRequests: z.string().max(500).optional(),
  paymentMethod: z.string().optional(),
  useLoyaltyPoints: z.boolean().default(false),
})

export const createBookingSchema = z.discriminatedUnion('type', [
  createFlightBookingSchema,
  createHotelBookingSchema,
])

// ============================================================================
// PRICE ALERT SCHEMAS
// ============================================================================

export const createPriceAlertSchema = z.object({
  alertType: z.enum(['FLIGHT', 'HOTEL', 'PACKAGE']),
  searchCriteria: z.record(z.any()),

  // Flight specific
  originCode: z.string().length(3).toUpperCase().optional(),
  destinationCode: z.string().length(3).toUpperCase().optional(),
  departureDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  cabinClass: z.string().optional(),

  // Hotel specific
  cityCode: z.string().optional(),
  checkInDate: z.string().datetime().optional(),
  checkOutDate: z.string().datetime().optional(),
  starRating: z.number().int().min(1).max(5).optional(),

  // Alert settings
  targetPrice: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  notifyOnAnyDrop: z.boolean().default(false),
  dropPercentage: z.number().min(1).max(100).optional(),
  expiresAt: z.string().datetime().optional(),
})

export const updatePriceAlertSchema = z.object({
  targetPrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  notifyOnAnyDrop: z.boolean().optional(),
  dropPercentage: z.number().min(1).max(100).optional(),
  expiresAt: z.string().datetime().optional(),
})

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export const createReviewSchema = z.object({
  entityType: z.enum(['FLIGHT', 'HOTEL', 'CAR', 'ACTIVITY', 'DESTINATION', 'AIRLINE']),
  entityId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10).max(2000),
  cleanliness: z.number().int().min(1).max(5).optional(),
  comfort: z.number().int().min(1).max(5).optional(),
  location: z.number().int().min(1).max(5).optional(),
  facilities: z.number().int().min(1).max(5).optional(),
  staff: z.number().int().min(1).max(5).optional(),
  valueForMoney: z.number().int().min(1).max(5).optional(),
  images: z.array(z.string().url()).max(10).optional(),
})

// ============================================================================
// WISHLIST SCHEMAS
// ============================================================================

export const addToWishlistSchema = z.object({
  entityType: z.enum(['FLIGHT', 'HOTEL', 'PACKAGE', 'DESTINATION', 'ACTIVITY']),
  entityId: z.string(),
  title: z.string().max(200),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  metadata: z.record(z.any()).optional(),
})

// ============================================================================
// SUPPORT TICKET SCHEMAS
// ============================================================================

export const createTicketSchema = z.object({
  category: z.enum(['BOOKING', 'PAYMENT', 'CANCELLATION', 'REFUND', 'TECHNICAL', 'FEEDBACK', 'GENERAL']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  subject: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  bookingReference: z.string().optional(),
})

export const addTicketMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  attachments: z.array(z.string().url()).max(5).optional(),
})

// ============================================================================
// CONTACT FORM SCHEMA
// ============================================================================

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(5000),
  category: z.enum(['general', 'support', 'partnerships', 'press', 'other']).default('general'),
})

// ============================================================================
// NEWSLETTER SCHEMA
// ============================================================================

export const newsletterSchema = z.object({
  email: z.string().email(),
  preferences: z.array(z.enum(['deals', 'tips', 'destinations', 'updates'])).optional(),
})

// ============================================================================
// PAGINATION SCHEMA
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type FlightSearchInput = z.infer<typeof flightSearchSchema>
export type HotelSearchInput = z.infer<typeof hotelSearchSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CreatePriceAlertInput = z.infer<typeof createPriceAlertSchema>
export type UpdatePriceAlertInput = z.infer<typeof updatePriceAlertSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type AddTicketMessageInput = z.infer<typeof addTicketMessageSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
