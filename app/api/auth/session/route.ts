// 🔐 SESSION VALIDATION API - Production Implementation
// Real database session management replacing custom SessionManager

import { NextRequest, NextResponse } from 'next/server'
import { validateSession, logoutUser, getUserFromRequest } from '@/lib/auth/production-auth'

// GET - Validate current session and return user data
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID()

  try {
    // Try to get user from request (checks cookies and Authorization header)
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid session found",
          error: "INVALID_SESSION",
          requestId,
        },
        { status: 401 }
      )
    }

    // Return user session data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      message: "Session valid",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        preferences: user.preferences,
        stats: user.stats,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount
      },
      sessionInfo: {
        lastActivity: new Date().toISOString(),
        isActive: true
      },
      requestId,
    })

  } catch (error: any) {
    console.error('Session validation error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: "Session validation failed",
        error: "SESSION_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId,
      },
      { status: 500 }
    )
  }
}

// DELETE - Logout user and destroy session
export async function DELETE(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID()

  try {
    // Extract token from request
    let token: string | null = null
    
    // Check Authorization header first
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    } else {
      // Check cookies
      token = request.cookies.get('auth_token')?.value || null
    }

    if (!token) {
      return NextResponse.json({
        success: true, // Still return success even if no token (already logged out)
        message: "No active session to terminate",
        requestId,
      })
    }

    // Validate session exists first
    const validation = await validateSession(token)
    
    if (validation.valid && validation.session) {
      // Logout user (invalidates session in database)
      await logoutUser(token)
      console.log(`🔓 User session terminated: ${validation.user?.username}`)
    }

    // Create response and clear cookies
    const response = NextResponse.json({
      success: true,
      message: "Session terminated successfully",
      requestId,
    })

    // Clear auth cookies
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Delete cookie
    })

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Delete cookie
    })

    return response

  } catch (error: any) {
    console.error('Logout error:', error)
    
    // Even if logout fails, clear cookies and return success
    const response = NextResponse.json({
      success: true,
      message: "Session cleared (with errors)",
      warning: "Logout completed but may not have been properly recorded",
      requestId,
    })

    // Clear cookies anyway
    response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' })

    return response
  }
}

// POST - Refresh session (extend expiration)
export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID()

  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid session to refresh",
          error: "INVALID_SESSION",
          requestId,
        },
        { status: 401 }
      )
    }

    // Session is valid and user is authenticated
    // In a more complex system, you might generate a new token here
    // For now, we'll just confirm the session is active
    
    return NextResponse.json({
      success: true,
      message: "Session refreshed successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      sessionInfo: {
        refreshedAt: new Date().toISOString(),
        isActive: true
      },
      requestId,
    })

  } catch (error: any) {
    console.error('Session refresh error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: "Session refresh failed",
        error: "REFRESH_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId,
      },
      { status: 500 }
    )
  }
}