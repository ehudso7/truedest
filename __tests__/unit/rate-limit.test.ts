/**
 * Rate Limiting Tests
 *
 * Unit tests for the rate limiting middleware.
 */

import {
  RateLimiter,
  rateLimitConfigs,
  getRateLimiterKey,
} from '@/lib/middleware/rate-limit'

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic functionality', () => {
    it('should allow requests within the limit', () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      })

      for (let i = 0; i < 5; i++) {
        const result = limiter.check('test-key')
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(4 - i)
      }
    })

    it('should block requests over the limit', () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 3,
      })

      // Use up the limit
      for (let i = 0; i < 3; i++) {
        limiter.check('test-key')
      }

      // Next request should be blocked
      const result = limiter.check('test-key')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should track different keys independently', () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      })

      // Use up limit for key1
      limiter.check('key1')
      limiter.check('key1')
      const key1Result = limiter.check('key1')
      expect(key1Result.allowed).toBe(false)

      // key2 should still have full quota
      const key2Result = limiter.check('key2')
      expect(key2Result.allowed).toBe(true)
      expect(key2Result.remaining).toBe(1)
    })

    it('should reset after window expires', () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      })

      // Use up the limit
      limiter.check('test-key')
      limiter.check('test-key')
      expect(limiter.check('test-key').allowed).toBe(false)

      // Advance time past the window
      jest.advanceTimersByTime(61000)

      // Should be allowed again
      const result = limiter.check('test-key')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
    })
  })

  describe('Retry-After calculation', () => {
    it('should calculate correct retry-after time', () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      })

      limiter.check('test-key')

      // Advance 30 seconds
      jest.advanceTimersByTime(30000)

      const result = limiter.check('test-key')
      expect(result.allowed).toBe(false)
      // Should be approximately 30 seconds remaining
      expect(result.retryAfter).toBeLessThanOrEqual(30)
      expect(result.retryAfter).toBeGreaterThan(25)
    })
  })

  describe('Reset functionality', () => {
    it('should reset a specific key', () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      })

      limiter.check('test-key')
      limiter.check('test-key')
      expect(limiter.check('test-key').allowed).toBe(false)

      limiter.reset('test-key')

      const result = limiter.check('test-key')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
    })

    it('should not affect other keys when resetting', () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      })

      limiter.check('key1')
      limiter.check('key2')
      limiter.check('key2')

      limiter.reset('key1')

      expect(limiter.check('key2').remaining).toBe(0)
    })
  })

  describe('Cleanup functionality', () => {
    it('should clean up expired entries', () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      })

      limiter.check('key1')
      limiter.check('key2')

      // Advance past window
      jest.advanceTimersByTime(61000)

      limiter.check('key3') // This should trigger cleanup

      // Both key1 and key2 should be cleaned up
      // New requests should have full quota
      expect(limiter.check('key1').remaining).toBe(4)
      expect(limiter.check('key2').remaining).toBe(4)
    })
  })
})

describe('Rate Limit Configurations', () => {
  it('should have auth rate limit configuration', () => {
    expect(rateLimitConfigs.auth).toBeDefined()
    expect(rateLimitConfigs.auth.windowMs).toBe(15 * 60 * 1000) // 15 minutes
    expect(rateLimitConfigs.auth.maxRequests).toBe(5)
  })

  it('should have api rate limit configuration', () => {
    expect(rateLimitConfigs.api).toBeDefined()
    expect(rateLimitConfigs.api.windowMs).toBe(60 * 1000) // 1 minute
    expect(rateLimitConfigs.api.maxRequests).toBe(60)
  })

  it('should have search rate limit configuration', () => {
    expect(rateLimitConfigs.search).toBeDefined()
    expect(rateLimitConfigs.search.windowMs).toBe(60 * 1000)
    expect(rateLimitConfigs.search.maxRequests).toBe(30)
  })

  it('should have booking rate limit configuration', () => {
    expect(rateLimitConfigs.booking).toBeDefined()
    expect(rateLimitConfigs.booking.windowMs).toBe(60 * 60 * 1000) // 1 hour
    expect(rateLimitConfigs.booking.maxRequests).toBe(10)
  })

  it('should have webhook rate limit configuration', () => {
    expect(rateLimitConfigs.webhook).toBeDefined()
    expect(rateLimitConfigs.webhook.maxRequests).toBe(100)
  })
})

describe('getRateLimiterKey', () => {
  it('should generate key from IP address', () => {
    const mockRequest = {
      headers: new Headers({
        'x-forwarded-for': '192.168.1.1',
      }),
    } as unknown as Request

    const key = getRateLimiterKey(mockRequest, 'test')
    expect(key).toBe('test:192.168.1.1')
  })

  it('should use first IP from x-forwarded-for header', () => {
    const mockRequest = {
      headers: new Headers({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
      }),
    } as unknown as Request

    const key = getRateLimiterKey(mockRequest, 'api')
    expect(key).toBe('api:192.168.1.1')
  })

  it('should fall back to x-real-ip header', () => {
    const mockRequest = {
      headers: new Headers({
        'x-real-ip': '10.0.0.1',
      }),
    } as unknown as Request

    const key = getRateLimiterKey(mockRequest, 'search')
    expect(key).toBe('search:10.0.0.1')
  })

  it('should use anonymous when no IP is available', () => {
    const mockRequest = {
      headers: new Headers(),
    } as unknown as Request

    const key = getRateLimiterKey(mockRequest, 'booking')
    expect(key).toBe('booking:anonymous')
  })

  it('should include user ID when provided', () => {
    const mockRequest = {
      headers: new Headers({
        'x-forwarded-for': '192.168.1.1',
      }),
    } as unknown as Request

    const key = getRateLimiterKey(mockRequest, 'api', 'user-123')
    expect(key).toBe('api:user-123:192.168.1.1')
  })
})
