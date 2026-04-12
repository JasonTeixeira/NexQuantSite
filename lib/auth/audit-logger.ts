/**
 * 📝 AUDIT LOGGING SERVICE
 * Comprehensive logging for authentication and security events
 */

import { db } from '@/lib/database/database';
import { reportError } from '@/lib/monitoring';
import { NextRequest } from 'next/server';

// Event categories for better filtering and analysis
export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  USER_MANAGEMENT = 'user-management',
  DATA_ACCESS = 'data-access',
  SYSTEM = 'system',
  ADMIN = 'admin'
}

// Event types for specific actions
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login-success',
  LOGIN_FAILURE = 'login-failure',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token-refresh',
  TOKEN_INVALIDATED = 'token-invalidated',
  PASSWORD_RESET_REQUEST = 'password-reset-request',
  PASSWORD_RESET_COMPLETE = 'password-reset-complete',
  EMAIL_VERIFICATION = 'email-verification',
  TWO_FACTOR_SUCCESS = 'two-factor-success',
  TWO_FACTOR_FAILURE = 'two-factor-failure',
  
  // Authorization events
  ACCESS_DENIED = 'access-denied',
  PERMISSION_CHANGED = 'permission-changed',
  ROLE_ASSIGNED = 'role-assigned',
  
  // User management events
  USER_CREATED = 'user-created',
  USER_UPDATED = 'user-updated',
  USER_DELETED = 'user-deleted',
  PASSWORD_CHANGED = 'password-changed',
  PROFILE_UPDATED = 'profile-updated',
  
  // Data access events
  SENSITIVE_DATA_ACCESS = 'sensitive-data-access',
  DATA_EXPORT = 'data-export',
  
  // System events
  RATE_LIMIT_EXCEEDED = 'rate-limit-exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious-activity',
  SYSTEM_ERROR = 'system-error',
  
  // Admin events
  ADMIN_ACTION = 'admin-action',
  CONFIGURATION_CHANGED = 'configuration-changed'
}

// Severity levels for events
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Status for events
export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  BLOCKED = 'blocked',
  ATTEMPTED = 'attempted'
}

// Audit log entry interface
export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  category: AuditCategory;
  eventType: AuditEventType;
  status: AuditStatus;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  try {
    const timestamp = new Date();
    const auditLog: AuditLogEntry = {
      ...entry,
      timestamp,
      details: entry.details || {},
      metadata: entry.metadata || {}
    };
    
    // Store in database
    await db.query(
      `
      INSERT INTO audit_logs (
        timestamp, user_id, session_id, category, event_type, 
        status, severity, ip_address, user_agent, details, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      `,
      [
        auditLog.timestamp,
        auditLog.userId || null,
        auditLog.sessionId || null,
        auditLog.category,
        auditLog.eventType,
        auditLog.status,
        auditLog.severity,
        auditLog.ipAddress || null,
        auditLog.userAgent || null,
        JSON.stringify(auditLog.details),
        JSON.stringify(auditLog.metadata)
      ]
    );
    
    // For critical events, also report to monitoring system
    if (auditLog.severity === AuditSeverity.CRITICAL) {
      reportError({
        component: 'AuditLogger',
        action: auditLog.eventType,
        error: new Error(`Critical audit event: ${auditLog.eventType}`),
        context: {
          userId: auditLog.userId,
          category: auditLog.category,
          details: auditLog.details
        },
        severity: 'critical'
      });
    }
    
    // For development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 AUDIT [${auditLog.severity}] [${auditLog.category}:${auditLog.eventType}]`, {
        user: auditLog.userId,
        status: auditLog.status,
        details: auditLog.details
      });
    }
  } catch (error) {
    // Report error but don't fail the application
    reportError({
      component: 'AuditLogger',
      action: 'logAuditEvent',
      error,
      context: { entry },
      severity: 'high'
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error logging audit event:', error);
    }
  }
}

/**
 * Extract request information for audit logging
 */
export function getRequestInfo(req: NextRequest): {
  ipAddress: string;
  userAgent: string;
} {
  // Extract IP address
  let ipAddress = req.headers.get('x-forwarded-for') || 
                  req.headers.get('x-real-ip') || 
                  'unknown';
  
  // If x-forwarded-for contains multiple IPs, take the first one
  if (typeof ipAddress === 'string' && ipAddress.includes(',')) {
    ipAddress = ipAddress.split(',')[0].trim();
  }
  
  // Extract user agent
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

/**
 * Log authentication success
 */
export async function logAuthSuccess(
  req: NextRequest,
  userId: string,
  sessionId: string,
  details?: Record<string, any>
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  
  await logAuditEvent({
    userId,
    sessionId,
    category: AuditCategory.AUTHENTICATION,
    eventType: AuditEventType.LOGIN_SUCCESS,
    status: AuditStatus.SUCCESS,
    severity: AuditSeverity.INFO,
    ipAddress,
    userAgent,
    details
  });
}

/**
 * Log authentication failure
 */
export async function logAuthFailure(
  req: NextRequest,
  attemptedUsername?: string,
  reason?: string,
  details?: Record<string, any>
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  
  await logAuditEvent({
    category: AuditCategory.AUTHENTICATION,
    eventType: AuditEventType.LOGIN_FAILURE,
    status: AuditStatus.FAILURE,
    severity: AuditSeverity.WARNING,
    ipAddress,
    userAgent,
    details: {
      ...details,
      attemptedUsername,
      reason
    }
  });
}

/**
 * Log logout event
 */
export async function logLogout(
  req: NextRequest,
  userId: string,
  sessionId: string
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  
  await logAuditEvent({
    userId,
    sessionId,
    category: AuditCategory.AUTHENTICATION,
    eventType: AuditEventType.LOGOUT,
    status: AuditStatus.SUCCESS,
    severity: AuditSeverity.INFO,
    ipAddress,
    userAgent
  });
}

/**
 * Log token refresh
 */
export async function logTokenRefresh(
  req: NextRequest,
  userId: string,
  sessionId: string,
  success: boolean
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  
  await logAuditEvent({
    userId,
    sessionId,
    category: AuditCategory.AUTHENTICATION,
    eventType: AuditEventType.TOKEN_REFRESH,
    status: success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
    severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    ipAddress,
    userAgent
  });
}

/**
 * Log access denied
 */
export async function logAccessDenied(
  req: NextRequest,
  userId?: string,
  resource?: string,
  reason?: string
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  
  await logAuditEvent({
    userId,
    category: AuditCategory.AUTHORIZATION,
    eventType: AuditEventType.ACCESS_DENIED,
    status: AuditStatus.BLOCKED,
    severity: AuditSeverity.WARNING,
    ipAddress,
    userAgent,
    details: {
      resource,
      reason
    }
  });
}

/**
 * Log password change
 */
export async function logPasswordChange(
  req: NextRequest,
  userId: string,
  success: boolean,
  reason?: string
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  
  await logAuditEvent({
    userId,
    category: AuditCategory.USER_MANAGEMENT,
    eventType: AuditEventType.PASSWORD_CHANGED,
    status: success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
    severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    ipAddress,
    userAgent,
    details: { reason }
  });
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  req: NextRequest,
  userId?: string,
  limitType?: string
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  
  await logAuditEvent({
    userId,
    category: AuditCategory.SYSTEM,
    eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
    status: AuditStatus.BLOCKED,
    severity: AuditSeverity.WARNING,
    ipAddress,
    userAgent,
    details: { limitType }
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  req: NextRequest,
  userId?: string,
  activityType?: string,
  details?: Record<string, any>
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  
  await logAuditEvent({
    userId,
    category: AuditCategory.SYSTEM,
    eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
    status: AuditStatus.BLOCKED,
    severity: AuditSeverity.ERROR,
    ipAddress,
    userAgent,
    details: {
      ...details,
      activityType
    }
  });
}

/**
 * Search audit logs with filtering
 */
export async function searchAuditLogs(options: {
  userId?: string;
  sessionId?: string;
  category?: AuditCategory;
  eventType?: AuditEventType;
  status?: AuditStatus;
  severity?: AuditSeverity;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  try {
    // Build query conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (options.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(options.userId);
    }
    
    if (options.sessionId) {
      conditions.push(`session_id = $${paramIndex++}`);
      params.push(options.sessionId);
    }
    
    if (options.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(options.category);
    }
    
    if (options.eventType) {
      conditions.push(`event_type = $${paramIndex++}`);
      params.push(options.eventType);
    }
    
    if (options.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(options.status);
    }
    
    if (options.severity) {
      conditions.push(`severity = $${paramIndex++}`);
      params.push(options.severity);
    }
    
    if (options.ipAddress) {
      conditions.push(`ip_address = $${paramIndex++}`);
      params.push(options.ipAddress);
    }
    
    if (options.startDate) {
      conditions.push(`timestamp >= $${paramIndex++}`);
      params.push(options.startDate);
    }
    
    if (options.endDate) {
      conditions.push(`timestamp <= $${paramIndex++}`);
      params.push(options.endDate);
    }
    
    // Build WHERE clause
    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';
    
    // Build ORDER BY clause
    const sortBy = options.sortBy || 'timestamp';
    const sortOrder = options.sortOrder || 'desc';
    const orderByClause = `ORDER BY ${sortBy} ${sortOrder}`;
    
    // Build LIMIT/OFFSET clause
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    const limitClause = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM audit_logs
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0]?.count || '0');
    
    // Get logs
    const query = `
      SELECT *
      FROM audit_logs
      ${whereClause}
      ${orderByClause}
      ${limitClause}
    `;
    
    const result = await db.query(query, params);
    
    // Transform rows to AuditLogEntry objects
    const logs = result.rows.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      userId: row.user_id,
      sessionId: row.session_id,
      category: row.category as AuditCategory,
      eventType: row.event_type as AuditEventType,
      status: row.status as AuditStatus,
      severity: row.severity as AuditSeverity,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));
    
    return { logs, total };
  } catch (error) {
    reportError({
      component: 'AuditLogger',
      action: 'searchAuditLogs',
      error,
      context: { options },
      severity: 'medium'
    });
    
    return { logs: [], total: 0 };
  }
}

/**
 * Initialize audit logging system (creates necessary database tables)
 */
export async function initializeAuditLogging(): Promise<void> {
  try {
    // Check if audit_logs table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'audit_logs'
      ) as exists
    `);
    
    const tableExists = tableCheck.rows[0]?.exists;
    
    if (!tableExists) {
      // Create audit_logs table
      await db.query(`
        CREATE TABLE audit_logs (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP NOT NULL,
          user_id VARCHAR(100),
          session_id VARCHAR(100),
          category VARCHAR(50) NOT NULL,
          event_type VARCHAR(50) NOT NULL,
          status VARCHAR(20) NOT NULL,
          severity VARCHAR(20) NOT NULL,
          ip_address VARCHAR(50),
          user_agent TEXT,
          details JSONB DEFAULT '{}',
          metadata JSONB DEFAULT '{}'
        )
      `);
      
      // Create indexes
      await db.query(`CREATE INDEX idx_audit_timestamp ON audit_logs (timestamp)`);
      await db.query(`CREATE INDEX idx_audit_user_id ON audit_logs (user_id)`);
      await db.query(`CREATE INDEX idx_audit_category ON audit_logs (category)`);
      await db.query(`CREATE INDEX idx_audit_event_type ON audit_logs (event_type)`);
      await db.query(`CREATE INDEX idx_audit_severity ON audit_logs (severity)`);
      
      console.log('✅ Audit logging system initialized');
    }
  } catch (error) {
    reportError({
      component: 'AuditLogger',
      action: 'initializeAuditLogging',
      error,
      severity: 'high'
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Failed to initialize audit logging system:', error);
    }
  }
}

export default {
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
};
