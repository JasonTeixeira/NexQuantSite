/**
 * NEXURAL PLATFORM - RATE LIMITING MIDDLEWARE
 * Enterprise-grade rate limiting middleware for Next.js API routes
 * 
 * Usage:
 * import { withRateLimit } from '@/lib/security/rate-limit-middleware'
 * 
 * export default withRateLimit(handler, { 
 *   userTier: 'authenticated',
 *   endpoint: '/api/market-data'
 * })
 */

import { NextRequest, NextResponse } from 'next/server'
import { enterpriseRateLimiter } from './enterprise-rate-limiter'

interface RateLimitOptions {
  userTier?: 'anonymous' | 'authenticated' | 'premium' | 'admin'
  endpoint?: string
  skipRateLimit?: boolean
}

export interface RateLimitedRequest extends NextRequest {
  rateLimitResult?: {
    allowed: boolean
    limit: number
    remaining: number
    resetTime: number
    blocked: boolean
    reason?: string
  }
}

/**
 * Higher-order function to add rate limiting to API routes
 */
export function withRateLimit<T extends any[]>(
  handler: (request: RateLimitedRequest, ...args: T) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (request: RateLimitedRequest, ...args: T): Promise<NextResponse> => {
    // EMERGENCY OVERRIDE: COMPLETELY DISABLE ALL RATE LIMITING
    console.log('🔓 Rate Limit: EMERGENCY DISABLED - ALL REQUESTS ALLOWED')
    return handler(request, ...args)
    
    // Skip rate limiting if specified (for admin endpoints)
    if (options.skipRateLimit) {
      return handler(request, ...args)
    }

    // COMPLETELY DISABLE RATE LIMITING IN DEVELOPMENT
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Rate Limit: COMPLETELY DISABLED in development mode')
      return handler(request, ...args)
    }

    try {
      // Extract user information from request
      const userInfo = extractUserInfo(request)
      const ip = extractClientIP(request)
      
      // Determine user tier (default to anonymous)
      const userTier = options.userTier || userInfo.tier || 'anonymous'
      const endpoint = options.endpoint || request.nextUrl.pathname
      
      // Check rate limit
      const result = await enterpriseRateLimiter.checkRateLimit(
        userInfo.identifier,
        userTier,
        endpoint,
        ip
      )

      // Add rate limit result to request for handler use
      request.rateLimitResult = result

      // If blocked, return rate limit error
      if (!result.allowed || result.blocked) {
        const headers = enterpriseRateLimiter.getRateLimitHeaders(result)
        
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: result.reason || `Rate limit of ${result.limit} requests per minute exceeded`,
            retryAfter: headers['Retry-After'],
            limit: result.limit,
            remaining: result.remaining,
            resetTime: result.resetTime
          },
          { 
            status: 429,
            headers
          }
        )
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, ...args)
      const headers = enterpriseRateLimiter.getRateLimitHeaders(result)
      
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response

    } catch (error) {
      console.error('Rate limiting middleware error:', error)
      
      // Fail open - allow request to proceed
      return handler(request, ...args)
    }
  }
}

/**
 * Extract user information from request
 */
function extractUserInfo(request: NextRequest): { identifier: string, tier: string | null } {
  try {
    // Try to extract from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      // In production, decode JWT token to get user ID and tier
      // For now, use a simple approach
      const token = authHeader.replace('Bearer ', '')
      if (token && token !== 'undefined') {
        return {
          identifier: `user:${token.substring(0, 10)}`, // Use first 10 chars as identifier
          tier: 'authenticated' // Would be decoded from JWT
        }
      }
    }

    // Try to extract from cookies
    const sessionCookie = request.cookies.get('session')?.value
    if (sessionCookie) {
      return {
        identifier: `session:${sessionCookie.substring(0, 10)}`,
        tier: 'authenticated'
      }
    }

    // Try to extract user ID from query params (for development)
    const userId = request.nextUrl.searchParams.get('userId')
    if (userId) {
      return {
        identifier: `user:${userId}`,
        tier: 'authenticated'
      }
    }

    // Fall back to IP-based identification
    const ip = extractClientIP(request)
    return {
      identifier: `ip:${ip}`,
      tier: null // Will default to anonymous
    }

  } catch (error) {
    const ip = extractClientIP(request)
    return {
      identifier: `ip:${ip}`,
      tier: null
    }
  }
}

/**
 * Extract client IP address from request
 */
function extractClientIP(request: NextRequest): string {
  try {
    // Check various headers that might contain the real IP
    const forwardedFor = request.headers.get('X-Forwarded-For')
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return forwardedFor.split(',')[0].trim()
    }

    const realIP = request.headers.get('X-Real-IP')
    if (realIP) {
      return realIP.trim()
    }

    const clientIP = request.headers.get('CF-Connecting-IP') // Cloudflare
    if (clientIP) {
      return clientIP.trim()
    }

    // Fallback to connection IP (might be internal IP in production)
    const remoteAddr = request.headers.get('X-Forwarded-Host') || 
                      request.headers.get('Host') || 
                      'unknown'
    
    return remoteAddr

  } catch (error) {
    return '127.0.0.1' // Fallback for development
  }
}

/**
 * Utility function to create rate-limited API handler with specific options
 */
export const createRateLimitedHandler = (options: RateLimitOptions = {}) => {
  return <T extends any[]>(
    handler: (request: RateLimitedRequest, ...args: T) => Promise<NextResponse>
  ) => withRateLimit(handler, options)
}

/**
 * Pre-configured rate limiters for common scenarios
 */
export const rateLimiters = {
  // Standard API endpoints
  standard: createRateLimitedHandler({ userTier: 'anonymous' }),
  
  // Authenticated user endpoints  
  authenticated: createRateLimitedHandler({ userTier: 'authenticated' }),
  
  // Premium user endpoints
  premium: createRateLimitedHandler({ userTier: 'premium' }),
  
  // Market data endpoints (high frequency)
  marketData: createRateLimitedHandler({ 
    userTier: 'authenticated',
    endpoint: '/api/market-data'
  }),
  
  // Trading endpoints (moderate frequency)
  trading: createRateLimitedHandler({ 
    userTier: 'authenticated',
    endpoint: '/api/trades'
  }),
  
  // Portfolio endpoints
  portfolio: createRateLimitedHandler({ 
    userTier: 'authenticated',
    endpoint: '/api/portfolio'
  }),
  
  // Health check (high frequency allowed)
  health: createRateLimitedHandler({ 
    userTier: 'anonymous',
    endpoint: '/api/health'
  }),
  
  // Admin endpoints (no rate limiting)
  admin: createRateLimitedHandler({ 
    userTier: 'admin',
    skipRateLimit: true
  })
}
