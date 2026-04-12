import { NextRequest, NextResponse } from 'next/server'
import { mockLeaderboardData } from '@/lib/leaderboard-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params
    const userId = resolvedParams.userId
    const user = mockLeaderboardData.find(u => u.id === userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data based on privacy settings
    const publicData = {
      id: user.id,
      rank: user.rank,
      displayName: user.displayName,
      username: user.username,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      badge: user.badge,
      verified: user.verified,
      achievements: user.achievements,
      joinedDate: user.joinedDate,
      lastActive: user.lastActive,
      ...(user.privacy.showStats && {
        winRate: user.winRate,
        profitFactor: user.profitFactor,
        monthlyReturn: user.monthlyReturn,
        totalTrades: user.totalTrades,
        streak: user.streak,
        performance: user.performance
      }),
      ...(user.privacy.showCountry && {
        country: user.country
      }),
      socialStats: user.socialStats
    }

    return NextResponse.json({
      success: true,
      data: publicData
    })
  } catch (error) {
    console.error('User profile API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params
    const userId = resolvedParams.userId
    const body = await request.json()
    const { privacy, settings } = body

    // In a real app, you would update the user's settings in the database
    // For now, we'll just return a success response

    return NextResponse.json({
      success: true,
      message: 'User settings updated successfully'
    })
  } catch (error) {
    console.error('User settings update API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}
