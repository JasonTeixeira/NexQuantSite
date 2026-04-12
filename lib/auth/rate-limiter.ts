/**
 * 🛡️ RATE LIMITING SERVICE
 * Advanced rate limiting with IP-based and user-based protection
 */

import { redis } from '@/lib/database/redis-connection';
import { reportError } from '@/lib/monitoring';
import { NextRequest, NextResponse } from 'next/server';

// Rate limit types and configurations
export enum RateLimitType {
  LOGIN = 'login',
  TOKEN_REFRESH = 'token-refresh',
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password-reset',
  API_GENERAL = 'api-general'
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

// Default rate limit configurations
const RATE_LIMIT_CONFIGS: Record<RateLimitType, RateLimitConfig> = {
  [RateLimitType.LOGIN]: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000 // 15 minutes
  },
  [RateLimitType.TOKEN_REFRESH]: {
    maxAttempts: 10,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  [RateLimitType.REGISTRATION]: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 60 minutes
    blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
  },
  [RateLimitType.PASSWORD_RESET]: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 60 minutes
    blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
  },
  [RateLimitType.API_GENERAL]: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 10 * 60 * 1000 // 10 minutes
  }
};

// Redis key prefixes
const RATE_LIMIT_PREFIX = 'ratelimit:';
const BLOCKED_PREFIX = 'ratelimit:blocked:';

// Rate limit result interface
export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetTime: Date | null;
  blockedUntil: Date | null;
}

/**
 * Check if a request is rate limited
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = RateLimitType.API_GENERAL,
  customConfig?: Partial<RateLimitConfig>
): Promise<RateLimitResult> {
  try {
    // Get configuration for this rate limit type
    const config = {
      ...RATE_LIMIT_CONFIGS[type],
      ...customConfig
    };

    // Create Redis keys
    const rateLimitKey = `${RATE_LIMIT_PREFIX}${type}:${identifier}`;
    const blockedKey = `${BLOCKED_PREFIX}${type}:${identifier}`;

    // Check if identifier is currently blocked
    const blockedUntil = await redis.get(blockedKey);
    if (blockedUntil) {
      const blockedUntilDate = new Date(parseInt(blockedUntil));
      if (blockedUntilDate > new Date()) {
        return {
          limited: true,
          remaining: 0,
          resetTime: null,
          blockedUntil: blockedUntilDate
        };
      } else {
        // Block expired, remove it
        await redis.del(blockedKey);
      }
    }

    // Get current count
    const count = await redis.incr(rateLimitKey);

    // Set expiry on first hit
    if (count === 1) {
      await redis.pexpire(rateLimitKey, config.windowMs);
    }

    // Get TTL for reset time calculation
    const ttl = await redis.pttl(rateLimitKey);
    const resetTime = ttl > 0 ? new Date(Date.now() + ttl) : null;

    // Check if limit exceeded
    if (count > config.maxAttempts) {
      // Block the identifier
      const blockUntil = Date.now() + config.blockDurationMs;
      await redis.set(blockedKey, blockUntil.toString(), 'PX', config.blockDurationMs);

      return {
        limited: true,
        remaining: 0,
        resetTime: null,
        blockedUntil: new Date(blockUntil)
      };
    }

    // Return result
    return {
      limited: false,
      remaining: Math.max(0, config.maxAttempts - count),
      resetTime,
      blockedUntil: null
    };
  } catch (error) {
    reportError({
      component: 'RateLimiter',
      action: 'checkRateLimit',
      error,
      context: { identifier, type },
      severity: 'medium'
    });

    // In case of error, allow the request (fail open for critical paths)
    return {
      limited: false,
      remaining: 1,
      resetTime: null,
      blockedUntil: null
    };
  }
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(
  identifier: string,
  type: RateLimitType = RateLimitType.API_GENERAL
): Promise<boolean> {
  try {
    const rateLimitKey = `${RATE_LIMIT_PREFIX}${type}:${identifier}`;
    const blockedKey = `${BLOCKED_PREFIX}${type}:${identifier}`;

    await Promise.all([
      redis.del(rateLimitKey),
      redis.del(blockedKey)
    ]);

    return true;
  } catch (error) {
    reportError({
      component: 'RateLimiter',
      action: 'resetRateLimit',
      error,
      context: { identifier, type },
      severity: 'low'
    });

    return false;
  }
}

/**
 * Get identifiers from request for rate limiting
 */
export function getIdentifiersFromRequest(req: NextRequest): {
  ipIdentifier: string;
  userIdentifier: string | null;
} {
  // Extract IP address
  let ip = req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           'unknown';
  
  // If x-forwarded-for contains multiple IPs, take the first one
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  // Hash the IP to protect privacy
  const ipIdentifier = hashIdentifier(ip);
  
  // Extract user ID if authenticated
  let userIdentifier: string | null = null;
  
  // Parse JWT from auth header if available
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Simple JWT parsing without verification just to get user ID
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      if (payload.userId) {
        userIdentifier = `user:${payload.userId}`;
      }
    } catch (e) {
      // Ignore token parsing errors
    }
  }
  
  return { ipIdentifier, userIdentifier };
}

/**
 * Hash an identifier for privacy
 */
function hashIdentifier(identifier: string): string {
  // In a real implementation, you would use a proper hashing function
  // For simplicity, we'll just prefix it here
  return `ip:${identifier}`;
}

/**
 * Create a rate limit middleware for Next.js API routes
 */
export function createRateLimitMiddleware(type: RateLimitType, customConfig?: Partial<RateLimitConfig>) {
  return async function rateLimitMiddleware(
    req: NextRequest
  ): Promise<NextResponse | null> {
    // Skip rate limiting for non-production environments if desired
    if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_RATE_LIMIT !== 'true') {
      return null; // Continue to next middleware
    }
    
    // Get identifiers
    const { ipIdentifier, userIdentifier } = getIdentifiersFromRequest(req);
    
    // Use user identifier if available, otherwise use IP
    const identifier = userIdentifier || ipIdentifier;
    
    // Check rate limit
    const result = await checkRateLimit(identifier, type, customConfig);
    
    // If limited, return error response
    if (result.limited) {
      const headers = new Headers();
      
      if (result.resetTime) {
        headers.set('X-RateLimit-Reset', result.resetTime.getTime().toString());
      }
      
      if (result.blockedUntil) {
        headers.set('X-RateLimit-Blocked-Until', result.blockedUntil.getTime().toString());
      }
      
      headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIGS[type].maxAttempts.toString());
      headers.set('X-RateLimit-Remaining', '0');
      
      const message = result.blockedUntil
        ? `Too many requests. Please try again after ${result.blockedUntil.toUTCString()}`
        : 'Too many requests. Please try again later.';
      
      return NextResponse.json(
        { success: false, message },
        { status: 429, headers }
      );
    }
    
    // Not limited, continue to next middleware
    return null;
  };
}

export default {
  checkRateLimit,
  resetRateLimit,
  getIdentifiersFromRequest,
  createRateLimitMiddleware,
  RateLimitType
};
