import { NextRequest, NextResponse } from 'next/server'

// GET - List public discussions for students
export async function GET(request: NextRequest) {
  try {
    // In production, verify student authentication
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const courseId = searchParams.get('courseId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'updatedAt'

    // Mock discussions for students (only active, approved discussions)
    const mockDiscussions = [
      {
        id: 'discussion-1',
        title: 'Question about Market Structure - Order Book Dynamics',
        content: 'I\'m having trouble understanding how order book dynamics affect price movement. Can someone explain how large orders impact the market differently than small orders?',
        excerpt: 'I\'m having trouble understanding how order book dynamics affect price movement...',
        author: {
          id: 'student-1',
          name: 'John D.',
          avatar: '/api/placeholder/40/40',
          reputation: 145,
          badges: ['Active Learner', 'Quick Responder']
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
          color: '#3B82F6',
          icon: 'HelpCircle'
        },
        tags: ['order-book', 'market-structure', 'question'],
        isPinned: false,
        views: 234,
        likes: 15,
        replies: 8,
        hasUserLiked: false,
        hasUserBookmarked: false,
        lastReply: {
          id: 'reply-15',
          author: {
            id: 'instructor-1',
            name: 'John Smith',
            avatar: '/api/placeholder/40/40',
            role: 'instructor',
            badges: ['Expert', 'Instructor']
          },
          content: 'Great question! The key difference is market impact...',
          createdAt: '2024-01-20T14:30:00Z'
        },
        createdAt: '2024-01-18T10:15:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        isAnswered: true,
        bestAnswerId: 'reply-12'
      },
      {
        id: 'discussion-2',
        title: 'Best Resources for Learning Risk Management',
        content: 'What are your favorite books, websites, or tools for learning advanced risk management techniques?',
        excerpt: 'What are your favorite books, websites, or tools for learning advanced...',
        author: {
          id: 'student-2',
          name: 'Jane S.',
          avatar: '/api/placeholder/40/40',
          reputation: 89,
          badges: ['Helpful']
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
          color: '#10B981',
          icon: 'BookOpen'
        },
        tags: ['resources', 'risk-management', 'learning'],
        isPinned: true,
        views: 892,
        likes: 67,
        replies: 34,
        hasUserLiked: true,
        hasUserBookmarked: true,
        lastReply: {
          id: 'reply-78',
          author: {
            id: 'student-5',
            name: 'Michael C.',
            avatar: '/api/placeholder/40/40',
            role: 'student',
            badges: ['Active Learner']
          },
          content: 'I highly recommend "The Intelligent Investor" for foundational concepts...',
          createdAt: '2024-01-20T16:45:00Z'
        },
        createdAt: '2024-01-15T14:20:00Z',
        updatedAt: '2024-01-20T16:45:00Z',
        isAnswered: false,
        bestAnswerId: null
      },
      {
        id: 'discussion-4',
        title: 'Course Feedback - Market Structure Module',
        content: 'I really enjoyed the market structure module! The explanations were clear and the examples were practical.',
        excerpt: 'I really enjoyed the market structure module! The explanations were clear...',
        author: {
          id: 'student-4',
          name: 'Alex R.',
          avatar: '/api/placeholder/40/40',
          reputation: 203,
          badges: ['Top Contributor', 'Feedback Master']
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
          color: '#F59E0B',
          icon: 'MessageSquare'
        },
        tags: ['feedback', 'course-improvement', 'market-structure'],
        isPinned: false,
        views: 156,
        likes: 28,
        replies: 6,
        hasUserLiked: false,
        hasUserBookmarked: false,
        lastReply: {
          id: 'reply-89',
          author: {
            id: 'instructor-1',
            name: 'John Smith',
            avatar: '/api/placeholder/40/40',
            role: 'instructor',
            badges: ['Expert', 'Instructor']
          },
          content: 'Thank you for the feedback! We\'re working on adding more interactive exercises.',
          createdAt: '2024-01-20T11:20:00Z'
        },
        createdAt: '2024-01-19T15:45:00Z',
        updatedAt: '2024-01-20T11:20:00Z',
        isAnswered: true,
        bestAnswerId: 'reply-89'
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
    if (search) {
      const searchLower = search.toLowerCase()
      filteredDiscussions = filteredDiscussions.filter(d =>
        d.title.toLowerCase().includes(searchLower) ||
        d.content.toLowerCase().includes(searchLower) ||
        d.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Sorting
    filteredDiscussions.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      let aValue, bValue
      switch (sortBy) {
        case 'popular':
          aValue = a.likes + a.replies
          bValue = b.likes + b.replies
          break
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        case 'replies':
          aValue = a.replies
          bValue = b.replies
          break
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
      }
      
      return bValue > aValue ? 1 : -1
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedDiscussions = filteredDiscussions.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      discussions: paginatedDiscussions,
      pagination: {
        page,
        limit,
        total: filteredDiscussions.length,
        pages: Math.ceil(filteredDiscussions.length / limit)
      },
      categories: [
        { 
          id: 'cat-1', 
          name: 'Q&A', 
          color: '#3B82F6', 
          icon: 'HelpCircle',
          description: 'Ask questions and get help from the community',
          count: 145 
        },
        { 
          id: 'cat-2', 
          name: 'Resources', 
          color: '#10B981', 
          icon: 'BookOpen',
          description: 'Share and discover learning resources',
          count: 67 
        },
        { 
          id: 'cat-3', 
          name: 'General Discussion', 
          color: '#8B5CF6', 
          icon: 'MessageCircle',
          description: 'General conversations about trading and finance',
          count: 89 
        },
        { 
          id: 'cat-4', 
          name: 'Course Feedback', 
          color: '#F59E0B', 
          icon: 'MessageSquare',
          description: 'Share feedback about courses and suggest improvements',
          count: 23 
        }
      ],
      sortOptions: [
        { value: 'updatedAt', label: 'Latest Activity' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'views', label: 'Most Viewed' },
        { value: 'replies', label: 'Most Replies' }
      ]
    })

  } catch (error: any) {
    console.error('Public Discussions API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discussions', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new discussion
export async function POST(request: NextRequest) {
  try {
    // In production, verify student authentication and get user info
    const userId = 'current-user-id' // Mock
    
    const body = await request.json()
    const {
      title,
      content,
      courseId,
      categoryId,
      tags = []
    } = body

    // Validation
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, categoryId' },
        { status: 400 }
      )
    }

    if (title.length < 10 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 10 and 200 characters' },
        { status: 400 }
      )
    }

    if (content.length < 20 || content.length > 10000) {
      return NextResponse.json(
        { error: 'Content must be between 20 and 10000 characters' },
        { status: 400 }
      )
    }

    // Content moderation (basic)
    const moderationFlags = []
    const spamKeywords = ['get rich quick', 'guaranteed profit', 'click here', 'limited time']
    const contentLower = (title + ' ' + content).toLowerCase()
    
    spamKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        moderationFlags.push('spam')
      }
    })

    const newDiscussion = {
      id: `discussion-${Date.now()}`,
      title,
      content,
      excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
      authorId: userId,
      courseId: courseId || null,
      categoryId,
      tags: tags.filter(tag => tag.length > 0).slice(0, 5), // Max 5 tags
      status: moderationFlags.length > 0 ? 'pending' : 'active',
      moderationStatus: moderationFlags.length > 0 ? 'pending' : 'approved',
      flaggedContent: moderationFlags,
      isPinned: false,
      isLocked: false,
      views: 0,
      likes: 0,
      replies: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production:
    // 1. Save to database
    // 2. Send to moderation queue if flagged
    // 3. Notify relevant users/instructors
    // 4. Update user reputation
    console.log('Creating discussion:', newDiscussion)

    return NextResponse.json({
      success: true,
      discussion: newDiscussion,
      message: moderationFlags.length > 0 
        ? 'Discussion created and sent for moderation'
        : 'Discussion created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Public Discussions API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create discussion', details: error.message },
      { status: 500 }
    )
  }
}

