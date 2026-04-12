"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, Crown, TrendingUp, TrendingDown, Activity, 
  Target, Zap, Eye, Users, Building, Shield, AlertTriangle,
  Layers, BarChart3, Radar, Network, Bot, Sparkles
} from "lucide-react"

// Import our Phase 3 detection engines
import { orderflowEngine, OrderflowSignal } from "@/lib/orderflow/detection-engine"
import { smartMoneyEngine, SmartMoneyMetrics } from "@/lib/orderflow/smart-money-engine"
import { patternRecognitionEngine, PatternSignal } from "@/lib/orderflow/pattern-recognition"
import { institutionalDetectionEngine, TraderProfile } from "@/lib/orderflow/institutional-detection"
import { OptionsFlowGenerator, OptionsFlow } from "@/lib/options-flow-data"

interface EnhancedSmartMoneyAnalysisProps {
  flows?: OptionsFlow[]
  className?: string
}

export default function EnhancedSmartMoneyAnalysis({ 
  flows = [], 
  className = "" 
}: EnhancedSmartMoneyAnalysisProps) {
  // State for all detection engines
  const [orderflowSignals, setOrderflowSignals] = useState<OrderflowSignal[]>([])
  const [smartMoneyMetrics, setSmartMoneyMetrics] = useState<SmartMoneyMetrics[]>([])
  const [patternSignals, setPatternSignals] = useState<PatternSignal[]>([])
  const [traderProfiles, setTraderProfiles] = useState<TraderProfile[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Real-time data generation
  const [liveFlows, setLiveFlows] = useState<OptionsFlow[]>([])
  
  useEffect(() => {
    // Generate initial flows if none provided
    const initialFlows = flows.length > 0 ? flows : OptionsFlowGenerator.generateRealtimeFlow(25)
    setLiveFlows(initialFlows)
    
    // Real-time updates every 2 seconds
    const interval = setInterval(() => {
      const newFlows = OptionsFlowGenerator.generateRealtimeFlow(5)
      setLiveFlows(prev => [...newFlows, ...prev.slice(0, 45)])
    }, 2000)
    
    return () => clearInterval(interval)
  }, [flows])

  // Advanced analysis using Phase 3 engines
  useEffect(() => {
    if (liveFlows.length === 0) return
    
    setIsAnalyzing(true)
    
    // Convert flows to orderflow signals format
    const signals: OrderflowSignal[] = liveFlows.map(flow => ({
      timestamp: new Date(),
      symbol: flow.symbol,
      price: flow.underlyingPrice,
      size: flow.size,
      type: Math.random() > 0.5 ? 'call' : 'put',
      strike: flow.strike || flow.underlyingPrice * (0.95 + Math.random() * 0.1),
      expiration: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      smartMoneyScore: flow.smartMoneyScore,
      institutionalProbability: flow.institutionProbability || Math.random() * 100,
      darkPoolProbability: Math.random() * 100,
      flowType: 'unusual',
      aggressiveness: Math.random() * 100,
      conviction: Math.random() * 100,
      patternType: ['momentum_breakout'],
      volumeProfile: {
        totalVolume: flow.size,
        avgSize: flow.size,
        largeBlockRatio: Math.random(),
        timeDistribution: [],
        priceDistribution: [],
        unusualActivity: flow.smartMoneyScore > 70
      },
      gammaExposure: Math.random() * 1000000,
      deltaHedging: Math.random() > 0.7,
      riskLevel: flow.smartMoneyScore > 80 ? 'high' : 'medium',
      impactScore: Math.random() * 100,
      followThrough: Math.random() * 100
    }))

    // Run all Phase 3 detection engines
    setTimeout(() => {
      // 1. Orderflow Detection
      const detectedSignals = orderflowEngine.detectOrderflow(signals)
      setOrderflowSignals(detectedSignals)
      
      // 2. Smart Money Analysis
      const smartMetrics = smartMoneyEngine.analyzeSmartMoney(detectedSignals)
      setSmartMoneyMetrics(smartMetrics)
      
      // 3. Pattern Recognition
      const patterns = patternRecognitionEngine.recognizePatterns(detectedSignals, {})
      setPatternSignals(patterns)
      
      // 4. Institutional Detection
      const profiles = detectedSignals.length > 0 ? 
        [institutionalDetectionEngine.classifyTrader(detectedSignals)] : []
      setTraderProfiles(profiles)
      
      setIsAnalyzing(false)
    }, 1000) // Simulate processing time
  }, [liveFlows])

  // Aggregate metrics
  const aggregateMetrics = useMemo(() => {
    if (smartMoneyMetrics.length === 0) return null
    
    const avgInstitutional = smartMoneyMetrics.reduce((sum, m) => sum + m.institutionalConfidence, 0) / smartMoneyMetrics.length
    const avgHedgeFund = smartMoneyMetrics.reduce((sum, m) => sum + m.hedgeFundActivity, 0) / smartMoneyMetrics.length
    const avgDarkPool = smartMoneyMetrics.reduce((sum, m) => sum + m.darkPoolActivity, 0) / smartMoneyMetrics.length
    const avgSophistication = smartMoneyMetrics.reduce((sum, m) => sum + m.sophisticationScore, 0) / smartMoneyMetrics.length
    
    return {
      institutionalConfidence: avgInstitutional,
      hedgeFundActivity: avgHedgeFund,
      darkPoolActivity: avgDarkPool,
      sophisticationScore: avgSophistication,
      totalSignals: orderflowSignals.length,
      highConfidenceSignals: orderflowSignals.filter(s => s.smartMoneyScore > 80).length,
      patternsDetected: patternSignals.length
    }
  }, [smartMoneyMetrics, orderflowSignals, patternSignals])

  if (isAnalyzing || !aggregateMetrics) {
    return (
      <div className={`${className}`}>
        <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
          <CardContent className="p-12">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <Brain className="w-16 h-16 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Engine Processing...
              </h3>
              <p className="text-gray-400 mb-6">
                Running advanced orderflow detection algorithms
              </p>
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Orderflow Detection</span>
                  <span className="text-primary">✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Smart Money Analysis</span>
                  <span className="text-primary">✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pattern Recognition</span>
                  <motion.span 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-yellow-400"
                  >
                    Processing...
                  </motion.span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Institutional Detection</span>
                  <span className="text-gray-500">Pending</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Live Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-black/60 backdrop-blur-md border border-primary/30 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Orderflow Intelligence</h2>
            <p className="text-sm text-gray-400">
              {aggregateMetrics.totalSignals} signals • {aggregateMetrics.patternsDetected} patterns detected
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </motion.div>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-black/40 border border-primary/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="institutional">Institutional</TabsTrigger>
          <TabsTrigger value="flow">Live Flow</TabsTrigger>
          <TabsTrigger value="alerts">Smart Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Institutional</p>
                      <p className="text-2xl font-bold text-green-400">
                        {aggregateMetrics.institutionalConfidence.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={aggregateMetrics.institutionalConfidence} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Hedge Fund</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {aggregateMetrics.hedgeFundActivity.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={aggregateMetrics.hedgeFundActivity} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Dark Pool</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {aggregateMetrics.darkPoolActivity.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={aggregateMetrics.darkPoolActivity} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-orange-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8 text-orange-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">AI Confidence</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {aggregateMetrics.sophisticationScore.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={aggregateMetrics.sophisticationScore} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Top Signals */}
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                High-Confidence Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderflowSignals.slice(0, 5).map((signal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-primary/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        signal.smartMoneyScore > 90 ? 'bg-green-400' :
                        signal.smartMoneyScore > 75 ? 'bg-yellow-400' : 'bg-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-white">{signal.symbol}</div>
                        <div className="text-sm text-gray-400">
                          {signal.flowType} • ${signal.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">
                        {signal.smartMoneyScore.toFixed(0)}% Confidence
                      </div>
                      <div className="text-xs text-gray-400">
                        {signal.size.toLocaleString()} contracts
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pattern Recognition Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {patternSignals.slice(0, 4).map((pattern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">
                        {pattern.pattern.replace(/_/g, ' ')}
                      </CardTitle>
                      <Badge variant="outline" className={`${
                        pattern.confidence > 80 ? 'border-green-500/30 text-green-400' :
                        pattern.confidence > 60 ? 'border-yellow-500/30 text-yellow-400' :
                        'border-gray-500/30 text-gray-400'
                      }`}>
                        {pattern.confidence.toFixed(0)}% Confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${
                        pattern.direction === 'bullish' ? 'text-green-400' : 
                        pattern.direction === 'bearish' ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <span className="capitalize text-sm">
                        {pattern.direction} • {pattern.timeframe}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400">
                      {pattern.setup.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Historical Win Rate</p>
                        <p className="font-medium text-white">
                          {(pattern.historicalWinRate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Avg Return</p>
                        <p className="font-medium text-green-400">
                          +{(pattern.avgReturn * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Institutional Analysis Tab */}
        <TabsContent value="institutional" className="space-y-6">
          {traderProfiles.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Trader Profile Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {traderProfiles.map((profile, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {profile.classification} Trader
                      </h3>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {profile.confidence.toFixed(0)}% Confidence
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 bg-black/20 rounded-lg">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          Sophistication
                        </p>
                        <p className="text-lg font-semibold text-primary">
                          {profile.sophisticationScore.toFixed(0)}%
                        </p>
                      </div>
                      
                      <div className="p-3 bg-black/20 rounded-lg">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          Information Edge
                        </p>
                        <p className="text-lg font-semibold text-green-400">
                          {profile.informationEdge.toFixed(0)}%
                        </p>
                      </div>
                      
                      <div className="p-3 bg-black/20 rounded-lg">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          Execution Quality
                        </p>
                        <p className="text-lg font-semibold text-blue-400">
                          {profile.executionQuality.toFixed(0)}%
                        </p>
                      </div>
                      
                      <div className="p-3 bg-black/20 rounded-lg">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          Risk Management
                        </p>
                        <p className="text-lg font-semibold text-purple-400">
                          {profile.riskManagementScore.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-black/20 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Trading Characteristics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Average Trade Size</p>
                          <p className="text-white">{profile.characteristics.avgTradeSize.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Trading Style</p>
                          <p className="text-white capitalize">{profile.tradingStyle.primaryStyle.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Time Horizon</p>
                          <p className="text-white capitalize">{profile.tradingStyle.timeHorizon.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Risk Tolerance</p>
                          <p className="text-white capitalize">{profile.riskProfile.riskTolerance.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Real-Time Orderflow
                </CardTitle>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {orderflowSignals.slice(0, 10).map((signal, index) => (
                    <motion.div
                      key={`${signal.symbol}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-primary/10 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          signal.smartMoneyScore > 90 ? 'bg-green-400 animate-pulse' :
                          signal.smartMoneyScore > 75 ? 'bg-yellow-400' : 'bg-gray-400'
                        }`} />
                        <div>
                          <span className="font-medium text-white">{signal.symbol}</span>
                          <span className="ml-2 text-sm text-gray-400">
                            ${signal.strike?.toFixed(2)} {signal.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">
                            {signal.size.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {signal.flowType}
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          signal.smartMoneyScore > 80 ? 'border-green-500/30 text-green-400' :
                          signal.smartMoneyScore > 60 ? 'border-yellow-500/30 text-yellow-400' :
                          'border-gray-500/30 text-gray-400'
                        }`}>
                          {signal.smartMoneyScore.toFixed(0)}%
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                AI-Powered Smart Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patternSignals.slice(0, 3).map((pattern, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">
                          High-Probability {pattern.pattern.replace(/_/g, ' ')} Detected
                        </h4>
                        <p className="text-sm text-gray-300 mb-2">
                          {pattern.setup.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-yellow-400">
                            Confidence: {pattern.confidence.toFixed(0)}%
                          </span>
                          <span className="text-gray-400">
                            Expected: {pattern.timeframe}
                          </span>
                          <span className={`${
                            pattern.direction === 'bullish' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            Direction: {pattern.direction}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    AI monitoring {orderflowSignals.length} signals for high-probability opportunities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
