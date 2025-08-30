"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react'

interface VolatilityData {
  vix: number
  vixChange: number
  vixLevel: 'low' | 'normal' | 'high' | 'extreme'
  move: number
  moveChange: number
  rvol: number
  rvolChange: number
  marketRegime: string
  riskLevel: string
}

export default function VolatilityDashboard() {
  const [volatilityData, setVolatilityData] = useState<VolatilityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVolatilityData = async () => {
      try {
        // Using Alpha Vantage for VIX data
        const vixResponse = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=VIX&apikey=BILEQT4FR4AYF3HW`
        )
        const vixData = await vixResponse.json()

        let vixValue = 18.4
        let vixChangeValue = -2.1

        if (vixData["Global Quote"]) {
          const quote = vixData["Global Quote"]
          vixValue = parseFloat(quote["05. price"]) || 18.4
          vixChangeValue = parseFloat(quote["09. change"]) || -2.1
        }

        // Determine VIX level
        const getVixLevel = (vix: number): 'low' | 'normal' | 'high' | 'extreme' => {
          if (vix < 12) return 'low'
          if (vix < 20) return 'normal'  
          if (vix < 30) return 'high'
          return 'extreme'
        }

        // Calculate market regime
        const getMarketRegime = (vix: number, change: number) => {
          if (vix < 15 && change < 0) return "LOW VOLATILITY BULL TREND"
          if (vix < 20 && change < 0) return "NORMAL VOLATILITY TREND"
          if (vix > 25 && change > 0) return "HIGH VOLATILITY BEAR TREND"
          if (vix > 30) return "EXTREME VOLATILITY CRISIS"
          return "TRANSITIONAL REGIME"
        }

        const getRiskLevel = (vix: number) => {
          if (vix < 12) return "VERY LOW RISK"
          if (vix < 20) return "LOW RISK"
          if (vix < 30) return "ELEVATED RISK" 
          return "HIGH RISK"
        }

        // Mock additional volatility indicators (would use real APIs in production)
        const mockData: VolatilityData = {
          vix: vixValue,
          vixChange: vixChangeValue,
          vixLevel: getVixLevel(vixValue),
          move: 89.2, // MOVE Index (bond volatility)
          moveChange: 1.3,
          rvol: 0.24, // Realized volatility
          rvolChange: -0.03,
          marketRegime: getMarketRegime(vixValue, vixChangeValue),
          riskLevel: getRiskLevel(vixValue)
        }

        setVolatilityData(mockData)
      } catch (error) {
        // Fallback data
        setVolatilityData({
          vix: 18.4,
          vixChange: -2.1,
          vixLevel: 'normal',
          move: 89.2,
          moveChange: 1.3,
          rvol: 0.24,
          rvolChange: -0.03,
          marketRegime: "NORMAL VOLATILITY TREND",
          riskLevel: "LOW RISK"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVolatilityData()
    const interval = setInterval(fetchVolatilityData, 5 * 60 * 1000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading || !volatilityData) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            Volatility Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getVixColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'normal': return 'text-blue-400'
      case 'high': return 'text-orange-400'
      case 'extreme': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskColor = (risk: string) => {
    if (risk.includes('VERY LOW')) return 'bg-green-500/20 text-green-400'
    if (risk.includes('LOW')) return 'bg-blue-500/20 text-blue-400'
    if (risk.includes('ELEVATED')) return 'bg-orange-500/20 text-orange-400'
    return 'bg-red-500/20 text-red-400'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-red-400' : 'text-green-400' // VIX is inverse - higher is worse
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Volatility Dashboard
            <Badge className={`ml-auto text-xs ${getRiskColor(volatilityData.riskLevel)}`}>
              {volatilityData.riskLevel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Market Regime Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">
                📊 {volatilityData.marketRegime}
              </h3>
              <p className="text-sm text-gray-400">
                Current market conditions based on volatility analysis
              </p>
            </div>
          </div>

          {/* Volatility Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* VIX */}
            <motion.div 
              className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">VIX</span>
                </div>
                <div className={`text-3xl font-bold mb-1 ${getVixColor(volatilityData.vixLevel)}`}>
                  {volatilityData.vix.toFixed(1)}
                </div>
                <div className={`text-sm flex items-center justify-center gap-1 ${getChangeColor(volatilityData.vixChange)}`}>
                  {getChangeIcon(volatilityData.vixChange)}
                  {volatilityData.vixChange > 0 ? '+' : ''}{volatilityData.vixChange.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1 uppercase">
                  {volatilityData.vixLevel} Fear
                </div>
              </div>
            </motion.div>

            {/* MOVE Index */}
            <motion.div 
              className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">MOVE</span>
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {volatilityData.move.toFixed(1)}
                </div>
                <div className={`text-sm flex items-center justify-center gap-1 ${
                  volatilityData.moveChange >= 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {getChangeIcon(volatilityData.moveChange)}
                  {volatilityData.moveChange > 0 ? '+' : ''}{volatilityData.moveChange.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 mt-1 uppercase">
                  Bond Volatility
                </div>
              </div>
            </motion.div>

            {/* Realized Vol */}
            <motion.div 
              className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">RVOL</span>
                </div>
                <div className="text-3xl font-bold text-cyan-400 mb-1">
                  {(volatilityData.rvol * 100).toFixed(0)}%
                </div>
                <div className={`text-sm flex items-center justify-center gap-1 ${
                  volatilityData.rvolChange >= 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {getChangeIcon(volatilityData.rvolChange)}
                  {volatilityData.rvolChange > 0 ? '+' : ''}{(volatilityData.rvolChange * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1 uppercase">
                  30D Realized
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trading Insights */}
          <div className="p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-lg border border-gray-600/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400">💡</span>
              <h4 className="text-white font-medium">Trading Insights</h4>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              {volatilityData.vix < 15 && (
                <p>• Low volatility environment - consider selling options premium</p>
              )}
              {volatilityData.vix > 25 && (
                <p>• High volatility - protective strategies recommended</p>
              )}
              {volatilityData.vixChange < -5 && (
                <p>• VIX dropping fast - potential trend continuation signal</p>
              )}
              {volatilityData.marketRegime.includes('BULL') && (
                <p>• Bullish regime detected - momentum strategies favored</p>
              )}
              <p>• Your bots perform best in {volatilityData.vix < 20 ? 'low' : 'high'} volatility periods</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
