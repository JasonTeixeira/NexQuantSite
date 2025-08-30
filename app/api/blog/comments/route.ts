import { NextRequest, NextResponse } from "next/server"
import { sanitizeInput } from "@/lib/security-utils"

// Comments database - In production, use your actual database
let commentsDatabase = [
  {
    id: 1,
    postId: 1,
    parentId: null, // null for top-level comments, number for replies
    authorId: "user-john-doe",
    authorName: "John Doe",
    authorType: "user", // user | guest_author | admin
    authorAvatar: "/avatars/john-doe.jpg",
    content: "Excellent analysis on market volatility! The insights on risk management are particularly valuable for new traders.",
    likes: 12,
    dislikes: 1,
    reported: false,
    approved: true,
    createdAt: "2024-01-15T14:30:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    edited: false,
    replies: 2
  },
  {
    id: 2,
    postId: 1,
    parentId: 1, // Reply to comment 1
    authorId: "guest-dr-evelyn",
    authorName: "Dr. Evelyn Reed",
    authorType: "guest_author",
    authorAvatar: "/authors/dr-evelyn-reed.jpg",
    content: "Thank you! I'm glad you found the risk management section helpful. What specific aspects of volatility trading are you most interested in?",
    likes: 8,
    dislikes: 0,
    reported: false,
    approved: true,
    createdAt: "2024-01-15T16:45:00Z",
    updatedAt: "2024-01-15T16:45:00Z",
    edited: false,
    replies: 1
  },
  {
    id: 3,
    postId: 1,
    parentId: 1,
    authorId: "user-sarah-trader",
    authorName: "Sarah Trader",
    authorType: "user",
    authorAvatar: "/avatars/sarah-trader.jpg",
    content: "I've been implementing these strategies in my own trading. The momentum indicators you mentioned have significantly improved my entry points!",
    likes: 15,
    dislikes: 0,
    reported: false,
    approved: true,
    createdAt: "2024-01-16T09:20:00Z",
    updatedAt: "2024-01-16T09:20:00Z",
    edited: false,
    replies: 0
  },
  {
    id: 4,
    postId: 2,
    parentId: null,
    authorId: "admin-1",
    authorName: "Nexural Team",
    authorType: "admin",
    authorAvatar: "/avatars/nexural-team.jpg",
    content: "Great post! We're featuring this in our weekly newsletter. The code examples are particularly well-documented.",
    likes: 25,
    dislikes: 0,
    reported: false,
    approved: true,
    createdAt: "2024-01-12T18:00:00Z",
    updatedAt: "2024-01-12T18:00:00Z",
    edited: false,
    replies: 0
  }
]

// Comment settings
let commentSettings = {
  enabled: true,
  requireModeration: true,
  allowReplies: true,
  maxDepth: 3, // Maximum reply depth
  allowAnonymous: false,
  allowGuestComments: true,
  enableVoting: true,
  enableReporting: true,
  autoApproveRegisteredUsers: true,
  wordFilter: ['spam', 'scam', 'promotion'], // Basic word filter
  rateLimiting: {
    maxCommentsPerHour: 10,
    maxCommentsPerDay: 50
  }
}

let nextCommentId = commentsDatabase.length + 1

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get('postId')
    const status = searchParams.get('status') // approved | pending | reported
    const authorType = searchParams.get('authorType')
    const includeReplies = searchParams.get('includeReplies') !== 'false'
    const sortBy = searchParams.get('sortBy') || 'newest' // newest | oldest | popular | controversial
    
    let filteredComments = [...commentsDatabase]
    
    // Filter by post ID
    if (postId) {
      filteredComments = filteredComments.filter(comment => 
        comment.postId === parseInt(postId)
      )
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'approved') {
        filteredComments = filteredComments.filter(comment => comment.approved)
      } else if (status === 'pending') {
        filteredComments = filteredComments.filter(comment => !comment.approved)
      } else if (status === 'reported') {
        filteredComments = filteredComments.filter(comment => comment.reported)
      }
    }
    
    // Filter by author type
    if (authorType && authorType !== 'all') {
      filteredComments = filteredComments.filter(comment => 
        comment.authorType === authorType
      )
    }
    
    // Sort comments
    switch (sortBy) {
      case 'oldest':
        filteredComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'popular':
        filteredComments.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
        break
      case 'controversial':
        filteredComments.sort((a, b) => Math.abs(b.likes - b.dislikes) - Math.abs(a.likes - a.dislikes))
        break
      default: // newest
        filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    
    // Build threaded structure if including replies
    let structuredComments = filteredComments
    if (includeReplies) {
      structuredComments = buildCommentTree(filteredComments)
    } else {
      // Only top-level comments
      structuredComments = filteredComments.filter(comment => comment.parentId === null)
    }
    
    // Calculate stats
    const stats = postId ? {
      totalComments: commentsDatabase.filter(c => c.postId === parseInt(postId)).length,
      approvedComments: commentsDatabase.filter(c => c.postId === parseInt(postId) && c.approved).length,
      pendingComments: commentsDatabase.filter(c => c.postId === parseInt(postId) && !c.approved).length,
      reportedComments: commentsDatabase.filter(c => c.postId === parseInt(postId) && c.reported).length,
      totalLikes: commentsDatabase.filter(c => c.postId === parseInt(postId)).reduce((sum, c) => sum + c.likes, 0),
      uniqueCommenters: [...new Set(commentsDatabase.filter(c => c.postId === parseInt(postId)).map(c => c.authorId))].length
    } : {
      totalComments: commentsDatabase.length,
      approvedComments: commentsDatabase.filter(c => c.approved).length,
      pendingComments: commentsDatabase.filter(c => !c.approved).length,
      reportedComments: commentsDatabase.filter(c => c.reported).length,
      totalLikes: commentsDatabase.reduce((sum, c) => sum + c.likes, 0),
      uniqueCommenters: [...new Set(commentsDatabase.map(c => c.authorId))].length
    }
    
    return NextResponse.json({
      success: true,
      comments: structuredComments,
      stats,
      settings: commentSettings,
      total: filteredComments.length
    })
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      postId, 
      parentId, 
      content, 
      authorId, 
      authorName, 
      authorType = 'user',
      authorAvatar
    } = body
    
    // Validate required fields
    if (!postId || !content || !authorId || !authorName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: postId, content, authorId, authorName' },
        { status: 400 }
      )
    }
    
    // Sanitize content
    const sanitizedContent = sanitizeInput(content)
    
    // Check for spam/filtered words
    const containsFilteredWords = commentSettings.wordFilter.some(word => 
      sanitizedContent.toLowerCase().includes(word.toLowerCase())
    )
    
    // Determine if comment should be auto-approved
    let approved = false
    if (authorType === 'admin') {
      approved = true
    } else if (authorType === 'guest_author') {
      approved = true // Guest authors are pre-approved
    } else if (commentSettings.autoApproveRegisteredUsers && authorType === 'user') {
      approved = !containsFilteredWords
    } else {
      approved = false // Requires manual moderation
    }
    
    // Validate reply depth
    if (parentId) {
      const parentComment = commentsDatabase.find(c => c.id === parentId)
      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: 'Parent comment not found' },
          { status: 404 }
        )
      }
      
      const depth = getCommentDepth(parentId, commentsDatabase)
      if (depth >= commentSettings.maxDepth) {
        return NextResponse.json(
          { success: false, error: `Maximum reply depth (${commentSettings.maxDepth}) exceeded` },
          { status: 400 }
        )
      }
    }
    
    const newComment = {
      id: nextCommentId++,
      postId: parseInt(postId),
      parentId: parentId || null,
      authorId,
      authorName,
      authorType,
      authorAvatar: authorAvatar || null,
      content: sanitizedContent,
      likes: 0,
      dislikes: 0,
      reported: false,
      approved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      edited: false,
      replies: 0
    }
    
    commentsDatabase.push(newComment)
    
    // Update parent comment reply count
    if (parentId) {
      const parentIndex = commentsDatabase.findIndex(c => c.id === parentId)
      if (parentIndex !== -1) {
        commentsDatabase[parentIndex].replies += 1
      }
    }
    
    return NextResponse.json({
      success: true,
      comment: newComment,
      message: approved ? 'Comment posted successfully' : 'Comment submitted for moderation'
    })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId, action, content, ...updateData } = body
    
    const commentIndex = commentsDatabase.findIndex(comment => comment.id === commentId)
    
    if (commentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    const comment = commentsDatabase[commentIndex]
    
    // Handle specific actions
    switch (action) {
      case 'approve':
        comment.approved = true
        break
      case 'reject':
        comment.approved = false
        break
      case 'report':
        comment.reported = true
        break
      case 'unreport':
        comment.reported = false
        break
      case 'like':
        comment.likes += 1
        break
      case 'unlike':
        comment.likes = Math.max(0, comment.likes - 1)
        break
      case 'dislike':
        comment.dislikes += 1
        break
      case 'undislike':
        comment.dislikes = Math.max(0, comment.dislikes - 1)
        break
      case 'edit':
        if (content) {
          comment.content = sanitizeInput(content)
          comment.edited = true
          comment.updatedAt = new Date().toISOString()
        }
        break
      default:
        // Regular update
        Object.assign(comment, updateData)
    }
    
    comment.updatedAt = new Date().toISOString()
    
    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment updated successfully'
    })
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const commentId = searchParams.get('commentId')
    
    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      )
    }
    
    const commentIndex = commentsDatabase.findIndex(comment => comment.id === parseInt(commentId))
    
    if (commentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    const comment = commentsDatabase[commentIndex]
    
    // Delete all replies to this comment as well
    const deleteCommentAndReplies = (parentId: number) => {
      const replies = commentsDatabase.filter(c => c.parentId === parentId)
      replies.forEach(reply => {
        deleteCommentAndReplies(reply.id)
        const replyIndex = commentsDatabase.findIndex(c => c.id === reply.id)
        if (replyIndex !== -1) {
          commentsDatabase.splice(replyIndex, 1)
        }
      })
    }
    
    deleteCommentAndReplies(comment.id)
    const deletedComment = commentsDatabase.splice(commentIndex, 1)[0]
    
    // Update parent comment reply count
    if (comment.parentId) {
      const parentIndex = commentsDatabase.findIndex(c => c.id === comment.parentId)
      if (parentIndex !== -1) {
        commentsDatabase[parentIndex].replies = Math.max(0, commentsDatabase[parentIndex].replies - 1)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Comment and all replies deleted successfully',
      deletedComment
    })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

// Helper function to build threaded comment structure
function buildCommentTree(comments: any[]): any[] {
  const commentMap = new Map()
  const rootComments: any[] = []
  
  // First pass: create map and identify root comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, children: [] })
    if (comment.parentId === null) {
      rootComments.push(commentMap.get(comment.id))
    }
  })
  
  // Second pass: build parent-child relationships
  comments.forEach(comment => {
    if (comment.parentId !== null) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.children.push(commentMap.get(comment.id))
      }
    }
  })
  
  return rootComments
}

// Helper function to calculate comment depth
function getCommentDepth(commentId: number, comments: any[]): number {
  const comment = comments.find(c => c.id === commentId)
  if (!comment || comment.parentId === null) {
    return 0
  }
  return 1 + getCommentDepth(comment.parentId, comments)
}


