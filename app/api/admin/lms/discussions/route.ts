import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - List all discussions with filtering and moderation info
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const courseId = searchParams.get('courseId')
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const authorEmail = searchParams.get('authorEmail')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Mock discussions data
    const mockDiscussions = [
      {
        id: 'discussion-1',
        title: 'Question about Market Structure - Order Book Dynamics',
        content: 'I\'m having trouble understanding how order book dynamics affect price movement. Can someone explain how large orders impact the market differently than small orders?',
        author: {
          id: 'student-1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          avatar: '/api/placeholder/40/40',
          role: 'student',
          reputation: 145
        },
        courseId: 'course-1',
        course: {
          id: 'course-1',
          title: 'Advanced Trading Strategies'
        },
        categoryId: 'cat-1',
        category: {
          id: 'cat-1',
          name: 'Q&A',
          color: '#3B82F6'
        },
        tags: ['order-book', 'market-structure', 'question'],
        status: 'active',
        isPinned: false,
        isLocked: false,
        views: 234,
        likes: 15,
        replies: 8,
        lastReply: {
          id: 'reply-15',
          authorName: 'Sarah Johnson',
          createdAt: '2024-01-20T14:30:00Z'
        },
        createdAt: '2024-01-18T10:15:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        
        // Moderation info
        moderationStatus: 'approved',
        reportCount: 0,
        moderatedAt: '2024-01-18T10:16:00Z',
        moderatedBy: 'auto-moderator',
        flaggedContent: [],
        
        // Engagement metrics
        engagement: {
          totalInteractions: 257,
          uniqueParticipants: 23,
          averageResponseTime: 4.2, // hours
          helpfulnessScore: 8.7
        }
      },
      {
        id: 'discussion-2',
        title: 'Best Resources for Learning Risk Management',
        content: 'What are your favorite books, websites, or tools for learning advanced risk management techniques? I\'m looking to deepen my understanding beyond the course material.',
        author: {
          id: 'student-2',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          avatar: '/api/placeholder/40/40',
          role: 'student',
          reputation: 89
        },
        courseId: 'course-2',
        course: {
          id: 'course-2',
          title: 'Risk Management Fundamentals'
        },
        categoryId: 'cat-2',
        category: {
          id: 'cat-2',
          name: 'Resources',
          color: '#10B981'
        },
        tags: ['resources', 'risk-management', 'learning'],
        status: 'active',
        isPinned: true,
        isLocked: false,
        views: 892,
        likes: 67,
        replies: 34,
        lastReply: {
          id: 'reply-78',
          authorName: 'Michael Chen',
          createdAt: '2024-01-20T16:45:00Z'
        },
        createdAt: '2024-01-15T14:20:00Z',
        updatedAt: '2024-01-20T16:45:00Z',
        
        moderationStatus: 'approved',
        reportCount: 0,
        moderatedAt: '2024-01-15T14:21:00Z',
        moderatedBy: 'admin-1',
        flaggedContent: [],
        
        engagement: {
          totalInteractions: 993,
          uniqueParticipants: 78,
          averageResponseTime: 2.1,
          helpfulnessScore: 9.4
        }
      },
      {
        id: 'discussion-3',
        title: 'Spam Post - Get Rich Quick Trading System!!!',
        content: 'Click here to learn my secret trading system that made me $10,000 in one day! Limited time offer...',
        author: {
          id: 'student-spam',
          name: 'Spam User',
          email: 'spam@fake.com',
          avatar: '/api/placeholder/40/40',
          role: 'student',
          reputation: -15
        },
        courseId: 'course-1',
        course: {
          id: 'course-1',
          title: 'Advanced Trading Strategies'
        },
        categoryId: 'cat-3',
        category: {
          id: 'cat-3',
          name: 'General Discussion',
          color: '#8B5CF6'
        },
        tags: ['spam'],
        status: 'hidden',
        isPinned: false,
        isLocked: true,
        views: 15,
        likes: 0,
        replies: 2,
        lastReply: null,
        createdAt: '2024-01-19T09:30:00Z',
        updatedAt: '2024-01-19T09:35:00Z',
        
        moderationStatus: 'rejected',
        reportCount: 12,
        moderatedAt: '2024-01-19T09:35:00Z',
        moderatedBy: 'admin-1',
        flaggedContent: ['spam', 'promotional'],
        
        engagement: {
          totalInteractions: 17,
          uniqueParticipants: 3,
          averageResponseTime: 0,
          helpfulnessScore: 0
        }
      },
      {
        id: 'discussion-4',
        title: 'Course Feedback - Market Structure Module',
        content: 'I really enjoyed the market structure module! The explanations were clear and the examples were practical. However, I think it would be helpful to have more interactive exercises.',
        author: {
          id: 'student-4',
          name: 'Alex Rodriguez',
          email: 'alex.rodriguez@email.com',
          avatar: '/api/placeholder/40/40',
          role: 'student',
          reputation: 203
        },
        courseId: 'course-1',
        course: {
          id: 'course-1',
          title: 'Advanced Trading Strategies'
        },
        categoryId: 'cat-4',
        category: {
          id: 'cat-4',
          name: 'Course Feedback',
          color: '#F59E0B'
        },
        tags: ['feedback', 'course-improvement', 'market-structure'],
        status: 'active',
        isPinned: false,
        isLocked: false,
        views: 156,
        likes: 28,
        replies: 6,
        lastReply: {
          id: 'reply-89',
          authorName: 'John Smith (Instructor)',
          createdAt: '2024-01-20T11:20:00Z'
        },
        createdAt: '2024-01-19T15:45:00Z',
        updatedAt: '2024-01-20T11:20:00Z',
        
        moderationStatus: 'approved',
        reportCount: 0,
        moderatedAt: '2024-01-19T15:46:00Z',
        moderatedBy: 'auto-moderator',
        flaggedContent: [],
        
        engagement: {
          totalInteractions: 190,
          uniqueParticipants: 12,
          averageResponseTime: 3.8,
          helpfulnessScore: 8.9
        }
      }
    ]

    // Apply filters
    let filteredDiscussions = mockDiscussions
    if (courseId) {
      filteredDiscussions = filteredDiscussions.filter(d => d.courseId === courseId)
    }
    if (categoryId) {
      filteredDiscussions = filteredDiscussions.filter(d => d.categoryId === categoryId)
    }
    if (status) {
      filteredDiscussions = filteredDiscussions.filter(d => d.status === status)
    }
    if (authorEmail) {
      filteredDiscussions = filteredDiscussions.filter(d => 
        d.author.email.toLowerCase().includes(authorEmail.toLowerCase())
      )
    }

    // Sorting
    filteredDiscussions.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        case 'replies':
          aValue = a.replies
          bValue = b.replies
          break
        case 'likes':
          aValue = a.likes
          bValue = b.likes
          break
        case 'reports':
          aValue = a.reportCount
          bValue = b.reportCount
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedDiscussions = filteredDiscussions.slice(offset, offset + limit)

    // Calculate moderation statistics
    const totalDiscussions = filteredDiscussions.length
    const pendingModeration = filteredDiscussions.filter(d => d.moderationStatus === 'pending').length
    const flaggedDiscussions = filteredDiscussions.filter(d => d.reportCount > 0).length
    const hiddenDiscussions = filteredDiscussions.filter(d => d.status === 'hidden').length

    return NextResponse.json({
      success: true,
      discussions: paginatedDiscussions,
      pagination: {
        page,
        limit,
        total: totalDiscussions,
        pages: Math.ceil(totalDiscussions / limit)
      },
      moderationStats: {
        totalDiscussions,
        pendingModeration,
        flaggedDiscussions,
        hiddenDiscussions,
        averageResponseTime: 3.2,
        totalReports: filteredDiscussions.reduce((sum, d) => sum + d.reportCount, 0)
      },
      categories: [
        { id: 'cat-1', name: 'Q&A', color: '#3B82F6', count: 145 },
        { id: 'cat-2', name: 'Resources', color: '#10B981', count: 67 },
        { id: 'cat-3', name: 'General Discussion', color: '#8B5CF6', count: 89 },
        { id: 'cat-4', name: 'Course Feedback', color: '#F59E0B', count: 23 }
      ],
      filters: {
        statuses: ['active', 'hidden', 'locked', 'archived'],
        moderationStatuses: ['approved', 'pending', 'rejected', 'flagged'],
        sortOptions: [
          { value: 'createdAt', label: 'Date Created' },
          { value: 'views', label: 'Views' },
          { value: 'replies', label: 'Replies' },
          { value: 'likes', label: 'Likes' },
          { value: 'reports', label: 'Reports' }
        ]
      }
    })

  } catch (error: any) {
    console.error('Discussions API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discussions', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Bulk moderation actions
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('moderate_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { operation, discussionIds, reason, moderationNote } = body

    if (!discussionIds || !Array.isArray(discussionIds) || discussionIds.length === 0) {
      return NextResponse.json(
        { error: 'Discussion IDs required' },
        { status: 400 }
      )
    }

    switch (operation) {
      case 'approve':
        console.log('Approving discussions:', discussionIds)
        return NextResponse.json({
          success: true,
          operation: 'approve',
          processedCount: discussionIds.length,
          message: `Successfully approved ${discussionIds.length} discussions`
        })

      case 'hide':
        if (!reason) {
          return NextResponse.json(
            { error: 'Reason required for hiding discussions' },
            { status: 400 }
          )
        }
        console.log('Hiding discussions:', discussionIds, 'Reason:', reason)
        return NextResponse.json({
          success: true,
          operation: 'hide',
          processedCount: discussionIds.length,
          message: `Successfully hid ${discussionIds.length} discussions`
        })

      case 'lock':
        console.log('Locking discussions:', discussionIds)
        return NextResponse.json({
          success: true,
          operation: 'lock',
          processedCount: discussionIds.length,
          message: `Successfully locked ${discussionIds.length} discussions`
        })

      case 'unlock':
        console.log('Unlocking discussions:', discussionIds)
        return NextResponse.json({
          success: true,
          operation: 'unlock',
          processedCount: discussionIds.length,
          message: `Successfully unlocked ${discussionIds.length} discussions`
        })

      case 'pin':
        console.log('Pinning discussions:', discussionIds)
        return NextResponse.json({
          success: true,
          operation: 'pin',
          processedCount: discussionIds.length,
          message: `Successfully pinned ${discussionIds.length} discussions`
        })

      case 'unpin':
        console.log('Unpinning discussions:', discussionIds)
        return NextResponse.json({
          success: true,
          operation: 'unpin',
          processedCount: discussionIds.length,
          message: `Successfully unpinned ${discussionIds.length} discussions`
        })

      case 'delete':
        if (!reason) {
          return NextResponse.json(
            { error: 'Reason required for deleting discussions' },
            { status: 400 }
          )
        }
        console.log('Deleting discussions:', discussionIds, 'Reason:', reason)
        return NextResponse.json({
          success: true,
          operation: 'delete',
          processedCount: discussionIds.length,
          message: `Successfully deleted ${discussionIds.length} discussions`
        })

      case 'move_category':
        const { newCategoryId } = body
        if (!newCategoryId) {
          return NextResponse.json(
            { error: 'New category ID required for moving discussions' },
            { status: 400 }
          )
        }
        console.log('Moving discussions to category:', discussionIds, newCategoryId)
        return NextResponse.json({
          success: true,
          operation: 'move_category',
          processedCount: discussionIds.length,
          message: `Successfully moved ${discussionIds.length} discussions to new category`
        })

      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported: approve, hide, lock, unlock, pin, unpin, delete, move_category' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Discussions API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to moderate discussions', details: error.message },
      { status: 500 }
    )
  }
}

