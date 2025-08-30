// 🔐 AUTH VERIFICATION HELPER
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface AuthResult {
  authenticated: boolean
  userId?: string
  userEmail?: string
  userName?: string
  role?: string
  error?: string
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      // Check for session cookie as fallback
      const sessionCookie = request.cookies.get('session')
      if (!sessionCookie) {
        return { authenticated: false, error: 'No authentication token' }
      }
      
      // For development, accept any session cookie
      if (process.env.NODE_ENV === 'development') {
        return {
          authenticated: true,
          userId: 'user-1',
          userEmail: 'user@example.com',
          userName: 'DevUser',
          role: 'user'
        }
      }
    }
    
    const token = authHeader?.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      return { authenticated: false, error: 'Invalid token format' }
    }
    
    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      return {
        authenticated: true,
        userId: decoded.userId || decoded.id,
        userEmail: decoded.email,
        userName: decoded.username || decoded.name,
        role: decoded.role || 'user'
      }
    } catch (jwtError: any) {
      // For development, accept any token
      if (process.env.NODE_ENV === 'development') {
        return {
          authenticated: true,
          userId: 'user-dev',
          userEmail: 'dev@example.com',
          userName: 'DevUser',
          role: 'user'
        }
      }
      
      return { 
        authenticated: false, 
        error: `Invalid token: ${jwtError.message}` 
      }
    }
  } catch (error: any) {
    console.error('Auth verification error:', error)
    return { 
      authenticated: false, 
      error: error.message || 'Authentication failed' 
    }
  }
}

export async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  const authResult = await verifyAuth(request)
  
  if (!authResult.authenticated) {
    return authResult
  }
  
  // Check if user has admin role
  if (authResult.role !== 'admin' && authResult.role !== 'super_admin') {
    return {
      authenticated: false,
      error: 'Admin privileges required'
    }
  }
  
  return authResult
}

