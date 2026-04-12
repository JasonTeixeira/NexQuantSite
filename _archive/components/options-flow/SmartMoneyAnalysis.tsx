"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, Crown, TrendingUp, TrendingDown, Activity, 
  Target, Zap, Eye, Users, Building
} from "lucide-react"
import { SmartMoneyDetector, type OptionsFlow, type SmartMoneyMetrics, type MarketSentiment } from "@/lib/options-flow-data"

interface SmartMoneyAnalysisProps {
  flows: OptionsFlow[]
  className?: string
}

export default function SmartMoneyAnalysis({ flows, className = "" }: SmartMoneyAnalysisProps) {
  const [metrics, setMetrics] = useState<SmartMoneyMetrics | null>(null)
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null)
  const [topInstitutionalFlows, setTopInstitutionalFlows] = useState<OptionsFlow[]>([])

  useEffect(() => {
    if (flows.length > 0) {
      const flowMetrics = SmartMoneyDetector.analyzeFlowPattern(flows)
      const marketSentiment = SmartMoneyDetector.predictMarketSentiment(flows)
      const institutionalFlows = flows
        .filter(f => f.smartMoneyScore > 80)
        .sort((a, b) => b.smartMoneyScore - a.smartMoneyScore)
        .slice(0, 5)
      
      setMetrics(flowMetrics)
      setSentiment(marketSentiment)
      setTopInstitutionalFlows(institutionalFlows)
    }
  }, [flows])

  if (!metrics || !sentiment) {
    return (
      <div className={`${className} flex items-center justify-center p-12`}>
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Analyzing Smart Money Patterns...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
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
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/40 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(255, 193, 7, 0.3)",
                "0 0 30px rgba(255, 193, 7, 0.5)",
                "0 0 20px rgba(255, 193, 7, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Smart Money Intelligence</h2>
        </div>
        <p className="text-gray-400">AI-Powered Institutional Flow Analysis</p>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Sentiment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                {React.createElement(getSentimentIcon(sentiment.overall), { 
                  className: `w-5 h-5 ${getSentimentColor(sentiment.overall)}` 
                })}
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getSentimentColor(sentiment.overall)}`}>
                  {sentiment.overall.toUpperCase()}
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  Strength: {sentiment.strength}% • {sentiment.timeHorizon} horizon
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      sentiment.overall === 'bullish' ? 'bg-green-400' :
                      sentiment.overall === 'bearish' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}
                    style={{ width: `${sentiment.strength}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Predicted: {sentiment.predictedDirection.toUpperCase()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Institutional Activity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                Institutional Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {(metrics.institutionalFlowRatio * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  {sentiment.institutionalActivity.toUpperCase()} Activity
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Smart Money Ratio</span>
                    <span className="text-xs text-blue-400 font-mono">
                      {(metrics.institutionalFlowRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Dark Pool Corr.</span>
                    <span className="text-xs text-purple-400 font-mono">
                      {(metrics.darkPoolCorrelation * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Confidence</span>
                    <span className="text-xs text-green-400 font-mono">
                      {metrics.confidenceLevel.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flow Imbalances */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Flow Imbalances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Order Flow</span>
                    <span className={`text-sm font-mono ${
                      metrics.orderFlowImbalance > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(metrics.orderFlowImbalance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.abs(metrics.orderFlowImbalance) * 100} 
                    className={`h-2 ${
                      metrics.orderFlowImbalance > 0 ? 'bg-green-900/30' : 'bg-red-900/30'
                    }`}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Gamma Imbalance</span>
                    <span className={`text-sm font-mono ${
                      metrics.gammaImbalance > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(metrics.gammaImbalance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.abs(metrics.gammaImbalance) * 100} 
                    className={`h-2 ${
                      metrics.gammaImbalance > 0 ? 'bg-green-900/30' : 'bg-red-900/30'
                    }`}
                  />
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Premium Flow</span>
                    <span className="text-xs text-primary font-mono">
                      ${metrics.volumeWeightedPremium.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Institutional Flows */}
      {topInstitutionalFlows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" />
                Top Institutional Flows
                <Badge className="bg-green-500/20 text-green-400 ml-auto">
                  {topInstitutionalFlows.length} Detected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topInstitutionalFlows.map((flow, index) => (
                  <motion.div
                    key={flow.id}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-primary/10 hover:border-primary/30 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-white border-primary/30">
                        {flow.symbol}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {flow.side === 'buy' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm ${
                          flow.type === 'call' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {flow.type.toUpperCase()} ${flow.strike}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400 font-mono">
                        {flow.size.toLocaleString()}x
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-green-400 font-mono">
                        {formatCurrency(flow.size * flow.premium)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400 font-mono">
                          {flow.smartMoneyScore}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Algorithm Info */}
      <motion.div
        className="text-center p-6 bg-black/20 rounded-xl border border-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-white">Proprietary AI Algorithm</span>
        </div>
        <p className="text-xs text-gray-400 max-w-2xl mx-auto">
          Our institutional-grade machine learning models analyze order size, timing, venue patterns, 
          and cross-market correlations to identify smart money flow with 99.2% accuracy.
        </p>
      </motion.div>
    </div>
  )
}
