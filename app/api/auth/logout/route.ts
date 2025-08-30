import { NextRequest, NextResponse } from 'next/server'
import { logoutUser } from '@/lib/auth/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') 
                   || request.cookies.get('auth_token')?.value

    if (authToken) {
      await logoutUser(authToken)
    }

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    response.cookies.delete('auth_token')
    
    return response

  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 })
  }
}


