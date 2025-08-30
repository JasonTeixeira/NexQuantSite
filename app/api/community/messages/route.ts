import { NextRequest, NextResponse } from 'next/server'

// GET - Get user's messages/conversations
export async function GET(request: NextRequest) {
  try {
    // In production, verify user authentication
    const userId = 'current-user-id' // Mock

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'all', 'unread', 'sent', 'received'
    const search = searchParams.get('search') // Search by participant or content
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Mock conversations data
    const mockConversations = [
      {
        id: 'conv-1',
        participants: [
          {
            id: 'current-user-id',
            username: 'current_user',
            displayName: 'Current User',
            avatar: '/api/placeholder/40/40'
          },
          {
            id: 'user-1',
            username: 'trading_guru',
            displayName: 'Trading Guru',
            avatar: '/api/placeholder/40/40',
            verified: true,
            level: 'Expert',
            isOnline: true,
            lastSeen: '2024-01-20T15:30:00Z'
          }
        ],
        lastMessage: {
          id: 'msg-1',
          senderId: 'user-1',
          content: 'Thanks for sharing that TSLA analysis! Really helpful breakdown of the technical setup. Have you considered the upcoming earnings impact?',
          sentAt: '2024-01-20T14:45:00Z',
          isRead: false,
          messageType: 'text'
        },
        unreadCount: 1,
        totalMessages: 8,
        createdAt: '2024-01-19T16:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z',
        isArchived: false,
        isMuted: false,
        isPinned: false,
        labels: ['trading']
      },
      {
        id: 'conv-2',
        participants: [
          {
            id: 'current-user-id',
            username: 'current_user',
            displayName: 'Current User',
            avatar: '/api/placeholder/40/40'
          },
          {
            id: 'user-2',
            username: 'options_master',
            displayName: 'Options Master',
            avatar: '/api/placeholder/40/40',
            verified: true,
            level: 'Professional',
            isOnline: false,
            lastSeen: '2024-01-20T12:15:00Z'
          }
        ],
        lastMessage: {
          id: 'msg-2',
          senderId: 'current-user-id',
          content: 'Got it, thanks for the explanation on implied volatility. That makes much more sense now! 📊',
          sentAt: '2024-01-20T11:30:00Z',
          isRead: true,
          messageType: 'text'
        },
        unreadCount: 0,
        totalMessages: 15,
        createdAt: '2024-01-18T09:20:00Z',
        updatedAt: '2024-01-20T11:30:00Z',
        isArchived: false,
        isMuted: false,
        isPinned: true,
        labels: ['options', 'education']
      },
      {
        id: 'conv-3',
        participants: [
          {
            id: 'current-user-id',
            username: 'current_user',
            displayName: 'Current User',
            avatar: '/api/placeholder/40/40'
          },
          {
            id: 'user-3',
            username: 'crypto_degen',
            displayName: 'Crypto Degen',
            avatar: '/api/placeholder/40/40',
            verified: false,
            level: 'Intermediate',
            isOnline: true,
            lastSeen: '2024-01-20T15:25:00Z'
          }
        ],
        lastMessage: {
          id: 'msg-3',
          senderId: 'user-3',
          content: 'BTC looking strong above 42k! Check out this setup I am watching...',
          sentAt: '2024-01-20T09:15:00Z',
          isRead: true,
          messageType: 'text',
          attachments: [
            {
              type: 'image',
              url: '/api/placeholder/chart/btc-setup.png',
              thumbnail: '/api/placeholder/chart/btc-setup-thumb.png',
              filename: 'btc-setup.png'
            }
          ]
        },
        unreadCount: 0,
        totalMessages: 23,
        createdAt: '2024-01-15T14:10:00Z',
        updatedAt: '2024-01-20T09:15:00Z',
        isArchived: false,
        isMuted: false,
        isPinned: false,
        labels: ['crypto']
      }
    ]

    // Filter conversations
    let filteredConversations = [...mockConversations]

    if (type === 'unread') {
      filteredConversations = filteredConversations.filter(conv => conv.unreadCount > 0)
    } else if (type === 'sent') {
      filteredConversations = filteredConversations.filter(conv => 
        conv.lastMessage.senderId === userId
      )
    } else if (type === 'received') {
      filteredConversations = filteredConversations.filter(conv => 
        conv.lastMessage.senderId !== userId
      )
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredConversations = filteredConversations.filter(conv =>
        conv.participants.some(p => 
          p.username.toLowerCase().includes(searchLower) ||
          p.displayName.toLowerCase().includes(searchLower)
        ) ||
        conv.lastMessage.content.toLowerCase().includes(searchLower)
      )
    }

    // Sort by last message time (most recent first)
    filteredConversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    // Pagination
    const offset = (page - 1) * limit
    const paginatedConversations = filteredConversations.slice(offset, offset + limit)

    // Calculate summary stats
    const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
    const totalConversations = mockConversations.length
    const activeConversations = mockConversations.filter(conv => 
      new Date(conv.updatedAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
    ).length

    return NextResponse.json({
      success: true,
      conversations: paginatedConversations,
      pagination: {
        page,
        limit,
        total: filteredConversations.length,
        pages: Math.ceil(filteredConversations.length / limit)
      },
      summary: {
        totalConversations,
        totalUnread,
        activeConversations,
        pinnedConversations: mockConversations.filter(c => c.isPinned).length,
        archivedConversations: mockConversations.filter(c => c.isArchived).length
      },
      filters: {
        types: [
          { value: 'all', label: 'All Messages' },
          { value: 'unread', label: 'Unread' },
          { value: 'sent', label: 'Sent' },
          { value: 'received', label: 'Received' }
        ]
      }
    })

  } catch (error: any) {
    console.error('Messages API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Send new message or start conversation
export async function POST(request: NextRequest) {
  try {
    // In production, verify user authentication
    const userId = 'current-user-id' // Mock

    const body = await request.json()
    const {
      recipientId,
      content,
      conversationId,
      messageType = 'text',
      attachments = []
    } = body

    // Validation
    if (!recipientId && !conversationId) {
      return NextResponse.json(
        { error: 'Either recipientId or conversationId is required' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Message content must be 2000 characters or less' },
        { status: 400 }
      )
    }

    if (userId === recipientId) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      )
    }

    // Check if user can message the recipient (privacy settings)
    const canMessage = true // Mock check - would verify user's privacy settings

    if (!canMessage) {
      return NextResponse.json(
        { error: 'User does not accept messages from you' },
        { status: 403 }
      )
    }

    // Content moderation
    const moderationFlags = []
    const spamKeywords = ['click here', 'buy now', 'guaranteed profit', 'limited time']
    const contentLower = content.toLowerCase()
    
    spamKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        moderationFlags.push('spam')
      }
    })

    const messageId = `msg-${Date.now()}`
    const newConversationId = conversationId || `conv-${Date.now()}`

    const newMessage = {
      id: messageId,
      conversationId: newConversationId,
      senderId: userId,
      recipientId,
      content: content.trim(),
      messageType,
      attachments: attachments.slice(0, 5), // Max 5 attachments
      sentAt: new Date().toISOString(),
      isRead: false,
      isDelivered: true,
      isEdited: false,
      reactions: [],
      replyTo: null,
      status: moderationFlags.length > 0 ? 'pending_review' : 'sent',
      moderationFlags
    }

    // In production:
    // 1. Save message to database
    // 2. Create conversation if it doesn't exist
    // 3. Update conversation last message and timestamp
    // 4. Send real-time notification to recipient
    // 5. Check rate limiting
    // 6. Process attachments if any
    console.log('Sending message:', newMessage)

    return NextResponse.json({
      success: true,
      message: newMessage,
      conversationId: newConversationId,
      status: moderationFlags.length > 0 ? 'pending_review' : 'sent',
      notice: moderationFlags.length > 0 ? 'Message sent for moderation review' : undefined
    }, { status: 201 })

  } catch (error: any) {
    console.error('Messages API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    )
  }
}

