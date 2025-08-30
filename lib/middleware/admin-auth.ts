/**
 * Admin Authentication Middleware
 * Enhanced session management and role-based access control
 */

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export interface AdminSession {
  userId: string
  role: 'admin' | 'super_admin'
  permissions: string[]
  sessionId: string
  expiresAt: number
  lastActivity: number
  ipAddress?: string
  userAgent?: string
}

interface AuthResult {
  success: boolean
  session?: AdminSession
  error?: string
  statusCode?: number
}

// Mock admin users for development - replace with real user management
const ADMIN_USERS = new Map<string, {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  permissions: string[]
  passwordHash?: string
}>([
  ['admin@nexural.com', {
    id: 'admin-1',
    email: 'admin@nexural.com',
    role: 'admin',
    permissions: [
      'cost-monitor:read',
      'cost-monitor:write',
      'user-management:read',
      'analytics:read',
      'billing:read'
    ]
  }],
  ['super@nexural.com', {
    id: 'super-1', 
    email: 'super@nexural.com',
    role: 'super_admin',
    permissions: [
      'cost-monitor:read',
      'cost-monitor:write',
      'user-management:read',
      'user-management:write',
      'analytics:read',
      'analytics:write',
      'billing:read',
      'billing:write',
      'system:admin'
    ]
  }]
])

// Active sessions store - use Redis in production
const activeSessions = new Map<string, AdminSession>()

/**
 * Enhanced admin authentication check
 */
export async function authenticateAdmin(request: NextRequest): Promise<AuthResult> {
  try {
    // Check for JWT token in Authorization header
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    
    // Check for session cookie
    const sessionCookie = request.cookies.get('nexural-admin-session')?.value
    
    // Check for development override (remove in production)
    const devOverride = request.headers.get('x-dev-admin') === 'true'
    
    if (devOverride && process.env.NODE_ENV === 'development') {
      return {
        success: true,
        session: {
          userId: 'dev-admin',
          role: 'super_admin',
          permissions: ['*'],
          sessionId: 'dev-session',
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          lastActivity: Date.now()
        }
      }
    }
    
    let session: AdminSession | null = null
    
    // Try JWT validation first
    if (bearerToken) {
      session = await validateJWT(bearerToken)
    }
    
    // Fallback to session cookie
    if (!session && sessionCookie) {
      session = activeSessions.get(sessionCookie)
    }
    
    if (!session) {
      return {
        success: false,
        error: 'No valid session found',
        statusCode: 401
      }
    }
    
    // Check session expiration
    if (session.expiresAt < Date.now()) {
      activeSessions.delete(session.sessionId)
      return {
        success: false,
        error: 'Session expired',
        statusCode: 401
      }
    }
    
    // Check for suspicious activity (optional)
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    if (session.ipAddress && session.ipAddress !== clientIP) {
      // Log security event
      console.warn(`Admin session IP mismatch: ${session.sessionId}`, {
        original: session.ipAddress,
        current: clientIP,
        userId: session.userId
      })
    }
    
    // Update last activity
    session.lastActivity = Date.now()
    activeSessions.set(session.sessionId, session)
    
    return {
      success: true,
      session
    }
    
  } catch (error: any) {
    console.error('Admin authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed',
      statusCode: 500
    }
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(session: AdminSession, permission: string): boolean {
  // Super admin or wildcard permission
  if (session.permissions.includes('*') || session.role === 'super_admin') {
    return true
  }
  
  return session.permissions.includes(permission)
}

/**
 * Create admin session
 */
export async function createAdminSession(
  userId: string, 
  email: string,
  request: NextRequest
): Promise<{ session: AdminSession; token: string }> {
  const user = ADMIN_USERS.get(email)
  if (!user) {
    throw new Error('User not found')
  }
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  const session: AdminSession = {
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    sessionId,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    lastActivity: Date.now(),
    ipAddress: clientIP,
    userAgent
  }
  
  // Store session
  activeSessions.set(sessionId, session)
  
  // Create JWT token
  const token = await createJWT(session)
  
  return { session, token }
}

/**
 * Invalidate admin session
 */
export function invalidateSession(sessionId: string): boolean {
  return activeSessions.delete(sessionId)
}

/**
 * Get active sessions (for monitoring)
 */
export function getActiveSessions(): AdminSession[] {
  return Array.from(activeSessions.values())
}

/**
 * JWT token validation
 */
async function validateJWT(token: string): Promise<AdminSession | null> {
  try {
    const secret = process.env.JWT_SECRET || 'nexural-dev-secret-change-in-production'
    const payload = verify(token, secret) as any
    
    if (!payload.sessionId) {
      return null
    }
    
    const session = activeSessions.get(payload.sessionId)
    return session || null
    
  } catch (error) {
    console.error('JWT validation error:', error)
    return null
  }
}

/**
 * Create JWT token
 */
async function createJWT(session: AdminSession): Promise<string> {
  const jwt = await import('jsonwebtoken')
  const secret = process.env.JWT_SECRET || 'nexural-dev-secret-change-in-production'
  
  return jwt.sign({
    sessionId: session.sessionId,
    userId: session.userId,
    role: session.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(session.expiresAt / 1000)
  }, secret)
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.ip
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || clientIP || 'unknown'
}

/**
 * Admin authentication wrapper for API routes
 */
export function withAdminAuth(
  handler: (request: NextRequest, session: AdminSession) => Promise<Response>,
  requiredPermission?: string
) {
  return async (request: NextRequest) => {
    const authResult = await authenticateAdmin(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { 
          error: authResult.error || 'Authentication required',
          code: 'AUTH_REQUIRED'
        }, 
        { status: authResult.statusCode || 401 }
      )
    }
    
    // Check permission if required
    if (requiredPermission && !hasPermission(authResult.session!, requiredPermission)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          required: requiredPermission,
          code: 'INSUFFICIENT_PERMISSIONS'
        }, 
        { status: 403 }
      )
    }
    
    try {
      return await handler(request, authResult.session!)
    } catch (error: any) {
      console.error('Admin API handler error:', error)
      return NextResponse.json(
        { 
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }, 
        { status: 500 }
      )
    }
  }
}

/**
 * Session cleanup (run periodically)
 */
export function cleanupExpiredSessions(): number {
  const now = Date.now()
  let cleanedCount = 0
  
  for (const [sessionId, session] of activeSessions) {
    if (session.expiresAt < now) {
      activeSessions.delete(sessionId)
      cleanedCount++
    }
  }
  
  return cleanedCount
}

// Auto cleanup every 15 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredSessions, 15 * 60 * 1000)
}
