/**
 * 🔒 ADMIN SECURITY MIDDLEWARE
 * Protects admin routes from unauthorized access
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './auth/production-auth';
import { adminAuthRateLimiter } from './rate-limiter';

// Types for admin roles
type AdminRole = 'admin' | 'super_admin';

/**
 * Verify if the user has admin privileges
 * @param req Next.js request
 * @returns NextResponse or null if authorized
 */
export async function verifyAdminAccess(req: NextRequest): Promise<NextResponse | null> {
  try {
    // First apply rate limiting
    const rateLimitResponse = await adminAuthRateLimiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get token from cookies or Authorization header
    const token = req.cookies.get('admin_token')?.value || 
                  req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          message: 'Admin access requires authentication'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Verify token
    const payload = verifyJWT(token);
    
    if (!payload) {
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid or expired token',
          message: 'Please log in again to continue'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Check for admin role
    const role = payload.role as string;
    const validAdminRoles: AdminRole[] = ['admin', 'super_admin'];
    
    if (!role || !validAdminRoles.includes(role as AdminRole)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Insufficient permissions',
          message: 'Admin privileges required'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Add user info to request headers for downstream usage
    req.headers.set('X-User-ID', payload.id);
    req.headers.set('X-User-Role', role);
    req.headers.set('X-User-Email', payload.email);
    
    // User is authenticated and authorized as admin
    return null;
  } catch (error) {
    console.error('Admin authorization error:', error);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Authentication error',
        message: 'An error occurred during authentication'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

/**
 * Check if a specific action requires super admin privileges
 * @param action The action being performed
 * @returns Whether super admin is required
 */
export function requiresSuperAdmin(action: string): boolean {
  const superAdminActions = [
    'deleteUser',
    'resetSystem',
    'configureSystem',
    'addAdmin',
    'removeAdmin',
    'updatePermissions'
  ];
  
  return superAdminActions.includes(action);
}

/**
 * Verify if the user has super admin privileges
 * @param req Next.js request
 * @param action Optional action being performed
 * @returns NextResponse or null if authorized
 */
export async function verifySuperAdminAccess(
  req: NextRequest, 
  action?: string
): Promise<NextResponse | null> {
  // First verify admin access
  const adminCheck = await verifyAdminAccess(req);
  if (adminCheck) {
    return adminCheck;
  }
  
  // Get role from headers (set by verifyAdminAccess)
  const role = req.headers.get('X-User-Role');
  
  if (role !== 'super_admin') {
    return new NextResponse(
      JSON.stringify({
        error: 'Insufficient permissions',
        message: action 
          ? `The action "${action}" requires super admin privileges` 
          : 'Super admin privileges required'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  
  // User is authenticated and authorized as super admin
  return null;
}

/**
 * Middleware factory for admin routes
 * @param options Configuration options
 * @returns Middleware function
 */
export function createAdminMiddleware(options: {
  requireSuperAdmin?: boolean;
  action?: string;
}) {
  return async function adminMiddleware(req: NextRequest) {
    // Check if super admin is required
    if (options.requireSuperAdmin || (options.action && requiresSuperAdmin(options.action))) {
      return await verifySuperAdminAccess(req, options.action);
    } else {
      return await verifyAdminAccess(req);
    }
  };
}

// Export a default admin middleware
export const adminMiddleware = createAdminMiddleware({});

// Export a super admin middleware
export const superAdminMiddleware = createAdminMiddleware({ requireSuperAdmin: true });
