export interface LeaderboardUser {
  id: string
  rank: number
  previousRank?: number
  displayName: string
  username: string
  avatar?: string
  points: number
  level: 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze'
  badge?: string
  country?: string
  verified: boolean
  winRate: number
  profitFactor: number
  monthlyReturn: number
  totalTrades: number
  streak: number
  achievements: string[]
  joinedDate: string
  lastActive: string
  privacy: {
    showStats: boolean
    showCountry: boolean
    showTrades: boolean
    showProfile: boolean
  }
  performance: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
  socialStats: {
    followers: number
    following: number
    copiers: number
  }
}

export interface LeaderboardStats {
  totalParticipants: number
  averagePoints: number
  topPerformer: string
  mostImproved: string
  currentSeason: string
  seasonEnds: string
  totalPrizePool: number
  activeCompetitions: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  category: 'trading' | 'social' | 'milestone' | 'special'
}

export interface Competition {
  id: string
  name: string
  description: string
  type: 'tournament' | 'challenge' | 'season'
  startDate: string
  endDate: string
  prizePool: number
  participants: number
  maxParticipants?: number
  status: 'upcoming' | 'active' | 'ended'
  requirements: string[]
}

export interface TradingChallenge {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration: string
  reward: number
  participants: number
  completionRate: number
  requirements: string[]
  isActive: boolean
}

// Mock data for demonstration
export const mockLeaderboardData: LeaderboardUser[] = [
  {
    id: '1',
    rank: 1,
    previousRank: 2,
    displayName: 'Alex "The Bull" Rodriguez',
    username: 'cryptobull_alex',
    avatar: '/placeholder.svg?height=100&width=100',
    points: 125750,
    level: 'Diamond',
    badge: 'Champion',
    country: 'US',
    verified: true,
    winRate: 87.5,
    profitFactor: 3.2,
    monthlyReturn: 24.8,
    totalTrades: 1247,
    streak: 12,
    achievements: ['first_place', 'profit_master', 'consistency_king', 'social_trader'],
    joinedDate: '2023-01-15',
    lastActive: '2024-01-08T10:30:00Z',
    privacy: {
      showStats: true,
      showCountry: true,
      showTrades: true,
      showProfile: true
    },
    performance: {
      daily: 2.1,
      weekly: 8.7,
      monthly: 24.8,
      yearly: 187.3
    },
    socialStats: {
      followers: 15420,
      following: 234,
      copiers: 892
    }
  },
  {
    id: '2',
    rank: 2,
    previousRank: 1,
    displayName: 'Sarah Chen',
    username: 'quantqueen_sarah',
    avatar: '/placeholder.svg?height=100&width=100',
    points: 118900,
    level: 'Diamond',
    badge: 'Quant Master',
    country: 'SG',
    verified: true,
    winRate: 91.2,
    profitFactor: 2.8,
    monthlyReturn: 22.1,
    totalTrades: 2156,
    streak: 8,
    achievements: ['precision_trader', 'algorithm_master', 'risk_manager'],
    joinedDate: '2023-02-20',
    lastActive: '2024-01-08T09:15:00Z',
    privacy: {
      showStats: true,
      showCountry: true,
      showTrades: true,
      showProfile: true
    },
    performance: {
      daily: 1.8,
      weekly: 7.2,
      monthly: 22.1,
      yearly: 165.8
    },
    socialStats: {
      followers: 12890,
      following: 156,
      copiers: 1205
    }
  },
  {
    id: '3',
    rank: 3,
    previousRank: 4,
    displayName: 'Marcus Thompson',
    username: 'scalp_master_mt',
    avatar: '/placeholder.svg?height=100&width=100',
    points: 112340,
    level: 'Diamond',
    badge: 'Speed Demon',
    country: 'UK',
    verified: true,
    winRate: 78.9,
    profitFactor: 2.1,
    monthlyReturn: 19.7,
    totalTrades: 3892,
    streak: 15,
    achievements: ['speed_trader', 'volume_king', 'streak_master'],
    joinedDate: '2023-03-10',
    lastActive: '2024-01-08T11:45:00Z',
    privacy: {
      showStats: true,
      showCountry: true,
      showTrades: false,
      showProfile: true
    },
    performance: {
      daily: 1.5,
      weekly: 6.8,
      monthly: 19.7,
      yearly: 142.3
    },
    socialStats: {
      followers: 8750,
      following: 89,
      copiers: 567
    }
  },
  {
    id: '4',
    rank: 4,
    previousRank: 3,
    displayName: 'Elena Volkov',
    username: 'crypto_elena',
    avatar: '/placeholder.svg?height=100&width=100',
    points: 108750,
    level: 'Platinum',
    badge: 'Rising Star',
    country: 'RU',
    verified: false,
    winRate: 82.3,
    profitFactor: 2.4,
    monthlyReturn: 18.2,
    totalTrades: 1876,
    streak: 6,
    achievements: ['newcomer', 'consistent_gains', 'community_helper'],
    joinedDate: '2023-06-15',
    lastActive: '2024-01-08T08:20:00Z',
    privacy: {
      showStats: true,
      showCountry: false,
      showTrades: true,
      showProfile: true
    },
    performance: {
      daily: 1.2,
      weekly: 5.9,
      monthly: 18.2,
      yearly: 128.7
    },
    socialStats: {
      followers: 4320,
      following: 234,
      copiers: 289
    }
  },
  {
    id: '5',
    rank: 5,
    displayName: 'David Kim',
    username: 'algo_david',
    avatar: '/placeholder.svg?height=100&width=100',
    points: 95680,
    level: 'Platinum',
    badge: 'Algorithm Expert',
    country: 'KR',
    verified: true,
    winRate: 85.7,
    profitFactor: 2.6,
    monthlyReturn: 16.8,
    totalTrades: 1543,
    streak: 4,
    achievements: ['tech_innovator', 'steady_growth', 'risk_taker'],
    joinedDate: '2023-04-22',
    lastActive: '2024-01-08T07:30:00Z',
    privacy: {
      showStats: true,
      showCountry: true,
      showTrades: true,
      showProfile: true
    },
    performance: {
      daily: 1.1,
      weekly: 4.8,
      monthly: 16.8,
      yearly: 115.2
    },
    socialStats: {
      followers: 6780,
      following: 145,
      copiers: 423
    }
  }
]

export const mockLeaderboardStats: LeaderboardStats = {
  totalParticipants: 47892,
  averagePoints: 12450,
  topPerformer: 'Alex Rodriguez',
  mostImproved: 'Elena Volkov',
  currentSeason: 'Winter Championship 2024',
  seasonEnds: '2024-03-31T23:59:59Z',
  totalPrizePool: 500000,
  activeCompetitions: 12
}

export const mockAchievements: Achievement[] = [
  {
    id: 'first_place',
    name: 'Champion',
    description: 'Reached #1 on the leaderboard',
    icon: '👑',
    rarity: 'legendary',
    points: 5000,
    category: 'milestone'
  },
  {
    id: 'profit_master',
    name: 'Profit Master',
    description: 'Achieved over 100% monthly return',
    icon: '💰',
    rarity: 'epic',
    points: 2500,
    category: 'trading'
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintained positive returns for 6 months',
    icon: '📈',
    rarity: 'rare',
    points: 1500,
    category: 'trading'
  },
  {
    id: 'social_trader',
    name: 'Social Trader',
    description: 'Have over 10,000 followers',
    icon: '👥',
    rarity: 'rare',
    points: 1000,
    category: 'social'
  },
  {
    id: 'precision_trader',
    name: 'Precision Trader',
    description: 'Achieved over 90% win rate',
    icon: '🎯',
    rarity: 'epic',
    points: 2000,
    category: 'trading'
  },
  {
    id: 'algorithm_master',
    name: 'Algorithm Master',
    description: 'Created a profitable trading algorithm',
    icon: '🤖',
    rarity: 'epic',
    points: 3000,
    category: 'trading'
  },
  {
    id: 'risk_manager',
    name: 'Risk Manager',
    description: 'Never exceeded 2% drawdown',
    icon: '🛡️',
    rarity: 'rare',
    points: 1200,
    category: 'trading'
  }
]

export const mockCompetitions: Competition[] = [
  {
    id: 'winter_championship',
    name: 'Winter Championship 2024',
    description: 'The ultimate trading competition with $500K prize pool',
    type: 'tournament',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-03-31T23:59:59Z',
    prizePool: 500000,
    participants: 15420,
    maxParticipants: 20000,
    status: 'active',
    requirements: ['Minimum 1000 points', 'Verified account', 'Active for 30+ days']
  },
  {
    id: 'scalping_challenge',
    name: 'Scalping Masters Challenge',
    description: 'Short-term trading competition for scalpers',
    type: 'challenge',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-22T23:59:59Z',
    prizePool: 50000,
    participants: 3420,
    maxParticipants: 5000,
    status: 'active',
    requirements: ['Gold level or higher', 'Minimum 100 trades']
  }
]

export const mockTradingChallenges: TradingChallenge[] = [
  {
    id: 'daily_profit',
    title: 'Daily Profit Challenge',
    description: 'Achieve 2% daily profit for 5 consecutive days',
    difficulty: 'intermediate',
    duration: '5 days',
    reward: 500,
    participants: 1250,
    completionRate: 23.5,
    requirements: ['Minimum 10 trades per day', 'Maximum 5% risk per trade'],
    isActive: true
  },
  {
    id: 'risk_master',
    title: 'Risk Management Master',
    description: 'Complete 50 trades with less than 1% drawdown',
    difficulty: 'advanced',
    duration: '30 days',
    reward: 2000,
    participants: 890,
    completionRate: 12.8,
    requirements: ['Verified account', 'Minimum Silver level'],
    isActive: true
  }
]

// Utility functions
export const getRankChange = (currentRank: number, previousRank?: number): 'up' | 'down' | 'same' | 'new' => {
  if (!previousRank) return 'new'
  if (currentRank < previousRank) return 'up'
  if (currentRank > previousRank) return 'down'
  return 'same'
}

export const getLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'diamond': return 'text-cyan-400'
    case 'platinum': return 'text-gray-300'
    case 'gold': return 'text-yellow-400'
    case 'silver': return 'text-gray-400'
    case 'bronze': return 'text-orange-600'
    default: return 'text-gray-500'
  }
}

export const getLevelBadgeColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'diamond': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    case 'platinum': return 'bg-gray-300/20 text-gray-300 border-gray-300/30'
    case 'gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'silver': return 'bg-gray-400/20 text-gray-400 border-gray-400/30'
    case 'bronze': return 'bg-orange-600/20 text-orange-600 border-orange-600/30'
    default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
  }
}

export const getAchievementRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
    case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500'
    case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    case 'common': return 'bg-gradient-to-r from-gray-500 to-gray-600'
    default: return 'bg-gray-500'
  }
}

export async function getLeaderboardData(
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
  category: 'overall' | 'profit' | 'winrate' | 'volume' = 'overall',
  limit: number = 100
): Promise<LeaderboardUser[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Return mock data for now
  return mockLeaderboardData.slice(0, limit)
}

export async function getUserLeaderboardProfile(userId: string): Promise<LeaderboardUser | null> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Return mock user profile
  const user = mockLeaderboardData.find(u => u.id === userId)
  if (!user) return null
  
  return user
}
