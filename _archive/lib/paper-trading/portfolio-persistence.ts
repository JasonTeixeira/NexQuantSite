// 💾 PORTFOLIO PERSISTENCE - Session-based paper trading portfolio management
// Handles user sessions, portfolio data persistence, and long-term tracking

import { BrokerAPI, BrokerPosition, PaperTradeOrder } from './broker-integrations'

interface User {
  id: string
  email: string
  username: string
  created_at: Date
  subscription_tier: 'free' | 'premium' | 'pro'
  preferences: UserPreferences
}

interface UserPreferences {
  defaultBroker: string
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
  notifications: boolean
  theme: 'dark' | 'light'
  autoSave: boolean
}

interface PersistentPortfolio {
  id: string
  userId: string
  brokerId: string
  name: string
  description: string
  initialBalance: number
  currentBalance: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  positions: PersistentPosition[]
  trades: PersistentTrade[]
  performance: PerformanceMetrics[]
  created_at: Date
  updated_at: Date
  isActive: boolean
  settings: PortfolioSettings
}

interface PersistentPosition {
  id: string
  portfolioId: string
  symbol: string
  quantity: number
  avgCost: number
  currentPrice: number
  marketValue: number
  unrealizedPL: number
  unrealizedPLPercent: number
  dayChange: number
  side: 'long' | 'short'
  openDate: Date
  updated_at: Date
  notes?: string
  tags: string[]
}

interface PersistentTrade {
  id: string
  portfolioId: string
  orderId: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  fees: number
  total: number
  orderType: string
  status: 'filled' | 'partial' | 'cancelled' | 'pending'
  executedAt: Date
  strategy?: string
  notes?: string
  signalId?: string // Link to trading signal that generated this trade
}

interface PerformanceMetrics {
  id: string
  portfolioId: string
  date: Date
  portfolioValue: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  sharpeRatio?: number
  maxDrawdown?: number
  winRate?: number
  numTrades: number
  avgTradeSize: number
  largestGain: number
  largestLoss: number
  benchmarkComparison?: BenchmarkComparison
}

interface BenchmarkComparison {
  spy_return: number
  qqq_return: number
  benchmark_outperformance: number
}

interface PortfolioSettings {
  autoRebalance: boolean
  riskLimits: {
    maxPositionSize: number // % of portfolio
    maxDailyLoss: number // % of portfolio
    stopLossDefault: number // %
    takeProfitDefault: number // %
  }
  notifications: {
    orderFills: boolean
    riskAlerts: boolean
    performanceUpdates: boolean
  }
}

interface SessionData {
  user: User
  activePortfolioId?: string
  brokerConnections: { [brokerId: string]: boolean }
  lastActivity: Date
}

// 💾 PORTFOLIO PERSISTENCE SERVICE
export class PortfolioPersistence {
  private db: any // Database connection (PostgreSQL)
  private redis: any // Redis for caching and sessions
  private sessionTTL = 7 * 24 * 60 * 60 // 7 days in seconds

  constructor(dbConnection: any, redisConnection: any) {
    this.db = dbConnection
    this.redis = redisConnection
  }

  // 🔐 USER SESSION MANAGEMENT
  async createUserSession(user: User): Promise<string> {
    const sessionId = this.generateSessionId()
    const sessionData: SessionData = {
      user,
      activePortfolioId: undefined,
      brokerConnections: {},
      lastActivity: new Date()
    }

    await this.redis.setex(
      `session:${sessionId}`,
      this.sessionTTL,
      JSON.stringify(sessionData)
    )

    return sessionId
  }

  async getUserSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await this.redis.get(`session:${sessionId}`)
    if (!sessionData) return null

    const session: SessionData = JSON.parse(sessionData)
    
    // Update last activity
    session.lastActivity = new Date()
    await this.redis.setex(
      `session:${sessionId}`,
      this.sessionTTL,
      JSON.stringify(session)
    )

    return session
  }

  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    const session = await this.getUserSession(sessionId)
    if (!session) throw new Error('Session not found')

    const updatedSession = { ...session, ...updates, lastActivity: new Date() }
    await this.redis.setex(
      `session:${sessionId}`,
      this.sessionTTL,
      JSON.stringify(updatedSession)
    )
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`)
  }

  // 📊 PORTFOLIO MANAGEMENT
  async createPortfolio(
    userId: string, 
    brokerId: string, 
    name: string,
    initialBalance: number,
    settings?: Partial<PortfolioSettings>
  ): Promise<PersistentPortfolio> {
    const portfolioId = this.generateId()
    const defaultSettings: PortfolioSettings = {
      autoRebalance: false,
      riskLimits: {
        maxPositionSize: 20, // 20% max position
        maxDailyLoss: 5, // 5% max daily loss
        stopLossDefault: 10, // 10% stop loss
        takeProfitDefault: 20 // 20% take profit
      },
      notifications: {
        orderFills: true,
        riskAlerts: true,
        performanceUpdates: false
      }
    }

    const portfolio: PersistentPortfolio = {
      id: portfolioId,
      userId,
      brokerId,
      name,
      description: '',
      initialBalance,
      currentBalance: initialBalance,
      totalReturn: 0,
      totalReturnPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      positions: [],
      trades: [],
      performance: [],
      created_at: new Date(),
      updated_at: new Date(),
      isActive: true,
      settings: { ...defaultSettings, ...settings }
    }

    await this.db.query(
      `INSERT INTO portfolios (id, user_id, broker_id, name, initial_balance, current_balance, settings, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        portfolio.id,
        portfolio.userId,
        portfolio.brokerId,
        portfolio.name,
        portfolio.initialBalance,
        portfolio.currentBalance,
        JSON.stringify(portfolio.settings),
        portfolio.created_at,
        portfolio.updated_at
      ]
    )

    // Initial performance snapshot
    await this.recordPerformanceSnapshot(portfolio.id, {
      portfolioValue: initialBalance,
      totalReturn: 0,
      totalReturnPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      numTrades: 0,
      avgTradeSize: 0,
      largestGain: 0,
      largestLoss: 0
    })

    return portfolio
  }

  async getPortfolio(portfolioId: string): Promise<PersistentPortfolio | null> {
    // Try cache first
    const cached = await this.redis.get(`portfolio:${portfolioId}`)
    if (cached) {
      return JSON.parse(cached)
    }

    // Query database
    const portfolioResult = await this.db.query(
      'SELECT * FROM portfolios WHERE id = $1',
      [portfolioId]
    )

    if (portfolioResult.rows.length === 0) return null

    const portfolio = portfolioResult.rows[0]

    // Get positions
    const positionsResult = await this.db.query(
      'SELECT * FROM positions WHERE portfolio_id = $1 AND quantity != 0 ORDER BY updated_at DESC',
      [portfolioId]
    )

    // Get recent trades
    const tradesResult = await this.db.query(
      'SELECT * FROM trades WHERE portfolio_id = $1 ORDER BY executed_at DESC LIMIT 100',
      [portfolioId]
    )

    // Get recent performance
    const performanceResult = await this.db.query(
      'SELECT * FROM performance_snapshots WHERE portfolio_id = $1 ORDER BY date DESC LIMIT 30',
      [portfolioId]
    )

    const fullPortfolio: PersistentPortfolio = {
      id: portfolio.id,
      userId: portfolio.user_id,
      brokerId: portfolio.broker_id,
      name: portfolio.name,
      description: portfolio.description || '',
      initialBalance: parseFloat(portfolio.initial_balance),
      currentBalance: parseFloat(portfolio.current_balance),
      totalReturn: parseFloat(portfolio.total_return || 0),
      totalReturnPercent: parseFloat(portfolio.total_return_percent || 0),
      dayChange: parseFloat(portfolio.day_change || 0),
      dayChangePercent: parseFloat(portfolio.day_change_percent || 0),
      positions: positionsResult.rows.map(this.mapPosition),
      trades: tradesResult.rows.map(this.mapTrade),
      performance: performanceResult.rows.map(this.mapPerformance),
      created_at: new Date(portfolio.created_at),
      updated_at: new Date(portfolio.updated_at),
      isActive: portfolio.is_active,
      settings: portfolio.settings ? JSON.parse(portfolio.settings) : {}
    }

    // Cache for 5 minutes
    await this.redis.setex(`portfolio:${portfolioId}`, 300, JSON.stringify(fullPortfolio))

    return fullPortfolio
  }

  async getUserPortfolios(userId: string): Promise<PersistentPortfolio[]> {
    const result = await this.db.query(
      'SELECT * FROM portfolios WHERE user_id = $1 AND is_active = true ORDER BY updated_at DESC',
      [userId]
    )

    return Promise.all(
      result.rows.map(async (row: any) => {
        const portfolio = await this.getPortfolio(row.id)
        return portfolio!
      })
    )
  }

  // 💰 POSITION MANAGEMENT
  async updatePosition(portfolioId: string, position: PersistentPosition): Promise<void> {
    await this.db.query(
      `INSERT INTO positions (id, portfolio_id, symbol, quantity, avg_cost, current_price, market_value, 
       unrealized_pl, unrealized_pl_percent, day_change, side, open_date, updated_at, notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (portfolio_id, symbol) DO UPDATE SET
       quantity = EXCLUDED.quantity,
       avg_cost = EXCLUDED.avg_cost,
       current_price = EXCLUDED.current_price,
       market_value = EXCLUDED.market_value,
       unrealized_pl = EXCLUDED.unrealized_pl,
       unrealized_pl_percent = EXCLUDED.unrealized_pl_percent,
       day_change = EXCLUDED.day_change,
       updated_at = EXCLUDED.updated_at,
       notes = EXCLUDED.notes,
       tags = EXCLUDED.tags`,
      [
        position.id,
        position.portfolioId,
        position.symbol,
        position.quantity,
        position.avgCost,
        position.currentPrice,
        position.marketValue,
        position.unrealizedPL,
        position.unrealizedPLPercent,
        position.dayChange,
        position.side,
        position.openDate,
        position.updated_at,
        position.notes,
        JSON.stringify(position.tags)
      ]
    )

    // Clear portfolio cache
    await this.redis.del(`portfolio:${portfolioId}`)
  }

  // 📈 TRADE LOGGING
  async logTrade(trade: PersistentTrade): Promise<void> {
    await this.db.query(
      `INSERT INTO trades (id, portfolio_id, order_id, symbol, side, quantity, price, fees, total,
       order_type, status, executed_at, strategy, notes, signal_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        trade.id,
        trade.portfolioId,
        trade.orderId,
        trade.symbol,
        trade.side,
        trade.quantity,
        trade.price,
        trade.fees,
        trade.total,
        trade.orderType,
        trade.status,
        trade.executedAt,
        trade.strategy,
        trade.notes,
        trade.signalId
      ]
    )

    // Clear portfolio cache
    await this.redis.del(`portfolio:${trade.portfolioId}`)
  }

  // 📊 PERFORMANCE TRACKING
  async recordPerformanceSnapshot(portfolioId: string, metrics: Partial<PerformanceMetrics>): Promise<void> {
    const snapshotId = this.generateId()
    const snapshot: PerformanceMetrics = {
      id: snapshotId,
      portfolioId,
      date: new Date(),
      portfolioValue: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      numTrades: 0,
      avgTradeSize: 0,
      largestGain: 0,
      largestLoss: 0,
      ...metrics
    }

    await this.db.query(
      `INSERT INTO performance_snapshots (id, portfolio_id, date, portfolio_value, total_return,
       total_return_percent, day_change, day_change_percent, sharpe_ratio, max_drawdown,
       win_rate, num_trades, avg_trade_size, largest_gain, largest_loss, benchmark_comparison)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        snapshot.id,
        snapshot.portfolioId,
        snapshot.date,
        snapshot.portfolioValue,
        snapshot.totalReturn,
        snapshot.totalReturnPercent,
        snapshot.dayChange,
        snapshot.dayChangePercent,
        snapshot.sharpeRatio,
        snapshot.maxDrawdown,
        snapshot.winRate,
        snapshot.numTrades,
        snapshot.avgTradeSize,
        snapshot.largestGain,
        snapshot.largestLoss,
        snapshot.benchmarkComparison ? JSON.stringify(snapshot.benchmarkComparison) : null
      ]
    )
  }

  async getPerformanceHistory(portfolioId: string, days: number): Promise<PerformanceMetrics[]> {
    const result = await this.db.query(
      'SELECT * FROM performance_snapshots WHERE portfolio_id = $1 AND date >= $2 ORDER BY date ASC',
      [portfolioId, new Date(Date.now() - days * 24 * 60 * 60 * 1000)]
    )

    return result.rows.map(this.mapPerformance)
  }

  // 🛠️ UTILITY METHODS
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 15) + Date.now().toString(36)
  }

  private mapPosition = (row: any): PersistentPosition => ({
    id: row.id,
    portfolioId: row.portfolio_id,
    symbol: row.symbol,
    quantity: parseFloat(row.quantity),
    avgCost: parseFloat(row.avg_cost),
    currentPrice: parseFloat(row.current_price),
    marketValue: parseFloat(row.market_value),
    unrealizedPL: parseFloat(row.unrealized_pl),
    unrealizedPLPercent: parseFloat(row.unrealized_pl_percent),
    dayChange: parseFloat(row.day_change),
    side: row.side,
    openDate: new Date(row.open_date),
    updated_at: new Date(row.updated_at),
    notes: row.notes,
    tags: row.tags ? JSON.parse(row.tags) : []
  })

  private mapTrade = (row: any): PersistentTrade => ({
    id: row.id,
    portfolioId: row.portfolio_id,
    orderId: row.order_id,
    symbol: row.symbol,
    side: row.side,
    quantity: parseFloat(row.quantity),
    price: parseFloat(row.price),
    fees: parseFloat(row.fees || 0),
    total: parseFloat(row.total),
    orderType: row.order_type,
    status: row.status,
    executedAt: new Date(row.executed_at),
    strategy: row.strategy,
    notes: row.notes,
    signalId: row.signal_id
  })

  private mapPerformance = (row: any): PerformanceMetrics => ({
    id: row.id,
    portfolioId: row.portfolio_id,
    date: new Date(row.date),
    portfolioValue: parseFloat(row.portfolio_value),
    totalReturn: parseFloat(row.total_return),
    totalReturnPercent: parseFloat(row.total_return_percent),
    dayChange: parseFloat(row.day_change),
    dayChangePercent: parseFloat(row.day_change_percent),
    sharpeRatio: row.sharpe_ratio ? parseFloat(row.sharpe_ratio) : undefined,
    maxDrawdown: row.max_drawdown ? parseFloat(row.max_drawdown) : undefined,
    winRate: row.win_rate ? parseFloat(row.win_rate) : undefined,
    numTrades: parseInt(row.num_trades),
    avgTradeSize: parseFloat(row.avg_trade_size),
    largestGain: parseFloat(row.largest_gain),
    largestLoss: parseFloat(row.largest_loss),
    benchmarkComparison: row.benchmark_comparison ? JSON.parse(row.benchmark_comparison) : undefined
  })
}

export {
  User,
  UserPreferences,
  PersistentPortfolio,
  PersistentPosition,
  PersistentTrade,
  PerformanceMetrics,
  SessionData,
  PortfolioSettings
}
