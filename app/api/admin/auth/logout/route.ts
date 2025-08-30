import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, invalidateSession } from '@/lib/middleware/admin-auth'

export const POST = withAdminAuth(async (request: NextRequest, session) => {
  try {
    // Invalidate the session
    const success = invalidateSession(session.sessionId)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the session cookie
    response.cookies.set('nexural-admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/admin'
    })

    return response

  } catch (error: any) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed', details: error.message },
      { status: 500 }
    )
  }
})

export async function GET(request: NextRequest) {
  // Also support GET for logout links
  return POST(request)
}
