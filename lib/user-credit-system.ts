/**
 * User Credit System
 * Manages user credits, limits, and usage tracking
 */

export interface UserCredits {
  userId: string
  balance: number
  reserved: number // Credits reserved for running tests
  available: number // Balance - reserved
  tier: 'free' | 'starter' | 'professional' | 'enterprise'
  limits: {
    daily: number
    monthly: number
    concurrent: number // Max concurrent tests
  }
  usage: {
    today: number
    thisMonth: number
    lifetime: number
  }
  autoRecharge: {
    enabled: boolean
    threshold: number // Recharge when balance falls below
    amount: number // Amount to recharge
    paymentMethod?: string
  }
  notifications: {
    lowBalance: boolean // Notify when balance < 20%
    dailyLimit: boolean // Notify when approaching daily limit
    suspended: boolean // Account suspended due to no credits
  }
  history: CreditTransaction[]
}

export interface CreditTransaction {
  id: string
  userId: string
  type: 'debit' | 'credit' | 'refund' | 'recharge'
  amount: number
  balance: number // Balance after transaction
  description: string
  metadata?: {
    testId?: string
    testType?: string
    refundReason?: string
  }
  timestamp: string
}

export interface CreditPricing {
  testType: string
  baseCredits: number
  computeMultiplier: number
  dataMultiplier: number
}

// Credit pricing per test type
const CREDIT_PRICING: Record<string, CreditPricing> = {
  backtest: {
    testType: 'backtest',
    baseCredits: 5,
    computeMultiplier: 0.1,
    dataMultiplier: 0.01
  },
  live_test: {
    testType: 'live_test',
    baseCredits: 10,
    computeMultiplier: 0.2,
    dataMultiplier: 0.02
  },
  optimization: {
    testType: 'optimization',
    baseCredits: 25,
    computeMultiplier: 0.5,
    dataMultiplier: 0.05
  },
  monte_carlo: {
    testType: 'monte_carlo',
    baseCredits: 15,
    computeMultiplier: 0.3,
    dataMultiplier: 0.03
  },
  stress_test: {
    testType: 'stress_test',
    baseCredits: 20,
    computeMultiplier: 0.4,
    dataMultiplier: 0.04
  }
}

// Tier limits
const TIER_LIMITS = {
  free: {
    dailyCredits: 50,
    monthlyCredits: 1000,
    concurrentTests: 1,
    initialCredits: 100
  },
  starter: {
    dailyCredits: 500,
    monthlyCredits: 10000,
    concurrentTests: 3,
    initialCredits: 1000
  },
  professional: {
    dailyCredits: 2000,
    monthlyCredits: 50000,
    concurrentTests: 10,
    initialCredits: 5000
  },
  enterprise: {
    dailyCredits: 10000,
    monthlyCredits: 500000,
    concurrentTests: 50,
    initialCredits: 50000
  }
}

export class UserCreditSystem {
  private static instance: UserCreditSystem
  private userCredits: Map<string, UserCredits> = new Map()
  private transactions: CreditTransaction[] = []
  private reservations: Map<string, number> = new Map() // sessionId -> credits reserved

  static getInstance(): UserCreditSystem {
    if (!UserCreditSystem.instance) {
      UserCreditSystem.instance = new UserCreditSystem()
    }
    return UserCreditSystem.instance
  }

  /**
   * Initialize user credits
   */
  async initializeUser(
    userId: string, 
    tier: UserCredits['tier'] = 'free'
  ): Promise<UserCredits> {
    const limits = TIER_LIMITS[tier]
    
    const credits: UserCredits = {
      userId,
      balance: limits.initialCredits,
      reserved: 0,
      available: limits.initialCredits,
      tier,
      limits: {
        daily: limits.dailyCredits,
        monthly: limits.monthlyCredits,
        concurrent: limits.concurrentTests
      },
      usage: {
        today: 0,
        thisMonth: 0,
        lifetime: 0
      },
      autoRecharge: {
        enabled: false,
        threshold: 100,
        amount: 1000
      },
      notifications: {
        lowBalance: false,
        dailyLimit: false,
        suspended: false
      },
      history: []
    }
    
    this.userCredits.set(userId, credits)
    
    // Record initial credit grant
    this.recordTransaction({
      userId,
      type: 'credit',
      amount: limits.initialCredits,
      description: `Initial ${tier} tier credits`
    })
    
    return credits
  }

  /**
   * Get user credits
   */
  getUserCredits(userId: string): UserCredits | null {
    return this.userCredits.get(userId) || null
  }

  /**
   * Check if user can run a test
   */
  async canRunTest(
    userId: string,
    testType: string,
    estimatedCompute: number = 1,
    estimatedDataPoints: number = 1000
  ): Promise<{
    canRun: boolean
    reason?: string
    creditsRequired: number
    creditsAvailable: number
  }> {
    const userCredits = this.getUserCredits(userId)
    if (!userCredits) {
      return {
        canRun: false,
        reason: 'User not initialized',
        creditsRequired: 0,
        creditsAvailable: 0
      }
    }

    // Check if user is suspended
    if (userCredits.notifications.suspended) {
      return {
        canRun: false,
        reason: 'Account suspended due to insufficient credits',
        creditsRequired: 0,
        creditsAvailable: userCredits.available
      }
    }

    // Calculate required credits
    const pricing = CREDIT_PRICING[testType] || CREDIT_PRICING.backtest
    const creditsRequired = Math.ceil(
      pricing.baseCredits +
      (estimatedCompute * pricing.computeMultiplier) +
      (estimatedDataPoints * pricing.dataMultiplier)
    )

    // Check available credits
    if (userCredits.available < creditsRequired) {
      // Try auto-recharge if enabled
      if (userCredits.autoRecharge.enabled && 
          userCredits.available < userCredits.autoRecharge.threshold) {
        await this.autoRecharge(userId)
        // Re-check after recharge
        const updatedCredits = this.getUserCredits(userId)!
        if (updatedCredits.available >= creditsRequired) {
          return {
            canRun: true,
            reason: 'Auto-recharged',
            creditsRequired,
            creditsAvailable: updatedCredits.available
          }
        }
      }
      
      return {
        canRun: false,
        reason: 'Insufficient credits',
        creditsRequired,
        creditsAvailable: userCredits.available
      }
    }

    // Check daily limit
    if (userCredits.usage.today + creditsRequired > userCredits.limits.daily) {
      return {
        canRun: false,
        reason: 'Daily limit exceeded',
        creditsRequired,
        creditsAvailable: userCredits.available
      }
    }

    // Check monthly limit
    if (userCredits.usage.thisMonth + creditsRequired > userCredits.limits.monthly) {
      return {
        canRun: false,
        reason: 'Monthly limit exceeded',
        creditsRequired,
        creditsAvailable: userCredits.available
      }
    }

    // Check concurrent test limit
    const activeReservations = Array.from(this.reservations.entries())
      .filter(([_, credits]) => credits > 0).length
    if (activeReservations >= userCredits.limits.concurrent) {
      return {
        canRun: false,
        reason: `Maximum concurrent tests (${userCredits.limits.concurrent}) reached`,
        creditsRequired,
        creditsAvailable: userCredits.available
      }
    }

    return {
      canRun: true,
      creditsRequired,
      creditsAvailable: userCredits.available
    }
  }

  /**
   * Reserve credits for a test
   */
  reserveCredits(
    userId: string,
    sessionId: string,
    credits: number
  ): boolean {
    const userCredits = this.getUserCredits(userId)
    if (!userCredits || userCredits.available < credits) {
      return false
    }

    // Reserve the credits
    userCredits.reserved += credits
    userCredits.available = userCredits.balance - userCredits.reserved
    this.reservations.set(sessionId, credits)

    // Check for low balance warning
    if (userCredits.available < userCredits.balance * 0.2) {
      userCredits.notifications.lowBalance = true
      this.sendLowBalanceNotification(userId)
    }

    return true
  }

  /**
   * Consume reserved credits when test completes
   */
  consumeCredits(
    userId: string,
    sessionId: string,
    actualCreditsUsed?: number
  ): number {
    const userCredits = this.getUserCredits(userId)
    const reservedCredits = this.reservations.get(sessionId) || 0
    
    if (!userCredits || reservedCredits === 0) {
      return 0
    }

    // Use actual credits if provided, otherwise use reserved amount
    const creditsToConsume = actualCreditsUsed || reservedCredits
    
    // Update balances
    userCredits.balance -= creditsToConsume
    userCredits.reserved -= reservedCredits
    userCredits.available = userCredits.balance - userCredits.reserved
    
    // Update usage tracking
    userCredits.usage.today += creditsToConsume
    userCredits.usage.thisMonth += creditsToConsume
    userCredits.usage.lifetime += creditsToConsume
    
    // Clear reservation
    this.reservations.delete(sessionId)
    
    // Record transaction
    this.recordTransaction({
      userId,
      type: 'debit',
      amount: creditsToConsume,
      description: `Test session ${sessionId}`,
      metadata: { testId: sessionId }
    })
    
    // Check if account should be suspended
    if (userCredits.balance <= 0) {
      userCredits.notifications.suspended = true
      this.suspendAccount(userId)
    }
    
    return creditsToConsume
  }

  /**
   * Release reserved credits (test cancelled/failed)
   */
  releaseCredits(userId: string, sessionId: string): void {
    const userCredits = this.getUserCredits(userId)
    const reservedCredits = this.reservations.get(sessionId) || 0
    
    if (!userCredits || reservedCredits === 0) {
      return
    }
    
    // Release the reservation
    userCredits.reserved -= reservedCredits
    userCredits.available = userCredits.balance - userCredits.reserved
    this.reservations.delete(sessionId)
  }

  /**
   * Add credits to user account
   */
  addCredits(
    userId: string,
    amount: number,
    description: string
  ): boolean {
    const userCredits = this.getUserCredits(userId)
    if (!userCredits) {
      return false
    }
    
    userCredits.balance += amount
    userCredits.available = userCredits.balance - userCredits.reserved
    
    // Clear suspension if balance is positive
    if (userCredits.balance > 0 && userCredits.notifications.suspended) {
      userCredits.notifications.suspended = false
    }
    
    this.recordTransaction({
      userId,
      type: 'credit',
      amount,
      description
    })
    
    return true
  }

  /**
   * Refund credits
   */
  refundCredits(
    userId: string,
    amount: number,
    reason: string,
    testId?: string
  ): boolean {
    const userCredits = this.getUserCredits(userId)
    if (!userCredits) {
      return false
    }
    
    userCredits.balance += amount
    userCredits.available = userCredits.balance - userCredits.reserved
    
    this.recordTransaction({
      userId,
      type: 'refund',
      amount,
      description: `Refund: ${reason}`,
      metadata: { refundReason: reason, testId }
    })
    
    return true
  }

  /**
   * Auto-recharge user account
   */
  private async autoRecharge(userId: string): Promise<boolean> {
    const userCredits = this.getUserCredits(userId)
    if (!userCredits || !userCredits.autoRecharge.enabled) {
      return false
    }
    
    try {
      // Process payment (would integrate with payment system)
      // For now, simulate successful payment
      const amount = userCredits.autoRecharge.amount
      
      userCredits.balance += amount
      userCredits.available = userCredits.balance - userCredits.reserved
      
      this.recordTransaction({
        userId,
        type: 'recharge',
        amount,
        description: 'Auto-recharge'
      })
      
      return true
    } catch (error) {
      console.error('Auto-recharge failed:', error)
      return false
    }
  }

  /**
   * Record a credit transaction
   */
  private recordTransaction(params: {
    userId: string
    type: CreditTransaction['type']
    amount: number
    description: string
    metadata?: CreditTransaction['metadata']
  }): void {
    const userCredits = this.getUserCredits(params.userId)
    const balance = userCredits?.balance || 0
    
    const transaction: CreditTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      type: params.type,
      amount: params.amount,
      balance,
      description: params.description,
      metadata: params.metadata,
      timestamp: new Date().toISOString()
    }
    
    this.transactions.push(transaction)
    
    if (userCredits) {
      userCredits.history.push(transaction)
      // Keep only last 100 transactions per user
      if (userCredits.history.length > 100) {
        userCredits.history = userCredits.history.slice(-100)
      }
    }
  }

  /**
   * Get user transaction history
   */
  getUserTransactions(userId: string, limit = 50): CreditTransaction[] {
    return this.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  /**
   * Reset daily usage (run at midnight)
   */
  resetDailyUsage(): void {
    this.userCredits.forEach(credits => {
      credits.usage.today = 0
      credits.notifications.dailyLimit = false
    })
  }

  /**
   * Reset monthly usage (run on first of month)
   */
  resetMonthlyUsage(): void {
    this.userCredits.forEach(credits => {
      credits.usage.thisMonth = 0
    })
  }

  /**
   * Send notifications
   */
  private sendLowBalanceNotification(userId: string): void {
    // Would integrate with notification system
    console.log(`Low balance warning for user ${userId}`)
  }

  private suspendAccount(userId: string): void {
    // Would integrate with account management system
    console.log(`Account suspended for user ${userId} due to insufficient credits`)
  }

  /**
   * Get credit statistics
   */
  getCreditStatistics(): {
    totalUsers: number
    totalCreditsInCirculation: number
    totalCreditsConsumed: number
    averageBalance: number
    suspendedAccounts: number
  } {
    let totalBalance = 0
    let totalConsumed = 0
    let suspendedCount = 0
    
    this.userCredits.forEach(credits => {
      totalBalance += credits.balance
      totalConsumed += credits.usage.lifetime
      if (credits.notifications.suspended) {
        suspendedCount++
      }
    })
    
    const totalUsers = this.userCredits.size
    
    return {
      totalUsers,
      totalCreditsInCirculation: totalBalance,
      totalCreditsConsumed: totalConsumed,
      averageBalance: totalUsers > 0 ? totalBalance / totalUsers : 0,
      suspendedAccounts: suspendedCount
    }
  }
}

// Export singleton instance
export const creditSystem = UserCreditSystem.getInstance()
