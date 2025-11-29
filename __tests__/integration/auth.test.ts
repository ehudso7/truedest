/**
 * Authentication API Integration Tests
 *
 * Tests for user registration and authentication endpoints.
 */

import { NextRequest } from 'next/server'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
  compare: jest.fn().mockResolvedValue(true),
}))

describe('POST /api/auth/register', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (body: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  describe('Successful Registration', () => {
    it('should create a new user with valid data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'USER',
        loyaltyTier: 'BRONZE',
        loyaltyPoints: 100,
        preferredCurrency: 'USD',
        preferredLanguage: 'en',
        createdAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(mockUser as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = createRequest({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'SecurePass123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('newuser@example.com')
      expect(data.user.loyaltyPoints).toBe(100) // Welcome bonus
    })

    it('should hash the password before storing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      } as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = createRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
      })

      await registerHandler(request)

      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123', 12)
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: 'hashed_password_123',
          }),
        })
      )
    })

    it('should create a welcome notification', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      } as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = createRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
      })

      await registerHandler(request)

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'WELCOME',
            title: 'Welcome to TrueDest!',
          }),
        })
      )
    })

    it('should normalize email to lowercase', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      } as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = createRequest({
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePass123',
      })

      await registerHandler(request)

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
          }),
        })
      )
    })
  })

  describe('Validation Errors', () => {
    it('should reject invalid email format', async () => {
      const request = createRequest({
        name: 'Test User',
        email: 'invalid-email',
        password: 'SecurePass123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('VALIDATION_ERROR')
      expect(data.details).toContainEqual(
        expect.objectContaining({ field: 'email' })
      )
    })

    it('should reject weak passwords', async () => {
      const request = createRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should reject passwords without uppercase letters', async () => {
      const request = createRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'nouppercase123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should reject short names', async () => {
      const request = createRequest({
        name: 'A',
        email: 'test@example.com',
        password: 'SecurePass123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should reject missing required fields', async () => {
      const request = createRequest({
        email: 'test@example.com',
        // missing name and password
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Duplicate User Handling', () => {
    it('should reject registration if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
      } as any)

      const request = createRequest({
        name: 'New User',
        email: 'existing@example.com',
        password: 'SecurePass123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.code).toBe('USER_EXISTS')
    })
  })

  describe('Optional Fields', () => {
    it('should accept optional phone number', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
      } as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = createRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        phone: '+1234567890',
      })

      const response = await registerHandler(request)
      expect(response.status).toBe(201)

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: '+1234567890',
          }),
        })
      )
    })

    it('should accept preferred currency and language', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      } as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = createRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        preferredCurrency: 'EUR',
        preferredLanguage: 'de',
      })

      await registerHandler(request)

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            preferredCurrency: 'EUR',
            preferredLanguage: 'de',
          }),
        })
      )
    })
  })
})
