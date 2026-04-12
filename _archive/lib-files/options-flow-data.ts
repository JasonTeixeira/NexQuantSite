// Options Flow Data Processing & Smart Money Detection
// Institutional-Grade Algorithms for Real-time Flow Analysis

export interface OptionsFlow {
  id: string
  symbol: string
  strike: number
  expiry: string
  type: 'call' | 'put'
  side: 'buy' | 'sell'
  size: number
  premium: number
  iv: number
  delta: number
  gamma: number
  theta: number
  vega: number
  timestamp: Date
  smartMoneyScore: number
  venue: string
  isUnusual: boolean
  flowType: 'sweep' | 'block' | 'split' | 'single'
  bidAskSpread: number
  timeToExpiry: number
  underlyingPrice: number
  institutionProbability: number
}

export interface SmartMoneyMetrics {
  institutionalFlowRatio: number
  darkPoolCorrelation: number
  volumeWeightedPremium: number
  gammaImbalance: number
  orderFlowImbalance: number
  smartMoneyDirection: 'bullish' | 'bearish' | 'neutral'
  confidenceLevel: number
}

export interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral'
  strength: number
  volatilityTrend: 'rising' | 'falling' | 'stable'
  institutionalActivity: 'high' | 'medium' | 'low'
  retailActivity: 'high' | 'medium' | 'low'
  predictedDirection: 'up' | 'down' | 'sideways'
  timeHorizon: '1h' | '4h' | '1d' | '1w'
}

// Proprietary Smart Money Detection Algorithm
export class SmartMoneyDetector {
  private static readonly INSTITUTION_THRESHOLDS = {
    minSize: 500,          // Minimum contract size
    minPremium: 50000,     // Minimum premium ($50k)
    maxSpread: 0.05,       // Maximum bid-ask spread (5%)
    minTimeDecay: 0.1,     // Minimum time to expiry (10% of year)
    darkPoolThreshold: 0.7 // Dark pool correlation threshold
  }

  static calculateSmartMoneyScore(flow: Partial<OptionsFlow>): number {
    let score = 0
    const weights = {
      size: 0.25,
      premium: 0.20,
      spread: 0.15,
      timing: 0.15,
      venue: 0.10,
      flow_pattern: 0.15
    }

    // Size Score (0-100)
    if (flow.size) {
      const sizeScore = Math.min(100, (flow.size / 10000) * 100)
      score += sizeScore * weights.size
    }

    // Premium Score (0-100)
    if (flow.premium && flow.size) {
      const totalPremium = flow.premium * flow.size
      const premiumScore = Math.min(100, (totalPremium / 1000000) * 100)
      score += premiumScore * weights.premium
    }

    // Bid-Ask Spread Score (lower spread = higher institution probability)
    if (flow.bidAskSpread) {
      const spreadScore = Math.max(0, 100 - (flow.bidAskSpread * 2000))
      score += spreadScore * weights.spread
    }

    // Timing Score (institutions prefer longer expiries)
    if (flow.timeToExpiry) {
      const timingScore = Math.min(100, flow.timeToExpiry * 400)
      score += timingScore * weights.timing
    }

    // Venue Score (some venues more institutional)
    if (flow.venue) {
      const venueScores: { [key: string]: number } = {
        'CBOE': 95,
        'NASDAQ': 90,
        'NYSE': 90,
        'MIAX': 85,
        'PHLX': 80
      }
      score += (venueScores[flow.venue] || 70) * weights.venue
    }

    // Flow Pattern Score
    if (flow.flowType) {
      const patternScores = {
        'sweep': 95,    // High institution probability
        'block': 90,    // High institution probability  
        'split': 70,    // Medium probability
        'single': 50    // Lower probability
      }
      score += patternScores[flow.flowType] * weights.flow_pattern
    }

    return Math.round(Math.min(100, Math.max(0, score)))
  }

  static analyzeFlowPattern(flows: OptionsFlow[]): SmartMoneyMetrics {
    const institutionalFlows = flows.filter(f => f.smartMoneyScore > 70)
    const totalFlows = flows.length

    const institutionalFlowRatio = totalFlows > 0 ? institutionalFlows.length / totalFlows : 0

    // Calculate volume-weighted premium
    const totalPremium = flows.reduce((sum, f) => sum + (f.size * f.premium), 0)
    const totalSize = flows.reduce((sum, f) => sum + f.size, 0)
    const volumeWeightedPremium = totalSize > 0 ? totalPremium / totalSize : 0

    // Gamma imbalance calculation
    const callGamma = flows.filter(f => f.type === 'call').reduce((sum, f) => sum + f.gamma * f.size, 0)
    const putGamma = flows.filter(f => f.type === 'put').reduce((sum, f) => sum + f.gamma * f.size, 0)
    const gammaImbalance = (callGamma - putGamma) / Math.max(callGamma + putGamma, 1)

    // Order flow imbalance
    const buyVolume = flows.filter(f => f.side === 'buy').reduce((sum, f) => sum + f.size, 0)
    const sellVolume = flows.filter(f => f.side === 'sell').reduce((sum, f) => sum + f.size, 0)
    const orderFlowImbalance = (buyVolume - sellVolume) / Math.max(buyVolume + sellVolume, 1)

    // Smart money direction
    const institutionalBias = institutionalFlows.reduce((bias, f) => {
      const flowValue = (f.type === 'call' ? 1 : -1) * (f.side === 'buy' ? 1 : -1) * f.size
      return bias + flowValue
    }, 0)

    const smartMoneyDirection = institutionalBias > 1000 ? 'bullish' : 
                               institutionalBias < -1000 ? 'bearish' : 'neutral'

    return {
      institutionalFlowRatio,
      darkPoolCorrelation: Math.random() * 0.3 + 0.7, // Mock correlation
      volumeWeightedPremium,
      gammaImbalance,
      orderFlowImbalance,
      smartMoneyDirection,
      confidenceLevel: institutionalFlowRatio * 100
    }
  }

  static predictMarketSentiment(flows: OptionsFlow[]): MarketSentiment {
    const metrics = this.analyzeFlowPattern(flows)
    
    // Determine overall sentiment based on multiple factors
    let bullishSignals = 0
    let bearishSignals = 0

    // Smart money direction
    if (metrics.smartMoneyDirection === 'bullish') bullishSignals += 2
    if (metrics.smartMoneyDirection === 'bearish') bearishSignals += 2

    // Gamma imbalance
    if (metrics.gammaImbalance > 0.1) bullishSignals += 1
    if (metrics.gammaImbalance < -0.1) bearishSignals += 1

    // Order flow imbalance
    if (metrics.orderFlowImbalance > 0.1) bullishSignals += 1
    if (metrics.orderFlowImbalance < -0.1) bearishSignals += 1

    // Institutional activity level
    const institutionalActivity = metrics.institutionalFlowRatio > 0.4 ? 'high' :
                                 metrics.institutionalFlowRatio > 0.2 ? 'medium' : 'low'

    const overall = bullishSignals > bearishSignals ? 'bullish' :
                    bearishSignals > bullishSignals ? 'bearish' : 'neutral'

    const strength = Math.abs(bullishSignals - bearishSignals) * 20

    return {
      overall,
      strength,
      volatilityTrend: Math.random() > 0.6 ? 'rising' : Math.random() > 0.3 ? 'falling' : 'stable',
      institutionalActivity,
      retailActivity: institutionalActivity === 'high' ? 'low' : 'medium',
      predictedDirection: overall === 'bullish' ? 'up' : overall === 'bearish' ? 'down' : 'sideways',
      timeHorizon: '4h'
    }
  }
}

// Real-time Data Generator (Mock)
export class OptionsFlowGenerator {
  private static readonly SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'SPY', 'QQQ', 'IWM',
    'NFLX', 'AMD', 'CRM', 'ORCL', 'INTC', 'PYPL', 'ADBE', 'UBER', 'SNAP', 'TWTR'
  ]
  
  private static readonly VENUES = ['CBOE', 'NASDAQ', 'NYSE', 'MIAX', 'PHLX', 'BOX', 'ISE']
  
  private static readonly FLOW_TYPES: Array<'sweep' | 'block' | 'split' | 'single'> = 
    ['sweep', 'block', 'split', 'single']

  static generateRealtimeFlow(count: number = 10): OptionsFlow[] {
    return Array.from({ length: count }, () => this.generateSingleFlow())
  }

  private static generateSingleFlow(): OptionsFlow {
    const symbol = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)]
    const isCall = Math.random() > 0.45
    const isBuy = Math.random() > 0.35
    const flowType = this.FLOW_TYPES[Math.floor(Math.random() * this.FLOW_TYPES.length)]
    
    // Generate size based on flow type (institutions prefer larger sizes)
    const baseSize = flowType === 'sweep' || flowType === 'block' ? 
      Math.floor(Math.random() * 5000) + 500 :
      Math.floor(Math.random() * 1000) + 50

    const size = Math.max(1, baseSize)
    const strike = Math.floor(Math.random() * 300) + 50
    const underlyingPrice = strike + (Math.random() - 0.5) * 40
    const premium = Math.max(0.01, Math.random() * 25 + 0.5)
    const timeToExpiry = Math.random() * 0.5 + 0.01 // 1% to 51% of year
    const bidAskSpread = Math.random() * 0.1 + 0.01
    
    // Generate Greeks
    const delta = isCall ? Math.random() * 0.8 + 0.1 : -(Math.random() * 0.8 + 0.1)
    const gamma = Math.random() * 0.05 + 0.001
    const theta = -(Math.random() * 0.1 + 0.01)
    const vega = Math.random() * 0.3 + 0.05
    const iv = Math.random() * 80 + 20

    const flow: OptionsFlow = {
      id: `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      strike,
      expiry: '2024-03-15', // Mock expiry
      type: isCall ? 'call' : 'put',
      side: isBuy ? 'buy' : 'sell',
      size,
      premium,
      iv,
      delta,
      gamma,
      theta,
      vega,
      timestamp: new Date(),
      smartMoneyScore: 0, // Will be calculated
      venue: this.VENUES[Math.floor(Math.random() * this.VENUES.length)],
      isUnusual: false, // Will be determined
      flowType,
      bidAskSpread,
      timeToExpiry,
      underlyingPrice,
      institutionProbability: 0 // Will be calculated
    }

    // Calculate smart money score
    flow.smartMoneyScore = SmartMoneyDetector.calculateSmartMoneyScore(flow)
    flow.institutionProbability = flow.smartMoneyScore / 100
    flow.isUnusual = flow.smartMoneyScore > 75 || flow.size > 1000 || 
                     (flow.size * flow.premium) > 100000

    return flow
  }

  static generateUnusualActivity(symbols: string[]): any[] {
    return symbols.map(symbol => {
      const callVolume = Math.floor(Math.random() * 50000) + 5000
      const putVolume = Math.floor(Math.random() * 50000) + 5000
      const totalPremium = Math.random() * 15000000 + 1000000
      
      return {
        symbol,
        totalPremium,
        callVolume,
        putVolume,
        putCallRatio: putVolume / Math.max(callVolume, 1),
        ivRank: Math.random() * 100,
        smartMoneyFlow: (Math.random() - 0.5) * 5000000,
        sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral',
        confidence: Math.random() * 30 + 70,
        unusualActivityScore: Math.random() * 40 + 60,
        institutionalRatio: Math.random() * 0.4 + 0.3
      }
    })
  }
}
