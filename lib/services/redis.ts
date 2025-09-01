import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redis.on('error', (err) => console.error('Redis Client Error', err))
redis.on('connect', () => console.log('Redis Client Connected'))

// Connect to Redis
if (!redis.isOpen) {
  redis.connect().catch(console.error)
}

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
}

export class CacheService {
  private defaultTTL = 3600 // 1 hour

  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Set cached value
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.defaultTTL
      await redis.setEx(key, ttl, JSON.stringify(value))
      
      // Add to tags if provided
      if (options?.tags) {
        for (const tag of options.tags) {
          await redis.sAdd(`tag:${tag}`, key)
          await redis.expire(`tag:${tag}`, ttl)
        }
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  // Delete cached value
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // Invalidate by tag
  async invalidateTag(tag: string): Promise<void> {
    try {
      const keys = await redis.sMembers(`tag:${tag}`)
      if (keys.length > 0) {
        await redis.del(keys)
        await redis.del(`tag:${tag}`)
      }
    } catch (error) {
      console.error('Cache invalidate tag error:', error)
    }
  }

  // Clear all cache
  async flush(): Promise<void> {
    try {
      await redis.flushAll()
    } catch (error) {
      console.error('Cache flush error:', error)
    }
  }

  // Cache wrapper function
  async remember<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Generate value
    const value = await factory()
    
    // Store in cache
    await this.set(key, value, options)
    
    return value
  }

  // Rate limiting
  async rateLimit(
    identifier: string,
    limit: number,
    window: number = 60 // seconds
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `rate_limit:${identifier}`
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, window)
    }
    
    const ttl = await redis.ttl(key)
    const resetAt = Date.now() + (ttl * 1000)
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt,
    }
  }

  // Session management
  async getSession(sessionId: string): Promise<any | null> {
    return this.get(`session:${sessionId}`)
  }

  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, data, { ttl })
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.delete(`session:${sessionId}`)
  }

  // Search results caching
  async cacheSearchResults(
    searchParams: any,
    results: any,
    ttl: number = 300 // 5 minutes
  ): Promise<void> {
    const key = this.generateSearchKey(searchParams)
    await this.set(key, results, { ttl, tags: ['search'] })
  }

  async getCachedSearchResults(searchParams: any): Promise<any | null> {
    const key = this.generateSearchKey(searchParams)
    return this.get(key)
  }

  // Price tracking
  async trackPrice(
    route: string,
    date: string,
    price: number
  ): Promise<void> {
    const key = `price:${route}:${date}`
    const history = await this.get<number[]>(key) || []
    history.push(price)
    
    // Keep last 30 prices
    if (history.length > 30) {
      history.shift()
    }
    
    await this.set(key, history, { ttl: 86400 * 7 }) // 7 days
  }

  async getPriceHistory(route: string, date: string): Promise<number[]> {
    const key = `price:${route}:${date}`
    return await this.get<number[]>(key) || []
  }

  // Queue management
  async addToQueue(queue: string, data: any): Promise<void> {
    await redis.lPush(`queue:${queue}`, JSON.stringify(data))
  }

  async processQueue(queue: string): Promise<any | null> {
    const item = await redis.rPop(`queue:${queue}`)
    return item ? JSON.parse(item) : null
  }

  async getQueueLength(queue: string): Promise<number> {
    return await redis.lLen(`queue:${queue}`)
  }

  // Distributed locking
  async acquireLock(
    resource: string,
    ttl: number = 30
  ): Promise<string | null> {
    const token = Math.random().toString(36).substring(2)
    const key = `lock:${resource}`
    
    const result = await redis.set(key, token, {
      NX: true,
      EX: ttl,
    })
    
    return result ? token : null
  }

  async releaseLock(resource: string, token: string): Promise<boolean> {
    const key = `lock:${resource}`
    const currentToken = await redis.get(key)
    
    if (currentToken === token) {
      await redis.del(key)
      return true
    }
    
    return false
  }

  // Helper methods
  private generateSearchKey(params: any): string {
    const sorted = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':')
    return `search:${sorted}`
  }
}

export const cacheService = new CacheService()

// Export redis client for direct use if needed
export { redis }