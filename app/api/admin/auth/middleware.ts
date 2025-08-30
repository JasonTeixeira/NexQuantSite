/**
 * 🛡️ ADMIN ROUTE PROTECTION MIDDLEWARE
 * Secures all admin routes with authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminUserFromRequest, requirePermission, requireRole, AdminRole, Permission, AdminAuthError } from '@/lib/auth/admin-auth'

export interface ProtectedRouteConfig {
  requiredPermission?: Permission
  requiredRole?: AdminRole
  allowPublic?: boolean
}

/**
 * Protect admin route with authentication and authorization
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse> | NextResponse,
  config: ProtectedRouteConfig = {}
) {
  return async (request: NextRequest) => {
    try {
      // Skip auth for public routes
      if (config.allowPublic) {
        return handler(request, null)
      }
      
      // Get authenticated user
      const user = getAdminUserFromRequest(request)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' }, 
          { status: 401 }
        )
      }
      
      // Check required permission
      if (config.requiredPermission) {
        requirePermission(user, config.requiredPermission)
      }
      
      // Check required role
      if (config.requiredRole) {
        requireRole(user, config.requiredRole)
      }
      
      // Call the actual handler
      return handler(request, user)
      
    } catch (error) {
      console.error('Admin route protection error:', error)
      
      if (error instanceof AdminAuthError) {
        const status = error.code === 'NOT_AUTHENTICATED' ? 401 : 403
        return NextResponse.json({ error: error.message }, { status })
      }
      
      return NextResponse.json(
        { error: 'Access denied' }, 
        { status: 403 }
      )
    }
  }
}

/**
 * Admin route configurations by path
 */
export const ADMIN_ROUTE_CONFIGS: Record<string, ProtectedRouteConfig> = {
  // Authentication (public)
  '/api/admin/auth/login': { allowPublic: true },
  
  // Dashboard (any authenticated admin)
  '/api/admin/dashboard': {},
  
  // User Management
  '/api/admin/users': { requiredPermission: Permission.USER_MANAGEMENT },
  '/api/admin/roles': { requiredPermission: Permission.ROLE_MANAGEMENT },
  
  // Content Management
  '/api/admin/blog': { requiredPermission: Permission.BLOG_MANAGEMENT },
  '/api/admin/content': { requiredPermission: Permission.CONTENT_MANAGEMENT },
  
  // Analytics (view only)
  '/api/admin/analytics': { requiredPermission: Permission.ANALYTICS_VIEW },
  
  // Financial (restricted)
  '/api/admin/billing': { requiredPermission: Permission.BILLING_MANAGEMENT },
  '/api/admin/referrals': { requiredPermission: Permission.REFERRAL_MANAGEMENT },
  
  // System Administration (high-level only)
  '/api/admin/security': { requiredRole: AdminRole.ADMIN },
  '/api/admin/system': { requiredRole: AdminRole.ADMIN },
  '/api/admin/disaster-recovery': { requiredPermission: Permission.DISASTER_RECOVERY },
  
  // Super Admin Only
  '/api/admin/settings': { requiredRole: AdminRole.SUPER_ADMIN },
  '/api/admin/audit': { requiredRole: AdminRole.SUPER_ADMIN }
}

/**
 * Get route configuration by path
 */
export function getRouteConfig(pathname: string): ProtectedRouteConfig {
  // Check exact matches first
  if (ADMIN_ROUTE_CONFIGS[pathname]) {
    return ADMIN_ROUTE_CONFIGS[pathname]
  }
  
  // Check for pattern matches
  for (const [pattern, config] of Object.entries(ADMIN_ROUTE_CONFIGS)) {
    if (pathname.startsWith(pattern)) {
      return config
    }
  }
  
  // Default: require authentication but no specific permissions
  return {}
}

/**
 * Log admin access for security monitoring
 */
export function logAdminAccess(request: NextRequest, user: any, allowed: boolean) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname,
    userEmail: user?.email || 'anonymous',
    userRole: user?.role || 'none',
    allowed,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  }
  
  console.log(`[ADMIN_ACCESS] ${allowed ? 'ALLOWED' : 'DENIED'}:`, logData)
  
  // In production, this would go to a security monitoring system
}


