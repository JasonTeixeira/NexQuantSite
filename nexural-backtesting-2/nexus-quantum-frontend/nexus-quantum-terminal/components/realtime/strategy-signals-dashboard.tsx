// 🎯 STRATEGY SIGNALS DASHBOARD - Live trading signals and AI recommendations
// Shows real-time strategy signals, recommendations, and market opportunities

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useMarketData } from '@/lib/hooks/use-realtime-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  ZapIcon, 
  BarChart3Icon, 
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
} from 'lucide-react'

interface TradingSignal {
  id: string
  symbol: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  strategy: string
  strength: number // 1-10
  confidence: number // 0-100%
  targetPrice?: number
  stopLoss?: number
  timeframe: string
  reasoning: string
  generatedAt: Date
  expiresAt: Date
  status: 'active' | 'triggered' | 'expired'
}

interface MarketOpportunity {
  symbol: string
  opportunity: string
  priority: 'high' | 'medium' | 'low'
  description: string
  actionRequired: string
  timeframe: string
}

interface StrategySignalsDashboardProps {
  symbols?: string[]
  showAI?: boolean
  maxSignals?: number
  className?: string
}

// Demo signals for showcase
const DEMO_SIGNALS: TradingSignal[] = [
  {
    id: '1',
    symbol: 'AAPL',
    signal: 'BUY',
    strategy: 'RSI Reversal',
    strength: 8,
    confidence: 87,
    targetPrice: 195.00,
    stopLoss: 175.00,
    timeframe: '2-5 days',
    reasoning: 'RSI oversold (28), strong support at $180, positive earnings momentum',
    generatedAt: new Date(Date.now() - 300000), // 5 minutes ago
    expiresAt: new Date(Date.now() + 14400000), // 4 hours from now
    status: 'active'
  },
  {
    id: '2', 
    symbol: 'MSFT',
    signal: 'HOLD',
    strategy: 'Momentum Follow',
    strength: 6,
    confidence: 72,
    timeframe: '1-2 weeks',
    reasoning: 'Neutral momentum, waiting for breakout above $400 resistance',
    generatedAt: new Date(Date.now() - 600000), // 10 minutes ago
    expiresAt: new Date(Date.now() + 21600000), // 6 hours from now
    status: 'active'
  },
  {
    id: '3',
    symbol: 'TSLA',
    signal: 'SELL',
    strategy: 'Mean Reversion',
    strength: 7,
    confidence: 79,
    targetPrice: 230.00,
    stopLoss: 265.00,
    timeframe: '3-7 days',
    reasoning: 'Overbought conditions, negative divergence in MACD, profit-taking expected',
    generatedAt: new Date(Date.now() - 900000), // 15 minutes ago
    expiresAt: new Date(Date.now() + 18000000), // 5 hours from now
    status: 'active'
  }
]

const DEMO_OPPORTUNITIES: MarketOpportunity[] = [
  {
    symbol: 'NVDA',
    opportunity: 'Breakout Setup',
    priority: 'high',
    description: 'Testing key resistance at $900, volume increasing',
    actionRequired: 'Monitor for breakout confirmation',
    timeframe: 'Next 1-2 hours'
  },
  {
    symbol: 'GOOGL', 
    opportunity: 'Oversold Bounce',
    priority: 'medium',
    description: 'RSI below 30, approaching strong support zone',
    actionRequired: 'Consider entry on bounce confirmation',
    timeframe: 'Next 24 hours'
  },
  {
    symbol: 'SPY',
    opportunity: 'Index Rebalancing',
    priority: 'low',
    description: 'Quarterly rebalancing may create volatility',
    actionRequired: 'Monitor for unusual volume',
    timeframe: 'End of week'
  }
]

export function StrategySignalsDashboard({
  symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'SPY', 'QQQ'],
  showAI = true,
  maxSignals = 10,
  className = ""
}: StrategySignalsDashboardProps) {
  const { marketData, isConnected } = useMarketData(symbols)
  const [activeSignals, setActiveSignals] = useState<TradingSignal[]>(DEMO_SIGNALS)
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>(DEMO_OPPORTUNITIES)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time signal updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update signal confidence based on market movements
      setActiveSignals(prev => prev.map(signal => {
        const marketDataForSymbol = marketData[signal.symbol]
        if (marketDataForSymbol) {
          // Simulate confidence changes based on price movement
          const priceChange = marketDataForSymbol.changePercent || 0
          let newConfidence = signal.confidence

          if (signal.signal === 'BUY' && priceChange > 0) {
            newConfidence = Math.min(95, signal.confidence + 2)
          } else if (signal.signal === 'SELL' && priceChange < 0) {
            newConfidence = Math.min(95, signal.confidence + 2)  
          } else if (
            (signal.signal === 'BUY' && priceChange < -1) ||
            (signal.signal === 'SELL' && priceChange > 1)
          ) {
            newConfidence = Math.max(30, signal.confidence - 3)
          }

          return { ...signal, confidence: Math.round(newConfidence) }
        }
        return signal
      }))
      
      setLastUpdate(new Date())
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [marketData])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'SELL': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'HOLD': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStrengthBars = (strength: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <div
        key={i}
        className={`h-1.5 w-2 rounded-sm ${
          i < strength 
            ? strength <= 3 ? 'bg-red-500' 
              : strength <= 6 ? 'bg-yellow-500' 
              : 'bg-green-500'
            : 'bg-gray-600'
        }`}
      />
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20' 
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-[#0a0b1a] border-[#2a2a3e]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <ZapIcon className="w-5 h-5 text-blue-400" />
              Live Strategy Signals
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${isConnected 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                } animate-pulse`}
              >
                {isConnected ? '🔴 LIVE' : '🟡 CACHED'}
              </Badge>
              <div className="text-xs text-gray-400">
                Updated {formatTimeAgo(lastUpdate)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{activeSignals.length}</div>
              <div className="text-xs text-gray-400">Active Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {activeSignals.filter(s => s.signal === 'BUY').length}
              </div>
              <div className="text-xs text-gray-400">Buy Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {activeSignals.filter(s => s.signal === 'SELL').length}
              </div>
              <div className="text-xs text-gray-400">Sell Signals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Signals */}
      <Card className="bg-[#0a0b1a] border-[#2a2a3e]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5 text-blue-400" />
            Active Trading Signals
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {activeSignals.slice(0, maxSignals).map((signal) => {
              const currentPrice = marketData[signal.symbol]?.price
              const priceChange = marketData[signal.symbol]?.changePercent || 0
              
              return (
                <div
                  key={signal.id}
                  className="p-4 rounded-lg border border-[#2a2a3e] bg-[#1a1a25] hover:bg-[#1f1f2e] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-white text-lg">{signal.symbol}</div>
                      <Badge className={`font-bold ${getSignalColor(signal.signal)}`}>
                        {signal.signal}
                      </Badge>
                      <div className="text-sm text-gray-400">{signal.strategy}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-mono">
                        {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Loading...'}
                      </div>
                      <div className={`text-xs ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Confidence</span>
                        <span className="text-sm font-bold text-white">{signal.confidence}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Strength</span>
                        <div className="flex items-center gap-0.5">
                          {getStrengthBars(signal.strength)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Timeframe</span>
                        <span className="text-sm text-white">{signal.timeframe}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {signal.targetPrice && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Target</span>
                          <span className="text-sm font-mono text-green-400">
                            ${signal.targetPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {signal.stopLoss && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Stop Loss</span>
                          <span className="text-sm font-mono text-red-400">
                            ${signal.stopLoss.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Generated</span>
                        <span className="text-sm text-white">{formatTimeAgo(signal.generatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0f1320] rounded-lg border border-[#2a2a3e]">
                    <div className="text-sm text-gray-300">{signal.reasoning}</div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2a3e]">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">Paper Trading Ready</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        // In real implementation, this would add to paper portfolio
                        alert(`Added ${signal.symbol} ${signal.signal} signal to watchlist`)
                      }}
                    >
                      Add to Portfolio
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunities */}
      <Card className="bg-[#0a0b1a] border-[#2a2a3e]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-yellow-400" />
            Market Opportunities
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {opportunities.map((opp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3e] bg-[#1a1a25]"
              >
                <div className="flex items-center gap-3">
                  <div className="font-bold text-white">{opp.symbol}</div>
                  <Badge className={`text-xs ${getPriorityColor(opp.priority)}`}>
                    {opp.priority.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-300">{opp.opportunity}</div>
                </div>
                
                <div className="text-right text-xs text-gray-400">
                  <div>{opp.timeframe}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ClockIcon className="w-3 h-3" />
                    {opp.actionRequired}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-[#0a0b1a] border-[#2a2a3e]">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <div className="text-yellow-400 font-semibold">Paper Trading Signals</div>
              <div className="text-gray-300">
                These signals are generated for paper trading and educational purposes only. 
                Always conduct your own research and consider your risk tolerance before making any trading decisions.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StrategySignalsDashboard
