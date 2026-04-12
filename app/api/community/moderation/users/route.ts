import { NextRequest, NextResponse } from 'next/server'

// GET - Get users requiring moderation action or review
export async function GET(request: NextRequest) {
  try {
    // In production, verify admin/moderator permissions
    const moderatorId = 'moderator-user-id' // Mock

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all' // 'flagged', 'suspended', 'banned', 'appealing', 'review'
    const riskLevel = searchParams.get('riskLevel') // 'high', 'medium', 'low'
    const joinedAfter = searchParams.get('joinedAfter') // Date filter
    const sortBy = searchParams.get('sortBy') || 'riskScore' // 'riskScore', 'reports', 'activity'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Mock users requiring moderation attention
    const mockModerationUsers = [
      {
        id: 'user-risk-1',
        username: 'suspicious_trader_99',
        displayName: 'Quick Money Trader',
        email: 'spam@fake.com', // Only for moderators
        avatar: '/api/placeholder/40/40',
        joinedDate: '2024-01-19T00:00:00Z',
        lastActive: '2024-01-20T15:30:00Z',
        status: 'flagged',
        
        // Risk assessment
        riskScore: 89, // 0-100 scale
        riskLevel: 'high',
        riskFactors: [
          {
            factor: 'spam_content',
            score: 95,
            description: 'Posted multiple spam-like content',
            evidence: ['5 posts with "guaranteed profits"', '3 posts with external links']
          },
          {
            factor: 'new_account',
            score: 80,
            description: 'Very new account with high activity',
            evidence: ['Account created 1 day ago', '15 posts in first day']
          },
          {
            factor: 'suspicious_patterns',
            score: 75,
            description: 'Unusual posting patterns',
            evidence: ['All posts within 2-hour window', 'Similar content structure']
          }
        ],

        // Moderation history
        warnings: 2,
        suspensions: 0,
        bans: 0,
        totalReports: 8,
        recentReports: [
          {
            id: 'report-user-1',
            reporterId: 'user-reporter-1',
            reason: 'spam',
            description: 'Account posting multiple spam messages',
            reportedAt: '2024-01-20T10:30:00Z',
            status: 'open'
          },
          {
            id: 'report-user-2',
            reporterId: 'user-reporter-2',
            reason: 'fake_account',
            description: 'Suspicious account behavior, likely bot',
            reportedAt: '2024-01-20T11:45:00Z',
            status: 'open'
          }
        ],

        // Account metrics
        metrics: {
          postsCount: 15,
          commentsCount: 3,
          likesReceived: 2,
          likesGiven: 0,
          followersCount: 0,
          followingCount: 234, // Suspicious - following many, no followers
          reportRate: 0.53, // Reports per post - very high
          engagementRate: 0.05, // Very low legitimate engagement
          spamProbability: 0.94
        },

        // Current sanctions
        activeSanctions: [
          {
            type: 'shadow_ban',
            reason: 'Suspected spam account',
            appliedAt: '2024-01-20T12:00:00Z',
            appliedBy: 'moderator-jane',
            duration: '24 hours',
            expiresAt: '2024-01-21T12:00:00Z'
          }
        ],

        // AI analysis
        aiAnalysis: {
          accountType: 'likely_spam_bot',
          confidence: 0.91,
          behaviorScore: 0.12,
          contentQualityScore: 0.18,
          socialScore: 0.05,
          recommendation: 'ban_account',
          reasonsForRecommendation: [
            'Extremely high spam probability (94%)',
            'Suspicious follow patterns',
            'Low engagement quality',
            'Multiple credible reports'
          ]
        },

        assignedTo: 'moderator-jane',
        priority: 'high',
        lastReviewed: null
      },
      {
        id: 'user-risk-2',
        username: 'angry_day_trader',
        displayName: 'Frustrated Trader',
        email: 'angry@trader.com',
        avatar: '/api/placeholder/40/40',
        joinedDate: '2023-08-15T00:00:00Z',
        lastActive: '2024-01-20T14:15:00Z',
        status: 'review',
        
        riskScore: 67,
        riskLevel: 'medium',
        riskFactors: [
          {
            factor: 'toxic_behavior',
            score: 78,
            description: 'Multiple instances of harassment',
            evidence: ['5 comments flagged for toxicity', '2 personal attacks reported']
          },
          {
            factor: 'escalating_behavior',
            score: 65,
            description: 'Behavior getting worse over time',
            evidence: ['Toxicity score increased 40% last month', 'More reports recently']
          }
        ],

        warnings: 3,
        suspensions: 1,
        bans: 0,
        totalReports: 12,
        recentReports: [
          {
            id: 'report-user-3',
            reporterId: 'user-reporter-3',
            reason: 'harassment',
            description: 'Called other users "idiots" and "worthless"',
            reportedAt: '2024-01-19T16:20:00Z',
            status: 'investigating'
          }
        ],

        metrics: {
          postsCount: 89,
          commentsCount: 234,
          likesReceived: 45,
          likesGiven: 12,
          followersCount: 23,
          followingCount: 67,
          reportRate: 0.05,
          engagementRate: 0.35,
          spamProbability: 0.08
        },

        activeSanctions: [
          {
            type: 'comment_restriction',
            reason: 'Repeated harassment warnings',
            appliedAt: '2024-01-18T10:00:00Z',
            appliedBy: 'moderator-bob',
            duration: '7 days',
            expiresAt: '2024-01-25T10:00:00Z'
          }
        ],

        aiAnalysis: {
          accountType: 'problematic_user',
          confidence: 0.82,
          behaviorScore: 0.45,
          contentQualityScore: 0.65,
          socialScore: 0.38,
          recommendation: 'extended_warning',
          reasonsForRecommendation: [
            'Shows legitimate trading knowledge',
            'Has some positive engagement',
            'Responding to sanctions',
            'May improve with guidance'
          ]
        },

        assignedTo: 'moderator-bob',
        priority: 'medium',
        lastReviewed: '2024-01-18T15:30:00Z'
      },
      {
        id: 'user-risk-3',
        username: 'appeal_user_123',
        displayName: 'Appealing User',
        email: 'appeal@user.com',
        avatar: '/api/placeholder/40/40',
        joinedDate: '2022-12-10T00:00:00Z',
        lastActive: '2024-01-19T09:45:00Z',
        status: 'appealing',
        
        riskScore: 45,
        riskLevel: 'low',
        riskFactors: [
          {
            factor: 'previous_suspension',
            score: 45,
            description: 'Previously suspended for market manipulation claims',
            evidence: ['Suspended for 30 days in December 2023']
          }
        ],

        warnings: 1,
        suspensions: 1,
        bans: 0,
        totalReports: 3,
        recentReports: [],

        metrics: {
          postsCount: 156,
          commentsCount: 489,
          likesReceived: 892,
          likesGiven: 234,
          followersCount: 156,
          followingCount: 89,
          reportRate: 0.01,
          engagementRate: 0.78,
          spamProbability: 0.02
        },

        activeSanctions: [],
        
        // Appeal information
        appeal: {
          id: 'appeal-1',
          previousSanction: {
            type: 'suspension',
            reason: 'Market manipulation accusations',
            duration: '30 days',
            appliedAt: '2023-12-15T00:00:00Z',
            completedAt: '2024-01-14T00:00:00Z'
          },
          appealReason: 'The suspension was based on a misunderstanding. I was sharing legitimate research about a company I work for, not attempting market manipulation. I have documentation to prove my employment and the legitimacy of my claims.',
          evidence: [
            'Employment verification letter',
            'Company research reports',
            'LinkedIn profile confirmation'
          ],
          submittedAt: '2024-01-16T14:20:00Z',
          status: 'under_review'
        },

        aiAnalysis: {
          accountType: 'legitimate_user',
          confidence: 0.89,
          behaviorScore: 0.82,
          contentQualityScore: 0.91,
          socialScore: 0.78,
          recommendation: 'approve_appeal',
          reasonsForRecommendation: [
            'Strong positive engagement history',
            'Low spam probability',
            'Good community standing',
            'Plausible explanation for previous issue'
          ]
        },

        assignedTo: 'moderator-chief',
        priority: 'low',
        lastReviewed: '2024-01-17T11:00:00Z'
      }
    ]

    // Apply filters
    let filteredUsers = [...mockModerationUsers]

    if (status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }

    if (riskLevel) {
      filteredUsers = filteredUsers.filter(user => user.riskLevel === riskLevel)
    }

    if (joinedAfter) {
      const afterDate = new Date(joinedAfter)
      filteredUsers = filteredUsers.filter(user => 
        new Date(user.joinedDate) > afterDate
      )
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'reports':
          aValue = a.totalReports
          bValue = b.totalReports
          return bValue - aValue
        case 'activity':
          aValue = new Date(a.lastActive).getTime()
          bValue = new Date(b.lastActive).getTime()
          return bValue - aValue
        case 'riskScore':
        default:
          aValue = a.riskScore
          bValue = b.riskScore
          return bValue - aValue
      }
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedUsers = filteredUsers.slice(offset, offset + limit)

    // Calculate moderation statistics
    const moderationStats = {
      totalUsers: mockModerationUsers.length,
      flaggedUsers: mockModerationUsers.filter(u => u.status === 'flagged').length,
      suspendedUsers: mockModerationUsers.filter(u => u.status === 'suspended').length,
      bannedUsers: mockModerationUsers.filter(u => u.status === 'banned').length,
      appealingUsers: mockModerationUsers.filter(u => u.status === 'appealing').length,
      highRiskUsers: mockModerationUsers.filter(u => u.riskLevel === 'high').length,
      avgRiskScore: Math.round(
        mockModerationUsers.reduce((sum, u) => sum + u.riskScore, 0) / mockModerationUsers.length
      ),
      totalActiveWarnings: mockModerationUsers.reduce((sum, u) => sum + u.warnings, 0),
      totalActiveSuspensions: mockModerationUsers.reduce((sum, u) => sum + u.suspensions, 0)
    }

    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / limit)
      },
      moderationStats,
      filters: {
        statuses: [
          { value: 'flagged', label: 'Flagged', count: moderationStats.flaggedUsers },
          { value: 'suspended', label: 'Suspended', count: moderationStats.suspendedUsers },
          { value: 'banned', label: 'Banned', count: moderationStats.bannedUsers },
          { value: 'appealing', label: 'Appeals', count: moderationStats.appealingUsers },
          { value: 'review', label: 'Under Review', count: 0 }
        ],
        riskLevels: [
          { value: 'high', label: 'High Risk', count: moderationStats.highRiskUsers },
          { value: 'medium', label: 'Medium Risk', count: 0 },
          { value: 'low', label: 'Low Risk', count: 0 }
        ]
      }
    })

  } catch (error: any) {
    console.error('User Moderation API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users for moderation', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Apply moderation action to user
export async function POST(request: NextRequest) {
  try {
    // In production, verify admin/moderator permissions
    const moderatorId = 'moderator-user-id' // Mock

    const body = await request.json()
    const {
      userId,
      action, // 'warn', 'suspend', 'ban', 'restrict', 'shadow_ban', 'unban', 'approve_appeal'
      reason,
      duration, // For temporary sanctions
      restrictionType, // 'comments', 'posts', 'messages', 'all'
      notes,
      notifyUser = true
    } = body

    // Validation
    const validActions = [
      'warn', 'suspend', 'ban', 'restrict', 'shadow_ban', 
      'unban', 'approve_appeal', 'reject_appeal'
    ]
    
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'userId and reason are required' },
        { status: 400 }
      )
    }

    if (['suspend', 'restrict'].includes(action) && !duration) {
      return NextResponse.json(
        { error: 'duration is required for temporary sanctions' },
        { status: 400 }
      )
    }

    // Calculate expiration date
    let expiresAt = null
    if (duration) {
      const now = new Date()
      const durationMs = parseDuration(duration) // Helper to parse "7 days", "1 month", etc.
      expiresAt = new Date(now.getTime() + durationMs).toISOString()
    }

    // Create moderation action
    const moderationAction = {
      id: `user-mod-${Date.now()}`,
      userId,
      action,
      reason,
      duration,
      restrictionType: restrictionType || null,
      notes: notes || '',
      moderatorId,
      appliedAt: new Date().toISOString(),
      expiresAt,
      notifyUser,
      
      // Action results
      results: {
        sanctionApplied: true,
        userNotified: notifyUser,
        sessionsTerminated: ['suspend', 'ban'].includes(action),
        contentHidden: action === 'ban',
        accountRestricted: ['restrict', 'shadow_ban'].includes(action),
        appealRightGranted: ['suspend', 'ban'].includes(action),
        autoActionsTriggered: []
      }
    }

    // Apply additional automated actions based on sanction type
    switch (action) {
      case 'warn':
        moderationAction.results.autoActionsTriggered.push(
          'warning_email_sent',
          'warning_counter_incremented'
        )
        break
      case 'suspend':
        moderationAction.results.autoActionsTriggered.push(
          'account_suspended',
          'sessions_terminated',
          'suspension_email_sent',
          'appeal_process_notified'
        )
        break
      case 'ban':
        moderationAction.results.autoActionsTriggered.push(
          'account_banned',
          'all_content_hidden',
          'sessions_terminated',
          'ip_address_logged',
          'ban_notification_sent',
          'appeal_process_notified'
        )
        break
      case 'restrict':
        moderationAction.results.autoActionsTriggered.push(
          'restrictions_applied',
          'restriction_notification_sent'
        )
        break
      case 'shadow_ban':
        moderationAction.results.autoActionsTriggered.push(
          'shadow_ban_applied',
          'content_visibility_reduced'
        )
        // Note: No notification sent for shadow bans
        break
      case 'unban':
        moderationAction.results.autoActionsTriggered.push(
          'sanctions_removed',
          'content_restored',
          'unban_notification_sent'
        )
        break
      case 'approve_appeal':
        moderationAction.results.autoActionsTriggered.push(
          'appeal_approved',
          'sanctions_reversed',
          'content_restored',
          'approval_notification_sent'
        )
        break
    }

    // In production:
    // 1. Apply sanctions to user account
    // 2. Update user status and permissions
    // 3. Terminate active sessions if needed
    // 4. Hide/restore content as appropriate
    // 5. Send notifications to user
    // 6. Log action in audit trail
    // 7. Update moderation statistics

    console.log('Applying user moderation action:', moderationAction)

    return NextResponse.json({
      success: true,
      moderationAction,
      message: `User ${action} applied successfully`,
      effectiveUntil: expiresAt,
      autoActions: moderationAction.results.autoActionsTriggered
    }, { status: 201 })

  } catch (error: any) {
    console.error('User Moderation API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to apply moderation action', details: error.message },
      { status: 500 }
    )
  }
}

// Helper function to parse duration strings
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)\s*(hour|day|week|month|year)s?$/i)
  if (!match) return 0
  
  const [, num, unit] = match
  const number = parseInt(num)
  
  switch (unit.toLowerCase()) {
    case 'hour': return number * 60 * 60 * 1000
    case 'day': return number * 24 * 60 * 60 * 1000
    case 'week': return number * 7 * 24 * 60 * 60 * 1000
    case 'month': return number * 30 * 24 * 60 * 60 * 1000
    case 'year': return number * 365 * 24 * 60 * 60 * 1000
    default: return 0
  }
}

