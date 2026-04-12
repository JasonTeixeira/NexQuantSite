/**
 * 🧪 LOGIN TESTS
 * Tests for user login functionality and security
 */

import { authenticateUser, validateLoginCredentials, createSession } from '@/lib/auth/login-service';
import { verifyPassword } from '@/lib/auth/password-utils';
import { generateToken, TokenType } from '@/lib/auth/jwt-service';
import { checkRateLimit, RateLimitType } from '@/lib/auth/rate-limiter';
import { v4 as uuidv4 } from 'uuid';

// Mock database
jest.mock('@/lib/database/database', () => {
  // Mock user data
  const mockUsers = [
    {
      id: 'user-123',
      email: 'user@example.com',
      password_hash: '$2b$10$fakehashedpasswordforuser123',
      name: 'Test User',
      role: 'user',
      is_active: true,
      verified: true
    },
    {
      id: 'admin-456',
      email: 'admin@example.com',
      password_hash: '$2b$10$fakehashedpasswordforadmin456',
      name: 'Admin User',
      role: 'admin',
      is_active: true,
      verified: true
    },
    {
      id: 'inactive-789',
      email: 'inactive@example.com',
      password_hash: '$2b$10$fakehashedpasswordinactive789',
      name: 'Inactive User',
      role: 'user',
      is_active: false,
      verified: true
    },
    {
      id: 'unverified-101',
      email: 'unverified@example.com',
      password_hash: '$2b$10$fakehashedpasswordunverified',
      name: 'Unverified User',
      role: 'user',
      is_active: true,
      verified: false
    }
  ];
  
  return {
    db: {
      query: jest.fn().mockImplementation((query: string, params: any[] = []) => {
        // Lookup user by email
        if (query.includes('SELECT * FROM users WHERE email')) {
          const email = params[0];
          const user = mockUsers.find(u => u.email === email);
          return Promise.resolve({ rows: user ? [user] : [] });
        }
        
        // Lookup user by ID
        if (query.includes('SELECT * FROM users WHERE id')) {
          const id = params[0];
          const user = mockUsers.find(u => u.id === id);
          return Promise.resolve({ rows: user ? [user] : [] });
        }
        
        // Insert session
        if (query.includes('INSERT INTO sessions')) {
          return Promise.resolve({ 
            rows: [{ id: `session-${uuidv4().slice(0, 8)}` }] 
          });
        }
        
        // Update last login time
        if (query.includes('UPDATE users SET last_login')) {
          return Promise.resolve({ rowCount: 1 });
        }
        
        // For any other queries, return empty result
        return Promise.resolve({ rows: [] });
      })
    }
  };
});

// Mock password verification
jest.mock('@/lib/auth/password-utils', () => ({
  verifyPassword: jest.fn().mockImplementation((plainPassword, hashedPassword) => {
    // This is a simplified mock that just checks if the passwords match certain patterns
    if (plainPassword === 'correctpassword' && hashedPassword.includes('user123')) {
      return Promise.resolve(true);
    }
    if (plainPassword === 'adminpassword' && hashedPassword.includes('admin456')) {
      return Promise.resolve(true);
    }
    if (plainPassword === 'inactivepassword' && hashedPassword.includes('inactive789')) {
      return Promise.resolve(true);
    }
    if (plainPassword === 'unverifiedpassword' && hashedPassword.includes('unverified')) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  })
}));

// Mock JWT token generation
jest.mock('@/lib/auth/jwt-service', () => {
  return {
    generateToken: jest.fn().mockImplementation((payload, type) => {
      return Promise.resolve({
        token: `fake-${type}-token-for-${payload.userId}`,
        jti: uuidv4(),
        expiresAt: new Date(Date.now() + (type === 'refresh' ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000))
      });
    }),
    TokenType: {
      ACCESS: 'access',
      REFRESH: 'refresh'
    }
  };
});

// Mock rate limiter
jest.mock('@/lib/auth/rate-limiter', () => {
  const rateLimitStates: Record<string, { count: number, blocked: boolean }> = {};
  
  return {
    checkRateLimit: jest.fn().mockImplementation((identifier, type) => {
      // Initialize rate limit state if it doesn't exist
      if (!rateLimitStates[identifier]) {
        rateLimitStates[identifier] = { count: 0, blocked: false };
      }
      
      // Increment count
      rateLimitStates[identifier].count++;
      
      // Block after 5 attempts
      if (rateLimitStates[identifier].count > 5) {
        rateLimitStates[identifier].blocked = true;
      }
      
      return Promise.resolve({
        limited: rateLimitStates[identifier].blocked,
        remaining: rateLimitStates[identifier].blocked ? 0 : 5 - rateLimitStates[identifier].count,
        resetTime: new Date(Date.now() + 15 * 60 * 1000),
        blockedUntil: rateLimitStates[identifier].blocked ? new Date(Date.now() + 60 * 60 * 1000) : null
      });
    }),
    resetRateLimit: jest.fn().mockImplementation((identifier) => {
      if (rateLimitStates[identifier]) {
        rateLimitStates[identifier] = { count: 0, blocked: false };
      }
      return Promise.resolve(true);
    }),
    RateLimitType: {
      LOGIN: 'login',
      TOKEN_REFRESH: 'token-refresh',
      API_GENERAL: 'api-general'
    }
  };
});

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn(),
  trackMetric: jest.fn(),
  trackUsage: jest.fn()
}));

// Mock audit logger
jest.mock('@/lib/auth/audit-logger', () => ({
  logAuthSuccess: jest.fn().mockResolvedValue(true),
  logAuthFailure: jest.fn().mockResolvedValue(true),
  logSuspiciousActivity: jest.fn().mockResolvedValue(true)
}));

describe('User Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Login validation', () => {
    it('should validate valid login credentials', () => {
      const validCredentials = {
        email: 'user@example.com',
        password: 'correctpassword'
      };
      
      const result = validateLoginCredentials(validCredentials);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
    
    it('should reject login with invalid email format', () => {
      const invalidCredentials = {
        email: 'not-an-email',
        password: 'correctpassword'
      };
      
      const result = validateLoginCredentials(invalidCredentials);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.email).toBeDefined();
    });
    
    it('should reject login with missing password', () => {
      const incompleteCredentials = {
        email: 'user@example.com',
        password: ''
      };
      
      const result = validateLoginCredentials(incompleteCredentials);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.password).toBeDefined();
    });
    
    it('should require all login fields', () => {
      const emptyCredentials = {
        email: '',
        password: ''
      };
      
      const result = validateLoginCredentials(emptyCredentials);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors || {})).toHaveLength(2);
    });
  });
  
  describe('Authentication process', () => {
    it('should successfully authenticate a valid user', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'correctpassword'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      const result = await authenticateUser(credentials, ipAddress, userAgent);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe('user-123');
      expect(result.user?.role).toBe('user');
      expect(result.error).toBeUndefined();
      
      // Verify password verification was called
      expect(verifyPassword).toHaveBeenCalledWith(
        'correctpassword',
        '$2b$10$fakehashedpasswordforuser123'
      );
      
      // Should have logged auth success
      const { logAuthSuccess } = require('@/lib/auth/audit-logger');
      expect(logAuthSuccess).toHaveBeenCalled();
    });
    
    it('should reject authentication with wrong password', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      const result = await authenticateUser(credentials, ipAddress, userAgent);
      
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.error).toContain('Invalid credentials');
      
      // Should have logged auth failure
      const { logAuthFailure } = require('@/lib/auth/audit-logger');
      expect(logAuthFailure).toHaveBeenCalled();
    });
    
    it('should reject authentication for non-existent user', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'anypassword'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      const result = await authenticateUser(credentials, ipAddress, userAgent);
      
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.error).toContain('Invalid credentials');
      
      // Should have logged auth failure
      const { logAuthFailure } = require('@/lib/auth/audit-logger');
      expect(logAuthFailure).toHaveBeenCalled();
    });
    
    it('should reject authentication for inactive user', async () => {
      const credentials = {
        email: 'inactive@example.com',
        password: 'inactivepassword'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      const result = await authenticateUser(credentials, ipAddress, userAgent);
      
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.error).toContain('Account inactive');
      
      // Should have logged auth failure
      const { logAuthFailure } = require('@/lib/auth/audit-logger');
      expect(logAuthFailure).toHaveBeenCalled();
    });
    
    it('should reject authentication for unverified user', async () => {
      const credentials = {
        email: 'unverified@example.com',
        password: 'unverifiedpassword'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      const result = await authenticateUser(credentials, ipAddress, userAgent);
      
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.error).toContain('Email not verified');
      
      // Should have logged auth failure
      const { logAuthFailure } = require('@/lib/auth/audit-logger');
      expect(logAuthFailure).toHaveBeenCalled();
    });
  });
  
  describe('Rate limiting and security', () => {
    it('should check rate limits during login attempts', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };
      
      const ipAddress = '192.168.1.2';
      const userAgent = 'Test Browser';
      
      // First attempt
      await authenticateUser(credentials, ipAddress, userAgent);
      
      // Verify rate limit check was called
      const { checkRateLimit } = require('@/lib/auth/rate-limiter');
      expect(checkRateLimit).toHaveBeenCalledWith(
        expect.stringContaining(ipAddress),
        expect.any(String)
      );
    });
    
    it('should block after multiple failed login attempts', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };
      
      const ipAddress = '192.168.1.3';
      const userAgent = 'Test Browser';
      
      // Make several failed attempts
      for (let i = 0; i < 5; i++) {
        await authenticateUser(credentials, ipAddress, userAgent);
      }
      
      // Next attempt should be rate limited
      const result = await authenticateUser(credentials, ipAddress, userAgent);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many login attempts');
      
      // Should have logged suspicious activity
      const { logSuspiciousActivity } = require('@/lib/auth/audit-logger');
      expect(logSuspiciousActivity).toHaveBeenCalled();
    });
    
    it('should detect and log suspicious login patterns', async () => {
      const { logSuspiciousActivity } = require('@/lib/auth/audit-logger');
      
      // Simulate multiple attempts from different IPs for same user
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };
      
      // Try from different IPs
      await authenticateUser(credentials, '192.168.1.10', 'Test Browser');
      await authenticateUser(credentials, '192.168.1.11', 'Test Browser');
      await authenticateUser(credentials, '192.168.1.12', 'Test Browser');
      
      // Should have logged suspicious activity
      expect(logSuspiciousActivity).toHaveBeenCalled();
    });
  });
  
  describe('Session creation', () => {
    it('should create a new session for authenticated user', async () => {
      const { db } = require('@/lib/database/database');
      
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      const result = await createSession(user, ipAddress, userAgent);
      
      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens?.accessToken).toBeDefined();
      expect(result.tokens?.refreshToken).toBeDefined();
      
      // Verify database was called to create session
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sessions'),
        expect.arrayContaining([user.id, ipAddress, userAgent])
      );
      
      // Verify tokens were generated
      expect(generateToken).toHaveBeenCalledTimes(2);
    });
    
    it('should handle session creation failures', async () => {
      const { db } = require('@/lib/database/database');
      const { reportError } = require('@/lib/monitoring');
      
      // Make database operation fail
      db.query.mockRejectedValueOnce(new Error('Database error'));
      
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      const result = await createSession(user, ipAddress, userAgent);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // Error should be reported
      expect(reportError).toHaveBeenCalled();
    });
  });
  
  describe('End-to-end login flow', () => {
    it('should complete successful login flow', async () => {
      const { trackUsage } = require('@/lib/monitoring');
      
      // Setup
      const credentials = {
        email: 'user@example.com',
        password: 'correctpassword'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      // 1. Validate credentials
      const validationResult = validateLoginCredentials(credentials);
      expect(validationResult.valid).toBe(true);
      
      // 2. Authenticate user
      const authResult = await authenticateUser(credentials, ipAddress, userAgent);
      expect(authResult.success).toBe(true);
      expect(authResult.user).toBeDefined();
      
      // 3. Create session
      const sessionResult = await createSession(authResult.user!, ipAddress, userAgent);
      expect(sessionResult.success).toBe(true);
      expect(sessionResult.tokens).toBeDefined();
      
      // Verify usage tracking
      expect(trackUsage).toHaveBeenCalledWith(expect.objectContaining({
        feature: 'authentication',
        action: 'login'
      }));
    });
    
    it('should handle failed login flow', async () => {
      // Setup
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };
      
      const ipAddress = '192.168.1.1';
      const userAgent = 'Test Browser';
      
      // 1. Validate credentials
      const validationResult = validateLoginCredentials(credentials);
      expect(validationResult.valid).toBe(true);
      
      // 2. Authentication should fail
      const authResult = await authenticateUser(credentials, ipAddress, userAgent);
      expect(authResult.success).toBe(false);
      
      // 3. Session should not be created
      expect(createSession).not.toHaveBeenCalled();
    });
  });
});
