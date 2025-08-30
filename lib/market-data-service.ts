interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  timestamp: number
}

interface OrderBookEntry {
  price: number
  size: number
}

interface OrderBook {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  timestamp: number
}

interface Trade {
  id: string
  symbol: string
  price: number
  size: number
  side: "buy" | "sell"
  timestamp: number
}

class MarketDataService {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private marketData: Map<string, MarketData> = new Map()
  private orderBooks: Map<string, OrderBook> = new Map()
  private recentTrades: Map<string, Trade[]> = new Map()
  private updateInterval: NodeJS.Timeout | null = null
  private isConnected = false

  constructor() {
    this.initializeData()
    this.startDataUpdates()
  }

  private initializeData() {
    const symbols = ["BTC/USD", "ETH/USD", "ADA/USD", "SOL/USD", "MATIC/USD"]

    symbols.forEach((symbol) => {
      const basePrice = this.getBasePrice(symbol)

      // Initialize market data
      this.marketData.set(symbol, {
        symbol,
        price: basePrice,
        change: (Math.random() - 0.5) * basePrice * 0.05,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.random() * 1000000 + 100000,
        high: basePrice * (1 + Math.random() * 0.03),
        low: basePrice * (1 - Math.random() * 0.03),
        timestamp: Date.now(),
      })

      // Initialize order book
      const bids: OrderBookEntry[] = []
      const asks: OrderBookEntry[] = []

      for (let i = 0; i < 10; i++) {
        bids.push({
          price: basePrice * (1 - (i + 1) * 0.001),
          size: Math.random() * 10 + 0.1,
        })
        asks.push({
          price: basePrice * (1 + (i + 1) * 0.001),
          size: Math.random() * 10 + 0.1,
        })
      }

      this.orderBooks.set(symbol, {
        symbol,
        bids,
        asks,
        timestamp: Date.now(),
      })

      // Initialize recent trades
      const trades: Trade[] = []
      for (let i = 0; i < 20; i++) {
        trades.push({
          id: `trade_${symbol}_${i}`,
          symbol,
          price: basePrice * (1 + (Math.random() - 0.5) * 0.01),
          size: Math.random() * 5 + 0.01,
          side: Math.random() > 0.5 ? "buy" : "sell",
          timestamp: Date.now() - i * 1000,
        })
      }
      this.recentTrades.set(symbol, trades)
    })

    this.isConnected = true
  }

  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      "BTC/USD": 45000,
      "ETH/USD": 3000,
      "ADA/USD": 0.5,
      "SOL/USD": 100,
      "MATIC/USD": 0.8,
    }
    return prices[symbol] || 100
  }

  private startDataUpdates() {
    // Update market data every 2 seconds
    this.updateInterval = setInterval(() => {
      this.updateMarketData()
    }, 2000)

    // Simulate connection after a short delay
    setTimeout(() => {
      this.notifySubscribers("connected", { status: "connected" })
    }, 100)
  }

  private updateMarketData() {
    this.marketData.forEach((data, symbol) => {
      // Generate realistic price movements
      const volatility = 0.002 // 0.2% volatility
      const trend = (Math.random() - 0.5) * 0.001 // Small trend component
      const randomWalk = (Math.random() - 0.5) * volatility

      const priceChange = data.price * (trend + randomWalk)
      const newPrice = Math.max(0.01, data.price + priceChange)

      const updatedData: MarketData = {
        ...data,
        price: newPrice,
        change: newPrice - data.price,
        changePercent: ((newPrice - data.price) / data.price) * 100,
        volume: data.volume + Math.random() * 10000,
        high: Math.max(data.high, newPrice),
        low: Math.min(data.low, newPrice),
        timestamp: Date.now(),
      }

      this.marketData.set(symbol, updatedData)
      this.notifySubscribers("marketData", updatedData)

      // Update order book
      this.updateOrderBook(symbol, newPrice)

      // Add new trades occasionally
      if (Math.random() < 0.3) {
        this.addNewTrade(symbol, newPrice)
      }
    })
  }

  private updateOrderBook(symbol: string, currentPrice: number) {
    const orderBook = this.orderBooks.get(symbol)
    if (!orderBook) return

    // Update bids and asks around current price
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []

    for (let i = 0; i < 10; i++) {
      bids.push({
        price: currentPrice * (1 - (i + 1) * 0.001),
        size: Math.random() * 10 + 0.1,
      })
      asks.push({
        price: currentPrice * (1 + (i + 1) * 0.001),
        size: Math.random() * 10 + 0.1,
      })
    }

    const updatedOrderBook: OrderBook = {
      symbol,
      bids,
      asks,
      timestamp: Date.now(),
    }

    this.orderBooks.set(symbol, updatedOrderBook)
    this.notifySubscribers("orderBook", updatedOrderBook)
  }

  private addNewTrade(symbol: string, price: number) {
    const trades = this.recentTrades.get(symbol) || []
    const newTrade: Trade = {
      id: `trade_${symbol}_${Date.now()}`,
      symbol,
      price: price * (1 + (Math.random() - 0.5) * 0.005),
      size: Math.random() * 5 + 0.01,
      side: Math.random() > 0.5 ? "buy" : "sell",
      timestamp: Date.now(),
    }

    trades.unshift(newTrade)
    if (trades.length > 50) {
      trades.pop()
    }

    this.recentTrades.set(symbol, trades)
    this.notifySubscribers("trade", newTrade)
  }

  private notifySubscribers(channel: string, data: any) {
    const channelSubscribers = this.subscribers.get(channel)
    if (channelSubscribers) {
      channelSubscribers.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in subscriber callback for ${channel}:`, error)
        }
      })
    }
  }

  subscribe(channel: string, callback: (data: any) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
    }
    this.subscribers.get(channel)!.add(callback)

    // Send initial data if available
    if (channel === "marketData") {
      this.marketData.forEach((data) => callback(data))
    }

    // Return unsubscribe function
    return () => {
      const channelSubscribers = this.subscribers.get(channel)
      if (channelSubscribers) {
        channelSubscribers.delete(callback)
      }
    }
  }

  getMarketData(symbol: string): MarketData | null {
    return this.marketData.get(symbol) || null
  }

  getAllMarketData(): MarketData[] {
    return Array.from(this.marketData.values())
  }

  getOrderBook(symbol: string): OrderBook | null {
    return this.orderBooks.get(symbol) || null
  }

  getRecentTrades(symbol: string): Trade[] {
    return this.recentTrades.get(symbol) || []
  }

  isConnectedToMarket(): boolean {
    return this.isConnected
  }

  disconnect() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.isConnected = false
    this.subscribers.clear()
  }
}

export const marketDataService = new MarketDataService()
export type { MarketData, OrderBook, Trade, OrderBookEntry }
