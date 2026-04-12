import { NextRequest, NextResponse } from 'next/server'
import { businessAnalytics } from '@/lib/analytics/business-analytics'
import { BillingManager } from '@/lib/billing/billing-utils'

// Usage tracking for pay-per-use strategy testing
interface StrategyUsageRecord {
  userId: string
  sessionId: string
  testType: 'backtest' | 'live_test' | 'optimization' | 'monte_carlo' | 'stress_test'
  strategyName: string
  dataPoints: number
  computeUnits: number
  duration: number // seconds
  cost: number
  timestamp: string
  metadata?: {
    symbols?: string[]
    timeframe?: string
    parameters?: Record<string, any>
    results?: Record<string, any>
  }
}

// Pay-per-use pricing structure
const USAGE_PRICING = {
  backtest: {
    basePrice: 0.05, // $0.05 per test
    computeUnitPrice: 0.001, // $0.001 per compute unit
    dataPointPrice: 0.0001, // $0.0001 per data point
  },
  live_test: {
    basePrice: 0.10, // $0.10 per live test
    computeUnitPrice: 0.002,
    dataPointPrice: 0.0002,
  },
  optimization: {
    basePrice: 0.25, // $0.25 per optimization run
    computeUnitPrice: 0.005,
    dataPointPrice: 0.0005,
  },
  monte_carlo: {
    basePrice: 0.15,
    computeUnitPrice: 0.003,
    dataPointPrice: 0.0003,
  },
  stress_test: {
    basePrice: 0.20,
    computeUnitPrice: 0.004,
    dataPointPrice: 0.0004,
  }
}

// Global usage tracking
const usageRecords: StrategyUsageRecord[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    // Basic authentication check
    const userId = request.headers.get('x-user-id') || request.cookies.get('user-id')?.value
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    switch (action) {
      case 'start_usage':
        return startUsageTracking(userId, body)
      
      case 'end_usage':
        return endUsageTracking(userId, body)
      
      case 'calculate_cost':
        return calculateUsageCost(body)
      
      case 'get_usage_history':
        return getUserUsageHistory(userId, body)
      
      case 'validate_credits':
        return validateUserCredits(userId, body)
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Strategy usage API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || request.headers.get('x-user-id')
  const period = searchParams.get('period') || 'last_30_days'
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    // Get user's usage history
    const userUsage = usageRecords.filter(record => record.userId === userId)
    
    // Calculate period-based statistics
    const stats = calculateUsageStats(userUsage, period)
    
    return NextResponse.json({
      usage: userUsage.slice(-50), // Last 50 records
      stats,
      pricing: USAGE_PRICING
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to get usage data', 
      details: error.message 
    }, { status: 500 })
  }
}

// Action Handlers
async function startUsageTracking(userId: string, body: any) {
  const { testType, strategyName, estimatedDataPoints, sessionId } = body
  
  // Validate user has sufficient credits/subscription
  const canProceed = await validateUserAccess(userId, testType, estimatedDataPoints)
  if (!canProceed.allowed) {
    return NextResponse.json({ 
      error: 'Insufficient credits or subscription limits exceeded',
      details: canProceed.reason,
      upgradeRequired: canProceed.upgradeRequired
    }, { status: 402 }) // Payment Required
  }
  
  // Start analytics session
  const analyticsSession = businessAnalytics.startSession({
    userId,
    properties: {
      sessionId,
      testType,
      strategyName,
      estimatedCost: canProceed.estimatedCost
    }
  })
  
  // Track session start
  businessAnalytics.trackEvent({
    sessionId: analyticsSession.id,
    eventName: 'strategy_test_started',
    eventCategory: 'testing',
    properties: {
      testType,
      strategyName,
      estimatedDataPoints
    }
  })
  
  return NextResponse.json({
    success: true,
    sessionId,
    estimatedCost: canProceed.estimatedCost,
    analyticsSessionId: analyticsSession.id,
    message: 'Usage tracking started'
  })
}

async function endUsageTracking(userId: string, body: any) {
  const { 
    sessionId, 
    testType, 
    strategyName, 
    dataPoints, 
    computeUnits, 
    duration, 
    results,
    analyticsSessionId 
  } = body
  
  // Calculate final cost
  const cost = calculateCost(testType, dataPoints, computeUnits, duration)
  
  // Create usage record
  const usageRecord: StrategyUsageRecord = {
    userId,
    sessionId,
    testType,
    strategyName,
    dataPoints: dataPoints || 0,
    computeUnits: computeUnits || 1,
    duration: duration || 0,
    cost,
    timestamp: new Date().toISOString(),
    metadata: {
      results: results || {},
      symbols: body.symbols || [],
      timeframe: body.timeframe || '1d',
      parameters: body.parameters || {}
    }
  }
  
  usageRecords.push(usageRecord)
  
  // Track completion in analytics
  if (analyticsSessionId) {
    businessAnalytics.trackConversion(analyticsSessionId, 'strategy_test_completed', cost, userId, {
      testType,
      strategyName,
      dataPoints,
      computeUnits,
      duration,
      finalCost: cost
    })
  }
  
  // Process payment/billing
  await processUsagePayment(userId, usageRecord)
  
  return NextResponse.json({
    success: true,
    usageRecord: {
      ...usageRecord,
      metadata: undefined // Don't return full metadata for security
    },
    cost,
    message: 'Usage tracking completed and billed'
  })
}

async function calculateUsageCost(body: any) {
  const { testType, dataPoints, computeUnits, duration } = body
  const cost = calculateCost(testType, dataPoints || 0, computeUnits || 1, duration || 0)
  
  return NextResponse.json({
    cost,
    breakdown: {
      basePrice: USAGE_PRICING[testType as keyof typeof USAGE_PRICING]?.basePrice || 0,
      computeCost: (computeUnits || 1) * (USAGE_PRICING[testType as keyof typeof USAGE_PRICING]?.computeUnitPrice || 0),
      dataCost: (dataPoints || 0) * (USAGE_PRICING[testType as keyof typeof USAGE_PRICING]?.dataPointPrice || 0)
    }
  })
}

async function getUserUsageHistory(userId: string, body: any) {
  const { period = 'last_30_days', limit = 50 } = body
  
  const userUsage = usageRecords
    .filter(record => record.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
  
  const stats = calculateUsageStats(userUsage, period)
  
  return NextResponse.json({
    usage: userUsage,
    stats,
    totalRecords: userUsage.length
  })
}

async function validateUserCredits(userId: string, body: any) {
  const { testType, estimatedDataPoints } = body
  const validation = await validateUserAccess(userId, testType, estimatedDataPoints)
  
  return NextResponse.json({
    allowed: validation.allowed,
    reason: validation.reason,
    estimatedCost: validation.estimatedCost,
    upgradeRequired: validation.upgradeRequired,
    currentCredits: validation.currentCredits
  })
}

// Helper Functions
function calculateCost(testType: string, dataPoints: number, computeUnits: number, duration: number): number {
  const pricing = USAGE_PRICING[testType as keyof typeof USAGE_PRICING]
  if (!pricing) return 0
  
  const basePrice = pricing.basePrice
  const computeCost = computeUnits * pricing.computeUnitPrice
  const dataCost = dataPoints * pricing.dataPointPrice
  
  return Math.round((basePrice + computeCost + dataCost) * 100) / 100 // Round to 2 decimal places
}

async function validateUserAccess(userId: string, testType: string, estimatedDataPoints: number): Promise<{
  allowed: boolean
  reason?: string
  estimatedCost: number
  upgradeRequired?: boolean
  currentCredits?: number
}> {
  const estimatedCost = calculateCost(testType, estimatedDataPoints, 1, 300) // Estimate 300 seconds
  
  // In production, check user's subscription and credits from database
  // For now, simulate different user scenarios
  
  // Mock subscription check
  const mockUserSubscription = {
    plan: 'pro', // free, pro, enterprise
    strategyTestsRemaining: 25,
    credits: 10.50
  }
  
  // Check subscription limits
  if (mockUserSubscription.plan === 'free' && estimatedCost > 0.50) {
    return {
      allowed: false,
      reason: 'Free plan limited to $0.50 per test',
      estimatedCost,
      upgradeRequired: true
    }
  }
  
  // Check credits
  if (estimatedCost > mockUserSubscription.credits) {
    return {
      allowed: false,
      reason: 'Insufficient credits',
      estimatedCost,
      upgradeRequired: false,
      currentCredits: mockUserSubscription.credits
    }
  }
  
  return {
    allowed: true,
    estimatedCost,
    currentCredits: mockUserSubscription.credits
  }
}

async function processUsagePayment(userId: string, usageRecord: StrategyUsageRecord): Promise<void> {
  // In production, integrate with Stripe or billing system
  console.log(`💳 Processing payment for user ${userId}: $${usageRecord.cost} for ${usageRecord.testType}`)
  
  // Create invoice/charge
  // await stripe.charges.create({
  //   amount: Math.round(usageRecord.cost * 100), // Convert to cents
  //   currency: 'usd',
  //   customer: userId,
  //   description: `Strategy Testing: ${usageRecord.strategyName} (${usageRecord.testType})`
  // })
}

function calculateUsageStats(usage: StrategyUsageRecord[], period: string) {
  const now = new Date()
  let startDate = new Date()
  
  switch (period) {
    case 'last_7_days':
      startDate.setDate(now.getDate() - 7)
      break
    case 'last_30_days':
      startDate.setDate(now.getDate() - 30)
      break
    case 'last_90_days':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      startDate.setDate(now.getDate() - 30)
  }
  
  const periodUsage = usage.filter(record => 
    new Date(record.timestamp) >= startDate
  )
  
  const totalCost = periodUsage.reduce((sum, record) => sum + record.cost, 0)
  const totalTests = periodUsage.length
  const avgCostPerTest = totalTests > 0 ? totalCost / totalTests : 0
  
  // Group by test type
  const byTestType = periodUsage.reduce((acc, record) => {
    if (!acc[record.testType]) {
      acc[record.testType] = { count: 0, cost: 0 }
    }
    acc[record.testType].count++
    acc[record.testType].cost += record.cost
    return acc
  }, {} as Record<string, { count: number, cost: number }>)
  
  return {
    period,
    totalCost: Math.round(totalCost * 100) / 100,
    totalTests,
    avgCostPerTest: Math.round(avgCostPerTest * 100) / 100,
    byTestType,
    mostUsedTestType: Object.entries(byTestType).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || null
  }
}
