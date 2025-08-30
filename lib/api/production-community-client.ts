// 🚀 PRODUCTION COMMUNITY CLIENT - Real Database Integration
// Replaces mock data with real PostgreSQL persistence

import { PostDAO, CommentDAO, ReactionDAO, RelationshipDAO } from '../database/models/community'
import type { 
  Post, 
  Comment, 
  Reaction, 
  UserRelationship,
  Conversation,
  Message,
  Group
} from '../database/models/community'

// ============================================================================
// COMMUNITY API CLIENT (Production Implementation)
// ============================================================================

export interface PostsFilter {
  type?: 'trade' | 'strategy' | 'insight' | 'question' | 'news' | 'poll'
  authorId?: string
  status?: 'draft' | 'published' | 'archived' | 'deleted' | 'flagged'
  visibility?: 'public' | 'followers' | 'private'
  featured?: boolean
  sortBy?: 'created_at' | 'updated_at' | 'views' | 'likes' | 'comments_count'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  includeDrafts?: boolean
}

export interface CreatePostData {
  type: Post['type']
  title: string
  content: string
  tags?: string[]
  tradingData?: Post['tradingData']
  pollData?: Post['pollData']
  mediaAttachments?: any[]
  visibility?: Post['visibility']
}

export interface UpdatePostData {
  title?: string
  content?: string
  tags?: string[]
  tradingData?: Post['tradingData']
  pollData?: Post['pollData']
  mediaAttachments?: any[]
  visibility?: Post['visibility']
  status?: Post['status']
  featured?: boolean
}

export interface CreateCommentData {
  postId: string
  parentId?: string
  content: string
  mentions?: string[]
}

export interface PaginationResult<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================================================
// POSTS API
// ============================================================================

export class PostsAPI {
  // Get posts with filtering and pagination
  static async getPosts(filter: PostsFilter = {}): Promise<PaginationResult<Post>> {
    try {
      const result = await PostDAO.getPosts(filter)
      
      return {
        items: result.posts,
        pagination: {
          ...result.pagination,
          hasNext: result.pagination.page < result.pagination.pages,
          hasPrev: result.pagination.page > 1
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw new Error('Failed to fetch posts')
    }
  }
  
  // Get single post by ID
  static async getPost(id: string): Promise<Post | null> {
    try {
      const post = await PostDAO.getById(id, true)
      
      if (post) {
        // Increment view count
        await PostDAO.incrementViews(id)
      }
      
      return post
    } catch (error) {
      console.error('Error fetching post:', error)
      throw new Error('Failed to fetch post')
    }
  }
  
  // Get post by slug
  static async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const post = await PostDAO.getBySlug(slug)
      
      if (post) {
        // Increment view count
        await PostDAO.incrementViews(post.id)
      }
      
      return post
    } catch (error) {
      console.error('Error fetching post by slug:', error)
      throw new Error('Failed to fetch post')
    }
  }
  
  // Create new post
  static async createPost(authorId: string, postData: CreatePostData): Promise<Post> {
    try {
      return await PostDAO.create({ ...postData, authorId })
    } catch (error) {
      console.error('Error creating post:', error)
      throw new Error('Failed to create post')
    }
  }
  
  // Update post
  static async updatePost(id: string, updateData: UpdatePostData): Promise<Post | null> {
    try {
      return await PostDAO.update(id, updateData)
    } catch (error) {
      console.error('Error updating post:', error)
      throw new Error('Failed to update post')
    }
  }
  
  // Delete post
  static async deletePost(id: string): Promise<boolean> {
    try {
      return await PostDAO.softDelete(id)
    } catch (error) {
      console.error('Error deleting post:', error)
      throw new Error('Failed to delete post')
    }
  }
  
  // Search posts
  static async searchPosts(query: string, options: {
    type?: string
    page?: number
    limit?: number
  } = {}): Promise<PaginationResult<Post>> {
    try {
      const result = await PostDAO.search(query, options)
      
      return {
        items: result.posts,
        pagination: {
          page: result.page,
          limit: options.limit || 20,
          total: result.total,
          pages: result.pages,
          hasNext: result.page < result.pages,
          hasPrev: result.page > 1
        }
      }
    } catch (error) {
      console.error('Error searching posts:', error)
      throw new Error('Failed to search posts')
    }
  }
  
  // Get trending posts
  static async getTrendingPosts(limit: number = 10, hours: number = 24): Promise<Post[]> {
    try {
      return await PostDAO.getTrending(limit, hours)
    } catch (error) {
      console.error('Error fetching trending posts:', error)
      throw new Error('Failed to fetch trending posts')
    }
  }
  
  // Get user's posts
  static async getUserPosts(authorId: string, options: {
    page?: number
    limit?: number
    includeDrafts?: boolean
  } = {}): Promise<PaginationResult<Post>> {
    try {
      const filter: PostsFilter = {
        ...options,
        authorId,
        sortBy: 'created_at',
        sortOrder: 'desc'
      }
      
      return this.getPosts(filter)
    } catch (error) {
      console.error('Error fetching user posts:', error)
      throw new Error('Failed to fetch user posts')
    }
  }
}

// ============================================================================
// COMMENTS API
// ============================================================================

export class CommentsAPI {
  // Get comments for a post
  static async getPostComments(postId: string, options: {
    page?: number
    limit?: number
    sortBy?: 'created_at' | 'likes'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<PaginationResult<Comment>> {
    try {
      const result = await CommentDAO.getByPostId(postId, options)
      
      return {
        items: result.comments,
        pagination: {
          ...result.pagination,
          hasNext: result.pagination.page < result.pagination.pages,
          hasPrev: result.pagination.page > 1
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw new Error('Failed to fetch comments')
    }
  }
  
  // Get replies to a comment
  static async getCommentReplies(parentId: string, limit: number = 10): Promise<Comment[]> {
    try {
      return await CommentDAO.getReplies(parentId, limit)
    } catch (error) {
      console.error('Error fetching comment replies:', error)
      throw new Error('Failed to fetch comment replies')
    }
  }
  
  // Create comment
  static async createComment(authorId: string, commentData: CreateCommentData): Promise<Comment> {
    try {
      return await CommentDAO.create({ ...commentData, authorId })
    } catch (error) {
      console.error('Error creating comment:', error)
      throw new Error('Failed to create comment')
    }
  }
  
  // Update comment
  static async updateComment(id: string, content: string): Promise<Comment | null> {
    try {
      return await CommentDAO.update(id, content)
    } catch (error) {
      console.error('Error updating comment:', error)
      throw new Error('Failed to update comment')
    }
  }
  
  // Delete comment
  static async deleteComment(id: string): Promise<boolean> {
    try {
      return await CommentDAO.softDelete(id)
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw new Error('Failed to delete comment')
    }
  }
}

// ============================================================================
// REACTIONS API
// ============================================================================

export class ReactionsAPI {
  // Add reaction
  static async addReaction(userId: string, targetType: 'post' | 'comment', targetId: string, reactionType: Reaction['reactionType']): Promise<Reaction> {
    try {
      return await ReactionDAO.upsert({ userId, targetType, targetId, reactionType })
    } catch (error) {
      console.error('Error adding reaction:', error)
      throw new Error('Failed to add reaction')
    }
  }
  
  // Remove reaction
  static async removeReaction(userId: string, targetType: 'post' | 'comment', targetId: string, reactionType: string): Promise<boolean> {
    try {
      return await ReactionDAO.remove(userId, targetType, targetId, reactionType)
    } catch (error) {
      console.error('Error removing reaction:', error)
      throw new Error('Failed to remove reaction')
    }
  }
  
  // Get reactions for target
  static async getReactions(targetType: 'post' | 'comment', targetId: string): Promise<Reaction[]> {
    try {
      return await ReactionDAO.getByTarget(targetType, targetId)
    } catch (error) {
      console.error('Error fetching reactions:', error)
      throw new Error('Failed to fetch reactions')
    }
  }
  
  // Get user's reaction to target
  static async getUserReaction(userId: string, targetType: 'post' | 'comment', targetId: string): Promise<Reaction | null> {
    try {
      return await ReactionDAO.getUserReaction(userId, targetType, targetId)
    } catch (error) {
      console.error('Error fetching user reaction:', error)
      return null
    }
  }
  
  // Toggle reaction (add if not exists, remove if exists)
  static async toggleReaction(userId: string, targetType: 'post' | 'comment', targetId: string, reactionType: Reaction['reactionType']): Promise<{ action: 'added' | 'removed'; reaction?: Reaction }> {
    try {
      const existingReaction = await ReactionDAO.getUserReaction(userId, targetType, targetId)
      
      if (existingReaction && existingReaction.reactionType === reactionType) {
        // Remove existing reaction
        await ReactionDAO.remove(userId, targetType, targetId, reactionType)
        return { action: 'removed' }
      } else {
        // Add new reaction (or replace existing)
        const reaction = await ReactionDAO.upsert({ userId, targetType, targetId, reactionType })
        return { action: 'added', reaction }
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
      throw new Error('Failed to toggle reaction')
    }
  }
}

// ============================================================================
// RELATIONSHIPS API
// ============================================================================

export class RelationshipsAPI {
  // Follow user
  static async followUser(followerId: string, followingId: string): Promise<UserRelationship> {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself')
      }
      
      return await RelationshipDAO.follow(followerId, followingId)
    } catch (error) {
      console.error('Error following user:', error)
      throw new Error('Failed to follow user')
    }
  }
  
  // Unfollow user
  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      return await RelationshipDAO.unfollow(followerId, followingId)
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw new Error('Failed to unfollow user')
    }
  }
  
  // Get followers
  static async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    try {
      return await RelationshipDAO.getFollowers(userId, page, limit)
    } catch (error) {
      console.error('Error fetching followers:', error)
      throw new Error('Failed to fetch followers')
    }
  }
  
  // Get following
  static async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    try {
      return await RelationshipDAO.getFollowing(userId, page, limit)
    } catch (error) {
      console.error('Error fetching following:', error)
      throw new Error('Failed to fetch following')
    }
  }
  
  // Check if following
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      return await RelationshipDAO.isFollowing(followerId, followingId)
    } catch (error) {
      console.error('Error checking follow status:', error)
      return false
    }
  }
  
  // Get follow stats
  static async getFollowStats(userId: string): Promise<{ followers: number; following: number }> {
    try {
      return await RelationshipDAO.getFollowStats(userId)
    } catch (error) {
      console.error('Error fetching follow stats:', error)
      return { followers: 0, following: 0 }
    }
  }
  
  // Toggle follow (follow if not following, unfollow if following)
  static async toggleFollow(followerId: string, followingId: string): Promise<{ action: 'followed' | 'unfollowed'; relationship?: UserRelationship }> {
    try {
      const isCurrentlyFollowing = await RelationshipDAO.isFollowing(followerId, followingId)
      
      if (isCurrentlyFollowing) {
        await RelationshipDAO.unfollow(followerId, followingId)
        return { action: 'unfollowed' }
      } else {
        const relationship = await RelationshipDAO.follow(followerId, followingId)
        return { action: 'followed', relationship }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      throw new Error('Failed to toggle follow')
    }
  }
}

// ============================================================================
// SEARCH API
// ============================================================================

export class SearchAPI {
  // Universal search across posts, users, and groups
  static async universalSearch(query: string, options: {
    types?: ('posts' | 'users' | 'groups')[]
    page?: number
    limit?: number
  } = {}): Promise<{
    posts?: Post[]
    users?: any[]
    groups?: Group[]
    total: number
  }> {
    try {
      const { types = ['posts'], page = 1, limit = 20 } = options
      const results: any = { total: 0 }
      
      // Search posts
      if (types.includes('posts')) {
        const postResults = await PostDAO.search(query, { page, limit })
        results.posts = postResults.posts
        results.total += postResults.total
      }
      
      // TODO: Implement user and group search when those models are ready
      
      return results
    } catch (error) {
      console.error('Error in universal search:', error)
      throw new Error('Search failed')
    }
  }
  
  // Search posts only
  static async searchPosts(query: string, options: {
    type?: string
    page?: number
    limit?: number
  } = {}): Promise<PaginationResult<Post>> {
    try {
      return await PostsAPI.searchPosts(query, options)
    } catch (error) {
      console.error('Error searching posts:', error)
      throw new Error('Failed to search posts')
    }
  }
}

// ============================================================================
// UNIFIED COMMUNITY CLIENT
// ============================================================================

export class CommunityClient {
  // Posts
  static posts = PostsAPI
  
  // Comments
  static comments = CommentsAPI
  
  // Reactions
  static reactions = ReactionsAPI
  
  // Relationships
  static relationships = RelationshipsAPI
  
  // Search
  static search = SearchAPI
  
  // Convenience methods for common operations
  static async getHomeFeed(userId: string, page: number = 1, limit: number = 10): Promise<PaginationResult<Post>> {
    try {
      // Get posts from followed users + trending posts
      // For now, just return all public posts sorted by engagement
      return await PostsAPI.getPosts({
        status: 'published',
        visibility: 'public',
        sortBy: 'created_at',
        sortOrder: 'desc',
        page,
        limit
      })
    } catch (error) {
      console.error('Error fetching home feed:', error)
      throw new Error('Failed to fetch home feed')
    }
  }
  
  static async getTrendingContent(limit: number = 10): Promise<{
    posts: Post[]
    // users: User[] // TODO: Add when user model is ready
  }> {
    try {
      const posts = await PostsAPI.getTrendingPosts(limit)
      
      return {
        posts
        // users: [] // TODO: Add trending users
      }
    } catch (error) {
      console.error('Error fetching trending content:', error)
      throw new Error('Failed to fetch trending content')
    }
  }
  
  static async getUserActivity(userId: string, page: number = 1, limit: number = 20): Promise<{
    posts: Post[]
    // TODO: Add comments, reactions, follows when needed
  }> {
    try {
      const userPosts = await PostsAPI.getUserPosts(userId, { page, limit })
      
      return {
        posts: userPosts.items
      }
    } catch (error) {
      console.error('Error fetching user activity:', error)
      throw new Error('Failed to fetch user activity')
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatPostContent = (content: string, maxLength: number = 300): string => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength).trim() + '...'
}

export const getPostTypeColor = (type: Post['type']): string => {
  const colors = {
    trade: 'text-green-400 bg-green-900/20',
    strategy: 'text-blue-400 bg-blue-900/20',
    insight: 'text-purple-400 bg-purple-900/20',
    question: 'text-yellow-400 bg-yellow-900/20',
    news: 'text-red-400 bg-red-900/20',
    poll: 'text-cyan-400 bg-cyan-900/20'
  }
  return colors[type] || colors.insight
}

export const getReactionEmoji = (type: Reaction['reactionType']): string => {
  const emojis = {
    like: '👍',
    bullish: '🚀',
    bearish: '📉',
    fire: '🔥',
    genius: '🧠',
    helpful: '💡',
    funny: '😂'
  }
  return emojis[type] || '👍'
}

// Export types for use in components
export type {
  Post,
  Comment,
  Reaction,
  UserRelationship,
  PostsFilter,
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
  PaginationResult
}

// Default export
export default CommunityClient

