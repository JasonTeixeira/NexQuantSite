/**
 * Strategy Testing Billing Integration
 * Connects strategy testing usage with billing system
 */

import { BillingManager } from '@/lib/billing/billing-utils'
import { businessAnalytics } from '@/lib/analytics/business-analytics'
import { creditSystem } from '@/lib/user-credit-system'

export interface StrategyTestSession {
  sessionId: string
  userId: string
  testType: 'backtest' | 'live_test' | 'optimization' | 'monte_carlo' | 'stress_test'
  strategyName: string
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  cost: number
  usage: {
    dataPoints: number
    computeUnits: number
    duration: number // seconds
  }
  results?: {
    totalReturn?: number
    sharpeRatio?: number
    maxDrawdown?: number
    winRate?: number
    trades?: number
  }
}

export class StrategyTestingBilling {
  private static sessions: Map<string, StrategyTestSession> = new Map()
  private static userSessions: Map<string, StrategyTestSession[]> = new Map()

  /**
   * Start a new strategy testing session with billing tracking
   */
  static async startSession(
    userId: string,
    testType: StrategyTestSession['testType'],
    strategyName: string,
    estimatedDataPoints: number = 1000
  ): Promise<{ sessionId: string; estimatedCost: number; canProceed: boolean; creditsRequired?: number }> {
    
    // Check credit system first
    const creditCheck = await creditSystem.canRunTest(userId, testType, 1, estimatedDataPoints)
    if (!creditCheck.canRun) {
      throw new Error(creditCheck.reason || 'Insufficient credits')
    }
    
    // Check user subscription and limits
    const userLimits = await this.checkUserLimits(userId, testType)
    if (!userLimits.canProceed) {
      throw new Error(userLimits.reason || 'Usage limit exceeded')
    }

    const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const session: StrategyTestSession = {
      sessionId,
      userId,
      testType,
      strategyName,
      startTime: new Date().toISOString(),
      status: 'running',
      cost: 0,
      usage: {
        dataPoints: 0,
        computeUnits: 0,
        duration: 0
      }
    }

    this.sessions.set(sessionId, session)
    
    // Reserve credits
    const creditsReserved = creditSystem.reserveCredits(userId, sessionId, creditCheck.creditsRequired)
    if (!creditsReserved) {
      this.sessions.delete(sessionId)
      throw new Error('Failed to reserve credits')
    }

    // Start analytics tracking
    const analyticsSession = businessAnalytics.startSession({
      userId,
      properties: {
        testSessionId: sessionId,
        testType,
        strategyName,
        creditsRequired: creditCheck.creditsRequired
      }
    })

    // Track session start
    businessAnalytics.trackEvent({
      sessionId: analyticsSession.id,
      eventName: 'strategy_test_session_started',
      eventCategory: 'testing',
      properties: {
        testType,
        strategyName,
        estimatedCost: userLimits.estimatedCost,
        creditsRequired: creditCheck.creditsRequired
      }
    })

    return {
      sessionId,
      estimatedCost: userLimits.estimatedCost,
      canProceed: true,
      creditsRequired: creditCheck.creditsRequired
    }
  }

  /**
   * Update session usage during testing
   */
  static updateUsage(
    sessionId: string, 
    usage: Partial<StrategyTestSession['usage']>
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    if (usage.dataPoints) session.usage.dataPoints += usage.dataPoints
    if (usage.computeUnits) session.usage.computeUnits += usage.computeUnits
    if (usage.duration) session.usage.duration += usage.duration

    // Recalculate cost
    session.cost = this.calculateCost(session.testType, session.usage)
  }

  /**
   * Complete a strategy testing session and process payment
   */
  static async completeSession(
    sessionId: string,
    results?: StrategyTestSession['results']
  ): Promise<{ finalCost: number; billableAmount: number }> {
    
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    session.endTime = new Date().toISOString()
    session.status = 'completed'
    session.usage.duration = Math.floor(
      (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
    )
    
    if (results) {
      session.results = results
    }

    // Calculate final cost
    const finalCost = this.calculateCost(session.testType, session.usage)
    session.cost = finalCost
    
    // Consume credits
    const creditsConsumed = creditSystem.consumeCredits(session.userId, sessionId)

    // Process billing
    const billableAmount = await this.processBilling(session)

    // Track completion
    const analyticsSession = businessAnalytics.startSession({
      userId: session.userId,
      properties: {
        testSessionId: sessionId
      }
    })

    businessAnalytics.trackConversion(
      analyticsSession.id,
      'strategy_test_completed',
      billableAmount,
      session.userId,
      {
        testType: session.testType,
        strategyName: session.strategyName,
        finalCost,
        usage: session.usage,
        results: session.results
      }
    )

    return {
      finalCost,
      billableAmount
    }
  }

  /**
   * Cancel a running session
   */
  static cancelSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.status = 'cancelled'
    session.endTime = new Date().toISOString()
    
    // Still charge for usage up to cancellation point
    const partialCost = this.calculateCost(session.testType, session.usage)
    session.cost = partialCost
  }

  /**
   * Get session details
   */
  static getSession(sessionId: string): StrategyTestSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Get user's session history
   */
  static getUserSessions(userId: string, limit = 50): StrategyTestSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit)
  }

  /**
   * Get all active sessions
   */
  static getActiveSessions(): StrategyTestSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.status === 'running')
  }

  /**
   * Get all user sessions grouped by user
   */
  static getAllUserSessions(): Map<string, StrategyTestSession[]> {
    const userMap = new Map<string, StrategyTestSession[]>()
    
    Array.from(this.sessions.values()).forEach(session => {
      if (!userMap.has(session.userId)) {
        userMap.set(session.userId, [])
      }
      userMap.get(session.userId)?.push(session)
    })
    
    return userMap
  }

  /**
   * Get total costs for a user
   */
  static getUserTotalCosts(userId: string): number {
    return this.getUserSessions(userId)
      .reduce((total, session) => total + session.cost, 0)
  }

  /**
   * Private helper methods
   */
  private static calculateCost(
    testType: StrategyTestSession['testType'],
    usage: StrategyTestSession['usage']
  ): number {
    const pricing = {
      backtest: { base: 0.05, compute: 0.001, data: 0.0001 },
      live_test: { base: 0.10, compute: 0.002, data: 0.0002 },
      optimization: { base: 0.25, compute: 0.005, data: 0.0005 },
      monte_carlo: { base: 0.15, compute: 0.003, data: 0.0003 },
      stress_test: { base: 0.20, compute: 0.004, data: 0.0004 }
    }

    const rates = pricing[testType]
    if (!rates) return 0

    const baseCost = rates.base
    const computeCost = usage.computeUnits * rates.compute
    const dataCost = usage.dataPoints * rates.data

    return Math.round((baseCost + computeCost + dataCost) * 100) / 100
  }

  private static async checkUserLimits(
    userId: string,
    testType: StrategyTestSession['testType']
  ): Promise<{
    canProceed: boolean
    reason?: string
    estimatedCost: number
  }> {
    
    // Mock user subscription check - replace with real database query
    const mockUser = {
      subscription: 'pro', // free, pro, enterprise
      monthlyTestsRemaining: 45,
      credits: 25.00,
      limits: {
        maxConcurrentTests: 3,
        maxDataPointsPerTest: 100000
      }
    }

    const estimatedCost = this.calculateCost(testType, {
      dataPoints: 10000, // Estimate
      computeUnits: 5,     // Estimate
      duration: 300        // 5 minutes estimate
    })

    // Check concurrent tests
    const userActiveSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.status === 'running')
    
    if (userActiveSessions.length >= mockUser.limits.maxConcurrentTests) {
      return {
        canProceed: false,
        reason: `Maximum concurrent tests (${mockUser.limits.maxConcurrentTests}) reached`,
        estimatedCost
      }
    }

    // Check monthly limits
    if (mockUser.subscription === 'free' && mockUser.monthlyTestsRemaining <= 0) {
      return {
        canProceed: false,
        reason: 'Monthly test limit reached. Upgrade to continue testing.',
        estimatedCost
      }
    }

    // Check credits
    if (estimatedCost > mockUser.credits) {
      return {
        canProceed: false,
        reason: `Insufficient credits. Need $${estimatedCost.toFixed(2)}, have $${mockUser.credits.toFixed(2)}`,
        estimatedCost
      }
    }

    return {
      canProceed: true,
      estimatedCost
    }
  }

  private static async processBilling(session: StrategyTestSession): Promise<number> {
    try {
      // In production, integrate with Stripe or your billing provider
      console.log(`💳 Processing billing for session ${session.sessionId}`)
      console.log(`   User: ${session.userId}`)
      console.log(`   Test: ${session.testType} - ${session.strategyName}`)
      console.log(`   Cost: $${session.cost.toFixed(2)}`)
      console.log(`   Usage: ${session.usage.dataPoints} data points, ${session.usage.computeUnits} compute units`)

      // Mock payment processing
      const paymentSuccess = Math.random() > 0.05 // 95% success rate
      
      if (!paymentSuccess) {
        throw new Error('Payment processing failed')
      }

      // In production:
      // const charge = await stripe.charges.create({
      //   amount: Math.round(session.cost * 100), // Convert to cents
      //   currency: 'usd',
      //   customer: session.userId,
      //   description: `Strategy Testing: ${session.strategyName} (${session.testType})`,
      //   metadata: {
      //     sessionId: session.sessionId,
      //     testType: session.testType,
      //     dataPoints: session.usage.dataPoints.toString(),
      //     computeUnits: session.usage.computeUnits.toString()
      //   }
      // })

      console.log(`✅ Payment processed successfully`)
      return session.cost

    } catch (error: any) {
      console.error(`❌ Payment processing failed for session ${session.sessionId}:`, error.message)
      
      // Mark session as payment failed but keep the record
      session.status = 'failed'
      
      throw new Error(`Payment processing failed: ${error.message}`)
    }
  }

  /**
   * Get pricing information
   */
  static getPricing() {
    return {
      testTypes: {
        backtest: {
          name: 'Backtest',
          description: 'Test strategy against historical data',
          basePrice: 0.05,
          computeUnitPrice: 0.001,
          dataPointPrice: 0.0001,
          estimatedCost: '~$0.05 - $0.25'
        },
        live_test: {
          name: 'Live Test',
          description: 'Test with live market data',
          basePrice: 0.10,
          computeUnitPrice: 0.002,
          dataPointPrice: 0.0002,
          estimatedCost: '~$0.10 - $0.50'
        },
        optimization: {
          name: 'Strategy Optimization',
          description: 'Optimize strategy parameters',
          basePrice: 0.25,
          computeUnitPrice: 0.005,
          dataPointPrice: 0.0005,
          estimatedCost: '~$0.25 - $2.00'
        },
        monte_carlo: {
          name: 'Monte Carlo Analysis',
          description: 'Statistical risk analysis',
          basePrice: 0.15,
          computeUnitPrice: 0.003,
          dataPointPrice: 0.0003,
          estimatedCost: '~$0.15 - $0.75'
        },
        stress_test: {
          name: 'Stress Testing',
          description: 'Test strategy under extreme conditions',
          basePrice: 0.20,
          computeUnitPrice: 0.004,
          dataPointPrice: 0.0004,
          estimatedCost: '~$0.20 - $1.00'
        }
      },
      subscriptionBenefits: {
        free: {
          monthlyTests: 10,
          maxConcurrentTests: 1,
          credits: 5.00
        },
        pro: {
          monthlyTests: 100,
          maxConcurrentTests: 3,
          credits: 50.00,
          discount: '10% off all tests'
        },
        enterprise: {
          monthlyTests: 'unlimited',
          maxConcurrentTests: 10,
          credits: 500.00,
          discount: '25% off all tests',
          priority: 'Priority processing'
        }
      }
    }
  }
}
