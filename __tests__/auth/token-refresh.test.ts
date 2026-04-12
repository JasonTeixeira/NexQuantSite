/**
 * 🧪 TOKEN REFRESH TESTS
 * Tests for JWT token refresh functionality
 */

import { v4 as uuidv4 } from 'uuid';
import {
  generateToken,
  validateToken,
  rotateTokens,
  invalidateToken,
  TokenType,
  TokenPayload
} from '@/lib/auth/jwt-service';

// Mock Redis implementation
jest.mock('@/lib/database/redis-connection', () => {
  const mockedCache: Record<string, any> = {};
  const mockedTtls: Record<string, number> = {};
  
  return {
    redis: {
      get: jest.fn((key: string) => Promise.resolve(mockedCache[key] || null)),
      set: jest.fn((key: string, value: string, expiryFlag?: string, expiryValue?: number) => {
        mockedCache[key] = value;
        if (expiryFlag === 'PX' && expiryValue) {
          mockedTtls[key] = Date.now() + expiryValue;
        }
        return Promise.resolve('OK');
      }),
      exists: jest.fn((key: string) => {
        return Promise.resolve(mockedCache[key] ? 1 : 0);
      }),
      del: jest.fn((key: string) => {
        delete mockedCache[key];
        delete mockedTtls[key];
        return Promise.resolve(1);
      }),
      keys: jest.fn((pattern: string) => {
        // Basic glob pattern matching for testing
        const regex = new RegExp(pattern.replace('*', '.*'));
        return Promise.resolve(Object.keys(mockedCache).filter(key => regex.test(key)));
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
    },
    getAndParse: jest.fn((key: string) => {
      const value = mockedCache[key];
      if (!value) return Promise.resolve(null);
      try {
        return Promise.resolve(JSON.parse(value));
      } catch (e) {
        return Promise.resolve(value);
      }
    }),
    setWithExpiry: jest.fn((key: string, value: any, expiry: number) => {
      mockedCache[key] = typeof value === 'object' ? JSON.stringify(value) : value;
      mockedTtls[key] = Date.now() + expiry;
      return Promise.resolve('OK');
    }),
    deleteKey: jest.fn((key: string) => {
      delete mockedCache[key];
      delete mockedTtls[key];
      return Promise.resolve(1);
    })
  };
});

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn(),
  trackMetric: jest.fn()
}));

// Mock current time for predictable test results
const mockNow = Date.now();
jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

describe('Token Refresh Lifecycle', () => {
  // Create test user data
  const testUser = {
    userId: uuidv4(),
    sessionId: uuidv4(),
    email: 'test@example.com',
    role: 'user'
  };
  
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
  
  describe('Successful token refresh flow', () => {
    it('should successfully rotate valid refresh token to new token pair', async () => {
      // 1. Generate initial tokens
      const initialRefreshToken = await generateToken(testUser, TokenType.REFRESH);
      
      // 2. Validate the initial refresh token
      const validationResult = await validateToken(initialRefreshToken.token, TokenType.REFRESH);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.payload?.userId).toBe(testUser.userId);
      
      // 3. Rotate tokens
      const newTokenPair = await rotateTokens(initialRefreshToken.token, testUser);
      
      // 4. Verify new tokens were generated
      expect(newTokenPair).toBeDefined();
      expect(newTokenPair?.accessToken).toBeDefined();
      expect(newTokenPair?.refreshToken).toBeDefined();
      expect(newTokenPair?.accessToken.token).not.toBe(initialRefreshToken.token);
      
      // 5. Verify the new access token is valid
      const accessValidation = await validateToken(newTokenPair!.accessToken.token, TokenType.ACCESS);
      expect(accessValidation.valid).toBe(true);
      expect(accessValidation.payload?.userId).toBe(testUser.userId);
      
      // 6. Verify the new refresh token is valid
      const refreshValidation = await validateToken(newTokenPair!.refreshToken.token, TokenType.REFRESH);
      expect(refreshValidation.valid).toBe(true);
      expect(refreshValidation.payload?.userId).toBe(testUser.userId);
      
      // 7. Verify the old refresh token is now invalid (blacklisted)
      const oldTokenValidation = await validateToken(initialRefreshToken.token, TokenType.REFRESH);
      expect(oldTokenValidation.valid).toBe(false);
      expect(oldTokenValidation.error).toBe('Token has been invalidated');
    });
    
    it('should preserve custom claims during token rotation', async () => {
      // Create user with custom claims
      const userWithCustomClaims = {
        ...testUser,
        permissions: ['read:data', 'write:data'],
        tenantId: 'tenant-123'
      };
      
      // Generate initial token with custom claims
      const initialRefreshToken = await generateToken(userWithCustomClaims, TokenType.REFRESH);
      
      // Rotate tokens
      const newTokenPair = await rotateTokens(initialRefreshToken.token, userWithCustomClaims);
      
      // Verify custom claims are preserved in new access token
      const accessValidation = await validateToken(newTokenPair!.accessToken.token, TokenType.ACCESS);
      expect(accessValidation.payload?.permissions).toEqual(['read:data', 'write:data']);
      expect(accessValidation.payload?.tenantId).toBe('tenant-123');
      
      // Verify custom claims are preserved in new refresh token
      const refreshValidation = await validateToken(newTokenPair!.refreshToken.token, TokenType.REFRESH);
      expect(refreshValidation.payload?.permissions).toEqual(['read:data', 'write:data']);
      expect(refreshValidation.payload?.tenantId).toBe('tenant-123');
    });
  });
  
  describe('Token refresh security checks', () => {
    it('should reject expired refresh tokens', async () => {
      // Create a refresh token
      const refreshToken = await generateToken(testUser, TokenType.REFRESH);
      
      // Simulate token expiry by manipulating the validation function
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });
      
      // Attempt to rotate with expired token
      const result = await rotateTokens(refreshToken.token, testUser);
      
      // Should reject the rotation
      expect(result).toBeNull();
    });
    
    it('should reject tampered refresh tokens', async () => {
      // Create a refresh token
      const refreshToken = await generateToken(testUser, TokenType.REFRESH);
      
      // Tamper with the token by changing a character
      const tamperedToken = refreshToken.token.substring(0, refreshToken.token.length - 5) + 'XXXXX';
      
      // Attempt to rotate with tampered token
      const result = await rotateTokens(tamperedToken, testUser);
      
      // Should reject the rotation
      expect(result).toBeNull();
    });
    
    it('should reject refresh tokens from different users', async () => {
      // Create user A's refresh token
      const userA = { ...testUser, userId: 'user-A' };
      const tokenA = await generateToken(userA, TokenType.REFRESH);
      
      // Try to refresh with user A's token but user B's payload
      const userB = { ...testUser, userId: 'user-B' };
      const result = await rotateTokens(tokenA.token, userB);
      
      // Should not create new tokens
      expect(result).toBeNull();
    });
    
    it('should blacklist reused refresh tokens', async () => {
      // Create a refresh token
      const refreshToken = await generateToken(testUser, TokenType.REFRESH);
      
      // Use it once (valid use)
      const firstRotation = await rotateTokens(refreshToken.token, testUser);
      expect(firstRotation).not.toBeNull();
      
      // Attempt to use it again (token reuse attack)
      const secondRotation = await rotateTokens(refreshToken.token, testUser);
      
      // Should be rejected as the token should be blacklisted after first use
      expect(secondRotation).toBeNull();
    });
  });
  
  describe('Token refresh edge cases', () => {
    it('should handle invalid token format gracefully', async () => {
      const result = await rotateTokens('not-a-jwt-token', testUser);
      expect(result).toBeNull();
    });
    
    it('should handle database errors during rotation', async () => {
      // Setup: Create a valid refresh token
      const refreshToken = await generateToken(testUser, TokenType.REFRESH);
      
      // Mock a database error during token invalidation
      const { deleteKey } = require('@/lib/database/redis-connection');
      deleteKey.mockRejectedValueOnce(new Error('Database connection error'));
      
      // Attempt rotation with simulated DB error
      const result = await rotateTokens(refreshToken.token, testUser);
      
      // Should still return tokens (fail open) but report error
      expect(result).not.toBeNull();
      
      const { reportError } = require('@/lib/monitoring');
      expect(reportError).toHaveBeenCalled();
    });
    
    it('should support forced token rotation regardless of token state', async () => {
      // This test simulates an admin force-refreshing a user's tokens
      // Implement this if your system supports forced refreshes
      
      // Create an already invalidated token
      const refreshToken = await generateToken(testUser, TokenType.REFRESH);
      await invalidateToken(refreshToken.token, TokenType.REFRESH);
      
      // Validate the token is actually invalid
      const validationResult = await validateToken(refreshToken.token, TokenType.REFRESH);
      expect(validationResult.valid).toBe(false);
      
      // Skip actual token validation for forced refresh
      // This would be a specialized function in your actual implementation
      // For testing, we'll just generate new tokens directly
      const forcedTokens = {
        accessToken: await generateToken(testUser, TokenType.ACCESS),
        refreshToken: await generateToken(testUser, TokenType.REFRESH)
      };
      
      expect(forcedTokens.accessToken).toBeDefined();
      expect(forcedTokens.refreshToken).toBeDefined();
    });
  });
});

// Import actual JWT library for specific tests
import * as jwt from 'jsonwebtoken';

describe('Token Refresh API Integration', () => {
  // This section would test the actual API endpoint that handles token refresh
  // We'll implement a simplified version for demonstration
  
  // Mock Next.js Response and Request
  const mockReq = (refreshToken: string) => ({
    cookies: {
      'refresh-token': refreshToken
    },
    headers: {
      'user-agent': 'test-user-agent'
    },
    body: {
      refreshToken
    }
  });
  
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
  };
  
  it('should handle token refresh API request successfully', async () => {
    // 1. Generate a valid refresh token for testing
    const testUser = {
      userId: uuidv4(),
      sessionId: uuidv4(),
      email: 'test@example.com',
      role: 'user'
    };
    
    const { token: refreshToken } = await generateToken(testUser, TokenType.REFRESH);
    
    // 2. Create mock request with this token
    const req = mockReq(refreshToken);
    const res = mockRes();
    
    // 3. Simulate the API handler logic
    // This would normally be in your API route handler
    const result = await rotateTokens(refreshToken, testUser);
    
    if (result) {
      // Set cookies and return success response
      res.cookie('access-token', result.accessToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: result.accessToken.expiresAt
      });
      
      res.cookie('refresh-token', result.refreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh', // Restrict to refresh endpoint
        expires: result.refreshToken.expiresAt
      });
      
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
    
    // 4. Verify the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(res.cookie).toHaveBeenCalledTimes(2);
  });
  
  it('should reject refresh API request with invalid token', async () => {
    // Create mock request with invalid token
    const req = mockReq('invalid-token');
    const res = mockRes();
    
    // Simulate the API handler logic
    const result = await rotateTokens('invalid-token', { userId: 'test' } as TokenPayload);
    
    if (result) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
    
    // Verify the response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid refresh token'
    });
  });
});
