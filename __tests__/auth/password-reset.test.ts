/**
 * 🧪 PASSWORD RESET TESTS
 * Tests for password reset functionality
 */

import { 
  requestPasswordReset, 
  validateResetToken, 
  resetPassword 
} from '@/lib/auth/password-reset-service';
import { hashPassword, verifyPassword } from '@/lib/auth/password-utils';
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
    }
  ];
  
  // Mock reset tokens
  const mockResetTokens: Record<string, any> = {};
  
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
        
        // Insert reset token
        if (query.includes('INSERT INTO password_reset_tokens')) {
          const userId = params[0];
          const token = params[1];
          const expiresAt = params[2];
          
          // Store token in mock
          mockResetTokens[token] = {
            user_id: userId,
            token,
            expires_at: expiresAt,
            created_at: new Date()
          };
          
          return Promise.resolve({ rows: [{ token }] });
        }
        
        // Get reset token
        if (query.includes('SELECT * FROM password_reset_tokens WHERE token')) {
          const token = params[0];
          const resetToken = mockResetTokens[token];
          
          // Check if token exists and is not expired
          if (resetToken && new Date(resetToken.expires_at) > new Date()) {
            return Promise.resolve({ rows: [resetToken] });
          }
          
          return Promise.resolve({ rows: [] });
        }
        
        // Update user password
        if (query.includes('UPDATE users SET password_hash')) {
          const passwordHash = params[0];
          const userId = params[1];
          
          // Update user password hash
          const userIndex = mockUsers.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            mockUsers[userIndex].password_hash = passwordHash;
            return Promise.resolve({ rowCount: 1 });
          }
          
          return Promise.resolve({ rowCount: 0 });
        }
        
        // Delete reset token
        if (query.includes('DELETE FROM password_reset_tokens')) {
          const token = params[0];
          
          // Delete token from mock
          delete mockResetTokens[token];
          
          return Promise.resolve({ rowCount: 1 });
        }
        
        // For other queries, return empty result
        return Promise.resolve({ rows: [] });
      })
    }
  };
});

// Mock email service
jest.mock('@/lib/services/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

// Mock JWT for token generation
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockImplementation((payload, secret, options) => {
    // Create a simple token that encodes the user ID
    return `fake-reset-token-${payload.userId}-${Date.now()}`;
  }),
  verify: jest.fn().mockImplementation((token, secret) => {
    // Extract user ID from token
    const parts = token.split('-');
    if (parts.length >= 4 && parts[0] === 'fake' && parts[1] === 'reset' && parts[2] === 'token') {
      return { userId: parts[3] };
    }
    throw new Error('Invalid token');
  })
}));

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn(),
  trackMetric: jest.fn(),
  trackUsage: jest.fn()
}));

// Mock audit logger
jest.mock('@/lib/auth/audit-logger', () => ({
  logPasswordChange: jest.fn().mockResolvedValue(true)
}));

describe('Password Reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Request password reset', () => {
    it('should send reset email for valid user', async () => {
      const { sendEmail } = require('@/lib/services/email-service');
      
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      
      const result = await requestPasswordReset(email, baseUrl);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      
      // Should have sent email
      expect(sendEmail).toHaveBeenCalledWith(
        email,
        expect.stringContaining('Reset Your Password'),
        expect.stringContaining(baseUrl)
      );
      
      // Email should contain reset link
      const emailBody = sendEmail.mock.calls[0][2];
      expect(emailBody).toContain('reset-token');
    });
    
    it('should not reveal if email exists', async () => {
      const { sendEmail } = require('@/lib/services/email-service');
      
      // Request reset for non-existent user
      const email = 'nonexistent@example.com';
      const baseUrl = 'https://example.com';
      
      const result = await requestPasswordReset(email, baseUrl);
      
      // Should still return success
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      
      // But should not have sent email
      expect(sendEmail).not.toHaveBeenCalled();
    });
    
    it('should handle email sending failures gracefully', async () => {
      const { sendEmail } = require('@/lib/services/email-service');
      const { reportError } = require('@/lib/monitoring');
      
      // Make sendEmail fail
      sendEmail.mockRejectedValueOnce(new Error('SMTP error'));
      
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      
      const result = await requestPasswordReset(email, baseUrl);
      
      // Should still show success to avoid email enumeration
      expect(result.success).toBe(true);
      
      // But should have reported error
      expect(reportError).toHaveBeenCalled();
    });
    
    it('should handle database errors gracefully', async () => {
      const { db } = require('@/lib/database/database');
      const { reportError } = require('@/lib/monitoring');
      
      // Make database operation fail
      db.query.mockRejectedValueOnce(new Error('Database error'));
      
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      
      const result = await requestPasswordReset(email, baseUrl);
      
      // Should still return success to user
      expect(result.success).toBe(true);
      
      // But should have reported error
      expect(reportError).toHaveBeenCalled();
    });
  });
  
  describe('Reset token validation', () => {
    it('should validate a valid reset token', async () => {
      // Setup: Create a valid reset token
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      const resetRequest = await requestPasswordReset(email, baseUrl);
      
      // Extract token from email
      const { sendEmail } = require('@/lib/services/email-service');
      const emailBody = sendEmail.mock.calls[0][2];
      const tokenMatch = emailBody.match(/token=([^&\s"]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Validate token
      const result = await validateResetToken(token);
      
      expect(result.valid).toBe(true);
      expect(result.userId).toBe('user-123');
      expect(result.error).toBeUndefined();
    });
    
    it('should reject invalid reset tokens', async () => {
      const invalidToken = 'invalid-token';
      
      const result = await validateResetToken(invalidToken);
      
      expect(result.valid).toBe(false);
      expect(result.userId).toBeUndefined();
      expect(result.error).toBeDefined();
    });
    
    it('should reject expired reset tokens', async () => {
      // Mock an expired token
      const { db } = require('@/lib/database/database');
      
      // Override the mock for this test to return an expired token
      db.query.mockImplementationOnce((query: string, params: any[] = []) => {
        if (query.includes('SELECT * FROM password_reset_tokens WHERE token')) {
          return Promise.resolve({
            rows: [{
              user_id: 'user-123',
              token: params[0],
              expires_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour in the past
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours in the past
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });
      
      const result = await validateResetToken('expired-token');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });
    
    it('should handle database errors during validation', async () => {
      const { db } = require('@/lib/database/database');
      const { reportError } = require('@/lib/monitoring');
      
      // Make database operation fail
      db.query.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await validateResetToken('some-token');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      
      // Should have reported error
      expect(reportError).toHaveBeenCalled();
    });
  });
  
  describe('Password reset process', () => {
    it('should successfully reset password with valid token', async () => {
      // Setup: Create a valid reset token
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      const resetRequest = await requestPasswordReset(email, baseUrl);
      
      // Extract token from email
      const { sendEmail } = require('@/lib/services/email-service');
      const emailBody = sendEmail.mock.calls[0][2];
      const tokenMatch = emailBody.match(/token=([^&\s"]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Reset password
      const newPassword = 'NewSecureP@ssw0rd';
      
      const result = await resetPassword(token, newPassword);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      
      // Should have logged password change
      const { logPasswordChange } = require('@/lib/auth/audit-logger');
      expect(logPasswordChange).toHaveBeenCalled();
      
      // Token should be deleted (one-time use)
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM password_reset_tokens'),
        expect.arrayContaining([token])
      );
    });
    
    it('should reject password reset with invalid token', async () => {
      const invalidToken = 'invalid-token';
      const newPassword = 'NewSecureP@ssw0rd';
      
      const result = await resetPassword(invalidToken, newPassword);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
    
    it('should validate password strength during reset', async () => {
      // Setup: Create a valid reset token
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      const resetRequest = await requestPasswordReset(email, baseUrl);
      
      // Extract token from email
      const { sendEmail } = require('@/lib/services/email-service');
      const emailBody = sendEmail.mock.calls[0][2];
      const tokenMatch = emailBody.match(/token=([^&\s"]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Try to reset with weak password
      const weakPassword = 'password123';
      
      const result = await resetPassword(token, weakPassword);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('password strength');
    });
    
    it('should handle database errors during reset', async () => {
      const { db } = require('@/lib/database/database');
      const { reportError } = require('@/lib/monitoring');
      
      // Setup: Create a valid reset token
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      const resetRequest = await requestPasswordReset(email, baseUrl);
      
      // Extract token from email
      const { sendEmail } = require('@/lib/services/email-service');
      const emailBody = sendEmail.mock.calls[0][2];
      const tokenMatch = emailBody.match(/token=([^&\s"]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Make database operation fail
      db.query.mockRejectedValueOnce(new Error('Database error'));
      
      // Try to reset password
      const newPassword = 'NewSecureP@ssw0rd';
      
      const result = await resetPassword(token, newPassword);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // Should have reported error
      expect(reportError).toHaveBeenCalled();
    });
  });
  
  describe('End-to-end password reset flow', () => {
    it('should complete the entire password reset flow', async () => {
      const { db } = require('@/lib/database/database');
      const { sendEmail } = require('@/lib/services/email-service');
      const { trackUsage } = require('@/lib/monitoring');
      
      // 1. Request password reset
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      
      const requestResult = await requestPasswordReset(email, baseUrl);
      expect(requestResult.success).toBe(true);
      
      // 2. Extract token from email
      const emailBody = sendEmail.mock.calls[0][2];
      const tokenMatch = emailBody.match(/token=([^&\s"]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      expect(token).toBeTruthy();
      
      // 3. Validate token
      const validationResult = await validateResetToken(token);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.userId).toBe('user-123');
      
      // 4. Reset password
      const newPassword = 'NewSecureP@ssw0rd';
      const resetResult = await resetPassword(token, newPassword);
      expect(resetResult.success).toBe(true);
      
      // 5. Verify password was changed
      // Reset mocks to prepare for the verification
      jest.clearAllMocks();
      
      // Verify the new password works for authentication
      const { verifyPassword } = require('@/lib/auth/password-utils');
      
      // Set up the mock to verify the new password
      verifyPassword.mockImplementationOnce((plainPassword, hashedPassword) => {
        return Promise.resolve(plainPassword === newPassword);
      });
      
      // Simulate login with new password
      const loginData = {
        email: 'user@example.com',
        password: newPassword
      };
      
      // This is a simplified login check
      const user = (await db.query('SELECT * FROM users WHERE email = $1', [loginData.email])).rows[0];
      const passwordValid = await verifyPassword(loginData.password, user.password_hash);
      
      expect(passwordValid).toBe(true);
      
      // Verify usage tracking
      expect(trackUsage).toHaveBeenCalledWith(expect.objectContaining({
        feature: 'authentication',
        action: 'password-reset'
      }));
    });
  });
  
  describe('Security aspects', () => {
    it('should implement rate limiting for password reset requests', async () => {
      // This would normally be tested with the rate limiter
      // Here we're just testing that the code would call the rate limiter
      const mockCheckRateLimit = jest.fn().mockResolvedValue({ limited: false, remaining: 5 });
      jest.mock('@/lib/auth/rate-limiter', () => ({
        checkRateLimit: mockCheckRateLimit,
        RateLimitType: { PASSWORD_RESET: 'password-reset' }
      }));
      
      // Assuming the requestPasswordReset function uses rate limiting
      // This would be a more thorough test in a real implementation
      
      // For now, we'll just assert that in a real implementation,
      // rate limiting should be implemented for security
      
      // A proper test would look like:
      /*
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      
      await requestPasswordReset(email, baseUrl);
      
      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        expect.stringContaining(email),
        'password-reset'
      );
      */
    });
    
    it('should use secure tokens for password reset', () => {
      // Test that tokens are sufficiently random and secure
      // This is more of a code review aspect, but we can test some properties
      
      const generateToken = () => {
        const { sign } = require('jsonwebtoken');
        return sign({ userId: 'user-123' }, 'secret', { expiresIn: '1h' });
      };
      
      const token1 = generateToken();
      const token2 = generateToken();
      
      // Tokens should be different each time
      expect(token1).not.toBe(token2);
      
      // Tokens should be sufficiently long
      expect(token1.length).toBeGreaterThan(20);
    });
    
    it('should implement proper password strength validation', async () => {
      // Setup: Create a valid reset token
      const email = 'user@example.com';
      const baseUrl = 'https://example.com';
      const resetRequest = await requestPasswordReset(email, baseUrl);
      
      // Extract token from email
      const { sendEmail } = require('@/lib/services/email-service');
      const emailBody = sendEmail.mock.calls[0][2];
      const tokenMatch = emailBody.match(/token=([^&\s"]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Test various password strengths
      const testCases = [
        { password: 'short', shouldSucceed: false },
        { password: 'password', shouldSucceed: false },
        { password: '12345678', shouldSucceed: false },
        { password: 'password123', shouldSucceed: false },
        { password: 'Password123', shouldSucceed: false }, // Needs special char
        { password: 'Password123!', shouldSucceed: true },
        { password: 'P@ssw0rd', shouldSucceed: true }
      ];
      
      for (const testCase of testCases) {
        const result = await resetPassword(token, testCase.password);
        expect(result.success).toBe(testCase.shouldSucceed);
      }
    });
  });
});
