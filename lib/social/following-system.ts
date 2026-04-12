/**
 * Following/Followers System
 * Handles social connections between users
 */

export interface FollowRelationship {
  id: string
  followerId: string
  followingId: string
  createdAt: string
  isActive: boolean
  notificationsEnabled: boolean
}

export interface UserSocialStats {
  userId: string
  followersCount: number
  followingCount: number
  mutualFollowsCount: number
  recentFollowers: string[]
  recentUnfollows: string[]
}

export interface FollowNotification {
  id: string
  type: 'new_follower' | 'new_post' | 'achievement' | 'trade_shared'
  fromUserId: string
  toUserId: string
  content: string
  timestamp: string
  isRead: boolean
  metadata?: Record<string, any>
}

export interface FollowSuggestion {
  userId: string
  reason: 'mutual_follows' | 'similar_trading_style' | 'same_level' | 'popular' | 'new_member'
  score: number
  mutualFollows?: string[]
  similarityMetrics?: {
    tradingStyle: number
    performance: number
    interests: number
  }
}

export class FollowingSystem {
  private relationships: Map<string, FollowRelationship>
  private userStats: Map<string, UserSocialStats>
  private notifications: Map<string, FollowNotification[]>

  constructor() {
    this.relationships = new Map()
    this.userStats = new Map()
    this.notifications = new Map()
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<{
    success: boolean
    relationship?: FollowRelationship
    error?: string
  }> {
    // Validation
    if (followerId === followingId) {
      return { success: false, error: "Cannot follow yourself" }
    }

    const relationshipId = `${followerId}_${followingId}`
    
    // Check if already following
    if (this.relationships.has(relationshipId)) {
      const existing = this.relationships.get(relationshipId)!
      if (existing.isActive) {
        return { success: false, error: "Already following this user" }
      }
      // Reactivate relationship
      existing.isActive = true
      existing.createdAt = new Date().toISOString()
      this.relationships.set(relationshipId, existing)
      await this.updateUserStats(followerId, followingId, 'follow')
      await this.sendNotification('new_follower', followerId, followingId)
      return { success: true, relationship: existing }
    }

    // Create new relationship
    const relationship: FollowRelationship = {
      id: relationshipId,
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
      isActive: true,
      notificationsEnabled: true
    }

    this.relationships.set(relationshipId, relationship)
    await this.updateUserStats(followerId, followingId, 'follow')
    await this.sendNotification('new_follower', followerId, followingId)

    return { success: true, relationship }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<{
    success: boolean
    error?: string
  }> {
    const relationshipId = `${followerId}_${followingId}`
    const relationship = this.relationships.get(relationshipId)

    if (!relationship || !relationship.isActive) {
      return { success: false, error: "Not following this user" }
    }

    // Deactivate relationship
    relationship.isActive = false
    this.relationships.set(relationshipId, relationship)
    await this.updateUserStats(followerId, followingId, 'unfollow')

    return { success: true }
  }

  /**
   * Check if user A follows user B
   */
  isFollowing(followerId: string, followingId: string): boolean {
    const relationshipId = `${followerId}_${followingId}`
    const relationship = this.relationships.get(relationshipId)
    return relationship ? relationship.isActive : false
  }

  /**
   * Check if two users follow each other (mutual follow)
   */
  isMutualFollow(userAId: string, userBId: string): boolean {
    return this.isFollowing(userAId, userBId) && this.isFollowing(userBId, userAId)
  }

  /**
   * Get user's followers
   */
  getFollowers(userId: string, limit: number = 50, offset: number = 0): {
    followers: string[]
    hasMore: boolean
    total: number
  } {
    const followers: string[] = []
    
    for (const [, relationship] of this.relationships) {
      if (relationship.followingId === userId && relationship.isActive) {
        followers.push(relationship.followerId)
      }
    }

    const total = followers.length
    const paginatedFollowers = followers.slice(offset, offset + limit)
    
    return {
      followers: paginatedFollowers,
      hasMore: offset + limit < total,
      total
    }
  }

  /**
   * Get users that a user is following
   */
  getFollowing(userId: string, limit: number = 50, offset: number = 0): {
    following: string[]
    hasMore: boolean
    total: number
  } {
    const following: string[] = []
    
    for (const [, relationship] of this.relationships) {
      if (relationship.followerId === userId && relationship.isActive) {
        following.push(relationship.followingId)
      }
    }

    const total = following.length
    const paginatedFollowing = following.slice(offset, offset + limit)
    
    return {
      following: paginatedFollowing,
      hasMore: offset + limit < total,
      total
    }
  }

  /**
   * Get mutual follows between two users
   */
  getMutualFollows(userAId: string, userBId: string): string[] {
    const userAFollowing = this.getFollowing(userAId, 1000).following
    const userBFollowing = this.getFollowing(userBId, 1000).following
    
    return userAFollowing.filter(userId => userBFollowing.includes(userId))
  }

  /**
   * Get user's social stats
   */
  getUserStats(userId: string): UserSocialStats {
    if (!this.userStats.has(userId)) {
      const followers = this.getFollowers(userId, 1000)
      const following = this.getFollowing(userId, 1000)
      
      this.userStats.set(userId, {
        userId,
        followersCount: followers.total,
        followingCount: following.total,
        mutualFollowsCount: 0,
        recentFollowers: [],
        recentUnfollows: []
      })
    }
    
    return this.userStats.get(userId)!
  }

  /**
   * Update user stats after follow/unfollow
   */
  private async updateUserStats(followerId: string, followingId: string, action: 'follow' | 'unfollow'): Promise<void> {
    const followerStats = this.getUserStats(followerId)
    const followingStats = this.getUserStats(followingId)

    if (action === 'follow') {
      followerStats.followingCount++
      followingStats.followersCount++
      
      // Add to recent followers
      followingStats.recentFollowers.unshift(followerId)
      followingStats.recentFollowers = followingStats.recentFollowers.slice(0, 10)
      
      // Remove from recent unfollows if present
      followingStats.recentUnfollows = followingStats.recentUnfollows.filter(id => id !== followerId)
    } else {
      followerStats.followingCount--
      followingStats.followersCount--
      
      // Add to recent unfollows
      followingStats.recentUnfollows.unshift(followerId)
      followingStats.recentUnfollows = followingStats.recentUnfollows.slice(0, 10)
      
      // Remove from recent followers
      followingStats.recentFollowers = followingStats.recentFollowers.filter(id => id !== followerId)
    }

    this.userStats.set(followerId, followerStats)
    this.userStats.set(followingId, followingStats)
  }

  /**
   * Send follow notification
   */
  private async sendNotification(type: FollowNotification['type'], fromUserId: string, toUserId: string): Promise<void> {
    const notification: FollowNotification = {
      id: `${Date.now()}_${Math.random()}`,
      type,
      fromUserId,
      toUserId,
      content: this.getNotificationContent(type, fromUserId),
      timestamp: new Date().toISOString(),
      isRead: false
    }

    if (!this.notifications.has(toUserId)) {
      this.notifications.set(toUserId, [])
    }
    
    const userNotifications = this.notifications.get(toUserId)!
    userNotifications.unshift(notification)
    this.notifications.set(toUserId, userNotifications.slice(0, 100)) // Keep last 100
  }

  /**
   * Get notification content based on type
   */
  private getNotificationContent(type: FollowNotification['type'], fromUserId: string): string {
    switch (type) {
      case 'new_follower':
        return `${fromUserId} started following you`
      case 'new_post':
        return `${fromUserId} shared a new post`
      case 'achievement':
        return `${fromUserId} unlocked a new achievement`
      case 'trade_shared':
        return `${fromUserId} shared a trade result`
      default:
        return `${fromUserId} has an update`
    }
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId: string, limit: number = 20): FollowNotification[] {
    const notifications = this.notifications.get(userId) || []
    return notifications.slice(0, limit)
  }

  /**
   * Mark notifications as read
   */
  markNotificationsRead(userId: string, notificationIds: string[]): void {
    const notifications = this.notifications.get(userId) || []
    notifications.forEach(notification => {
      if (notificationIds.includes(notification.id)) {
        notification.isRead = true
      }
    })
    this.notifications.set(userId, notifications)
  }

  /**
   * Get follow suggestions for a user
   */
  getFollowSuggestions(userId: string, limit: number = 10): FollowSuggestion[] {
    const suggestions: FollowSuggestion[] = []
    const userFollowing = this.getFollowing(userId, 1000).following
    
    // Get mutual follows suggestions
    const mutualSuggestions = this.getMutualFollowSuggestions(userId, userFollowing)
    suggestions.push(...mutualSuggestions)
    
    // Get popular users suggestions
    const popularSuggestions = this.getPopularUserSuggestions(userId, userFollowing)
    suggestions.push(...popularSuggestions)
    
    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Get mutual follow suggestions
   */
  private getMutualFollowSuggestions(userId: string, userFollowing: string[]): FollowSuggestion[] {
    const suggestions: FollowSuggestion[] = []
    const mutualMap = new Map<string, string[]>()

    // Find users followed by people the user follows
    userFollowing.forEach(followingUserId => {
      const theirFollowing = this.getFollowing(followingUserId, 1000).following
      theirFollowing.forEach(suggestedUserId => {
        if (suggestedUserId !== userId && !userFollowing.includes(suggestedUserId)) {
          if (!mutualMap.has(suggestedUserId)) {
            mutualMap.set(suggestedUserId, [])
          }
          mutualMap.get(suggestedUserId)!.push(followingUserId)
        }
      })
    })

    // Create suggestions with mutual follow count as score
    for (const [suggestedUserId, mutualFollows] of mutualMap) {
      if (mutualFollows.length >= 1) { // At least 1 mutual follow
        suggestions.push({
          userId: suggestedUserId,
          reason: 'mutual_follows',
          score: mutualFollows.length * 10,
          mutualFollows
        })
      }
    }

    return suggestions
  }

  /**
   * Get popular user suggestions
   */
  private getPopularUserSuggestions(userId: string, userFollowing: string[]): FollowSuggestion[] {
    const suggestions: FollowSuggestion[] = []
    const popularUsers: string[] = []

    // Find users with high follower counts
    for (const [, stats] of this.userStats) {
      if (stats.userId !== userId && 
          !userFollowing.includes(stats.userId) && 
          stats.followersCount > 100) {
        popularUsers.push(stats.userId)
      }
    }

    // Sort by follower count and take top users
    popularUsers
      .sort((a, b) => {
        const statsA = this.getUserStats(a)
        const statsB = this.getUserStats(b)
        return statsB.followersCount - statsA.followersCount
      })
      .slice(0, 5)
      .forEach(popularUserId => {
        const stats = this.getUserStats(popularUserId)
        suggestions.push({
          userId: popularUserId,
          reason: 'popular',
          score: Math.min(stats.followersCount / 10, 50) // Cap at 50 points
        })
      })

    return suggestions
  }

  /**
   * Toggle notification settings for a followed user
   */
  toggleNotifications(followerId: string, followingId: string, enabled: boolean): boolean {
    const relationshipId = `${followerId}_${followingId}`
    const relationship = this.relationships.get(relationshipId)

    if (!relationship || !relationship.isActive) {
      return false
    }

    relationship.notificationsEnabled = enabled
    this.relationships.set(relationshipId, relationship)
    return true
  }

  /**
   * Get feed content from followed users
   */
  getFollowingFeed(userId: string, limit: number = 20): any[] {
    const following = this.getFollowing(userId, 1000).following
    
    // In a real implementation, this would fetch posts from followed users
    // from a posts/content service
    const feedItems: any[] = []
    
    // Mock implementation - would integrate with actual content system
    following.forEach(followedUserId => {
      // Get posts from followedUserId and add to feed
      // feedItems.push(...getPostsByUser(followedUserId))
    })

    return feedItems.slice(0, limit)
  }

  /**
   * Batch follow/unfollow operations
   */
  async batchFollow(followerId: string, userIds: string[]): Promise<{
    successful: string[]
    failed: Array<{userId: string, error: string}>
  }> {
    const successful: string[] = []
    const failed: Array<{userId: string, error: string}> = []

    for (const userId of userIds) {
      const result = await this.followUser(followerId, userId)
      if (result.success) {
        successful.push(userId)
      } else {
        failed.push({ userId, error: result.error || 'Unknown error' })
      }
    }

    return { successful, failed }
  }

  /**
   * Get relationship status between two users
   */
  getRelationshipStatus(userAId: string, userBId: string): {
    aFollowsB: boolean
    bFollowsA: boolean
    isMutual: boolean
    relationshipType: 'none' | 'following' | 'follower' | 'mutual'
  } {
    const aFollowsB = this.isFollowing(userAId, userBId)
    const bFollowsA = this.isFollowing(userBId, userAId)
    const isMutual = aFollowsB && bFollowsA

    let relationshipType: 'none' | 'following' | 'follower' | 'mutual' = 'none'
    if (isMutual) {
      relationshipType = 'mutual'
    } else if (aFollowsB) {
      relationshipType = 'following'
    } else if (bFollowsA) {
      relationshipType = 'follower'
    }

    return {
      aFollowsB,
      bFollowsA,
      isMutual,
      relationshipType
    }
  }
}

// Singleton instance
export const followingSystem = new FollowingSystem()

// Helper functions for UI components
export const formatFollowCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

export const getRelationshipLabel = (relationshipType: string): string => {
  switch (relationshipType) {
    case 'mutual': return 'Mutual Follow'
    case 'following': return 'Following'
    case 'follower': return 'Follows You'
    case 'none': return ''
    default: return ''
  }
}

export const getFollowButtonText = (relationshipType: string, isCurrentUser: boolean): string => {
  if (isCurrentUser) return 'Edit Profile'
  
  switch (relationshipType) {
    case 'following': return 'Unfollow'
    case 'mutual': return 'Unfollow'
    case 'follower': return 'Follow Back'
    case 'none': return 'Follow'
    default: return 'Follow'
  }
}


