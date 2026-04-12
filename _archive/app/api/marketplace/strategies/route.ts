// 📊 MARKETPLACE STRATEGIES API
import { NextRequest, NextResponse } from 'next/server'

const mockStrategies = [
  {
    id: 'strat-1',
    name: 'Golden Cross Strategy',
    description: 'Classic moving average crossover strategy with enhanced filters',
    type: 'Technical',
    timeframe: '4H',
    winRate: 62.5,
    avgReturn: 8.3,
    riskRewardRatio: '1:2.5',
    backtestResults: {
      totalTrades: 450,
      winningTrades: 281,
      losingTrades: 169,
      maxDrawdown: 12.5,
      sharpeRatio: 1.8
    },
    price: 49.99,
    rating: 4.7,
    downloads: 3421
  },
  {
    id: 'strat-2',
    name: 'RSI Divergence Hunter',
    description: 'Identifies and trades RSI divergences with momentum confirmation',
    type: 'Momentum',
    timeframe: '1H',
    winRate: 58.2,
    avgReturn: 6.5,
    riskRewardRatio: '1:3',
    backtestResults: {
      totalTrades: 780,
      winningTrades: 454,
      losingTrades: 326,
      maxDrawdown: 15.2,
      sharpeRatio: 1.5
    },
    price: 39.99,
    rating: 4.4,
    downloads: 2156
  }
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      strategies: mockStrategies,
      total: mockStrategies.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch strategies' },
      { status: 500 }
    )
  }
}

