/**
 * Community API Client
 * Centralized service for all community-related API calls
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PostFilters {
  type?: 'trade' | 'strategy' | 'insight' | 'question' | 'news'
  authorId?: string
  search?: string
  sortBy?: 'createdAt' | 'popular' | 'views' | 'comments'
  sortOrder?: 'asc' | 'desc'
  tags?: string[]
}

export interface Post {
  id: string
  type: 'trade' | 'strategy' | 'insight' | 'question' | 'news'
  title: string
  content: string
  author: {
    id: string
    username: string
    displayName: string
    avatar: string
    verified: boolean
    level: string
    followers: number
    reputation: number
    badges: string[]
  }
  visibility: 'public' | 'followers' | 'premium' | 'private'
  tags: string[]
  mentions: string[]
  tradingData?: {
    symbol: string
    action: 'buy' | 'sell' | 'hold'
    entryPrice?: number
    targetPrice?: number
    stopLoss?: number
    timeframe: string
    analysis: string
    confidence: number
  }
  media?: {
    type: 'image' | 'chart' | 'video'
    url: string
    thumbnail?: string
  }
  createdAt: string
  updatedAt?: string
  reactions: Array<{
    type: string
    count: number
    hasUserReacted: boolean
  }>
  comments: number
  shares: number
  views: number
  bookmarks: number
  isPromoted: boolean
  status: 'active' | 'hidden' | 'reported' | 'deleted'
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: {
    id: string
    username: string
    displayName: string
    avatar: string
    level: string
    verified: boolean
    reputation: number
    badges: string[]
  }
  createdAt: string
  updatedAt: string
  likes: number
  hasUserLiked: boolean
  replyCount: number
  isEdited: boolean
  mentions: string[]
  replies?: Comment[]
}

export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  coverImage?: string
  verified: boolean
  level: string
  reputation: number
  followers: number
  following: number
  totalPosts: number
  totalLikes: number
  joinedDate: string
  lastActive: string
  bio: string
  location?: string
  website?: string
  twitter?: string
  badges: Array<{
    id: string
    name: string
    icon: string
    description: string
    earnedAt: string
    rarity: string
  }>
  specialties: string[]
}

export interface Conversation {
  id: string
  participants: Array<{
    id: string
    username: string
    displayName: string
    avatar: string
    isOnline: boolean
    lastSeen: string
  }>
  lastMessage: {
    id: string
    senderId: string
    content: string
    sentAt: string
    isRead: boolean
    messageType: string
  }
  unreadCount: number
  totalMessages: number
  createdAt: string
  updatedAt: string
  isArchived: boolean
  isMuted: boolean
  isPinned: boolean
  labels: string[]
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  messageType: 'text' | 'image' | 'link' | 'file'
  sentAt: string
  isRead: boolean
  isDelivered: boolean
  isEdited: boolean
  reactions: Array<{
    type: string
    userId: string
    addedAt: string
  }>
  replyTo?: string
  attachments: Array<{
    type: string
    url: string
    filename?: string
    size?: number
  }>
}

export interface Group {
  id: string
  name: string
  description: string
  category: 'trading' | 'learning' | 'social' | 'news'
  privacy: 'public' | 'private' | 'invite_only'
  avatar?: string
  coverImage?: string
  memberCount: number
  postCount: number
  activeMembers: number
  todaysPosts: number
  weeklyPosts: number
  monthlyPosts: number
  owner: {
    id: string
    username: string
    displayName: string
    avatar: string
    verified: boolean
  }
  userMembership: {
    isMember: boolean
    joinedAt?: string
    role?: 'owner' | 'moderator' | 'member'
    notifications: boolean
    canPost: boolean
    canInvite: boolean
  }
  tags: string[]
  createdAt: string
  updatedAt: string
  isActive: boolean
  isVerified: boolean
}

export interface Notification {
  id: string
  type: 'mention' | 'reaction' | 'follow' | 'comment' | 'post' | 'achievement' | 'system' | 'moderation'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  data: any
  actionUrl?: string
  isRead: boolean
  isArchived: boolean
  createdAt: string
  expiresAt?: string
  category: string
}

class CommunityApiClient {
  private baseUrl = '/api/community'

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          details: data.details
        }
      }

      return {
        success: true,
        data
      }
    } catch (error: any) {
      return {
        success: false,
        error: 'Network error',
        details: error.message
      }
    }
  }

  // Posts API
  async getPosts(filters: PostFilters & PaginationParams = {}): Promise<ApiResponse<{
    posts: Post[]
    pagination: any
    metrics: any
    filters: any
  }>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, value.toString())
        }
      }
    })

    return this.request(`/posts?${params.toString()}`)
  }

  async getPost(postId: string): Promise<ApiResponse<{ post: Post }>> {
    return this.request(`/posts/${postId}`)
  }

  async createPost(postData: {
    type: string
    title: string
    content: string
    tags?: string[]
    visibility?: string
    tradingData?: any
    media?: any
  }): Promise<ApiResponse<{ post: Post }>> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<ApiResponse<any>> {
    return this.request(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deletePost(postId: string): Promise<ApiResponse<any>> {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE'
    })
  }

  // Reactions API
  async toggleReaction(postId: string, reactionType: string): Promise<ApiResponse<any>> {
    return this.request(`/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reactionType })
    })
  }

  async getReactions(postId: string, type?: string): Promise<ApiResponse<any>> {
    const params = type ? `?type=${type}` : ''
    return this.request(`/posts/${postId}/reactions${params}`)
  }

  // Comments API
  async getComments(postId: string, params: PaginationParams & {
    sortBy?: string
    sortOrder?: string
  } = {}): Promise<ApiResponse<{
    comments: Comment[]
    pagination: any
    metrics: any
  }>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/posts/${postId}/comments?${queryParams.toString()}`)
  }

  async createComment(postId: string, commentData: {
    content: string
    parentCommentId?: string
    mentions?: string[]
  }): Promise<ApiResponse<{ comment: Comment }>> {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    })
  }

  // Users API
  async getUsers(params: {
    search?: string
    filter?: string
    level?: string
    sortBy?: string
    sortOrder?: string
  } & PaginationParams = {}): Promise<ApiResponse<{
    users: User[]
    pagination: any
    metrics: any
  }>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/users?${queryParams.toString()}`)
  }

  async getUser(userId: string, params: {
    includeStats?: boolean
    includePosts?: boolean
    postsLimit?: number
  } = {}): Promise<ApiResponse<{ user: User }>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/users/${userId}?${queryParams.toString()}`)
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async followUser(userId: string, action: 'follow' | 'unfollow'): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
  }

  async getFollowStatus(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/follow`)
  }

  // Messages API
  async getConversations(params: {
    type?: string
    search?: string
  } & PaginationParams = {}): Promise<ApiResponse<{
    conversations: Conversation[]
    pagination: any
    summary: any
  }>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/messages?${queryParams.toString()}`)
  }

  async getConversation(conversationId: string, params: PaginationParams = {}): Promise<ApiResponse<{
    conversation: Conversation & { messages: Message[] }
    pagination: any
    metadata: any
  }>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/messages/${conversationId}?${queryParams.toString()}`)
  }

  async sendMessage(messageData: {
    recipientId?: string
    conversationId?: string
    content: string
    messageType?: string
    attachments?: any[]
  }): Promise<ApiResponse<{ message: Message }>> {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    })
  }

  async updateConversation(conversationId: string, updates: {
    isArchived?: boolean
    isMuted?: boolean
    isPinned?: boolean
    labels?: string[]
  }): Promise<ApiResponse<any>> {
    return this.request(`/messages/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  // Groups API
  async getGroups(params: {
    search?: string
    category?: string
    privacy?: string
    sortBy?: string
    sortOrder?: string
    userGroups?: boolean
  } & PaginationParams = {}): Promise<ApiResponse<{
    groups: Group[]
    pagination: any
    stats: any
    filters: any
  }>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/groups?${queryParams.toString()}`)
  }

  async getGroup(groupId: string, params: {
    includeMembers?: boolean
    includePosts?: boolean
    postsLimit?: number
  } = {}): Promise<ApiResponse<{ group: Group }>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/groups/${groupId}?${queryParams.toString()}`)
  }

  async createGroup(groupData: {
    name: string
    description: string
    category: string
    privacy?: string
    tags?: string[]
    settings?: any
  }): Promise<ApiResponse<{ group: Group }>> {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    })
  }

  async joinGroup(groupId: string, action: 'join' | 'leave'): Promise<ApiResponse<any>> {
    return this.request(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
  }

  async getGroupMembers(groupId: string, params: {
    search?: string
    role?: string
    sortBy?: string
    sortOrder?: string
  } & PaginationParams = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/groups/${groupId}/members?${queryParams.toString()}`)
  }

  // Notifications API
  async getNotifications(params: {
    type?: string
    status?: string
    priority?: string
    markAsRead?: boolean
  } & PaginationParams = {}): Promise<ApiResponse<{
    notifications: Notification[]
    pagination: any
    summary: any
    filters: any
  }>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/notifications?${queryParams.toString()}`)
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    // This would be implemented as a specific endpoint for marking individual notifications
    // For now, we'll use the bulk read functionality
    return this.getNotifications({ markAsRead: true })
  }

  // Analytics API (for admin/power users)
  async getCommunityAnalytics(params: {
    timeframe?: string
    compare?: boolean
    granularity?: string
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/analytics/overview?${queryParams.toString()}`)
  }
}

// Create singleton instance
export const communityApi = new CommunityApiClient()

// Export for use in components
export default communityApi

