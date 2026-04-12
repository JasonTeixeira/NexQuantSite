/**
 * 🧪 AUDIT LOGGER TESTS
 * Unit tests for security audit logging functionality
 */

import {
  logAuditEvent,
  getRequestInfo,
  logAuthSuccess,
  logAuthFailure,
  logLogout,
  logTokenRefresh,
  logAccessDenied,
  logPasswordChange,
  logRateLimitExceeded,
  logSuspiciousActivity,
  searchAuditLogs,
  initializeAuditLogging,
  AuditCategory,
  AuditEventType,
  AuditSeverity,
  AuditStatus
} from '@/lib/auth/audit-logger';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
jest.mock('@/lib/database/database', () => {
  const mockRows: any[] = [];
  
  return {
    db: {
      query: jest.fn((query: string, params: any[] = []) => {
        // For INSERT queries, add row to mockRows
        if (query.trim().toUpperCase().startsWith('INSERT')) {
          const row = {
            id: mockRows.length + 1,
            timestamp: params[0],
            user_id: params[1],
            session_id: params[2],
            category: params[3],
            event_type: params[4],
            status: params[5],
            severity: params[6],
            ip_address: params[7],
            user_agent: params[8],
            details: params[9],
            metadata: params[10]
          };
          mockRows.push(row);
          return Promise.resolve({ rowCount: 1 });
        } 
        // For SELECT EXISTS query (table check)
        else if (query.includes('EXISTS') && query.includes('information_schema.tables')) {
          return Promise.resolve({ rows: [{ exists: true }] });
        }
        // For COUNT query
        else if (query.includes('COUNT(*)')) {
          // Filter mockRows based on WHERE conditions in params
          // This is a simplified implementation
          return Promise.resolve({ rows: [{ count: String(mockRows.length) }] });
        }
        // For SELECT query
        else if (query.trim().toUpperCase().startsWith('SELECT')) {
          // Return filtered mockRows based on WHERE conditions
          // This is a simplified implementation
          const limit = params[params.length - 2] || 100;
          const offset = params[params.length - 1] || 0;
          
          return Promise.resolve({
            rows: mockRows
              .slice(offset, offset + limit)
              .map(row => ({
                ...row,
                details: typeof row.details === 'string' ? row.details : JSON.stringify(row.details),
                metadata: typeof row.metadata === 'string' ? row.metadata : JSON.stringify(row.metadata)
              }))
          });
        }
        
        return Promise.resolve({ rows: [] });
      })
    }
  };
});

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn()
}));

// Mock NextRequest
jest.mock('next/server', () => {
  class MockHeaders {
    private headers: Record<string, string> = {};
    
    constructor(headers: Record<string, string> = {}) {
      this.headers = { ...headers };
    }
    
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
      this.headers = new MockHeaders(headers);
    }
  }
  
  return {
    NextRequest: MockRequest
  };
});

describe('Audit Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mockRows
    const { db } = require('@/lib/database/database');
    db.query.mockImplementation((query: string, params: any[] = []) => {
      if (query.trim().toUpperCase().startsWith('INSERT')) {
        return Promise.resolve({ rowCount: 1 });
      } else if (query.includes('EXISTS') && query.includes('information_schema.tables')) {
        return Promise.resolve({ rows: [{ exists: true }] });
      } else if (query.includes('COUNT(*)')) {
        return Promise.resolve({ rows: [{ count: '0' }] });
      } else if (query.trim().toUpperCase().startsWith('SELECT')) {
        return Promise.resolve({ rows: [] });
      }
      
      return Promise.resolve({ rows: [] });
    });
    
    // Mock console methods
    global.console.log = jest.fn();
    global.console.error = jest.fn();
  });
  
  describe('logAuditEvent', () => {
    it('should log an event to the database', async () => {
      const { db } = require('@/lib/database/database');
      
      const auditEvent = {
        userId: uuidv4(),
        sessionId: uuidv4(),
        category: AuditCategory.AUTHENTICATION,
        eventType: AuditEventType.LOGIN_SUCCESS,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.INFO,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: { browser: 'Chrome' }
      };
      
      await logAuditEvent(auditEvent);
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      // Verify that params were passed correctly
      expect(queryParams[1]).toBe(auditEvent.userId);
      expect(queryParams[2]).toBe(auditEvent.sessionId);
      expect(queryParams[3]).toBe(auditEvent.category);
      expect(queryParams[4]).toBe(auditEvent.eventType);
      expect(queryParams[5]).toBe(auditEvent.status);
      expect(queryParams[6]).toBe(auditEvent.severity);
      expect(queryParams[7]).toBe(auditEvent.ipAddress);
      expect(queryParams[8]).toBe(auditEvent.userAgent);
      expect(JSON.parse(queryParams[9])).toEqual(auditEvent.details);
    });
    
    it('should log critical events to monitoring system', async () => {
      const { reportError } = require('@/lib/monitoring');
      
      const criticalEvent = {
        userId: uuidv4(),
        category: AuditCategory.SYSTEM,
        eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
        status: AuditStatus.BLOCKED,
        severity: AuditSeverity.CRITICAL,
        details: { reason: 'Potential breach attempt' }
      };
      
      await logAuditEvent(criticalEvent);
      
      expect(reportError).toHaveBeenCalledWith(expect.objectContaining({
        component: 'AuditLogger',
        action: criticalEvent.eventType,
        severity: 'critical'
      }));
    });
    
    it('should handle database errors gracefully', async () => {
      const { db } = require('@/lib/database/database');
      const { reportError } = require('@/lib/monitoring');
      
      // Simulate a database error
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const auditEvent = {
        category: AuditCategory.AUTHENTICATION,
        eventType: AuditEventType.LOGIN_FAILURE,
        status: AuditStatus.FAILURE,
        severity: AuditSeverity.WARNING
      };
      
      // Should not throw
      await expect(logAuditEvent(auditEvent)).resolves.not.toThrow();
      
      // Should report error
      expect(reportError).toHaveBeenCalledWith(expect.objectContaining({
        component: 'AuditLogger',
        action: 'logAuditEvent',
        severity: 'high'
      }));
    });
  });
  
  describe('getRequestInfo', () => {
    it('should extract IP address and user agent from request', () => {
      const req = new NextRequest({
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0'
      });
      
      const info = getRequestInfo(req);
      
      expect(info.ipAddress).toBe('192.168.1.1');
      expect(info.userAgent).toBe('Mozilla/5.0');
    });
    
    it('should extract first IP from comma-separated list', () => {
      const req = new NextRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
        'user-agent': 'Mozilla/5.0'
      });
      
      const info = getRequestInfo(req);
      
      expect(info.ipAddress).toBe('192.168.1.1');
    });
    
    it('should fallback to x-real-ip if x-forwarded-for is not available', () => {
      const req = new NextRequest({
        'x-real-ip': '10.0.0.1',
        'user-agent': 'Mozilla/5.0'
      });
      
      const info = getRequestInfo(req);
      
      expect(info.ipAddress).toBe('10.0.0.1');
    });
    
    it('should use "unknown" for missing values', () => {
      const req = new NextRequest({});
      
      const info = getRequestInfo(req);
      
      expect(info.ipAddress).toBe('unknown');
      expect(info.userAgent).toBe('unknown');
    });
  });
  
  describe('Specialized logging functions', () => {
    const mockRequest = new NextRequest({
      'x-forwarded-for': '192.168.1.1',
      'user-agent': 'Mozilla/5.0'
    });
    
    it('should log authentication success', async () => {
      const { db } = require('@/lib/database/database');
      
      const userId = uuidv4();
      const sessionId = uuidv4();
      
      await logAuthSuccess(mockRequest, userId, sessionId, { method: 'password' });
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      expect(queryParams[1]).toBe(userId);
      expect(queryParams[2]).toBe(sessionId);
      expect(queryParams[3]).toBe(AuditCategory.AUTHENTICATION);
      expect(queryParams[4]).toBe(AuditEventType.LOGIN_SUCCESS);
      expect(queryParams[5]).toBe(AuditStatus.SUCCESS);
      expect(queryParams[7]).toBe('192.168.1.1');
      expect(queryParams[8]).toBe('Mozilla/5.0');
      expect(JSON.parse(queryParams[9])).toEqual({ method: 'password' });
    });
    
    it('should log authentication failure', async () => {
      const { db } = require('@/lib/database/database');
      
      await logAuthFailure(mockRequest, 'testuser@example.com', 'Invalid password');
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      expect(queryParams[3]).toBe(AuditCategory.AUTHENTICATION);
      expect(queryParams[4]).toBe(AuditEventType.LOGIN_FAILURE);
      expect(queryParams[5]).toBe(AuditStatus.FAILURE);
      expect(queryParams[6]).toBe(AuditSeverity.WARNING);
      expect(JSON.parse(queryParams[9])).toEqual({
        attemptedUsername: 'testuser@example.com',
        reason: 'Invalid password'
      });
    });
    
    it('should log logout', async () => {
      const { db } = require('@/lib/database/database');
      
      const userId = uuidv4();
      const sessionId = uuidv4();
      
      await logLogout(mockRequest, userId, sessionId);
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      expect(queryParams[1]).toBe(userId);
      expect(queryParams[2]).toBe(sessionId);
      expect(queryParams[3]).toBe(AuditCategory.AUTHENTICATION);
      expect(queryParams[4]).toBe(AuditEventType.LOGOUT);
    });
    
    it('should log token refresh', async () => {
      const { db } = require('@/lib/database/database');
      
      const userId = uuidv4();
      const sessionId = uuidv4();
      
      await logTokenRefresh(mockRequest, userId, sessionId, true);
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      expect(queryParams[1]).toBe(userId);
      expect(queryParams[2]).toBe(sessionId);
      expect(queryParams[3]).toBe(AuditCategory.AUTHENTICATION);
      expect(queryParams[4]).toBe(AuditEventType.TOKEN_REFRESH);
      expect(queryParams[5]).toBe(AuditStatus.SUCCESS);
      expect(queryParams[6]).toBe(AuditSeverity.INFO);
    });
    
    it('should log access denied', async () => {
      const { db } = require('@/lib/database/database');
      
      const userId = uuidv4();
      
      await logAccessDenied(mockRequest, userId, '/api/admin/users', 'Insufficient permissions');
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      expect(queryParams[1]).toBe(userId);
      expect(queryParams[3]).toBe(AuditCategory.AUTHORIZATION);
      expect(queryParams[4]).toBe(AuditEventType.ACCESS_DENIED);
      expect(queryParams[5]).toBe(AuditStatus.BLOCKED);
      expect(JSON.parse(queryParams[9])).toEqual({
        resource: '/api/admin/users',
        reason: 'Insufficient permissions'
      });
    });
    
    it('should log password change', async () => {
      const { db } = require('@/lib/database/database');
      
      const userId = uuidv4();
      
      await logPasswordChange(mockRequest, userId, true);
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      expect(queryParams[1]).toBe(userId);
      expect(queryParams[3]).toBe(AuditCategory.USER_MANAGEMENT);
      expect(queryParams[4]).toBe(AuditEventType.PASSWORD_CHANGED);
      expect(queryParams[5]).toBe(AuditStatus.SUCCESS);
    });
    
    it('should log rate limit exceeded', async () => {
      const { db } = require('@/lib/database/database');
      
      await logRateLimitExceeded(mockRequest, undefined, 'login');
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      expect(queryParams[3]).toBe(AuditCategory.SYSTEM);
      expect(queryParams[4]).toBe(AuditEventType.RATE_LIMIT_EXCEEDED);
      expect(queryParams[5]).toBe(AuditStatus.BLOCKED);
      expect(JSON.parse(queryParams[9])).toEqual({ limitType: 'login' });
    });
    
    it('should log suspicious activity', async () => {
      const { db } = require('@/lib/database/database');
      
      await logSuspiciousActivity(
        mockRequest,
        undefined,
        'multiple-failed-logins',
        { attempts: 10, timespan: '5 minutes' }
      );
      
      expect(db.query).toHaveBeenCalled();
      const queryParams = db.query.mock.calls[0][1];
      
      expect(queryParams[3]).toBe(AuditCategory.SYSTEM);
      expect(queryParams[4]).toBe(AuditEventType.SUSPICIOUS_ACTIVITY);
      expect(queryParams[5]).toBe(AuditStatus.BLOCKED);
      expect(queryParams[6]).toBe(AuditSeverity.ERROR);
      expect(JSON.parse(queryParams[9])).toEqual({
        activityType: 'multiple-failed-logins',
        attempts: 10,
        timespan: '5 minutes'
      });
    });
  });
  
  describe('searchAuditLogs', () => {
    it('should search audit logs with filters', async () => {
      const { db } = require('@/lib/database/database');
      
      // Setup mock data
      db.query.mockImplementation((query: string, params: any[] = []) => {
        if (query.includes('COUNT(*)')) {
          return Promise.resolve({ rows: [{ count: '2' }] });
        } else if (query.trim().toUpperCase().startsWith('SELECT *')) {
          return Promise.resolve({
            rows: [
              {
                id: '1',
                timestamp: new Date().toISOString(),
                user_id: 'user123',
                session_id: 'session123',
                category: AuditCategory.AUTHENTICATION,
                event_type: AuditEventType.LOGIN_SUCCESS,
                status: AuditStatus.SUCCESS,
                severity: AuditSeverity.INFO,
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0',
                details: '{"browser":"Chrome"}',
                metadata: '{}'
              },
              {
                id: '2',
                timestamp: new Date().toISOString(),
                user_id: 'user123',
                session_id: 'session456',
                category: AuditCategory.AUTHENTICATION,
                event_type: AuditEventType.LOGOUT,
                status: AuditStatus.SUCCESS,
                severity: AuditSeverity.INFO,
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0',
                details: '{}',
                metadata: '{}'
              }
            ]
          });
        }
        return Promise.resolve({ rows: [] });
      });
      
      const result = await searchAuditLogs({
        userId: 'user123',
        category: AuditCategory.AUTHENTICATION,
        limit: 10,
        offset: 0
      });
      
      expect(result.total).toBe(2);
      expect(result.logs.length).toBe(2);
      expect(result.logs[0].eventType).toBe(AuditEventType.LOGIN_SUCCESS);
      expect(result.logs[1].eventType).toBe(AuditEventType.LOGOUT);
      
      // Verify query was called with proper filters
      expect(db.query).toHaveBeenCalledTimes(2); // Count query + data query
      
      const countQueryParams = db.query.mock.calls[0][1];
      expect(countQueryParams).toContain('user123');
      expect(countQueryParams).toContain(AuditCategory.AUTHENTICATION);
      
      const dataQueryParams = db.query.mock.calls[1][1];
      expect(dataQueryParams).toContain('user123');
      expect(dataQueryParams).toContain(AuditCategory.AUTHENTICATION);
      expect(dataQueryParams).toContain(10); // limit
      expect(dataQueryParams).toContain(0); // offset
    });
    
    it('should handle search errors gracefully', async () => {
      const { db } = require('@/lib/database/database');
      const { reportError } = require('@/lib/monitoring');
      
      // Simulate a database error
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const result = await searchAuditLogs({
        userId: 'user123'
      });
      
      // Should return empty results
      expect(result.total).toBe(0);
      expect(result.logs.length).toBe(0);
      
      // Should report error
      expect(reportError).toHaveBeenCalledWith(expect.objectContaining({
        component: 'AuditLogger',
        action: 'searchAuditLogs',
        severity: 'medium'
      }));
    });
  });
  
  describe('initializeAuditLogging', () => {
    it('should not create tables if they already exist', async () => {
      const { db } = require('@/lib/database/database');
      
      // Mock that table already exists
      db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ exists: true }] }));
      
      await initializeAuditLogging();
      
      // Should only check if table exists, not create it
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][0]).toContain('information_schema.tables');
    });
    
    it('should create tables if they do not exist', async () => {
      const { db } = require('@/lib/database/database');
      
      // Mock that table doesn't exist
      db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ exists: false }] }));
      
      await initializeAuditLogging();
      
      // Should check if table exists and then create it
      expect(db.query).toHaveBeenCalledTimes(6); // 1 check + 1 create table + 4 indexes
      expect(db.query.mock.calls[0][0]).toContain('information_schema.tables');
      expect(db.query.mock.calls[1][0]).toContain('CREATE TABLE audit_logs');
    });
    
    it('should handle initialization errors gracefully', async () => {
      const { db } = require('@/lib/database/database');
      const { reportError } = require('@/lib/monitoring');
      
      // Simulate a database error
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      await initializeAuditLogging();
      
      // Should report error
      expect(reportError).toHaveBeenCalledWith(expect.objectContaining({
        component: 'AuditLogger',
        action: 'initializeAuditLogging',
        severity: 'high'
      }));
      
      // Should log error in development
      process.env.NODE_ENV = 'development';
      await initializeAuditLogging();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
