import { NextRequest, NextResponse } from 'next/server'

// GET - Get all comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'createdAt' // 'createdAt', 'likes', 'replies'
    const sortOrder = searchParams.get('sortOrder') || 'asc' // 'asc' or 'desc'

    // Mock comments data
    const mockComments = [
      {
        id: 'comment-1',
        postId,
        content: 'Great analysis! I\'m also watching TSLA but waiting for a pullback to the $235 level. What made you enter at current price vs waiting for a better entry point?',
        author: {
          id: 'user-5',
          username: 'patient_trader',
          displayName: 'Patient Trader',
          avatar: '/api/placeholder/30/30',
          level: 'Intermediate',
          verified: false,
          reputation: 1240,
          badges: ['Patient Trader', 'Risk Aware']
        },
        createdAt: '2024-01-20T10:45:00Z',
        updatedAt: '2024-01-20T10:45:00Z',
        likes: 8,
        hasUserLiked: false,
        replyCount: 1,
        isEdited: false,
        mentions: [],
        replies: [
          {
            id: 'reply-1',
            parentCommentId: 'comment-1',
            content: '@patient_trader Good question! I entered because the breakout volume was exceptional (2.5x average) and RSI momentum was strong. Sometimes you pay a premium for high-probability setups rather than waiting for perfect entries that might never come. Risk management is key! 🎯',
            author: {
              id: 'user-1',
              username: 'trading_guru',
              displayName: 'Trading Guru',
              avatar: '/api/placeholder/30/30',
              level: 'Expert',
              verified: true,
              reputation: 4850,
              badges: ['Top Contributor', 'Verified Trader']
            },
            createdAt: '2024-01-20T11:02:00Z',
            updatedAt: '2024-01-20T11:02:00Z',
            likes: 12,
            hasUserLiked: true,
            mentions: ['patient_trader'],
            isEdited: false
          }
        ]
      },
      {
        id: 'comment-2',
        postId,
        content: '🔥 Love this setup! Similar to the breakout we saw in September. My only concern is the overall market volatility with Fed meetings coming up. How are you planning to hedge this position if the broader market tanks?',
        author: {
          id: 'user-6',
          username: 'risk_manager_pro',
          displayName: 'Risk Manager Pro',
          avatar: '/api/placeholder/30/30',
          level: 'Professional',
          verified: true,
          reputation: 6750,
          badges: ['Risk Expert', 'Portfolio Manager', 'Hedge Master']
        },
        createdAt: '2024-01-20T11:15:00Z',
        updatedAt: '2024-01-20T11:15:00Z',
        likes: 15,
        hasUserLiked: false,
        replyCount: 2,
        isEdited: false,
        mentions: [],
        replies: [
          {
            id: 'reply-2',
            parentCommentId: 'comment-2',
            content: 'Great point! I\'ve reduced my overall position sizing by 30% ahead of Fed minutes. Also have some VIX calls as portfolio insurance. Individual stock setups can work even in volatile markets if sized properly. 📊',
            author: {
              id: 'user-1',
              username: 'trading_guru',
              displayName: 'Trading Guru',
              avatar: '/api/placeholder/30/30',
              level: 'Expert',
              verified: true,
              reputation: 4850,
              badges: ['Top Contributor', 'Verified Trader']
            },
            createdAt: '2024-01-20T11:28:00Z',
            updatedAt: '2024-01-20T11:28:00Z',
            likes: 9,
            hasUserLiked: false,
            mentions: [],
            isEdited: false
          },
          {
            id: 'reply-3',
            parentCommentId: 'comment-2',
            content: '@risk_manager_pro Smart approach! VIX hedging is underrated. What\'s your typical allocation for portfolio insurance?',
            author: {
              id: 'user-8',
              username: 'hedge_fund_alex',
              displayName: 'Hedge Fund Alex',
              avatar: '/api/placeholder/30/30',
              level: 'Professional',
              verified: true,
              reputation: 8950,
              badges: ['Institutional Trader', 'Hedge Fund Pro']
            },
            createdAt: '2024-01-20T11:45:00Z',
            updatedAt: '2024-01-20T11:45:00Z',
            likes: 6,
            hasUserLiked: false,
            mentions: ['risk_manager_pro'],
            isEdited: false
          }
        ]
      },
      {
        id: 'comment-3',
        postId,
        content: 'Thanks for sharing the detailed analysis! Quick question: what platform are you using for those clean charts? The annotations look very professional and I\'d love to upgrade my charting setup.',
        author: {
          id: 'user-7',
          username: 'newbie_chart',
          displayName: 'Chart Newbie',
          avatar: '/api/placeholder/30/30',
          level: 'Beginner',
          verified: false,
          reputation: 85,
          badges: ['New Member']
        },
        createdAt: '2024-01-20T12:30:00Z',
        updatedAt: '2024-01-20T12:30:00Z',
        likes: 3,
        hasUserLiked: false,
        replyCount: 0,
        isEdited: false,
        mentions: [],
        replies: []
      },
      {
        id: 'comment-4',
        postId,
        content: 'Solid technical setup but I\'m curious about the fundamental catalyst here. Any upcoming earnings or product announcements that could drive this breakout higher? Technical + fundamental confluence is always stronger IMO.',
        author: {
          id: 'user-9',
          username: 'fundamental_analyst',
          displayName: 'Fundamental Analyst',
          avatar: '/api/placeholder/30/30',
          level: 'Expert',
          verified: true,
          reputation: 5420,
          badges: ['Fundamental Expert', 'Earnings Prophet', 'Value Hunter']
        },
        createdAt: '2024-01-20T13:15:00Z',
        updatedAt: '2024-01-20T13:15:00Z',
        likes: 11,
        hasUserLiked: true,
        replyCount: 0,
        isEdited: false,
        mentions: [],
        replies: []
      },
      {
        id: 'comment-5',
        postId,
        content: 'Nice trade! I\'m more of a options trader - thinking about selling puts at the $220 level to get assigned if it pulls back. Thoughts on the IV levels right now?',
        author: {
          id: 'user-10',
          username: 'options_wizard',
          displayName: 'Options Wizard',
          avatar: '/api/placeholder/30/30',
          level: 'Expert',
          verified: true,
          reputation: 7230,
          badges: ['Options Master', 'Volatility Expert', 'Greeks Guru']
        },
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-01-20T14:00:00Z',
        likes: 7,
        hasUserLiked: false,
        replyCount: 0,
        isEdited: false,
        mentions: [],
        replies: []
      }
    ]

    // Sort comments
    const sortedComments = [...mockComments].sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'likes':
          aValue = a.likes
          bValue = b.likes
          break
        case 'replies':
          aValue = a.replyCount
          bValue = b.replyCount
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedComments = sortedComments.slice(offset, offset + limit)

    // Calculate engagement metrics
    const totalLikes = mockComments.reduce((sum, comment) => sum + comment.likes, 0)
    const totalReplies = mockComments.reduce((sum, comment) => sum + comment.replyCount, 0)

    return NextResponse.json({
      success: true,
      comments: paginatedComments,
      pagination: {
        page,
        limit,
        total: mockComments.length,
        pages: Math.ceil(mockComments.length / limit)
      },
      metrics: {
        totalComments: mockComments.length,
        totalLikes,
        totalReplies,
        averageLikesPerComment: Math.round(totalLikes / mockComments.length),
        engagementRate: Math.round(((totalLikes + totalReplies) / mockComments.length) * 100) / 100
      },
      sortOptions: [
        { value: 'createdAt-asc', label: 'Oldest First' },
        { value: 'createdAt-desc', label: 'Newest First' },
        { value: 'likes-desc', label: 'Most Liked' },
        { value: 'replies-desc', label: 'Most Replied' }
      ]
    })

  } catch (error: any) {
    console.error('Comments API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new comment on a post
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // In production, verify user authentication
    const userId = 'current-user-id' // Mock
    const { postId } = params
    const body = await request.json()

    const {
      content,
      parentCommentId = null, // For replies
      mentions = []
    } = body

    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 1 and 2000 characters' },
        { status: 400 }
      )
    }

    // Content moderation
    const moderationFlags = []
    const spamKeywords = ['spam', 'click here', 'buy now', 'guaranteed']
    const contentLower = content.toLowerCase()
    
    spamKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        moderationFlags.push('spam')
      }
    })

    // Extract mentions from content (simple @ parsing)
    const mentionRegex = /@(\w+)/g
    const extractedMentions = []
    let match
    while ((match = mentionRegex.exec(content)) !== null) {
      extractedMentions.push(match[1])
    }

    const commentId = `comment-${Date.now()}`

    const newComment = {
      id: commentId,
      postId,
      parentCommentId,
      content: content.trim(),
      authorId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      hasUserLiked: false,
      replyCount: 0,
      isEdited: false,
      mentions: extractedMentions,
      status: moderationFlags.length > 0 ? 'pending_review' : 'active',
      moderationFlags
    }

    // In production:
    // 1. Save comment to database
    // 2. Update post comment count
    // 3. Send notifications to mentioned users
    // 4. Send notification to post author (if different user)
    // 5. Send notification to parent comment author (if reply)
    // 6. Process for moderation if flagged
    console.log('Creating comment:', newComment)

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: moderationFlags.length > 0 
        ? 'Comment created and sent for moderation'
        : 'Comment created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Comments API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment', details: error.message },
      { status: 500 }
    )
  }
}

