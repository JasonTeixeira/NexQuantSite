import { NextRequest, NextResponse } from 'next/server'

// POST - Add or remove reaction to a post
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // In production, verify user authentication
    const userId = 'current-user-id' // Mock
    const { postId } = params
    const body = await request.json()
    const { reactionType } = body

    // Validate reaction type
    const validReactions = ['like', 'love', 'bullish', 'bearish', 'fire', 'thinking', 'genius', 'useful', 'insightful']
    
    if (!reactionType || !validReactions.includes(reactionType)) {
      return NextResponse.json(
        { error: `Invalid reaction type. Must be one of: ${validReactions.join(', ')}` },
        { status: 400 }
      )
    }

    // In production:
    // 1. Check if user already reacted with this type
    // 2. If yes, remove the reaction (toggle off)
    // 3. If no, add the reaction
    // 4. Update post reaction counts
    // 5. Create notification for post author (if not same user)
    
    const mockResponse = {
      postId,
      userId,
      reactionType,
      action: 'added', // or 'removed'
      newCount: 46, // New count for this reaction type
      hasUserReacted: true
    }

    console.log('Processing reaction:', mockResponse)

    return NextResponse.json({
      success: true,
      reaction: mockResponse,
      message: `Reaction ${mockResponse.action} successfully`
    })

  } catch (error: any) {
    console.error('Reactions API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process reaction', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Get all reactions for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const { searchParams } = new URL(request.url)
    const reactionType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Mock reactions data
    const mockReactions = {
      postId,
      totalReactions: 145,
      breakdown: [
        {
          type: 'like',
          count: 45,
          emoji: '👍',
          users: [
            { 
              id: 'user-1', 
              username: 'trader123', 
              displayName: 'Trader 123',
              avatar: '/api/placeholder/30/30',
              reactedAt: '2024-01-20T10:35:00Z'
            },
            { 
              id: 'user-2', 
              username: 'bullish_bob', 
              displayName: 'Bullish Bob',
              avatar: '/api/placeholder/30/30',
              reactedAt: '2024-01-20T10:42:00Z'
            },
            { 
              id: 'user-3', 
              username: 'chart_master', 
              displayName: 'Chart Master',
              avatar: '/api/placeholder/30/30',
              reactedAt: '2024-01-20T10:58:00Z'
            }
          ]
        },
        {
          type: 'bullish',
          count: 32,
          emoji: '🚀',
          users: [
            { 
              id: 'current-user', 
              username: 'current_user', 
              displayName: 'Current User',
              avatar: '/api/placeholder/30/30',
              reactedAt: '2024-01-20T10:31:00Z'
            },
            { 
              id: 'user-4', 
              username: 'bull_runner', 
              displayName: 'Bull Runner',
              avatar: '/api/placeholder/30/30',
              reactedAt: '2024-01-20T11:15:00Z'
            }
          ]
        },
        {
          type: 'fire',
          count: 18,
          emoji: '🔥',
          users: [
            { 
              id: 'user-5', 
              username: 'momentum_trader', 
              displayName: 'Momentum Trader',
              avatar: '/api/placeholder/30/30',
              reactedAt: '2024-01-20T11:30:00Z'
            }
          ]
        },
        {
          type: 'thinking',
          count: 5,
          emoji: '🤔',
          users: []
        },
        {
          type: 'genius',
          count: 12,
          emoji: '🧠',
          users: []
        }
      ],
      recentReactions: [
        {
          id: 'reaction-1',
          type: 'bullish',
          user: {
            username: 'momentum_king',
            displayName: 'Momentum King',
            avatar: '/api/placeholder/30/30'
          },
          reactedAt: '2024-01-20T14:22:00Z'
        },
        {
          id: 'reaction-2',
          type: 'fire',
          user: {
            username: 'day_trader_pro',
            displayName: 'Day Trader Pro',
            avatar: '/api/placeholder/30/30'
          },
          reactedAt: '2024-01-20T14:18:00Z'
        },
        {
          id: 'reaction-3',
          type: 'like',
          user: {
            username: 'swing_master',
            displayName: 'Swing Master',
            avatar: '/api/placeholder/30/30'
          },
          reactedAt: '2024-01-20T14:15:00Z'
        }
      ]
    }

    // Filter by reaction type if specified
    if (reactionType) {
      const filteredReaction = mockReactions.breakdown.find(r => r.type === reactionType)
      if (!filteredReaction) {
        return NextResponse.json({
          success: true,
          reactions: {
            postId,
            type: reactionType,
            count: 0,
            users: []
          }
        })
      }

      return NextResponse.json({
        success: true,
        reactions: {
          postId,
          type: reactionType,
          count: filteredReaction.count,
          emoji: filteredReaction.emoji,
          users: filteredReaction.users.slice(0, limit)
        }
      })
    }

    return NextResponse.json({
      success: true,
      reactions: mockReactions
    })

  } catch (error: any) {
    console.error('Reactions API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactions', details: error.message },
      { status: 500 }
    )
  }
}

