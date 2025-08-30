// 💬 COMMUNITY MODELS - Production Database Implementation
// Replaces all mock community data with real PostgreSQL persistence

import { query, transaction, batchInsert, fullTextSearch, paginate } from '../connection'
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// INTERFACES
// ============================================================================

export interface Post {
  id: string
  authorId: string
  type: 'trade' | 'strategy' | 'insight' | 'question' | 'news' | 'poll'
  title: string
  content: string
  excerpt?: string
  tags: string[]
  tradingData?: {
    symbol?: string
    action?: 'buy' | 'sell'
    entryPrice?: string
    targetPrice?: string
    stopLoss?: string
    timeframe?: string
    analysis?: string
    confidence?: number
  }
  pollData?: {
    question: string
    options: Array<{ text: string; votes: number }>
    totalVotes: number
    userVoted?: number
  }
  mediaAttachments: any[]
  views: number
  likes: number
  commentsCount: number
  shares: number
  bookmarks: number
  status: 'draft' | 'published' | 'archived' | 'deleted' | 'flagged'
  visibility: 'public' | 'followers' | 'private'
  flaggedCount: number
  moderationStatus: 'pending' | 'approved' | 'rejected'
  moderatedBy?: string
  moderatedAt?: Date
  slug?: string
  metaDescription?: string
  featured: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  
  // Populated fields (joins)
  author?: {
    id: string
    username: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
    verified: boolean
    role: string
    stats: any
  }
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  parentId?: string
  content: string
  mentions: string[]
  likes: number
  repliesCount: number
  status: 'published' | 'deleted' | 'flagged'
  flaggedCount: number
  createdAt: Date
  updatedAt: Date
  
  // Populated fields
  author?: {
    id: string
    username: string
    avatarUrl?: string
    verified: boolean
  }
  replies?: Comment[]
}

export interface Reaction {
  id: string
  userId: string
  targetType: 'post' | 'comment'
  targetId: string
  reactionType: 'like' | 'bullish' | 'bearish' | 'fire' | 'genius' | 'helpful' | 'funny'
  createdAt: Date
}

export interface UserRelationship {
  id: string
  followerId: string
  followingId: string
  status: 'active' | 'blocked' | 'muted'
  createdAt: Date
}

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  title?: string
  participants: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastMessageAt?: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content?: string
  messageType: 'text' | 'image' | 'file' | 'system'
  attachments: any[]
  replyTo?: string
  edited: boolean
  deleted: boolean
  createdAt: Date
  updatedAt: Date
  
  // Populated fields
  sender?: {
    id: string
    username: string
    avatarUrl?: string
  }
}

export interface Group {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'premium'
  category?: string
  avatarUrl?: string
  bannerUrl?: string
  settings: {
    allowPosts: boolean
    moderated: boolean
    inviteOnly: boolean
  }
  membersCount: number
  postsCount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// POST DATA ACCESS OBJECT
// ============================================================================

export class PostDAO {
  // Create new post
  static async create(postData: {
    authorId: string
    type: Post['type']
    title: string
    content: string
    tags?: string[]
    tradingData?: Post['tradingData']
    pollData?: Post['pollData']
    mediaAttachments?: any[]
    visibility?: Post['visibility']
  }): Promise<Post> {
    const sql = `
      INSERT INTO community_posts (
        author_id, type, title, content, tags, trading_data, poll_data,
        media_attachments, visibility, slug
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `
    
    // Generate SEO-friendly slug
    const slug = this.generateSlug(postData.title)
    
    const params = [
      postData.authorId,
      postData.type,
      postData.title,
      postData.content,
      postData.tags || [],
      postData.tradingData ? JSON.stringify(postData.tradingData) : null,
      postData.pollData ? JSON.stringify(postData.pollData) : null,
      JSON.stringify(postData.mediaAttachments || []),
      postData.visibility || 'public',
      slug
    ]
    
    const result = await query(sql, params)
    return this.mapRowToPost(result.rows[0])
  }
  
  // Get posts with pagination and filters
  static async getPosts(options: {
    type?: string
    authorId?: string
    status?: string
    visibility?: string
    featured?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
    includeDrafts?: boolean
  } = {}) {
    const {
      type, authorId, status = 'published', visibility = 'public',
      featured, sortBy = 'created_at', sortOrder = 'desc',
      page = 1, limit = 10, includeDrafts = false
    } = options
    
    let sql = `
      SELECT 
        p.*,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.avatar_url as author_avatar_url,
        u.role as author_role,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as author_verified,
        u.stats as author_stats
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    // Add filters
    if (!includeDrafts) {
      sql += ` AND p.status = $${paramIndex}`
      params.push(status)
      paramIndex++
      
      sql += ` AND p.visibility = $${paramIndex}`
      params.push(visibility)
      paramIndex++
    }
    
    if (type) {
      sql += ` AND p.type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }
    
    if (authorId) {
      sql += ` AND p.author_id = $${paramIndex}`
      params.push(authorId)
      paramIndex++
    }
    
    if (featured !== undefined) {
      sql += ` AND p.featured = $${paramIndex}`
      params.push(featured)
      paramIndex++
    }
    
    // Add sorting
    const allowedSortFields = ['created_at', 'updated_at', 'views', 'likes', 'comments_count']
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at'
    const validSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'
    
    sql += ` ORDER BY p.${validSortBy} ${validSortOrder}`
    
    // Get paginated results
    const countSql = `
      SELECT COUNT(*) as count
      FROM community_posts p
      WHERE 1=1 ${sql.match(/AND.*?ORDER BY/s)?.[0]?.replace('ORDER BY', '') || ''}
    `
    
    const paginatedResult = await paginate(sql, countSql, page, limit, params)
    
    const posts = paginatedResult.rows.map(row => this.mapRowToPost(row, true))
    
    return {
      posts,
      pagination: paginatedResult.pagination
    }
  }
  
  // Get single post by ID
  static async getById(id: string, includeAuthor: boolean = true): Promise<Post | null> {
    let sql = `
      SELECT p.*
      ${includeAuthor ? `, 
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.avatar_url as author_avatar_url,
        u.role as author_role,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as author_verified,
        u.stats as author_stats` : ''}
      FROM community_posts p
      ${includeAuthor ? 'JOIN users u ON p.author_id = u.id' : ''}
      WHERE p.id = $1
    `
    
    const result = await query(sql, [id])
    return result.rows[0] ? this.mapRowToPost(result.rows[0], includeAuthor) : null
  }
  
  // Get post by slug
  static async getBySlug(slug: string): Promise<Post | null> {
    const sql = `
      SELECT 
        p.*,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.avatar_url as author_avatar_url,
        u.role as author_role,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as author_verified,
        u.stats as author_stats
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1 AND p.status = 'published'
    `
    
    const result = await query(sql, [slug])
    return result.rows[0] ? this.mapRowToPost(result.rows[0], true) : null
  }
  
  // Update post
  static async update(id: string, updateData: Partial<{
    title: string
    content: string
    tags: string[]
    tradingData: Post['tradingData']
    pollData: Post['pollData']
    mediaAttachments: any[]
    visibility: Post['visibility']
    status: Post['status']
    featured: boolean
  }>): Promise<Post | null> {
    const setClause: string[] = []
    const params: any[] = []
    let paramIndex = 1
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key)
        
        if (['trading_data', 'poll_data', 'media_attachments'].includes(columnName)) {
          setClause.push(`${columnName} = $${paramIndex}::jsonb`)
          params.push(JSON.stringify(value))
        } else {
          setClause.push(`${columnName} = $${paramIndex}`)
          params.push(value)
        }
        paramIndex++
      }
    })
    
    if (setClause.length === 0) return null
    
    params.push(id)
    const sql = `
      UPDATE community_posts
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    const result = await query(sql, params)
    return result.rows[0] ? this.mapRowToPost(result.rows[0]) : null
  }
  
  // Increment view count
  static async incrementViews(id: string): Promise<void> {
    const sql = 'UPDATE community_posts SET views = views + 1 WHERE id = $1'
    await query(sql, [id])
  }
  
  // Search posts
  static async search(searchTerm: string, options: {
    type?: string
    page?: number
    limit?: number
  } = {}) {
    const { type, page = 1, limit = 20 } = options
    
    let additionalFilters = "status = 'published' AND visibility = 'public'"
    const additionalParams: any[] = []
    
    if (type) {
      additionalFilters += ' AND type = $2'
      additionalParams.push(type)
    }
    
    const result = await fullTextSearch(
      searchTerm,
      'community_posts',
      ['title', 'content'],
      {
        limit,
        offset: (page - 1) * limit,
        additionalFilters,
        additionalParams,
        orderBy: 'search_rank DESC'
      }
    )
    
    const posts = result.rows.map(row => this.mapRowToPost(row))
    
    return {
      posts,
      total: result.rowCount,
      page,
      pages: Math.ceil(result.rowCount / limit)
    }
  }
  
  // Get trending posts (high engagement recently)
  static async getTrending(limit: number = 10, hours: number = 24): Promise<Post[]> {
    const sql = `
      SELECT 
        p.*,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.avatar_url as author_avatar_url,
        u.role as author_role,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as author_verified,
        u.stats as author_stats,
        (p.likes * 3 + p.comments_count * 5 + p.shares * 2 + p.views * 0.1) as engagement_score
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.status = 'published' 
        AND p.visibility = 'public'
        AND p.created_at > NOW() - INTERVAL '${hours} hours'
      ORDER BY engagement_score DESC
      LIMIT $1
    `
    
    const result = await query(sql, [limit])
    return result.rows.map(row => this.mapRowToPost(row, true))
  }
  
  // Soft delete post
  static async softDelete(id: string): Promise<boolean> {
    const sql = `
      UPDATE community_posts
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
    `
    const result = await query(sql, [id])
    return result.rowCount > 0
  }
  
  // Helper methods
  private static mapRowToPost(row: any, includeAuthor: boolean = false): Post {
    const post: Post = {
      id: row.id,
      authorId: row.author_id,
      type: row.type,
      title: row.title,
      content: row.content,
      excerpt: row.excerpt,
      tags: row.tags || [],
      tradingData: row.trading_data,
      pollData: row.poll_data,
      mediaAttachments: row.media_attachments || [],
      views: row.views || 0,
      likes: row.likes || 0,
      commentsCount: row.comments_count || 0,
      shares: row.shares || 0,
      bookmarks: row.bookmarks || 0,
      status: row.status,
      visibility: row.visibility,
      flaggedCount: row.flagged_count || 0,
      moderationStatus: row.moderation_status,
      moderatedBy: row.moderated_by,
      moderatedAt: row.moderated_at,
      slug: row.slug,
      metaDescription: row.meta_description,
      featured: row.featured || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at
    }
    
    if (includeAuthor) {
      post.author = {
        id: row.author_id,
        username: row.author_username,
        firstName: row.author_first_name,
        lastName: row.author_last_name,
        avatarUrl: row.author_avatar_url,
        verified: row.author_verified || false,
        role: row.author_role,
        stats: row.author_stats || {}
      }
    }
    
    return post
  }
  
  private static generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50)
    
    return `${slug}-${Date.now().toString(36)}`
  }
  
  private static camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }
}

// ============================================================================
// COMMENT DATA ACCESS OBJECT
// ============================================================================

export class CommentDAO {
  // Create comment
  static async create(commentData: {
    postId: string
    authorId: string
    parentId?: string
    content: string
    mentions?: string[]
  }): Promise<Comment> {
    const sql = `
      INSERT INTO community_comments (post_id, author_id, parent_id, content, mentions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    
    const params = [
      commentData.postId,
      commentData.authorId,
      commentData.parentId || null,
      commentData.content,
      commentData.mentions || []
    ]
    
    // Use transaction to also update post comment count
    return await transaction(async (client) => {
      const commentResult = await client.query(sql, params)
      
      // Update post comment count
      await client.query(
        'UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1',
        [commentData.postId]
      )
      
      // Update parent comment reply count if this is a reply
      if (commentData.parentId) {
        await client.query(
          'UPDATE community_comments SET replies_count = replies_count + 1 WHERE id = $1',
          [commentData.parentId]
        )
      }
      
      return this.mapRowToComment(commentResult.rows[0])
    })
  }
  
  // Get comments for post with threading
  static async getByPostId(postId: string, options: {
    page?: number
    limit?: number
    sortBy?: 'created_at' | 'likes'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ comments: Comment[]; pagination: any }> {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'asc' } = options
    
    // Get top-level comments first
    const sql = `
      SELECT 
        c.*,
        u.username as author_username,
        u.avatar_url as author_avatar_url,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as author_verified
      FROM community_comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1 AND c.parent_id IS NULL AND c.status = 'published'
      ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $2 OFFSET $3
    `
    
    const offset = (page - 1) * limit
    const result = await query(sql, [postId, limit, offset])
    
    // Get reply counts
    const countSql = `
      SELECT COUNT(*) as count
      FROM community_comments
      WHERE post_id = $1 AND parent_id IS NULL AND status = 'published'
    `
    const countResult = await query(countSql, [postId])
    
    const comments = result.rows.map(row => this.mapRowToComment(row, true))
    
    return {
      comments,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    }
  }
  
  // Get replies to a comment
  static async getReplies(parentId: string, limit: number = 10): Promise<Comment[]> {
    const sql = `
      SELECT 
        c.*,
        u.username as author_username,
        u.avatar_url as author_avatar_url,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as author_verified
      FROM community_comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.parent_id = $1 AND c.status = 'published'
      ORDER BY c.created_at ASC
      LIMIT $2
    `
    
    const result = await query(sql, [parentId, limit])
    return result.rows.map(row => this.mapRowToComment(row, true))
  }
  
  // Update comment
  static async update(id: string, content: string): Promise<Comment | null> {
    const sql = `
      UPDATE community_comments
      SET content = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `
    
    const result = await query(sql, [content, id])
    return result.rows[0] ? this.mapRowToComment(result.rows[0]) : null
  }
  
  // Soft delete comment
  static async softDelete(id: string): Promise<boolean> {
    const sql = `
      UPDATE community_comments
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
    `
    
    const result = await query(sql, [id])
    return result.rowCount > 0
  }
  
  private static mapRowToComment(row: any, includeAuthor: boolean = false): Comment {
    const comment: Comment = {
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      parentId: row.parent_id,
      content: row.content,
      mentions: row.mentions || [],
      likes: row.likes || 0,
      repliesCount: row.replies_count || 0,
      status: row.status,
      flaggedCount: row.flagged_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
    
    if (includeAuthor) {
      comment.author = {
        id: row.author_id,
        username: row.author_username,
        avatarUrl: row.author_avatar_url,
        verified: row.author_verified || false
      }
    }
    
    return comment
  }
}

// ============================================================================
// REACTION DATA ACCESS OBJECT
// ============================================================================

export class ReactionDAO {
  // Add or update reaction
  static async upsert(reactionData: {
    userId: string
    targetType: 'post' | 'comment'
    targetId: string
    reactionType: Reaction['reactionType']
  }): Promise<Reaction> {
    const sql = `
      INSERT INTO community_reactions (user_id, target_type, target_id, reaction_type)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, target_type, target_id, reaction_type)
      DO UPDATE SET created_at = NOW()
      RETURNING *
    `
    
    return await transaction(async (client) => {
      const result = await client.query(sql, [
        reactionData.userId,
        reactionData.targetType,
        reactionData.targetId,
        reactionData.reactionType
      ])
      
      // Update target likes count
      const tableName = reactionData.targetType === 'post' ? 'community_posts' : 'community_comments'
      await client.query(
        `UPDATE ${tableName} SET likes = (
          SELECT COUNT(*) FROM community_reactions 
          WHERE target_type = $1 AND target_id = $2 AND reaction_type = 'like'
        ) WHERE id = $2`,
        [reactionData.targetType, reactionData.targetId]
      )
      
      return this.mapRowToReaction(result.rows[0])
    })
  }
  
  // Remove reaction
  static async remove(userId: string, targetType: 'post' | 'comment', targetId: string, reactionType: string): Promise<boolean> {
    const sql = `
      DELETE FROM community_reactions
      WHERE user_id = $1 AND target_type = $2 AND target_id = $3 AND reaction_type = $4
    `
    
    return await transaction(async (client) => {
      const result = await client.query(sql, [userId, targetType, targetId, reactionType])
      
      // Update target likes count
      const tableName = targetType === 'post' ? 'community_posts' : 'community_comments'
      await client.query(
        `UPDATE ${tableName} SET likes = (
          SELECT COUNT(*) FROM community_reactions 
          WHERE target_type = $1 AND target_id = $2 AND reaction_type = 'like'
        ) WHERE id = $2`,
        [targetType, targetId]
      )
      
      return result.rowCount > 0
    })
  }
  
  // Get reactions for target
  static async getByTarget(targetType: 'post' | 'comment', targetId: string): Promise<Reaction[]> {
    const sql = `
      SELECT * FROM community_reactions
      WHERE target_type = $1 AND target_id = $2
      ORDER BY created_at DESC
    `
    
    const result = await query(sql, [targetType, targetId])
    return result.rows.map(row => this.mapRowToReaction(row))
  }
  
  // Get user's reaction to target
  static async getUserReaction(userId: string, targetType: 'post' | 'comment', targetId: string): Promise<Reaction | null> {
    const sql = `
      SELECT * FROM community_reactions
      WHERE user_id = $1 AND target_type = $2 AND target_id = $3
    `
    
    const result = await query(sql, [userId, targetType, targetId])
    return result.rows[0] ? this.mapRowToReaction(result.rows[0]) : null
  }
  
  private static mapRowToReaction(row: any): Reaction {
    return {
      id: row.id,
      userId: row.user_id,
      targetType: row.target_type,
      targetId: row.target_id,
      reactionType: row.reaction_type,
      createdAt: row.created_at
    }
  }
}

// ============================================================================
// USER RELATIONSHIP DATA ACCESS OBJECT
// ============================================================================

export class RelationshipDAO {
  // Follow user
  static async follow(followerId: string, followingId: string): Promise<UserRelationship> {
    const sql = `
      INSERT INTO user_relationships (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id)
      DO UPDATE SET status = 'active', created_at = NOW()
      RETURNING *
    `
    
    const result = await query(sql, [followerId, followingId])
    return this.mapRowToRelationship(result.rows[0])
  }
  
  // Unfollow user
  static async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const sql = `
      DELETE FROM user_relationships
      WHERE follower_id = $1 AND following_id = $2
    `
    
    const result = await query(sql, [followerId, followingId])
    return result.rowCount > 0
  }
  
  // Get followers
  static async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const sql = `
      SELECT 
        ur.*,
        u.username, u.first_name, u.last_name, u.avatar_url,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as verified
      FROM user_relationships ur
      JOIN users u ON ur.follower_id = u.id
      WHERE ur.following_id = $1 AND ur.status = 'active'
      ORDER BY ur.created_at DESC
      LIMIT $2 OFFSET $3
    `
    
    const offset = (page - 1) * limit
    const result = await query(sql, [userId, limit, offset])
    
    return result.rows.map(row => ({
      relationship: this.mapRowToRelationship(row),
      user: {
        id: row.follower_id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url,
        verified: row.verified
      }
    }))
  }
  
  // Get following
  static async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const sql = `
      SELECT 
        ur.*,
        u.username, u.first_name, u.last_name, u.avatar_url,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as verified
      FROM user_relationships ur
      JOIN users u ON ur.following_id = u.id
      WHERE ur.follower_id = $1 AND ur.status = 'active'
      ORDER BY ur.created_at DESC
      LIMIT $2 OFFSET $3
    `
    
    const offset = (page - 1) * limit
    const result = await query(sql, [userId, limit, offset])
    
    return result.rows.map(row => ({
      relationship: this.mapRowToRelationship(row),
      user: {
        id: row.following_id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url,
        verified: row.verified
      }
    }))
  }
  
  // Check if following
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const sql = `
      SELECT 1 FROM user_relationships
      WHERE follower_id = $1 AND following_id = $2 AND status = 'active'
    `
    
    const result = await query(sql, [followerId, followingId])
    return result.rows.length > 0
  }
  
  // Get follow stats
  static async getFollowStats(userId: string): Promise<{ followers: number; following: number }> {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM user_relationships WHERE following_id = $1 AND status = 'active') as followers,
        (SELECT COUNT(*) FROM user_relationships WHERE follower_id = $1 AND status = 'active') as following
    `
    
    const result = await query(sql, [userId])
    return {
      followers: parseInt(result.rows[0].followers),
      following: parseInt(result.rows[0].following)
    }
  }
  
  private static mapRowToRelationship(row: any): UserRelationship {
    return {
      id: row.id,
      followerId: row.follower_id,
      followingId: row.following_id,
      status: row.status,
      createdAt: row.created_at
    }
  }
}

// Export all DAOs and interfaces
export default {
  PostDAO,
  CommentDAO,
  ReactionDAO,
  RelationshipDAO
}

