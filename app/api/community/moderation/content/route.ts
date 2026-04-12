import { NextRequest, NextResponse } from 'next/server'

// GET - Get content items pending moderation
export async function GET(request: NextRequest) {
  try {
    // In production, verify admin/moderator permissions
    const moderatorId = 'moderator-user-id' // Mock

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all' // 'pending', 'approved', 'rejected', 'flagged'
    const contentType = searchParams.get('type') // 'post', 'comment', 'message', 'profile'
    const priority = searchParams.get('priority') // 'high', 'medium', 'low'
    const assignedTo = searchParams.get('assignedTo') // Specific moderator
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'createdAt'

    // Mock moderation queue data
    const mockModerationItems = [
      {
        id: 'mod-item-1',
        contentId: 'post-123',
        contentType: 'post',
        content: {
          title: 'GUARANTEED 500% RETURNS - CLICK HERE NOW!!!',
          excerpt: 'This amazing trading system has never failed! Get rich quick with my secret method...',
          authorId: 'user-spam-1',
          authorUsername: 'get_rich_quick_guru',
          createdAt: '2024-01-20T10:30:00Z'
        },
        flags: [
          {
            type: 'spam',
            reason: 'Contains spam keywords: "guaranteed", "get rich quick", "secret method"',
            confidence: 95,
            source: 'automated'
          },
          {
            type: 'misleading',
            reason: 'Claims unrealistic returns',
            confidence: 88,
            source: 'automated'
          }
        ],
        reports: [
          {
            id: 'report-1',
            reporterId: 'user-reporter-1',
            reporterUsername: 'vigilant_trader',
            reason: 'spam',
            description: 'Obvious spam post with unrealistic claims',
            reportedAt: '2024-01-20T10:45:00Z'
          },
          {
            id: 'report-2',
            reporterId: 'user-reporter-2', 
            reporterUsername: 'experienced_investor',
            reason: 'misleading',
            description: 'False advertising and misleading financial advice',
            reportedAt: '2024-01-20T11:15:00Z'
          }
        ],
        priority: 'high',
        status: 'pending',
        assignedTo: null,
        moderationHistory: [],
        aiAnalysis: {
          spamProbability: 0.95,
          toxicityScore: 0.12,
          sentimentScore: 0.85, // Artificially positive due to spam tactics
          keywordFlags: ['guaranteed', 'secret', 'never fails', 'get rich quick'],
          languageQuality: 0.3, // Poor grammar/suspicious patterns
          recommendation: 'reject'
        },
        createdAt: '2024-01-20T10:30:00Z',
        updatedAt: '2024-01-20T11:15:00Z'
      },
      {
        id: 'mod-item-2',
        contentId: 'comment-456',
        contentType: 'comment',
        content: {
          text: 'You clearly have no idea what you\'re talking about. Stop giving advice and stick to paper trading, loser.',
          postId: 'post-789',
          authorId: 'user-toxic-1',
          authorUsername: 'angry_trader_99',
          createdAt: '2024-01-20T09:15:00Z'
        },
        flags: [
          {
            type: 'harassment',
            reason: 'Personal attack and insulting language',
            confidence: 92,
            source: 'automated'
          },
          {
            type: 'toxic',
            reason: 'High toxicity score detected',
            confidence: 87,
            source: 'automated'
          }
        ],
        reports: [
          {
            id: 'report-3',
            reporterId: 'user-reporter-3',
            reporterUsername: 'peaceful_trader',
            reason: 'harassment',
            description: 'Unnecessary personal attack, not constructive criticism',
            reportedAt: '2024-01-20T09:30:00Z'
          }
        ],
        priority: 'medium',
        status: 'pending',
        assignedTo: 'moderator-jane',
        moderationHistory: [
          {
            action: 'assigned',
            moderatorId: 'moderator-jane',
            moderatorUsername: 'jane_moderator',
            timestamp: '2024-01-20T12:00:00Z',
            notes: 'Assigned for review due to harassment flags'
          }
        ],
        aiAnalysis: {
          spamProbability: 0.05,
          toxicityScore: 0.87,
          sentimentScore: -0.72,
          keywordFlags: ['loser', 'no idea'],
          languageQuality: 0.85,
          recommendation: 'warn_user'
        },
        createdAt: '2024-01-20T09:15:00Z',
        updatedAt: '2024-01-20T12:00:00Z'
      },
      {
        id: 'mod-item-3',
        contentId: 'post-789',
        contentType: 'post',
        content: {
          title: 'My controversial take on the current market situation',
          excerpt: 'I believe the current market rally is unsustainable and we\'re heading for a major correction...',
          authorId: 'user-contrarian-1',
          authorUsername: 'contrarian_view',
          createdAt: '2024-01-20T08:00:00Z'
        },
        flags: [
          {
            type: 'controversial',
            reason: 'Contains strong market predictions that may be misleading',
            confidence: 65,
            source: 'automated'
          }
        ],
        reports: [
          {
            id: 'report-4',
            reporterId: 'user-reporter-4',
            reporterUsername: 'bull_market_believer',
            reason: 'misinformation',
            description: 'Spreading fear about market conditions without evidence',
            reportedAt: '2024-01-20T11:30:00Z'
          }
        ],
        priority: 'low',
        status: 'under_review',
        assignedTo: 'moderator-bob',
        moderationHistory: [
          {
            action: 'assigned',
            moderatorId: 'moderator-bob',
            moderatorUsername: 'bob_moderator',
            timestamp: '2024-01-20T13:00:00Z',
            notes: 'Low priority review - appears to be legitimate opinion'
          }
        ],
        aiAnalysis: {
          spamProbability: 0.08,
          toxicityScore: 0.15,
          sentimentScore: -0.25,
          keywordFlags: ['correction', 'unsustainable'],
          languageQuality: 0.92,
          recommendation: 'approve'
        },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T13:00:00Z'
      },
      {
        id: 'mod-item-4',
        contentId: 'message-321',
        contentType: 'message',
        content: {
          text: 'Hey, want to make some quick money? I have an insider tip about ACME Corp earnings. DM me for details.',
          conversationId: 'conv-insider',
          authorId: 'user-insider-1',
          authorUsername: 'insider_tips_pro',
          createdAt: '2024-01-20T14:20:00Z'
        },
        flags: [
          {
            type: 'insider_trading',
            reason: 'Potential insider trading or market manipulation',
            confidence: 78,
            source: 'automated'
          },
          {
            type: 'financial_fraud',
            reason: 'Suspicious financial advice in private messages',
            confidence: 82,
            source: 'automated'
          }
        ],
        reports: [
          {
            id: 'report-5',
            reporterId: 'user-reporter-5',
            reporterUsername: 'ethical_trader',
            reason: 'insider_trading',
            description: 'User claiming to have insider information and asking for private communication',
            reportedAt: '2024-01-20T14:30:00Z'
          }
        ],
        priority: 'high',
        status: 'escalated',
        assignedTo: 'admin-chief',
        moderationHistory: [
          {
            action: 'escalated',
            moderatorId: 'moderator-jane',
            moderatorUsername: 'jane_moderator',
            timestamp: '2024-01-20T14:45:00Z',
            notes: 'Escalated to admin due to potential legal implications'
          }
        ],
        aiAnalysis: {
          spamProbability: 0.45,
          toxicityScore: 0.25,
          sentimentScore: 0.15,
          keywordFlags: ['insider tip', 'quick money', 'DM me'],
          languageQuality: 0.78,
          recommendation: 'escalate'
        },
        createdAt: '2024-01-20T14:20:00Z',
        updatedAt: '2024-01-20T14:45:00Z'
      }
    ]

    // Apply filters
    let filteredItems = [...mockModerationItems]

    if (status !== 'all') {
      filteredItems = filteredItems.filter(item => item.status === status)
    }

    if (contentType) {
      filteredItems = filteredItems.filter(item => item.contentType === contentType)
    }

    if (priority) {
      filteredItems = filteredItems.filter(item => item.priority === priority)
    }

    if (assignedTo) {
      filteredItems = filteredItems.filter(item => item.assignedTo === assignedTo)
    }

    // Sort items
    filteredItems.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          return bValue - aValue // High priority first
        case 'reports':
          aValue = a.reports.length
          bValue = b.reports.length
          return bValue - aValue // Most reports first
        case 'confidence':
          aValue = Math.max(...a.flags.map(f => f.confidence))
          bValue = Math.max(...b.flags.map(f => f.confidence))
          return bValue - aValue // Highest confidence first
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          return bValue - aValue // Newest first
      }
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedItems = filteredItems.slice(offset, offset + limit)

    // Calculate queue metrics
    const queueStats = {
      total: mockModerationItems.length,
      pending: mockModerationItems.filter(i => i.status === 'pending').length,
      underReview: mockModerationItems.filter(i => i.status === 'under_review').length,
      escalated: mockModerationItems.filter(i => i.status === 'escalated').length,
      highPriority: mockModerationItems.filter(i => i.priority === 'high').length,
      avgResponseTime: '2.4 hours',
      totalReports: mockModerationItems.reduce((sum, item) => sum + item.reports.length, 0)
    }

    return NextResponse.json({
      success: true,
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: filteredItems.length,
        pages: Math.ceil(filteredItems.length / limit)
      },
      queueStats,
      filters: {
        statuses: [
          { value: 'pending', label: 'Pending Review', count: queueStats.pending },
          { value: 'under_review', label: 'Under Review', count: queueStats.underReview },
          { value: 'escalated', label: 'Escalated', count: queueStats.escalated },
          { value: 'approved', label: 'Approved', count: 0 },
          { value: 'rejected', label: 'Rejected', count: 0 }
        ],
        contentTypes: [
          { value: 'post', label: 'Posts' },
          { value: 'comment', label: 'Comments' },
          { value: 'message', label: 'Messages' },
          { value: 'profile', label: 'Profiles' }
        ],
        priorities: [
          { value: 'high', label: 'High Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'low', label: 'Low Priority' }
        ]
      }
    })

  } catch (error: any) {
    console.error('Moderation Content API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moderation queue', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Moderate content (approve/reject/escalate)
export async function POST(request: NextRequest) {
  try {
    // In production, verify admin/moderator permissions
    const moderatorId = 'moderator-user-id' // Mock

    const body = await request.json()
    const {
      itemId,
      action, // 'approve', 'reject', 'escalate', 'assign', 'request_changes'
      reason,
      notes,
      assignTo,
      userAction, // 'warn', 'suspend', 'ban', 'none'
      suspensionDuration // For suspensions
    } = body

    // Validation
    const validActions = ['approve', 'reject', 'escalate', 'assign', 'request_changes']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId is required' },
        { status: 400 }
      )
    }

    if (action === 'assign' && !assignTo) {
      return NextResponse.json(
        { error: 'assignTo is required when assigning' },
        { status: 400 }
      )
    }

    // Process moderation action
    const moderationAction = {
      id: `mod-action-${Date.now()}`,
      itemId,
      action,
      moderatorId,
      reason: reason || '',
      notes: notes || '',
      assignTo: assignTo || null,
      userAction: userAction || 'none',
      suspensionDuration: suspensionDuration || null,
      timestamp: new Date().toISOString(),
      
      // Results of the action
      results: {
        contentStatus: action === 'approve' ? 'active' : 
                     action === 'reject' ? 'removed' : 
                     'under_review',
        userNotified: true,
        escalationLevel: action === 'escalate' ? 'admin' : 'moderator',
        autoActionsTriggered: []
      }
    }

    // Apply user sanctions if specified
    if (userAction !== 'none') {
      moderationAction.results.userSanction = {
        type: userAction,
        duration: suspensionDuration,
        appliedAt: new Date().toISOString(),
        reason: reason || 'Moderation action',
        moderatorId
      }

      // Trigger additional automated actions
      switch (userAction) {
        case 'warn':
          moderationAction.results.autoActionsTriggered.push('email_warning_sent')
          break
        case 'suspend':
          moderationAction.results.autoActionsTriggered.push('account_suspended', 'sessions_terminated')
          break
        case 'ban':
          moderationAction.results.autoActionsTriggered.push('account_banned', 'content_hidden', 'ip_logged')
          break
      }
    }

    // In production:
    // 1. Update content status in database
    // 2. Apply user sanctions if specified
    // 3. Send notifications to user and team
    // 4. Log action for audit trail
    // 5. Update moderation statistics
    // 6. Trigger automated workflows based on action

    console.log('Processing moderation action:', moderationAction)

    return NextResponse.json({
      success: true,
      moderationAction,
      message: `Content ${action} successfully`,
      nextSteps: moderationAction.results.autoActionsTriggered
    }, { status: 201 })

  } catch (error: any) {
    console.error('Moderation Content API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process moderation action', details: error.message },
      { status: 500 }
    )
  }
}

