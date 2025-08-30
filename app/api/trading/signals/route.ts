// 🚨 TRADING SIGNALS API
import { NextRequest, NextResponse } from 'next/server'

const mockSignals = [
  {
    id: 'signal-1',
    symbol: 'EUR/USD',
    type: 'BUY',
    strength: 'STRONG',
    entryPrice: 1.0825,
    stopLoss: 1.0795,
    takeProfit1: 1.0855,
    takeProfit2: 1.0885,
    takeProfit3: 1.0915,
    confidence: 85,
    timeframe: '1H',
    strategy: 'Trend Following + RSI Divergence',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    currentPrice: 1.0832,
    pnl: 7,
    pnlPercent: 0.65
  },
  {
    id: 'signal-2',
    symbol: 'BTC/USD',
    type: 'SELL',
    strength: 'MODERATE',
    entryPrice: 52850,
    stopLoss: 53500,
    takeProfit1: 52200,
    takeProfit2: 51500,
    takeProfit3: 50800,
    confidence: 72,
    timeframe: '4H',
    strategy: 'Resistance Rejection + Volume Analysis',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    currentPrice: 52600,
    pnl: 250,
    pnlPercent: 0.47
  },
  {
    id: 'signal-3',
    symbol: 'GOLD',
    type: 'BUY',
    strength: 'MODERATE',
    entryPrice: 2042.50,
    stopLoss: 2035.00,
    takeProfit1: 2050.00,
    takeProfit2: 2057.50,
    takeProfit3: 2065.00,
    confidence: 68,
    timeframe: '30M',
    strategy: 'Support Bounce + MACD Crossover',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'PENDING',
    currentPrice: 2041.80,
    pnl: 0,
    pnlPercent: 0
  },
  {
    id: 'signal-4',
    symbol: 'AAPL',
    type: 'BUY',
    strength: 'STRONG',
    entryPrice: 182.50,
    stopLoss: 180.00,
    takeProfit1: 185.00,
    takeProfit2: 187.50,
    takeProfit3: 190.00,
    confidence: 78,
    timeframe: '1D',
    strategy: 'Breakout + Volume Surge',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'CLOSED',
    closedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    closedPrice: 185.20,
    pnl: 270,
    pnlPercent: 1.48,
    result: 'TP1_HIT'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const symbol = searchParams.get('symbol')
    
    let filteredSignals = [...mockSignals]
    
    if (status !== 'all') {
      filteredSignals = filteredSignals.filter(signal => 
        signal.status.toLowerCase() === status.toLowerCase()
      )
    }
    
    if (symbol) {
      filteredSignals = filteredSignals.filter(signal => 
        signal.symbol.includes(symbol.toUpperCase())
      )
    }
    
    // Sort by creation date (newest first)
    filteredSignals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Calculate statistics
    const activeSignals = mockSignals.filter(s => s.status === 'ACTIVE').length
    const winRate = 68.5 // Mock win rate
    const avgProfit = 2.3 // Mock average profit
    
    return NextResponse.json({
      success: true,
      signals: filteredSignals,
      total: filteredSignals.length,
      stats: {
        activeSignals,
        totalSignals: mockSignals.length,
        winRate,
        avgProfit,
        successRate: 68.5
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch signals' },
      { status: 500 }
    )
  }
}

// Subscribe to signal alerts
export async function POST(request: NextRequest) {
  try {
    const { signalId, action } = await request.json()
    
    if (action === 'subscribe') {
      return NextResponse.json({
        success: true,
        message: 'Subscribed to signal alerts',
        subscription: {
          signalId,
          subscribedAt: new Date().toISOString(),
          alertsEnabled: true
        }
      }, { status: 201 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Subscription failed' },
      { status: 500 }
    )
  }
}

