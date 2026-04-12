/**
 * 🧪 RATE LIMITER TESTS
 * Unit tests for rate limiting functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  resetRateLimit,
  getIdentifiersFromRequest,
  createRateLimitMiddleware,
  RateLimitType
} from '@/lib/auth/rate-limiter';

// Mock Redis implementation
jest.mock('@/lib/database/redis-connection', () => {
  const mockedCache: Record<string, string> = {};
  const mockedTtls: Record<string, number> = {};
  
  return {
    redis: {
      incr: jest.fn((key: string) => {
        const currentValue = parseInt(mockedCache[key] || '0');
        const newValue = currentValue + 1;
        mockedCache[key] = newValue.toString();
        return Promise.resolve(newValue);
      }),
      get: jest.fn((key: string) => {
        return Promise.resolve(mockedCache[key] || null);
      }),
      set: jest.fn((key: string, value: string, expiryFlag?: string, expiryValue?: number) => {
        mockedCache[key] = value;
        if (expiryFlag === 'PX' && expiryValue) {
          mockedTtls[key] = Date.now() + expiryValue;
        }
        return Promise.resolve('OK');
      }),
      del: jest.fn((key: string) => {
        delete mockedCache[key];
        delete mockedTtls[key];
        return Promise.resolve(1);
      }),
      pexpire: jest.fn((key: string, ttl: number) => {
        if (mockedCache[key]) {
          mockedTtls[key] = Date.now() + ttl;
          return Promise.resolve(1);
        }
        return Promise.resolve(0);
      }),
      pttl: jest.fn((key: string) => {
        const ttl = mockedTtls[key];
        if (ttl) {
          const remaining = ttl - Date.now();
          return Promise.resolve(remaining > 0 ? remaining : -2);
        }
        return Promise.resolve(-2); // Key does not exist
      })
    }
  };
});

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn()
}));

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  class MockHeaders {
    private headers: Record<string, string> = {};
    
    get(name: string): string | null {
      return this.headers[name.toLowerCase()] || null;
    }
    
    set(name: string, value: string): void {
      this.headers[name.toLowerCase()] = value;
    }
  }
  
  class MockRequest {
    headers: MockHeaders;
    
    constructor(headers: Record<string, string> = {}) {
      this.headers = new MockHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        this.headers.set(key, value);
      });
    }
  }
  
  return {
    NextRequest: MockRequest,
    NextResponse: {
      json: jest.fn((body: any, options: any) => {
        return {
          body,
          status: options?.status || 200,
          headers: options?.headers || {}
        };
      })
    }
  };
});

describe('Rate Limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocked Redis cache
    const { redis } = require('@/lib/database/redis-connection');
    jest.spyOn(redis, 'del').mockImplementation((key: string) => {
      const mockedCache = jest.requireMock('@/lib/database/redis-connection').mockedCache;
      const mockedTtls = jest.requireMock('@/lib/database/redis-connection').mockedTtls;
      delete mockedCache[key];
      delete mockedTtls[key];
      return Promise.resolve(1);
    });
  });
  
  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', async () => {
      const identifier = 'test-user';
      const type = RateLimitType.API_GENERAL;
      
      // First request
      const result1 = await checkRateLimit(identifier, type);
      
      expect(result1.limited).toBe(false);
      expect(result1.remaining).toBe(99); // 100 max attempts - 1
      expect(result1.resetTime).toBeInstanceOf(Date);
      expect(result1.blockedUntil).toBeNull();
      
      // Second request
      const result2 = await checkRateLimit(identifier, type);
      
      expect(result2.limited).toBe(false);
      expect(result2.remaining).toBe(98); // 100 max attempts - 2
      expect(result2.resetTime).toBeInstanceOf(Date);
      expect(result2.blockedUntil).toBeNull();
    });
    
    it('should block requests that exceed rate limit', async () => {
      const identifier = 'test-user-exceed';
      const type = RateLimitType.LOGIN;
      const customConfig = {
        maxAttempts: 3,
        windowMs: 60000, // 1 minute
        blockDurationMs: 300000 // 5 minutes
      };
      
      // Make 3 requests (at the limit)
      await checkRateLimit(identifier, type, customConfig);
      await checkRateLimit(identifier, type, customConfig);
      const result3 = await checkRateLimit(identifier, type, customConfig);
      
      expect(result3.limited).toBe(false);
      expect(result3.remaining).toBe(0); // max attempts reached
      
      // Make 4th request (exceeds limit)
      const result4 = await checkRateLimit(identifier, type, customConfig);
      
      expect(result4.limited).toBe(true);
      expect(result4.remaining).toBe(0);
      expect(result4.resetTime).toBeNull();
      expect(result4.blockedUntil).toBeInstanceOf(Date);
      
      // Future timestamp should be about 5 minutes in the future
      const fiveMinutesFromNow = Date.now() + 300000 - 5000; // 5 minutes - 5 seconds buffer
      expect(result4.blockedUntil!.getTime()).toBeGreaterThan(fiveMinutesFromNow);
    });
    
    it('should keep returning blocked status during block period', async () => {
      const identifier = 'test-user-blocked';
      const type = RateLimitType.LOGIN;
      const customConfig = {
        maxAttempts: 2,
        windowMs: 60000, // 1 minute
        blockDurationMs: 300000 // 5 minutes
      };
      
      // Exceed rate limit
      await checkRateLimit(identifier, type, customConfig);
      await checkRateLimit(identifier, type, customConfig);
      await checkRateLimit(identifier, type, customConfig); // This will trigger blocking
      
      // Check during block period
      const result = await checkRateLimit(identifier, type, customConfig);
      
      expect(result.limited).toBe(true);
      expect(result.blockedUntil).toBeInstanceOf(Date);
    });
    
    it('should use custom config when provided', async () => {
      const identifier = 'test-user-custom';
      const type = RateLimitType.API_GENERAL;
      const customConfig = {
        maxAttempts: 5,
        windowMs: 30000 // 30 seconds
      };
      
      // First request
      const result = await checkRateLimit(identifier, type, customConfig);
      
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(4); // 5 max attempts - 1
    });
    
    it('should handle errors gracefully', async () => {
      const { redis } = require('@/lib/database/redis-connection');
      const { reportError } = require('@/lib/monitoring');
      
      // Simulate Redis error
      jest.spyOn(redis, 'incr').mockRejectedValueOnce(new Error('Redis connection error'));
      
      const result = await checkRateLimit('test-user-error', RateLimitType.API_GENERAL);
      
      // Should fail open (allow request)
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(1);
      
      // Should report error
      expect(reportError).toHaveBeenCalled();
    });
  });
  
  describe('resetRateLimit', () => {
    it('should reset rate limit for an identifier', async () => {
      const identifier = 'test-user-reset';
      const type = RateLimitType.API_GENERAL;
      
      // Create rate limit
      await checkRateLimit(identifier, type);
      await checkRateLimit(identifier, type);
      
      // Reset rate limit
      const resetResult = await resetRateLimit(identifier, type);
      
      expect(resetResult).toBe(true);
      
      // Check rate limit is reset
      const result = await checkRateLimit(identifier, type);
      expect(result.remaining).toBe(99); // Back to max - 1
    });
    
    it('should handle errors gracefully', async () => {
      const { redis } = require('@/lib/database/redis-connection');
      const { reportError } = require('@/lib/monitoring');
      
      // Simulate Redis error
      jest.spyOn(redis, 'del').mockRejectedValueOnce(new Error('Redis deletion error'));
      
      const result = await resetRateLimit('test-user-error', RateLimitType.API_GENERAL);
      
      expect(result).toBe(false);
      expect(reportError).toHaveBeenCalled();
    });
  });
  
  describe('getIdentifiersFromRequest', () => {
    it('should extract IP identifier from request', () => {
      const req = new NextRequest({
        'x-forwarded-for': '192.168.1.1'
      });
      
      const { ipIdentifier, userIdentifier } = getIdentifiersFromRequest(req);
      
      expect(ipIdentifier).toBe('ip:192.168.1.1');
      expect(userIdentifier).toBeNull();
    });
    
    it('should extract first IP from comma-separated list', () => {
      const req = new NextRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1'
      });
      
      const { ipIdentifier } = getIdentifiersFromRequest(req);
      
      expect(ipIdentifier).toBe('ip:192.168.1.1');
    });
    
    it('should fallback to x-real-ip if x-forwarded-for is not available', () => {
      const req = new NextRequest({
        'x-real-ip': '10.0.0.1'
      });
      
      const { ipIdentifier } = getIdentifiersFromRequest(req);
      
      expect(ipIdentifier).toBe('ip:10.0.0.1');
    });
    
    it('should extract user identifier from authorization header', () => {
      // Create a JWT-like token with a userId in the payload
      const payload = { userId: '123456' };
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${base64Payload}.signature`;
      
      const req = new NextRequest({
        'authorization': `Bearer ${token}`
      });
      
      const { userIdentifier } = getIdentifiersFromRequest(req);
      
      expect(userIdentifier).toBe('user:123456');
    });
    
    it('should handle invalid JWT gracefully', () => {
      const req = new NextRequest({
        'authorization': 'Bearer invalid.token'
      });
      
      const { userIdentifier } = getIdentifiersFromRequest(req);
      
      expect(userIdentifier).toBeNull();
    });
  });
  
  describe('createRateLimitMiddleware', () => {
    let originalNodeEnv: string | undefined;
    
    beforeAll(() => {
      originalNodeEnv = process.env.NODE_ENV;
    });
    
    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });
    
    it('should allow requests within rate limit', async () => {
      process.env.NODE_ENV = 'production';
      
      const middleware = createRateLimitMiddleware(RateLimitType.API_GENERAL);
      const req = new NextRequest({
        'x-forwarded-for': '192.168.1.1'
      });
      
      const response = await middleware(req);
      
      expect(response).toBeNull(); // Null means proceed to next middleware
    });
    
    it('should block requests that exceed rate limit', async () => {
      process.env.NODE_ENV = 'production';
      
      const middleware = createRateLimitMiddleware(RateLimitType.LOGIN, {
        maxAttempts: 1,
        windowMs: 60000,
        blockDurationMs: 300000
      });
      
      const req = new NextRequest({
        'x-forwarded-for': '192.168.1.2'
      });
      
      // First request should be allowed
      await middleware(req);
      
      // Second request should be blocked
      const response = await middleware(req);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(429);
      expect(response?.body.success).toBe(false);
      expect(response?.body.message).toContain('Too many requests');
    });
    
    it('should skip rate limiting in non-production environments', async () => {
      process.env.NODE_ENV = 'development';
      process.env.ENABLE_RATE_LIMIT = 'false';
      
      const middleware = createRateLimitMiddleware(RateLimitType.LOGIN, {
        maxAttempts: 1
      });
      
      const req = new NextRequest({
        'x-forwarded-for': '192.168.1.3'
      });
      
      // First request should be allowed
      await middleware(req);
      
      // Second request should also be allowed since rate limiting is disabled
      const response = await middleware(req);
      
      expect(response).toBeNull(); // Null means proceed to next middleware
    });
    
    it('should set appropriate headers in rate limit response', async () => {
      process.env.NODE_ENV = 'production';
      
      const middleware = createRateLimitMiddleware(RateLimitType.LOGIN, {
        maxAttempts: 1,
        windowMs: 60000,
        blockDurationMs: 300000
      });
      
      const req = new NextRequest({
        'x-forwarded-for': '192.168.1.4'
      });
      
      // First request should be allowed
      await middleware(req);
      
      // Second request should be blocked
      const response = await middleware(req);
      
      // Check for rate limit headers
      expect(response?.headers.get('X-RateLimit-Limit')).toBe('1');
      expect(response?.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response?.headers.get('X-RateLimit-Blocked-Until')).toBeTruthy();
    });
  });
});
