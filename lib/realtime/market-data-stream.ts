// 📊 MARKET DATA STREAM - Real-time market data aggregation
// Handles live price feeds from multiple sources with intelligent failover

import { wsManager } from './websocket-manager'

export interface MarketTick {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  bid: number
  ask: number
  high: number
  low: number
  open: number
  timestamp: number
  source: string
}

export interface MarketUpdate {
  type: 'tick' | 'quote' | 'trade' | 'orderbook'
  symbol: string
  data: MarketTick
  timestamp: number
}

type MarketDataHandler = (update: MarketUpdate) => void

interface DataSourceConfig {
  name: string
  url: string
  apiKey?: string
  priority: number
  symbols: string[]
  enabled: boolean
}

export class MarketDataStream {
  private handlers: Set<MarketDataHandler> = new Set()
  private subscribedSymbols: Set<string> = new Set()
  private lastPrices: Map<string, MarketTick> = new Map()
  private dataSourceConfigs: DataSourceConfig[] = []
  private activeConnection: string | null = null
  private retryCount = 0
  private maxRetries = 5

  constructor() {
    this.setupDataSources()
    this.setupWebSocketHandlers()
  }

  // ============================================================================
  // DATA SOURCE CONFIGURATION
  // ============================================================================

  private setupDataSources(): void {
    this.dataSourceConfigs = [
      {
        name: 'Yahoo Finance WebSocket',
        url: 'wss://streamer.finance.yahoo.com',
        priority: 1,
        symbols: [],
        enabled: true
      },
      {
        name: 'Polygon.io WebSocket',
        url: 'wss://socket.polygon.io/stocks',
        apiKey: process.env.NEXT_PUBLIC_POLYGON_API_KEY,
        priority: 2,
        symbols: [],
        enabled: !!process.env.NEXT_PUBLIC_POLYGON_API_KEY
      },
      {
        name: 'Alpha Vantage WebSocket',
        url: 'wss://ws.twelvedata.com/v1/quotes/price',
        apiKey: process.env.NEXT_PUBLIC_TWELVE_DATA_KEY,
        priority: 3,
        symbols: [],
        enabled: !!process.env.NEXT_PUBLIC_TWELVE_DATA_KEY
      },
      {
        name: 'Fallback HTTP Polling',
        url: '',
        priority: 99,
        symbols: [],
        enabled: true
      }
    ]
  }

  private setupWebSocketHandlers(): void {
    wsManager.onStatusChange((status, connectionId) => {
      if (connectionId === this.activeConnection) {
        if (status === 'connected') {
          this.retryCount = 0
          this.subscribeToActiveSymbols()
        } else if (status === 'error' || status === 'disconnected') {
          this.handleConnectionFailure()
        }
      }
    })
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  async subscribe(symbols: string[]): Promise<void> {
    symbols.forEach(symbol => {
      this.subscribedSymbols.add(symbol.toUpperCase())
    })

    if (!this.activeConnection) {
      await this.connectToBestSource()
    } else {
      await this.subscribeToSymbols(symbols)
    }
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    symbols.forEach(symbol => {
      this.subscribedSymbols.delete(symbol.toUpperCase())
      this.lastPrices.delete(symbol.toUpperCase())
    })

    if (this.activeConnection) {
      await this.unsubscribeFromSymbols(symbols)
    }
  }

  onMarketUpdate(handler: MarketDataHandler): () => void {
    this.handlers.add(handler)
    
    return () => {
      this.handlers.delete(handler)
    }
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  private async connectToBestSource(): Promise<void> {
    const availableSources = this.dataSourceConfigs
      .filter(source => source.enabled)
      .sort((a, b) => a.priority - b.priority)

    for (const source of availableSources) {
      try {
        if (source.name === 'Fallback HTTP Polling') {
          await this.startHttpPolling()
          return
        }

        const connectionId = `market-${source.name}`
        
        await wsManager.connect(connectionId, {
          url: source.url,
          reconnectInterval: 5000,
          maxReconnectAttempts: 3,
          heartbeatInterval: 30000
        })

        wsManager.subscribe(connectionId, (message) => {
          this.handleWebSocketMessage(message, source)
        })

        this.activeConnection = connectionId
        console.log(`✅ Connected to ${source.name} for market data`)
        return

      } catch (error) {
        console.warn(`❌ Failed to connect to ${source.name}:`, error)
        continue
      }
    }

    throw new Error('No market data sources available')
  }

  private handleConnectionFailure(): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      console.log(`🔄 Retrying market data connection (${this.retryCount}/${this.maxRetries})`)
      
      setTimeout(() => {
        this.activeConnection = null
        this.connectToBestSource().catch(error => {
          console.error('Market data reconnection failed:', error)
        })
      }, 5000 * this.retryCount) // Exponential backoff
    } else {
      console.error('💥 Max retries exceeded for market data')
      this.startHttpPolling() // Fallback to HTTP polling
    }
  }

  // ============================================================================
  // WEBSOCKET MESSAGE HANDLING
  // ============================================================================

  private handleWebSocketMessage(message: any, source: DataSourceConfig): void {
    try {
      let marketUpdate: MarketUpdate | null = null

      // Parse different message formats based on source
      switch (source.name) {
        case 'Yahoo Finance WebSocket':
          marketUpdate = this.parseYahooMessage(message)
          break
        case 'Polygon.io WebSocket':
          marketUpdate = this.parsePolygonMessage(message)
          break
        case 'Alpha Vantage WebSocket':
          marketUpdate = this.parseAlphaVantageMessage(message)
          break
      }

      if (marketUpdate) {
        this.processMarketUpdate(marketUpdate)
      }

    } catch (error) {
      console.error('Error parsing market data message:', error)
    }
  }

  private parseYahooMessage(message: any): MarketUpdate | null {
    if (message.type === 'quote' && message.data) {
      const tick: MarketTick = {
        symbol: message.data.symbol,
        price: message.data.price,
        change: message.data.change,
        changePercent: message.data.changePercent,
        volume: message.data.volume,
        bid: message.data.bid,
        ask: message.data.ask,
        high: message.data.high,
        low: message.data.low,
        open: message.data.open,
        timestamp: Date.now(),
        source: 'Yahoo Finance'
      }

      return {
        type: 'tick',
        symbol: tick.symbol,
        data: tick,
        timestamp: tick.timestamp
      }
    }
    return null
  }

  private parsePolygonMessage(message: any): MarketUpdate | null {
    if (message.ev === 'T' && message.data) { // Trade event
      const data = message.data
      const tick: MarketTick = {
        symbol: data.sym,
        price: data.p,
        change: 0, // Calculate from last price
        changePercent: 0,
        volume: data.s,
        bid: 0, // Not available in trade events
        ask: 0,
        high: 0,
        low: 0,
        open: 0,
        timestamp: data.t,
        source: 'Polygon'
      }

      // Calculate change if we have previous price
      const lastPrice = this.lastPrices.get(tick.symbol)
      if (lastPrice) {
        tick.change = tick.price - lastPrice.price
        tick.changePercent = (tick.change / lastPrice.price) * 100
      }

      return {
        type: 'trade',
        symbol: tick.symbol,
        data: tick,
        timestamp: tick.timestamp
      }
    }
    return null
  }

  private parseAlphaVantageMessage(message: any): MarketUpdate | null {
    // Alpha Vantage WebSocket format parsing
    if (message.type === 'price' && message.data) {
      const tick: MarketTick = {
        symbol: message.symbol,
        price: parseFloat(message.data.price),
        change: parseFloat(message.data.change),
        changePercent: parseFloat(message.data.changePercent),
        volume: parseInt(message.data.volume),
        bid: parseFloat(message.data.bid),
        ask: parseFloat(message.data.ask),
        high: parseFloat(message.data.high),
        low: parseFloat(message.data.low),
        open: parseFloat(message.data.open),
        timestamp: Date.now(),
        source: 'Alpha Vantage'
      }

      return {
        type: 'quote',
        symbol: tick.symbol,
        data: tick,
        timestamp: tick.timestamp
      }
    }
    return null
  }

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  private processMarketUpdate(update: MarketUpdate): void {
    // Store the latest price
    this.lastPrices.set(update.symbol, update.data)

    // Notify all handlers
    this.handlers.forEach(handler => {
      try {
        handler(update)
      } catch (error) {
        console.error('Error in market data handler:', error)
      }
    })
  }

  // ============================================================================
  // SUBSCRIPTION HELPERS
  // ============================================================================

  private async subscribeToActiveSymbols(): Promise<void> {
    if (this.subscribedSymbols.size > 0) {
      await this.subscribeToSymbols(Array.from(this.subscribedSymbols))
    }
  }

  private async subscribeToSymbols(symbols: string[]): Promise<void> {
    if (!this.activeConnection) return

    const subscriptionMessage = {
      type: 'subscribe',
      symbols: symbols.map(s => s.toUpperCase())
    }

    wsManager.send(this.activeConnection, subscriptionMessage)
  }

  private async unsubscribeFromSymbols(symbols: string[]): Promise<void> {
    if (!this.activeConnection) return

    const unsubscriptionMessage = {
      type: 'unsubscribe',
      symbols: symbols.map(s => s.toUpperCase())
    }

    wsManager.send(this.activeConnection, unsubscriptionMessage)
  }

  // ============================================================================
  // HTTP POLLING FALLBACK
  // ============================================================================

  private httpPollingTimer: NodeJS.Timeout | null = null

  private async startHttpPolling(): Promise<void> {
    console.log('📡 Starting HTTP polling fallback for market data')
    
    const pollInterval = 5000 // 5 seconds
    
    this.httpPollingTimer = setInterval(async () => {
      await this.pollMarketData()
    }, pollInterval)

    // Initial poll
    await this.pollMarketData()
  }

  private async pollMarketData(): Promise<void> {
    const symbols = Array.from(this.subscribedSymbols)
    if (symbols.length === 0) return

    try {
      // Use Yahoo Finance as fallback
      const promises = symbols.map(symbol => this.fetchSymbolData(symbol))
      const results = await Promise.allSettled(promises)

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const update: MarketUpdate = {
            type: 'tick',
            symbol: symbols[index],
            data: result.value,
            timestamp: Date.now()
          }
          this.processMarketUpdate(update)
        }
      })

    } catch (error) {
      console.error('HTTP polling error:', error)
    }
  }

  private async fetchSymbolData(symbol: string): Promise<MarketTick | null> {
    try {
      // This is a simplified example - you'd use a real API here
      const response = await fetch(`/api/market-data/${symbol}`)
      if (!response.ok) return null

      const data = await response.json()
      
      return {
        symbol: symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        bid: data.bid || data.price,
        ask: data.ask || data.price,
        high: data.high,
        low: data.low,
        open: data.open,
        timestamp: Date.now(),
        source: 'HTTP Polling'
      }

    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error)
      return null
    }
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  getLastPrice(symbol: string): MarketTick | null {
    return this.lastPrices.get(symbol.toUpperCase()) || null
  }

  getAllLastPrices(): Record<string, MarketTick> {
    const prices: Record<string, MarketTick> = {}
    this.lastPrices.forEach((tick, symbol) => {
      prices[symbol] = tick
    })
    return prices
  }

  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols)
  }

  isConnected(): boolean {
    return this.activeConnection !== null && 
           wsManager.isConnected(this.activeConnection)
  }

  disconnect(): void {
    if (this.activeConnection) {
      wsManager.disconnect(this.activeConnection)
      this.activeConnection = null
    }

    if (this.httpPollingTimer) {
      clearInterval(this.httpPollingTimer)
      this.httpPollingTimer = null
    }
  }
}

// Singleton instance
export const marketDataStream = new MarketDataStream()

export default marketDataStream
