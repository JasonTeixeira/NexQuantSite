// 📈 TRADING API - Real Order Execution & Position Management
// Production-grade trading with audit trails and risk checks

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/database'

// ============================================================================
// GET /api/trades - Get portfolio trades
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')
    const limit = searchParams.get('limit') || '50'

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID required' }, { status: 400 })
    }

    // Get trades from database with pagination
    const trades = await db.getPortfolioTrades(parseInt(portfolioId), parseInt(limit))

    // Calculate trade statistics
    const stats = {
      total_trades: trades.length,
      total_volume: trades.reduce((sum, trade) => sum + trade.trade_value, 0),
      total_commission: trades.reduce((sum, trade) => sum + trade.commission, 0),
      buy_trades: trades.filter(t => t.side === 'buy').length,
      sell_trades: trades.filter(t => t.side === 'sell').length,
      last_trade: trades[0]?.executed_at || null
    }

    return NextResponse.json({
      success: true,
      data: {
        trades,
        statistics: stats
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Trades API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/trades - Execute trade
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      portfolioId, 
      symbol, 
      side, 
      quantity, 
      price, 
      orderType = 'market',
      commission = 0,
      userId 
    } = body

    // Validate required fields
    if (!portfolioId || !symbol || !side || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: portfolioId, symbol, side, quantity, price' },
        { status: 400 }
      )
    }

    // Validate trade parameters
    if (quantity <= 0 || price <= 0) {
      return NextResponse.json(
        { error: 'Quantity and price must be greater than 0' },
        { status: 400 }
      )
    }

    if (!['buy', 'sell'].includes(side)) {
      return NextResponse.json(
        { error: 'Side must be "buy" or "sell"' },
        { status: 400 }
      )
    }

    // TODO: Add risk checks here
    // - Check available cash for buy orders
    // - Check position size for sell orders
    // - Check position limits
    // - Check daily loss limits

    // Get portfolio for risk checks
    const portfolios = await db.getUserPortfolios(userId)
    const portfolio = portfolios.find(p => p.id === parseInt(portfolioId))
    
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    // Risk check: Sufficient cash for buy orders
    if (side === 'buy') {
      const tradeValue = quantity * price + commission
      if (portfolio.cash_balance < tradeValue) {
        return NextResponse.json(
          { 
            error: 'Insufficient cash balance',
            required: tradeValue,
            available: portfolio.cash_balance
          },
          { status: 400 }
        )
      }
    }

    // Risk check: Sufficient position for sell orders
    if (side === 'sell') {
      const positions = await db.getPortfolioPositions(parseInt(portfolioId))
      const position = positions.find(p => p.symbol === symbol.toUpperCase())
      
      if (!position || position.quantity < quantity) {
        return NextResponse.json(
          { 
            error: 'Insufficient position to sell',
            requested: quantity,
            available: position?.quantity || 0
          },
          { status: 400 }
        )
      }
    }

    // Execute trade in database (with transaction)
    const trade = await db.recordTrade({
      portfolio_id: parseInt(portfolioId),
      symbol: symbol.toUpperCase(),
      side: side as 'buy' | 'sell',
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      commission: parseFloat(commission),
      executed_at: new Date()
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Failed to execute trade' },
        { status: 500 }
      )
    }

    // Log the trade for audit and compliance
    await db.logAction(userId, 'trade_executed', {
      trade_id: trade.id,
      portfolio_id: portfolioId,
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      price,
      trade_value: trade.trade_value,
      commission
    })

    // Return trade confirmation
    return NextResponse.json({
      success: true,
      data: {
        trade,
        confirmation: {
          trade_id: trade.id,
          symbol: trade.symbol,
          side: trade.side,
          quantity: trade.quantity,
          price: trade.price,
          trade_value: trade.trade_value,
          commission: trade.commission,
          executed_at: trade.executed_at,
          status: 'filled'
        }
      },
      message: `${side.toUpperCase()} order executed successfully`
    })

  } catch (error) {
    console.error('Trade execution error:', error)
    return NextResponse.json(
      { error: 'Trade execution failed', details: error.message },
      { status: 500 }
    )
  }
}
