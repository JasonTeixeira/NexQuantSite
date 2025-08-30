import { NextRequest, NextResponse } from 'next/server'
import { StrategyTestingBilling } from '@/lib/strategy-testing/billing-integration'
import { withAdminAuth } from '@/lib/middleware/admin-auth'

interface RealTimeCostData {
  current: number
  projected: number
  revenue: number
  margin: number
  profitLoss: number
  status: 'profitable' | 'breakeven' | 'loss'
  breakdown: {
    compute: number
    dataFeeds: number
    storage: number
    bandwidth: number
    apiCalls: number
  }
  userMetrics: {
    activeUsers: number
    testsRunning: number
    avgCostPerTest: number
    avgRevenuePerTest: number
  }
}

// Track real costs
const costTracking = new Map<string, number>()
const revenueTracking = new Map<string, number>()

// Enhanced admin authentication with proper session management
export const GET = withAdminAuth(async (request: NextRequest, session) => {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'today'

    // Get current running sessions
    const activeSessions = StrategyTestingBilling.getActiveSessions()
    
    // Calculate real-time costs
    const currentCosts = calculateCurrentCosts(activeSessions)
    const currentRevenue = calculateCurrentRevenue(period)
    
    // Project daily costs based on current rate
    const hoursElapsed = new Date().getHours() + (new Date().getMinutes() / 60)
    const projectedDaily = hoursElapsed > 0 ? (currentCosts / hoursElapsed) * 24 : currentCosts * 4
    
    // Calculate profit/loss
    const profitLoss = currentRevenue - currentCosts
    const margin = currentRevenue > 0 ? (profitLoss / currentRevenue) * 100 : 0
    
    const realTimeData: RealTimeCostData = {
      current: currentCosts,
      projected: projectedDaily,
      revenue: currentRevenue,
      margin,
      profitLoss,
      status: profitLoss > 0 ? 'profitable' : profitLoss === 0 ? 'breakeven' : 'loss',
      breakdown: {
        compute: currentCosts * 0.4, // 40% compute costs
        dataFeeds: currentCosts * 0.3, // 30% data costs
        storage: currentCosts * 0.1, // 10% storage
        bandwidth: currentCosts * 0.1, // 10% bandwidth
        apiCalls: currentCosts * 0.1  // 10% API calls
      },
      userMetrics: {
        activeUsers: activeSessions.length,
        testsRunning: activeSessions.filter(s => s.status === 'running').length,
        avgCostPerTest: activeSessions.length > 0 ? currentCosts / activeSessions.length : 0,
        avgRevenuePerTest: activeSessions.length > 0 ? currentRevenue / activeSessions.length : 0
      }
    }

    // Track cost trends
    trackCostTrend(currentCosts, currentRevenue)
    
    // Check for cost alerts
    const alerts = checkCostAlerts(realTimeData)
    
  return NextResponse.json({
    success: true,
    data: realTimeData,
    alerts,
    timestamp: new Date().toISOString(),
    session: {
      userId: session.userId,
      role: session.role,
      lastActivity: session.lastActivity
    }
  })
}, 'cost-monitor:read')

function calculateCurrentCosts(sessions: any[]): number {
  let totalCost = 0
  
  sessions.forEach(session => {
    // Base costs per test type
    const baseCosts: Record<string, number> = {
      backtest: 0.05,
      live_test: 0.10,
      optimization: 0.25,
      monte_carlo: 0.15,
      stress_test: 0.20
    }
    
    const base = baseCosts[session.testType] || 0.05
    const compute = session.usage?.computeUnits || 0
    const data = session.usage?.dataPoints || 0
    
    // Real cost calculation including infrastructure
    const infrastructureCost = compute * 0.002 // AWS compute cost
    const dataCost = data * 0.0001 // Data provider cost
    const storageCost = 0.01 // Storage per test
    
    totalCost += base + infrastructureCost + dataCost + storageCost
  })
  
  return totalCost
}

function calculateCurrentRevenue(period: string): number {
  // Calculate revenue from subscriptions and usage
  // This would connect to your payment system
  
  // Mock calculation for demonstration
  const baseSubscriptionRevenue = 5000 // Daily subscription revenue
  const usageRevenue = Math.random() * 2000 // Usage-based revenue
  
  const hoursElapsed = new Date().getHours() + (new Date().getMinutes() / 60)
  const dailyProgress = hoursElapsed / 24
  
  return (baseSubscriptionRevenue + usageRevenue) * dailyProgress
}

function trackCostTrend(cost: number, revenue: number) {
  const timestamp = new Date().toISOString()
  costTracking.set(timestamp, cost)
  revenueTracking.set(timestamp, revenue)
  
  // Keep only last 24 hours of data
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  for (const [time, _] of costTracking) {
    if (time < cutoff) {
      costTracking.delete(time)
      revenueTracking.delete(time)
    }
  }
}

function checkCostAlerts(data: RealTimeCostData): any[] {
  const alerts = []
  
  // Alert if margin below 20%
  if (data.margin < 20 && data.margin >= 0) {
    alerts.push({
      type: 'warning',
      title: 'Low Profit Margin',
      message: `Current margin is ${data.margin.toFixed(2)}%, below 20% threshold`,
      severity: 'medium'
    })
  }
  
  // Alert if losing money
  if (data.profitLoss < 0) {
    alerts.push({
      type: 'critical',
      title: 'Operating at Loss',
      message: `Currently losing $${Math.abs(data.profitLoss).toFixed(2)}`,
      severity: 'high'
    })
  }
  
  // Alert if projected costs exceed budget
  const dailyBudget = 1000
  if (data.projected > dailyBudget) {
    alerts.push({
      type: 'warning',
      title: 'Budget Exceeded',
      message: `Projected daily costs ($${data.projected.toFixed(2)}) exceed budget ($${dailyBudget})`,
      severity: 'medium'
    })
  }
  
  // Alert if compute costs are too high
  if (data.breakdown.compute > data.revenue * 0.5) {
    alerts.push({
      type: 'warning',
      title: 'High Compute Costs',
      message: 'Compute costs exceed 50% of revenue',
      severity: 'medium'
    })
  }
  
  return alerts
}
