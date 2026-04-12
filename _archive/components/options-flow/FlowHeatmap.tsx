"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Layers, TrendingUp, TrendingDown, Activity, 
  Zap, Target, Eye, Filter
} from "lucide-react"
import type { OptionsFlow } from "@/lib/options-flow-data"

interface FlowHeatmapProps {
  flows: OptionsFlow[]
  className?: string
}

interface HeatmapCell {
  symbol: string
  totalPremium: number
  callVolume: number
  putVolume: number
  netFlow: number
  smartMoneyRatio: number
  unusualActivity: boolean
  sentiment: 'bullish' | 'bearish' | 'neutral'
  intensity: number
}

export default function FlowHeatmap({ flows, className = "" }: FlowHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([])
  const [viewMode, setViewMode] = useState<'premium' | 'volume' | 'smart-money'>('premium')
  const [sortBy, setSortBy] = useState<'intensity' | 'premium' | 'smart-money'>('intensity')

  useEffect(() => {
    if (flows.length > 0) {
      generateHeatmapData()
    }
  }, [flows, viewMode])

  const generateHeatmapData = () => {
    const symbolData: { [key: string]: HeatmapCell } = {}

    flows.forEach(flow => {
      if (!symbolData[flow.symbol]) {
        symbolData[flow.symbol] = {
          symbol: flow.symbol,
          totalPremium: 0,
          callVolume: 0,
          putVolume: 0,
          netFlow: 0,
          smartMoneyRatio: 0,
          unusualActivity: false,
          sentiment: 'neutral',
          intensity: 0
        }
      }

      const cell = symbolData[flow.symbol]
      const premium = flow.size * flow.premium

      cell.totalPremium += premium
      
      if (flow.type === 'call') {
        cell.callVolume += flow.size
      } else {
        cell.putVolume += flow.size
      }

      // Calculate net flow (positive = bullish, negative = bearish)
      const flowValue = (flow.type === 'call' ? 1 : -1) * 
                       (flow.side === 'buy' ? 1 : -1) * 
                       premium

      cell.netFlow += flowValue

      // Track smart money flows
      if (flow.smartMoneyScore > 70) {
        cell.smartMoneyRatio += 1
      }

      // Mark unusual activity
      if (flow.isUnusual) {
        cell.unusualActivity = true
      }
    })

    // Calculate final metrics for each symbol
    Object.values(symbolData).forEach(cell => {
      const totalFlows = flows.filter(f => f.symbol === cell.symbol).length
      cell.smartMoneyRatio = totalFlows > 0 ? cell.smartMoneyRatio / totalFlows : 0

      // Determine sentiment
      if (cell.netFlow > cell.totalPremium * 0.1) {
        cell.sentiment = 'bullish'
      } else if (cell.netFlow < -cell.totalPremium * 0.1) {
        cell.sentiment = 'bearish'
      } else {
        cell.sentiment = 'neutral'
      }

      // Calculate intensity based on view mode
      switch (viewMode) {
        case 'premium':
          cell.intensity = Math.min(100, (cell.totalPremium / 1000000) * 100)
          break
        case 'volume':
          const totalVolume = cell.callVolume + cell.putVolume
          cell.intensity = Math.min(100, (totalVolume / 10000) * 100)
          break
        case 'smart-money':
          cell.intensity = cell.smartMoneyRatio * 100
          break
      }
    })

    // Sort data
    const sortedData = Object.values(symbolData).sort((a, b) => {
      switch (sortBy) {
        case 'premium':
          return b.totalPremium - a.totalPremium
        case 'smart-money':
          return b.smartMoneyRatio - a.smartMoneyRatio
        default:
          return b.intensity - a.intensity
      }
    })

    setHeatmapData(sortedData.slice(0, 20)) // Top 20 symbols
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const getIntensityColor = (intensity: number, sentiment: string) => {
    const alpha = Math.max(0.1, intensity / 100)
    
    switch (sentiment) {
      case 'bullish':
        return `rgba(34, 197, 94, ${alpha})` // Green
      case 'bearish':
        return `rgba(239, 68, 68, ${alpha})` // Red
      default:
        return `rgba(156, 163, 175, ${alpha})` // Gray
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return TrendingUp
      case 'bearish': return TrendingDown
      default: return Activity
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/40 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(147, 51, 234, 0.3)",
                "0 0 30px rgba(147, 51, 234, 0.5)",
                "0 0 20px rgba(147, 51, 234, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Layers className="w-5 h-5 text-purple-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-white">Options Flow Heatmap</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Selector */}
          <div className="flex gap-1">
            {[
              { key: 'premium', label: 'Premium', icon: Target },
              { key: 'volume', label: 'Volume', icon: Activity },
              { key: 'smart-money', label: 'Smart Money', icon: Eye }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={viewMode === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(key as any)}
                className={`${
                  viewMode === key 
                    ? "bg-primary/20 text-primary border border-primary/50" 
                    : "text-gray-400 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Heatmap Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Real-time Flow Intensity
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-400/60 rounded-sm" />
                  <span>Bullish</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400/60 rounded-sm" />
                  <span>Bearish</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400/60 rounded-sm" />
                  <span>Neutral</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {heatmapData.map((cell, index) => {
                const SentimentIcon = getSentimentIcon(cell.sentiment)
                
                return (
                  <motion.div
                    key={cell.symbol}
                    className="relative group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                  >
                    <div
                      className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer relative overflow-hidden"
                      style={{ 
                        backgroundColor: getIntensityColor(cell.intensity, cell.sentiment)
                      }}
                    >
                      {/* Unusual Activity Indicator */}
                      {cell.unusualActivity && (
                        <motion.div
                          className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}

                      {/* Symbol */}
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant="outline" 
                          className="text-white border-white/30 text-xs font-bold"
                        >
                          {cell.symbol}
                        </Badge>
                        <SentimentIcon className={`w-4 h-4 ${getSentimentColor(cell.sentiment)}`} />
                      </div>

                      {/* Primary Metric */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-white mb-1">
                          {viewMode === 'premium' && formatCurrency(cell.totalPremium)}
                          {viewMode === 'volume' && `${(cell.callVolume + cell.putVolume).toLocaleString()}`}
                          {viewMode === 'smart-money' && `${(cell.smartMoneyRatio * 100).toFixed(0)}%`}
                        </div>
                        <div className="text-xs text-gray-300">
                          {viewMode === 'premium' && 'Premium'}
                          {viewMode === 'volume' && 'Volume'}
                          {viewMode === 'smart-money' && 'Smart Money'}
                        </div>
                      </div>

                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-black/90 rounded-lg border border-primary/20 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Premium:</span>
                            <span className="text-green-400">{formatCurrency(cell.totalPremium)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Call/Put:</span>
                            <span className="text-blue-400">
                              {cell.callVolume.toLocaleString()}/{cell.putVolume.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Smart Money:</span>
                            <span className="text-yellow-400">{(cell.smartMoneyRatio * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Net Flow:</span>
                            <span className={cell.netFlow > 0 ? 'text-green-400' : 'text-red-400'}>
                              {formatCurrency(Math.abs(cell.netFlow))}
                            </span>
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {heatmapData.length === 0 && (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No flow data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend and Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="p-4 bg-black/20 rounded-lg border border-primary/10">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {heatmapData.filter(c => c.sentiment === 'bullish').length}
          </div>
          <div className="text-sm text-gray-400">Bullish Symbols</div>
        </div>
        <div className="p-4 bg-black/20 rounded-lg border border-primary/10">
          <div className="text-2xl font-bold text-red-400 mb-1">
            {heatmapData.filter(c => c.sentiment === 'bearish').length}
          </div>
          <div className="text-sm text-gray-400">Bearish Symbols</div>
        </div>
        <div className="p-4 bg-black/20 rounded-lg border border-primary/10">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {heatmapData.filter(c => c.unusualActivity).length}
          </div>
          <div className="text-sm text-gray-400">Unusual Activity</div>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        className="text-center p-4 bg-black/20 rounded-lg border border-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white">Live Flow Visualization</span>
        </div>
        <p className="text-xs text-gray-400">
          Heat intensity represents {
            viewMode === 'premium' ? 'total premium flow' :
            viewMode === 'volume' ? 'total contract volume' :
            'smart money concentration'
          } • Updates in real-time
        </p>
      </motion.div>
    </div>
  )
}
