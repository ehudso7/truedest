/**
 * Price Alerts API Integration Tests
 *
 * Tests for the price alerts CRUD endpoints.
 */

import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '@/app/api/price-alerts/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Price Alerts API', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    },
  }

  const mockPriceAlert = {
    id: 'alert-123',
    userId: 'user-123',
    alertType: 'FLIGHT',
    searchCriteria: { origin: 'JFK', destination: 'LAX' },
    originCode: 'JFK',
    destinationCode: 'LAX',
    targetPrice: 500,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue(mockSession)
  })

  describe('GET /api/price-alerts', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/price-alerts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.code).toBe('UNAUTHORIZED')
    })

    it('should return user price alerts', async () => {
      const mockAlerts = [mockPriceAlert]
      mockPrisma.priceAlert.findMany.mockResolvedValue(mockAlerts as any)
      mockPrisma.priceAlert.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/price-alerts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].id).toBe('alert-123')
    })

    it('should support pagination', async () => {
      mockPrisma.priceAlert.findMany.mockResolvedValue([])
      mockPrisma.priceAlert.count.mockResolvedValue(25)

      const request = new NextRequest(
        'http://localhost:3000/api/price-alerts?page=2&limit=10'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.total).toBe(25)
      expect(data.pagination.totalPages).toBe(3)
    })

    it('should filter by alert type', async () => {
      mockPrisma.priceAlert.findMany.mockResolvedValue([])
      mockPrisma.priceAlert.count.mockResolvedValue(0)

      const request = new NextRequest(
        'http://localhost:3000/api/price-alerts?type=FLIGHT'
      )
      await GET(request)

      expect(mockPrisma.priceAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            alertType: 'FLIGHT',
          }),
        })
      )
    })

    it('should filter by active status', async () => {
      mockPrisma.priceAlert.findMany.mockResolvedValue([])
      mockPrisma.priceAlert.count.mockResolvedValue(0)

      const request = new NextRequest(
        'http://localhost:3000/api/price-alerts?active=true'
      )
      await GET(request)

      expect(mockPrisma.priceAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      )
    })
  })

  describe('POST /api/price-alerts', () => {
    const validAlertData = {
      alertType: 'FLIGHT',
      searchCriteria: { origin: 'JFK', destination: 'LAX' },
      originCode: 'JFK',
      destinationCode: 'LAX',
      targetPrice: 500,
    }

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'POST',
        body: JSON.stringify(validAlertData),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should create a new price alert', async () => {
      mockPrisma.priceAlert.count.mockResolvedValue(5)
      mockPrisma.priceAlert.create.mockResolvedValue(mockPriceAlert as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'POST',
        body: JSON.stringify(validAlertData),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('alert-123')
    })

    it('should enforce maximum alert limit', async () => {
      mockPrisma.priceAlert.count.mockResolvedValue(20) // At limit

      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'POST',
        body: JSON.stringify(validAlertData),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('ALERT_LIMIT_REACHED')
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'POST',
        body: JSON.stringify({
          // Missing alertType and searchCriteria
          targetPrice: 500,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should create notification on alert creation', async () => {
      mockPrisma.priceAlert.count.mockResolvedValue(0)
      mockPrisma.priceAlert.create.mockResolvedValue(mockPriceAlert as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'POST',
        body: JSON.stringify(validAlertData),
        headers: { 'Content-Type': 'application/json' },
      })
      await POST(request)

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'PRICE_ALERT',
            userId: 'user-123',
          }),
        })
      )
    })

    it('should default currency to USD', async () => {
      mockPrisma.priceAlert.count.mockResolvedValue(0)
      mockPrisma.priceAlert.create.mockResolvedValue(mockPriceAlert as any)
      mockPrisma.notification.create.mockResolvedValue({} as any)

      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'POST',
        body: JSON.stringify(validAlertData), // No currency specified
        headers: { 'Content-Type': 'application/json' },
      })
      await POST(request)

      expect(mockPrisma.priceAlert.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currency: 'USD',
          }),
        })
      )
    })
  })

  describe('DELETE /api/price-alerts', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'DELETE',
      })
      const response = await DELETE(request)

      expect(response.status).toBe(401)
    })

    it('should delete all user alerts when no ids provided', async () => {
      mockPrisma.priceAlert.deleteMany.mockResolvedValue({ count: 5 })

      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'DELETE',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.deletedCount).toBe(5)
    })

    it('should delete specific alerts by ids', async () => {
      mockPrisma.priceAlert.deleteMany.mockResolvedValue({ count: 2 })

      const request = new NextRequest('http://localhost:3000/api/price-alerts', {
        method: 'DELETE',
        body: JSON.stringify({ ids: ['alert-1', 'alert-2'] }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.deletedCount).toBe(2)

      expect(mockPrisma.priceAlert.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          id: { in: ['alert-1', 'alert-2'] },
        },
      })
    })
  })
})

describe('Single Price Alert API', () => {
  // Note: Tests for /api/price-alerts/[id] would go here
  // Testing dynamic route handlers requires additional setup

  describe('GET /api/price-alerts/[id]', () => {
    it.todo('should return a single alert by id')
    it.todo('should return 404 for non-existent alert')
    it.todo('should not return alerts owned by other users')
  })

  describe('PATCH /api/price-alerts/[id]', () => {
    it.todo('should update alert target price')
    it.todo('should toggle alert active status')
    it.todo('should validate update payload')
  })

  describe('DELETE /api/price-alerts/[id]', () => {
    it.todo('should delete a single alert')
    it.todo('should return 404 for non-existent alert')
  })
})
