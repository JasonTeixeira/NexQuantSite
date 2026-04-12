/**
 * NEXURAL PLATFORM - ENTERPRISE REDIS CACHING
 * High-performance caching layer for <100ms API responses
 * 
 * Features:
 * - Multi-layer caching strategy
 * - Intelligent cache invalidation
 * - Memory + Redis distributed caching
 * - Performance monitoring
 * - Cache warming
 * - TTL optimization per data type
 */

import Redis from 'ioredis'

interface CacheConfig {
  redis: {
    host: string
    port: number
    password?: string
    maxRetriesPerRequest: number
  }
  ttl: {
    marketData: number      // 30 seconds
    portfolio: number       // 5 minutes  
    health: number         // 60 seconds
    stream: number         // 10 seconds
    trades: number         // 15 minutes
  }
  performance: {
    maxMemoryCache: number  // Max items in memory
    compressionThreshold: number // Bytes to trigger compression
  }
}

export class EnterpriseCacheManager {
  private redis: Redis | null = null
  private memoryCache = new Map<string, { data: any, expires: number, hits: number }>()
  private config: CacheConfig
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    memoryHits: 0,
    redisHits: 0,
    errors: 0
  }

  constructor() {
    this.config = {
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 2
      },
      ttl: {
        marketData: 30,      // 30 seconds for market data
        portfolio: 300,      // 5 minutes for portfolio
        health: 60,          // 1 minute for health
        stream: 10,          // 10 seconds for stream
        trades: 900          // 15 minutes for trades
      },
      performance: {
        maxMemoryCache: 1000,
        compressionThreshold: 10240 // 10KB
      }
    }

    this.initializeRedis()
    this.startCacheCleanup()
  }

  private async initializeRedis() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Enterprise Cache: Development mode - using memory cache only')
      return
    }

    try {
      this.redis = new Redis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxLoadingTimeout: 1,
        lazyConnect: true
      })

      this.redis.on('connect', () => {
        console.log('✅ Enterprise Cache: Redis connected')
      })

      this.redis.on('error', (error) => {
        console.warn('⚠️ Enterprise Cache: Redis error, falling back to memory cache', error.message)
        this.stats.errors++
      })

    } catch (error) {
      console.warn('⚠️ Enterprise Cache: Redis initialization failed, using memory cache only')
      this.stats.errors++
    }
  }

  /**
   * Get cached data with multi-layer fallback
   */
  async get<T>(key: string, type: keyof typeof this.config.ttl = 'marketData'): Promise<T | null> {
    const cacheKey = `nexural:${type}:${key}`
    
    try {
      // Layer 1: Memory cache (fastest)
      const memoryResult = this.getFromMemory<T>(cacheKey)
      if (memoryResult !== null) {
        this.stats.hits++
        this.stats.memoryHits++
        return memoryResult
      }

      // Layer 2: Redis cache
      if (this.redis) {
        const redisResult = await this.getFromRedis<T>(cacheKey)
        if (redisResult !== null) {
          // Warm memory cache with Redis result
          this.setInMemory(cacheKey, redisResult, type)
          this.stats.hits++
          this.stats.redisHits++
          return redisResult
        }
      }

      this.stats.misses++
      return null

    } catch (error) {
      console.warn(`Enterprise Cache: Error getting ${key}`, error)
      this.stats.errors++
      return null
    }
  }

  /**
   * Set cached data in both layers
   */
  async set<T>(key: string, data: T, type: keyof typeof this.config.ttl = 'marketData'): Promise<void> {
    const cacheKey = `nexural:${type}:${key}`
    const ttl = this.config.ttl[type]

    try {
      // Set in memory cache (immediate)
      this.setInMemory(cacheKey, data, type)

      // Set in Redis cache (persistent)
      if (this.redis) {
        await this.setInRedis(cacheKey, data, ttl)
      }

      this.stats.sets++

    } catch (error) {
      console.warn(`Enterprise Cache: Error setting ${key}`, error)
      this.stats.errors++
    }
  }

  /**
   * High-performance market data caching
   */
  async cacheMarketData(symbol: string, data: any): Promise<void> {
    await this.set(`market:${symbol}`, data, 'marketData')
    
    // Also cache with timestamp for analytics
    await this.set(`market:${symbol}:${Date.now()}`, data, 'marketData')
  }

  /**
   * Portfolio data caching with user isolation
   */
  async cachePortfolioData(userId: string, data: any): Promise<void> {
    await this.set(`portfolio:${userId}`, data, 'portfolio')
  }

  /**
   * Intelligent cache warming for frequently accessed data
   */
  async warmCache(): Promise<void> {
    const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'SPY', 'QQQ', 'BTC-USD', 'ETH-USD']
    
    console.log('🔥 Enterprise Cache: Warming cache with popular symbols...')
    
    for (const symbol of popularSymbols) {
      try {
        // Pre-fetch and cache popular market data
        const response = await fetch(`http://localhost:3075/api/market-data/${symbol}`)
        if (response.ok) {
          const data = await response.json()
          await this.cacheMarketData(symbol, data)
        }
      } catch (error) {
        console.warn(`Cache warming failed for ${symbol}:`, error.message)
      }
    }
  }

  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.memoryCache.delete(key)
      return null
    }

    item.hits++
    return item.data
  }

  private setInMemory<T>(key: string, data: T, type: keyof typeof this.config.ttl): void {
    const expires = Date.now() + (this.config.ttl[type] * 1000)
    
    // Remove oldest entries if at capacity
    if (this.memoryCache.size >= this.config.performance.maxMemoryCache) {
      const oldestKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(oldestKey)
    }

    this.memoryCache.set(key, { data, expires, hits: 0 })
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.redis) return null

    try {
      const result = await this.redis.get(key)
      if (!result) return null

      return JSON.parse(result)
    } catch (error) {
      console.warn('Redis get error:', error.message)
      return null
    }
  }

  private async setInRedis<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.redis) return

    try {
      const serialized = JSON.stringify(data)
      await this.redis.setex(key, ttl, serialized)
    } catch (error) {
      console.warn('Redis set error:', error.message)
    }
  }

  /**
   * Cache invalidation for data updates
   */
  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    }

    // Clear Redis cache
    if (this.redis) {
      try {
        const keys = await this.redis.keys(`*${pattern}*`)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      } catch (error) {
        console.warn('Redis invalidation error:', error.message)
      }
    }
  }

  /**
   * Performance statistics
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0
    const memoryHitRate = this.stats.memoryHits / this.stats.hits * 100 || 0
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryHitRate: Math.round(memoryHitRate * 100) / 100,
      memoryCacheSize: this.memoryCache.size,
      isRedisConnected: this.redis?.status === 'ready'
    }
  }

  private startCacheCleanup(): void {
    // Clean expired memory cache entries every 60 seconds
    setInterval(() => {
      const now = Date.now()
      let cleaned = 0
      
      for (const [key, item] of this.memoryCache.entries()) {
        if (now > item.expires) {
          this.memoryCache.delete(key)
          cleaned++
        }
      }
      
      if (cleaned > 0) {
        console.log(`🧹 Enterprise Cache: Cleaned ${cleaned} expired entries`)
      }
    }, 60000)
  }
}

// Global singleton instance
export const enterpriseCache = new EnterpriseCacheManager()
