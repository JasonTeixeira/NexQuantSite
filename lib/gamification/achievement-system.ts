/**
 * Achievement System
 * Handles badge creation, tracking, and gamification features
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'trading' | 'social' | 'learning' | 'milestones' | 'special'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  conditions: AchievementCondition[]
  rewards?: {
    points: number
    badge: string
    title?: string
    perks?: string[]
  }
  isHidden: boolean
  unlockedAt?: string
}

export interface AchievementCondition {
  type: 'trades' | 'winrate' | 'pnl' | 'streak' | 'followers' | 'posts' | 'likes' | 'days_active' | 'referrals' | 'custom'
  operator: '>=' | '>' | '=' | '<' | '<=' | 'between'
  value: number | [number, number]
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'alltime'
}

export interface UserProgress {
  userId: string
  achievements: string[] // Achievement IDs
  points: number
  level: number
  progress: Record<string, {
    current: number
    target: number
    percentage: number
  }>
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Trading Achievements
  {
    id: 'first_trade',
    name: 'First Steps',
    description: 'Execute your first trade on the platform',
    icon: 'BarChart3',
    category: 'trading',
    rarity: 'common',
    conditions: [
      { type: 'trades', operator: '>=', value: 1, timeframe: 'alltime' }
    ],
    rewards: {
      points: 100,
      badge: 'first_trade',
      perks: ['Welcome bonus']
    },
    isHidden: false
  },
  {
    id: 'hundred_trades',
    name: 'Century Club',
    description: 'Complete 100 successful trades',
    icon: 'Target',
    category: 'trading',
    rarity: 'uncommon',
    conditions: [
      { type: 'trades', operator: '>=', value: 100, timeframe: 'alltime' }
    ],
    rewards: {
      points: 500,
      badge: 'century_club'
    },
    isHidden: false
  },
  {
    id: 'profitable_month',
    name: 'Monthly Winner',
    description: 'Achieve positive P&L for an entire month',
    icon: 'DollarSign',
    category: 'trading',
    rarity: 'rare',
    conditions: [
      { type: 'pnl', operator: '>', value: 0, timeframe: 'month' }
    ],
    rewards: {
      points: 1000,
      badge: 'monthly_winner',
      title: 'Monthly Champion'
    },
    isHidden: false
  },
  {
    id: 'high_winrate',
    name: 'Precision Trader',
    description: 'Maintain a 75%+ win rate over 50+ trades',
    icon: 'Crown',
    category: 'trading',
    rarity: 'epic',
    conditions: [
      { type: 'winrate', operator: '>=', value: 75, timeframe: 'alltime' },
      { type: 'trades', operator: '>=', value: 50, timeframe: 'alltime' }
    ],
    rewards: {
      points: 2500,
      badge: 'precision_trader',
      title: 'Master Trader',
      perks: ['Advanced analytics access', 'Premium signals']
    },
    isHidden: false
  },
  {
    id: 'millionaire',
    name: 'Seven Figures',
    description: 'Achieve $1,000,000+ in total P&L',
    icon: 'Trophy',
    category: 'trading',
    rarity: 'legendary',
    conditions: [
      { type: 'pnl', operator: '>=', value: 1000000, timeframe: 'alltime' }
    ],
    rewards: {
      points: 10000,
      badge: 'millionaire',
      title: 'Trading Legend',
      perks: ['VIP support', 'Exclusive events', 'Custom features']
    },
    isHidden: false
  },

  // Social Achievements  
  {
    id: 'first_post',
    name: 'Breaking the Ice',
    description: 'Share your first post with the community',
    icon: 'MessageSquare',
    category: 'social',
    rarity: 'common',
    conditions: [
      { type: 'posts', operator: '>=', value: 1, timeframe: 'alltime' }
    ],
    rewards: {
      points: 50,
      badge: 'first_post'
    },
    isHidden: false
  },
  {
    id: 'popular_post',
    name: 'Community Favorite',
    description: 'Receive 100+ likes on a single post',
    icon: 'Heart',
    category: 'social',
    rarity: 'uncommon',
    conditions: [
      { type: 'likes', operator: '>=', value: 100, timeframe: 'alltime' }
    ],
    rewards: {
      points: 300,
      badge: 'popular_post'
    },
    isHidden: false
  },
  {
    id: 'influencer',
    name: 'Community Influencer',
    description: 'Gain 1,000+ followers',
    icon: 'Users',
    category: 'social',
    rarity: 'rare',
    conditions: [
      { type: 'followers', operator: '>=', value: 1000, timeframe: 'alltime' }
    ],
    rewards: {
      points: 2000,
      badge: 'influencer',
      title: 'Influencer',
      perks: ['Boosted post visibility', 'Analytics dashboard']
    },
    isHidden: false
  },

  // Learning Achievements
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 10 educational modules',
    icon: 'BookOpen',
    category: 'learning',
    rarity: 'common',
    conditions: [
      { type: 'custom', operator: '>=', value: 10, timeframe: 'alltime' }
    ],
    rewards: {
      points: 200,
      badge: 'knowledge_seeker'
    },
    isHidden: false
  },

  // Milestone Achievements
  {
    id: 'one_year',
    name: 'Veteran Trader',
    description: 'Active member for one full year',
    icon: 'Calendar',
    category: 'milestones',
    rarity: 'rare',
    conditions: [
      { type: 'days_active', operator: '>=', value: 365, timeframe: 'alltime' }
    ],
    rewards: {
      points: 1500,
      badge: 'veteran',
      title: 'Veteran',
      perks: ['Loyalty bonus', 'Beta feature access']
    },
    isHidden: false
  },

  // Special Hidden Achievements
  {
    id: 'lucky_seven',
    name: 'Lucky Seven',
    description: 'Win exactly 7 trades in a row on the 7th of the month',
    icon: 'Star',
    category: 'special',
    rarity: 'legendary',
    conditions: [
      { type: 'streak', operator: '=', value: 7, timeframe: 'day' },
      { type: 'custom', operator: '=', value: 7, timeframe: 'day' } // Day of month
    ],
    rewards: {
      points: 777,
      badge: 'lucky_seven',
      title: 'Lucky Seven'
    },
    isHidden: true
  }
]

export class AchievementEngine {
  private achievements: Map<string, Achievement>
  private userProgress: Map<string, UserProgress>

  constructor() {
    this.achievements = new Map()
    this.userProgress = new Map()
    this.loadAchievements()
  }

  private loadAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
      this.achievements.set(achievement.id, achievement)
    })
  }

  /**
   * Check if user has unlocked any new achievements
   */
  async checkAchievements(userId: string, userStats: any): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []
    const progress = this.getUserProgress(userId)

    for (const [achievementId, achievement] of this.achievements) {
      if (progress.achievements.includes(achievementId)) {
        continue // Already unlocked
      }

      if (this.meetsConditions(achievement, userStats)) {
        newAchievements.push(achievement)
        await this.unlockAchievement(userId, achievementId)
      }
    }

    return newAchievements
  }

  /**
   * Check if user meets all conditions for an achievement
   */
  private meetsConditions(achievement: Achievement, userStats: any): boolean {
    return achievement.conditions.every(condition => {
      const statValue = this.getStatValue(condition.type, userStats, condition.timeframe)
      return this.evaluateCondition(statValue, condition)
    })
  }

  /**
   * Get stat value for condition checking
   */
  private getStatValue(type: string, userStats: any, timeframe?: string): number {
    const timeframeSuffix = timeframe && timeframe !== 'alltime' ? `_${timeframe}` : ''
    const statKey = `${type}${timeframeSuffix}`
    
    return userStats[statKey] || userStats[type] || 0
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(value: number, condition: AchievementCondition): boolean {
    switch (condition.operator) {
      case '>=': return (value >= (condition.value as number))
      case '>': return (value > (condition.value as number))
      case '=': return (value === (condition.value as number))
      case '<': return (value < (condition.value as number))
      case '<=': return (value <= (condition.value as number))
      case 'between':
        const [min, max] = condition.value as [number, number]
        return value >= min && value <= max
      default: return false
    }
  }

  /**
   * Unlock achievement for user
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const progress = this.getUserProgress(userId)
    const achievement = this.achievements.get(achievementId)
    
    if (!achievement || progress.achievements.includes(achievementId)) {
      return
    }

    progress.achievements.push(achievementId)
    
    if (achievement.rewards) {
      progress.points += achievement.rewards.points || 0
      progress.level = this.calculateLevel(progress.points)
    }

    // Store timestamp
    achievement.unlockedAt = new Date().toISOString()

    // Send notification, update database, etc.
    await this.notifyAchievementUnlocked(userId, achievement)
    
    this.userProgress.set(userId, progress)
  }

  /**
   * Get user's achievement progress
   */
  getUserProgress(userId: string): UserProgress {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        achievements: [],
        points: 0,
        level: 1,
        progress: {}
      })
    }
    return this.userProgress.get(userId)!
  }

  /**
   * Calculate user level based on points
   */
  private calculateLevel(points: number): number {
    // Level progression: 100, 300, 600, 1000, 1500, 2100, 2800, etc.
    // Formula: level n requires sum of (i * 100) for i=1 to n
    let level = 1
    let requiredPoints = 0
    
    while (requiredPoints < points) {
      level++
      requiredPoints += level * 100
    }
    
    return Math.max(1, level - 1)
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: string): Achievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category)
  }

  /**
   * Get user's unlocked achievements
   */
  getUserAchievements(userId: string): Achievement[] {
    const progress = this.getUserProgress(userId)
    return progress.achievements
      .map(id => this.achievements.get(id))
      .filter(Boolean) as Achievement[]
  }

  /**
   * Get user's progress toward specific achievement
   */
  getAchievementProgress(userId: string, achievementId: string, userStats: any): {
    completed: boolean
    conditions: Array<{
      type: string
      completed: boolean
      progress: number
      target: number
    }>
  } {
    const achievement = this.achievements.get(achievementId)
    if (!achievement) {
      return { completed: false, conditions: [] }
    }

    const progress = this.getUserProgress(userId)
    const completed = progress.achievements.includes(achievementId)

    const conditions = achievement.conditions.map(condition => {
      const current = this.getStatValue(condition.type, userStats, condition.timeframe)
      const target = condition.value as number
      const conditionCompleted = this.evaluateCondition(current, condition)

      return {
        type: condition.type,
        completed: conditionCompleted,
        progress: current,
        target: target
      }
    })

    return { completed, conditions }
  }

  /**
   * Get leaderboard of users by achievement points
   */
  getLeaderboard(limit: number = 10): Array<{
    userId: string
    points: number
    level: number
    achievementCount: number
  }> {
    return Array.from(this.userProgress.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map(progress => ({
        userId: progress.userId,
        points: progress.points,
        level: progress.level,
        achievementCount: progress.achievements.length
      }))
  }

  /**
   * Notify user of achievement unlock
   */
  private async notifyAchievementUnlocked(userId: string, achievement: Achievement): Promise<void> {
    // Implementation would send notification via email, push, in-app, etc.
    console.log(`🎉 Achievement unlocked for ${userId}: ${achievement.name}`)
    
    // Could integrate with notification service
    // await notificationService.send({
    //   userId,
    //   type: 'achievement_unlocked',
    //   title: 'Achievement Unlocked!',
    //   message: `You've earned the "${achievement.name}" badge!`,
    //   data: { achievement }
    // })
  }

  /**
   * Get rarity distribution of user's achievements
   */
  getRarityStats(userId: string): Record<string, number> {
    const userAchievements = this.getUserAchievements(userId)
    const rarityCount: Record<string, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    }

    userAchievements.forEach(achievement => {
      rarityCount[achievement.rarity]++
    })

    return rarityCount
  }

  /**
   * Suggest next achievements for user
   */
  getSuggestedAchievements(userId: string, userStats: any, limit: number = 5): Array<{
    achievement: Achievement
    progress: number
    estimatedTime?: string
  }> {
    const progress = this.getUserProgress(userId)
    const unlockedIds = progress.achievements

    return Array.from(this.achievements.values())
      .filter(achievement => !unlockedIds.includes(achievement.id) && !achievement.isHidden)
      .map(achievement => {
        const progressInfo = this.getAchievementProgress(userId, achievement.id, userStats)
        const overallProgress = progressInfo.conditions.reduce((sum, cond) => 
          sum + Math.min(100, (cond.progress / cond.target) * 100), 0
        ) / progressInfo.conditions.length

        return {
          achievement,
          progress: overallProgress
        }
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit)
  }
}

// Singleton instance
export const achievementEngine = new AchievementEngine()

// Helper functions for UI components
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-400'
    case 'uncommon': return 'text-green-400'
    case 'rare': return 'text-blue-400'
    case 'epic': return 'text-purple-400'
    case 'legendary': return 'text-amber-400'
    default: return 'text-gray-400'
  }
}

export const getRarityBadgeColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-600'
    case 'uncommon': return 'bg-green-600'
    case 'rare': return 'bg-blue-600'
    case 'epic': return 'bg-purple-600'
    case 'legendary': return 'bg-amber-600'
    default: return 'bg-gray-600'
  }
}
