/**
 * Rate Limiting Middleware
 *
 * Provides in-memory rate limiting for API routes.
 * In production, use Redis for distributed rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests per window
  message?: string      // Custom error message
  keyPrefix?: string    // Prefix for rate limit key
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

/**
 * Default rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict limit for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    keyPrefix: 'auth',
  },

  // Standard API limit
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please slow down.',
    keyPrefix: 'api',
  },

  // Generous limit for search
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests. Please wait a moment.',
    keyPrefix: 'search',
  },

  // Strict limit for booking creation
  booking: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many booking attempts. Please wait a moment.',
    keyPrefix: 'booking',
  },

  // Very strict for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset requests. Please try again later.',
    keyPrefix: 'pwd-reset',
  },
}

/**
 * Get client identifier for rate limiting
 */
export function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')

  const ip = cfIp || realIp || forwarded?.split(',')[0]?.trim() || 'anonymous'

  // Optionally include user ID if authenticated
  // const userId = request.headers.get('x-user-id')
  // return userId ? `${ip}:${userId}` : ip

  return ip
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = `${config.keyPrefix || 'default'}:${clientId}`

  let record = rateLimitStore.get(key)

  // Initialize or reset if window expired
  if (!record || record.resetTime < now) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  // Increment count
  record.count++
  rateLimitStore.set(key, record)

  const remaining = Math.max(0, config.maxRequests - record.count)
  const resetIn = Math.max(0, record.resetTime - now)
  const allowed = record.count <= config.maxRequests

  return { allowed, remaining, resetIn }
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(
  remaining: number,
  resetIn: number,
  limit: number
): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', limit.toString())
  headers.set('X-RateLimit-Remaining', remaining.toString())
  headers.set('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + resetIn / 1000).toString())
  return headers
}

/**
 * Rate limit middleware function
 */
export function rateLimit(config: RateLimitConfig = rateLimitConfigs.api) {
  return async function rateLimitMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const clientId = getClientId(request)
    const { allowed, remaining, resetIn } = checkRateLimit(clientId, config)

    if (!allowed) {
      const response = NextResponse.json(
        {
          error: config.message || 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(resetIn / 1000),
        },
        { status: 429 }
      )

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + resetIn / 1000).toString())
      response.headers.set('Retry-After', Math.ceil(resetIn / 1000).toString())

      return response
    }

    // Return null to continue to the route handler
    return null
  }
}

/**
 * Apply rate limit in route handler
 * Usage: const rateLimitResult = await applyRateLimit(request, rateLimitConfigs.auth)
 *        if (rateLimitResult) return rateLimitResult
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.api
): Promise<NextResponse | null> {
  return rateLimit(config)(request)
}

/**
 * Rate limit decorator for API routes
 * Adds rate limit headers to successful responses
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = rateLimitConfigs.api
) {
  return async function rateLimitedHandler(request: NextRequest): Promise<NextResponse> {
    const clientId = getClientId(request)
    const { allowed, remaining, resetIn } = checkRateLimit(clientId, config)

    if (!allowed) {
      return NextResponse.json(
        {
          error: config.message || 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + resetIn / 1000).toString(),
            'Retry-After': Math.ceil(resetIn / 1000).toString(),
          },
        }
      )
    }

    // Call the original handler
    const response = await handler(request)

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + resetIn / 1000).toString())

    return response
  }
}
