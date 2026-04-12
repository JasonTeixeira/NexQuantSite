// 👤 USER PROFILE API
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Mock user profile data
    const profile = {
      id: authResult.userId || 'user-1',
      email: authResult.userEmail || 'user@example.com',
      username: authResult.userName || 'username',
      firstName: 'John',
      lastName: 'Doe',
      avatar: '/avatars/default.jpg',
      bio: 'Professional trader with 5 years of experience',
      role: authResult.role || 'user',
      joinedAt: '2024-01-01T00:00:00Z',
      stats: {
        totalTrades: 150,
        winRate: 68.5,
        totalProfit: 12450.50,
        followers: 234,
        following: 89,
        posts: 45,
        badges: ['verified', 'pro-trader', 'top-contributor']
      },
      preferences: {
        theme: 'dark',
        emailNotifications: true,
        pushNotifications: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York'
      },
      subscription: {
        tier: 'premium',
        status: 'active',
        expiresAt: '2024-12-31T23:59:59Z'
      }
    }
    
    return NextResponse.json({
      success: true,
      profile
    })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const updates = await request.json()
    
    // Mock update (in production, this would update the database)
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      updates
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

