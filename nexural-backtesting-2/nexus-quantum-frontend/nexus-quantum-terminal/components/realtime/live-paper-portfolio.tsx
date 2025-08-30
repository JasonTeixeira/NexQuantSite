// 💼 LIVE PAPER PORTFOLIO - Real-time paper trading portfolio with live P&L
// Shows paper positions with live market data updates and performance tracking

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useMarketData } from '@/lib/hooks/use-realtime-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon, BarChart3Icon, AlertTriangleIcon } from 'lucide-react'

interface PaperPosition {
  symbol: string
  quantity: number
  entryPrice: number
  entryDate: Date
  notes?: string
}

interface PaperPortfolioData {
  positions: PaperPosition[]
  initialCash: number
  availableCash: number
  startDate: Date
}

interface LivePaperPortfolioProps {
  portfolioData?: PaperPortfolioData
  onAddPosition?: (position: PaperPosition) => void
  onRemovePosition?: (symbol: string) => void
  className?: string
}

// Demo paper portfolio for showcase
const DEMO_PORTFOLIO: PaperPortfolioData = {
  positions: [
    {
      symbol: 'AAPL',
      quantity: 100,
      entryPrice: 175.50,
      entryDate: new Date('2024-01-15'),
      notes: 'Bullish on iPhone 16 cycle'
    },
    {
      symbol: 'MSFT',
      quantity: 50,
      entryPrice: 380.25,
      entryDate: new Date('2024-01-20'),
      notes: 'AI growth story'
    },
    {
      symbol: 'GOOGL',
      quantity: 75,
      entryPrice: 140.80,
      entryDate: new Date('2024-01-22'),
      notes: 'Undervalued tech giant'
    },
    {
      symbol: 'TSLA',
      quantity: 25,
      entryPrice: 248.92,
      entryDate: new Date('2024-01-25'),
      notes: 'EV market leader'
    }
  ],
  initialCash: 100000,
  availableCash: 15023.75,
  startDate: new Date('2024-01-15')
}

export function LivePaperPortfolio({ 
  portfolioData = DEMO_PORTFOLIO,
  onAddPosition,
  onRemovePosition,
  className = ""
}: LivePaperPortfolioProps) {
  const symbols = portfolioData.positions.map(p => p.symbol)
  const { marketData, isConnected, getPrice } = useMarketData(symbols)
  const [flashingPositions, setFlashingPositions] = useState<Set<string>>(new Set())

  // Flash animation for price changes
  useEffect(() => {
    const newFlashing = new Set<string>()
    
    symbols.forEach(symbol => {
      const data = marketData[symbol]
      if (data && data.timestamp) {
        if (Date.now() - data.timestamp < 2000) {
          newFlashing.add(symbol)
        }
      }
    })

    if (newFlashing.size > 0) {
      setFlashingPositions(newFlashing)
      setTimeout(() => setFlashingPositions(new Set()), 1000)
    }
  }, [marketData, symbols])

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    let totalValue = portfolioData.availableCash
    let totalCost = 0
    let totalUnrealizedGainLoss = 0
    let todaysGainLoss = 0

    const positionDetails = portfolioData.positions.map(position => {
      const currentPrice = getPrice(position.symbol) || position.entryPrice
      const marketValue = currentPrice * position.quantity
      const cost = position.entryPrice * position.quantity
      const unrealizedGainLoss = marketValue - cost
      const unrealizedGainLossPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100
      
      // Today's change (simplified)
      const data = marketData[position.symbol]
      const todayChange = data?.change || 0
      const todayGainLoss = todayChange * position.quantity
      
      totalValue += marketValue
      totalCost += cost
      totalUnrealizedGainLoss += unrealizedGainLoss
      todaysGainLoss += todayGainLoss

      return {
        ...position,
        currentPrice,
        marketValue,
        cost,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        todayGainLoss,
        weight: 0 // Will be calculated after totalValue is known
      }
    })

    // Calculate position weights
    positionDetails.forEach(pos => {
      pos.weight = totalValue > 0 ? (pos.marketValue / totalValue) * 100 : 0
    })

    const totalReturn = ((totalValue - portfolioData.initialCash) / portfolioData.initialCash) * 100
    const todaysReturnPercent = totalValue > 0 ? (todaysGainLoss / totalValue) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalUnrealizedGainLoss,
      totalReturn,
      todaysGainLoss,
      todaysReturnPercent,
      positionDetails,
      daysHeld: Math.floor((Date.now() - portfolioData.startDate.getTime()) / (1000 * 60 * 60 * 24))
    }
  }, [portfolioData, marketData, getPrice])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getChangeBackground = (value: number) => {
    if (value > 0) return 'bg-green-500/10 border-green-500/20'
    if (value < 0) return 'bg-red-500/10 border-red-500/20'
    return 'bg-gray-500/10 border-gray-500/20'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Summary */}
      <Card className="bg-[#0a0b1a] border-[#2a2a3e]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSignIcon className="w-5 h-5 text-blue-400" />
              Paper Trading Portfolio
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
                Day {portfolioMetrics.daysHeld}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Value */}
            <div className="space-y-1">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Total Value</div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(portfolioMetrics.totalValue)}
              </div>
              <div className={`text-xs flex items-center gap-1 ${getChangeColor(portfolioMetrics.totalReturn)}`}>
                {portfolioMetrics.totalReturn >= 0 ? (
                  <TrendingUpIcon className="w-3 h-3" />
                ) : (
                  <TrendingDownIcon className="w-3 h-3" />
                )}
                {formatPercent(portfolioMetrics.totalReturn)}
              </div>
            </div>

            {/* Total Gain/Loss */}
            <div className="space-y-1">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Total Gain/Loss</div>
              <div className={`text-lg font-bold ${getChangeColor(portfolioMetrics.totalUnrealizedGainLoss)}`}>
                {formatCurrency(portfolioMetrics.totalUnrealizedGainLoss)}
              </div>
              <div className="text-xs text-gray-400">
                Unrealized
              </div>
            </div>

            {/* Today's Gain/Loss */}
            <div className={`space-y-1 p-2 rounded-lg border ${getChangeBackground(portfolioMetrics.todaysGainLoss)}`}>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Today's Gain/Loss</div>
              <div className={`text-lg font-bold ${getChangeColor(portfolioMetrics.todaysGainLoss)}`}>
                {formatCurrency(portfolioMetrics.todaysGainLoss)}
              </div>
              <div className={`text-xs ${getChangeColor(portfolioMetrics.todaysReturnPercent)}`}>
                {formatPercent(portfolioMetrics.todaysReturnPercent)}
              </div>
            </div>

            {/* Available Cash */}
            <div className="space-y-1">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Available Cash</div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(portfolioData.availableCash)}
              </div>
              <div className="text-xs text-gray-400">
                {((portfolioData.availableCash / portfolioMetrics.totalValue) * 100).toFixed(1)}% cash
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions Table */}
      <Card className="bg-[#0a0b1a] border-[#2a2a3e]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5 text-blue-400" />
            Paper Positions ({portfolioMetrics.positionDetails.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3e]">
                  <th className="text-left py-2 px-2 text-xs text-gray-400 uppercase tracking-wide">Symbol</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-400 uppercase tracking-wide">Qty</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-400 uppercase tracking-wide">Entry</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-400 uppercase tracking-wide">Current</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-400 uppercase tracking-wide">Market Value</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-400 uppercase tracking-wide">Gain/Loss</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-400 uppercase tracking-wide">Today</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-400 uppercase tracking-wide">Weight</th>
                </tr>
              </thead>
              <tbody>
                {portfolioMetrics.positionDetails.map((position) => (
                  <tr 
                    key={position.symbol}
                    className={`border-b border-[#1a1a25] hover:bg-[#1a1a25] transition-colors ${
                      flashingPositions.has(position.symbol) ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex flex-col">
                        <div className="font-bold text-white text-sm">{position.symbol}</div>
                        {position.notes && (
                          <div className="text-xs text-gray-400 truncate max-w-[120px]">
                            {position.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-white font-mono text-sm">
                      {position.quantity.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-2 text-gray-300 font-mono text-sm">
                      ${position.entryPrice.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-2 text-white font-mono text-sm font-bold">
                      ${position.currentPrice.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-2 text-white font-mono text-sm">
                      {formatCurrency(position.marketValue)}
                    </td>
                    <td className="text-right py-3 px-2">
                      <div className={`font-mono text-sm ${getChangeColor(position.unrealizedGainLoss)}`}>
                        {formatCurrency(position.unrealizedGainLoss)}
                      </div>
                      <div className={`text-xs ${getChangeColor(position.unrealizedGainLossPercent)}`}>
                        {formatPercent(position.unrealizedGainLossPercent)}
                      </div>
                    </td>
                    <td className="text-right py-3 px-2">
                      <div className={`font-mono text-sm ${getChangeColor(position.todayGainLoss)}`}>
                        {formatCurrency(position.todayGainLoss)}
                      </div>
                    </td>
                    <td className="text-right py-3 px-2">
                      <div className="text-white text-sm">
                        {position.weight.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-[#0a0b1a] border-[#2a2a3e]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />
            Paper Trading Notice
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-blue-400">
              ✅ <span>This is a simulated paper trading portfolio using live market data</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              📊 <span>Performance tracking helps validate strategies before live trading</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              ⚡ <span>Prices update in real-time to simulate actual market conditions</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              🎯 <span>Use these results to guide your actual trading decisions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LivePaperPortfolio
