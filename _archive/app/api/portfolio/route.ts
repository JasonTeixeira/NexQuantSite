// 📊 PORTFOLIO API - Real Database Integration  
// HIGH-PERFORMANCE: Enterprise caching for <100ms responses
// Replaces mock data with actual PostgreSQL + Redis

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/database'
import { enterpriseCache } from '@/lib/performance/enterprise-cache'

// ============================================================================
// GET /api/portfolio - Get user portfolios
// ============================================================================
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isDevelopment = process.env.NODE_ENV === 'development'

    // For development, provide demo data if no userId provided
    if (!userId && isDevelopment) {
      // 🚀 ENTERPRISE CACHE: Cache demo portfolio for performance
      const cacheKey = 'demo-portfolio'
      let demoPortfolio = await enterpriseCache.get(cacheKey, 'portfolio')
      
      if (!demoPortfolio) {
        demoPortfolio = {
          id: 1,
          user_id: 'demo',
          name: 'Demo Portfolio',
          description: 'Development demo portfolio',
          cash_balance: 50000,
          total_value: 75500,
          created_at: new Date().toISOString(),
          positions: [
            { symbol: 'AAPL', quantity: 100, market_value: 15000, avg_cost: 140 },
            { symbol: 'GOOGL', quantity: 50, market_value: 10500, avg_cost: 200 }
          ],
          recent_trades: [
            { symbol: 'AAPL', quantity: 100, price: 150, type: 'BUY', timestamp: new Date().toISOString() }
          ],
          position_count: 2
        }

        // Cache the demo portfolio
        await enterpriseCache.set(cacheKey, demoPortfolio, 'portfolio')
      }

      const responseTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        data: [demoPortfolio],
        timestamp: new Date().toISOString(),
        note: 'Development demo data',
        cached: !!demoPortfolio,
        responseTime
      })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required for production' }, { status: 400 })
    }

    // 🚀 ENTERPRISE CACHE: Check for cached portfolio data
    const cacheKey = `user-${userId}`
    const cachedPortfolio = await enterpriseCache.get(cacheKey, 'portfolio')
    
    if (cachedPortfolio) {
      const responseTime = Date.now() - startTime
      return NextResponse.json({
        success: true,
        data: cachedPortfolio,
        timestamp: new Date().toISOString(),
        cached: true,
        responseTime
      })
    }

    // Production: Get user portfolios from database
    const portfolios = await db.getUserPortfolios(parseInt(userId))
    
    // Get positions for each portfolio
    const portfoliosWithPositions = await Promise.all(
      portfolios.map(async (portfolio) => {
        const positions = await db.getPortfolioPositions(portfolio.id)
        const trades = await db.getPortfolioTrades(portfolio.id, 10) // Last 10 trades
        
        return {
          ...portfolio,
          positions,
          recent_trades: trades,
          position_count: positions.length,
          total_value: positions.reduce((sum, pos) => sum + pos.market_value, 0) + portfolio.cash_balance
        }
      })
    )

    // 🚀 CACHE THE RESULT for subsequent requests
    await enterpriseCache.cachePortfolioData(userId, portfoliosWithPositions)

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: portfoliosWithPositions,
      timestamp: new Date().toISOString(),
      cached: false,
      responseTime
    })

  } catch (error) {
    console.error('Portfolio API error:', error)
    const responseTime = Date.now() - startTime
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        responseTime 
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/portfolio - Create new portfolio
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, description, initialCapital } = body

    // Validate required fields
    if (!userId || !name || !initialCapital) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, initialCapital' },
        { status: 400 }
      )
    }

    // Create portfolio in database
    const portfolio = await db.createPortfolio({
      user_id: parseInt(userId),
      name,
      description: description || '',
      initial_capital: parseFloat(initialCapital)
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Failed to create portfolio' },
        { status: 500 }
      )
    }

    // Log the action for audit
    await db.logAction(parseInt(userId), 'portfolio_created', {
      portfolio_id: portfolio.id,
      name: portfolio.name,
      initial_capital: portfolio.initial_capital
    })

    return NextResponse.json({
      success: true,
      data: portfolio,
      message: 'Portfolio created successfully'
    })

  } catch (error) {
    console.error('Portfolio creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
