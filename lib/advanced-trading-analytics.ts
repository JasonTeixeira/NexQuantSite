interface TradingMetrics {
  profitLoss: number
  winRate: number
  sharpeRatio: number
  maxDrawdown: number
  averageReturn: number
  volatility: number
  beta: number
  alpha: number
}

interface Trade {
  id: string
  symbol: string
  side: "buy" | "sell"
  quantity: number
  price: number
  timestamp: number
  pnl?: number
  fees: number
}

interface PortfolioPosition {
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  unrealizedPnL: number
  realizedPnL: number
  allocation: number
}

export class AdvancedTradingAnalytics {
  private trades: Trade[] = []
  private positions: Map<string, PortfolioPosition> = new Map()
  private benchmarkReturns: number[] = []

  addTrade(trade: Trade): void {
    this.trades.push(trade)
    this.updatePosition(trade)
  }

  private updatePosition(trade: Trade): void {
    const existing = this.positions.get(trade.symbol)

    if (!existing) {
      this.positions.set(trade.symbol, {
        symbol: trade.symbol,
        quantity: trade.side === "buy" ? trade.quantity : -trade.quantity,
        averagePrice: trade.price,
        currentPrice: trade.price,
        unrealizedPnL: 0,
        realizedPnL: 0,
        allocation: 0,
      })
      return
    }

    const newQuantity = existing.quantity + (trade.side === "buy" ? trade.quantity : -trade.quantity)

    if (newQuantity === 0) {
      // Position closed
      const realizedPnL = (trade.price - existing.averagePrice) * Math.abs(existing.quantity)
      existing.realizedPnL += realizedPnL
      existing.quantity = 0
    } else if (Math.sign(newQuantity) === Math.sign(existing.quantity)) {
      // Adding to position
      const totalValue = existing.averagePrice * existing.quantity + trade.price * trade.quantity
      existing.averagePrice = totalValue / newQuantity
      existing.quantity = newQuantity
    } else {
      // Reducing position
      const closedQuantity = Math.min(Math.abs(existing.quantity), trade.quantity)
      const realizedPnL = (trade.price - existing.averagePrice) * closedQuantity
      existing.realizedPnL += realizedPnL
      existing.quantity = newQuantity
    }

    this.positions.set(trade.symbol, existing)
  }

  calculateMetrics(): TradingMetrics {
    const returns = this.calculateReturns()
    const winRate = this.calculateWinRate()
    const sharpeRatio = this.calculateSharpeRatio(returns)
    const maxDrawdown = this.calculateMaxDrawdown(returns)
    const averageReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const volatility = this.calculateVolatility(returns)
    const beta = this.calculateBeta(returns)
    const alpha = this.calculateAlpha(returns, beta)

    return {
      profitLoss: this.calculateTotalPnL(),
      winRate,
      sharpeRatio,
      maxDrawdown,
      averageReturn,
      volatility,
      beta,
      alpha,
    }
  }

  private calculateReturns(): number[] {
    const returns: number[] = []
    let previousValue = 100000 // Starting portfolio value

    this.trades.forEach((trade) => {
      const currentValue = this.calculatePortfolioValue()
      const returnPct = (currentValue - previousValue) / previousValue
      returns.push(returnPct)
      previousValue = currentValue
    })

    return returns
  }

  private calculatePortfolioValue(): number {
    let totalValue = 0

    this.positions.forEach((position) => {
      totalValue += position.quantity * position.currentPrice
    })

    return totalValue
  }

  private calculateTotalPnL(): number {
    let totalPnL = 0

    this.positions.forEach((position) => {
      totalPnL += position.realizedPnL + position.unrealizedPnL
    })

    return totalPnL
  }

  private calculateWinRate(): number {
    const closedTrades = this.trades.filter((trade) => trade.pnl !== undefined)
    const winningTrades = closedTrades.filter((trade) => trade.pnl! > 0)

    return closedTrades.length > 0 ? winningTrades.length / closedTrades.length : 0
  }

  private calculateSharpeRatio(returns: number[]): number {
    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)

    const riskFreeRate = 0.02 / 252 // 2% annual risk-free rate, daily

    return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0
  }

  private calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0
    let peak = 1
    let currentValue = 1

    returns.forEach((ret) => {
      currentValue *= 1 + ret
      if (currentValue > peak) {
        peak = currentValue
      }
      const drawdown = (peak - currentValue) / peak
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    })

    return maxDrawdown
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length

    return Math.sqrt(variance * 252) // Annualized volatility
  }

  private calculateBeta(returns: number[]): number {
    if (returns.length === 0 || this.benchmarkReturns.length === 0) return 1

    const minLength = Math.min(returns.length, this.benchmarkReturns.length)
    const portfolioReturns = returns.slice(-minLength)
    const benchmarkReturns = this.benchmarkReturns.slice(-minLength)

    const avgPortfolioReturn = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length
    const avgBenchmarkReturn = benchmarkReturns.reduce((sum, ret) => sum + ret, 0) / benchmarkReturns.length

    let covariance = 0
    let benchmarkVariance = 0

    for (let i = 0; i < minLength; i++) {
      covariance += (portfolioReturns[i] - avgPortfolioReturn) * (benchmarkReturns[i] - avgBenchmarkReturn)
      benchmarkVariance += Math.pow(benchmarkReturns[i] - avgBenchmarkReturn, 2)
    }

    return benchmarkVariance > 0 ? covariance / benchmarkVariance : 1
  }

  private calculateAlpha(returns: number[], beta: number): number {
    if (returns.length === 0 || this.benchmarkReturns.length === 0) return 0

    const avgPortfolioReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const avgBenchmarkReturn = this.benchmarkReturns.reduce((sum, ret) => sum + ret, 0) / this.benchmarkReturns.length
    const riskFreeRate = 0.02 / 252 // Daily risk-free rate

    return avgPortfolioReturn - (riskFreeRate + beta * (avgBenchmarkReturn - riskFreeRate))
  }

  generateRiskReport(): {
    riskScore: number
    riskFactors: string[]
    recommendations: string[]
    positionSizing: { symbol: string; recommendedSize: number; currentSize: number }[]
  } {
    const metrics = this.calculateMetrics()
    const riskFactors: string[] = []
    const recommendations: string[] = []
    let riskScore = 100

    // Analyze risk factors
    if (metrics.maxDrawdown > 0.2) {
      riskFactors.push("High maximum drawdown detected")
      recommendations.push("Implement stricter stop-loss rules")
      riskScore -= 20
    }

    if (metrics.volatility > 0.3) {
      riskFactors.push("High portfolio volatility")
      recommendations.push("Diversify across more assets or reduce position sizes")
      riskScore -= 15
    }

    if (metrics.sharpeRatio < 1) {
      riskFactors.push("Low risk-adjusted returns")
      recommendations.push("Review trading strategy and risk management")
      riskScore -= 15
    }

    // Check concentration risk
    const totalValue = this.calculatePortfolioValue()
    const concentrationRisk = Array.from(this.positions.values()).filter(
      (pos) => Math.abs(pos.quantity * pos.currentPrice) / totalValue > 0.1,
    )

    if (concentrationRisk.length > 0) {
      riskFactors.push("Portfolio concentration risk")
      recommendations.push("Reduce position sizes in over-concentrated assets")
      riskScore -= 10
    }

    // Generate position sizing recommendations
    const positionSizing = Array.from(this.positions.values()).map((position) => {
      const currentSize = Math.abs(position.quantity * position.currentPrice) / totalValue
      const recommendedSize = Math.min(0.05, currentSize) // Max 5% per position

      return {
        symbol: position.symbol,
        recommendedSize,
        currentSize,
      }
    })

    return {
      riskScore: Math.max(0, riskScore),
      riskFactors,
      recommendations,
      positionSizing,
    }
  }

  getPerformanceScore(): number {
    const metrics = this.calculateMetrics()
    let score = 50 // Base score

    // Scoring based on various metrics
    if (metrics.profitLoss > 0) score += 20
    if (metrics.winRate > 0.6) score += 15
    if (metrics.sharpeRatio > 1.5) score += 15
    if (metrics.maxDrawdown < 0.1) score += 10
    if (metrics.volatility < 0.2) score += 10

    return Math.min(100, Math.max(0, score))
  }

  setBenchmarkReturns(returns: number[]): void {
    this.benchmarkReturns = returns
  }

  updatePositionPrices(prices: Record<string, number>): void {
    this.positions.forEach((position, symbol) => {
      if (prices[symbol]) {
        position.currentPrice = prices[symbol]
        position.unrealizedPnL = (prices[symbol] - position.averagePrice) * position.quantity
      }
    })
  }

  getPositions(): PortfolioPosition[] {
    return Array.from(this.positions.values())
  }

  getTrades(): Trade[] {
    return [...this.trades]
  }
}

export const tradingAnalytics = new AdvancedTradingAnalytics()
