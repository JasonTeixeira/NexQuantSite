// 💼 REAL-TIME PORTFOLIO UPDATES - Live portfolio calculations
// Calculates real-time portfolio values, P&L, and risk metrics

import { marketDataStream, MarketUpdate, MarketTick } from './market-data-stream'
import { db } from '@/lib/database/database'

export interface PortfolioSnapshot {
  portfolio_id: number
  timestamp: number
  total_value: number
  cash_balance: number
  positions_value: number
  total_pnl: number
  day_pnl: number
  day_pnl_percent: number
  positions: PositionSnapshot[]
  risk_metrics: RiskSnapshot
}

export interface PositionSnapshot {
  symbol: string
  quantity: number
  avg_price: number
  current_price: number
  market_value: number
  unrealized_pnl: number
  unrealized_pnl_percent: number
  day_change: number
  day_change_percent: number
  weight: number // % of portfolio
}

export interface RiskSnapshot {
  volatility: number
  beta: number
  var_95: number // Value at Risk 95%
  max_drawdown: number
  concentration_risk: number // Largest position %
  sector_exposure: Record<string, number>
}

type PortfolioUpdateHandler = (snapshot: PortfolioSnapshot) => void

interface PortfolioSubscription {
  portfolioId: number
  userId: number
  handler: PortfolioUpdateHandler
  lastUpdate: number
}

export class PortfolioUpdates {
  private subscriptions: Map<number, PortfolioSubscription> = new Map()
  private portfolioCache: Map<number, PortfolioSnapshot> = new Map()
  private marketDataSubscription: (() => void) | null = null
  private updateTimer: NodeJS.Timeout | null = null

  constructor() {
    this.setupMarketDataSubscription()
    this.startPeriodicUpdates()
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  async subscribe(
    portfolioId: number, 
    userId: number, 
    handler: PortfolioUpdateHandler
  ): Promise<void> {
    this.subscriptions.set(portfolioId, {
      portfolioId,
      userId,
      handler,
      lastUpdate: 0
    })

    // Get initial portfolio data and subscribe to symbols
    await this.initializePortfolio(portfolioId, userId)
    
    // Send initial snapshot
    const snapshot = await this.calculatePortfolioSnapshot(portfolioId, userId)
    if (snapshot) {
      this.portfolioCache.set(portfolioId, snapshot)
      handler(snapshot)
    }
  }

  unsubscribe(portfolioId: number): void {
    this.subscriptions.delete(portfolioId)
    this.portfolioCache.delete(portfolioId)
    
    // If no more subscriptions, we could unsubscribe from market data
    // but keeping it active for performance
  }

  // ============================================================================
  // MARKET DATA INTEGRATION
  // ============================================================================

  private setupMarketDataSubscription(): void {
    this.marketDataSubscription = marketDataStream.onMarketUpdate((update) => {
      this.handleMarketUpdate(update)
    })
  }

  private async initializePortfolio(portfolioId: number, userId: number): Promise<void> {
    try {
      // Get portfolio positions from database
      const positions = await db.getPortfolioPositions(portfolioId)
      
      if (positions.length > 0) {
        const symbols = positions.map(p => p.symbol)
        
        // Subscribe to market data for these symbols
        await marketDataStream.subscribe(symbols)
        
        console.log(`📊 Subscribed to market data for portfolio ${portfolioId}:`, symbols)
      }
    } catch (error) {
      console.error('Error initializing portfolio:', error)
    }
  }

  private handleMarketUpdate(update: MarketUpdate): void {
    // Find all subscriptions that have this symbol
    const affectedPortfolios = new Set<number>()
    
    for (const [portfolioId, subscription] of this.subscriptions) {
      const cachedSnapshot = this.portfolioCache.get(portfolioId)
      if (cachedSnapshot) {
        const hasPosition = cachedSnapshot.positions.some(p => 
          p.symbol === update.symbol
        )
        if (hasPosition) {
          affectedPortfolios.add(portfolioId)
        }
      }
    }

    // Update affected portfolios
    for (const portfolioId of affectedPortfolios) {
      this.updatePortfolioFromMarketData(portfolioId, update)
    }
  }

  // ============================================================================
  // PORTFOLIO CALCULATIONS
  // ============================================================================

  private async updatePortfolioFromMarketData(
    portfolioId: number, 
    update: MarketUpdate
  ): Promise<void> {
    const subscription = this.subscriptions.get(portfolioId)
    if (!subscription) return

    try {
      const snapshot = await this.calculatePortfolioSnapshot(
        portfolioId, 
        subscription.userId
      )
      
      if (snapshot) {
        this.portfolioCache.set(portfolioId, snapshot)
        subscription.handler(snapshot)
        subscription.lastUpdate = Date.now()
      }
    } catch (error) {
      console.error('Error updating portfolio:', error)
    }
  }

  private async calculatePortfolioSnapshot(
    portfolioId: number, 
    userId: number
  ): Promise<PortfolioSnapshot | null> {
    try {
      // Get portfolio data from database
      const portfolios = await db.getUserPortfolios(userId)
      const portfolio = portfolios.find(p => p.id === portfolioId)
      
      if (!portfolio) return null

      // Get positions
      const positions = await db.getPortfolioPositions(portfolioId)
      
      // Calculate position snapshots with live prices
      const positionSnapshots: PositionSnapshot[] = []
      let totalPositionsValue = 0

      for (const position of positions) {
        const livePrice = marketDataStream.getLastPrice(position.symbol)
        const currentPrice = livePrice?.price || position.current_price || position.avg_price
        
        const marketValue = position.quantity * currentPrice
        const unrealizedPnl = marketValue - (position.quantity * position.avg_price)
        const unrealizedPnlPercent = ((currentPrice - position.avg_price) / position.avg_price) * 100
        
        // Calculate day change
        const dayChange = livePrice?.change || 0
        const dayChangePercent = livePrice?.changePercent || 0

        const positionSnapshot: PositionSnapshot = {
          symbol: position.symbol,
          quantity: position.quantity,
          avg_price: position.avg_price,
          current_price: currentPrice,
          market_value: marketValue,
          unrealized_pnl: unrealizedPnl,
          unrealized_pnl_percent: unrealizedPnlPercent,
          day_change: dayChange * position.quantity,
          day_change_percent: dayChangePercent,
          weight: 0 // Will be calculated after we know total value
        }

        positionSnapshots.push(positionSnapshot)
        totalPositionsValue += marketValue
      }

      // Calculate portfolio totals
      const totalValue = totalPositionsValue + portfolio.cash_balance
      const totalPnl = totalValue - portfolio.initial_capital
      const dayPnl = positionSnapshots.reduce((sum, pos) => sum + pos.day_change, 0)
      const dayPnlPercent = totalValue > 0 ? (dayPnl / totalValue) * 100 : 0

      // Calculate position weights
      positionSnapshots.forEach(pos => {
        pos.weight = totalValue > 0 ? (pos.market_value / totalValue) * 100 : 0
      })

      // Calculate risk metrics
      const riskMetrics = await this.calculateRiskMetrics(
        positionSnapshots, 
        totalValue, 
        portfolio
      )

      const snapshot: PortfolioSnapshot = {
        portfolio_id: portfolioId,
        timestamp: Date.now(),
        total_value: totalValue,
        cash_balance: portfolio.cash_balance,
        positions_value: totalPositionsValue,
        total_pnl: totalPnl,
        day_pnl: dayPnl,
        day_pnl_percent: dayPnlPercent,
        positions: positionSnapshots,
        risk_metrics: riskMetrics
      }

      return snapshot

    } catch (error) {
      console.error('Error calculating portfolio snapshot:', error)
      return null
    }
  }

  private async calculateRiskMetrics(
    positions: PositionSnapshot[], 
    totalValue: number,
    portfolio: any
  ): Promise<RiskSnapshot> {
    // Simplified risk calculations - in production you'd use more sophisticated models
    
    // Concentration risk (largest position weight)
    const concentrationRisk = positions.length > 0 
      ? Math.max(...positions.map(p => p.weight))
      : 0

    // Portfolio volatility (simplified using position volatilities)
    let portfolioVolatility = 0
    for (const position of positions) {
      const positionVol = Math.abs(position.unrealized_pnl_percent) / 100
      const weight = position.weight / 100
      portfolioVolatility += (weight * positionVol) ** 2
    }
    portfolioVolatility = Math.sqrt(portfolioVolatility)

    // Value at Risk (95% confidence, 1-day horizon)
    const var95 = totalValue * portfolioVolatility * 1.65 // 95% percentile

    // Sector exposure (simplified - would need sector mapping in production)
    const sectorExposure: Record<string, number> = {
      'Technology': positions
        .filter(p => ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(p.symbol))
        .reduce((sum, p) => sum + p.weight, 0),
      'Other': positions
        .filter(p => !['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(p.symbol))
        .reduce((sum, p) => sum + p.weight, 0)
    }

    return {
      volatility: portfolioVolatility * 100, // Convert to percentage
      beta: 1.0, // Would calculate against benchmark in production
      var_95: var95,
      max_drawdown: 0, // Would need historical data
      concentration_risk: concentrationRisk,
      sector_exposure: sectorExposure
    }
  }

  // ============================================================================
  // PERIODIC UPDATES
  // ============================================================================

  private startPeriodicUpdates(): void {
    // Update portfolios every 5 seconds even without market data changes
    // This ensures we don't miss any updates
    this.updateTimer = setInterval(() => {
      this.performPeriodicUpdate()
    }, 5000)
  }

  private async performPeriodicUpdate(): Promise<void> {
    const now = Date.now()
    const staleThreshold = 10000 // 10 seconds

    for (const [portfolioId, subscription] of this.subscriptions) {
      // Only update if we haven't updated recently
      if (now - subscription.lastUpdate > staleThreshold) {
        await this.updatePortfolioFromMarketData(portfolioId, {
          type: 'tick',
          symbol: 'PERIODIC_UPDATE',
          data: {} as MarketTick,
          timestamp: now
        })
      }
    }
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  getLatestSnapshot(portfolioId: number): PortfolioSnapshot | null {
    return this.portfolioCache.get(portfolioId) || null
  }

  getAllSnapshots(): Record<number, PortfolioSnapshot> {
    const snapshots: Record<number, PortfolioSnapshot> = {}
    this.portfolioCache.forEach((snapshot, portfolioId) => {
      snapshots[portfolioId] = snapshot
    })
    return snapshots
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size
  }

  isSubscribed(portfolioId: number): boolean {
    return this.subscriptions.has(portfolioId)
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    if (this.marketDataSubscription) {
      this.marketDataSubscription()
      this.marketDataSubscription = null
    }

    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }

    this.subscriptions.clear()
    this.portfolioCache.clear()
  }
}

// Singleton instance
export const portfolioUpdates = new PortfolioUpdates()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    portfolioUpdates.destroy()
  })
}

export default portfolioUpdates
