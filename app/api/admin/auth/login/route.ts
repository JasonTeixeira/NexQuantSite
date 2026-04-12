// 🔐 SECURE ADMIN AUTHENTICATION (Development Mode)
import { NextRequest, NextResponse } from 'next/server'
import { generateJWT } from '@/lib/auth/production-auth'

// Admin authentication should use database in production
// In development, we can use environment variables for testing
const ADMIN_CREDENTIALS = process.env.NODE_ENV === 'development' ? {
  'admin@nexural.com': process.env.ADMIN_PASSWORD || 'secure_admin_password',
  'manager@nexural.com': process.env.MANAGER_PASSWORD || 'secure_manager_password',
  'demo@nexural.com': process.env.DEMO_ADMIN_PASSWORD || 'secure_demo_password',
  'super@nexural.com': process.env.SUPER_ADMIN_PASSWORD || 'secure_super_password'
} : {}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }
    
    // Check demo credentials
    if (ADMIN_CREDENTIALS[email] === password) {
      // Generate JWT token (without exp since generateJWT adds it)
      const tokenPayload = {
        id: 'admin-' + Date.now(),
        email: email,
        role: email.includes('super') ? 'super_admin' : 'admin'
      }
      
      const sessionToken = generateJWT(tokenPayload)
      
      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: tokenPayload.id,
          email: email,
          role: tokenPayload.role,
          name: 'Admin User'
        },
        token: sessionToken
      })
      
      // Set admin session cookie
      response.cookies.set('admin_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24 hours
      })
      
      return response
    }
    
    // Try production authentication as fallback
    try {
      const { authenticateUser } = await import('@/lib/auth/production-auth')
      const result = await authenticateUser({ email, password })
      
      if (result.success && result.user) {
        if (result.user.role !== 'admin' && result.user.role !== 'super_admin') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }
        
        const response = NextResponse.json({
          success: true,
          message: 'Admin login successful',
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            name: result.user.firstName + ' ' + result.user.lastName
          },
          token: result.session?.sessionToken
        })
        
        if (result.session?.sessionToken) {
          response.cookies.set('admin_token', result.session.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 // 24 hours
          })
        }
        
        return response
      }
    } catch (prodError) {
      console.log('Production auth not available, using demo mode')
    }
    
    return NextResponse.json(
      { error: 'Invalid admin credentials' },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('Admin login error:', error.message || error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
