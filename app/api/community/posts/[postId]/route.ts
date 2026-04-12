// 💬 INDIVIDUAL COMMUNITY POST API - Production Implementation
// Real database integration replacing mock responses

import { NextRequest, NextResponse } from 'next/server'
import { PostsAPI, CommentsAPI } from '@/lib/api/production-community-client'
import { getUserFromRequest } from '@/lib/auth/production-auth'

// GET - Get specific post with detailed information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { searchParams } = new URL(request.url)
    const includeComments = searchParams.get('includeComments') !== 'false'
    const commentsPage = parseInt(searchParams.get('commentsPage') || '1')
    const commentsLimit = parseInt(searchParams.get('commentsLimit') || '20')

    // Get post with author details
    const post = await PostsAPI.getPost(postId)
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if post is accessible
    if (post.status !== 'published' || post.visibility === 'private') {
      const user = await getUserFromRequest(request)
      
      // Allow access if user is the author or admin
      if (!user || (post.authorId !== user.id && !['admin', 'super_admin'].includes(user.role))) {
        return NextResponse.json(
          { success: false, error: 'Post not accessible' },
          { status: 403 }
        )
      }
    }

    const response: any = {
      success: true,
      post
    }

    // Include comments if requested
    if (includeComments) {
      try {
        const commentsResult = await CommentsAPI.getPostComments(postId, {
          page: commentsPage,
          limit: commentsLimit,
          sortBy: 'created_at',
          sortOrder: 'asc'
        })
        
        response.comments = commentsResult.items
        response.commentsPagination = commentsResult.pagination
      } catch (error) {
        console.warn('Failed to load comments for post:', error)
        // Don't fail the whole request if comments fail
        response.comments = []
        response.commentsPagination = {
          page: 1,
          limit: commentsLimit,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Community post GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// PUT - Update specific post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if post exists and user has permission
    const existingPost = await PostsAPI.getPost(postId)
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin privileges
    if (existingPost.authorId !== user.id && !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      tags,
      tradingData,
      pollData,
      mediaAttachments,
      visibility,
      status,
      featured
    } = body

    // Validation
    if (title !== undefined) {
      if (!title?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Title cannot be empty' },
          { status: 400 }
        )
      }
      if (title.length > 500) {
        return NextResponse.json(
          { success: false, error: 'Title too long (max 500 characters)' },
          { status: 400 }
        )
      }
    }

    if (content !== undefined) {
      if (!content?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Content cannot be empty' },
          { status: 400 }
        )
      }
      if (content.length > 10000) {
        return NextResponse.json(
          { success: false, error: 'Content too long (max 10,000 characters)' },
          { status: 400 }
        )
      }
    }

    // Only admins can change featured status
    if (featured !== undefined && !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only admins can change featured status' },
        { status: 403 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.filter(Boolean) : []
    if (tradingData !== undefined) updateData.tradingData = tradingData
    if (pollData !== undefined) updateData.pollData = pollData
    if (mediaAttachments !== undefined) updateData.mediaAttachments = mediaAttachments
    if (visibility !== undefined) updateData.visibility = visibility
    if (status !== undefined) updateData.status = status
    if (featured !== undefined) updateData.featured = featured

    // Update post
    const updatedPost = await PostsAPI.updatePost(postId, updateData)

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, error: 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    })

  } catch (error: any) {
    console.error('Community post PUT error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if post exists and user has permission
    const existingPost = await PostsAPI.getPost(postId)
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin privileges
    if (existingPost.authorId !== user.id && !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Soft delete the post
    const deleted = await PostsAPI.deletePost(postId)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })

  } catch (error: any) {
    console.error('Community post DELETE error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}