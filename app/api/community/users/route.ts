import { NextRequest, NextResponse } from 'next/server'

// GET - Search and list users with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') // Search by username or display name
    const filter = searchParams.get('filter') // 'verified', 'experts', 'new', 'active'
    const sortBy = searchParams.get('sortBy') || 'reputation' // 'reputation', 'followers', 'activity', 'joined'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const level = searchParams.get('level') // 'Beginner', 'Intermediate', 'Expert', 'Professional', 'Elite'

    // Mock users database
    const mockUsers = [
      {
        id: 'user-1',
        username: 'trading_guru',
        displayName: 'Trading Guru',
        email: 'guru@example.com', // Only returned for admin/own profile
        avatar: '/api/placeholder/60/60',
        coverImage: '/api/placeholder/800/200',
        verified: true,
        level: 'Expert',
        reputation: 4850,
        followers: 2847,
        following: 234,
        totalPosts: 1247,
        totalLikes: 12450,
        joinedDate: '2022-03-15T00:00:00Z',
        lastActive: '2024-01-20T14:30:00Z',
        bio: 'Professional trader with 15+ years experience. Focus on swing trading and risk management. Author of "Smart Trading Strategies".',
        location: 'New York, NY',
        website: 'https://tradingguru.com',
        twitter: '@tradingguru',
        badges: ['Top Contributor', 'Verified Trader', 'Risk Master', 'Community Leader'],
        specialties: ['Swing Trading', 'Risk Management', 'Technical Analysis', 'Options'],
        tradingStats: {
          winRate: 73.5,
          avgReturn: 12.8,
          totalTrades: 1247,
          bestMonth: 28.5,
          worstMonth: -8.2,
          sharpeRatio: 1.85,
          maxDrawdown: 12.3,
          profitFactor: 2.1
        },
        preferences: {
          isProfilePublic: true,
          showTradingStats: true,
          allowMessages: true,
          emailNotifications: true
        },
        subscription: {
          type: 'premium',
          expiresAt: '2024-12-31T23:59:59Z'
        },
        status: 'active'
      },
      {
        id: 'user-2',
        username: 'quant_master',
        displayName: 'Quant Master',
        avatar: '/api/placeholder/60/60',
        coverImage: '/api/placeholder/800/200',
        verified: true,
        level: 'Professional',
        reputation: 8950,
        followers: 5234,
        following: 890,
        totalPosts: 892,
        totalLikes: 23450,
        joinedDate: '2021-08-22T00:00:00Z',
        lastActive: '2024-01-20T13:45:00Z',
        bio: 'Quantitative analyst with PhD in Financial Engineering. Specializing in algorithmic trading and systematic strategies.',
        location: 'London, UK',
        website: 'https://quantmaster.io',
        twitter: '@quantmaster',
        badges: ['Strategy Expert', 'Backtesting Pro', 'Educator', 'Algorithm Wizard'],
        specialties: ['Quantitative Analysis', 'Algorithmic Trading', 'Python', 'Machine Learning'],
        tradingStats: {
          winRate: 89.2,
          avgReturn: 18.7,
          totalTrades: 3456,
          bestMonth: 45.2,
          worstMonth: -3.1,
          sharpeRatio: 2.8,
          maxDrawdown: 5.7,
          profitFactor: 3.2
        },
        preferences: {
          isProfilePublic: true,
          showTradingStats: true,
          allowMessages: true,
          emailNotifications: false
        },
        subscription: {
          type: 'professional',
          expiresAt: '2024-12-31T23:59:59Z'
        },
        status: 'active'
      },
      {
        id: 'user-3',
        username: 'market_wizard',
        displayName: 'Market Wizard',
        avatar: '/api/placeholder/60/60',
        coverImage: '/api/placeholder/800/200',
        verified: true,
        level: 'Elite',
        reputation: 12450,
        followers: 8945,
        following: 456,
        totalPosts: 2134,
        totalLikes: 45670,
        joinedDate: '2020-11-10T00:00:00Z',
        lastActive: '2024-01-20T15:00:00Z',
        bio: 'Former hedge fund manager. Now teaching others how to read market psychology and manage risk effectively.',
        location: 'Chicago, IL',
        website: 'https://marketwizard.pro',
        twitter: '@marketwizard',
        badges: ['Market Prophet', 'Risk Expert', 'News Trader', 'Hedge Fund Alumni'],
        specialties: ['Market Psychology', 'News Trading', 'Risk Management', 'Macro Analysis'],
        tradingStats: {
          winRate: 68.9,
          avgReturn: 24.3,
          totalTrades: 2890,
          bestMonth: 67.8,
          worstMonth: -15.4,
          sharpeRatio: 2.1,
          maxDrawdown: 18.9,
          profitFactor: 2.7
        },
        preferences: {
          isProfilePublic: true,
          showTradingStats: true,
          allowMessages: false, // Only accepts messages from verified users
          emailNotifications: true
        },
        subscription: {
          type: 'elite',
          expiresAt: '2024-12-31T23:59:59Z'
        },
        status: 'active'
      },
      {
        id: 'user-4',
        username: 'options_newbie',
        displayName: 'Options Newbie',
        avatar: '/api/placeholder/60/60',
        coverImage: '/api/placeholder/800/200',
        verified: false,
        level: 'Beginner',
        reputation: 145,
        followers: 23,
        following: 127,
        totalPosts: 45,
        totalLikes: 234,
        joinedDate: '2024-01-05T00:00:00Z',
        lastActive: '2024-01-20T12:15:00Z',
        bio: 'New to options trading and eager to learn from the community. Background in software development.',
        location: 'Austin, TX',
        website: '',
        twitter: '',
        badges: ['New Member', 'Question Asker'],
        specialties: ['Learning', 'Options Basics'],
        tradingStats: {
          winRate: 45.2,
          avgReturn: -2.1,
          totalTrades: 23,
          bestMonth: 8.5,
          worstMonth: -12.3,
          sharpeRatio: -0.2,
          maxDrawdown: 15.7,
          profitFactor: 0.8
        },
        preferences: {
          isProfilePublic: true,
          showTradingStats: false, // Hiding stats as they're negative
          allowMessages: true,
          emailNotifications: true
        },
        subscription: {
          type: 'free',
          expiresAt: null
        },
        status: 'active'
      },
      {
        id: 'user-5',
        username: 'crypto_degen',
        displayName: 'Crypto Degen',
        avatar: '/api/placeholder/60/60',
        coverImage: '/api/placeholder/800/200',
        verified: false,
        level: 'Intermediate',
        reputation: 2340,
        followers: 892,
        following: 1456,
        totalPosts: 567,
        totalLikes: 4560,
        joinedDate: '2023-02-14T00:00:00Z',
        lastActive: '2024-01-20T11:30:00Z',
        bio: 'Full-time crypto trader. Love high-volatility plays and DeFi protocols. WAGMI! 🚀',
        location: 'Miami, FL',
        website: 'https://cryptodegen.wtf',
        twitter: '@cryptodegen',
        badges: ['Crypto Expert', 'DeFi Pioneer', 'High Risk Tolerance'],
        specialties: ['Cryptocurrency', 'DeFi', 'High Volatility Trading'],
        tradingStats: {
          winRate: 52.3,
          avgReturn: 45.7,
          totalTrades: 2345,
          bestMonth: 234.5,
          worstMonth: -67.8,
          sharpeRatio: 0.8,
          maxDrawdown: 78.9,
          profitFactor: 1.9
        },
        preferences: {
          isProfilePublic: true,
          showTradingStats: true,
          allowMessages: true,
          emailNotifications: false
        },
        subscription: {
          type: 'premium',
          expiresAt: '2024-06-30T23:59:59Z'
        },
        status: 'active'
      }
    ]

    // Apply filters
    let filteredUsers = [...mockUsers]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.displayName.toLowerCase().includes(searchLower) ||
        user.bio.toLowerCase().includes(searchLower)
      )
    }

    if (filter) {
      switch (filter) {
        case 'verified':
          filteredUsers = filteredUsers.filter(user => user.verified)
          break
        case 'experts':
          filteredUsers = filteredUsers.filter(user => 
            ['Expert', 'Professional', 'Elite'].includes(user.level)
          )
          break
        case 'new':
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          filteredUsers = filteredUsers.filter(user =>
            new Date(user.joinedDate) > oneMonthAgo
          )
          break
        case 'active':
          const oneDayAgo = new Date()
          oneDayAgo.setDate(oneDayAgo.getDate() - 1)
          filteredUsers = filteredUsers.filter(user =>
            new Date(user.lastActive) > oneDayAgo
          )
          break
      }
    }

    if (level) {
      filteredUsers = filteredUsers.filter(user => user.level === level)
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'followers':
          aValue = a.followers
          bValue = b.followers
          break
        case 'activity':
          aValue = new Date(a.lastActive).getTime()
          bValue = new Date(b.lastActive).getTime()
          break
        case 'joined':
          aValue = new Date(a.joinedDate).getTime()
          bValue = new Date(b.joinedDate).getTime()
          break
        case 'reputation':
        default:
          aValue = a.reputation
          bValue = b.reputation
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedUsers = filteredUsers.slice(offset, offset + limit)

    // Remove sensitive data from response (except for own profile)
    const sanitizedUsers = paginatedUsers.map(user => {
      const { email, ...publicUser } = user
      return publicUser
    })

    // Calculate community metrics
    const totalUsers = filteredUsers.length
    const verifiedUsers = filteredUsers.filter(u => u.verified).length
    const avgReputation = Math.round(
      filteredUsers.reduce((sum, u) => sum + u.reputation, 0) / totalUsers
    )

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      },
      metrics: {
        totalUsers,
        verifiedUsers,
        avgReputation,
        levelDistribution: {
          'Beginner': filteredUsers.filter(u => u.level === 'Beginner').length,
          'Intermediate': filteredUsers.filter(u => u.level === 'Intermediate').length,
          'Expert': filteredUsers.filter(u => u.level === 'Expert').length,
          'Professional': filteredUsers.filter(u => u.level === 'Professional').length,
          'Elite': filteredUsers.filter(u => u.level === 'Elite').length
        }
      },
      filters: {
        levels: ['Beginner', 'Intermediate', 'Expert', 'Professional', 'Elite'],
        filterOptions: [
          { value: 'verified', label: 'Verified Users' },
          { value: 'experts', label: 'Expert Level+' },
          { value: 'new', label: 'New Members' },
          { value: 'active', label: 'Recently Active' }
        ],
        sortOptions: [
          { value: 'reputation', label: 'Reputation' },
          { value: 'followers', label: 'Followers' },
          { value: 'activity', label: 'Last Active' },
          { value: 'joined', label: 'Joined Date' }
        ]
      }
    })

  } catch (error: any) {
    console.error('Users API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
  }
}

