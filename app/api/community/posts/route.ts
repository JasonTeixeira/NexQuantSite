// 💬 COMMUNITY POSTS API - Production Implementation
// Real database integration replacing mock responses

import { NextRequest, NextResponse } from 'next/server'
import { PostsAPI, type PostsFilter } from '@/lib/api/production-community-client'
import { getUserFromRequest } from '@/lib/auth/production-auth'

// GET - List all posts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') as PostsFilter['type']
    const authorId = searchParams.get('authorId')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') as PostsFilter['sortBy'] || 'created_at'
    const sortOrder = searchParams.get('sortOrder') as PostsFilter['sortOrder'] || 'desc'
    const featured = searchParams.get('featured') === 'true'

    // If search query, use search endpoint
    if (search) {
      const searchResults = await PostsAPI.searchPosts(search, {
        type,
        page,
        limit
      })
      
      return NextResponse.json({
        success: true,
        posts: searchResults.items,
        pagination: searchResults.pagination,
        total: searchResults.pagination.total
      })
    }

    // Regular filtered query
    const filter: PostsFilter = {
      type,
      authorId,
      status: 'published',
      visibility: 'public',
      featured,
      sortBy,
      sortOrder,
      page,
      limit
    }

    const result = await PostsAPI.getPosts(filter)

    return NextResponse.json({
      success: true,
      posts: result.items,
      pagination: result.pagination,
      total: result.pagination.total
    })

  } catch (error: any) {
    console.error('Community posts GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch posts',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type = 'insight',
      title,
      content,
      tags = [],
      tradingData,
      pollData,
      mediaAttachments = [],
      visibility = 'public'
    } = body

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    if (title.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Title too long (max 500 characters)' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Content too long (max 10,000 characters)' },
        { status: 400 }
      )
    }

    // Validate trading data if provided
    if (type === 'trade' && tradingData) {
      const requiredFields = ['symbol', 'action']
      for (const field of requiredFields) {
        if (!tradingData[field]) {
          return NextResponse.json(
            { success: false, error: `Trading data field '${field}' is required for trade posts` },
            { status: 400 }
          )
        }
      }
    }

    // Create post
    const post = await PostsAPI.createPost(user.id, {
      type,
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      tradingData,
      pollData,
      mediaAttachments,
      visibility
    })

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post
    })

  } catch (error: any) {
    console.error('Community posts POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// PUT - Update post (bulk update for multiple posts)
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { postIds, updates } = body

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post IDs array is required' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Updates object is required' },
        { status: 400 }
      )
    }

    const results = []
    
    // Process each post
    for (const postId of postIds) {
      try {
        // Check if user owns this post or is admin
        const existingPost = await PostsAPI.getPost(postId)
        if (!existingPost) {
          results.push({ postId, success: false, error: 'Post not found' })
          continue
        }

        if (existingPost.authorId !== user.id && !['admin', 'super_admin'].includes(user.role)) {
          results.push({ postId, success: false, error: 'Permission denied' })
          continue
        }

        const updatedPost = await PostsAPI.updatePost(postId, updates)
        results.push({ 
          postId, 
          success: !!updatedPost, 
          post: updatedPost,
          error: updatedPost ? undefined : 'Update failed'
        })
      } catch (error: any) {
        results.push({ postId, success: false, error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk update completed',
      results
    })

  } catch (error: any) {
    console.error('Community posts PUT error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update posts',
        details: error.message 
      },
      { status: 500 }
    )
  }
}