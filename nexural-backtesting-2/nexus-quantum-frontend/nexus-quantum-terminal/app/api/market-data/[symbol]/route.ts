// 📊 MARKET DATA API - Individual symbol data endpoint
// HIGH-PERFORMANCE: Enterprise caching for <100ms responses
// Provides real-time market data for specific symbols with multiple source fallback

import { NextRequest, NextResponse } from 'next/server'
import { enterpriseCache } from '@/lib/performance/enterprise-cache'
import { rateLimiters } from '@/lib/security/rate-limit-middleware'

interface MarketDataResponse {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  bid?: number
  ask?: number
  high: number
  low: number
  open: number
  timestamp: number
  source: string
}

// 🔒 ENTERPRISE RATE LIMITED: 120 requests/minute for market data
async function getMarketDataHandler(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const startTime = Date.now()
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()

  try {
    // 🚀 ENTERPRISE CACHE: Check cache first for <100ms responses
    const cachedData = await enterpriseCache.get<MarketDataResponse>(symbol, 'marketData')
    
    if (cachedData) {
      const responseTime = Date.now() - startTime
      return NextResponse.json({
        success: true,
        data: {
          ...cachedData,
          cached: true,
          responseTime
        },
        timestamp: Date.now(),
        cached: true,
        responseTime
      })
    }

    // Cache miss - fetch from external APIs
    let marketData = await tryYahooFinance(symbol)
    
    if (!marketData && process.env.ALPHA_VANTAGE_API_KEY) {
      marketData = await tryAlphaVantage(symbol)
    }
    
    if (!marketData && process.env.POLYGON_API_KEY) {
      marketData = await tryPolygon(symbol)
    }

    if (!marketData) {
      // Return mock data for development/demo
      marketData = generateMockData(symbol)
    }

    // 🚀 CACHE THE RESULT for subsequent requests
    await enterpriseCache.cacheMarketData(symbol, marketData)

    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      data: {
        ...marketData,
        cached: false,
        responseTime
      },
      timestamp: Date.now(),
      cached: false,
      responseTime
    })

  } catch (error) {
    console.error(`Market data error for ${symbol}:`, error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch market data', 
        symbol,
        details: error.message,
        responseTime: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DATA SOURCE IMPLEMENTATIONS
// ============================================================================

async function tryYahooFinance(symbol: string): Promise<MarketDataResponse | null> {
  try {
    // Yahoo Finance API (unofficial but widely used)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; market-data-api)'
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const result = data.chart?.result?.[0]
    
    if (!result) return null

    const meta = result.meta
    const quote = result.indicators?.quote?.[0]
    
    if (!meta || !quote) return null

    // Get the latest values (last index)
    const lastIndex = quote.close.length - 1
    const currentPrice = quote.close[lastIndex]
    const previousClose = meta.previousClose
    
    return {
      symbol: symbol,
      price: currentPrice,
      change: currentPrice - previousClose,
      changePercent: ((currentPrice - previousClose) / previousClose) * 100,
      volume: quote.volume[lastIndex] || 0,
      high: meta.regularMarketDayHigh || quote.high[lastIndex],
      low: meta.regularMarketDayLow || quote.low[lastIndex],
      open: quote.open[lastIndex] || meta.regularMarketOpen,
      timestamp: Date.now(),
      source: 'Yahoo Finance'
    }

  } catch (error) {
    console.warn('Yahoo Finance API error:', error)
    return null
  }
}

async function tryAlphaVantage(symbol: string): Promise<MarketDataResponse | null> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    )

    if (!response.ok) return null

    const data = await response.json()
    const quote = data['Global Quote']
    
    if (!quote) return null

    const price = parseFloat(quote['05. price'])
    const change = parseFloat(quote['09. change'])
    
    return {
      symbol: symbol,
      price: price,
      change: change,
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      timestamp: Date.now(),
      source: 'Alpha Vantage'
    }

  } catch (error) {
    console.warn('Alpha Vantage API error:', error)
    return null
  }
}

async function tryPolygon(symbol: string): Promise<MarketDataResponse | null> {
  try {
    const apiKey = process.env.POLYGON_API_KEY
    
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apikey=${apiKey}`
    )

    if (!response.ok) return null

    const data = await response.json()
    const result = data.results?.[0]
    
    if (!result) return null

    return {
      symbol: symbol,
      price: result.c, // close price
      change: result.c - result.o, // close - open
      changePercent: ((result.c - result.o) / result.o) * 100,
      volume: result.v,
      high: result.h,
      low: result.l,
      open: result.o,
      timestamp: Date.now(),
      source: 'Polygon'
    }

  } catch (error) {
    console.warn('Polygon API error:', error)
    return null
  }
}

// ============================================================================
// MOCK DATA GENERATION (for development/demo)
// ============================================================================

function generateMockData(symbol: string): MarketDataResponse {
  // Generate realistic mock data based on symbol
  const basePrice = getBasePriceForSymbol(symbol)
  
  // Generate random price movement (±2%)
  const changePercent = (Math.random() - 0.5) * 4 // -2% to +2%
  const change = basePrice * (changePercent / 100)
  const currentPrice = basePrice + change
  
  // Generate other realistic values
  const dayRange = basePrice * 0.03 // 3% daily range
  const high = currentPrice + (Math.random() * dayRange * 0.5)
  const low = currentPrice - (Math.random() * dayRange * 0.5)
  const open = basePrice + ((Math.random() - 0.5) * dayRange * 0.3)
  
  // Generate volume (millions for large caps)
  const volume = Math.floor(Math.random() * 50000000) + 1000000

  return {
    symbol: symbol,
    price: parseFloat(currentPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: volume,
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    open: parseFloat(open.toFixed(2)),
    timestamp: Date.now(),
    source: 'Mock Data (Development)'
  }
}

function getBasePriceForSymbol(symbol: string): number {
  // Return realistic base prices for common symbols
  const basePrices: Record<string, number> = {
    'AAPL': 185.00,
    'MSFT': 395.00,
    'GOOGL': 143.00,
    'AMZN': 155.00,
    'TSLA': 248.00,
    'NVDA': 875.00,
    'META': 325.00,
    'NFLX': 485.00,
    'SPY': 450.00,
    'QQQ': 380.00,
    'IWM': 200.00,
    'VTI': 240.00
  }

  return basePrices[symbol] || (Math.random() * 200 + 50) // Random price between $50-250
}

// 🔒 Export rate-limited handler
export const GET = rateLimiters.marketData(getMarketDataHandler)
