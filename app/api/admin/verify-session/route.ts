import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/production-auth'

export async function POST(request: NextRequest) {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined
    
    // Fallback to admin_token cookie for browser-based checks
    if (!token) {
      token = request.cookies.get('admin_token')?.value
    }
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }
    
    // Verify the JWT token
    const payload = verifyJWT(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if it's an admin role
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Token is valid and user is admin
    return NextResponse.json({
      success: true,
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role
      }
    })
  } catch (error: any) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 401 }
    )
  }
}