/**
 * Community Platform Core - Forums, Chat, Social Features
 * Comprehensive community management system
 */

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  bio?: string
  role: 'member' | 'moderator' | 'admin' | 'premium'
  reputation: number
  badges: Badge[]
  joinedAt: string
  lastSeen: string
  isOnline: boolean
  tradingLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified: boolean
  stats: {
    posts: number
    comments: number
    likes: number
    dislikes: number
    followers: number
    following: number
  }
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: 'trading' | 'community' | 'achievement' | 'special'
  requirements?: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export interface ForumCategory {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
  parentId?: string
  order: number
  isPrivate: boolean
  requiredRole?: User['role']
  requiredLevel?: User['tradingLevel']
  stats: {
    topics: number
    posts: number
    lastActivity: string
    activeMembers: number
  }
  moderators: string[] // User IDs
  subcategories?: ForumCategory[]
}

export interface ForumTopic {
  id: string
  title: string
  content: string
  slug: string
  categoryId: string
  authorId: string
  author: User
  isPinned: boolean
  isLocked: boolean
  isAnnouncement: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  lastActivity: string
  lastPostBy: User
  stats: {
    views: number
    replies: number
    likes: number
    participants: number
  }
  status: 'active' | 'closed' | 'archived' | 'deleted'
  metadata?: {
    tradingPair?: string
    strategy?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    marketCondition?: 'bull' | 'bear' | 'sideways'
  }
}

export interface ForumPost {
  id: string
  content: string
  topicId: string
  authorId: string
  author: User
  parentId?: string // For replies
  level: number // Thread depth
  createdAt: string
  updatedAt: string
  editedAt?: string
  editHistory?: PostEdit[]
  isDeleted: boolean
  deletedAt?: string
  deletedBy?: string
  reactions: Reaction[]
  attachments?: Attachment[]
  mentions: string[] // User IDs mentioned
  quotedPost?: string // Post ID being quoted
}

export interface PostEdit {
  editedAt: string
  editedBy: string
  reason?: string
  previousContent: string
}

export interface Reaction {
  id: string
  type: 'like' | 'dislike' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'rocket' | 'eyes'
  userId: string
  createdAt: string
}

export interface Attachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: string
}

export interface ChatRoom {
  id: string
  name: string
  description: string
  type: 'general' | 'trading' | 'support' | 'private' | 'voice'
  category: 'public' | 'premium' | 'private' | 'moderated'
  maxMembers?: number
  requiredRole?: User['role']
  requiredLevel?: User['tradingLevel']
  isActive: boolean
  createdBy: string
  createdAt: string
  settings: {
    allowFiles: boolean
    allowImages: boolean
    allowVoice: boolean
    allowVideo: boolean
    slowMode?: number // seconds between messages
    autoDeleteAfter?: number // hours
  }
  members: ChatMember[]
  moderators: string[]
  stats: {
    totalMessages: number
    activeMembers: number
    peakMembers: number
    lastActivity: string
  }
}

export interface ChatMember {
  userId: string
  user: User
  joinedAt: string
  role: 'member' | 'moderator'
  permissions: ChatPermission[]
  isMuted: boolean
  mutedUntil?: string
  mutedBy?: string
  lastReadAt: string
}

export interface ChatPermission {
  type: 'send_messages' | 'send_files' | 'send_images' | 'use_voice' | 'use_video' | 'mention_all' | 'pin_messages' | 'delete_messages'
  granted: boolean
}

export interface ChatMessage {
  id: string
  content: string
  roomId: string
  authorId: string
  author: User
  type: 'text' | 'image' | 'file' | 'system' | 'trade_signal' | 'market_alert'
  replyTo?: string // Message ID being replied to
  mentions: string[] // User IDs mentioned
  attachments?: Attachment[]
  reactions: Reaction[]
  isPinned: boolean
  pinnedBy?: string
  pinnedAt?: string
  createdAt: string
  updatedAt?: string
  editedAt?: string
  isDeleted: boolean
  deletedAt?: string
  deletedBy?: string
  systemData?: {
    event: string
    data: Record<string, any>
  }
  tradingData?: {
    symbol: string
    action: 'buy' | 'sell' | 'hold'
    price: number
    confidence: number
    reasoning: string
  }
}

export interface SocialPost {
  id: string
  content: string
  authorId: string
  author: User
  type: 'text' | 'image' | 'trade_idea' | 'market_analysis' | 'poll' | 'achievement'
  visibility: 'public' | 'followers' | 'premium' | 'private'
  tags: string[]
  mentions: string[]
  attachments?: Attachment[]
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
  pollData?: {
    question: string
    options: Array<{
      id: string
      text: string
      votes: number
      voters: string[]
    }>
    expiresAt: string
    allowMultiple: boolean
  }
  createdAt: string
  updatedAt?: string
  reactions: Reaction[]
  comments: SocialComment[]
  shares: number
  views: number
  isPromoted: boolean
  promotedUntil?: string
  status: 'active' | 'hidden' | 'reported' | 'deleted'
}

export interface SocialComment {
  id: string
  content: string
  postId: string
  authorId: string
  author: User
  parentId?: string // For nested comments
  level: number
  createdAt: string
  updatedAt?: string
  reactions: Reaction[]
  mentions: string[]
  isDeleted: boolean
}

export interface Notification {
  id: string
  userId: string
  type: 'mention' | 'reply' | 'like' | 'follow' | 'message' | 'trade_signal' | 'market_alert' | 'system'
  title: string
  content: string
  data: Record<string, any>
  isRead: boolean
  createdAt: string
  readAt?: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'social' | 'trading' | 'system' | 'security'
}

export interface CommunityStats {
  totalMembers: number
  activeMembers: number
  onlineMembers: number
  totalTopics: number
  totalPosts: number
  totalMessages: number
  topContributors: Array<{
    user: User
    contributions: number
    category: string
  }>
  trending: {
    topics: ForumTopic[]
    tags: Array<{
      tag: string
      count: number
      trend: 'up' | 'down' | 'stable'
    }>
    discussions: ForumTopic[]
  }
  recentActivity: Array<{
    type: string
    user: User
    content: string
    timestamp: string
    url: string
  }>
}

// Mock data for development
export const COMMUNITY_BADGES: Badge[] = [
  {
    id: 'first_post',
    name: 'First Steps',
    description: 'Made your first post in the community',
    icon: '🌟',
    color: '#10B981',
    category: 'community',
    rarity: 'common'
  },
  {
    id: 'helpful_member',
    name: 'Helpful Member',
    description: 'Received 50+ likes on your posts',
    icon: '💫',
    color: '#3B82F6',
    category: 'community',
    requirements: '50+ likes received',
    rarity: 'uncommon'
  },
  {
    id: 'trading_guru',
    name: 'Trading Guru',
    description: 'Expert trader with verified profitable strategies',
    icon: '🎯',
    color: '#F59E0B',
    category: 'trading',
    requirements: 'Verified profitable trading record',
    rarity: 'rare'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Among the first 100 community members',
    icon: '🚀',
    color: '#8B5CF6',
    category: 'special',
    rarity: 'epic'
  },
  {
    id: 'market_wizard',
    name: 'Market Wizard',
    description: 'Legendary trader with exceptional market insights',
    icon: '🧙‍♂️',
    color: '#EF4444',
    category: 'trading',
    requirements: 'Exceptional trading performance and community contributions',
    rarity: 'legendary'
  }
]

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: 'general',
    name: 'General Discussion',
    description: 'General trading discussions and community chat',
    slug: 'general',
    icon: '💬',
    color: '#6B7280',
    order: 1,
    isPrivate: false,
    stats: {
      topics: 1247,
      posts: 8934,
      lastActivity: new Date().toISOString(),
      activeMembers: 892
    },
    moderators: ['mod1', 'mod2']
  },
  {
    id: 'strategies',
    name: 'Trading Strategies',
    description: 'Share and discuss trading strategies, setups, and techniques',
    slug: 'strategies',
    icon: '📈',
    color: '#10B981',
    order: 2,
    isPrivate: false,
    stats: {
      topics: 567,
      posts: 3421,
      lastActivity: new Date().toISOString(),
      activeMembers: 445
    },
    moderators: ['mod1']
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis',
    description: 'Technical and fundamental market analysis discussions',
    slug: 'market-analysis',
    icon: '📊',
    color: '#3B82F6',
    order: 3,
    isPrivate: false,
    stats: {
      topics: 334,
      posts: 1876,
      lastActivity: new Date().toISOString(),
      activeMembers: 298
    },
    moderators: ['mod2']
  },
  {
    id: 'ai-trading',
    name: 'AI & Automation',
    description: 'Discuss AI-powered trading, bots, and automation strategies',
    slug: 'ai-trading',
    icon: '🤖',
    color: '#8B5CF6',
    order: 4,
    isPrivate: false,
    stats: {
      topics: 189,
      posts: 1023,
      lastActivity: new Date().toISOString(),
      activeMembers: 167
    },
    moderators: ['mod1', 'mod2']
  },
  {
    id: 'premium',
    name: 'Premium Members',
    description: 'Exclusive discussions for premium subscribers',
    slug: 'premium',
    icon: '⭐',
    color: '#F59E0B',
    order: 5,
    isPrivate: true,
    requiredRole: 'premium',
    stats: {
      topics: 78,
      posts: 456,
      lastActivity: new Date().toISOString(),
      activeMembers: 89
    },
    moderators: ['mod1']
  }
]

export const CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'general',
    name: 'General Chat',
    description: 'Main community chat room',
    type: 'general',
    category: 'public',
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00.000Z',
    settings: {
      allowFiles: true,
      allowImages: true,
      allowVoice: false,
      allowVideo: false,
      slowMode: 5
    },
    members: [],
    moderators: ['mod1', 'mod2'],
    stats: {
      totalMessages: 12456,
      activeMembers: 234,
      peakMembers: 567,
      lastActivity: new Date().toISOString()
    }
  },
  {
    id: 'trading-signals',
    name: 'Trading Signals',
    description: 'Live trading signals and alerts',
    type: 'trading',
    category: 'premium',
    isActive: true,
    requiredRole: 'premium',
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00.000Z',
    settings: {
      allowFiles: false,
      allowImages: true,
      allowVoice: false,
      allowVideo: false,
      slowMode: 10,
      autoDeleteAfter: 24
    },
    members: [],
    moderators: ['mod1'],
    stats: {
      totalMessages: 3456,
      activeMembers: 89,
      peakMembers: 156,
      lastActivity: new Date().toISOString()
    }
  },
  {
    id: 'market-watch',
    name: 'Market Watch',
    description: 'Real-time market discussions and analysis',
    type: 'trading',
    category: 'public',
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00.000Z',
    settings: {
      allowFiles: true,
      allowImages: true,
      allowVoice: false,
      allowVideo: false,
      slowMode: 3
    },
    members: [],
    moderators: ['mod2'],
    stats: {
      totalMessages: 8934,
      activeMembers: 178,
      peakMembers: 345,
      lastActivity: new Date().toISOString()
    }
  }
]

// Utility functions
export const getUserReputation = (user: User): { level: string, color: string, description: string } => {
  const { reputation } = user
  
  if (reputation >= 10000) return { level: 'Legend', color: '#EF4444', description: 'Legendary community member' }
  if (reputation >= 5000) return { level: 'Expert', color: '#8B5CF6', description: 'Expert trader and contributor' }
  if (reputation >= 2000) return { level: 'Advanced', color: '#F59E0B', description: 'Advanced community member' }
  if (reputation >= 500) return { level: 'Experienced', color: '#10B981', description: 'Experienced trader' }
  if (reputation >= 100) return { level: 'Active', color: '#3B82F6', description: 'Active community member' }
  return { level: 'Newcomer', color: '#6B7280', description: 'New to the community' }
}

export const getUserBadges = (user: User): Badge[] => {
  // In production, this would be calculated based on user achievements
  return COMMUNITY_BADGES.filter((_, index) => index < Math.floor(user.reputation / 1000) + 1)
}

export const formatUserStats = (stats: User['stats']) => {
  return {
    ...stats,
    engagement: Math.round((stats.likes / Math.max(stats.posts, 1)) * 100),
    influence: stats.followers - stats.following,
    activity: stats.posts + stats.comments
  }
}

export const canUserAccess = (user: User, category: ForumCategory): boolean => {
  if (!category.isPrivate) return true
  if (category.requiredRole && user.role !== category.requiredRole) return false
  if (category.requiredLevel) {
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert']
    const userLevelIndex = levelOrder.indexOf(user.tradingLevel)
    const requiredLevelIndex = levelOrder.indexOf(category.requiredLevel)
    if (userLevelIndex < requiredLevelIndex) return false
  }
  return true
}

export const canUserAccessRoom = (user: User, room: ChatRoom): boolean => {
  if (room.category === 'public') return true
  if (room.requiredRole && user.role !== room.requiredRole && user.role !== 'admin') return false
  if (room.requiredLevel) {
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert']
    const userLevelIndex = levelOrder.indexOf(user.tradingLevel)
    const requiredLevelIndex = levelOrder.indexOf(room.requiredLevel)
    if (userLevelIndex < requiredLevelIndex) return false
  }
  return true
}

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const truncateContent = (content: string, maxLength: number = 150): string => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength).trim() + '...'
}

export const getTimeAgo = (timestamp: string): string => {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (years > 0) return `${years}y ago`
  if (months > 0) return `${months}mo ago`
  if (weeks > 0) return `${weeks}w ago`
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

export const isUserOnline = (user: User): boolean => {
  const lastSeen = new Date(user.lastSeen).getTime()
  const now = Date.now()
  const offlineThreshold = 5 * 60 * 1000 // 5 minutes
  
  return now - lastSeen < offlineThreshold
}

// Export for testing
export const __testing__ = {
  getUserReputation,
  getUserBadges,
  formatUserStats,
  canUserAccess,
  canUserAccessRoom,
  generateSlug,
  truncateContent,
  getTimeAgo,
  isUserOnline
}


