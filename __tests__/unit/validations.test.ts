/**
 * Validation Schema Tests
 *
 * Unit tests for Zod validation schemas used across the application.
 */

import {
  registerSchema,
  loginSchema,
  flightSearchSchema,
  hotelSearchSchema,
  createPriceAlertSchema,
  createReviewSchema,
  contactFormSchema,
  paginationSchema,
} from '@/lib/validations'

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate a correct registration payload', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('john@example.com')
        expect(result.data.preferredCurrency).toBe('USD') // default
        expect(result.data.preferredLanguage).toBe('en') // default
      }
    })

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'Password123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('should reject weak passwords', () => {
      const testCases = [
        { password: 'short', message: 'too short' },
        { password: 'nouppercase123', message: 'no uppercase' },
        { password: 'NOLOWERCASE123', message: 'no lowercase' },
        { password: 'NoNumbers', message: 'no numbers' },
      ]

      testCases.forEach(({ password, message }) => {
        const result = registerSchema.safeParse({
          name: 'John Doe',
          email: 'john@example.com',
          password,
        })
        expect(result.success).toBe(false)
      })
    })

    it('should normalize email to lowercase', () => {
      const data = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'Password123',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('john@example.com')
      }
    })

    it('should reject names that are too short', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login credentials', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'anypassword',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Flight Search Schema', () => {
  const validFlightSearch = {
    originLocationCode: 'JFK',
    destinationLocationCode: 'LAX',
    departureDate: '2025-06-15',
    adults: 1,
  }

  it('should validate a correct flight search', () => {
    const result = flightSearchSchema.safeParse(validFlightSearch)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.originLocationCode).toBe('JFK')
      expect(result.data.travelClass).toBe('ECONOMY') // default
      expect(result.data.nonStop).toBe(false) // default
    }
  })

  it('should transform IATA codes to uppercase', () => {
    const result = flightSearchSchema.safeParse({
      ...validFlightSearch,
      originLocationCode: 'jfk',
      destinationLocationCode: 'lax',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.originLocationCode).toBe('JFK')
      expect(result.data.destinationLocationCode).toBe('LAX')
    }
  })

  it('should reject invalid IATA codes', () => {
    const result = flightSearchSchema.safeParse({
      ...validFlightSearch,
      originLocationCode: 'JFKX', // too long
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid date format', () => {
    const result = flightSearchSchema.safeParse({
      ...validFlightSearch,
      departureDate: '15-06-2025', // wrong format
    })
    expect(result.success).toBe(false)
  })

  it('should validate all travel classes', () => {
    const classes = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']
    classes.forEach((travelClass) => {
      const result = flightSearchSchema.safeParse({
        ...validFlightSearch,
        travelClass,
      })
      expect(result.success).toBe(true)
    })
  })

  it('should enforce passenger limits', () => {
    const result = flightSearchSchema.safeParse({
      ...validFlightSearch,
      adults: 10, // max is 9
    })
    expect(result.success).toBe(false)
  })

  it('should coerce string numbers to integers', () => {
    const result = flightSearchSchema.safeParse({
      ...validFlightSearch,
      adults: '2',
      children: '1',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.adults).toBe(2)
      expect(result.data.children).toBe(1)
    }
  })
})

describe('Hotel Search Schema', () => {
  const validHotelSearch = {
    cityCode: 'NYC',
    checkInDate: '2025-06-15',
    checkOutDate: '2025-06-20',
  }

  it('should validate a correct hotel search', () => {
    const result = hotelSearchSchema.safeParse(validHotelSearch)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.radius).toBe(5) // default
      expect(result.data.radiusUnit).toBe('KM') // default
    }
  })

  it('should transform city code to uppercase', () => {
    const result = hotelSearchSchema.safeParse({
      ...validHotelSearch,
      cityCode: 'nyc',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cityCode).toBe('NYC')
    }
  })

  it('should accept optional amenities array', () => {
    const result = hotelSearchSchema.safeParse({
      ...validHotelSearch,
      amenities: ['WIFI', 'POOL', 'GYM'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amenities).toHaveLength(3)
    }
  })
})

describe('Price Alert Schema', () => {
  it('should validate a flight price alert', () => {
    const result = createPriceAlertSchema.safeParse({
      alertType: 'FLIGHT',
      searchCriteria: {
        origin: 'JFK',
        destination: 'LAX',
      },
      originCode: 'JFK',
      destinationCode: 'LAX',
      targetPrice: 500,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe('USD') // default
    }
  })

  it('should validate a hotel price alert', () => {
    const result = createPriceAlertSchema.safeParse({
      alertType: 'HOTEL',
      searchCriteria: {
        city: 'NYC',
      },
      cityCode: 'NYC',
      targetPrice: 200,
      notifyOnAnyDrop: true,
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid alert types', () => {
    const result = createPriceAlertSchema.safeParse({
      alertType: 'INVALID',
      searchCriteria: {},
    })
    expect(result.success).toBe(false)
  })

  it('should enforce drop percentage range', () => {
    const result = createPriceAlertSchema.safeParse({
      alertType: 'FLIGHT',
      searchCriteria: {},
      dropPercentage: 150, // max is 100
    })
    expect(result.success).toBe(false)
  })
})

describe('Review Schema', () => {
  const validReview = {
    entityType: 'HOTEL',
    entityId: 'hotel-123',
    rating: 4,
    comment: 'This is a detailed review with enough characters.',
  }

  it('should validate a correct review', () => {
    const result = createReviewSchema.safeParse(validReview)
    expect(result.success).toBe(true)
  })

  it('should enforce rating range', () => {
    expect(
      createReviewSchema.safeParse({ ...validReview, rating: 0 }).success
    ).toBe(false)
    expect(
      createReviewSchema.safeParse({ ...validReview, rating: 6 }).success
    ).toBe(false)
    expect(
      createReviewSchema.safeParse({ ...validReview, rating: 5 }).success
    ).toBe(true)
  })

  it('should enforce minimum comment length', () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: 'Short', // less than 10 chars
    })
    expect(result.success).toBe(false)
  })

  it('should accept optional sub-ratings', () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      cleanliness: 5,
      comfort: 4,
      location: 5,
      staff: 4,
      valueForMoney: 3,
    })
    expect(result.success).toBe(true)
  })

  it('should validate image URLs', () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid image URLs', () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      images: ['not-a-url'],
    })
    expect(result.success).toBe(false)
  })
})

describe('Contact Form Schema', () => {
  const validContact = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question about booking',
    message: 'I have a question about my recent booking and need assistance.',
  }

  it('should validate a correct contact form', () => {
    const result = contactFormSchema.safeParse(validContact)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('general') // default
    }
  })

  it('should validate all categories', () => {
    const categories = ['general', 'support', 'partnerships', 'press', 'other']
    categories.forEach((category) => {
      const result = contactFormSchema.safeParse({
        ...validContact,
        category,
      })
      expect(result.success).toBe(true)
    })
  })

  it('should enforce minimum message length', () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      message: 'Too short message', // less than 20 chars
    })
    expect(result.success).toBe(false)
  })
})

describe('Pagination Schema', () => {
  it('should provide defaults for empty input', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
      expect(result.data.sortOrder).toBe('desc')
    }
  })

  it('should coerce string numbers', () => {
    const result = paginationSchema.safeParse({
      page: '5',
      limit: '50',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(5)
      expect(result.data.limit).toBe(50)
    }
  })

  it('should enforce limit bounds', () => {
    expect(paginationSchema.safeParse({ limit: 0 }).success).toBe(false)
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false)
    expect(paginationSchema.safeParse({ limit: 100 }).success).toBe(true)
  })

  it('should enforce positive page numbers', () => {
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false)
    expect(paginationSchema.safeParse({ page: -1 }).success).toBe(false)
  })
})
