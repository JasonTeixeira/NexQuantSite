/**
 * 🔌 PLUG-AND-PLAY DATA ARCHITECTURE
 * 
 * This system allows seamless switching between mock data and real data sources
 * without changing any UI components. Just swap the adapters!
 */

// Base interfaces for all data types
export interface MarketDataPoint {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
  bid?: number
  ask?: number
  high?: number
  low?: number
  open?: number
}

export interface PortfolioData {
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  positions: Position[]
  performance: PerformanceMetric[]
  riskMetrics: RiskMetric[]
}

export interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  pnl: number
  pnlPercent: number
  weight: number
}

export interface PerformanceMetric {
  date: string
  portfolioValue: number
  benchmark: number
  drawdown: number
  returns: number
}

export interface RiskMetric {
  name: string
  value: number
  threshold: number
  status: 'safe' | 'warning' | 'danger'
}

export interface OrderData {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  type: 'market' | 'limit' | 'stop' | 'stop-limit'
  status: 'pending' | 'filled' | 'cancelled' | 'rejected'
  timestamp: number
  venue?: string
}

export interface StrategyData {
  id: string
  name: string
  description: string
  performance: PerformanceMetric[]
  parameters: Record<string, any>
  status: 'active' | 'inactive' | 'backtesting'
  sharpe: number
  maxDrawdown: number
  totalReturn: number
}

// Abstract base adapter class
export abstract class DataAdapter {
  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract isConnected(): boolean
  
  // Market data methods
  abstract getMarketData(symbols: string[]): Promise<MarketDataPoint[]>
  abstract subscribeToMarketData(symbols: string[], callback: (data: MarketDataPoint[]) => void): void
  abstract unsubscribeFromMarketData(symbols: string[]): void
  
  // Portfolio methods
  abstract getPortfolioData(): Promise<PortfolioData>
  abstract subscribeToPortfolio(callback: (data: PortfolioData) => void): void
  
  // Order methods
  abstract getOrders(): Promise<OrderData[]>
  abstract placeOrder(order: Omit<OrderData, 'id' | 'timestamp' | 'status'>): Promise<OrderData>
  abstract cancelOrder(orderId: string): Promise<boolean>
  
  // Strategy methods
  abstract getStrategies(): Promise<StrategyData[]>
  abstract getStrategyPerformance(strategyId: string): Promise<PerformanceMetric[]>
  
  // Historical data
  abstract getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<any[]>
}

// Mock data adapter (current implementation)
export class MockDataAdapter extends DataAdapter {
  private connected = false
  private marketDataInterval?: NodeJS.Timeout
  private portfolioInterval?: NodeJS.Timeout
  
  async connect(): Promise<void> {
    this.connected = true
    console.log('🔌 Connected to Mock Data Source')
  }
  
  async disconnect(): Promise<void> {
    this.connected = false
    if (this.marketDataInterval) clearInterval(this.marketDataInterval)
    if (this.portfolioInterval) clearInterval(this.portfolioInterval)
    console.log('🔌 Disconnected from Mock Data Source')
  }
  
  isConnected(): boolean {
    return this.connected
  }
  
  async getMarketData(symbols: string[]): Promise<MarketDataPoint[]> {
    return symbols.map(symbol => ({
      symbol,
      price: 100 + Math.random() * 400,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
      bid: 100 + Math.random() * 400 - 0.01,
      ask: 100 + Math.random() * 400 + 0.01,
      high: 100 + Math.random() * 400 + 5,
      low: 100 + Math.random() * 400 - 5,
      open: 100 + Math.random() * 400
    }))
  }
  
  subscribeToMarketData(symbols: string[], callback: (data: MarketDataPoint[]) => void): void {
    this.marketDataInterval = setInterval(async () => {
      const data = await this.getMarketData(symbols)
      callback(data)
    }, 1000)
  }
  
  unsubscribeFromMarketData(symbols: string[]): void {
    if (this.marketDataInterval) {
      clearInterval(this.marketDataInterval)
      this.marketDataInterval = undefined
    }
  }
  
  async getPortfolioData(): Promise<PortfolioData> {
    return {
      totalValue: 1000000 + Math.random() * 500000,
      totalPnL: (Math.random() - 0.5) * 100000,
      totalPnLPercent: (Math.random() - 0.5) * 10,
      positions: [
        {
          symbol: 'AAPL',
          quantity: 1000,
          avgPrice: 150,
          currentPrice: 155,
          marketValue: 155000,
          pnl: 5000,
          pnlPercent: 3.33,
          weight: 15.5
        }
      ],
      performance: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        portfolioValue: 1000000 + Math.random() * 100000,
        benchmark: 1000000 + Math.random() * 80000,
        drawdown: Math.random() * -10,
        returns: (Math.random() - 0.5) * 2
      })),
      riskMetrics: [
        { name: 'VaR (1d)', value: 25000, threshold: 50000, status: 'safe' },
        { name: 'Beta', value: 1.2, threshold: 1.5, status: 'safe' },
        { name: 'Sharpe Ratio', value: 1.8, threshold: 1.0, status: 'safe' }
      ]
    }
  }
  
  subscribeToPortfolio(callback: (data: PortfolioData) => void): void {
    this.portfolioInterval = setInterval(async () => {
      const data = await this.getPortfolioData()
      callback(data)
    }, 5000)
  }
  
  async getOrders(): Promise<OrderData[]> {
    return [
      {
        id: '1',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 100,
        price: 150.25,
        type: 'limit',
        status: 'pending',
        timestamp: Date.now(),
        venue: 'NASDAQ'
      }
    ]
  }
  
  async placeOrder(order: Omit<OrderData, 'id' | 'timestamp' | 'status'>): Promise<OrderData> {
    return {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      status: 'pending'
    }
  }
  
  async cancelOrder(orderId: string): Promise<boolean> {
    return true
  }
  
  async getStrategies(): Promise<StrategyData[]> {
    return [
      {
        id: '1',
        name: 'Momentum Strategy',
        description: 'Long-short equity momentum strategy',
        performance: [],
        parameters: { lookback: 20, threshold: 0.02 },
        status: 'active',
        sharpe: 1.8,
        maxDrawdown: -8.5,
        totalReturn: 24.5
      }
    ]
  }
  
  async getStrategyPerformance(strategyId: string): Promise<PerformanceMetric[]> {
    return Array.from({ length: 252 }, (_, i) => ({
      date: new Date(Date.now() - (251 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      portfolioValue: 1000000 * (1 + (Math.random() - 0.48) * 0.02) ** i,
      benchmark: 1000000 * (1 + (Math.random() - 0.49) * 0.015) ** i,
      drawdown: Math.random() * -15,
      returns: (Math.random() - 0.48) * 2
    }))
  }
  
  async getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<any[]> {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(start.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: 100 + Math.random() * 50,
      high: 100 + Math.random() * 60,
      low: 100 + Math.random() * 40,
      close: 100 + Math.random() * 50,
      volume: Math.floor(Math.random() * 1000000)
    }))
  }
}

// Real data adapters (ready for future implementation)
export class AlpacaDataAdapter extends DataAdapter {
  // Implementation for Alpaca API
  async connect(): Promise<void> {
    console.log('🔌 Connecting to Alpaca...')
    // Real Alpaca connection logic here
  }
  
  // ... implement all abstract methods with real Alpaca API calls
  async getMarketData(symbols: string[]): Promise<MarketDataPoint[]> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  subscribeToMarketData(symbols: string[], callback: (data: MarketDataPoint[]) => void): void {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  unsubscribeFromMarketData(symbols: string[]): void {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  async getPortfolioData(): Promise<PortfolioData> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  subscribeToPortfolio(callback: (data: PortfolioData) => void): void {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  async getOrders(): Promise<OrderData[]> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  async placeOrder(order: Omit<OrderData, 'id' | 'timestamp' | 'status'>): Promise<OrderData> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  async cancelOrder(orderId: string): Promise<boolean> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  async getStrategies(): Promise<StrategyData[]> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  async getStrategyPerformance(strategyId: string): Promise<PerformanceMetric[]> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  async getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<any[]> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  async disconnect(): Promise<void> {
    throw new Error('Alpaca adapter not implemented yet')
  }
  
  isConnected(): boolean {
    throw new Error('Alpaca adapter not implemented yet')
  }
}

export class InteractiveBrokersAdapter extends DataAdapter {
  // Implementation for Interactive Brokers API
  async connect(): Promise<void> {
    console.log('🔌 Connecting to Interactive Brokers...')
    // Real IB connection logic here
  }
  
  // ... implement all abstract methods with real IB API calls
  async getMarketData(symbols: string[]): Promise<MarketDataPoint[]> {
    throw new Error('IB adapter not implemented yet')
  }
  
  subscribeToMarketData(symbols: string[], callback: (data: MarketDataPoint[]) => void): void {
    throw new Error('IB adapter not implemented yet')
  }
  
  unsubscribeFromMarketData(symbols: string[]): void {
    throw new Error('IB adapter not implemented yet')
  }
  
  async getPortfolioData(): Promise<PortfolioData> {
    throw new Error('IB adapter not implemented yet')
  }
  
  subscribeToPortfolio(callback: (data: PortfolioData) => void): void {
    throw new Error('IB adapter not implemented yet')
  }
  
  async getOrders(): Promise<OrderData[]> {
    throw new Error('IB adapter not implemented yet')
  }
  
  async placeOrder(order: Omit<OrderData, 'id' | 'timestamp' | 'status'>): Promise<OrderData> {
    throw new Error('IB adapter not implemented yet')
  }
  
  async cancelOrder(orderId: string): Promise<boolean> {
    throw new Error('IB adapter not implemented yet')
  }
  
  async getStrategies(): Promise<StrategyData[]> {
    throw new Error('IB adapter not implemented yet')
  }
  
  async getStrategyPerformance(strategyId: string): Promise<PerformanceMetric[]> {
    throw new Error('IB adapter not implemented yet')
  }
  
  async getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<any[]> {
    throw new Error('IB adapter not implemented yet')
  }
  
  async disconnect(): Promise<void> {
    throw new Error('IB adapter not implemented yet')
  }
  
  isConnected(): boolean {
    throw new Error('IB adapter not implemented yet')
  }
}

// Data manager - single point of configuration
export class DataManager {
  private static instance: DataManager
  private adapter: DataAdapter
  
  private constructor() {
    // Start with mock adapter - easily switchable later
    this.adapter = new MockDataAdapter()
  }
  
  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }
  
  // 🔥 MAGIC METHOD: Switch data sources with one line!
  setAdapter(adapter: DataAdapter): void {
    this.adapter?.disconnect()
    this.adapter = adapter
  }
  
  getAdapter(): DataAdapter {
    return this.adapter
  }
  
  // Convenience methods that delegate to the current adapter
  async connect(): Promise<void> {
    return this.adapter.connect()
  }
  
  async disconnect(): Promise<void> {
    return this.adapter.disconnect()
  }
  
  isConnected(): boolean {
    return this.adapter.isConnected()
  }
  
  // Market data
  async getMarketData(symbols: string[]): Promise<MarketDataPoint[]> {
    return this.adapter.getMarketData(symbols)
  }
  
  subscribeToMarketData(symbols: string[], callback: (data: MarketDataPoint[]) => void): void {
    return this.adapter.subscribeToMarketData(symbols, callback)
  }
  
  // Portfolio
  async getPortfolioData(): Promise<PortfolioData> {
    return this.adapter.getPortfolioData()
  }
  
  subscribeToPortfolio(callback: (data: PortfolioData) => void): void {
    return this.adapter.subscribeToPortfolio(callback)
  }
  
  // Orders
  async getOrders(): Promise<OrderData[]> {
    return this.adapter.getOrders()
  }
  
  async placeOrder(order: Omit<OrderData, 'id' | 'timestamp' | 'status'>): Promise<OrderData> {
    return this.adapter.placeOrder(order)
  }
  
  // Strategies
  async getStrategies(): Promise<StrategyData[]> {
    return this.adapter.getStrategies()
  }
  
  async getStrategyPerformance(strategyId: string): Promise<PerformanceMetric[]> {
    return this.adapter.getStrategyPerformance(strategyId)
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance()

// Configuration helper for easy switching
export const DataSources = {
  MOCK: () => new MockDataAdapter(),
  ALPACA: () => new AlpacaDataAdapter(),
  INTERACTIVE_BROKERS: () => new InteractiveBrokersAdapter(),
  // Add more as needed...
} as const

// 🚀 USAGE EXAMPLE:
// 
// // In development - use mock data
// dataManager.setAdapter(DataSources.MOCK())
// 
// // In production - switch to real data with ONE LINE!
// dataManager.setAdapter(DataSources.ALPACA())
// 
// // All UI components work exactly the same!
