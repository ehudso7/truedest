/**
 * Jest Setup Configuration
 *
 * This file runs before each test file and sets up the testing environment.
 */

import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest-testing'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/truedest_test'
process.env.NODE_ENV = 'test'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => new Headers(),
}))

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    priceAlert: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    wishlist: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    searchHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      user: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
      booking: { findMany: jest.fn(), updateMany: jest.fn() },
      notification: { deleteMany: jest.fn() },
      priceAlert: { deleteMany: jest.fn() },
      wishlist: { deleteMany: jest.fn() },
      review: { deleteMany: jest.fn() },
      searchHistory: { deleteMany: jest.fn() },
      supportTicket: { deleteMany: jest.fn() },
      account: { deleteMany: jest.fn() },
      session: { deleteMany: jest.fn() },
    })),
  },
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Add custom matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime())
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid Date`,
      pass,
    }
  },
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
      pass,
    }
  },
})

// Extend Jest matchers types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R
      toBeWithinRange(floor: number, ceiling: number): R
    }
  }
}
