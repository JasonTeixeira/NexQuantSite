// 📡 SERVER-SENT EVENTS STREAM - Real-time data streaming
// Provides live market data and portfolio updates using SSE (better than WebSockets for Next.js)

import { NextRequest, NextResponse } from 'next/server'

interface StreamClient {
  id: string
  controller: ReadableStreamDefaultController
  subscriptions: Set<string>
  portfolioId?: number
  userId?: number
  lastHeartbeat: number
}

// Global client management (in production, use Redis or similar)
const clients = new Map<string, StreamClient>()
const marketDataCache = new Map<string, any>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId') || generateClientId()
  const portfolioId = searchParams.get('portfolioId')
  const userId = searchParams.get('userId')
  const testMode = searchParams.get('test') === 'true'
  
  // For testing purposes, return status instead of streaming
  if (testMode) {
    return NextResponse.json({
      status: 'operational',
      message: 'Real-time streaming service is active',
      connected_clients: clients.size,
      market_data_symbols: Array.from(marketDataCache.keys()),
      timestamp: new Date().toISOString(),
      service: 'SSE Stream API'
    })
  }
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Register client
      const client: StreamClient = {
        id: clientId,
        controller,
        subscriptions: new Set(),
        portfolioId: portfolioId ? parseInt(portfolioId) : undefined,
        userId: userId ? parseInt(userId) : undefined,
        lastHeartbeat: Date.now()
      }
      
      clients.set(clientId, client)
      console.log(`📡 SSE client connected: ${clientId}`)
      
      // Send initial connection confirmation
      sendToClient(client, {
        type: 'connection',
        data: {
          clientId,
          timestamp: Date.now(),
          message: 'Connected to Nexus real-time stream'
        }
      })
      
      // Start heartbeat
      const heartbeatInterval = setInterval(() => {
        if (clients.has(clientId)) {
          sendToClient(client, {
            type: 'heartbeat',
            data: { timestamp: Date.now() }
          })
        } else {
          clearInterval(heartbeatInterval)
        }
      }, 30000) // 30 seconds
    },
    
    cancel() {
      // Client disconnected
      clients.delete(clientId)
      console.log(`📡 SSE client disconnected: ${clientId}`)
    }
  })

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, action, data } = body

    const client = clients.get(clientId)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    switch (action) {
      case 'subscribe':
        handleSubscribe(client, data)
        break
      case 'unsubscribe':
        handleUnsubscribe(client, data)
        break
      case 'portfolio_update':
        await handlePortfolioUpdate(client, data)
        break
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function sendToClient(client: StreamClient, message: any): void {
  try {
    const sseMessage = `data: ${JSON.stringify(message)}\n\n`
    client.controller.enqueue(new TextEncoder().encode(sseMessage))
    client.lastHeartbeat = Date.now()
  } catch (error) {
    console.error('Error sending to client:', error)
    clients.delete(client.id)
  }
}

function broadcastToSubscribers(symbol: string, message: any): void {
  for (const client of clients.values()) {
    if (client.subscriptions.has(symbol)) {
      sendToClient(client, message)
    }
  }
}

// ============================================================================
// SUBSCRIPTION HANDLERS
// ============================================================================

function handleSubscribe(client: StreamClient, data: any): void {
  const { symbols } = data
  
  if (Array.isArray(symbols)) {
    symbols.forEach(symbol => {
      client.subscriptions.add(symbol.toUpperCase())
    })
    
    console.log(`📊 Client ${client.id} subscribed to:`, symbols)
    
    // Send current market data for subscribed symbols
    symbols.forEach(async (symbol: string) => {
      const marketData = await fetchLatestMarketData(symbol.toUpperCase())
      if (marketData) {
        sendToClient(client, {
          type: 'market_data',
          symbol: symbol.toUpperCase(),
          data: marketData
        })
      }
    })
  }
}

function handleUnsubscribe(client: StreamClient, data: any): void {
  const { symbols } = data
  
  if (Array.isArray(symbols)) {
    symbols.forEach(symbol => {
      client.subscriptions.delete(symbol.toUpperCase())
    })
    
    console.log(`📊 Client ${client.id} unsubscribed from:`, symbols)
  }
}

async function handlePortfolioUpdate(client: StreamClient, data: any): void {
  if (client.portfolioId && client.userId) {
    // In a real implementation, this would trigger portfolio recalculation
    // For now, send a mock update
    sendToClient(client, {
      type: 'portfolio_update',
      data: {
        portfolio_id: client.portfolioId,
        timestamp: Date.now(),
        total_value: 125340.50 + (Math.random() - 0.5) * 1000,
        day_pnl: (Math.random() - 0.5) * 2000,
        message: 'Portfolio updated'
      }
    })
  }
}

// ============================================================================
// MARKET DATA SIMULATION
// ============================================================================

// Generate realistic mock market data when API is unavailable
function generateMockMarketData(symbol: string) {
  const basePrice = {
    'AAPL': 178.25,
    'MSFT': 415.30,
    'GOOGL': 142.65,
    'AMZN': 170.20,
    'TSLA': 240.85,
    'NVDA': 485.10,
    'META': 478.90,
    'SPY': 452.70,
    'QQQ': 391.45
  }[symbol] || 100

  // Generate realistic price movement
  const change = (Math.random() - 0.5) * 2 // -1% to +1%
  const changePercent = change / 100
  const price = basePrice * (1 + changePercent)
  
  return {
    symbol,
    price: Number(price.toFixed(2)),
    change: Number((price - basePrice).toFixed(2)),
    changePercent: Number((changePercent * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 10000000,
    marketCap: `${(price * (Math.random() * 2 + 1) * 1000000000).toFixed(0)}`,
    high: Number((price * 1.01).toFixed(2)),
    low: Number((price * 0.99).toFixed(2)),
    open: Number((basePrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
    previousClose: basePrice,
    timestamp: Date.now()
  }
}

async function fetchLatestMarketData(symbol: string): Promise<any> {
  try {
    // Try to get from cache first
    const cached = marketDataCache.get(symbol)
    if (cached && Date.now() - cached.timestamp < 5000) {
      return cached.data
    }

    // Try to fetch fresh data from API with timeout
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080'}/api/market-data/${symbol}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const result = await response.json()
        const marketData = result.data
        
        // Cache the data
        marketDataCache.set(symbol, {
          data: marketData,
          timestamp: Date.now()
        })
        
        return marketData
      }
    } catch (fetchError) {
      // API unavailable, use mock data
      console.log(`Using mock data for ${symbol} (API unavailable)`)
    }

    // Generate and cache mock data
    const mockData = generateMockMarketData(symbol)
    marketDataCache.set(symbol, {
      data: mockData,
      timestamp: Date.now()
    })
    
    return mockData
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error)
    
    // Return mock data as fallback
    return generateMockMarketData(symbol)
  }
}

// ============================================================================
// BACKGROUND MARKET DATA UPDATES
// ============================================================================

// Simulate real-time market data updates
setInterval(async () => {
  const subscribedSymbols = new Set<string>()
  
  // Collect all subscribed symbols
  for (const client of clients.values()) {
    client.subscriptions.forEach(symbol => subscribedSymbols.add(symbol))
  }
  
  // Update market data for subscribed symbols
  for (const symbol of subscribedSymbols) {
    try {
      const marketData = await fetchLatestMarketData(symbol)
      if (marketData) {
        // Broadcast to all subscribers
        broadcastToSubscribers(symbol, {
          type: 'market_data',
          symbol: symbol,
          data: marketData,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error(`Error updating market data for ${symbol}:`, error)
    }
  }
  
  // Clean up stale clients
  const staleTimeout = 60000 // 60 seconds
  const now = Date.now()
  
  for (const [clientId, client] of clients.entries()) {
    if (now - client.lastHeartbeat > staleTimeout) {
      console.log(`🧹 Cleaning up stale client: ${clientId}`)
      clients.delete(clientId)
    }
  }
  
}, 5000) // Update every 5 seconds

// ============================================================================
// PORTFOLIO UPDATES SIMULATION
// ============================================================================

setInterval(() => {
  // Send portfolio updates to clients with portfolio subscriptions
  for (const client of clients.values()) {
    if (client.portfolioId) {
      sendToClient(client, {
        type: 'portfolio_update',
        data: {
          portfolio_id: client.portfolioId,
          timestamp: Date.now(),
          total_value: 125340.50 + (Math.random() - 0.5) * 1000,
          day_pnl: (Math.random() - 0.5) * 2000,
          day_pnl_percent: (Math.random() - 0.5) * 2,
          positions_updated: Math.floor(Math.random() * 5) + 1
        }
      })
    }
  }
}, 10000) // Update every 10 seconds

console.log('📡 Real-time SSE stream server initialized')
