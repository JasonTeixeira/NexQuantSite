/**
 * Complete Referral System Backend
 * Handles referral tracking, code generation, commissions, and payouts
 */

// Referral System Types
export interface ReferralCode {
  id: string
  code: string
  userId: string
  type: 'personal' | 'campaign' | 'temporary'
  isActive: boolean
  createdAt: string
  expiresAt?: string
  usageLimit?: number
  currentUsage: number
  description?: string
}

export interface ReferralActivity {
  id: string
  referrerId: string
  referredUserId?: string
  referralCode: string
  status: 'pending' | 'completed' | 'cancelled' | 'expired'
  conversionType: 'signup' | 'activation' | 'subscription' | 'trade' | 'deposit'
  conversionValue: number
  commissionRate: number
  commissionAmount: number
  tier: number
  createdAt: string
  completedAt?: string
  metadata?: {
    signupSource?: string
    userAgent?: string
    ip?: string
    country?: string
    device?: string
    campaignId?: string
  }
}

export interface ReferralTier {
  id: string
  name: string
  description: string
  minReferrals: number
  maxReferrals?: number
  commissionRate: number
  bonusRate?: number
  color: string
  benefits: string[]
  requirements?: {
    minConversions?: number
    minRevenue?: number
    timeframe?: number // days
  }
}

export interface ReferralStats {
  userId: string
  totalReferrals: number
  activeReferrals: number
  pendingReferrals: number
  totalCommissions: number
  paidCommissions: number
  pendingCommissions: number
  conversionRate: number
  currentTier: string
  nextTierProgress: number
  lifetimeValue: number
  averageConversionValue: number
  monthlyStats: {
    referrals: number
    commissions: number
    conversions: number
  }
  topPerformingCodes: Array<{
    code: string
    conversions: number
    commission: number
  }>
}

export interface ReferralPayout {
  id: string
  userId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  method: 'bank_transfer' | 'paypal' | 'crypto' | 'platform_credit'
  requestedAt: string
  processedAt?: string
  transactionId?: string
  fees?: number
  netAmount?: number
  notes?: string
  commissionIds: string[]
}

export interface ReferralCampaign {
  id: string
  name: string
  description: string
  type: 'public' | 'private' | 'influencer'
  status: 'draft' | 'active' | 'paused' | 'ended'
  startDate: string
  endDate?: string
  targetAudience?: string[]
  commissionRates: {
    signup: number
    activation: number
    subscription: number
    trade: number
  }
  bonusIncentives?: {
    type: 'flat' | 'percentage'
    value: number
    condition: string
  }[]
  materials: {
    banners: string[]
    emails: string[]
    socialPosts: string[]
    landingPages: string[]
  }
  performance: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    roi: number
  }
}

// Default referral tiers
export const REFERRAL_TIERS: ReferralTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    description: 'Starting tier for new referrers',
    minReferrals: 0,
    maxReferrals: 9,
    commissionRate: 15,
    color: '#CD7F32',
    benefits: [
      '15% commission on referrals',
      'Basic referral dashboard',
      'Email support'
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    description: 'Intermediate tier with better rewards',
    minReferrals: 10,
    maxReferrals: 24,
    commissionRate: 20,
    bonusRate: 5,
    color: '#C0C0C0',
    benefits: [
      '20% commission on referrals',
      '5% bonus on tier achievement',
      'Advanced analytics',
      'Priority email support',
      'Custom referral codes'
    ],
    requirements: {
      minConversions: 5,
      timeframe: 90
    }
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'High-performance tier with premium benefits',
    minReferrals: 25,
    maxReferrals: 49,
    commissionRate: 25,
    bonusRate: 10,
    color: '#FFD700',
    benefits: [
      '25% commission on referrals',
      '10% tier achievement bonus',
      'Monthly performance reports',
      'Phone support',
      'Marketing materials access',
      'Early feature access'
    ],
    requirements: {
      minConversions: 15,
      minRevenue: 5000,
      timeframe: 90
    }
  },
  {
    id: 'platinum',
    name: 'Platinum',
    description: 'Elite tier for top performers',
    minReferrals: 50,
    commissionRate: 30,
    bonusRate: 15,
    color: '#E5E4E2',
    benefits: [
      '30% commission on referrals',
      '15% tier achievement bonus',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom marketing campaigns',
      'Beta feature testing',
      'Annual performance bonus',
      'VIP event invitations'
    ],
    requirements: {
      minConversions: 30,
      minRevenue: 15000,
      timeframe: 90
    }
  }
]

// Referral Management Class
export class ReferralManager {
  // Generate unique referral code
  static generateReferralCode(
    userId: string, 
    type: 'personal' | 'campaign' | 'temporary' = 'personal',
    customPrefix?: string
  ): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    const userHash = this.hashString(userId).toString(36).substr(0, 3).toUpperCase()
    
    if (customPrefix) {
      return `${customPrefix}${userHash}${random}`
    }
    
    const prefixes = {
      personal: 'REF',
      campaign: 'CAM',
      temporary: 'TMP'
    }
    
    return `${prefixes[type]}${userHash}${random}${timestamp.substr(-2)}`
  }
  
  // Validate referral code format
  static validateReferralCode(code: string): boolean {
    // Code should be 8-12 characters, alphanumeric, uppercase
    const codeRegex = /^[A-Z0-9]{6,12}$/
    return codeRegex.test(code)
  }
  
  // Track referral activity
  static async trackReferral(
    referralCode: string,
    conversionType: ReferralActivity['conversionType'],
    conversionValue: number,
    metadata?: ReferralActivity['metadata']
  ): Promise<ReferralActivity> {
    // In production, this would interact with database
    const referralActivity: ReferralActivity = {
      id: `ref_act_${Date.now()}`,
      referrerId: 'user_referrer', // Would be fetched from code
      referralCode,
      status: 'pending',
      conversionType,
      conversionValue,
      commissionRate: this.getCommissionRate(conversionType),
      commissionAmount: 0, // Calculated based on tier and rates
      tier: 1,
      createdAt: new Date().toISOString(),
      metadata
    }
    
    // Calculate commission
    referralActivity.commissionAmount = this.calculateCommission(
      conversionValue,
      referralActivity.commissionRate,
      referralActivity.tier
    )
    
    return referralActivity
  }
  
  // Calculate commission based on tier and rates
  static calculateCommission(
    conversionValue: number,
    baseRate: number,
    tier: number,
    bonusMultiplier: number = 1
  ): number {
    let commission = (conversionValue * baseRate) / 100
    
    // Apply tier bonuses
    if (tier > 1) {
      commission *= (1 + (tier - 1) * 0.05) // 5% bonus per tier above 1
    }
    
    // Apply bonus multiplier
    commission *= bonusMultiplier
    
    return Math.round(commission * 100) / 100 // Round to 2 decimals
  }
  
  // Get commission rate based on conversion type
  static getCommissionRate(conversionType: ReferralActivity['conversionType']): number {
    const rates = {
      signup: 5,
      activation: 15,
      subscription: 25,
      trade: 10,
      deposit: 20
    }
    return rates[conversionType] || 5
  }
  
  // Determine user tier based on stats
  static determineUserTier(stats: Partial<ReferralStats>): ReferralTier {
    const { totalReferrals = 0 } = stats
    
    for (let i = REFERRAL_TIERS.length - 1; i >= 0; i--) {
      const tier = REFERRAL_TIERS[i]
      if (totalReferrals >= tier.minReferrals && 
          (!tier.maxReferrals || totalReferrals <= tier.maxReferrals)) {
        return tier
      }
    }
    
    return REFERRAL_TIERS[0] // Default to bronze
  }
  
  // Calculate progress to next tier
  static calculateNextTierProgress(currentTier: ReferralTier, totalReferrals: number): number {
    const currentTierIndex = REFERRAL_TIERS.findIndex(tier => tier.id === currentTier.id)
    const nextTier = REFERRAL_TIERS[currentTierIndex + 1]
    
    if (!nextTier) return 100 // Already at highest tier
    
    const progress = ((totalReferrals - currentTier.minReferrals) / 
                     (nextTier.minReferrals - currentTier.minReferrals)) * 100
    
    return Math.min(100, Math.max(0, progress))
  }
  
  // Generate user referral statistics
  static generateUserStats(userId: string, activities: ReferralActivity[]): ReferralStats {
    const userActivities = activities.filter(activity => activity.referrerId === userId)
    
    const totalReferrals = userActivities.length
    const activeReferrals = userActivities.filter(a => a.status === 'completed').length
    const pendingReferrals = userActivities.filter(a => a.status === 'pending').length
    
    const totalCommissions = userActivities.reduce((sum, a) => sum + a.commissionAmount, 0)
    const paidCommissions = userActivities
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.commissionAmount, 0)
    const pendingCommissions = totalCommissions - paidCommissions
    
    const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0
    const averageConversionValue = activeReferrals > 0 
      ? userActivities
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + a.conversionValue, 0) / activeReferrals
      : 0
    
    const currentTier = this.determineUserTier({ totalReferrals })
    const nextTierProgress = this.calculateNextTierProgress(currentTier, totalReferrals)
    
    // Calculate monthly stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const monthlyActivities = userActivities.filter(
      a => new Date(a.createdAt) >= thirtyDaysAgo
    )
    
    const monthlyStats = {
      referrals: monthlyActivities.length,
      commissions: monthlyActivities.reduce((sum, a) => sum + a.commissionAmount, 0),
      conversions: monthlyActivities.filter(a => a.status === 'completed').length
    }
    
    // Top performing codes
    const codeStats = new Map()
    userActivities.forEach(activity => {
      const existing = codeStats.get(activity.referralCode) || { conversions: 0, commission: 0 }
      codeStats.set(activity.referralCode, {
        conversions: existing.conversions + (activity.status === 'completed' ? 1 : 0),
        commission: existing.commission + (activity.status === 'completed' ? activity.commissionAmount : 0)
      })
    })
    
    const topPerformingCodes = Array.from(codeStats.entries())
      .map(([code, stats]) => ({ code, ...stats }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 5)
    
    return {
      userId,
      totalReferrals,
      activeReferrals,
      pendingReferrals,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      conversionRate,
      currentTier: currentTier.id,
      nextTierProgress,
      lifetimeValue: totalCommissions,
      averageConversionValue,
      monthlyStats,
      topPerformingCodes
    }
  }
  
  // Process payout request
  static async processPayoutRequest(
    userId: string,
    amount: number,
    method: ReferralPayout['method'],
    commissionIds: string[]
  ): Promise<ReferralPayout> {
    const payout: ReferralPayout = {
      id: `payout_${Date.now()}`,
      userId,
      amount,
      currency: 'USD',
      status: 'pending',
      method,
      requestedAt: new Date().toISOString(),
      commissionIds
    }
    
    // Calculate fees based on method
    const fees = this.calculatePayoutFees(amount, method)
    payout.fees = fees
    payout.netAmount = amount - fees
    
    return payout
  }
  
  // Calculate payout fees
  static calculatePayoutFees(amount: number, method: ReferralPayout['method']): number {
    const feeRates = {
      bank_transfer: 0.02, // 2%
      paypal: 0.025, // 2.5%
      crypto: 0.01, // 1%
      platform_credit: 0 // No fees for platform credit
    }
    
    const rate = feeRates[method] || 0.02
    const fee = amount * rate
    
    // Minimum fee thresholds
    const minimumFees = {
      bank_transfer: 1,
      paypal: 0.5,
      crypto: 0,
      platform_credit: 0
    }
    
    return Math.max(fee, minimumFees[method] || 0)
  }
  
  // Generate referral analytics report
  static generateAnalyticsReport(
    activities: ReferralActivity[],
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ) {
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }
    
    const periodActivities = activities.filter(
      activity => new Date(activity.createdAt) >= startDate
    )
    
    return {
      totalReferrals: periodActivities.length,
      completedReferrals: periodActivities.filter(a => a.status === 'completed').length,
      pendingReferrals: periodActivities.filter(a => a.status === 'pending').length,
      totalCommissions: periodActivities.reduce((sum, a) => sum + a.commissionAmount, 0),
      averageCommission: periodActivities.length > 0 
        ? periodActivities.reduce((sum, a) => sum + a.commissionAmount, 0) / periodActivities.length
        : 0,
      conversionsByType: this.groupBy(periodActivities, 'conversionType'),
      dailyTrends: this.generateDailyTrends(periodActivities, startDate, now),
      topReferrers: this.getTopReferrers(periodActivities),
      topCodes: this.getTopCodes(periodActivities)
    }
  }
  
  // Utility methods
  private static hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
  
  private static groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {} as Record<string, number>)
  }
  
  private static generateDailyTrends(
    activities: ReferralActivity[],
    startDate: Date,
    endDate: Date
  ): Array<{ date: string; referrals: number; commissions: number }> {
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dayStart = new Date(current)
      const dayEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000)
      
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.createdAt)
        return activityDate >= dayStart && activityDate < dayEnd
      })
      
      days.push({
        date: current.toISOString().split('T')[0],
        referrals: dayActivities.length,
        commissions: dayActivities.reduce((sum, a) => sum + a.commissionAmount, 0)
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }
  
  private static getTopReferrers(activities: ReferralActivity[]): Array<{
    referrerId: string
    referrals: number
    commissions: number
  }> {
    const referrerStats = new Map()
    
    activities.forEach(activity => {
      const existing = referrerStats.get(activity.referrerId) || { referrals: 0, commissions: 0 }
      referrerStats.set(activity.referrerId, {
        referrals: existing.referrals + 1,
        commissions: existing.commissions + activity.commissionAmount
      })
    })
    
    return Array.from(referrerStats.entries())
      .map(([referrerId, stats]) => ({ referrerId, ...stats }))
      .sort((a, b) => b.commissions - a.commissions)
      .slice(0, 10)
  }
  
  private static getTopCodes(activities: ReferralActivity[]): Array<{
    code: string
    uses: number
    commissions: number
  }> {
    const codeStats = new Map()
    
    activities.forEach(activity => {
      const existing = codeStats.get(activity.referralCode) || { uses: 0, commissions: 0 }
      codeStats.set(activity.referralCode, {
        uses: existing.uses + 1,
        commissions: existing.commissions + activity.commissionAmount
      })
    })
    
    return Array.from(codeStats.entries())
      .map(([code, stats]) => ({ code, ...stats }))
      .sort((a, b) => b.commissions - a.commissions)
      .slice(0, 10)
  }
}

// Mock data for testing
export const mockReferralActivities: ReferralActivity[] = [
  {
    id: 'ref_001',
    referrerId: 'user_001',
    referredUserId: 'user_101',
    referralCode: 'REFABC123',
    status: 'completed',
    conversionType: 'subscription',
    conversionValue: 100,
    commissionRate: 25,
    commissionAmount: 25,
    tier: 1,
    createdAt: '2024-01-10T10:00:00Z',
    completedAt: '2024-01-10T10:30:00Z'
  },
  {
    id: 'ref_002',
    referrerId: 'user_001',
    referredUserId: 'user_102',
    referralCode: 'REFABC123',
    status: 'completed',
    conversionType: 'activation',
    conversionValue: 50,
    commissionRate: 15,
    commissionAmount: 7.5,
    tier: 1,
    createdAt: '2024-01-12T14:00:00Z',
    completedAt: '2024-01-12T14:15:00Z'
  }
]

export default ReferralManager


