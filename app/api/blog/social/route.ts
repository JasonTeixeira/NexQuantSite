import { NextRequest, NextResponse } from "next/server"

// Social Media Integration Service
interface SocialMediaPost {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'telegram' | 'discord'
  content: string
  mediaUrls?: string[]
  hashtags?: string[]
  scheduledFor?: string
  status: 'draft' | 'scheduled' | 'posted' | 'failed'
  postedAt?: string
  postId?: string
  engagement?: {
    likes: number
    comments: number
    shares: number
    clicks: number
  }
}

interface SocialMediaConfig {
  enabled: boolean
  autoPost: boolean
  platforms: {
    [key: string]: {
      enabled: boolean
      accessToken?: string
      settings: any
    }
  }
  templates: {
    [key: string]: string
  }
  hashtags: {
    default: string[]
    trading: string[]
    analysis: string[]
    education: string[]
  }
}

// Mock social media posts database
let socialMediaPosts: (SocialMediaPost & { id: number, blogPostId: number, createdAt: string })[] = [
  {
    id: 1,
    blogPostId: 1,
    platform: 'twitter',
    content: '🚀 New blog post: Advanced Trading Strategies for 2024 - Explore cutting-edge methodologies and AI-powered strategies reshaping financial markets! #Trading #AI #FinTech #Algorithms',
    hashtags: ['Trading', 'AI', 'FinTech', 'Algorithms'],
    status: 'posted',
    postedAt: '2024-01-15T10:15:00Z',
    postId: 'tweet_123456789',
    createdAt: '2024-01-15T10:00:00Z',
    engagement: { likes: 47, comments: 12, shares: 23, clicks: 156 }
  },
  {
    id: 2,
    blogPostId: 1,
    platform: 'linkedin',
    content: '📊 Just published: Advanced Trading Strategies for 2024\n\nThe financial markets are evolving rapidly with AI and machine learning. Our latest post explores cutting-edge trading methodologies that are reshaping how we approach market analysis.\n\nKey topics covered:\n• AI-powered algorithmic strategies\n• Risk management in volatile markets\n• Technical analysis automation\n• Portfolio optimization techniques\n\n#TradingStrategies #AI #FinTech #MarketAnalysis #AlgorithmicTrading',
    hashtags: ['TradingStrategies', 'AI', 'FinTech', 'MarketAnalysis'],
    status: 'posted',
    postedAt: '2024-01-15T10:30:00Z',
    postId: 'linkedin_post_456789',
    createdAt: '2024-01-15T10:00:00Z',
    engagement: { likes: 89, comments: 24, shares: 15, clicks: 234 }
  }
]

// Social media configuration
let socialConfig: SocialMediaConfig = {
  enabled: true,
  autoPost: true,
  platforms: {
    twitter: {
      enabled: true,
      settings: {
        maxLength: 280,
        includeImage: true,
        useThreads: true,
        scheduleDelay: 0 // minutes after blog post publish
      }
    },
    linkedin: {
      enabled: true,
      settings: {
        maxLength: 3000,
        includeImage: true,
        useRichFormatting: true,
        scheduleDelay: 15
      }
    },
    facebook: {
      enabled: false,
      settings: {
        maxLength: 63206,
        includeImage: true,
        scheduleDelay: 30
      }
    },
    telegram: {
      enabled: true,
      settings: {
        channelId: '@nexural_trading',
        includeImage: true,
        scheduleDelay: 60
      }
    },
    discord: {
      enabled: true,
      settings: {
        webhookUrl: 'https://discord.com/api/webhooks/...',
        channelName: 'blog-updates',
        scheduleDelay: 45
      }
    }
  },
  templates: {
    twitter: '🚀 New blog post: {title} - {excerpt} #Trading #{category}',
    linkedin: '📊 Just published: {title}\n\n{excerpt}\n\nKey topics covered:\n{keyPoints}\n\n#{category} #Trading #FinTech',
    facebook: '📈 New Trading Insight: {title}\n\n{excerpt}\n\n{fullUrl}',
    telegram: '📊 <b>New Blog Post</b>\n\n<b>{title}</b>\n\n{excerpt}\n\n👉 <a href="{url}">Read more</a>',
    discord: '📊 **New Blog Post Published**\n\n**{title}**\n{excerpt}\n\n🔗 {url}'
  },
  hashtags: {
    default: ['Trading', 'FinTech', 'Investment'],
    trading: ['Trading', 'TradingStrategies', 'MarketAnalysis', 'TechnicalAnalysis', 'AlgorithmicTrading'],
    analysis: ['MarketAnalysis', 'TechnicalAnalysis', 'FundamentalAnalysis', 'DataAnalysis'],
    education: ['TradingEducation', 'LearnTrading', 'TradingTips', 'FinancialLiteracy']
  }
}

let nextPostId = socialMediaPosts.length + 1

class SocialMediaService {
  // Generate social media content
  generateContent(platform: string, blogPost: any): SocialMediaPost {
    const template = socialConfig.templates[platform] || socialConfig.templates.twitter
    const platformSettings = socialConfig.platforms[platform]?.settings || {}
    
    // Extract key points from content (simplified)
    const keyPoints = this.extractKeyPoints(blogPost.content)
    
    // Select appropriate hashtags
    const hashtags = this.selectHashtags(blogPost.category, blogPost.tags, platform)
    
    // Replace template variables
    let content = template
      .replace('{title}', blogPost.title)
      .replace('{excerpt}', this.truncateText(blogPost.excerpt, 150))
      .replace('{category}', blogPost.category.replace(' ', ''))
      .replace('{keyPoints}', keyPoints.join('\n• '))
      .replace('{url}', `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blogPost.slug}`)
      .replace('{fullUrl}', `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blogPost.slug}`)

    // Platform-specific adjustments
    content = this.adjustContentForPlatform(content, platform, platformSettings.maxLength)

    return {
      platform: platform as any,
      content,
      hashtags,
      status: 'draft',
      scheduledFor: this.calculateScheduleTime(platformSettings.scheduleDelay || 0)
    }
  }

  // Extract key points from blog content
  private extractKeyPoints(content: string): string[] {
    // Simple extraction - look for bullet points, numbered lists, or headers
    const points: string[] = []
    
    // Extract bullet points
    const bulletPoints = content.match(/[•\-\*]\s+([^\n]+)/g)
    if (bulletPoints) {
      points.push(...bulletPoints.map(point => point.replace(/[•\-\*]\s+/, '')))
    }
    
    // Extract numbered lists
    const numberedPoints = content.match(/\d+\.\s+([^\n]+)/g)
    if (numberedPoints) {
      points.push(...numberedPoints.map(point => point.replace(/\d+\.\s+/, '')))
    }
    
    // Extract headers (simplified)
    const headers = content.match(/#{2,3}\s+([^\n]+)/g)
    if (headers) {
      points.push(...headers.map(header => header.replace(/#{2,3}\s+/, '')))
    }
    
    return points.slice(0, 5) // Limit to 5 key points
  }

  // Select appropriate hashtags
  private selectHashtags(category: string, tags: string[], platform: string): string[] {
    const categoryKey = category.toLowerCase().includes('trading') ? 'trading' :
                       category.toLowerCase().includes('analysis') ? 'analysis' :
                       category.toLowerCase().includes('education') ? 'education' : 'default'
    
    const baseHashtags = socialConfig.hashtags[categoryKey] || socialConfig.hashtags.default
    const tagHashtags = tags.map(tag => tag.replace(/\s+/g, ''))
    
    const allHashtags = [...new Set([...baseHashtags, ...tagHashtags])]
    
    // Platform-specific hashtag limits
    const maxHashtags = platform === 'twitter' ? 5 : platform === 'instagram' ? 10 : 8
    return allHashtags.slice(0, maxHashtags)
  }

  // Adjust content for platform constraints
  private adjustContentForPlatform(content: string, platform: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content
    }

    // Platform-specific truncation strategies
    switch (platform) {
      case 'twitter':
        // For Twitter, truncate and add ellipsis, preserve hashtags
        const hashtagMatch = content.match(/(#\w+(?:\s+#\w+)*)\s*$/)
        const hashtags = hashtagMatch ? hashtagMatch[1] : ''
        const textLength = maxLength - hashtags.length - 3 // -3 for "..."
        const truncated = content.substring(0, textLength).trim()
        return `${truncated}... ${hashtags}`.trim()

      case 'linkedin':
        // LinkedIn allows more content, just truncate if needed
        return content.substring(0, maxLength - 3) + '...'

      default:
        return content.substring(0, maxLength - 3) + '...'
    }
  }

  // Calculate schedule time
  private calculateScheduleTime(delayMinutes: number): string {
    const now = new Date()
    now.setMinutes(now.getMinutes() + delayMinutes)
    return now.toISOString()
  }

  // Truncate text to specified length
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3).trim() + '...'
  }

  // Mock posting to social media platforms
  async postToSocialMedia(socialPost: SocialMediaPost, blogPostId: number): Promise<boolean> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful posting
      const newPost = {
        id: nextPostId++,
        blogPostId,
        ...socialPost,
        status: 'posted' as const,
        postedAt: new Date().toISOString(),
        postId: `${socialPost.platform}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        engagement: { likes: 0, comments: 0, shares: 0, clicks: 0 }
      }

      socialMediaPosts.push(newPost)
      
      // Mock some initial engagement after a delay
      setTimeout(() => {
        const post = socialMediaPosts.find(p => p.id === newPost.id)
        if (post) {
          post.engagement = {
            likes: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 20),
            shares: Math.floor(Math.random() * 30),
            clicks: Math.floor(Math.random() * 200)
          }
        }
      }, 5000)

      return true
    } catch (error) {
      console.error(`Failed to post to ${socialPost.platform}:`, error)
      return false
    }
  }

  // Get social media posts for a blog post
  getSocialMediaPosts(blogPostId: number): any[] {
    return socialMediaPosts.filter(post => post.blogPostId === blogPostId)
  }

  // Get engagement analytics
  getEngagementAnalytics(timeframe: 'week' | 'month' | 'all' = 'month'): any {
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // All time
    }

    const filteredPosts = socialMediaPosts.filter(post => 
      new Date(post.createdAt) >= startDate && post.status === 'posted'
    )

    const totalEngagement = filteredPosts.reduce((total, post) => {
      const engagement = post.engagement || { likes: 0, comments: 0, shares: 0, clicks: 0 }
      return {
        likes: total.likes + engagement.likes,
        comments: total.comments + engagement.comments,
        shares: total.shares + engagement.shares,
        clicks: total.clicks + engagement.clicks
      }
    }, { likes: 0, comments: 0, shares: 0, clicks: 0 })

    const platformBreakdown = filteredPosts.reduce((breakdown, post) => {
      if (!breakdown[post.platform]) {
        breakdown[post.platform] = { posts: 0, engagement: { likes: 0, comments: 0, shares: 0, clicks: 0 } }
      }
      breakdown[post.platform].posts++
      const engagement = post.engagement || { likes: 0, comments: 0, shares: 0, clicks: 0 }
      breakdown[post.platform].engagement.likes += engagement.likes
      breakdown[post.platform].engagement.comments += engagement.comments
      breakdown[post.platform].engagement.shares += engagement.shares
      breakdown[post.platform].engagement.clicks += engagement.clicks
      return breakdown
    }, {} as any)

    return {
      timeframe,
      totalPosts: filteredPosts.length,
      totalEngagement,
      averageEngagement: {
        likes: filteredPosts.length > 0 ? Math.round(totalEngagement.likes / filteredPosts.length) : 0,
        comments: filteredPosts.length > 0 ? Math.round(totalEngagement.comments / filteredPosts.length) : 0,
        shares: filteredPosts.length > 0 ? Math.round(totalEngagement.shares / filteredPosts.length) : 0,
        clicks: filteredPosts.length > 0 ? Math.round(totalEngagement.clicks / filteredPosts.length) : 0
      },
      platformBreakdown,
      topPerformers: filteredPosts
        .sort((a, b) => {
          const aTotal = (a.engagement?.likes || 0) + (a.engagement?.comments || 0) + (a.engagement?.shares || 0)
          const bTotal = (b.engagement?.likes || 0) + (b.engagement?.comments || 0) + (b.engagement?.shares || 0)
          return bTotal - aTotal
        })
        .slice(0, 5)
    }
  }
}

const socialService = new SocialMediaService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'auto_post':
        // Auto-post to all enabled platforms
        const { blogPost } = data
        const results = []

        for (const [platform, config] of Object.entries(socialConfig.platforms)) {
          if (config.enabled) {
            const socialPost = socialService.generateContent(platform, blogPost)
            const success = await socialService.postToSocialMedia(socialPost, blogPost.id)
            results.push({ platform, success, content: socialPost.content })
          }
        }

        return NextResponse.json({
          success: true,
          results,
          message: `Posted to ${results.filter(r => r.success).length}/${results.length} platforms`
        })

      case 'schedule_post':
        // Schedule a post for later
        const { platform, blogPostId, scheduledFor } = data
        const scheduledPost = socialService.generateContent(platform, data.blogPost)
        scheduledPost.scheduledFor = scheduledFor
        scheduledPost.status = 'scheduled'

        // In production, add to scheduling queue
        return NextResponse.json({
          success: true,
          scheduledPost,
          message: 'Post scheduled successfully'
        })

      case 'preview_content':
        // Generate preview content for all platforms
        const { blogPost: previewPost } = data
        const previews = {}

        for (const platform of Object.keys(socialConfig.platforms)) {
          previews[platform] = socialService.generateContent(platform, previewPost)
        }

        return NextResponse.json({
          success: true,
          previews
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Social media operation failed:', error)
    return NextResponse.json(
      { success: false, error: 'Social media operation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')
    const blogPostId = searchParams.get('blogPostId')

    switch (action) {
      case 'posts':
        // Get social media posts for a blog post
        if (blogPostId) {
          const posts = socialService.getSocialMediaPosts(parseInt(blogPostId))
          return NextResponse.json({ success: true, posts })
        } else {
          return NextResponse.json({ success: true, posts: socialMediaPosts })
        }

      case 'analytics':
        // Get engagement analytics
        const timeframe = (searchParams.get('timeframe') as 'week' | 'month' | 'all') || 'month'
        const analytics = socialService.getEngagementAnalytics(timeframe)
        return NextResponse.json({ success: true, analytics })

      case 'config':
        // Get social media configuration
        return NextResponse.json({ success: true, config: socialConfig })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Failed to process social media request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'update_config':
        // Update social media configuration
        Object.assign(socialConfig, data)
        return NextResponse.json({
          success: true,
          config: socialConfig,
          message: 'Configuration updated successfully'
        })

      case 'update_templates':
        // Update social media templates
        Object.assign(socialConfig.templates, data.templates)
        return NextResponse.json({
          success: true,
          templates: socialConfig.templates,
          message: 'Templates updated successfully'
        })

      case 'toggle_platform':
        // Enable/disable a platform
        const { platform, enabled } = data
        if (socialConfig.platforms[platform]) {
          socialConfig.platforms[platform].enabled = enabled
          return NextResponse.json({
            success: true,
            message: `${platform} ${enabled ? 'enabled' : 'disabled'}`
          })
        } else {
          return NextResponse.json(
            { success: false, error: 'Platform not found' },
            { status: 404 }
          )
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Failed to update social media settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}


