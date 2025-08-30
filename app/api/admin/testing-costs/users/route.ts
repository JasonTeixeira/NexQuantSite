import { NextRequest, NextResponse } from 'next/server'
import { StrategyTestingBilling } from '@/lib/strategy-testing/billing-integration'
import { withAdminAuth } from '@/lib/middleware/admin-auth'

interface UserCostProfile {
  userId: string
  username: string
  email: string
  tier: 'free' | 'starter' | 'professional' | 'enterprise'
  costs: {
    today: number
    week: number
    month: number
    lifetime: number
  }
  revenue: {
    subscription: number
    usage: number
    total: number
  }
  margin: number
  profitability: 'high' | 'medium' | 'low' | 'negative'
  testsRun: number
  creditsUsed: number
  creditsRemaining: number
  status: 'active' | 'suspended' | 'warning'
  lastActive: string
  riskScore: number // 0-100, higher is riskier
}

// User cost tracking database (in production, use real database)
const userCostDatabase = new Map<string, UserCostProfile>()

export const GET = withAdminAuth(async (request: NextRequest, session) => {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'today'
  const sortBy = searchParams.get('sortBy') || 'costs'
  const filterBy = searchParams.get('filterBy') // 'unprofitable', 'high-risk', etc.

    // Get all user cost profiles
    const userProfiles = await getUserCostProfiles(period)
    
    // Apply filters
    let filteredProfiles = userProfiles
    if (filterBy === 'unprofitable') {
      filteredProfiles = userProfiles.filter(u => u.profitability === 'negative')
    } else if (filterBy === 'high-risk') {
      filteredProfiles = userProfiles.filter(u => u.riskScore > 70)
    } else if (filterBy === 'suspended') {
      filteredProfiles = userProfiles.filter(u => u.status === 'suspended')
    }
    
    // Sort profiles
    filteredProfiles.sort((a, b) => {
      switch (sortBy) {
        case 'costs':
          return b.costs.today - a.costs.today
        case 'revenue':
          return b.revenue.total - a.revenue.total
        case 'margin':
          return b.margin - a.margin
        case 'risk':
          return b.riskScore - a.riskScore
        default:
          return 0
      }
    })
    
    // Calculate aggregated metrics
    const totalUsers = filteredProfiles.length
    const unprofitableUsers = filteredProfiles.filter(u => u.profitability === 'negative').length
    const totalCosts = filteredProfiles.reduce((sum, u) => sum + u.costs.today, 0)
    const totalRevenue = filteredProfiles.reduce((sum, u) => sum + u.revenue.total, 0)
    const averageMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0
    
  return NextResponse.json({
    success: true,
    users: filteredProfiles,
    metrics: {
      totalUsers,
      unprofitableUsers,
      totalCosts,
      totalRevenue,
      averageMargin,
      riskUsers: filteredProfiles.filter(u => u.riskScore > 70).length,
      suspendedUsers: filteredProfiles.filter(u => u.status === 'suspended').length
    },
    timestamp: new Date().toISOString(),
    session: {
      userId: session.userId,
      role: session.role
    }
  })
}, 'cost-monitor:read')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, data } = body
    
    // Check admin authorization
    const isAdmin = request.headers.get('x-user-role') === 'admin' ||
                    request.cookies.get('admin-session')?.value
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    switch (action) {
      case 'suspend':
        return suspendUser(userId)
      
      case 'activate':
        return activateUser(userId)
      
      case 'update_credits':
        return updateUserCredits(userId, data.credits)
      
      case 'set_limit':
        return setUserLimit(userId, data.limit)
      
      case 'reset_usage':
        return resetUserUsage(userId)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('User costs POST error:', error)
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error.message 
    }, { status: 500 })
  }
}

async function getUserCostProfiles(period: string): Promise<UserCostProfile[]> {
  // Get user sessions from billing system
  const allSessions = StrategyTestingBilling.getAllUserSessions()
  
  // Group by user and calculate costs
  const userMap = new Map<string, UserCostProfile>()
  
  // Process each user's sessions
  for (const [userId, sessions] of allSessions) {
    const userCosts = calculateUserCosts(sessions, period)
    const userRevenue = calculateUserRevenue(userId, period)
    const margin = userRevenue.total - userCosts.total
    
    const profile: UserCostProfile = {
      userId,
      username: getUserName(userId), // Would fetch from user database
      email: getUserEmail(userId),
      tier: getUserTier(userId),
      costs: {
        today: userCosts.today,
        week: userCosts.week,
        month: userCosts.month,
        lifetime: userCosts.lifetime
      },
      revenue: userRevenue,
      margin,
      profitability: calculateProfitability(margin, userRevenue.total),
      testsRun: sessions.length,
      creditsUsed: calculateCreditsUsed(sessions),
      creditsRemaining: getUserCredits(userId),
      status: getUserStatus(userId, margin),
      lastActive: getLastActiveTime(sessions),
      riskScore: calculateRiskScore(userCosts, userRevenue, sessions)
    }
    
    userMap.set(userId, profile)
    userCostDatabase.set(userId, profile) // Cache for quick access
  }
  
  return Array.from(userMap.values())
}

function calculateUserCosts(sessions: any[], period: string) {
  const now = new Date()
  const todayStart = new Date(now.setHours(0, 0, 0, 0))
  const weekStart = new Date(now.setDate(now.getDate() - 7))
  const monthStart = new Date(now.setMonth(now.getMonth() - 1))
  
  let today = 0, week = 0, month = 0, lifetime = 0
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.startTime)
    const cost = session.cost || 0
    
    lifetime += cost
    
    if (sessionDate >= monthStart) {
      month += cost
      
      if (sessionDate >= weekStart) {
        week += cost
        
        if (sessionDate >= todayStart) {
          today += cost
        }
      }
    }
  })
  
  return { today, week, month, lifetime, total: today }
}

function calculateUserRevenue(userId: string, period: string) {
  // This would connect to your payment/subscription system
  // Mock implementation for demonstration
  
  const tier = getUserTier(userId)
  const subscriptionRevenue = {
    free: 0,
    starter: 29,
    professional: 99,
    enterprise: 499
  }[tier] || 0
  
  // Calculate usage-based revenue
  const usageRevenue = Math.random() * 50 // Would calculate from actual usage
  
  return {
    subscription: subscriptionRevenue / 30, // Daily revenue
    usage: usageRevenue,
    total: (subscriptionRevenue / 30) + usageRevenue
  }
}

function calculateProfitability(margin: number, revenue: number): 'high' | 'medium' | 'low' | 'negative' {
  if (margin < 0) return 'negative'
  if (revenue === 0) return 'negative'
  
  const marginPercent = (margin / revenue) * 100
  if (marginPercent > 50) return 'high'
  if (marginPercent > 20) return 'medium'
  return 'low'
}

function calculateRiskScore(costs: any, revenue: any, sessions: any[]): number {
  let riskScore = 0
  
  // Factor 1: Negative margin (40 points)
  if (revenue.total < costs.total) {
    riskScore += 40
  }
  
  // Factor 2: High cost per test (20 points)
  const avgCostPerTest = sessions.length > 0 ? costs.total / sessions.length : 0
  if (avgCostPerTest > 1) {
    riskScore += 20
  }
  
  // Factor 3: Rapid cost increase (20 points)
  if (costs.today > costs.week / 7 * 2) { // Today's cost is 2x daily average
    riskScore += 20
  }
  
  // Factor 4: Low credit balance (10 points)
  const creditsRemaining = getUserCredits(sessions[0]?.userId)
  if (creditsRemaining < 100) {
    riskScore += 10
  }
  
  // Factor 5: High test frequency (10 points)
  const testsToday = sessions.filter(s => 
    new Date(s.startTime) >= new Date(new Date().setHours(0, 0, 0, 0))
  ).length
  if (testsToday > 50) {
    riskScore += 10
  }
  
  return Math.min(riskScore, 100)
}

function getUserStatus(userId: string, margin: number): 'active' | 'suspended' | 'warning' {
  // Check if user is manually suspended
  if (isUserSuspended(userId)) return 'suspended'
  
  // Warning if losing money
  if (margin < 0) return 'warning'
  
  return 'active'
}

// Helper functions (would connect to real database)
function getUserName(userId: string): string {
  // Mock implementation
  const names: Record<string, string> = {
    'user_1': 'ProTrader123',
    'user_2': 'AlgoMaster',
    'user_3': 'DayTrader99'
  }
  return names[userId] || 'Unknown User'
}

function getUserEmail(userId: string): string {
  // Mock implementation
  return `${userId}@example.com`
}

function getUserTier(userId: string): 'free' | 'starter' | 'professional' | 'enterprise' {
  // Mock implementation - would fetch from database
  const tiers: Record<string, any> = {
    'user_1': 'professional',
    'user_2': 'enterprise',
    'user_3': 'starter'
  }
  return tiers[userId] || 'free'
}

function getUserCredits(userId: string): number {
  // Mock implementation - would fetch from database
  return Math.floor(Math.random() * 1000)
}

function calculateCreditsUsed(sessions: any[]): number {
  return sessions.reduce((sum, s) => sum + (s.usage?.computeUnits || 0), 0)
}

function getLastActiveTime(sessions: any[]): string {
  if (sessions.length === 0) return 'Never'
  const latest = sessions.sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )[0]
  return latest.startTime
}

function isUserSuspended(userId: string): boolean {
  // Check suspension status in database
  return false // Mock implementation
}

async function suspendUser(userId: string) {
  // Suspend user in database
  // Stop all running tests
  // Send notification
  
  return NextResponse.json({
    success: true,
    message: `User ${userId} suspended`,
    userId
  })
}

async function activateUser(userId: string) {
  // Reactivate user in database
  
  return NextResponse.json({
    success: true,
    message: `User ${userId} activated`,
    userId
  })
}

async function updateUserCredits(userId: string, credits: number) {
  // Update user credits in database
  
  return NextResponse.json({
    success: true,
    message: `Updated credits for user ${userId}`,
    userId,
    credits
  })
}

async function setUserLimit(userId: string, limit: number) {
  // Set usage limit for user
  
  return NextResponse.json({
    success: true,
    message: `Set limit for user ${userId}`,
    userId,
    limit
  })
}

async function resetUserUsage(userId: string) {
  // Reset user's usage counters
  
  return NextResponse.json({
    success: true,
    message: `Reset usage for user ${userId}`,
    userId
  })
}
