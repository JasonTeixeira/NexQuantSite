/**
 * 🔒 RATE LIMITING MIDDLEWARE
 * Prevents brute force attacks by limiting request frequency
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis, getAndParse, setWithExpiry } from './database/redis-connection';

// Cache for rate limiting when Redis is unavailable
const inMemoryCache = new Map<string, { count: number, resetTime: number }>();

// Configuration for different routes
export const RATE_LIMIT_CONFIGS = {
  // Authentication routes have stricter limits
  'auth': {
    limit: 5, // 5 requests
    window: 60, // per minute
    blockDuration: 300 // block for 5 minutes after exceeding
  },
  // Admin authentication has even stricter limits
  'adminAuth': {
    limit: 3, // 3 requests
    window: 60, // per minute
    blockDuration: 600 // block for 10 minutes after exceeding
  },
  // API endpoints have more lenient limits
  'api': {
    limit: 60, // 60 requests
    window: 60, // per minute
    blockDuration: 300 // block for 5 minutes after exceeding
  },
  // Default limits for other routes
  'default': {
    limit: 100, // 100 requests
    window: 60, // per minute
    blockDuration: 300 // block for 5 minutes after exceeding
  }
};

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Rate limiting middleware function
 * @param req Next.js request
 * @param key Unique identifier for rate limiting (usually IP + route)
 * @param type Type of rate limit to apply
 * @returns Response if rate limit exceeded, null otherwise
 */
export async function rateLimiter(
  req: NextRequest,
  key: string,
  type: RateLimitType = 'default'
): Promise<NextResponse | null> {
  const config = RATE_LIMIT_CONFIGS[type];
  const now = Date.now();
  
  try {
    // Try Redis first
    let currentLimit: { count: number, resetTime: number } | null = null;
    
    try {
      currentLimit = await getAndParse<{ count: number, resetTime: number }>(`ratelimit:${key}`);
    } catch (error) {
      console.warn('Redis not available for rate limiting, using in-memory cache');
      currentLimit = inMemoryCache.get(key) || null;
    }
    
    // If no existing record or reset time has passed
    if (!currentLimit || now >= currentLimit.resetTime) {
      currentLimit = {
        count: 1,
        resetTime: now + (config.window * 1000)
      };
    } else {
      // Increment count
      currentLimit.count += 1;
    }
    
    // Store updated value
    try {
      await setWithExpiry(`ratelimit:${key}`, currentLimit, config.window);
    } catch (error) {
      // Fallback to in-memory if Redis fails
      inMemoryCache.set(key, currentLimit);
    }
    
    // Set headers with rate limit info
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.limit.toString());
    headers.set('X-RateLimit-Remaining', Math.max(0, config.limit - currentLimit.count).toString());
    headers.set('X-RateLimit-Reset', currentLimit.resetTime.toString());
    
    // Check if limit exceeded
    if (currentLimit.count > config.limit) {
      // Create block record
      const blockUntil = now + (config.blockDuration * 1000);
      try {
        await setWithExpiry(`ratelimit:blocked:${key}`, { until: blockUntil }, config.blockDuration);
      } catch (error) {
        // Fallback to in-memory if Redis fails
        inMemoryCache.set(`blocked:${key}`, { count: currentLimit.count, resetTime: blockUntil });
      }
      
      // Return error response
      headers.set('Retry-After', config.blockDuration.toString());
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${config.blockDuration} seconds.`
        }),
        {
          status: 429,
          headers
        }
      );
    }
    
    // Not rate limited, just add headers to original request
    Object.entries(headers).forEach(([key, value]) => {
      req.headers.set(key, value);
    });
    
    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Don't block requests if rate limiting fails
    return null;
  }
}

/**
 * Check if a key is currently blocked
 * @param key Key to check
 * @returns Whether the key is blocked and for how much longer
 */
export async function isBlocked(key: string): Promise<{ blocked: boolean, remainingSeconds: number }> {
  try {
    // Try Redis first
    let blockData: { until: number } | null = null;
    try {
      blockData = await getAndParse<{ until: number }>(`ratelimit:blocked:${key}`);
    } catch (error) {
      // Fallback to in-memory
      const memoryData = inMemoryCache.get(`blocked:${key}`);
      if (memoryData) {
        blockData = { until: memoryData.resetTime };
      }
    }
    
    if (!blockData) {
      return { blocked: false, remainingSeconds: 0 };
    }
    
    const now = Date.now();
    const remainingMs = Math.max(0, blockData.until - now);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    return {
      blocked: remainingMs > 0,
      remainingSeconds
    };
  } catch (error) {
    console.error('Block check error:', error);
    return { blocked: false, remainingSeconds: 0 };
  }
}

/**
 * Apply rate limiting to a specific route type
 * Creates a middleware function that can be used with Next.js middleware
 */
export function createRateLimiter(type: RateLimitType = 'default') {
  return async function(req: NextRequest): Promise<NextResponse | null> {
    // Get IP address
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               '127.0.0.1';
               
    // Create unique key for this route and IP
    const key = `${type}:${ip}:${req.nextUrl.pathname}`;
    
    // Check if already blocked
    const blockStatus = await isBlocked(key);
    if (blockStatus.blocked) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${blockStatus.remainingSeconds} seconds.`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': blockStatus.remainingSeconds.toString()
          }
        }
      );
    }
    
    // Apply rate limiting
    return rateLimiter(req, key, type);
  }
}

// Export a default instance for auth routes
export const authRateLimiter = createRateLimiter('auth');
export const adminAuthRateLimiter = createRateLimiter('adminAuth');
export const apiRateLimiter = createRateLimiter('api');
