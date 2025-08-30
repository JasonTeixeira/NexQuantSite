/**
 * NEXURAL PLATFORM - ENTERPRISE RATE LIMITING
 * High-performance rate limiting for production trading platform
 * 
 * Features:
 * - Multi-tier rate limiting (user, IP, endpoint specific)
 * - DDoS protection 
 * - Sliding window algorithm
 * - Redis-backed distributed rate limiting
 * - Memory fallback for development
 * - Whitelist/Blacklist support
 * - Abuse detection and automatic blocking
 * - Rate limit headers (RFC compliant)
 */

import Redis from 'ioredis'

interface RateLimitConfig {
  // Rate limits by user tier
  limits: {
    anonymous: { requests: number, window: number }      // 60 req/min
    authenticated: { requests: number, window: number }   // 300 req/min  
    premium: { requests: number, window: number }        // 1000 req/min
    admin: { requests: number, window: number }          // 10000 req/min
  }
  // Endpoint-specific limits
  endpoints: {
    '/api/market-data/': { requests: number, window: number }  // 120 req/min
    '/api/trades': { requests: number, window: number }        // 60 req/min
    '/api/portfolio': { requests: number, window: number }     // 180 req/min
    '/api/health': { requests: number, window: number }        // 600 req/min
  }
  // DDoS protection
  ddos: {
    maxRequestsPerSecond: number    // 50 req/sec per IP
    blockDurationMinutes: number    // 15 minutes
    suspiciousThreshold: number     // 100 req/sec triggers investigation
  }
  // Sliding window settings
  windowSizeMs: number              // 60000ms (1 minute)
  cleanupIntervalMs: number         // 300000ms (5 minutes)
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  blocked: boolean
  reason?: string
}

export class EnterpriseRateLimiter {
  private redis: Redis | null = null
  private memoryCache = new Map<string, Array<{ timestamp: number, count: number }>>()
  private blacklist = new Set<string>()
  private whitelist = new Set<string>()
  private config: RateLimitConfig

  constructor() {
    this.config = {
      limits: {
        anonymous: { requests: 60, window: 60 },        // 60/min
        authenticated: { requests: 300, window: 60 },   // 300/min
        premium: { requests: 1000, window: 60 },       // 1000/min
        admin: { requests: 10000, window: 60 }         // 10000/min
      },
      endpoints: {
        '/api/market-data/': { requests: 120, window: 60 },
        '/api/trades': { requests: 60, window: 60 },
        '/api/portfolio': { requests: 180, window: 60 },
        '/api/health': { requests: 600, window: 60 }
      },
      ddos: {
        maxRequestsPerSecond: 50,
        blockDurationMinutes: 15,
        suspiciousThreshold: 100
      },
      windowSizeMs: 60000,           // 1 minute
      cleanupIntervalMs: 300000      // 5 minutes
    }

    this.initializeRedis()
    this.startCleanupInterval()
    this.loadWhitelist()
  }

  private async initializeRedis() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Rate Limiter: Development mode - using memory-based limiting')
      return
    }

    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 2,
        lazyConnect: true
      })

      this.redis.on('connect', () => {
        console.log('✅ Rate Limiter: Redis connected')
      })

      this.redis.on('error', (error) => {
        console.warn('⚠️ Rate Limiter: Redis error, falling back to memory', error.message)
      })

    } catch (error) {
      console.warn('⚠️ Rate Limiter: Redis initialization failed, using memory only')
    }
  }

  /**
   * Check rate limit for a request
   */
  async checkRateLimit(
    identifier: string,
    userTier: keyof typeof this.config.limits = 'anonymous',
    endpoint?: string,
    ip?: string
  ): Promise<RateLimitResult> {
    // EMERGENCY OVERRIDE: ALWAYS ALLOW ALL REQUESTS IN DEVELOPMENT
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Enterprise Rate Limiter: EMERGENCY DISABLED - ALLOWING ALL REQUESTS')
      return {
        allowed: true,
        limit: 999999,
        remaining: 999999,
        resetTime: Date.now() + 60000,
        blocked: false
      }
    }
    
    try {
      // Check whitelist first
      if (this.whitelist.has(identifier) || this.whitelist.has(ip || '')) {
        return {
          allowed: true,
          limit: 999999,
          remaining: 999999,
          resetTime: Date.now() + 60000,
          blocked: false
        }
      }

      // Check blacklist
      if (this.blacklist.has(identifier) || this.blacklist.has(ip || '')) {
        return {
          allowed: false,
          limit: 0,
          remaining: 0,
          resetTime: Date.now() + (this.config.ddos.blockDurationMinutes * 60000),
          blocked: true,
          reason: 'IP/User blacklisted'
        }
      }

      // Check DDoS protection if IP provided
      if (ip) {
        const ddosCheck = await this.checkDDoSProtection(ip)
        if (!ddosCheck.allowed) {
          return ddosCheck
        }
      }

      // Get rate limit for user tier
      const userLimit = this.config.limits[userTier]
      
      // Check endpoint-specific limits
      let endpointLimit = userLimit
      if (endpoint) {
        const endpointKey = Object.keys(this.config.endpoints).find(key => endpoint.startsWith(key))
        if (endpointKey) {
          endpointLimit = this.config.endpoints[endpointKey]
        }
      }

      // Use the more restrictive limit
      const limit = Math.min(userLimit.requests, endpointLimit.requests)
      const window = Math.max(userLimit.window, endpointLimit.window)

      // Check current usage
      const current = await this.getCurrentUsage(identifier, endpoint)
      const remaining = Math.max(0, limit - current)
      const resetTime = Date.now() + (window * 1000)

      // Record this request
      await this.recordRequest(identifier, endpoint)

      return {
        allowed: current < limit,
        limit,
        remaining,
        resetTime,
        blocked: false
      }

    } catch (error) {
      console.error('Rate limiter error:', error)
      // Fail open for availability
      return {
        allowed: true,
        limit: 300,
        remaining: 299,
        resetTime: Date.now() + 60000,
        blocked: false,
        reason: 'Rate limiter error - failing open'
      }
    }
  }

  /**
   * DDoS protection check
   */
  private async checkDDoSProtection(ip: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - 1000 // 1 second window
    
    const key = `ddos:${ip}`
    const requests = await this.getRequestsInWindow(key, windowStart, now)
    
    if (requests >= this.config.ddos.maxRequestsPerSecond) {
      // Block the IP
      await this.blockIP(ip, this.config.ddos.blockDurationMinutes)
      
      return {
        allowed: false,
        limit: this.config.ddos.maxRequestsPerSecond,
        remaining: 0,
        resetTime: now + (this.config.ddos.blockDurationMinutes * 60000),
        blocked: true,
        reason: 'DDoS protection triggered'
      }
    }

    // Check for suspicious activity
    if (requests >= this.config.ddos.suspiciousThreshold) {
      console.warn(`🚨 Suspicious activity detected from IP ${ip}: ${requests} req/sec`)
      // Could trigger additional monitoring or CAPTCHA
    }

    return { allowed: true, limit: 0, remaining: 0, resetTime: 0, blocked: false }
  }

  /**
   * Get current usage count
   */
  private async getCurrentUsage(identifier: string, endpoint?: string): Promise<number> {
    const key = `rate_limit:${identifier}${endpoint ? ':' + endpoint : ''}`
    const now = Date.now()
    const windowStart = now - this.config.windowSizeMs

    if (this.redis) {
      try {
        // Use Redis sorted sets for sliding window
        await this.redis.zremrangebyscore(key, '-inf', windowStart)
        return await this.redis.zcard(key)
      } catch (error) {
        // Fall back to memory
        return this.getMemoryUsage(key, windowStart)
      }
    } else {
      return this.getMemoryUsage(key, windowStart)
    }
  }

  /**
   * Record a request
   */
  private async recordRequest(identifier: string, endpoint?: string): Promise<void> {
    const key = `rate_limit:${identifier}${endpoint ? ':' + endpoint : ''}`
    const now = Date.now()

    if (this.redis) {
      try {
        // Add request with current timestamp as score
        await this.redis.zadd(key, now, now)
        // Set expiry for cleanup
        await this.redis.expire(key, Math.ceil(this.config.windowSizeMs / 1000) + 60)
        return
      } catch (error) {
        // Fall back to memory
      }
    }

    // Memory fallback
    const requests = this.memoryCache.get(key) || []
    requests.push({ timestamp: now, count: 1 })
    this.memoryCache.set(key, requests)
  }

  /**
   * Get requests in time window (for DDoS protection)
   */
  private async getRequestsInWindow(key: string, windowStart: number, windowEnd: number): Promise<number> {
    if (this.redis) {
      try {
        return await this.redis.zcount(key, windowStart, windowEnd)
      } catch (error) {
        // Fall back to memory
      }
    }

    const requests = this.memoryCache.get(key) || []
    return requests.filter(req => req.timestamp >= windowStart && req.timestamp <= windowEnd).length
  }

  private getMemoryUsage(key: string, windowStart: number): number {
    const requests = this.memoryCache.get(key) || []
    return requests.filter(req => req.timestamp >= windowStart).length
  }

  /**
   * Block an IP address
   */
  private async blockIP(ip: string, durationMinutes: number): Promise<void> {
    console.warn(`🚨 Blocking IP ${ip} for ${durationMinutes} minutes due to rate limiting`)
    
    this.blacklist.add(ip)
    
    // Auto-unblock after duration
    setTimeout(() => {
      this.blacklist.delete(ip)
      console.log(`✅ Auto-unblocked IP ${ip}`)
    }, durationMinutes * 60000)

    if (this.redis) {
      try {
        await this.redis.setex(`blocked:${ip}`, durationMinutes * 60, 'blocked')
      } catch (error) {
        console.warn('Failed to persist IP block to Redis:', error.message)
      }
    }
  }

  /**
   * Load whitelist from environment or config
   */
  private loadWhitelist(): void {
    const whitelistEnv = process.env.RATE_LIMIT_WHITELIST
    if (whitelistEnv) {
      const ips = whitelistEnv.split(',').map(ip => ip.trim())
      ips.forEach(ip => this.whitelist.add(ip))
      console.log(`✅ Rate Limiter: Loaded ${ips.length} whitelisted IPs`)
    }

    // Add localhost for development - be very permissive in dev mode
    if (process.env.NODE_ENV === 'development') {
      this.whitelist.add('127.0.0.1')
      this.whitelist.add('::1') 
      this.whitelist.add('localhost')
      this.whitelist.add('::ffff:127.0.0.1') // IPv4-mapped IPv6
      console.log('🔓 Rate Limiter: Development mode - localhost whitelisted for unlimited access')
    }
  }

  /**
   * Cleanup old entries from memory cache
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now()
      const cutoff = now - this.config.windowSizeMs
      let cleaned = 0

      for (const [key, requests] of this.memoryCache.entries()) {
        const validRequests = requests.filter(req => req.timestamp >= cutoff)
        
        if (validRequests.length === 0) {
          this.memoryCache.delete(key)
          cleaned++
        } else if (validRequests.length < requests.length) {
          this.memoryCache.set(key, validRequests)
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Rate Limiter: Cleaned ${cleaned} expired cache entries`)
      }
    }, this.config.cleanupIntervalMs)
  }

  /**
   * Get rate limit headers for HTTP responses
   */
  getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      'Retry-After': result.blocked ? Math.ceil((result.resetTime - Date.now()) / 1000).toString() : '0'
    }
  }

  /**
   * Get rate limiter statistics
   */
  getStats() {
    return {
      memoryCacheSize: this.memoryCache.size,
      blacklistSize: this.blacklist.size,
      whitelistSize: this.whitelist.size,
      redisConnected: this.redis?.status === 'ready',
      config: this.config
    }
  }
}

// Global singleton instance
export const enterpriseRateLimiter = new EnterpriseRateLimiter()
