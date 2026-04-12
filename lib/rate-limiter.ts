interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: Request) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => this.getClientIP(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    }

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000)
  }

  async checkLimit(request: Request): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator(request)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    let entry = this.store.get(key)

    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      }
    }

    // Clean old requests outside the window
    if (entry.firstRequest < windowStart) {
      entry.count = 0
      entry.firstRequest = now
    }

    const allowed = entry.count < this.config.maxRequests

    if (allowed) {
      entry.count++
      this.store.set(key, entry)
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    }
  }

  private getClientIP(request: Request): string {
    // Try various headers for the real IP
    const forwarded = request.headers.get("x-forwarded-for")
    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }

    const realIP = request.headers.get("x-real-ip")
    if (realIP) return realIP

    const cfConnectingIP = request.headers.get("cf-connecting-ip")
    if (cfConnectingIP) return cfConnectingIP

    // Fallback to a default
    return "unknown"
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
})

export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute for sensitive endpoints
})
