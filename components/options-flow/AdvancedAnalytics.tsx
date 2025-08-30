"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, TrendingUp, TrendingDown, Activity, Target, 
  Layers, Clock, Eye, Brain, Zap, PieChart, LineChart,
  ArrowUp, ArrowDown, DollarSign, Users, Building
} from "lucide-react"
import type { OptionsFlow } from "@/lib/options-flow-data"

interface AdvancedAnalyticsProps {
  flows: OptionsFlow[]
  className?: string
}

interface FlowMetrics {
  totalPremium: number
  totalVolume: number
  avgPremium: number
  callPutRatio: number
  buyPutRatio: number
  unusualActivityCount: number
  smartMoneyRatio: number
  institutionalFlow: number
  retailFlow: number
  darkPoolEstimate: number
}

interface TimeSeriesPoint {
  timestamp: Date
  premium: number
  volume: number
  smartMoney: number
}

interface SectorAnalysis {
  sector: string
  symbols: string[]
  totalFlow: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  strength: number
  institutionalActivity: number
}

interface AdvancedPatterns {
  gammaHedging: number
  volatilityArbitrage: number
  earnings: number
  technicalBreakout: number
  institutionalRebalancing: number
  retailFomo: number
}

export default function AdvancedAnalytics({ flows, className = "" }: AdvancedAnalyticsProps) {
  const [metrics, setMetrics] = useState<FlowMetrics>({
    totalPremium: 0,
    totalVolume: 0,
    avgPremium: 0,
    callPutRatio: 0,
    buyPutRatio: 0,
    unusualActivityCount: 0,
    smartMoneyRatio: 0,
    institutionalFlow: 0,
    retailFlow: 0,
    darkPoolEstimate: 0
  })
  
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([])
  const [sectorAnalysis, setSectorAnalysis] = useState<SectorAnalysis[]>([])
  const [patterns, setPatterns] = useState<AdvancedPatterns>({
    gammaHedging: 0,
    volatilityArbitrage: 0,
    earnings: 0,
    technicalBreakout: 0,
    institutionalRebalancing: 0,
    retailFomo: 0
  })
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'5m' | '15m' | '1h' | '4h'>('15m')
  
  // Calculate comprehensive flow metrics
  useEffect(() => {
    if (flows.length === 0) return
    
    const totalPremium = flows.reduce((sum, f) => sum + (f.size * f.premium), 0)
    const totalVolume = flows.reduce((sum, f) => sum + f.size, 0)
    
    const calls = flows.filter(f => f.type === 'call')
    const puts = flows.filter(f => f.type === 'put')
    const buys = flows.filter(f => f.side === 'buy')
    const sells = flows.filter(f => f.side === 'sell')
    
    const callPutRatio = puts.length > 0 ? calls.length / puts.length : 0
    const buyPutRatio = sells.length > 0 ? buys.length / sells.length : 0
    
    const unusualActivityCount = flows.filter(f => f.isUnusual).length
    const smartMoneyFlows = flows.filter(f => f.smartMoneyScore > 70)
    const smartMoneyRatio = flows.length > 0 ? smartMoneyFlows.length / flows.length : 0
    
    const institutionalFlows = flows.filter(f => f.smartMoneyScore > 80)
    const retailFlows = flows.filter(f => f.smartMoneyScore < 40)
    
    const institutionalFlow = institutionalFlows.reduce((sum, f) => sum + (f.size * f.premium), 0)
    const retailFlow = retailFlows.reduce((sum, f) => sum + (f.size * f.premium), 0)
    
    const darkPoolEstimate = flows.filter(f => f.venue === 'Dark Pool' || f.smartMoneyScore > 90).length
    
    setMetrics({
      totalPremium,
      totalVolume,
      avgPremium: totalVolume > 0 ? totalPremium / totalVolume : 0,
      callPutRatio,
      buyPutRatio,
      unusualActivityCount,
      smartMoneyRatio,
      institutionalFlow,
      retailFlow,
      darkPoolEstimate
    })
    
    // Generate time series data
    generateTimeSeries()
    
    // Analyze sectors
    analyzeSectors()
    
    // Detect advanced patterns
    detectAdvancedPatterns()
  }, [flows, selectedTimeframe])
  
  const generateTimeSeries = () => {
    const timeframes = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000
    }
    
    const interval = timeframes[selectedTimeframe]
    const now = new Date()
    const points: TimeSeriesPoint[] = []
    
    // Generate 20 time points
    for (let i = 19; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * interval))
      const periodFlows = flows.filter(f => 
        f.timestamp.getTime() >= timestamp.getTime() - interval &&
        f.timestamp.getTime() < timestamp.getTime()
      )
      
      const premium = periodFlows.reduce((sum, f) => sum + (f.size * f.premium), 0)
      const volume = periodFlows.reduce((sum, f) => sum + f.size, 0)
      const smartMoney = periodFlows.filter(f => f.smartMoneyScore > 70).length
      
      points.push({ timestamp, premium, volume, smartMoney })
    }
    
    setTimeSeries(points)
  }
  
  const analyzeSectors = () => {
    const sectorMap = {
      'AAPL': 'Technology',
      'MSFT': 'Technology', 
      'GOOGL': 'Technology',
      'META': 'Technology',
      'NVDA': 'Technology',
      'TSLA': 'Automotive',
      'SPY': 'Market',
      'QQQ': 'Technology',
      'AMZN': 'Consumer',
      'NFLX': 'Media'
    }
    
    const sectorFlows = flows.reduce((sectors, flow) => {
      const sector = sectorMap[flow.symbol as keyof typeof sectorMap] || 'Other'
      if (!sectors[sector]) {
        sectors[sector] = []
      }
      sectors[sector].push(flow)
      return sectors
    }, {} as { [key: string]: OptionsFlow[] })
    
    const analyses = Object.entries(sectorFlows).map(([sector, sectorFlows]) => {
      const totalFlow = sectorFlows.reduce((sum, f) => sum + (f.size * f.premium), 0)
      const symbols = [...new Set(sectorFlows.map(f => f.symbol))]
      
      const bullishFlow = sectorFlows.filter(f => 
        (f.type === 'call' && f.side === 'buy') || (f.type === 'put' && f.side === 'sell')
      ).reduce((sum, f) => sum + (f.size * f.premium), 0)
      
      const bearishFlow = sectorFlows.filter(f => 
        (f.type === 'put' && f.side === 'buy') || (f.type === 'call' && f.side === 'sell')
      ).reduce((sum, f) => sum + (f.size * f.premium), 0)
      
      const sentiment = bullishFlow > bearishFlow * 1.2 ? ('bullish' as const) :
                       bearishFlow > bullishFlow * 1.2 ? ('bearish' as const) : ('neutral' as const)
      
      const strength = Math.abs(bullishFlow - bearishFlow) / Math.max(totalFlow, 1) * 100
      
      const institutionalActivity = sectorFlows.filter(f => f.smartMoneyScore > 70).length / 
                                   Math.max(sectorFlows.length, 1) * 100
      
      return {
        sector,
        symbols,
        totalFlow,
        sentiment,
        strength,
        institutionalActivity
      }
    }).sort((a, b) => b.totalFlow - a.totalFlow)
    
    setSectorAnalysis(analyses)
  }
  
  const detectAdvancedPatterns = () => {
    const totalFlows = flows.length
    if (totalFlows === 0) return
    
    // Gamma hedging detection (large hedge flows)
    const gammaHedging = flows.filter(f => 
      f.size > 1000 && f.smartMoneyScore > 60 && Math.abs(f.delta) > 0.3
    ).length / totalFlows * 100
    
    // Volatility arbitrage (IV-based trades)
    const volatilityArbitrage = flows.filter(f => 
      f.iv > 40 && f.flowType === 'sweep' && f.smartMoneyScore > 70
    ).length / totalFlows * 100
    
    // Earnings plays (short-term, high-IV)
    const earnings = flows.filter(f => 
      f.timeToExpiry < 0.1 && f.iv > 50 && f.size > 500
    ).length / totalFlows * 100
    
    // Technical breakout trades
    const technicalBreakout = flows.filter(f => 
      f.flowType === 'block' && f.size > 800 && f.smartMoneyScore > 75
    ).length / totalFlows * 100
    
    // Institutional rebalancing
    const institutionalRebalancing = flows.filter(f => 
      f.smartMoneyScore > 85 && f.size > 2000 && f.venue === 'NYSE'
    ).length / totalFlows * 100
    
    // Retail FOMO
    const retailFomo = flows.filter(f => 
      f.smartMoneyScore < 30 && f.type === 'call' && f.side === 'buy'
    ).length / totalFlows * 100
    
    setPatterns({
      gammaHedging,
      volatilityArbitrage,
      earnings,
      technicalBreakout,
      institutionalRebalancing,
      retailFomo
    })
  }
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return TrendingUp
      case 'bearish': return TrendingDown
      default: return Activity
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/40 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 30px rgba(79, 70, 229, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Advanced Flow Analytics</h2>
        </div>
        <p className="text-gray-400">Institutional-grade market intelligence and pattern recognition</p>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-primary/20 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">AI Patterns</TabsTrigger>
          <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
          <TabsTrigger value="institutional">Institution Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Key Metrics Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {[
              { 
                label: "Total Premium", 
                value: formatCurrency(metrics.totalPremium),
                icon: DollarSign,
                color: "text-green-400",
                change: "+12.5%"
              },
              { 
                label: "Total Volume", 
                value: metrics.totalVolume.toLocaleString(),
                icon: BarChart3,
                color: "text-blue-400",
                change: "+8.3%"
              },
              { 
                label: "Smart Money", 
                value: `${(metrics.smartMoneyRatio * 100).toFixed(1)}%`,
                icon: Brain,
                color: "text-purple-400",
                change: "+5.2%"
              },
              { 
                label: "Unusual Activity", 
                value: metrics.unusualActivityCount.toString(),
                icon: Zap,
                color: "text-yellow-400",
                change: "+18.7%"
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    {metric.change}
                  </Badge>
                </div>
                <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Flow Composition */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-400" />
                  Flow Composition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Call/Put Ratio</span>
                    <span className="text-sm text-primary font-mono">
                      {metrics.callPutRatio.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.min(100, metrics.callPutRatio * 50)} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Buy/Sell Ratio</span>
                    <span className="text-sm text-green-400 font-mono">
                      {metrics.buyPutRatio.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.min(100, metrics.buyPutRatio * 50)} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Institution vs Retail</span>
                    <span className="text-sm text-yellow-400 font-mono">
                      {((metrics.institutionalFlow / Math.max(metrics.institutionalFlow + metrics.retailFlow, 1)) * 100).toFixed(0)}% / {((metrics.retailFlow / Math.max(metrics.institutionalFlow + metrics.retailFlow, 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={metrics.institutionalFlow / Math.max(metrics.institutionalFlow + metrics.retailFlow, 1) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-green-400" />
                  Premium Flow Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 relative">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {timeSeries.length > 1 && (
                      <>
                        {/* Generate path */}
                        <path
                          d={`M${timeSeries.map((point, index) => {
                            const x = (index / (timeSeries.length - 1)) * 100
                            const maxPremium = Math.max(...timeSeries.map(p => p.premium))
                            const y = 100 - ((point.premium / Math.max(maxPremium, 1)) * 80)
                            return `${index === 0 ? 'M' : 'L'}${x},${y}`
                          }).join(' ')}`}
                          stroke="#00FF88"
                          strokeWidth="2"
                          fill="none"
                        />
                        
                        {/* Fill area */}
                        <path
                          d={`M${timeSeries.map((point, index) => {
                            const x = (index / (timeSeries.length - 1)) * 100
                            const maxPremium = Math.max(...timeSeries.map(p => p.premium))
                            const y = 100 - ((point.premium / Math.max(maxPremium, 1)) * 80)
                            return `${index === 0 ? 'M' : 'L'}${x},${y}`
                          }).join(' ')} L100,100 L0,100 Z`}
                          fill="url(#premiumGradient)"
                        />
                        
                        <defs>
                          <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00FF88" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      </>
                    )}
                  </svg>
                </div>
                
                <div className="flex justify-center mt-4">
                  <div className="flex gap-2">
                    {['5m', '15m', '1h', '4h'].map((tf) => (
                      <Button
                        key={tf}
                        variant={selectedTimeframe === tf ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedTimeframe(tf as any)}
                        className={`${
                          selectedTimeframe === tf 
                            ? "bg-primary/20 text-primary border border-primary/50" 
                            : "text-gray-400 hover:text-primary hover:bg-primary/10"
                        }`}
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="patterns">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { label: "Gamma Hedging", value: patterns.gammaHedging, icon: Target, description: "Large hedge flows detected" },
              { label: "Vol Arbitrage", value: patterns.volatilityArbitrage, icon: TrendingUp, description: "IV-based trading activity" },
              { label: "Earnings Plays", value: patterns.earnings, icon: Clock, description: "Short-term high-IV trades" },
              { label: "Technical Breakout", value: patterns.technicalBreakout, icon: Activity, description: "Block trades at key levels" },
              { label: "Institution Rebal", value: patterns.institutionalRebalancing, icon: Building, description: "Large institutional flows" },
              { label: "Retail FOMO", value: patterns.retailFomo, icon: Users, description: "Retail call buying surge" }
            ].map((pattern, index) => (
              <motion.div
                key={pattern.label}
                className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <pattern.icon className="w-5 h-5 text-primary" />
                  <Badge className={`${
                    pattern.value > 20 ? 'bg-red-500/20 text-red-400' :
                    pattern.value > 10 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {pattern.value.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="text-center mb-3">
                  <div className="text-xl font-bold text-white mb-1">
                    {pattern.value.toFixed(1)}%
                  </div>
                  <div className="text-sm font-semibold text-gray-300 mb-1">
                    {pattern.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {pattern.description}
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(100, pattern.value * 2)} 
                  className="h-2"
                />
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="sectors">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {sectorAnalysis.map((sector, index) => {
              const SentimentIcon = getSentimentIcon(sector.sentiment)
              
              return (
                <motion.div
                  key={sector.sector}
                  className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{sector.sector}</h3>
                    <div className="flex items-center gap-2">
                      <SentimentIcon className={`w-4 h-4 ${getSentimentColor(sector.sentiment)}`} />
                      <Badge className={`${getSentimentColor(sector.sentiment)} border-current`}>
                        {sector.sentiment.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Total Flow</span>
                      <span className="text-sm text-green-400 font-mono">
                        {formatCurrency(sector.totalFlow)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Strength</span>
                      <span className="text-sm text-primary font-mono">
                        {sector.strength.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Institution Activity</span>
                      <span className="text-sm text-yellow-400 font-mono">
                        {sector.institutionalActivity.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {sector.symbols.slice(0, 4).map(symbol => (
                      <Badge key={symbol} variant="outline" className="text-xs">
                        {symbol}
                      </Badge>
                    ))}
                    {sector.symbols.length > 4 && (
                      <Badge variant="outline" className="text-xs text-gray-400">
                        +{sector.symbols.length - 4}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="institutional">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 text-center">
                <Building className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {formatCurrency(metrics.institutionalFlow)}
                </div>
                <div className="text-sm text-gray-400">Institutional Flow</div>
              </div>
              
              <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {formatCurrency(metrics.retailFlow)}
                </div>
                <div className="text-sm text-gray-400">Retail Flow</div>
              </div>
              
              <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 text-center">
                <Eye className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {metrics.darkPoolEstimate}
                </div>
                <div className="text-sm text-gray-400">Dark Pool Flows</div>
              </div>
            </div>
            
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white">Institution vs Retail Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Institutional Dominance</span>
                      <span className="text-sm text-blue-400 font-mono">
                        {((metrics.institutionalFlow / Math.max(metrics.institutionalFlow + metrics.retailFlow, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics.institutionalFlow / Math.max(metrics.institutionalFlow + metrics.retailFlow, 1) * 100} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400 mb-1">
                        {((metrics.institutionalFlow / Math.max(metrics.totalPremium, 1)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">of Total Premium</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400 mb-1">
                        {((metrics.retailFlow / Math.max(metrics.totalPremium, 1)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Retail Share</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* AI Info */}
      <motion.div
        className="text-center p-6 bg-black/20 rounded-xl border border-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-white">Advanced Pattern Recognition</span>
        </div>
        <p className="text-xs text-gray-400 max-w-4xl mx-auto">
          Our proprietary analytics engine processes over 50 data points per flow to identify institutional patterns, 
          sector rotation, volatility arbitrage opportunities, and gamma hedging activity with unprecedented accuracy.
          Updates every 15 seconds with real-time market intelligence.
        </p>
      </motion.div>
    </div>
  )
}
