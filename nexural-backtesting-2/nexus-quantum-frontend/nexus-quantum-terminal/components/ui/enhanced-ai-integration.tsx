"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  Eye,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  BarChart3,
  Shield,
  Rocket
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'optimization' | 'market' | 'risk'
  title: string
  description: string
  confidence: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable: boolean
  suggestedAction?: string
  context: string
  timestamp: Date
}

interface AIRecommendation {
  id: string
  category: 'strategy' | 'risk' | 'execution' | 'market'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  confidence: number
  expectedReturn?: number
  riskReduction?: number
}

interface EnhancedAIIntegrationProps {
  currentTab?: string
  portfolioData?: any
  marketData?: any
  strategyData?: any
}

// Generate contextual AI insights based on current tab and data
const generateContextualInsights = (currentTab: string): AIInsight[] => {
  const baseInsights: AIInsight[] = [
    {
      id: 'vol-spike-warning',
      type: 'warning',
      title: 'Volatility Spike Detected',
      description: 'VIX has increased 25% in the last 2 hours. Consider reducing position sizes or adding hedges.',
      confidence: 0.87,
      priority: 'high',
      actionable: true,
      suggestedAction: 'Reduce position size by 20% or add VIX calls',
      context: 'Market conditions',
      timestamp: new Date()
    },
    {
      id: 'momentum-opportunity',
      type: 'opportunity',
      title: 'Momentum Breakout Signal',
      description: 'AAPL showing strong momentum breakout with high volume. 78% probability of continued uptrend.',
      confidence: 0.78,
      priority: 'medium',
      actionable: true,
      suggestedAction: 'Consider increasing AAPL allocation by 5%',
      context: 'Strategy optimization',
      timestamp: new Date()
    },
    {
      id: 'correlation-breakdown',
      type: 'market',
      title: 'Correlation Breakdown',
      description: 'Traditional sector correlations are breaking down. Diversification benefits may be reduced.',
      confidence: 0.92,
      priority: 'medium',
      actionable: true,
      suggestedAction: 'Review portfolio diversification strategy',
      context: 'Risk management',
      timestamp: new Date()
    },
    {
      id: 'execution-optimization',
      type: 'optimization',
      title: 'Execution Timing Optimization',
      description: 'Your trades show 15% better execution during 10:30-11:00 AM. Consider timing adjustments.',
      confidence: 0.84,
      priority: 'low',
      actionable: true,
      suggestedAction: 'Adjust execution schedule to optimize timing',
      context: 'Execution analytics',
      timestamp: new Date()
    },
    {
      id: 'risk-concentration',
      type: 'risk',
      title: 'Risk Concentration Alert',
      description: 'Technology sector now represents 45% of portfolio risk. Consider rebalancing.',
      confidence: 0.91,
      priority: 'high',
      actionable: true,
      suggestedAction: 'Reduce tech exposure by 10-15%',
      context: 'Portfolio risk',
      timestamp: new Date()
    }
  ]

  // Filter insights based on current tab context
  switch (currentTab) {
    case 'strategy-lab':
      return baseInsights.filter(i => i.context.includes('Strategy') || i.type === 'optimization')
    case 'live-operations':
      return baseInsights.filter(i => i.context.includes('Execution') || i.context.includes('Portfolio') || i.type === 'risk')
    case 'intelligence-center':
      return baseInsights.filter(i => i.context.includes('Market') || i.type === 'market')
    case 'byok-security':
      return baseInsights.filter(i => i.type === 'risk' || i.context.includes('Risk'))
    default:
      return baseInsights
  }
}

const generateAIRecommendations = (): AIRecommendation[] => {
  return [
    {
      id: 'ml-optimization',
      category: 'strategy',
      title: 'Implement ML-Based Position Sizing',
      description: 'Machine learning models show 12% improvement in risk-adjusted returns with dynamic position sizing.',
      impact: 'high',
      effort: 'medium',
      confidence: 0.89,
      expectedReturn: 12.3,
      riskReduction: 8.5
    },
    {
      id: 'options-hedging',
      category: 'risk',
      title: 'Add Options-Based Hedging',
      description: 'Tail risk hedging with put spreads could reduce maximum drawdown by 15% with minimal cost.',
      impact: 'medium',
      effort: 'low',
      confidence: 0.76,
      riskReduction: 15.2
    },
    {
      id: 'execution-improvement',
      category: 'execution',
      title: 'Optimize Order Execution',
      description: 'TWAP execution during high-volume periods could reduce slippage by 8 basis points.',
      impact: 'medium',
      effort: 'low',
      confidence: 0.82,
      expectedReturn: 3.2
    },
    {
      id: 'regime-detection',
      category: 'market',
      title: 'Implement Regime Detection',
      description: 'Market regime detection could improve strategy allocation and reduce volatility by 20%.',
      impact: 'high',
      effort: 'high',
      confidence: 0.85,
      expectedReturn: 8.7,
      riskReduction: 20.1
    }
  ]
}

export const EnhancedAIIntegration: React.FC<EnhancedAIIntegrationProps> = ({ 
  currentTab = 'overview',
  portfolioData,
  marketData,
  strategyData 
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [aiThinking, setAiThinking] = useState(false)

  // Generate contextual insights based on current tab
  useEffect(() => {
    const contextualInsights = generateContextualInsights(currentTab)
    setInsights(contextualInsights)
    setRecommendations(generateAIRecommendations())
  }, [currentTab])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case 'optimization': return <Target className="w-4 h-4 text-blue-400" />
      case 'market': return <BarChart3 className="w-4 h-4 text-purple-400" />
      case 'risk': return <Shield className="w-4 h-4 text-red-400" />
      default: return <Lightbulb className="w-4 h-4 text-yellow-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const handleInsightAction = async (insight: AIInsight) => {
    setAiThinking(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setAiThinking(false)
    
    // Show action result
    alert(`🤖 AI Action Executed: ${insight.suggestedAction}\n\nResult: Action has been queued for execution. You'll receive a notification when complete.`)
  }

  const handleRecommendationImplement = async (recommendation: AIRecommendation) => {
    setAiThinking(true)
    
    // Simulate implementation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setAiThinking(false)
    
    alert(`🚀 Recommendation Implementation Started: ${recommendation.title}\n\nExpected Impact: ${recommendation.expectedReturn ? `+${recommendation.expectedReturn}% returns` : `${recommendation.riskReduction}% risk reduction`}\n\nImplementation will be completed in the background.`)
  }

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#00bbff]" />
            <h2 className="text-2xl font-bold text-white">AI Intelligence Hub</h2>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
            AI Active
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[#a0a0b8]">
          <Eye className="w-4 h-4" />
          Monitoring {currentTab.replace('-', ' ')} context
        </div>
      </div>

      {/* Real-time AI Insights */}
      <Card className="bg-[#1a1a25] border-[#2a2a3e]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00bbff]" />
            Real-time AI Insights
            <Badge className="ml-2 text-xs bg-[#00bbff]/20 text-[#00bbff] border-[#00bbff]/30">
              {insights.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="bg-[#15151f] rounded-lg p-4 border border-[#2a2a3e] hover:border-[#3a3a4e] transition-all cursor-pointer"
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                      <p className="text-sm text-[#a0a0b8]">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </Badge>
                    <div className="text-xs text-[#a0a0b8]">
                      {Math.round(insight.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>

                {insight.actionable && insight.suggestedAction && (
                  <div className="flex items-center justify-between pt-3 border-t border-[#2a2a3e]">
                    <div className="text-sm text-[#a0a0b8]">
                      💡 {insight.suggestedAction}
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleInsightAction(insight)
                      }}
                      disabled={aiThinking}
                      className="bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                    >
                      {aiThinking ? (
                        <>
                          <div className="w-3 h-3 border border-[#00bbff] border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Execute
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-[#1a1a25] border-[#2a2a3e]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-400" />
            AI Strategy Recommendations
          </CardTitle>
          <p className="text-[#a0a0b8] text-sm">
            AI-generated recommendations to improve your trading performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#15151f] rounded-lg p-4 border border-[#2a2a3e] hover:border-[#3a3a4e] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{rec.title}</h3>
                    <p className="text-sm text-[#a0a0b8] mb-2">{rec.description}</p>
                    <Badge className={`text-xs ${rec.category === 'strategy' ? 'text-blue-400 bg-blue-500/20 border-blue-500/30' : 
                      rec.category === 'risk' ? 'text-red-400 bg-red-500/20 border-red-500/30' :
                      rec.category === 'execution' ? 'text-green-400 bg-green-500/20 border-green-500/30' :
                      'text-purple-400 bg-purple-500/20 border-purple-500/30'}`}>
                      {rec.category}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-[#a0a0b8]">Impact</div>
                    <div className={`font-semibold ${getImpactColor(rec.impact)}`}>
                      {rec.impact.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#a0a0b8]">Effort</div>
                    <div className={`font-semibold ${getImpactColor(rec.effort)}`}>
                      {rec.effort.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#a0a0b8]">Confidence</div>
                    <div className="font-semibold text-white">
                      {Math.round(rec.confidence * 100)}%
                    </div>
                  </div>
                </div>

                {(rec.expectedReturn || rec.riskReduction) && (
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    {rec.expectedReturn && (
                      <div className="flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        +{rec.expectedReturn}% returns
                      </div>
                    )}
                    {rec.riskReduction && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Shield className="w-3 h-3" />
                        -{rec.riskReduction}% risk
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => handleRecommendationImplement(rec)}
                  disabled={aiThinking}
                  className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
                  size="sm"
                >
                  {aiThinking ? (
                    <>
                      <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin mr-2" />
                      Implementing...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-3 h-3 mr-2" />
                      Implement Recommendation
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Interface */}
      <Card className="bg-[#1a1a25] border-[#2a2a3e]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-400" />
            AI Assistant Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#15151f] rounded-lg p-4 border border-[#2a2a3e] min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-12 h-12 text-[#00bbff] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Assistant Ready</h3>
              <p className="text-[#a0a0b8] mb-4">
                Use the master terminal at the bottom to chat with the AI assistant. 
                Try commands like "analyze my portfolio" or "suggest optimizations".
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-[#a0a0b8]">
                <Sparkles className="w-4 h-4" />
                Powered by advanced language models
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedAIIntegration
