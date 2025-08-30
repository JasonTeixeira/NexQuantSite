// ⚡ REDIS-BASED RATE LIMITING - Prevent DDoS attacks and API abuse
// Addresses CRITICAL security vulnerability: No rate limiting on APIs

import Redis from 'ioredis'

interface RateLimitRule {
  id: string
  name: string
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests in the window
  keyGenerator: (req: any) => string // Function to generate cache key
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  priority: number // Higher number = higher priority
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
  rule: string
}

interface RateLimitConfig {
  redis: Redis
  defaultRules: RateLimitRule[]
  enableBlacklist: boolean
  enableWhitelist: boolean
  logViolations: boolean
}

// 🛡️ COMPREHENSIVE RATE LIMITING RULES
export const DEFAULT_RATE_LIMIT_RULES: RateLimitRule[] = [
  // 🚨 CRITICAL API ENDPOINTS
  {
    id: 'broker_api_calls',
    name: 'Broker API Calls',
    windowMs: 60000, // 1 minute
    maxRequests: 100, // 100 calls per minute per user
    keyGenerator: (req) => `broker_api:${req.userId}`,
    priority: 10
  },
  {
    id: 'order_placement',
    name: 'Order Placement',
    windowMs: 60000, // 1 minute
    maxRequests: 30, // 30 orders per minute per user
    keyGenerator: (req) => `orders:${req.userId}`,
    priority: 20
  },
  {
    id: 'portfolio_updates',
    name: 'Portfolio Updates',
    windowMs: 10000, // 10 seconds
    maxRequests: 10, // 10 updates per 10 seconds per user
    keyGenerator: (req) => `portfolio:${req.userId}`,
    priority: 15
  },

  // 🔐 AUTHENTICATION ENDPOINTS
  {
    id: 'login_attempts',
    name: 'Login Attempts',
    windowMs: 900000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes per IP
    keyGenerator: (req) => `login:${req.ip}`,
    priority: 25
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    windowMs: 3600000, // 1 hour
    maxRequests: 3, // 3 attempts per hour per IP
    keyGenerator: (req) => `password_reset:${req.ip}`,
    priority: 30
  },
  {
    id: 'account_creation',
    name: 'Account Creation',
    windowMs: 3600000, // 1 hour
    maxRequests: 5, // 5 accounts per hour per IP
    keyGenerator: (req) => `signup:${req.ip}`,
    priority: 20
  },

  // 📊 DATA ACCESS ENDPOINTS
  {
    id: 'market_data_requests',
    name: 'Market Data Requests',
    windowMs: 60000, // 1 minute
    maxRequests: 200, // 200 requests per minute per user
    keyGenerator: (req) => `market_data:${req.userId}`,
    skipSuccessfulRequests: false,
    priority: 5
  },
  {
    id: 'ai_analysis_requests',
    name: 'AI Analysis Requests',
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 AI requests per minute per user (expensive operations)
    keyGenerator: (req) => `ai_analysis:${req.userId}`,
    priority: 18
  },

  // 🌐 GENERAL API LIMITS
  {
    id: 'api_general_user',
    name: 'General API (Per User)',
    windowMs: 60000, // 1 minute
    maxRequests: 500, // 500 requests per minute per user
    keyGenerator: (req) => `api:${req.userId}`,
    priority: 1
  },
  {
    id: 'api_general_ip',
    name: 'General API (Per IP)',
    windowMs: 60000, // 1 minute
    maxRequests: 1000, // 1000 requests per minute per IP (multiple users)
    keyGenerator: (req) => `api:${req.ip}`,
    priority: 2
  },

  // 🚫 ABUSE PREVENTION
  {
    id: 'websocket_connections',
    name: 'WebSocket Connections',
    windowMs: 300000, // 5 minutes
    maxRequests: 10, // 10 connections per 5 minutes per user
    keyGenerator: (req) => `websocket:${req.userId}`,
    priority: 15
  }
]

// 🛡️ ADVANCED RATE LIMITER CLASS
export class AdvancedRateLimiter {
  private redis: Redis
  private rules: RateLimitRule[]
  private config: RateLimitConfig
  private blacklist: Set<string> = new Set()
  private whitelist: Set<string> = new Set()

  constructor(config: RateLimitConfig) {
    this.redis = config.redis
    this.rules = [...config.defaultRules].sort((a, b) => b.priority - a.priority)
    this.config = config

    // Initialize blacklist and whitelist from Redis
    this.loadBlacklistWhitelist()
  }

  // 🔍 CHECK RATE LIMITS
  async checkRateLimit(request: any, ruleIds?: string[]): Promise<RateLimitResult[]> {
    const results: RateLimitResult[] = []
    const applicableRules = ruleIds 
      ? this.rules.filter(rule => ruleIds.includes(rule.id))
      : this.rules

    // Check whitelist first
    if (this.config.enableWhitelist && this.isWhitelisted(request)) {
      return applicableRules.map(rule => ({
        allowed: true,
        remaining: rule.maxRequests,
        resetTime: Date.now() + rule.windowMs,
        rule: rule.id
      }))
    }

    // Check blacklist
    if (this.config.enableBlacklist && this.isBlacklisted(request)) {
      return applicableRules.map(rule => ({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + rule.windowMs,
        retryAfter: rule.windowMs,
        rule: rule.id
      }))
    }

    // Check each rule
    for (const rule of applicableRules) {
      const result = await this.checkSingleRule(request, rule)
      results.push(result)

      // If any rule fails and it's high priority, block immediately
      if (!result.allowed && rule.priority >= 15) {
        break
      }
    }

    return results
  }

  // 🔍 CHECK SINGLE RATE LIMIT RULE
  private async checkSingleRule(request: any, rule: RateLimitRule): Promise<RateLimitResult> {
    const key = `rate_limit:${rule.id}:${rule.keyGenerator(request)}`
    const now = Date.now()
    const windowStart = now - rule.windowMs

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline()
      
      // Remove old entries outside the window
      pipeline.zremrangebyscore(key, '-inf', windowStart)
      
      // Count current requests in window
      pipeline.zcard(key)
      
      // Set expiry on the key
      pipeline.expire(key, Math.ceil(rule.windowMs / 1000))

      const results = await pipeline.exec()
      
      if (!results) {
        throw new Error('Redis pipeline execution failed')
      }

      const currentCount = results[1][1] as number
      const remaining = Math.max(0, rule.maxRequests - currentCount)
      const resetTime = now + rule.windowMs

      if (currentCount >= rule.maxRequests) {
        // Rate limit exceeded
        if (this.config.logViolations) {
          this.logViolation(request, rule, currentCount)
        }

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: rule.windowMs,
          rule: rule.id
        }
      }

      // Add current request to the window
      await this.redis.zadd(key, now, `${now}-${Math.random()}`)

      return {
        allowed: true,
        remaining: remaining - 1,
        resetTime,
        rule: rule.id
      }

    } catch (error) {
      console.error(`Rate limiting error for rule ${rule.id}:`, error)
      
      // Fail open (allow request) on Redis errors
      return {
        allowed: true,
        remaining: rule.maxRequests,
        resetTime: now + rule.windowMs,
        rule: rule.id
      }
    }
  }

  // 📊 INCREMENT COUNTER (for tracking successful operations)
  async incrementCounter(request: any, ruleId: string): Promise<void> {
    const rule = this.rules.find(r => r.id === ruleId)
    if (!rule) return

    const key = `rate_limit:${rule.id}:${rule.keyGenerator(request)}`
    const now = Date.now()

    await this.redis.zadd(key, now, `${now}-${Math.random()}`)
  }

  // ⚫ BLACKLIST MANAGEMENT
  async addToBlacklist(identifier: string, ttlSeconds?: number): Promise<void> {
    this.blacklist.add(identifier)
    
    if (ttlSeconds) {
      await this.redis.setex(`blacklist:${identifier}`, ttlSeconds, '1')
    } else {
      await this.redis.sadd('permanent_blacklist', identifier)
    }

    console.log(`🚫 Added to blacklist: ${identifier}`)
  }

  async removeFromBlacklist(identifier: string): Promise<void> {
    this.blacklist.delete(identifier)
    await this.redis.del(`blacklist:${identifier}`)
    await this.redis.srem('permanent_blacklist', identifier)
    
    console.log(`✅ Removed from blacklist: ${identifier}`)
  }

  private isBlacklisted(request: any): boolean {
    return this.blacklist.has(request.ip) || this.blacklist.has(request.userId)
  }

  // ⚪ WHITELIST MANAGEMENT
  async addToWhitelist(identifier: string): Promise<void> {
    this.whitelist.add(identifier)
    await this.redis.sadd('whitelist', identifier)
    
    console.log(`⚪ Added to whitelist: ${identifier}`)
  }

  async removeFromWhitelist(identifier: string): Promise<void> {
    this.whitelist.delete(identifier)
    await this.redis.srem('whitelist', identifier)
    
    console.log(`🚫 Removed from whitelist: ${identifier}`)
  }

  private isWhitelisted(request: any): boolean {
    return this.whitelist.has(request.ip) || this.whitelist.has(request.userId)
  }

  // 📊 ANALYTICS AND MONITORING
  async getRateLimitStats(ruleId?: string): Promise<any> {
    const pattern = ruleId ? `rate_limit:${ruleId}:*` : 'rate_limit:*'
    const keys = await this.redis.keys(pattern)
    
    const stats: any = {}
    
    for (const key of keys) {
      const count = await this.redis.zcard(key)
      const keyParts = key.split(':')
      const ruleIdFromKey = keyParts[1]
      const identifier = keyParts.slice(2).join(':')
      
      if (!stats[ruleIdFromKey]) {
        stats[ruleIdFromKey] = { total: 0, identifiers: {} }
      }
      
      stats[ruleIdFromKey].total += count
      stats[ruleIdFromKey].identifiers[identifier] = count
    }
    
    return stats
  }

  // 🚨 AUTOMATIC BLACKLISTING BASED ON VIOLATIONS
  async checkForAutoBlacklist(request: any): Promise<void> {
    const violationKey = `violations:${request.ip}`
    const violations = await this.redis.incr(violationKey)
    await this.redis.expire(violationKey, 3600) // 1 hour window
    
    // Auto-blacklist after 10 violations in 1 hour
    if (violations >= 10) {
      await this.addToBlacklist(request.ip, 3600) // 1 hour blacklist
      console.log(`🚨 Auto-blacklisted IP ${request.ip} due to ${violations} violations`)
    }
  }

  // 📝 LOGGING
  private logViolation(request: any, rule: RateLimitRule, currentCount: number): void {
    const violation = {
      timestamp: new Date().toISOString(),
      rule: rule.id,
      ruleName: rule.name,
      identifier: rule.keyGenerator(request),
      currentCount,
      maxAllowed: rule.maxRequests,
      window: rule.windowMs,
      ip: request.ip,
      userId: request.userId,
      userAgent: request.userAgent,
      endpoint: request.endpoint
    }
    
    console.log(`🚨 RATE LIMIT VIOLATION: ${JSON.stringify(violation)}`)
    
    // In production, send to monitoring system
    // this.sendToMonitoring(violation)
  }

  // 🔄 LOAD BLACKLIST/WHITELIST FROM REDIS
  private async loadBlacklistWhitelist(): Promise<void> {
    try {
      // Load permanent blacklist
      const permanentBlacklist = await this.redis.smembers('permanent_blacklist')
      permanentBlacklist.forEach(item => this.blacklist.add(item))
      
      // Load temporary blacklist
      const tempBlacklistKeys = await this.redis.keys('blacklist:*')
      for (const key of tempBlacklistKeys) {
        const identifier = key.replace('blacklist:', '')
        this.blacklist.add(identifier)
      }
      
      // Load whitelist
      const whitelistItems = await this.redis.smembers('whitelist')
      whitelistItems.forEach(item => this.whitelist.add(item))
      
      console.log(`✅ Loaded ${this.blacklist.size} blacklisted and ${this.whitelist.size} whitelisted items`)
    } catch (error) {
      console.error('Error loading blacklist/whitelist:', error)
    }
  }

  // 🧹 CLEANUP OLD RATE LIMIT DATA
  async cleanup(): Promise<void> {
    const keys = await this.redis.keys('rate_limit:*')
    let cleanedCount = 0
    
    for (const key of keys) {
      const ttl = await this.redis.ttl(key)
      if (ttl === -1) {
        // Key has no expiry, set one
        await this.redis.expire(key, 3600) // 1 hour default
        cleanedCount++
      }
    }
    
    console.log(`🧹 Cleaned up ${cleanedCount} rate limit keys`)
  }

  // 📊 HEALTH CHECK
  async healthCheck(): Promise<{ healthy: boolean; stats: any }> {
    try {
      await this.redis.ping()
      const stats = await this.getRateLimitStats()
      
      return {
        healthy: true,
        stats: {
          totalRules: this.rules.length,
          blacklistedItems: this.blacklist.size,
          whitelistedItems: this.whitelist.size,
          rateLimitStats: stats
        }
      }
    } catch (error) {
      return {
        healthy: false,
        stats: { error: error.message }
      }
    }
  }
}

// 🏭 EXPRESS MIDDLEWARE
export function createRateLimitMiddleware(rateLimiter: AdvancedRateLimiter, ruleIds?: string[]) {
  return async (req: any, res: any, next: any) => {
    try {
      const request = {
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id,
        userAgent: req.get('User-Agent'),
        endpoint: req.path
      }

      const results = await rateLimiter.checkRateLimit(request, ruleIds)
      const blockedResult = results.find(r => !r.allowed)

      if (blockedResult) {
        // Auto-blacklist check
        await rateLimiter.checkForAutoBlacklist(request)

        res.status(429).json({
          error: 'Rate limit exceeded',
          rule: blockedResult.rule,
          retryAfter: blockedResult.retryAfter,
          resetTime: blockedResult.resetTime
        })
        return
      }

      // Add rate limit headers
      const primaryResult = results[0]
      res.set({
        'X-RateLimit-Limit': primaryResult ? results[0].remaining + 1 : 'unknown',
        'X-RateLimit-Remaining': primaryResult ? primaryResult.remaining : 'unknown',
        'X-RateLimit-Reset': primaryResult ? new Date(primaryResult.resetTime).toISOString() : 'unknown'
      })

      next()
    } catch (error) {
      console.error('Rate limiting middleware error:', error)
      next() // Fail open
    }
  }
}

export { RateLimitRule, RateLimitResult, RateLimitConfig }
