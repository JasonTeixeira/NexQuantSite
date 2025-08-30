// 📈 MARKET DATA API
import { NextRequest, NextResponse } from 'next/server'

const mockMarketData = {
  indices: [
    { symbol: 'SPY', name: 'S&P 500', price: 482.35, change: 1.25, changePercent: 0.26 },
    { symbol: 'QQQ', name: 'NASDAQ', price: 405.82, change: -2.14, changePercent: -0.52 },
    { symbol: 'DIA', name: 'Dow Jones', price: 385.67, change: 0.89, changePercent: 0.23 }
  ],
  crypto: [
    { symbol: 'BTC', name: 'Bitcoin', price: 52834.21, change: 1245.32, changePercent: 2.41 },
    { symbol: 'ETH', name: 'Ethereum', price: 2856.78, change: -45.23, changePercent: -1.56 },
    { symbol: 'SOL', name: 'Solana', price: 108.45, change: 3.21, changePercent: 3.05 }
  ],
  forex: [
    { pair: 'EUR/USD', bid: 1.0823, ask: 1.0825, spread: 0.0002, change: 0.0012 },
    { pair: 'GBP/USD', bid: 1.2654, ask: 1.2656, spread: 0.0002, change: -0.0008 },
    { pair: 'USD/JPY', bid: 148.92, ask: 148.94, spread: 0.02, change: 0.35 }
  ],
  commodities: [
    { symbol: 'GOLD', name: 'Gold', price: 2042.30, change: 12.50, changePercent: 0.62 },
    { symbol: 'OIL', name: 'WTI Crude', price: 77.82, change: -0.95, changePercent: -1.21 },
    { symbol: 'SILVER', name: 'Silver', price: 23.45, change: 0.18, changePercent: 0.77 }
  ],
  trending: [
    { symbol: 'NVDA', name: 'NVIDIA', price: 682.23, volume: '52.3M', change: 15.67, changePercent: 2.35 },
    { symbol: 'TSLA', name: 'Tesla', price: 185.45, volume: '45.8M', change: -3.21, changePercent: -1.70 },
    { symbol: 'AAPL', name: 'Apple', price: 182.91, volume: '38.2M', change: 1.23, changePercent: 0.68 }
  ],
  marketStatus: {
    isOpen: true,
    nextOpen: '2024-01-22T09:30:00-05:00',
    nextClose: '2024-01-22T16:00:00-05:00',
    currentTime: new Date().toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const asset = searchParams.get('asset') || 'all'
    
    if (asset === 'all') {
      return NextResponse.json({
        success: true,
        data: mockMarketData,
        timestamp: new Date().toISOString()
      })
    }
    
    // Return specific asset class
    const assetData = mockMarketData[asset as keyof typeof mockMarketData]
    if (assetData) {
      return NextResponse.json({
        success: true,
        data: { [asset]: assetData },
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid asset type' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}

