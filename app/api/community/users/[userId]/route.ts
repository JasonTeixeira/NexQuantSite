import { NextRequest, NextResponse } from 'next/server'

// GET - Get detailed user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const includePosts = searchParams.get('includePosts') === 'true'
    const postsLimit = parseInt(searchParams.get('postsLimit') || '5')

    // Mock detailed user profile
    const mockUser = {
      id: userId,
      username: 'trading_guru',
      displayName: 'Trading Guru',
      avatar: '/api/placeholder/120/120',
      coverImage: '/api/placeholder/1200/300',
      verified: true,
      level: 'Expert',
      reputation: 4850,
      followers: 2847,
      following: 234,
      totalPosts: 1247,
      totalLikes: 12450,
      totalComments: 3450,
      totalShares: 890,
      joinedDate: '2022-03-15T00:00:00Z',
      lastActive: '2024-01-20T14:30:00Z',
      bio: 'Professional trader with 15+ years experience in equity markets. Specializing in swing trading and risk management strategies. Author of "Smart Trading Strategies" and regular contributor to MarketWatch.',
      location: 'New York, NY',
      website: 'https://tradingguru.com',
      twitter: '@tradingguru',
      linkedin: '/in/tradingguru',
      badges: [
        { 
          id: 'top-contributor',
          name: 'Top Contributor', 
          icon: '🏆',
          description: 'One of the most helpful community members',
          earnedAt: '2023-06-15T00:00:00Z',
          rarity: 'rare'
        },
        { 
          id: 'verified-trader',
          name: 'Verified Trader', 
          icon: '✅',
          description: 'Identity and trading history verified',
          earnedAt: '2022-04-20T00:00:00Z',
          rarity: 'common'
        },
        { 
          id: 'risk-master',
          name: 'Risk Master', 
          icon: '🛡️',
          description: 'Expert in risk management strategies',
          earnedAt: '2023-02-10T00:00:00Z',
          rarity: 'epic'
        },
        { 
          id: 'community-leader',
          name: 'Community Leader', 
          icon: '👑',
          description: 'Exceptional leadership in the community',
          earnedAt: '2023-11-01T00:00:00Z',
          rarity: 'legendary'
        }
      ],
      specialties: ['Swing Trading', 'Risk Management', 'Technical Analysis', 'Options Trading'],
      tradingExperience: {
        yearsTrading: 15,
        marketsTraded: ['Stocks', 'Options', 'ETFs', 'Forex'],
        preferredTimeframes: ['Daily', 'Weekly'],
        riskTolerance: 'Moderate',
        primaryStrategy: 'Swing Trading'
      },
      preferences: {
        isProfilePublic: true,
        showTradingStats: true,
        showBadges: true,
        allowMessages: true,
        allowFollows: true,
        emailNotifications: true,
        pushNotifications: false
      },
      subscription: {
        type: 'premium',
        tier: 'Pro Trader',
        startDate: '2022-03-15T00:00:00Z',
        expiresAt: '2024-12-31T23:59:59Z',
        features: ['Advanced Analytics', 'Priority Support', 'Custom Indicators', 'API Access']
      },
      status: 'active',

      // Activity metrics
      activityMetrics: {
        postsThisMonth: 23,
        likesThisMonth: 456,
        commentsThisMonth: 89,
        avgPostsPerWeek: 8.5,
        mostActiveDay: 'Tuesday',
        mostActiveHour: 14, // 2 PM
        responseRate: 87.5, // % of comments they reply to
        avgResponseTime: '2.3 hours'
      },

      // Engagement metrics
      engagementMetrics: {
        avgLikesPerPost: 12.8,
        avgCommentsPerPost: 4.2,
        avgSharesPerPost: 1.1,
        totalReach: 145600, // Total views across all posts
        engagementRate: 8.9, // %
        topPost: {
          id: 'post-top',
          title: 'My Complete Risk Management System',
          likes: 234,
          comments: 67,
          shares: 23,
          views: 3456
        }
      },

      // Recent achievements
      recentAchievements: [
        {
          id: 'achievement-1',
          type: 'milestone',
          title: '1000+ Helpful Comments',
          description: 'Reached 1000 helpful comments milestone',
          icon: '💬',
          earnedAt: '2024-01-18T00:00:00Z',
          rarity: 'rare'
        },
        {
          id: 'achievement-2',
          type: 'engagement',
          title: 'Viral Post',
          description: 'Post reached 10,000+ views in 24 hours',
          icon: '🔥',
          earnedAt: '2024-01-10T00:00:00Z',
          rarity: 'epic'
        }
      ]
    }

    // Add trading stats if requested and user allows it
    if (includeStats && mockUser.preferences.showTradingStats) {
      mockUser.tradingStats = {
        winRate: 73.5,
        avgReturn: 12.8,
        totalTrades: 1247,
        profitableTrades: 916,
        losingTrades: 331,
        bestTrade: 89.5,
        worstTrade: -15.2,
        avgWinningTrade: 18.7,
        avgLosingTrade: -8.9,
        bestMonth: 28.5,
        worstMonth: -8.2,
        avgMonthlyReturn: 12.8,
        sharpeRatio: 1.85,
        maxDrawdown: 12.3,
        profitFactor: 2.1,
        consistency: 0.78, // How consistent returns are
        riskAdjustedReturn: 15.2,
        calmarRatio: 1.04,
        
        // Performance by timeframe
        performanceByTimeframe: {
          '1M': 2.1,
          '3M': 8.7,
          '6M': 15.2,
          '1Y': 28.9,
          'YTD': 3.4,
          'All': 145.6
        },

        // Performance by asset class
        performanceByAsset: {
          'Tech Stocks': 32.1,
          'Healthcare': 15.7,
          'Finance': 22.3,
          'Energy': 8.9,
          'Options': 18.5
        },

        // Monthly performance history (last 12 months)
        monthlyPerformance: [
          { month: '2023-02', return: 5.2 },
          { month: '2023-03', return: -2.1 },
          { month: '2023-04', return: 8.7 },
          { month: '2023-05', return: 12.3 },
          { month: '2023-06', return: -1.8 },
          { month: '2023-07', return: 15.6 },
          { month: '2023-08', return: 3.4 },
          { month: '2023-09', return: 9.8 },
          { month: '2023-10', return: -5.2 },
          { month: '2023-11', return: 18.9 },
          { month: '2023-12', return: 7.1 },
          { month: '2024-01', return: 3.4 }
        ],

        lastUpdated: '2024-01-20T14:30:00Z'
      }
    }

    // Add recent posts if requested
    if (includePosts) {
      mockUser.recentPosts = [
        {
          id: 'post-1',
          type: 'trade',
          title: '🚀 TSLA Long Position - Technical Breakout',
          excerpt: 'Just opened a long position on TSLA at $242.50. The stock broke above the 200-day MA with strong volume...',
          createdAt: '2024-01-20T10:30:00Z',
          reactions: [{ type: 'like', count: 45 }],
          comments: 23,
          views: 1247
        },
        {
          id: 'post-2',
          type: 'insight',
          title: '⚡ Market Alert: Fed Minutes Impact Analysis',
          excerpt: 'Fed minutes dropping in 30 minutes. Based on historical data, here\'s what to expect...',
          createdAt: '2024-01-19T13:15:00Z',
          reactions: [{ type: 'useful', count: 67 }],
          comments: 34,
          views: 2145
        },
        {
          id: 'post-3',
          type: 'strategy',
          title: '📊 Weekly Market Outlook: Key Levels to Watch',
          excerpt: 'Looking ahead to next week, here are the key technical levels I\'m watching across major indices...',
          createdAt: '2024-01-18T16:45:00Z',
          reactions: [{ type: 'insightful', count: 89 }],
          comments: 45,
          views: 3456
        }
      ].slice(0, postsLimit)
    }

    // Add follower/following lists preview
    mockUser.followersPreview = [
      {
        id: 'follower-1',
        username: 'swing_trader_pro',
        displayName: 'Swing Trader Pro',
        avatar: '/api/placeholder/40/40',
        verified: true,
        level: 'Expert'
      },
      {
        id: 'follower-2',
        username: 'options_master',
        displayName: 'Options Master',
        avatar: '/api/placeholder/40/40',
        verified: false,
        level: 'Professional'
      }
    ]

    mockUser.followingPreview = [
      {
        id: 'following-1',
        username: 'market_wizard',
        displayName: 'Market Wizard',
        avatar: '/api/placeholder/40/40',
        verified: true,
        level: 'Elite'
      }
    ]

    return NextResponse.json({
      success: true,
      user: mockUser
    })

  } catch (error: any) {
    console.error('User Profile API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // In production, verify user can only update their own profile
    const currentUserId = 'current-user-id' // Mock
    const { userId } = params

    if (currentUserId !== userId) {
      return NextResponse.json(
        { error: 'Can only update your own profile' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      displayName,
      bio,
      location,
      website,
      twitter,
      linkedin,
      specialties,
      tradingExperience,
      preferences
    } = body

    // Validation
    if (displayName && (displayName.length < 2 || displayName.length > 50)) {
      return NextResponse.json(
        { error: 'Display name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be 500 characters or less' },
        { status: 400 }
      )
    }

    if (website && !website.match(/^https?:\/\/.+/)) {
      return NextResponse.json(
        { error: 'Website must be a valid URL' },
        { status: 400 }
      )
    }

    // Create update object
    const updates = {
      ...(displayName && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(location && { location }),
      ...(website && { website }),
      ...(twitter && { twitter }),
      ...(linkedin && { linkedin }),
      ...(specialties && { specialties: specialties.slice(0, 8) }), // Max 8 specialties
      ...(tradingExperience && { tradingExperience }),
      ...(preferences && { preferences }),
      updatedAt: new Date().toISOString()
    }

    // In production, update in database
    console.log('Updating user profile:', userId, updates)

    return NextResponse.json({
      success: true,
      userId,
      updates,
      message: 'Profile updated successfully'
    })

  } catch (error: any) {
    console.error('User Profile API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    )
  }
}

