import { NextRequest, NextResponse } from 'next/server'

// GET - Get user notifications with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // In production, verify user authentication
    const userId = 'current-user-id' // Mock

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'all', 'mentions', 'follows', 'reactions', 'comments', 'posts', 'system'
    const status = searchParams.get('status') || 'all' // 'unread', 'read', 'archived'
    const priority = searchParams.get('priority') // 'high', 'medium', 'low'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const markAsRead = searchParams.get('markAsRead') === 'true'

    // Mock notifications data
    const mockNotifications = [
      {
        id: 'notif-1',
        type: 'mention',
        priority: 'high',
        title: 'You were mentioned in a comment',
        message: '@trading_guru mentioned you in their comment: "Great analysis @current_user! What do you think about the volume confirmation?"',
        data: {
          mentionerId: 'user-1',
          mentionerUsername: 'trading_guru',
          mentionerDisplayName: 'Trading Guru',
          mentionerAvatar: '/api/placeholder/40/40',
          contentType: 'comment',
          contentId: 'comment-123',
          postId: 'post-456',
          postTitle: 'TSLA Technical Breakout Analysis'
        },
        actionUrl: '/community/posts/post-456#comment-123',
        isRead: false,
        isArchived: false,
        createdAt: '2024-01-20T14:45:00Z',
        expiresAt: null,
        category: 'social'
      },
      {
        id: 'notif-2',
        type: 'reaction',
        priority: 'medium',
        title: 'Your post received reactions',
        message: '5 users reacted to your post "My Risk Management Strategy"',
        data: {
          contentType: 'post',
          contentId: 'post-789',
          contentTitle: 'My Risk Management Strategy',
          reactions: [
            { type: 'like', count: 3 },
            { type: 'genius', count: 2 }
          ],
          recentReactors: [
            {
              userId: 'user-2',
              username: 'options_master',
              displayName: 'Options Master',
              avatar: '/api/placeholder/30/30',
              reactionType: 'genius'
            },
            {
              userId: 'user-3',
              username: 'swing_trader',
              displayName: 'Swing Trader',
              avatar: '/api/placeholder/30/30',
              reactionType: 'like'
            }
          ]
        },
        actionUrl: '/community/posts/post-789',
        isRead: false,
        isArchived: false,
        createdAt: '2024-01-20T13:30:00Z',
        expiresAt: null,
        category: 'engagement'
      },
      {
        id: 'notif-3',
        type: 'follow',
        priority: 'medium',
        title: 'New follower',
        message: 'market_wizard started following you',
        data: {
          followerId: 'user-4',
          followerUsername: 'market_wizard',
          followerDisplayName: 'Market Wizard',
          followerAvatar: '/api/placeholder/40/40',
          followerLevel: 'Elite',
          followerVerified: true,
          followerStats: {
            followers: 8945,
            posts: 234,
            reputation: 12450
          }
        },
        actionUrl: '/community/users/user-4',
        isRead: true,
        isArchived: false,
        createdAt: '2024-01-20T12:15:00Z',
        expiresAt: null,
        category: 'social'
      },
      {
        id: 'notif-4',
        type: 'comment',
        priority: 'high',
        title: 'New comment on your post',
        message: 'crypto_trader commented on your post "Bitcoin Technical Analysis"',
        data: {
          commenterId: 'user-5',
          commenterUsername: 'crypto_trader',
          commenterDisplayName: 'Crypto Trader',
          commenterAvatar: '/api/placeholder/40/40',
          commentId: 'comment-456',
          commentExcerpt: 'Excellent analysis! I think we might see a breakout above 42k based on the volume patterns...',
          postId: 'post-321',
          postTitle: 'Bitcoin Technical Analysis'
        },
        actionUrl: '/community/posts/post-321#comment-456',
        isRead: false,
        isArchived: false,
        createdAt: '2024-01-20T11:45:00Z',
        expiresAt: null,
        category: 'engagement'
      },
      {
        id: 'notif-5',
        type: 'system',
        priority: 'low',
        title: 'Weekly community digest',
        message: 'Your weekly summary: 5 new followers, 23 reactions, 12 comments',
        data: {
          digestType: 'weekly',
          stats: {
            newFollowers: 5,
            totalReactions: 23,
            totalComments: 12,
            postViews: 1247,
            communityRank: 156
          },
          highlights: [
            'Your post "Options Strategy Guide" was trending',
            'You received the "Helpful Contributor" badge'
          ]
        },
        actionUrl: '/community/profile/analytics',
        isRead: true,
        isArchived: false,
        createdAt: '2024-01-20T09:00:00Z',
        expiresAt: '2024-01-27T09:00:00Z',
        category: 'system'
      },
      {
        id: 'notif-6',
        type: 'achievement',
        priority: 'high',
        title: 'New achievement unlocked!',
        message: 'Congratulations! You earned the "Top Contributor" badge',
        data: {
          achievementId: 'badge-top-contributor',
          achievementName: 'Top Contributor',
          achievementDescription: 'Earned by being one of the most helpful community members',
          achievementIcon: '🏆',
          achievementRarity: 'rare',
          requirement: '100 helpful reactions received',
          progress: {
            current: 100,
            required: 100,
            percentage: 100
          }
        },
        actionUrl: '/community/profile/achievements',
        isRead: false,
        isArchived: false,
        createdAt: '2024-01-19T18:30:00Z',
        expiresAt: null,
        category: 'achievement'
      },
      {
        id: 'notif-7',
        type: 'moderation',
        priority: 'high',
        title: 'Content under review',
        message: 'Your comment has been flagged for review. We\'ll notify you once the review is complete.',
        data: {
          contentType: 'comment',
          contentId: 'comment-789',
          moderationReason: 'Reported by community member',
          reviewStatus: 'pending',
          estimatedReviewTime: '24 hours',
          appealAvailable: true
        },
        actionUrl: '/community/moderation/appeals',
        isRead: false,
        isArchived: false,
        createdAt: '2024-01-19T16:20:00Z',
        expiresAt: '2024-01-22T16:20:00Z',
        category: 'moderation'
      },
      {
        id: 'notif-8',
        type: 'post_performance',
        priority: 'low',
        title: 'Your post is performing well',
        message: 'Your post "Market Outlook 2024" has reached 1,000 views!',
        data: {
          postId: 'post-999',
          postTitle: 'Market Outlook 2024',
          milestone: '1000_views',
          currentViews: 1247,
          currentReactions: 56,
          currentComments: 23,
          performanceScore: 8.7,
          ranking: 'top_10_this_week'
        },
        actionUrl: '/community/posts/post-999',
        isRead: true,
        isArchived: false,
        createdAt: '2024-01-19T14:10:00Z',
        expiresAt: null,
        category: 'performance'
      }
    ]

    // Apply filters
    let filteredNotifications = [...mockNotifications]

    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(notif => notif.type === type)
    }

    if (status !== 'all') {
      if (status === 'unread') {
        filteredNotifications = filteredNotifications.filter(notif => !notif.isRead)
      } else if (status === 'read') {
        filteredNotifications = filteredNotifications.filter(notif => notif.isRead)
      } else if (status === 'archived') {
        filteredNotifications = filteredNotifications.filter(notif => notif.isArchived)
      }
    }

    if (priority) {
      filteredNotifications = filteredNotifications.filter(notif => notif.priority === priority)
    }

    // Sort by created date (newest first)
    filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Pagination
    const offset = (page - 1) * limit
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit)

    // Mark as read if requested
    if (markAsRead) {
      const unreadIds = paginatedNotifications
        .filter(notif => !notif.isRead)
        .map(notif => notif.id)
      
      // In production, update read status in database
      console.log('Marking notifications as read:', unreadIds)
    }

    // Calculate notification summary
    const notificationSummary = {
      total: mockNotifications.length,
      unread: mockNotifications.filter(n => !n.isRead).length,
      highPriority: mockNotifications.filter(n => n.priority === 'high' && !n.isRead).length,
      byType: {
        mentions: mockNotifications.filter(n => n.type === 'mention').length,
        follows: mockNotifications.filter(n => n.type === 'follow').length,
        reactions: mockNotifications.filter(n => n.type === 'reaction').length,
        comments: mockNotifications.filter(n => n.type === 'comment').length,
        system: mockNotifications.filter(n => n.type === 'system').length,
        achievements: mockNotifications.filter(n => n.type === 'achievement').length
      }
    }

    return NextResponse.json({
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: filteredNotifications.length,
        pages: Math.ceil(filteredNotifications.length / limit)
      },
      summary: notificationSummary,
      filters: {
        types: [
          { value: 'mention', label: 'Mentions', count: notificationSummary.byType.mentions },
          { value: 'follow', label: 'Follows', count: notificationSummary.byType.follows },
          { value: 'reaction', label: 'Reactions', count: notificationSummary.byType.reactions },
          { value: 'comment', label: 'Comments', count: notificationSummary.byType.comments },
          { value: 'achievement', label: 'Achievements', count: notificationSummary.byType.achievements },
          { value: 'system', label: 'System', count: notificationSummary.byType.system }
        ],
        priorities: [
          { value: 'high', label: 'High Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'low', label: 'Low Priority' }
        ]
      }
    })

  } catch (error: any) {
    console.error('Notifications API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new notification (internal system use)
export async function POST(request: NextRequest) {
  try {
    // In production, verify system/admin authentication
    const body = await request.json()
    const {
      recipientId,
      type,
      priority = 'medium',
      title,
      message,
      data = {},
      actionUrl,
      expiresAt,
      category = 'general'
    } = body

    // Validation
    const validTypes = [
      'mention', 'reaction', 'follow', 'comment', 'post', 'message',
      'system', 'achievement', 'moderation', 'post_performance'
    ]
    
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    if (!recipientId || !title || !message) {
      return NextResponse.json(
        { error: 'recipientId, title, and message are required' },
        { status: 400 }
      )
    }

    // Create notification
    const notificationId = `notif-${Date.now()}`
    const notification = {
      id: notificationId,
      recipientId,
      type,
      priority,
      title,
      message,
      data,
      actionUrl: actionUrl || null,
      isRead: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      category,
      
      // Delivery tracking
      delivery: {
        status: 'pending',
        channels: [],
        attempts: 0,
        deliveredAt: null,
        readAt: null
      }
    }

    // Determine delivery channels based on user preferences and notification priority
    const deliveryChannels = determineDeliveryChannels(type, priority)
    notification.delivery.channels = deliveryChannels

    // In production:
    // 1. Save notification to database
    // 2. Check user notification preferences
    // 3. Queue for real-time delivery (WebSocket)
    // 4. Queue for email delivery if enabled
    // 5. Queue for push notification if enabled
    // 6. Update user's unread notification count

    console.log('Creating notification:', notification)

    // Mock delivery results
    const deliveryResults = {
      realtime: { status: 'sent', sentAt: new Date().toISOString() },
      email: priority === 'high' ? { status: 'queued' } : null,
      push: deliveryChannels.includes('push') ? { status: 'queued' } : null
    }

    return NextResponse.json({
      success: true,
      notification,
      deliveryResults,
      message: 'Notification created and queued for delivery'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Notifications API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    )
  }
}

// Helper function to determine delivery channels
function determineDeliveryChannels(type: string, priority: string): string[] {
  const channels = ['realtime'] // Always deliver via WebSocket

  // Add email for high priority or specific types
  if (priority === 'high' || ['mention', 'moderation', 'achievement'].includes(type)) {
    channels.push('email')
  }

  // Add push notifications for urgent types
  if (['mention', 'comment', 'follow'].includes(type)) {
    channels.push('push')
  }

  return channels
}

