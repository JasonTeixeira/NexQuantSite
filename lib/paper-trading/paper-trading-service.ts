// 🎯 PAPER TRADING SERVICE - Complete paper trading orchestration
// Combines broker integrations, portfolio persistence, and real-time updates

import { BrokerAPI, BrokerFactory, PAPER_TRADING_BROKERS, PaperTradeOrder } from './broker-integrations'
import { 
  PortfolioPersistence, 
  PersistentPortfolio, 
  PersistentPosition, 
  PersistentTrade, 
  SessionData,
  User
} from './portfolio-persistence'

interface PaperTradingConfig {
  dbConnection: any
  redisConnection: any
  marketDataService: any
  notificationService?: any
}

interface TradeRequest {
  portfolioId: string
  symbol: string
  action: 'buy' | 'sell'
  quantity: number
  orderType: 'market' | 'limit'
  limitPrice?: number
  notes?: string
  strategy?: string
  signalId?: string
}

interface PortfolioSummary {
  id: string
  name: string
  broker: string
  balance: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  positionCount: number
  lastUpdated: Date
}

export class PaperTradingService {
  private persistence: PortfolioPersistence
  private activeBrokers: Map<string, BrokerAPI> = new Map()
  private marketDataService: any
  private notificationService?: any
  
  // Real-time update intervals
  private portfolioUpdateInterval?: NodeJS.Timeout
  private performanceTrackingInterval?: NodeJS.Timeout

  constructor(config: PaperTradingConfig) {
    this.persistence = new PortfolioPersistence(config.dbConnection, config.redisConnection)
    this.marketDataService = config.marketDataService
    this.notificationService = config.notificationService
    
    // Start background services
    this.startRealtimeUpdates()
  }

  // 🔐 USER SESSION MANAGEMENT
  async authenticateUser(email: string, password: string): Promise<{ user: User; sessionId: string } | null> {
    // In a real implementation, this would validate against your auth system
    // For now, return a mock user for demonstration
    const user: User = {
      id: 'user_' + Date.now(),
      email,
      username: email.split('@')[0],
      created_at: new Date(),
      subscription_tier: 'free',
      preferences: {
        defaultBroker: 'alpaca',
        riskLevel: 'moderate',
        notifications: true,
        theme: 'dark',
        autoSave: true
      }
    }

    const sessionId = await this.persistence.createUserSession(user)
    return { user, sessionId }
  }

  async getUserSession(sessionId: string): Promise<SessionData | null> {
    return await this.persistence.getUserSession(sessionId)
  }

  async logout(sessionId: string): Promise<void> {
    // Disconnect all brokers for this session
    const session = await this.getUserSession(sessionId)
    if (session && session.activePortfolioId) {
      const portfolio = await this.persistence.getPortfolio(session.activePortfolioId)
      if (portfolio) {
        const brokerKey = `${session.user.id}:${portfolio.brokerId}`
        const broker = this.activeBrokers.get(brokerKey)
        if (broker) {
          await broker.disconnect()
          this.activeBrokers.delete(brokerKey)
        }
      }
    }

    await this.persistence.destroySession(sessionId)
  }

  // 🏦 BROKER MANAGEMENT
  async connectBroker(sessionId: string, brokerId: string, apiKey?: string): Promise<boolean> {
    const session = await this.getUserSession(sessionId)
    if (!session) throw new Error('Invalid session')

    try {
      const broker = BrokerFactory.createBroker(brokerId, apiKey)
      const connected = await broker.connect()
      
      if (connected) {
        const brokerKey = `${session.user.id}:${brokerId}`
        this.activeBrokers.set(brokerKey, broker)
        
        // Update session
        await this.persistence.updateSession(sessionId, {
          brokerConnections: {
            ...session.brokerConnections,
            [brokerId]: true
          }
        })
      }

      return connected
    } catch (error) {
      console.error(`Failed to connect to ${brokerId}:`, error)
      return false
    }
  }

  async getBrokerConnection(userId: string, brokerId: string): Promise<BrokerAPI | null> {
    const brokerKey = `${userId}:${brokerId}`
    return this.activeBrokers.get(brokerKey) || null
  }

  getAvailableBrokers() {
    return BrokerFactory.getAvailableBrokers()
  }

  // 📊 PORTFOLIO MANAGEMENT
  async createPortfolio(
    sessionId: string,
    brokerId: string,
    name: string,
    initialBalance: number
  ): Promise<PersistentPortfolio> {
    const session = await this.getUserSession(sessionId)
    if (!session) throw new Error('Invalid session')

    // Ensure broker is connected
    const broker = await this.getBrokerConnection(session.user.id, brokerId)
    if (!broker) {
      throw new Error(`Not connected to ${brokerId}. Please connect first.`)
    }

    const portfolio = await this.persistence.createPortfolio(
      session.user.id,
      brokerId,
      name,
      initialBalance
    )

    // Set as active portfolio
    await this.persistence.updateSession(sessionId, {
      activePortfolioId: portfolio.id
    })

    return portfolio
  }

  async getPortfolio(portfolioId: string): Promise<PersistentPortfolio | null> {
    return await this.persistence.getPortfolio(portfolioId)
  }

  async getUserPortfolios(sessionId: string): Promise<PortfolioSummary[]> {
    const session = await this.getUserSession(sessionId)
    if (!session) throw new Error('Invalid session')

    const portfolios = await this.persistence.getUserPortfolios(session.user.id)
    
    return portfolios.map(p => ({
      id: p.id,
      name: p.name,
      broker: p.brokerId,
      balance: p.currentBalance,
      totalReturn: p.totalReturn,
      totalReturnPercent: p.totalReturnPercent,
      dayChange: p.dayChange,
      dayChangePercent: p.dayChangePercent,
      positionCount: p.positions.length,
      lastUpdated: p.updated_at
    }))
  }

  async setActivePortfolio(sessionId: string, portfolioId: string): Promise<void> {
    const session = await this.getUserSession(sessionId)
    if (!session) throw new Error('Invalid session')

    const portfolio = await this.persistence.getPortfolio(portfolioId)
    if (!portfolio || portfolio.userId !== session.user.id) {
      throw new Error('Portfolio not found or access denied')
    }

    await this.persistence.updateSession(sessionId, {
      activePortfolioId: portfolioId
    })
  }

  // 💰 TRADING OPERATIONS
  async executePaperTrade(sessionId: string, tradeRequest: TradeRequest): Promise<PersistentTrade> {
    const session = await this.getUserSession(sessionId)
    if (!session) throw new Error('Invalid session')

    const portfolio = await this.persistence.getPortfolio(tradeRequest.portfolioId)
    if (!portfolio || portfolio.userId !== session.user.id) {
      throw new Error('Portfolio not found or access denied')
    }

    // Get broker connection
    const broker = await this.getBrokerConnection(session.user.id, portfolio.brokerId)
    if (!broker) {
      throw new Error(`Broker ${portfolio.brokerId} not connected`)
    }

    // Get current market price
    const currentPrice = await this.marketDataService.getPrice(tradeRequest.symbol)
    if (!currentPrice) {
      throw new Error(`Unable to get price for ${tradeRequest.symbol}`)
    }

    // Prepare broker order
    const brokerOrder: PaperTradeOrder = {
      symbol: tradeRequest.symbol,
      side: tradeRequest.action,
      quantity: tradeRequest.quantity,
      orderType: tradeRequest.orderType,
      timeInForce: 'day',
      limitPrice: tradeRequest.limitPrice
    }

    // Execute with broker
    const orderResult = await broker.placeOrder(brokerOrder)

    // Calculate trade details
    const price = tradeRequest.orderType === 'market' ? currentPrice : (tradeRequest.limitPrice || currentPrice)
    const fees = this.calculateFees(portfolio.brokerId, price * tradeRequest.quantity)
    const total = tradeRequest.action === 'buy' 
      ? (price * tradeRequest.quantity) + fees
      : (price * tradeRequest.quantity) - fees

    // Create trade record
    const trade: PersistentTrade = {
      id: this.generateId(),
      portfolioId: tradeRequest.portfolioId,
      orderId: orderResult.orderId,
      symbol: tradeRequest.symbol,
      side: tradeRequest.action,
      quantity: tradeRequest.quantity,
      price: price,
      fees: fees,
      total: total,
      orderType: tradeRequest.orderType,
      status: 'filled', // Paper trading fills immediately
      executedAt: new Date(),
      strategy: tradeRequest.strategy,
      notes: tradeRequest.notes,
      signalId: tradeRequest.signalId
    }

    // Log trade
    await this.persistence.logTrade(trade)

    // Update position
    await this.updatePortfolioPosition(tradeRequest.portfolioId, trade)

    // Send notification if enabled
    if (this.notificationService && portfolio.settings.notifications.orderFills) {
      await this.notificationService.sendTradeNotification(session.user, trade)
    }

    return trade
  }

  async getTradeHistory(portfolioId: string, days: number = 30): Promise<PersistentTrade[]> {
    const portfolio = await this.persistence.getPortfolio(portfolioId)
    if (!portfolio) throw new Error('Portfolio not found')

    return portfolio.trades.filter(trade => {
      const daysAgo = (Date.now() - trade.executedAt.getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo <= days
    })
  }

  // 📈 PERFORMANCE TRACKING
  async getPortfolioPerformance(portfolioId: string, period: string): Promise<any> {
    const days = this.periodToDays(period)
    return await this.persistence.getPerformanceHistory(portfolioId, days)
  }

  async updatePortfolioMetrics(portfolioId: string): Promise<void> {
    const portfolio = await this.persistence.getPortfolio(portfolioId)
    if (!portfolio) return

    // Get current prices for all positions
    const symbols = portfolio.positions.map(p => p.symbol)
    if (symbols.length === 0) return

    const prices = await this.marketDataService.getPrices(symbols)
    
    // Calculate updated metrics
    let totalValue = portfolio.currentBalance // Start with cash
    let totalCost = 0
    let totalUnrealizedPnL = 0
    
    // Update each position
    for (const position of portfolio.positions) {
      const currentPrice = prices[position.symbol] || position.currentPrice
      const marketValue = currentPrice * Math.abs(position.quantity)
      const cost = position.avgCost * Math.abs(position.quantity)
      const unrealizedPnL = position.side === 'long' 
        ? (marketValue - cost)
        : (cost - marketValue)
      
      totalValue += marketValue
      totalCost += cost
      totalUnrealizedPnL += unrealizedPnL

      // Update position in database
      const updatedPosition: PersistentPosition = {
        ...position,
        currentPrice,
        marketValue,
        unrealizedPnL,
        unrealizedPnLPercent: ((currentPrice - position.avgCost) / position.avgCost) * 100,
        updated_at: new Date()
      }

      await this.persistence.updatePosition(portfolioId, updatedPosition)
    }

    // Calculate portfolio-level metrics
    const totalReturn = totalValue - portfolio.initialBalance
    const totalReturnPercent = (totalReturn / portfolio.initialBalance) * 100

    // Record performance snapshot
    await this.persistence.recordPerformanceSnapshot(portfolioId, {
      portfolioValue: totalValue,
      totalReturn,
      totalReturnPercent,
      dayChange: 0, // Would calculate from previous day
      dayChangePercent: 0,
      numTrades: portfolio.trades.length,
      avgTradeSize: portfolio.trades.reduce((sum, t) => sum + t.total, 0) / Math.max(1, portfolio.trades.length),
      largestGain: Math.max(...portfolio.trades.map(t => t.side === 'sell' ? t.total : 0)),
      largestLoss: Math.min(...portfolio.trades.map(t => t.side === 'buy' ? -t.total : 0))
    })
  }

  // 🔄 REAL-TIME UPDATES
  private startRealtimeUpdates(): void {
    // Update portfolios every 30 seconds
    this.portfolioUpdateInterval = setInterval(async () => {
      await this.updateAllActivePortfolios()
    }, 30000)

    // Record performance snapshots every hour
    this.performanceTrackingInterval = setInterval(async () => {
      await this.recordPerformanceSnapshots()
    }, 60 * 60 * 1000)
  }

  private async updateAllActivePortfolios(): Promise<void> {
    // Get all active portfolios and update their metrics
    // This would be optimized to only update recently accessed portfolios
  }

  private async recordPerformanceSnapshots(): Promise<void> {
    // Record hourly performance snapshots for all active portfolios
  }

  // 🛠️ UTILITY METHODS
  private async updatePortfolioPosition(portfolioId: string, trade: PersistentTrade): Promise<void> {
    const portfolio = await this.persistence.getPortfolio(portfolioId)
    if (!portfolio) return

    const existingPosition = portfolio.positions.find(p => p.symbol === trade.symbol)
    const currentPrice = await this.marketDataService.getPrice(trade.symbol) || trade.price

    if (existingPosition) {
      // Update existing position
      const totalQuantity = existingPosition.quantity + (trade.side === 'buy' ? trade.quantity : -trade.quantity)
      const totalCost = (existingPosition.avgCost * Math.abs(existingPosition.quantity)) + 
                       (trade.side === 'buy' ? trade.total : -trade.total)
      const avgCost = totalCost / Math.abs(totalQuantity)

      const updatedPosition: PersistentPosition = {
        ...existingPosition,
        quantity: totalQuantity,
        avgCost: Math.abs(totalQuantity) > 0 ? avgCost : 0,
        currentPrice,
        marketValue: currentPrice * Math.abs(totalQuantity),
        unrealizedPnL: (currentPrice - avgCost) * Math.abs(totalQuantity) * (totalQuantity >= 0 ? 1 : -1),
        unrealizedPnLPercent: avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0,
        updated_at: new Date()
      }

      await this.persistence.updatePosition(portfolioId, updatedPosition)
    } else {
      // Create new position
      const newPosition: PersistentPosition = {
        id: this.generateId(),
        portfolioId,
        symbol: trade.symbol,
        quantity: trade.side === 'buy' ? trade.quantity : -trade.quantity,
        avgCost: trade.price,
        currentPrice,
        marketValue: currentPrice * trade.quantity,
        unrealizedPnL: (currentPrice - trade.price) * trade.quantity,
        unrealizedPnLPercent: ((currentPrice - trade.price) / trade.price) * 100,
        dayChange: 0,
        side: trade.side === 'buy' ? 'long' : 'short',
        openDate: new Date(),
        updated_at: new Date(),
        tags: []
      }

      await this.persistence.updatePosition(portfolioId, newPosition)
    }
  }

  private calculateFees(brokerId: string, tradeValue: number): number {
    const broker = PAPER_TRADING_BROKERS.find(b => b.id === brokerId)
    if (!broker) return 0

    // Simulate realistic fees based on broker
    switch (brokerId) {
      case 'alpaca':
      case 'webull':
        return 0 // Commission-free
      case 'interactive_brokers':
        return Math.max(1, tradeValue * 0.005) // $0.005 per share, $1 minimum
      case 'td_ameritrade':
        return 0.65 // $0.65 per options contract, $0 for stocks
      default:
        return 0
    }
  }

  private periodToDays(period: string): number {
    switch (period.toLowerCase()) {
      case '1d': return 1
      case '1w': return 7
      case '1m': return 30
      case '3m': return 90
      case '6m': return 180
      case '1y': return 365
      default: return 30
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  // Cleanup on shutdown
  async shutdown(): Promise<void> {
    if (this.portfolioUpdateInterval) {
      clearInterval(this.portfolioUpdateInterval)
    }
    if (this.performanceTrackingInterval) {
      clearInterval(this.performanceTrackingInterval)
    }

    // Disconnect all brokers
    for (const broker of this.activeBrokers.values()) {
      await broker.disconnect()
    }
    this.activeBrokers.clear()
  }
}

export { PaperTradingService, TradeRequest, PortfolioSummary }
