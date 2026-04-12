import { NextRequest, NextResponse } from 'next/server'
import { mockLeaderboardData, mockLeaderboardStats } from '@/lib/leaderboard-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const timeframe = searchParams.get('timeframe') || 'all-time'
  const category = searchParams.get('category') || 'overall'
  const region = searchParams.get('region') || 'all'
  const level = searchParams.get('level') || 'all'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    // Filter data based on parameters
    let filteredData = [...mockLeaderboardData]

    // Apply search filter
    if (search) {
      filteredData = filteredData.filter(user => 
        user.displayName.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply level filter
    if (level !== 'all') {
      filteredData = filteredData.filter(user => 
        user.level.toLowerCase() === level.toLowerCase()
      )
    }

    // Apply region filter (if country data is available and user allows it)
    if (region !== 'all') {
      filteredData = filteredData.filter(user => 
        user.privacy.showCountry && user.country && 
        getRegionFromCountry(user.country) === region
      )
    }

    // Sort by category
    switch (category) {
      case 'profit':
        filteredData.sort((a, b) => b.monthlyReturn - a.monthlyReturn)
        break
      case 'winrate':
        filteredData.sort((a, b) => b.winRate - a.winRate)
        break
      case 'volume':
        filteredData.sort((a, b) => b.totalTrades - a.totalTrades)
        break
      default:
        filteredData.sort((a, b) => b.points - a.points)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filteredData.slice(startIndex, endIndex)

    // Update ranks based on filtered/sorted data
    const dataWithUpdatedRanks = paginatedData.map((user, index) => ({
      ...user,
      rank: startIndex + index + 1
    }))

    return NextResponse.json({
      success: true,
      data: dataWithUpdatedRanks,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit)
      },
      stats: mockLeaderboardStats,
      filters: {
        timeframe,
        category,
        region,
        level,
        search
      }
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, data } = body

    switch (action) {
      case 'join_competition':
        // Handle competition joining logic
        return NextResponse.json({
          success: true,
          message: 'Successfully joined competition'
        })

      case 'update_privacy':
        // Handle privacy settings update
        return NextResponse.json({
          success: true,
          message: 'Privacy settings updated'
        })

      case 'follow_user':
        // Handle user following logic
        return NextResponse.json({
          success: true,
          message: 'User followed successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Leaderboard POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function getRegionFromCountry(country: string): string {
  const regions: { [key: string]: string } = {
    'US': 'us',
    'CA': 'us',
    'GB': 'eu',
    'DE': 'eu',
    'FR': 'eu',
    'IT': 'eu',
    'ES': 'eu',
    'NL': 'eu',
    'RU': 'eu',
    'JP': 'asia',
    'KR': 'asia',
    'CN': 'asia',
    'SG': 'asia',
    'HK': 'asia',
    'AU': 'asia'
  }
  return regions[country] || 'all'
}
