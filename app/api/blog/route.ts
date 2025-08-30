import { NextRequest, NextResponse } from "next/server"

// Mock blog database - In production, this would be your actual database
let blogDatabase = [
  {
    id: 1,
    title: "Advanced Trading Strategies for 2024",
    slug: "advanced-trading-strategies-2024",
    excerpt: "Explore cutting-edge trading methodologies and AI-powered strategies that are reshaping the financial markets.",
    content: "# Advanced Trading Strategies for 2024\n\nThe financial markets are evolving rapidly...",
    featuredImage: "/blog/trading-strategies-2024.jpg",
    authorId: "admin-1",
    authorName: "Admin",
    authorType: "master", // master | guest
    category: "Trading Strategies",
    tags: ["AI Trading", "Algorithms", "2024", "Market Analysis"],
    status: "published", // draft | pending | published | archived
    publishedAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    views: 1250,
    likes: 89,
    revenue: 156.80,
    seoTitle: "Advanced Trading Strategies for 2024 | Nexural Trading",
    seoDescription: "Discover cutting-edge trading strategies and AI-powered methodologies that are transforming financial markets in 2024.",
    featured: true
  },
  {
    id: 2,
    title: "Understanding Market Volatility: A Quant's Perspective",
    slug: "understanding-market-volatility-quant-perspective",
    excerpt: "Dive deep into the metrics and models quants use to measure and predict market volatility.",
    content: "# Understanding Market Volatility\n\nMarket volatility is one of the most important concepts...",
    featuredImage: "/blog/market-volatility.jpg",
    authorId: "guest-dr-evelyn",
    authorName: "Dr. Evelyn Reed",
    authorType: "guest",
    category: "Market Analysis",
    tags: ["Volatility", "Quantitative Analysis", "Risk Management"],
    status: "published",
    publishedAt: "2024-01-12T14:30:00Z",
    createdAt: "2024-01-10T16:00:00Z",
    updatedAt: "2024-01-12T14:30:00Z",
    views: 892,
    likes: 67,
    revenue: 89.20,
    seoTitle: "Understanding Market Volatility: A Quant's Perspective",
    seoDescription: "Learn how quantitative analysts measure and predict market volatility using advanced mathematical models.",
    featured: true
  },
  {
    id: 3,
    title: "Building Your First Momentum Bot with Nexural",
    slug: "building-first-momentum-bot-nexural",
    excerpt: "A step-by-step guide to creating and deploying your first automated trading bot.",
    content: "# Building Your First Momentum Bot\n\nAutomated trading bots can help you execute strategies...",
    featuredImage: "/blog/momentum-bot.jpg",
    authorId: "guest-alex-ivanov",
    authorName: "Alex Ivanov",
    authorType: "guest",
    category: "Bot Development",
    tags: ["Trading Bots", "Automation", "Momentum", "Tutorial"],
    status: "pending", // Awaiting approval
    publishedAt: null,
    createdAt: "2024-01-20T11:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    views: 0,
    likes: 0,
    revenue: 0,
    seoTitle: "Building Your First Momentum Bot with Nexural Platform",
    seoDescription: "Complete tutorial on creating automated momentum trading bots using the Nexural platform.",
    featured: false
  }
]

// Blog settings and configuration
let blogSettings = {
  autoApprove: false, // Toggle for auto-approval of guest posts
  revenueShareEnabled: true,
  guestAuthorRevenueShare: 60, // 60% to guest author, 40% to platform
  moderationRequired: true,
  allowGuestTagCreation: true,
  allowGuestFileUploads: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'js', 'py', 'cpp', 'html', 'css']
}

let nextId = blogDatabase.length + 1

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const author = searchParams.get('author')
    const category = searchParams.get('category')
    const authorType = searchParams.get('authorType') // master | guest
    const featured = searchParams.get('featured')
    const includeRevenue = searchParams.get('includeRevenue') === 'true'
    
    let filteredPosts = [...blogDatabase]
    
    // Apply filters
    if (status && status !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.status === status)
    }
    
    if (author && author !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.authorId === author)
    }
    
    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === category)
    }
    
    if (authorType && authorType !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.authorType === authorType)
    }
    
    if (featured === 'true') {
      filteredPosts = filteredPosts.filter(post => post.featured)
    }
    
    // Sort by created date (newest first)
    filteredPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Calculate stats
    const stats = {
      totalPosts: blogDatabase.length,
      published: blogDatabase.filter(p => p.status === 'published').length,
      pending: blogDatabase.filter(p => p.status === 'pending').length,
      drafts: blogDatabase.filter(p => p.status === 'draft').length,
      totalViews: blogDatabase.reduce((sum, post) => sum + post.views, 0),
      totalRevenue: blogDatabase.reduce((sum, post) => sum + post.revenue, 0),
      guestPosts: blogDatabase.filter(p => p.authorType === 'guest').length,
      masterPosts: blogDatabase.filter(p => p.authorType === 'master').length
    }
    
    return NextResponse.json({
      success: true,
      posts: includeRevenue ? filteredPosts : filteredPosts.map(({revenue, ...post}) => post),
      stats,
      settings: blogSettings,
      total: filteredPosts.length
    })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { authorId, authorName, authorType = 'guest', autoPublish = false, ...postData } = body
    
    // Determine status based on settings and author type
    let status = 'draft'
    if (authorType === 'master') {
      status = postData.status || 'published'
    } else if (authorType === 'guest') {
      if (blogSettings.autoApprove || autoPublish) {
        status = 'published'
      } else {
        status = 'pending' // Requires manual approval
      }
    }
    
    const newPost = {
      id: nextId++,
      ...postData,
      authorId: authorId || 'unknown',
      authorName: authorName || 'Unknown Author',
      authorType,
      status,
      slug: generateSlug(postData.title),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: status === 'published' ? new Date().toISOString() : null,
      views: 0,
      likes: 0,
      revenue: 0
    }
    
    blogDatabase.push(newPost)
    
    return NextResponse.json({
      success: true,
      post: newPost,
      message: `Post ${status === 'pending' ? 'submitted for review' : 'created successfully'}`
    })
  } catch (error) {
    console.error('Failed to create blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, ...updateData } = body
    
    const postIndex = blogDatabase.findIndex(post => post.id === id)
    
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    const post = blogDatabase[postIndex]
    
    // Handle specific actions
    if (action === 'approve') {
      post.status = 'published'
      post.publishedAt = new Date().toISOString()
    } else if (action === 'reject') {
      post.status = 'archived'
    } else if (action === 'feature') {
      post.featured = true
    } else if (action === 'unfeature') {
      post.featured = false
    } else {
      // Regular update
      Object.assign(post, updateData)
    }
    
    post.updatedAt = new Date().toISOString()
    
    return NextResponse.json({
      success: true,
      post,
      message: 'Post updated successfully'
    })
  } catch (error) {
    console.error('Failed to update blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    const postIndex = blogDatabase.findIndex(post => post.id === parseInt(id))
    
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    const deletedPost = blogDatabase.splice(postIndex, 1)[0]
    
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      deletedPost
    })
  } catch (error) {
    console.error('Failed to delete blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}

// Helper function to generate URL-friendly slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

