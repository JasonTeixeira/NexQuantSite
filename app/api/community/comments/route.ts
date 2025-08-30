// 💬 COMMUNITY COMMENTS API
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'

// Mock comments data
let mockComments = [
  {
    id: 'comment-1',
    postId: 'post-1',
    content: 'Great insights! This really helped me understand the market better.',
    authorId: 'user-1',
    authorName: 'Admin User',
    authorAvatar: '/avatars/admin.jpg',
    likes: 12,
    replies: [],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    
    let filteredComments = [...mockComments]
    if (postId) {
      filteredComments = filteredComments.filter(comment => comment.postId === postId)
    }
    
    return NextResponse.json({
      success: true,
      comments: filteredComments,
      total: filteredComments.length
    })
  } catch (error: any) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { postId, content } = body
    
    if (!postId || !content) {
      return NextResponse.json(
        { success: false, error: 'Post ID and content required' },
        { status: 400 }
      )
    }
    
    const newComment = {
      id: `comment-${Date.now()}`,
      postId,
      content,
      authorId: authResult.userId || 'user-1',
      authorName: authResult.userName || 'User',
      authorAvatar: '/avatars/default.jpg',
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockComments.push(newComment)
    
    return NextResponse.json({
      success: true,
      message: 'Comment created successfully',
      comment: newComment
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

// Like a comment
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { commentId, action } = await request.json()
    
    const comment = mockComments.find(c => c.id === commentId)
    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    if (action === 'like') {
      comment.likes++
    } else if (action === 'unlike') {
      comment.likes = Math.max(0, comment.likes - 1)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Comment updated',
      comment
    })
  } catch (error: any) {
    console.error('Update comment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

