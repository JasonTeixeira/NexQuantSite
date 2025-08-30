import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, updateUser } from '@/lib/auth/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') 
                   || request.cookies.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    const user = await getCurrentUser(authToken)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        subscription: user.subscription,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        preferences: user.preferences,
        stats: user.stats,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount
      }
    })

  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') 
                   || request.cookies.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    const user = await getCurrentUser(authToken)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 })
    }

    const updates = await request.json()
    
    // Validate and sanitize updates
    const allowedUpdates = [
      'firstName', 'lastName', 'bio', 'avatar', 
      'preferences'
    ]
    
    const filteredUpdates: any = {}
    for (const key in updates) {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key]
      }
    }

    // Additional validation for specific fields
    if (filteredUpdates.firstName && (typeof filteredUpdates.firstName !== 'string' || filteredUpdates.firstName.length > 50)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid first name',
        errors: { firstName: 'First name must be a string with maximum 50 characters' }
      }, { status: 400 })
    }

    if (filteredUpdates.lastName && (typeof filteredUpdates.lastName !== 'string' || filteredUpdates.lastName.length > 50)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid last name',
        errors: { lastName: 'Last name must be a string with maximum 50 characters' }
      }, { status: 400 })
    }

    if (filteredUpdates.bio && (typeof filteredUpdates.bio !== 'string' || filteredUpdates.bio.length > 500)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid bio',
        errors: { bio: 'Bio must be a string with maximum 500 characters' }
      }, { status: 400 })
    }

    const result = await updateUser(user.id, filteredUpdates)

    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        message: result.message,
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          avatar: result.user.avatar,
          bio: result.user.bio,
          role: result.user.role,
          subscription: result.user.subscription,
          preferences: result.user.preferences,
          updatedAt: result.user.updatedAt
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Update user API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}


