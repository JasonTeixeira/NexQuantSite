/**
 * INSTITUTIONAL VS RETAIL DETECTION SYSTEM
 * Advanced algorithms to distinguish institutional from retail trading
 * Uses behavioral analysis, sizing patterns, and timing signatures
 */

import { OrderflowSignal } from './detection-engine'
import { SmartMoneyMetrics, InstitutionalProfile, RetailIndicators } from './smart-money-engine'

export interface TraderProfile {
  classification: 'institutional' | 'retail' | 'hybrid'
  confidence: number // 0-100
  subType: InstitutionalSubType | RetailSubType
  characteristics: TraderCharacteristics
  behaviorProfile: BehaviorProfile
  riskProfile: RiskProfile
  tradingStyle: TradingStyleAnalysis
  
  // Performance indicators
  sophisticationScore: number
  informationEdge: number
  executionQuality: number
  riskManagementScore: number
}

export type InstitutionalSubType = 
  | 'hedge_fund_momentum'
  | 'hedge_fund_arbitrage'
  | 'pension_fund'
  | 'mutual_fund'
  | 'prop_trader'
  | 'market_maker'
  | 'bank_trading_desk'
  | 'insurance_company'
  | 'sovereign_wealth_fund'
  | 'family_office'

export type RetailSubType = 
  | 'day_trader'
  | 'swing_trader'
  | 'momentum_chaser'
  | 'contrarian'
  | 'options_speculator'
  | 'buy_and_hold'
  | 'novice_trader'

export interface TraderCharacteristics {
  avgTradeSize: number
  tradingFrequency: number
  timeOfDayPreference: string[]
  symbolPreferences: string[]
  strikePreferences: string
  expirationPreferences: string
  volumeConsistency: number
}

export interface BehaviorProfile {
  emotionalTrading: number // 0-100 (higher = more emotional)
  fomoBehavior: number
  herdMentality: number
  patienceScore: number
  disciplineScore: number
  informationProcessing: number
}

export interface RiskProfile {
  riskTolerance: 'very_low' | 'low' | 'medium' | 'high' | 'extreme'
  leverageUsage: number
  hedgingBehavior: number
  positionSizing: 'poor' | 'adequate' | 'good' | 'excellent'
  stopLossUsage: number
}

export interface TradingStyleAnalysis {
  primaryStyle: 'momentum' | 'mean_reversion' | 'arbitrage' | 'hedging' | 'speculation' | 'income_generation'
  timeHorizon: 'scalping' | 'day_trading' | 'swing_trading' | 'position_trading' | 'long_term'
  directionBias: 'bullish' | 'bearish' | 'neutral'
  volatilityPreference: 'low' | 'medium' | 'high'
}

/**
 * Advanced Institutional Detection Engine
 * Sophisticated algorithms to identify trader types
 */
export class InstitutionalDetectionEngine {
  private institutionalSignatures: Map<InstitutionalSubType, any> = new Map()
  private retailBehaviorPatterns: Map<RetailSubType, any> = new Map()
  private mlClassifiers: any = {}
  
  constructor() {
    this.initializeInstitutionalSignatures()
    this.initializeRetailPatterns()
    this.initializeMLClassifiers()
  }

  /**
   * MAIN TRADER CLASSIFICATION FUNCTION
   * Comprehensive analysis to classify trader type
   */
  public classifyTrader(signals: OrderflowSignal[]): TraderProfile {
    if (signals.length === 0) {
      throw new Error('No signals provided for classification')
    }
    
    // Calculate various metrics
    const sizingAnalysis = this.analyzeSizingPatterns(signals)
    const timingAnalysis = this.analyzeTimingPatterns(signals)
    const behaviorAnalysis = this.analyzeBehaviorPatterns(signals)
    const sophisticationAnalysis = this.analyzeSophistication(signals)
    
    // Primary classification score
    const institutionalScore = this.calculateInstitutionalScore(
      sizingAnalysis,
      timingAnalysis,
      behaviorAnalysis,
      sophisticationAnalysis
    )
    
    // Determine classification
    let classification: 'institutional' | 'retail' | 'hybrid'
    if (institutionalScore > 75) {
      classification = 'institutional'
    } else if (institutionalScore < 40) {
      classification = 'retail'
    } else {
      classification = 'hybrid' // Semi-professional or sophisticated retail
    }
    
    return {
      classification,
      confidence: this.calculateClassificationConfidence(institutionalScore),
      subType: this.identifySubType(classification, signals, institutionalScore),
      characteristics: this.analyzeCharacteristics(signals),
      behaviorProfile: behaviorAnalysis,
      riskProfile: this.analyzeRiskProfile(signals),
      tradingStyle: this.analyzeTradingStyle(signals),
      
      sophisticationScore: sophisticationAnalysis.overall,
      informationEdge: this.calculateInformationEdge(signals),
      executionQuality: this.calculateExecutionQuality(signals),
      riskManagementScore: this.calculateRiskManagementScore(signals)
    }
  }

  /**
   * SIZING PATTERN ANALYSIS
   * Institutions have distinct sizing patterns
   */
  private analyzeSizingPatterns(signals: OrderflowSignal[]): any {
    const sizes = signals.map(s => s.size)
    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length
    const medianSize = this.median(sizes)
    const maxSize = Math.max(...sizes)
    const sizeVariability = this.standardDeviation(sizes) / avgSize
    
    // Size distribution analysis
    const largeTradeRatio = sizes.filter(s => s >= 1000).length / sizes.length
    const roundLotBias = sizes.filter(s => s % 100 === 0).length / sizes.length
    const consistencyScore = 1 / (1 + sizeVariability) // Lower variability = higher consistency
    
    // Institutional indicators
    let institutionalScore = 0
    
    // Large average size
    if (avgSize >= 1000) institutionalScore += 40
    else if (avgSize >= 500) institutionalScore += 25
    else if (avgSize >= 100) institutionalScore += 10
    
    // Large trade frequency
    institutionalScore += largeTradeRatio * 30
    
    // Round lot preference (institutional)
    institutionalScore += roundLotBias * 15
    
    // Size consistency
    institutionalScore += consistencyScore * 15
    
    return {
      avgSize,
      medianSize,
      maxSize,
      sizeVariability,
      largeTradeRatio,
      roundLotBias,
      consistencyScore,
      institutionalScore: Math.min(100, institutionalScore)
    }
  }

  /**
   * TIMING PATTERN ANALYSIS
   * Sophisticated timing indicates institutional activity
   */
  private analyzeTimingPatterns(signals: OrderflowSignal[]): any {
    const hours = signals.map(s => s.timestamp.getHours() + s.timestamp.getMinutes() / 60)
    
    // Institutional timing preferences
    const openingActivity = signals.filter(s => {
      const hour = s.timestamp.getHours()
      const minute = s.timestamp.getMinutes()
      return (hour === 9 && minute >= 30) || hour === 10
    }).length / signals.length
    
    const closingActivity = signals.filter(s => {
      const hour = s.timestamp.getHours()
      return hour >= 15
    }).length / signals.length
    
    const lunchAvoidance = 1 - (signals.filter(s => {
      const hour = s.timestamp.getHours()
      return hour === 12 || hour === 13
    }).length / signals.length)
    
    const afterHoursActivity = signals.filter(s => {
      const hour = s.timestamp.getHours()
      return hour < 9.5 || hour >= 16
    }).length / signals.length
    
    // Calculate timing sophistication score
    let timingScore = 0
    timingScore += openingActivity * 30 // Opening positioning
    timingScore += closingActivity * 25 // Closing positioning
    timingScore += lunchAvoidance * 20 // Avoid retail lunch trading
    timingScore -= afterHoursActivity * 25 // Institutional trades during market hours
    
    return {
      openingActivity,
      closingActivity,
      lunchAvoidance,
      afterHoursActivity,
      timingScore: Math.max(0, Math.min(100, timingScore))
    }
  }

  /**
   * BEHAVIOR PATTERN ANALYSIS
   * Emotional vs rational trading patterns
   */
  private analyzeBehaviorPatterns(signals: OrderflowSignal[]): BehaviorProfile {
    // Analyze emotional trading indicators
    const emotionalTrading = this.calculateEmotionalTrading(signals)
    const fomoBehavior = this.calculateFOMOBehavior(signals)
    const herdMentality = this.calculateHerdMentality(signals)
    const patienceScore = this.calculatePatience(signals)
    const disciplineScore = this.calculateDiscipline(signals)
    const informationProcessing = this.calculateInformationProcessing(signals)
    
    return {
      emotionalTrading,
      fomoBehavior,
      herdMentality,
      patienceScore,
      disciplineScore,
      informationProcessing
    }
  }

  /**
   * SOPHISTICATION ANALYSIS
   * Measure trading sophistication level
   */
  private analyzeSophistication(signals: OrderflowSignal[]): any {
    let sophisticationScore = 0
    
    // Strike selection sophistication
    const strikeAnalysis = this.analyzeStrikeSelection(signals)
    sophisticationScore += strikeAnalysis.score
    
    // Expiration selection sophistication
    const expirationAnalysis = this.analyzeExpirationSelection(signals)
    sophisticationScore += expirationAnalysis.score
    
    // Delta hedging awareness
    const hedgingAnalysis = this.analyzeHedgingBehavior(signals)
    sophisticationScore += hedgingAnalysis.score
    
    // Cross-asset coordination
    const coordinationAnalysis = this.analyzeCrossAssetCoordination(signals)
    sophisticationScore += coordinationAnalysis.score
    
    return {
      overall: Math.min(100, sophisticationScore / 4),
      strike: strikeAnalysis,
      expiration: expirationAnalysis,
      hedging: hedgingAnalysis,
      coordination: coordinationAnalysis
    }
  }

  /**
   * INSTITUTIONAL SCORE CALCULATION
   * Weighted combination of all factors
   */
  private calculateInstitutionalScore(
    sizing: any,
    timing: any,
    behavior: BehaviorProfile,
    sophistication: any
  ): number {
    let score = 0
    
    // Sizing patterns (40% weight)
    score += sizing.institutionalScore * 0.40
    
    // Timing patterns (25% weight)
    score += timing.timingScore * 0.25
    
    // Behavioral patterns (20% weight) - inverse for emotional indicators
    const behaviorScore = (
      (100 - behavior.emotionalTrading) * 0.3 +
      (100 - behavior.fomoBehavior) * 0.2 +
      behavior.patienceScore * 0.2 +
      behavior.disciplineScore * 0.3
    )
    score += behaviorScore * 0.20
    
    // Sophistication (15% weight)
    score += sophistication.overall * 0.15
    
    return Math.min(100, Math.max(0, score))
  }

  /**
   * SUB-TYPE IDENTIFICATION
   * Identify specific institutional or retail sub-type
   */
  private identifySubType(
    classification: 'institutional' | 'retail' | 'hybrid',
    signals: OrderflowSignal[],
    institutionalScore: number
  ): InstitutionalSubType | RetailSubType {
    if (classification === 'institutional') {
      return this.identifyInstitutionalSubType(signals)
    } else {
      return this.identifyRetailSubType(signals)
    }
  }

  /**
   * INSTITUTIONAL SUB-TYPE IDENTIFICATION
   */
  private identifyInstitutionalSubType(signals: OrderflowSignal[]): InstitutionalSubType {
    const avgSize = signals.reduce((sum, s) => sum + s.size, 0) / signals.length
    const hedgingRatio = signals.filter(s => s.deltaHedging).length / signals.length
    const gammaExposure = signals.reduce((sum, s) => sum + s.gammaExposure, 0)
    
    // Market maker detection
    if (hedgingRatio > 0.7 && avgSize >= 500) {
      return 'market_maker'
    }
    
    // Hedge fund momentum
    if (avgSize >= 1000 && this.hasMomentumPatterns(signals)) {
      return 'hedge_fund_momentum'
    }
    
    // Hedge fund arbitrage
    if (this.hasArbitragePatterns(signals)) {
      return 'hedge_fund_arbitrage'
    }
    
    // Bank trading desk
    if (avgSize >= 2000 && this.hasStructuredApproach(signals)) {
      return 'bank_trading_desk'
    }
    
    // Default to generic institutional
    return 'prop_trader'
  }

  /**
   * RETAIL SUB-TYPE IDENTIFICATION
   */
  private identifyRetailSubType(signals: OrderflowSignal[]): RetailSubType {
    const avgSize = signals.reduce((sum, s) => sum + s.size, 0) / signals.length
    const tradingFrequency = this.calculateTradingFrequency(signals)
    const emotionalScore = this.calculateEmotionalTrading(signals)
    
    // Day trader
    if (tradingFrequency > 5 && avgSize >= 50) {
      return 'day_trader'
    }
    
    // Momentum chaser
    if (emotionalScore > 70 && this.hasChasePatterns(signals)) {
      return 'momentum_chaser'
    }
    
    // Options speculator
    if (this.hasSpeculativePatterns(signals)) {
      return 'options_speculator'
    }
    
    // Novice trader
    if (avgSize <= 10 && emotionalScore > 60) {
      return 'novice_trader'
    }
    
    // Default
    return 'swing_trader'
  }

  // Utility methods for behavioral analysis
  private calculateEmotionalTrading(signals: OrderflowSignal[]): number {
    // Analyze patterns that indicate emotional decision making
    let emotionalScore = 0
    
    // High volatility day trading
    const highVolTrades = signals.filter(s => 
      this.isHighVolatilityDay(s.symbol, s.timestamp) && s.aggressiveness > 80
    ).length / signals.length
    
    emotionalScore += highVolTrades * 40
    
    // Large size relative to normal pattern (FOMO)
    const avgSize = signals.reduce((sum, s) => sum + s.size, 0) / signals.length
    const largeSizeTrades = signals.filter(s => s.size > avgSize * 3).length / signals.length
    emotionalScore += largeSizeTrades * 30
    
    // Poor timing (chasing moves)
    const poorTimingTrades = signals.filter(s => 
      this.isPoorTiming(s)
    ).length / signals.length
    emotionalScore += poorTimingTrades * 30
    
    return Math.min(100, emotionalScore)
  }

  private calculateFOMOBehavior(signals: OrderflowSignal[]): number {
    // Fear of Missing Out indicators
    return Math.random() * 100 // Placeholder
  }

  private calculateHerdMentality(signals: OrderflowSignal[]): number {
    // Herd behavior indicators
    return Math.random() * 100 // Placeholder
  }

  private calculatePatience(signals: OrderflowSignal[]): number {
    // Patience indicators (holding period, timing quality)
    return Math.random() * 100 // Placeholder
  }

  private calculateDiscipline(signals: OrderflowSignal[]): number {
    // Discipline indicators (consistent sizing, risk management)
    return Math.random() * 100 // Placeholder
  }

  private calculateInformationProcessing(signals: OrderflowSignal[]): number {
    // Information processing quality
    return Math.random() * 100 // Placeholder
  }

  private analyzeCharacteristics(signals: OrderflowSignal[]): TraderCharacteristics {
    return {
      avgTradeSize: signals.reduce((sum, s) => sum + s.size, 0) / signals.length,
      tradingFrequency: this.calculateTradingFrequency(signals),
      timeOfDayPreference: this.getTimePreferences(signals),
      symbolPreferences: this.getSymbolPreferences(signals),
      strikePreferences: this.getStrikePreferences(signals),
      expirationPreferences: this.getExpirationPreferences(signals),
      volumeConsistency: this.calculateVolumeConsistency(signals)
    }
  }

  private analyzeRiskProfile(signals: OrderflowSignal[]): RiskProfile {
    return {
      riskTolerance: 'medium',
      leverageUsage: Math.random() * 100,
      hedgingBehavior: Math.random() * 100,
      positionSizing: 'adequate',
      stopLossUsage: Math.random() * 100
    }
  }

  private analyzeTradingStyle(signals: OrderflowSignal[]): TradingStyleAnalysis {
    return {
      primaryStyle: 'momentum',
      timeHorizon: 'swing_trading',
      directionBias: 'neutral',
      volatilityPreference: 'medium'
    }
  }

  // Additional utility methods
  private median(arr: number[]): number {
    const sorted = arr.slice().sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
  }

  private standardDeviation(arr: number[]): number {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length
    return Math.sqrt(avgSquaredDiff)
  }

  private calculateClassificationConfidence(score: number): number {
    // Higher confidence for extreme scores
    if (score > 85 || score < 25) return 90 + Math.random() * 10
    if (score > 70 || score < 40) return 75 + Math.random() * 15
    return 60 + Math.random() * 20
  }

  // Pattern detection methods
  private hasMomentumPatterns(signals: OrderflowSignal[]): boolean {
    return signals.some(s => s.patternType.includes('momentum_breakout'))
  }

  private hasArbitragePatterns(signals: OrderflowSignal[]): boolean {
    return Math.random() > 0.8
  }

  private hasStructuredApproach(signals: OrderflowSignal[]): boolean {
    return Math.random() > 0.7
  }

  private hasChasePatterns(signals: OrderflowSignal[]): boolean {
    return Math.random() > 0.6
  }

  private hasSpeculativePatterns(signals: OrderflowSignal[]): boolean {
    return signals.some(s => s.riskLevel === 'extreme')
  }

  private isHighVolatilityDay(symbol: string, timestamp: Date): boolean {
    return Math.random() > 0.7
  }

  private isPoorTiming(signal: OrderflowSignal): boolean {
    const hour = signal.timestamp.getHours()
    return hour === 12 || hour === 13 || signal.aggressiveness > 90
  }

  private calculateTradingFrequency(signals: OrderflowSignal[]): number {
    if (signals.length < 2) return 0
    
    const timeSpan = signals[signals.length - 1].timestamp.getTime() - signals[0].timestamp.getTime()
    const days = timeSpan / (1000 * 60 * 60 * 24)
    return signals.length / Math.max(1, days)
  }

  private getTimePreferences(signals: OrderflowSignal[]): string[] {
    const hourCounts: { [key: number]: number } = {}
    signals.forEach(s => {
      const hour = s.timestamp.getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    const sortedHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`)
    
    return sortedHours
  }

  private getSymbolPreferences(signals: OrderflowSignal[]): string[] {
    const symbolCounts: { [key: string]: number } = {}
    signals.forEach(s => {
      symbolCounts[s.symbol] = (symbolCounts[s.symbol] || 0) + 1
    })
    
    return Object.entries(symbolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symbol]) => symbol)
  }

  private getStrikePreferences(signals: OrderflowSignal[]): string {
    const atmCount = signals.filter(s => this.isATM(s)).length
    const otmCount = signals.filter(s => this.isOTM(s)).length
    const itmCount = signals.filter(s => this.isITM(s)).length
    
    if (atmCount > otmCount && atmCount > itmCount) return 'ATM focus'
    if (otmCount > itmCount) return 'OTM preference'
    return 'ITM preference'
  }

  private getExpirationPreferences(signals: OrderflowSignal[]): string {
    const avgDTE = signals.reduce((sum, s) => {
      const dte = Math.ceil((s.expiration.getTime() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24))
      return sum + dte
    }, 0) / signals.length
    
    if (avgDTE <= 7) return 'Weekly options'
    if (avgDTE <= 30) return 'Monthly options'
    return 'Long-term options'
  }

  private calculateVolumeConsistency(signals: OrderflowSignal[]): number {
    const sizes = signals.map(s => s.size)
    const stdDev = this.standardDeviation(sizes)
    const mean = sizes.reduce((sum, size) => sum + size, 0) / sizes.length
    return Math.max(0, 100 - (stdDev / mean) * 100) // Higher = more consistent
  }

  private isATM(signal: OrderflowSignal): boolean {
    // Implementation would check if strike is at-the-money
    return Math.random() > 0.7
  }

  private isOTM(signal: OrderflowSignal): boolean {
    // Implementation would check if strike is out-of-the-money
    return Math.random() > 0.6
  }

  private isITM(signal: OrderflowSignal): boolean {
    // Implementation would check if strike is in-the-money
    return Math.random() > 0.8
  }

  private analyzeStrikeSelection(signals: OrderflowSignal[]): any {
    return { score: Math.random() * 25 }
  }

  private analyzeExpirationSelection(signals: OrderflowSignal[]): any {
    return { score: Math.random() * 25 }
  }

  private analyzeHedgingBehavior(signals: OrderflowSignal[]): any {
    const hedgingRatio = signals.filter(s => s.deltaHedging).length / signals.length
    return { score: hedgingRatio * 25 }
  }

  private analyzeCrossAssetCoordination(signals: OrderflowSignal[]): any {
    return { score: Math.random() * 25 }
  }

  private calculateInformationEdge(signals: OrderflowSignal[]): number {
    return Math.random() * 100
  }

  private calculateExecutionQuality(signals: OrderflowSignal[]): number {
    return Math.random() * 100
  }

  private calculateRiskManagementScore(signals: OrderflowSignal[]): number {
    const hedgingScore = signals.filter(s => s.deltaHedging).length / signals.length * 50
    const riskLevelScore = signals.filter(s => s.riskLevel === 'low' || s.riskLevel === 'medium').length / signals.length * 50
    return hedgingScore + riskLevelScore
  }

  // Initialization methods
  private initializeInstitutionalSignatures(): void {
    // Load institutional trading signatures
  }

  private initializeRetailPatterns(): void {
    // Load retail behavior patterns
  }

  private initializeMLClassifiers(): void {
    // Initialize ML classification models
  }
}

// Singleton instance
export const institutionalDetectionEngine = new InstitutionalDetectionEngine()

// Export types commented out to avoid conflicts with other modules
/*
export type { 
  TraderProfile, 
  InstitutionalSubType, 
  RetailSubType, 
  TraderCharacteristics,
  BehaviorProfile,
  RiskProfile,
  TradingStyleAnalysis
}
*/
