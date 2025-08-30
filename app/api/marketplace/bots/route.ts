// 📦 MARKETPLACE BOTS API
import { NextRequest, NextResponse } from 'next/server'

// Mock trading bots data
const mockBots = [
  {
    id: 'bot-1',
    name: 'Trend Master Pro',
    description: 'Advanced trend following bot using AI-powered signals',
    category: 'Trend Following',
    performance: {
      roi: 45.8,
      winRate: 68.5,
      totalTrades: 1250,
      profitFactor: 2.3
    },
    price: 299.99,
    rating: 4.8,
    reviews: 234,
    features: ['AI Signals', 'Risk Management', 'Multi-Exchange', '24/7 Trading'],
    created_by: 'NexuralTeam',
    active_users: 1567
  },
  {
    id: 'bot-2',
    name: 'Scalper Elite',
    description: 'High-frequency scalping bot for quick profits',
    category: 'Scalping',
    performance: {
      roi: 28.3,
      winRate: 71.2,
      totalTrades: 8420,
      profitFactor: 1.8
    },
    price: 199.99,
    rating: 4.5,
    reviews: 189,
    features: ['Fast Execution', 'Low Latency', 'Micro-Profits', 'Volume Analysis'],
    created_by: 'ProTraders',
    active_users: 892
  },
  {
    id: 'bot-3',
    name: 'Grid Trading Master',
    description: 'Automated grid trading strategy for ranging markets',
    category: 'Grid Trading',
    performance: {
      roi: 32.5,
      winRate: 65.3,
      totalTrades: 3200,
      profitFactor: 1.9
    },
    price: 149.99,
    rating: 4.6,
    reviews: 312,
    features: ['Grid Automation', 'Range Detection', 'Risk Limits', 'Position Management'],
    created_by: 'GridExperts',
    active_users: 2103
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'popular'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Filter by category if provided
    let filteredBots = [...mockBots]
    if (category) {
      filteredBots = filteredBots.filter(bot => 
        bot.category.toLowerCase() === category.toLowerCase()
      )
    }
    
    // Sort bots
    if (sort === 'rating') {
      filteredBots.sort((a, b) => b.rating - a.rating)
    } else if (sort === 'price') {
      filteredBots.sort((a, b) => a.price - b.price)
    } else if (sort === 'roi') {
      filteredBots.sort((a, b) => b.performance.roi - a.performance.roi)
    } else {
      // Default: sort by active users (popularity)
      filteredBots.sort((a, b) => b.active_users - a.active_users)
    }
    
    // Paginate
    const paginatedBots = filteredBots.slice(offset, offset + limit)
    
    return NextResponse.json({
      success: true,
      bots: paginatedBots,
      total: filteredBots.length,
      categories: ['Trend Following', 'Scalping', 'Grid Trading', 'Arbitrage', 'Market Making'],
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < filteredBots.length
      }
    })
  } catch (error: any) {
    console.error('Marketplace bots error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bots' },
      { status: 500 }
    )
  }
}

// Purchase a bot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { botId, paymentMethod } = body
    
    const bot = mockBots.find(b => b.id === botId)
    if (!bot) {
      return NextResponse.json(
        { success: false, error: 'Bot not found' },
        { status: 404 }
      )
    }
    
    // Mock purchase process
    return NextResponse.json({
      success: true,
      message: 'Bot purchased successfully',
      purchase: {
        botId,
        botName: bot.name,
        price: bot.price,
        transactionId: `TXN-${Date.now()}`,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Bot purchase error:', error)
    return NextResponse.json(
      { success: false, error: 'Purchase failed' },
      { status: 500 }
    )
  }
}

