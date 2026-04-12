/**
 * 🔐 AUTHENTICATION MIDDLEWARE
 * Route protection with JWT token validation and role-based access control
 */

import { NextRequest, NextResponse } from 'next/server';
import jwtService, { TokenType } from '@/lib/auth/jwt-service';
import auditLogger, { AuditCategory, AuditEventType, AuditStatus, AuditSeverity } from '@/lib/auth/audit-logger';
import { db } from '@/lib/database/database';

// Token cookie name
const ACCESS_TOKEN_COOKIE = 'nexural-access-token';

// User roles for access control
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin',
  SYSTEM = 'system'
}

// Middleware options
export interface AuthMiddlewareOptions {
  // Required role to access the route (default: USER)
  requiredRole?: UserRole;
  
  // Allow public access (no auth required) if true
  allowPublic?: boolean;
  
  // Allow unauthenticated requests (will set req.user to null but not reject)
  optional?: boolean;
  
  // Whether to verify the session in the database (more secure but slower)
  verifySession?: boolean;
}

// Default options
const DEFAULT_OPTIONS: AuthMiddlewareOptions = {
  requiredRole: UserRole.USER,
  allowPublic: false,
  optional: false,
  verifySession: true
};

// User object that will be attached to the request
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  sessionId: string;
  subscriptionTier?: string;
  permissions?: string[];
  name?: string;
}

/**
 * Helper to get token from request
 */
function getTokenFromRequest(req: NextRequest): string | null {
  // Try from cookies
  const cookieValue = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (cookieValue) return cookieValue;
  
  // Try from authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * Check if a user role meets the required role level
 */
function hasRequiredRole(userRole: string, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.GUEST]: 0,
    [UserRole.USER]: 1,
    [UserRole.PREMIUM]: 2,
    [UserRole.ADMIN]: 3,
    [UserRole.SYSTEM]: 4
  };
  
  const userRoleLevel = roleHierarchy[userRole as UserRole] ?? roleHierarchy[UserRole.GUEST];
  const requiredRoleLevel = roleHierarchy[requiredRole];
  
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Create an authentication middleware with the given options
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return async function authMiddleware(
    req: NextRequest
  ): Promise<NextResponse | null> {
    try {
      // If public access is allowed, skip authentication
      if (mergedOptions.allowPublic) {
        return null; // Continue to next middleware/handler
      }
      
      // Get token from request
      const token = getTokenFromRequest(req);
      
      // If no token and authentication is required, return unauthorized
      if (!token && !mergedOptions.optional) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // If no token but authentication is optional, continue
      if (!token && mergedOptions.optional) {
        return null; // Continue to next middleware/handler
      }
      
      // Validate token
      const tokenValidation = await jwtService.validateToken(token!, TokenType.ACCESS);
      if (!tokenValidation.valid || !tokenValidation.payload) {
        if (!mergedOptions.optional) {
          return NextResponse.json(
            { success: false, message: 'Invalid token', error: tokenValidation.error },
            { status: 401 }
          );
        } else {
          return null; // Continue to next middleware/handler if auth is optional
        }
      }
      
      const { userId, sessionId, role, email, subscriptionTier } = tokenValidation.payload;
      
      // Verify session in database if required
      if (mergedOptions.verifySession) {
        const sessionResult = await db.query(
          `SELECT * FROM sessions WHERE id = $1 AND user_id = $2 AND is_active = true LIMIT 1`,
          [sessionId, userId]
        );
        
        if (sessionResult.rowCount === 0) {
          if (!mergedOptions.optional) {
            // Log invalid session
            await auditLogger.logAuditEvent({
              userId,
              sessionId,
              category: AuditCategory.AUTHENTICATION,
              eventType: AuditEventType.ACCESS_DENIED,
              status: AuditStatus.BLOCKED,
              severity: AuditSeverity.WARNING,
              details: { reason: 'Invalid session' }
            });
            
            return NextResponse.json(
              { success: false, message: 'Invalid session' },
              { status: 401 }
            );
          } else {
            return null; // Continue if auth is optional
          }
        }
      }
      
      // Check role requirements
      if (mergedOptions.requiredRole && !hasRequiredRole(role || 'guest', mergedOptions.requiredRole)) {
        // Log access denied
        await auditLogger.logAccessDenied(req, userId, req.nextUrl.pathname, 'Insufficient permissions');
        
        return NextResponse.json(
          { success: false, message: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      // Create authenticated user object
      const user: AuthenticatedUser = {
        id: userId,
        email: email || '',
        role: role || 'user',
        sessionId,
        subscriptionTier
      };
      
      // Set user in request headers for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', userId);
      requestHeaders.set('x-user-role', user.role);
      requestHeaders.set('x-session-id', sessionId);
      
      // Create a new request with the updated headers
      const modifiedRequest = new NextRequest(req.url, {
        method: req.method,
        headers: requestHeaders,
        body: req.body
      });
      
      // Continue to next middleware/handler with modified request
      return NextResponse.next({
        request: modifiedRequest
      });
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      // Only block the request if authentication is required
      if (!mergedOptions.optional) {
        return NextResponse.json(
          { success: false, message: 'Authentication failed' },
          { status: 500 }
        );
      } else {
        return null; // Continue if auth is optional
      }
    }
  };
}

/**
 * Get authenticated user from request
 */
export function getAuthenticatedUser(req: NextRequest): AuthenticatedUser | null {
  const userId = req.headers.get('x-user-id');
  const role = req.headers.get('x-user-role');
  const sessionId = req.headers.get('x-session-id');
  const email = req.headers.get('x-user-email');
  
  if (!userId || !role || !sessionId) {
    return null;
  }
  
  return {
    id: userId,
    email: email || '',
    role,
    sessionId
  };
}

/**
 * Higher-order function to create a protected API route handler
 */
export function withAuth<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: AuthMiddlewareOptions = {}
): (...args: Parameters<T>) => Promise<NextResponse> {
  const authMiddleware = createAuthMiddleware(options);
  
  return async function protectedHandler(...args: Parameters<T>): Promise<NextResponse> {
    const req = args[0] as NextRequest;
    
    // Run auth middleware
    const middlewareResult = await authMiddleware(req);
    
    // If middleware returns a response, return it
    if (middlewareResult) {
      return middlewareResult;
    }
    
    // Otherwise, continue to handler
    return handler(...args);
  };
}

export default {
  createAuthMiddleware,
  getAuthenticatedUser,
  withAuth,
  UserRole
};
