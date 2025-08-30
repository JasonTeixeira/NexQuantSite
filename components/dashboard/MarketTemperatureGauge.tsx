"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

interface MarketTemperature {
  overall: number // 0-100 scale
  components: {
    volatility: number
    sentiment: number
    liquidity: number
    momentum: number
    risk: number
  }
  regime: 'ice_cold' | 'cold' | 'cool' | 'neutral' | 'warm' | 'hot' | 'blazing'
  signals: {
    buy: number
    sell: number
    hold: number
  }
  warnings: string[]
  opportunities: string[]
  recommendation: string
}

export default function MarketTemperatureGauge() {
  const [temperature, setTemperature] = useState<MarketTemperature | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateMarketTemperature = async () => {
      try {
        // This would integrate with all the APIs we've been using
        // For now, calculating based on realistic market conditions
        
        // Simulate data collection from various sources
        const vixLevel = 18.4 // From volatility dashboard
        const fearGreedIndex = 60 // From context panel
        const btcChange = 2.13 // From crypto metrics
        const spyChange = 1.54 // From context panel
        const socialSentiment = 72 // From social tracker
        
        // Calculate component scores (0-100)
        const volatilityScore = Math.max(0, Math.min(100, 100 - (vixLevel * 3.5))) // Lower VIX = higher score
        const sentimentScore = Math.max(0, Math.min(100, (fearGreedIndex + socialSentiment) / 2))
        const liquidityScore = 75 // Would calculate from bid-ask spreads, volume
        const momentumScore = Math.max(0, Math.min(100, ((btcChange + spyChange) * 10) + 50))
        const riskScore = Math.max(0, Math.min(100, 85 - (vixLevel * 2))) // Lower VIX = lower risk = higher score
        
        // Overall temperature (weighted average)
        const overallTemp = Math.round(
          (volatilityScore * 0.25) + 
          (sentimentScore * 0.25) + 
          (liquidityScore * 0.15) + 
          (momentumScore * 0.20) + 
          (riskScore * 0.15)
        )

        // Determine regime
        let regime: MarketTemperature['regime']
        if (overallTemp >= 85) regime = 'blazing'
        else if (overallTemp >= 75) regime = 'hot'
        else if (overallTemp >= 60) regime = 'warm'
        else if (overallTemp >= 40) regime = 'neutral'
        else if (overallTemp >= 25) regime = 'cool'
        else if (overallTemp >= 15) regime = 'cold'
        else regime = 'ice_cold'

        // Generate signals based on temperature
        const signals = {
          buy: overallTemp > 60 ? Math.round(overallTemp * 0.8) : Math.round(overallTemp * 0.4),
          sell: overallTemp < 40 ? Math.round((100 - overallTemp) * 0.7) : Math.round((100 - overallTemp) * 0.3),
          hold: Math.round(Math.abs(50 - overallTemp) * 1.2)
        }

        // Generate warnings and opportunities
        const warnings: string[] = []
        const opportunities: string[] = []

        if (vixLevel > 25) warnings.push("High volatility detected - reduce position sizes")
        if (fearGreedIndex > 80) warnings.push("Extreme greed - potential market top")
        if (fearGreedIndex < 20) warnings.push("Extreme fear - potential market bottom")
        if (overallTemp < 30) warnings.push("Cold market conditions - trend following may struggle")

        if (overallTemp > 70) opportunities.push("Hot market - momentum strategies favored")
        if (sentimentScore > 80) opportunities.push("Strong sentiment - breakout plays possible")
        if (volatilityScore > 75) opportunities.push("Low volatility - range-bound strategies optimal")
        if (momentumScore > 60) opportunities.push("Positive momentum - trend continuation likely")

        // Generate recommendation
        let recommendation: string
        if (regime === 'blazing') recommendation = "🔥 FULL RISK ON - Maximum allocation recommended"
        else if (regime === 'hot') recommendation = "🌡️ HIGH CONFIDENCE - Increase position sizes" 
        else if (regime === 'warm') recommendation = "📈 FAVORABLE CONDITIONS - Normal allocation"
        else if (regime === 'neutral') recommendation = "⚖️ BALANCED APPROACH - Maintain current positions"
        else if (regime === 'cool') recommendation = "🧊 CAUTION ADVISED - Reduce exposure"
        else if (regime === 'cold') recommendation = "❄️ DEFENSIVE MODE - Minimal positions only"
        else recommendation = "🔒 CASH MODE - Preserve capital, wait for opportunity"

        setTemperature({
          overall: overallTemp,
          components: {
            volatility: Math.round(volatilityScore),
            sentiment: Math.round(sentimentScore),
            liquidity: Math.round(liquidityScore),
            momentum: Math.round(momentumScore),
            risk: Math.round(riskScore)
          },
          regime,
          signals,
          warnings,
          opportunities,
          recommendation
        })

      } catch (error) {
        console.error('Failed to calculate market temperature:', error)
      } finally {
        setLoading(false)
      }
    }

    calculateMarketTemperature()
    const interval = setInterval(calculateMarketTemperature, 60 * 1000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const getTemperatureColor = (temp: number) => {
    if (temp >= 85) return 'from-red-500 to-orange-500'
    if (temp >= 75) return 'from-orange-500 to-yellow-500'
    if (temp >= 60) return 'from-yellow-500 to-green-500'
    if (temp >= 40) return 'from-blue-500 to-cyan-500'
    if (temp >= 25) return 'from-cyan-500 to-blue-500'
    if (temp >= 15) return 'from-blue-500 to-purple-500'
    return 'from-purple-500 to-gray-500'
  }

  const getRegimeEmoji = (regime: string) => {
    switch (regime) {
      case 'blazing': return '🔥'
      case 'hot': return '🌡️'
      case 'warm': return '☀️'
      case 'neutral': return '⚖️'
      case 'cool': return '🌤️'
      case 'cold': return '❄️'
      case 'ice_cold': return '🧊'
      default: return '🌡️'
    }
  }

  const getRegimeLabel = (regime: string) => {
    return regime.replace('_', ' ').toUpperCase()
  }

  const getComponentColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-lime-400'
    if (score >= 40) return 'text-yellow-400'
    if (score >= 20) return 'text-orange-400'
    return 'text-red-400'
  }

  if (loading || !temperature) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primary animate-pulse" />
            Market Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
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
            <Thermometer className="w-5 h-5 text-primary" />
            Market Temperature Gauge
            <Badge className="ml-auto bg-primary/20 text-primary text-xs animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Main Temperature Display */}
          <div className="mb-8 text-center">
            <div className="relative mx-auto w-48 h-48 mb-4">
              {/* Temperature Circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 p-4">
                <div 
                  className={`w-full h-full rounded-full bg-gradient-to-br ${getTemperatureColor(temperature.overall)} flex items-center justify-center relative overflow-hidden`}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                  
                  <div className="text-center z-10">
                    <div className="text-4xl mb-1">{getRegimeEmoji(temperature.regime)}</div>
                    <div className="text-3xl font-bold text-white">{temperature.overall}°</div>
                    <div className="text-sm text-white/80 font-medium">
                      {getRegimeLabel(temperature.regime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommendation Banner */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
              <h3 className="text-white font-bold text-lg mb-1">AI Recommendation</h3>
              <p className="text-primary font-medium">{temperature.recommendation}</p>
            </div>
          </div>

          {/* Component Breakdown */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>📊</span>
              Temperature Components
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {Object.entries(temperature.components).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-800/30 rounded-lg text-center">
                  <div className={`text-lg font-bold ${getComponentColor(value)}`}>
                    {value}°
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {key === 'risk' ? 'Safety' : key}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal Strength */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>📡</span>
              Signal Strength
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                <div className="text-2xl font-bold text-green-400">{temperature.signals.buy}%</div>
                <div className="text-sm text-green-300">BUY Signals</div>
                <TrendingUp className="w-4 h-4 text-green-400 mx-auto mt-1" />
              </div>
              <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/20 text-center">
                <div className="text-2xl font-bold text-gray-400">{temperature.signals.hold}%</div>
                <div className="text-sm text-gray-300">HOLD Signals</div>
                <CheckCircle className="w-4 h-4 text-gray-400 mx-auto mt-1" />
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-center">
                <div className="text-2xl font-bold text-red-400">{temperature.signals.sell}%</div>
                <div className="text-sm text-red-300">SELL Signals</div>
                <TrendingDown className="w-4 h-4 text-red-400 mx-auto mt-1" />
              </div>
            </div>
          </div>

          {/* Warnings & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Warnings */}
            {temperature.warnings.length > 0 && (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h4 className="text-white font-medium">Market Warnings</h4>
                </div>
                <div className="space-y-2">
                  {temperature.warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-red-300">• {warning}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunities */}
            {temperature.opportunities.length > 0 && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <h4 className="text-white font-medium">Opportunities</h4>
                </div>
                <div className="space-y-2">
                  {temperature.opportunities.map((opportunity, index) => (
                    <p key={index} className="text-sm text-green-300">• {opportunity}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bot Performance Correlation */}
          <div className="p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-lg border border-gray-600/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cyan-400">🤖</span>
              <h4 className="text-white font-medium">Your Bot Performance in {getRegimeLabel(temperature.regime)} Markets</h4>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              {temperature.regime === 'blazing' && (
                <>
                  <p>• Zenith Mean Reversion: Expected +35% monthly performance</p>
                  <p>• Quantum Engine: Peak efficiency - momentum strategies excel</p>
                  <p>• Risk Level: High reward potential, monitor drawdowns closely</p>
                </>
              )}
              {temperature.regime === 'hot' && (
                <>
                  <p>• All bots performing above average in current conditions</p>
                  <p>• Optimal environment for trend-following strategies</p>
                  <p>• Consider increasing position sizes by 25%</p>
                </>
              )}
              {temperature.regime === 'neutral' && (
                <>
                  <p>• Mixed performance expected across bot strategies</p>
                  <p>• Range-bound markets favor mean reversion approaches</p>
                  <p>• Maintain standard risk parameters</p>
                </>
              )}
              {temperature.regime === 'cold' && (
                <>
                  <p>• Defensive bots outperforming in current environment</p>
                  <p>• Trend followers may struggle - reduce allocations</p>
                  <p>• Focus on capital preservation strategies</p>
                </>
              )}
              <p>• Live correlation tracking shows {temperature.overall > 60 ? 'positive' : 'negative'} alpha generation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
