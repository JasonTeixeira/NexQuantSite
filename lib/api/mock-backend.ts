/**
 * Mock Backend for Development
 * This simulates backend responses when the real backend is not available
 * Set NEXT_PUBLIC_USE_MOCK_BACKEND=true to use this
 */

import type { 
  User, 
  TradingSignal, 
  Portfolio, 
  Trade, 
  MarketData,
  TradingBot,
  Position 
} from '../database/models'

// Mock data generators
const generateMockUser = (): User => ({
  id: 'user_' + Math.random().toString(36).substr(2, 9),
  email: 'demo@nexuraltrading.com',
  username: 'demo_trader',
  firstName: 'Demo',
  lastName: 'Trader',
  avatar: '/placeholder-user.jpg',
  role: 'user',
  status: 'active',
  emailVerified: true,
  twoFactorEnabled: false,
  preferences: {
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false,
      trading: true,
      news: true,
      marketing: false
    },
    trading: {
      defaultRiskLevel: 2,
      autoTrade: false,
      maxDailyLoss: 1000,
      preferredExchanges: ['binance'],
      tradingHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'UTC'
      }
    },
    privacy: {
      profileVisible: true,
      tradingStatsVisible: true,
      leaderboardVisible: true,
      allowDataSharing: false
    }
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  loginAttempts: 0
})

const generateMockPortfolio = (): Portfolio => ({
  id: 'portfolio_' + Math.random().toString(36).substr(2, 9),
  userId: 'user_demo',
  name: 'Main Portfolio',
  description: 'Primary trading portfolio',
  type: 'paper',
  exchange: 'binance',
  totalValue: 10000 + Math.random() * 5000,
  totalReturn: Math.random() * 2000 - 500,
  totalReturnPercent: Math.random() * 20 - 5,
  dayChange: Math.random() * 500 - 250,
  dayChangePercent: Math.random() * 5 - 2.5,
  positions: [],
  performance: {
    totalReturn: Math.random() * 2000,
    totalReturnPercent: Math.random() * 20,
    annualizedReturn: Math.random() * 30,
    volatility: Math.random() * 15,
    sharpeRatio: Math.random() * 2,
    maxDrawdown: Math.random() * 10,
    winRate: 50 + Math.random() * 30,
    profitFactor: 1 + Math.random(),
    totalTrades: Math.floor(Math.random() * 100),
    averageHoldingPeriod: Math.floor(Math.random() * 7)
  },
  createdAt: new Date(),
  updatedAt: new Date()
})

const generateMockSignal = (): TradingSignal => ({
  id: 'signal_' + Math.random().toString(36).substr(2, 9),
  userId: 'user_demo',
  symbol: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'][Math.floor(Math.random() * 3)],
  exchange: 'binance',
  type: Math.random() > 0.5 ? 'buy' : 'sell',
  price: 30000 + Math.random() * 10000,
  stopLoss: 29000 + Math.random() * 1000,
  takeProfit: 32000 + Math.random() * 3000,
  confidence: 60 + Math.random() * 40,
  timeframe: '1h',
  status: 'active',
  reason: 'Technical indicators show strong momentum',
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date()
})

const generateMockMarketData = (symbol: string): MarketData => ({
  symbol,
  exchange: 'binance',
  price: 30000 + Math.random() * 10000,
  change: Math.random() * 2000 - 1000,
  changePercent: Math.random() * 10 - 5,
  volume: 1000000 + Math.random() * 5000000,
  high24h: 32000 + Math.random() * 1000,
  low24h: 29000 + Math.random() * 1000,
  open24h: 30500 + Math.random() * 500,
  marketCap: 500000000000 + Math.random() * 100000000000,
  timestamp: new Date()
})

const generateMockBot = (): TradingBot => ({
  id: 'bot_' + Math.random().toString(36).substr(2, 9),
  userId: 'user_demo',
  name: 'Demo Bot ' + Math.floor(Math.random() * 100),
  description: 'Automated trading bot using technical indicators',
  strategy: 'momentum',
  status: 'active',
  config: {
    symbol: 'BTCUSDT',
    exchange: 'binance',
    timeframe: '1h',
    riskLevel: 2,
    maxPositionSize: 1000,
    stopLoss: 2,
    takeProfit: 5,
    indicators: [],
    conditions: []
  },
  performance: {
    totalTrades: Math.floor(Math.random() * 100),
    winningTrades: Math.floor(Math.random() * 60),
    losingTrades: Math.floor(Math.random() * 40),
    winRate: 50 + Math.random() * 30,
    totalReturn: Math.random() * 5000,
    totalReturnPercent: Math.random() * 50,
    maxDrawdown: Math.random() * 20,
    sharpeRatio: Math.random() * 2,
    profitFactor: 1 + Math.random(),
    averageWin: Math.random() * 100,
    averageLoss: Math.random() * 50,
    largestWin: Math.random() * 500,
    largestLoss: Math.random() * 200
  },
  createdAt: new Date(),
  updatedAt: new Date()
})

// Mock API class
export class MockBackendAPI {
  private mockDelay = () => new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400))

  async healthCheck(): Promise<boolean> {
    await this.mockDelay()
    return true
  }

  // Auth methods
  async login(email: string, password: string) {
    await this.mockDelay()
    if (password === 'demo') {
      return {
        user: generateMockUser(),
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      }
    }
    throw new Error('Invalid credentials')
  }

  async register(userData: any) {
    await this.mockDelay()
    return generateMockUser()
  }

  async logout() {
    await this.mockDelay()
    return true
  }

  async refreshToken(refreshToken: string) {
    await this.mockDelay()
    return {
      accessToken: 'mock_access_token_' + Date.now()
    }
  }

  // User methods
  async getUserProfile() {
    await this.mockDelay()
    return generateMockUser()
  }

  async updateUserProfile(updates: any) {
    await this.mockDelay()
    return { ...generateMockUser(), ...updates }
  }

  // Trading methods
  async getPortfolio() {
    await this.mockDelay()
    return generateMockPortfolio()
  }

  async getPositions() {
    await this.mockDelay()
    return Array.from({ length: 5 }, (_, i) => ({
      id: 'pos_' + i,
      portfolioId: 'portfolio_demo',
      symbol: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'][i % 3],
      side: 'long' as const,
      quantity: Math.random() * 10,
      averagePrice: 30000 + Math.random() * 10000,
      currentPrice: 30000 + Math.random() * 10000,
      marketValue: Math.random() * 10000,
      unrealizedPnl: Math.random() * 1000 - 500,
      unrealizedPnlPercent: Math.random() * 10 - 5,
      realizedPnl: Math.random() * 500,
      openedAt: new Date(),
      updatedAt: new Date()
    }))
  }

  async placeOrder(order: any) {
    await this.mockDelay()
    return {
      id: 'trade_' + Date.now(),
      userId: 'user_demo',
      portfolioId: 'portfolio_demo',
      ...order,
      status: 'pending',
      executedQuantity: 0,
      executedPrice: 0,
      fees: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async cancelOrder(orderId: string) {
    await this.mockDelay()
    return true
  }

  async getTradeHistory() {
    await this.mockDelay()
    return Array.from({ length: 20 }, (_, i) => ({
      id: 'trade_' + i,
      userId: 'user_demo',
      portfolioId: 'portfolio_demo',
      symbol: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'][i % 3],
      exchange: 'binance',
      side: i % 2 === 0 ? 'buy' : 'sell',
      type: 'market',
      quantity: Math.random() * 10,
      price: 30000 + Math.random() * 10000,
      executedQuantity: Math.random() * 10,
      executedPrice: 30000 + Math.random() * 10000,
      status: 'filled',
      fees: Math.random() * 10,
      pnl: Math.random() * 200 - 100,
      pnlPercent: Math.random() * 10 - 5,
      createdAt: new Date(Date.now() - i * 3600000),
      updatedAt: new Date(Date.now() - i * 3600000),
      executedAt: new Date(Date.now() - i * 3600000)
    }))
  }

  // Market data methods
  async getTickers() {
    await this.mockDelay()
    return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOTUSDT'].map(generateMockMarketData)
  }

  async getTicker(symbol: string) {
    await this.mockDelay()
    return generateMockMarketData(symbol)
  }

  async getOrderBook(symbol: string) {
    await this.mockDelay()
    return {
      bids: Array.from({ length: 20 }, () => [
        30000 - Math.random() * 100,
        Math.random() * 10
      ]),
      asks: Array.from({ length: 20 }, () => [
        30000 + Math.random() * 100,
        Math.random() * 10
      ])
    }
  }

  async getKlines(symbol: string, interval: string, limit: number) {
    await this.mockDelay()
    return Array.from({ length: limit }, (_, i) => ({
      openTime: Date.now() - (limit - i) * 3600000,
      open: 30000 + Math.random() * 1000,
      high: 31000 + Math.random() * 1000,
      low: 29000 + Math.random() * 1000,
      close: 30000 + Math.random() * 1000,
      volume: Math.random() * 1000000,
      closeTime: Date.now() - (limit - i - 1) * 3600000
    }))
  }

  // Signals methods
  async getSignals() {
    await this.mockDelay()
    return Array.from({ length: 10 }, generateMockSignal)
  }

  async getSignal(signalId: string) {
    await this.mockDelay()
    return { ...generateMockSignal(), id: signalId }
  }

  async executeSignal(signalId: string) {
    await this.mockDelay()
    return {
      id: 'trade_' + Date.now(),
      signalId,
      status: 'pending'
    }
  }

  async getSignalPerformance() {
    await this.mockDelay()
    return {
      totalSignals: 100,
      successRate: 73.5,
      averageReturn: 4.2,
      totalReturn: 420
    }
  }

  // Bots methods
  async getBots() {
    await this.mockDelay()
    return Array.from({ length: 5 }, generateMockBot)
  }

  async createBot(bot: any) {
    await this.mockDelay()
    return { ...generateMockBot(), ...bot }
  }

  async updateBot(botId: string, updates: any) {
    await this.mockDelay()
    return { ...generateMockBot(), id: botId, ...updates }
  }

  async deleteBot(botId: string) {
    await this.mockDelay()
    return true
  }

  async startBot(botId: string) {
    await this.mockDelay()
    return true
  }

  async stopBot(botId: string) {
    await this.mockDelay()
    return true
  }

  async getBotPerformance(botId: string) {
    await this.mockDelay()
    return generateMockBot().performance
  }
}

// Export singleton instance
export const mockBackend = new MockBackendAPI()

// Check if we should use mock backend
export const useMockBackend = () => {
  return process.env.NEXT_PUBLIC_USE_MOCK_BACKEND === 'true' || 
         process.env.NEXT_PUBLIC_API_URL?.includes('localhost')
}
