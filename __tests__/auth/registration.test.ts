/**
 * 🧪 REGISTRATION TESTS
 * Tests for user registration functionality
 */

import { registerUser, validateRegistrationData, sendVerificationEmail } from '@/lib/auth/registration-service';
import { hashPassword } from '@/lib/auth/password-utils';
import { v4 as uuidv4 } from 'uuid';

// Mock database
jest.mock('@/lib/database/database', () => {
  const mockUsers: any[] = [];
  
  return {
    db: {
      query: jest.fn().mockImplementation((query: string, params: any[] = []) => {
        // For INSERT queries, add user to mockUsers
        if (query.includes('INSERT INTO users')) {
          const userId = uuidv4();
          const user = {
            id: userId,
            email: params[0],
            password_hash: params[1],
            name: params[2],
            role: params[3],
            created_at: new Date(),
            verified: false
          };
          mockUsers.push(user);
          return Promise.resolve({ rows: [{ id: userId }] });
        }
        
        // For SELECT queries checking if user exists
        if (query.includes('SELECT * FROM users WHERE email')) {
          const email = params[0];
          const existingUser = mockUsers.find(user => user.email === email);
          return Promise.resolve({ rows: existingUser ? [existingUser] : [] });
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

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn(),
  trackMetric: jest.fn(),
  trackUsage: jest.fn()
}));

// Mock JWT service for verification tokens
jest.mock('@/lib/auth/jwt-service', () => ({
  generateToken: jest.fn().mockImplementation(({ email }) => {
    return Promise.resolve({
      token: `verification-token-for-${email}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  })
}));

describe('User Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Registration validation', () => {
    it('should validate complete and valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd',
        confirmPassword: 'SecureP@ssw0rd',
        name: 'Test User',
        termsAccepted: true
      };
      
      const result = validateRegistrationData(validData);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
    
    it('should reject registration with invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecureP@ssw0rd',
        confirmPassword: 'SecureP@ssw0rd',
        name: 'Test User',
        termsAccepted: true
      };
      
      const result = validateRegistrationData(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.email).toBeDefined();
    });
    
    it('should reject registration with weak password', () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'password', // Too simple
        confirmPassword: 'password',
        name: 'Test User',
        termsAccepted: true
      };
      
      const result = validateRegistrationData(weakPasswordData);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.password).toBeDefined();
    });
    
    it('should reject registration with mismatched passwords', () => {
      const mismatchedData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd',
        confirmPassword: 'DifferentP@ssw0rd',
        name: 'Test User',
        termsAccepted: true
      };
      
      const result = validateRegistrationData(mismatchedData);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.confirmPassword).toBeDefined();
    });
    
    it('should reject registration when terms are not accepted', () => {
      const noTermsData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd',
        confirmPassword: 'SecureP@ssw0rd',
        name: 'Test User',
        termsAccepted: false
      };
      
      const result = validateRegistrationData(noTermsData);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.termsAccepted).toBeDefined();
    });
    
    it('should require all mandatory fields', () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd'
        // Missing confirmPassword, name, and termsAccepted
      };
      
      const result = validateRegistrationData(incompleteData as any);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors || {})).toHaveLength(3); // Three missing fields
    });
  });
  
  describe('User registration process', () => {
    it('should successfully register a new user', async () => {
      const { db } = require('@/lib/database/database');
      
      const registrationData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd',
        name: 'New User'
      };
      
      // First check that user doesn't exist
      db.query.mockResolvedValueOnce({ rows: [] });
      
      // Then insert user
      db.query.mockResolvedValueOnce({ rows: [{ id: '123' }] });
      
      const result = await registerUser(registrationData);
      
      expect(result.success).toBe(true);
      expect(result.userId).toBe('123');
      expect(result.error).toBeUndefined();
      
      // Verify database was called correctly
      expect(db.query).toHaveBeenCalledTimes(2);
      
      // Check first call was to look up user
      const checkUserCall = db.query.mock.calls[0];
      expect(checkUserCall[0]).toContain('SELECT');
      expect(checkUserCall[1][0]).toBe(registrationData.email);
      
      // Check second call was to insert user
      const insertUserCall = db.query.mock.calls[1];
      expect(insertUserCall[0]).toContain('INSERT');
      expect(insertUserCall[1][0]).toBe(registrationData.email);
      // Password should be hashed
      expect(insertUserCall[1][1]).not.toBe(registrationData.password);
    });
    
    it('should reject registration for existing email', async () => {
      const { db } = require('@/lib/database/database');
      
      const existingUserData = {
        email: 'existing@example.com',
        password: 'SecureP@ssw0rd',
        name: 'Existing User'
      };
      
      // Mock that user already exists
      db.query.mockResolvedValueOnce({ 
        rows: [{ id: '456', email: existingUserData.email }] 
      });
      
      const result = await registerUser(existingUserData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already registered');
      expect(result.userId).toBeUndefined();
      
      // Verify only the check query was called, not the insert
      expect(db.query).toHaveBeenCalledTimes(1);
    });
    
    it('should handle database errors gracefully', async () => {
      const { db } = require('@/lib/database/database');
      const { reportError } = require('@/lib/monitoring');
      
      const userData = {
        email: 'error@example.com',
        password: 'SecureP@ssw0rd',
        name: 'Error User'
      };
      
      // First check passes (user doesn't exist)
      db.query.mockResolvedValueOnce({ rows: [] });
      
      // But then insert fails
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const result = await registerUser(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('registration failed');
      expect(result.userId).toBeUndefined();
      
      // Verify error was reported
      expect(reportError).toHaveBeenCalled();
    });
    
    it('should properly hash passwords', async () => {
      const password = 'MySecurePassword123';
      const hashedPassword = await hashPassword(password);
      
      // Hashed password should not be the original
      expect(hashedPassword).not.toBe(password);
      
      // Hashed password should be a long string (bcrypt hash)
      expect(hashedPassword.length).toBeGreaterThan(20);
      
      // Hashing the same password twice should produce different hashes (due to salt)
      const secondHash = await hashPassword(password);
      expect(secondHash).not.toBe(hashedPassword);
    });
  });
  
  describe('Email verification', () => {
    it('should send verification email after registration', async () => {
      const { sendEmail } = require('@/lib/services/email-service');
      const { generateToken } = require('@/lib/auth/jwt-service');
      
      const user = {
        id: '789',
        email: 'verify@example.com',
        name: 'Verify User'
      };
      
      await sendVerificationEmail(user);
      
      // Token should have been generated
      expect(generateToken).toHaveBeenCalled();
      
      // Email should have been sent
      expect(sendEmail).toHaveBeenCalled();
      expect(sendEmail.mock.calls[0][0]).toBe(user.email);
      expect(sendEmail.mock.calls[0][1]).toContain('Verify');
      
      // Email should contain the verification token
      const emailBody = sendEmail.mock.calls[0][2];
      expect(emailBody).toContain('verification-token-for-verify@example.com');
    });
    
    it('should handle email sending failures gracefully', async () => {
      const { sendEmail } = require('@/lib/services/email-service');
      const { reportError } = require('@/lib/monitoring');
      
      // Make sendEmail fail
      sendEmail.mockRejectedValueOnce(new Error('SMTP error'));
      
      const user = {
        id: '789',
        email: 'error@example.com',
        name: 'Error User'
      };
      
      const result = await sendVerificationEmail(user);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // Error should be reported
      expect(reportError).toHaveBeenCalled();
    });
  });
  
  describe('Integration tests', () => {
    it('should complete the entire registration flow', async () => {
      const { db } = require('@/lib/database/database');
      const { sendEmail } = require('@/lib/services/email-service');
      const { trackUsage } = require('@/lib/monitoring');
      
      const registrationData = {
        email: 'complete@example.com',
        password: 'CompleteP@ssw0rd',
        name: 'Complete User',
        termsAccepted: true
      };
      
      // Setup mocks for the full flow
      // 1. Validation passes
      // 2. User doesn't exist check
      db.query.mockResolvedValueOnce({ rows: [] });
      // 3. User insert succeeds
      const userId = uuidv4();
      db.query.mockResolvedValueOnce({ rows: [{ id: userId }] });
      
      // Execute registration
      const validationResult = validateRegistrationData(registrationData);
      expect(validationResult.valid).toBe(true);
      
      const registrationResult = await registerUser({
        email: registrationData.email,
        password: registrationData.password,
        name: registrationData.name
      });
      
      expect(registrationResult.success).toBe(true);
      expect(registrationResult.userId).toBeDefined();
      
      // Verification email should be sent
      const verificationResult = await sendVerificationEmail({
        id: registrationResult.userId!,
        email: registrationData.email,
        name: registrationData.name
      });
      
      expect(verificationResult.success).toBe(true);
      expect(sendEmail).toHaveBeenCalled();
      
      // Usage should be tracked
      expect(trackUsage).toHaveBeenCalledWith(expect.objectContaining({
        feature: 'authentication',
        action: 'register'
      }));
    });
  });
});
