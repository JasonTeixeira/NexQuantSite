/**
 * 🧪 JWT SERVICE TESTS
 * Unit tests for JWT token generation, validation, and rotation
 */

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import jwtService, { 
  TokenType, 
  TokenPayload, 
  generateToken, 
  validateToken, 
  rotateTokens,
  invalidateToken,
  invalidateAllUserTokens
} from '@/lib/auth/jwt-service';

// Mock Redis implementation
jest.mock('@/lib/database/redis-connection', () => {
  const mockedCache: Record<string, any> = {};
  
  return {
    redis: {
      set: jest.fn((key: string, value: string, expiryFlag?: string, expiryValue?: number) => {
        mockedCache[key] = value;
        return Promise.resolve('OK');
      }),
      get: jest.fn((key: string) => {
        return Promise.resolve(mockedCache[key] || null);
      }),
      exists: jest.fn((key: string) => {
        return Promise.resolve(mockedCache[key] ? 1 : 0);
      }),
      del: jest.fn((key: string) => {
        delete mockedCache[key];
        return Promise.resolve(1);
      }),
      keys: jest.fn((pattern: string) => {
        // Basic glob pattern matching for testing
        const regex = new RegExp(pattern.replace('*', '.*'));
        return Promise.resolve(Object.keys(mockedCache).filter(key => regex.test(key)));
      }),
      pexpire: jest.fn((key: string, ttl: number) => {
        if (mockedCache[key]) {
          return Promise.resolve(1);
        }
        return Promise.resolve(0);
      }),
      pttl: jest.fn((key: string) => {
        if (mockedCache[key]) {
          return Promise.resolve(60 * 60 * 1000); // 1 hour for testing
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
      return Promise.resolve('OK');
    }),
    deleteKey: jest.fn((key: string) => {
      delete mockedCache[key];
      return Promise.resolve(1);
    })
  };
});

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn()
}));

describe('JWT Service', () => {
  const testPayload: TokenPayload = {
    userId: uuidv4(),
    sessionId: uuidv4(),
    email: 'test@example.com',
    role: 'user'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('generateToken', () => {
    it('should generate a valid access token', async () => {
      const result = await generateToken(testPayload, TokenType.ACCESS);
      
      expect(result).toBeDefined();
      expect(result.token).toBeTruthy();
      expect(result.jti).toBeTruthy();
      expect(result.expiresAt).toBeInstanceOf(Date);
      
      // Verify token can be decoded
      const decoded = jwt.decode(result.token);
      expect(decoded).toMatchObject({
        userId: testPayload.userId,
        sessionId: testPayload.sessionId,
        email: testPayload.email,
        role: testPayload.role,
        isRefresh: false,
        jti: result.jti
      });
    });
    
    it('should generate a valid refresh token', async () => {
      const result = await generateToken(testPayload, TokenType.REFRESH);
      
      expect(result).toBeDefined();
      expect(result.token).toBeTruthy();
      expect(result.jti).toBeTruthy();
      expect(result.expiresAt).toBeInstanceOf(Date);
      
      // Verify token can be decoded
      const decoded = jwt.decode(result.token);
      expect(decoded).toMatchObject({
        userId: testPayload.userId,
        sessionId: testPayload.sessionId,
        email: testPayload.email,
        role: testPayload.role,
        isRefresh: true,
        jti: result.jti
      });
    });
    
    it('should store token in Redis', async () => {
      const { redis } = require('@/lib/database/redis-connection');
      const { setWithExpiry } = require('@/lib/database/redis-connection');
      
      await generateToken(testPayload, TokenType.ACCESS);
      
      expect(setWithExpiry).toHaveBeenCalled();
    });
  });
  
  describe('validateToken', () => {
    it('should validate a valid access token', async () => {
      const { token } = await generateToken(testPayload, TokenType.ACCESS);
      const result = await validateToken(token, TokenType.ACCESS);
      
      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testPayload.userId);
      expect(result.payload?.sessionId).toBe(testPayload.sessionId);
      expect(result.error).toBeUndefined();
    });
    
    it('should validate a valid refresh token', async () => {
      const { token } = await generateToken(testPayload, TokenType.REFRESH);
      const result = await validateToken(token, TokenType.REFRESH);
      
      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testPayload.userId);
      expect(result.payload?.sessionId).toBe(testPayload.sessionId);
      expect(result.error).toBeUndefined();
    });
    
    it('should reject a token with wrong type', async () => {
      const { token } = await generateToken(testPayload, TokenType.ACCESS);
      const result = await validateToken(token, TokenType.REFRESH);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token type');
      expect(result.payload).toBeUndefined();
    });
    
    it('should reject an invalid token', async () => {
      const result = await validateToken('invalid.token.string', TokenType.ACCESS);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.payload).toBeUndefined();
    });
    
    it('should reject a blacklisted token', async () => {
      const { redis } = require('@/lib/database/redis-connection');
      const { token, jti } = await generateToken(testPayload, TokenType.ACCESS);
      
      // Blacklist the token
      await invalidateToken(token);
      
      const result = await validateToken(token, TokenType.ACCESS);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token has been invalidated');
      expect(result.payload).toBeUndefined();
    });
  });
  
  describe('rotateTokens', () => {
    it('should invalidate old refresh token and generate new token pair', async () => {
      const { token } = await generateToken(testPayload, TokenType.REFRESH);
      
      const tokenPair = await rotateTokens(token, testPayload);
      
      expect(tokenPair).toBeDefined();
      expect(tokenPair?.accessToken).toBeDefined();
      expect(tokenPair?.refreshToken).toBeDefined();
      
      // Old token should be invalidated
      const oldTokenResult = await validateToken(token, TokenType.REFRESH);
      expect(oldTokenResult.valid).toBe(false);
      
      // New tokens should be valid
      const accessTokenResult = await validateToken(tokenPair!.accessToken.token, TokenType.ACCESS);
      expect(accessTokenResult.valid).toBe(true);
      
      const refreshTokenResult = await validateToken(tokenPair!.refreshToken.token, TokenType.REFRESH);
      expect(refreshTokenResult.valid).toBe(true);
    });
    
    it('should return null for invalid refresh token', async () => {
      const result = await rotateTokens('invalid.token.string', testPayload);
      
      expect(result).toBeNull();
    });
  });
  
  describe('invalidateToken', () => {
    it('should invalidate an access token', async () => {
      const { token } = await generateToken(testPayload, TokenType.ACCESS);
      
      const result = await invalidateToken(token);
      
      expect(result).toBe(true);
      
      // Token should be invalid now
      const validationResult = await validateToken(token, TokenType.ACCESS);
      expect(validationResult.valid).toBe(false);
    });
    
    it('should invalidate a refresh token', async () => {
      const { token } = await generateToken(testPayload, TokenType.REFRESH);
      
      const result = await invalidateToken(token, TokenType.REFRESH);
      
      expect(result).toBe(true);
      
      // Token should be invalid now
      const validationResult = await validateToken(token, TokenType.REFRESH);
      expect(validationResult.valid).toBe(false);
    });
    
    it('should handle invalid token format', async () => {
      const result = await invalidateToken('not.a.jwt');
      
      expect(result).toBe(false);
    });
  });
  
  describe('invalidateAllUserTokens', () => {
    it('should invalidate all tokens for a user', async () => {
      // Generate multiple tokens for the same user
      const userId = uuidv4();
      const sessionId1 = uuidv4();
      const sessionId2 = uuidv4();
      
      const payload1: TokenPayload = {
        userId,
        sessionId: sessionId1,
        role: 'user'
      };
      
      const payload2: TokenPayload = {
        userId,
        sessionId: sessionId2,
        role: 'user'
      };
      
      const { token: accessToken1 } = await generateToken(payload1, TokenType.ACCESS);
      const { token: refreshToken1 } = await generateToken(payload1, TokenType.REFRESH);
      const { token: accessToken2 } = await generateToken(payload2, TokenType.ACCESS);
      
      // Invalidate all tokens for the user
      const result = await invalidateAllUserTokens(userId);
      
      expect(result).toBe(true);
      
      // All tokens should be invalid now
      const validationResult1 = await validateToken(accessToken1, TokenType.ACCESS);
      const validationResult2 = await validateToken(refreshToken1, TokenType.REFRESH);
      const validationResult3 = await validateToken(accessToken2, TokenType.ACCESS);
      
      expect(validationResult1.valid).toBe(false);
      expect(validationResult2.valid).toBe(false);
      expect(validationResult3.valid).toBe(false);
    });
    
    it('should not affect tokens for other users', async () => {
      // Generate tokens for two different users
      const userId1 = uuidv4();
      const userId2 = uuidv4();
      
      const payload1: TokenPayload = {
        userId: userId1,
        sessionId: uuidv4(),
        role: 'user'
      };
      
      const payload2: TokenPayload = {
        userId: userId2,
        sessionId: uuidv4(),
        role: 'user'
      };
      
      const { token: token1 } = await generateToken(payload1, TokenType.ACCESS);
      const { token: token2 } = await generateToken(payload2, TokenType.ACCESS);
      
      // Invalidate tokens for user1
      await invalidateAllUserTokens(userId1);
      
      // User1's token should be invalid
      const validationResult1 = await validateToken(token1, TokenType.ACCESS);
      expect(validationResult1.valid).toBe(false);
      
      // User2's token should still be valid
      const validationResult2 = await validateToken(token2, TokenType.ACCESS);
      expect(validationResult2.valid).toBe(true);
    });
  });
});
