"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Brain, 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  Lightbulb,
  Target,
  Zap,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Context types for AI awareness
export interface DashboardContext {
  currentTab: string
  currentSubTab: string
  selectedTimeframe?: string
  activeStrategy?: string
  portfolioValue?: number
  recentPerformance?: {
    returns: number
    sharpe: number
    drawdown: number
  }
  marketConditions?: {
    trend: 'bullish' | 'bearish' | 'neutral'
    volatility: 'low' | 'medium' | 'high'
  }
  userActivity?: {
    lastAction: string
    timeSpent: number
    featuresUsed: string[]
  }
}

export interface AIMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  context?: DashboardContext
  suggestions?: string[]
  actionItems?: Array<{
    label: string
    action: () => void
    icon?: React.ComponentType<any>
  }>
  metadata?: {
    confidence?: number
    sources?: string[]
    reasoning?: string
  }
}

interface ContextAwareAIAssistantProps {
  context: DashboardContext
  onNavigate?: (tab: string, subTab?: string) => void
  onActionExecute?: (action: string, params?: any) => void
  isMinimized?: boolean
  onToggleSize?: () => void
}

// Enhanced AI response generation with context awareness
const generateContextAwareResponse = async (
  userMessage: string, 
  context: DashboardContext,
  messageHistory: AIMessage[]
): Promise<AIMessage> => {
  const timestamp = new Date()
  
  // Analyze user intent and current context
  const intent = analyzeUserIntent(userMessage.toLowerCase())
  const contextualInsights = generateContextualInsights(context)
  
  let response = ''
  let suggestions: string[] = []
  let actionItems: Array<{ label: string; action: () => void; icon?: React.ComponentType<any> }> = []
  
  // Context-aware response generation
  if (intent.includes('performance')) {
    response = generatePerformanceInsight(context, userMessage)
    suggestions = [
      "Analyze risk-adjusted returns",
      "Compare to benchmark",
      "Check sector allocation",
      "Review recent trades"
    ]
    actionItems = [
      {
        label: "View Performance Dashboard",
        action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 'analytics', subTab: 'performance-dashboard' }})),
        icon: TrendingUp
      }
    ]
  } else if (intent.includes('risk')) {
    response = generateRiskAnalysis(context, userMessage)
    suggestions = [
      "Check portfolio beta",
      "Analyze correlation matrix",
      "Review position sizes",
      "Stress test scenarios"
    ]
    actionItems = [
      {
        label: "Open Risk Monitor",
        action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 'analytics', subTab: 'risk-monitor' }})),
        icon: AlertTriangle
      }
    ]
  } else if (intent.includes('strategy')) {
    response = generateStrategyRecommendation(context, userMessage)
    suggestions = [
      "Build new strategy",
      "Backtest existing strategy",
      "Optimize parameters",
      "Review signal quality"
    ]
    actionItems = [
      {
        label: "Open Strategy Builder",
        action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 'testing-lab', subTab: 'strategy-builder' }})),
        icon: Zap
      }
    ]
  } else if (intent.includes('market')) {
    response = generateMarketInsight(context, userMessage)
    suggestions = [
      "Check sector rotation",
      "Analyze volatility trends",
      "Review earnings calendar",
      "Monitor Fed policy"
    ]
  } else {
    // General contextual response
    response = generateGeneralResponse(context, userMessage, contextualInsights)
    suggestions = getContextualSuggestions(context)
  }
  
  return {
    id: `ai-${timestamp.getTime()}`,
    type: 'ai',
    content: response,
    timestamp,
    context,
    suggestions,
    actionItems,
    metadata: {
      confidence: 0.85,
      sources: ['Portfolio Analysis', 'Market Data', 'Performance Metrics'],
      reasoning: `Based on current ${context.currentTab} context and recent ${context.userActivity?.lastAction || 'activity'}`
    }
  }
}

// Intent analysis
const analyzeUserIntent = (message: string): string[] => {
  const intents: string[] = []
  
  const intentPatterns = {
    performance: ['performance', 'returns', 'profit', 'loss', 'pnl', 'sharpe', 'drawdown'],
    risk: ['risk', 'volatility', 'exposure', 'beta', 'var', 'stress', 'correlation'],
    strategy: ['strategy', 'backtest', 'optimize', 'signal', 'entry', 'exit', 'rules'],
    market: ['market', 'trend', 'sector', 'economic', 'fed', 'earnings', 'news'],
    portfolio: ['portfolio', 'allocation', 'rebalance', 'position', 'holding', 'weight'],
    trading: ['trade', 'buy', 'sell', 'order', 'execution', 'slippage', 'fill']
  }
  
  Object.entries(intentPatterns).forEach(([intent, patterns]) => {
    if (patterns.some(pattern => message.includes(pattern))) {
      intents.push(intent)
    }
  })
  
  return intents
}

// Context-specific response generators
const generatePerformanceInsight = (context: DashboardContext, message: string): string => {
  const perf = context.recentPerformance
  if (!perf) return "I'd be happy to help analyze your performance, but I don't see current performance data. Let me pull up your performance dashboard."
  
  return `📈 **Performance Analysis**

Based on your current portfolio performance:
• **YTD Returns**: ${perf.returns > 0 ? '+' : ''}${perf.returns.toFixed(1)}% ${perf.returns > 10 ? '🚀 Excellent!' : perf.returns > 0 ? '✅ Positive' : '📉 Needs attention'}
• **Sharpe Ratio**: ${perf.sharpe.toFixed(2)} ${perf.sharpe > 1.5 ? '🏆 Outstanding' : perf.sharpe > 1 ? '👍 Good' : '⚠️ Can improve'}
• **Max Drawdown**: ${perf.drawdown.toFixed(1)}% ${perf.drawdown < 10 ? '✅ Controlled' : '⚠️ High'}

**🎯 Key Insights:**
${perf.returns > 15 ? '• Your portfolio is significantly outperforming the market' : '• Consider reviewing underperforming positions'}
${perf.sharpe > 1.5 ? '• Excellent risk-adjusted returns' : '• Focus on improving risk management'}
${perf.drawdown > 15 ? '• High drawdown suggests position sizing review needed' : '• Drawdown is well controlled'}

Would you like me to dive deeper into any specific aspect?`
}

const generateRiskAnalysis = (context: DashboardContext, message: string): string => {
  return `🛡️ **Risk Analysis**

Current risk assessment for your ${context.currentTab} portfolio:

**📊 Risk Metrics:**
• **Portfolio Beta**: 1.12 (12% more volatile than market)
• **Value at Risk (95%)**: -2.4% daily
• **Correlation to SPY**: 0.78 (high market correlation)
• **Sector Concentration**: Technology 28% (moderate risk)

**⚠️ Risk Alerts:**
• Single position exceeds 8% allocation (TSLA)
• High correlation between top 3 holdings
• Increased volatility in current market conditions

**💡 Recommendations:**
• Consider reducing TSLA position to 5%
• Add defensive sectors for diversification  
• Implement dynamic position sizing based on volatility

Shall I help you implement any of these risk management strategies?`
}

const generateStrategyRecommendation = (context: DashboardContext, message: string): string => {
  const marketCondition = context.marketConditions?.trend || 'neutral'
  
  return `🧠 **Strategy Recommendations**

Based on current ${marketCondition} market conditions and your ${context.currentTab} focus:

**🎯 Optimal Strategies:**
${marketCondition === 'bullish' ? 
`• **Momentum Strategy**: Capitalize on strong trends
• **Growth Focus**: High-growth stocks outperforming
• **Breakout Trading**: Strong momentum continuation` :
marketCondition === 'bearish' ? 
`• **Mean Reversion**: Buy oversold quality names
• **Defensive Allocation**: Utilities, healthcare focus  
• **Put Protection**: Hedge existing positions` :
`• **Market Neutral**: Long/short paired trades
• **Volatility Trading**: Benefit from uncertainty
• **Sector Rotation**: Follow rotation patterns`}

**📈 Performance Optimization:**
• Current strategy Sharpe ratio: ${context.recentPerformance?.sharpe.toFixed(2) || '1.45'}
• Suggested improvements: Dynamic position sizing
• Risk-adjusted target: +${((context.recentPerformance?.returns || 10) * 1.2).toFixed(1)}% returns

Ready to build a new strategy or optimize your current approach?`
}

const generateMarketInsight = (context: DashboardContext, message: string): string => {
  return `🌍 **Market Intelligence**

**Current Market Conditions:**
• **Trend**: ${context.marketConditions?.trend.toUpperCase() || 'NEUTRAL'} 
• **Volatility**: ${context.marketConditions?.volatility.toUpperCase() || 'MEDIUM'}
• **Market Regime**: Risk-${context.marketConditions?.trend === 'bullish' ? 'On' : 'Off'}

**📊 Key Levels:**
• SPY: Support 440, Resistance 455
• VIX: ${context.marketConditions?.volatility === 'high' ? 'Elevated (>25)' : 'Normal range'}
• Sector Leaders: Technology, Healthcare outperforming

**🔮 Market Outlook:**
${context.marketConditions?.trend === 'bullish' ? 
'• Strong momentum continuation likely\n• Favor growth and momentum strategies\n• Watch for overextension signals' :
'• Defensive positioning recommended\n• Quality over growth preference\n• Monitor for capitulation signals'}

**💡 Actionable Insights:**
• Adjust portfolio beta based on market regime
• Consider sector rotation opportunities
• Monitor key economic indicators (CPI, Fed policy)

Would you like specific sector recommendations or volatility analysis?`
}

const generateGeneralResponse = (context: DashboardContext, message: string, insights: string[]): string => {
  return `👋 I'm here to help with your trading analysis!

**🎯 Current Context:**
• You're on the ${context.currentTab.replace('-', ' ')} section
• Portfolio value: ${context.portfolioValue ? `$${context.portfolioValue.toLocaleString()}` : 'Loading...'}
• Recent activity: ${context.userActivity?.lastAction || 'Dashboard navigation'}

**💡 Smart Suggestions:**
${insights.slice(0, 3).map(insight => `• ${insight}`).join('\n')}

I can help you with:
• Performance analysis and optimization
• Risk management and portfolio allocation  
• Strategy development and backtesting
• Market analysis and trend identification
• Real-time trading decisions

What would you like to explore?`
}

// Generate contextual insights
const generateContextualInsights = (context: DashboardContext): string[] => {
  const insights: string[] = []
  
  if (context.currentTab === 'analytics' && context.recentPerformance) {
    if (context.recentPerformance.sharpe > 2) {
      insights.push("Your Sharpe ratio is excellent - consider scaling position sizes")
    }
    if (context.recentPerformance.drawdown > 15) {
      insights.push("Recent drawdown is elevated - review risk management rules")
    }
  }
  
  if (context.currentTab === 'testing-lab') {
    insights.push("Perfect time to backtest strategies - market data is fresh")
    insights.push("Consider testing multiple timeframes for robustness")
  }
  
  if (context.marketConditions?.volatility === 'high') {
    insights.push("High volatility environment - reduce position sizes")
    insights.push("Consider volatility-based strategies")
  }
  
  return insights
}

const getContextualSuggestions = (context: DashboardContext): string[] => {
  const suggestions = [
    "Analyze my current performance",
    "What's my portfolio risk level?",
    "Suggest optimization strategies",
    "Review recent market trends"
  ]
  
  // Add context-specific suggestions
  if (context.currentTab === 'testing-lab') {
    suggestions.unshift("Help me build a new strategy")
    suggestions.unshift("Optimize my current backtest")
  }
  
  if (context.currentTab === 'analytics') {
    suggestions.unshift("Explain my risk metrics")
    suggestions.unshift("Compare to benchmark")
  }
  
  return suggestions
}

export default function ContextAwareAIAssistant({ 
  context, 
  onNavigate, 
  onActionExecute, 
  isMinimized = false, 
  onToggleSize 
}: ContextAwareAIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'ai',
      content: `🚀 **Context-Aware AI Assistant Ready!**

I can see you're currently on the **${context.currentTab.replace('-', ' ')}** section. I'm here to provide intelligent insights based on your current activity and portfolio context.

**🧠 What I can do:**
• Analyze your performance in real-time
• Provide contextual strategy recommendations  
• Help with risk management decisions
• Offer market insights and trends
• Guide you through complex features

**💡 Try asking:**
• "How is my portfolio performing?"
• "What's my current risk exposure?"
• "Suggest a strategy for current market conditions"

What would you like to explore first?`,
      timestamp: new Date(),
      context,
      suggestions: getContextualSuggestions(context)
    }
    
    setMessages([welcomeMessage])
  }, [])
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { tab, subTab } = event.detail
      onNavigate?.(tab, subTab)
    }
    
    window.addEventListener('navigate', handleNavigate as EventListener)
    return () => window.removeEventListener('navigate', handleNavigate as EventListener)
  }, [onNavigate])
  
  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return
    
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      context
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const aiResponse = await generateContextAwareResponse(input.trim(), context, messages)
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('AI Response Error:', error)
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
        context
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, context, messages])
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleSize}
          className="w-14 h-14 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Brain className="w-6 h-6 text-white" />
          {messages.length > 1 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{messages.length - 1}</span>
            </div>
          )}
        </button>
      </div>
    )
  }
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] bg-[#0f1320] border-[#2a2a3e] shadow-2xl z-50 flex flex-col">
      <CardHeader className="border-b border-[#2a2a3e] pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            Context AI
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live</span>
            </div>
          </CardTitle>
          <div className="flex gap-1">
            <Button onClick={onToggleSize} variant="ghost" size="sm">
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button onClick={onToggleSize} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Context Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#1a1a2e] rounded-md">
            <Target className="w-3 h-3 text-[#00bbff]" />
            <span className="text-[#a0a0b8]">{context.currentTab.replace('-', ' ')}</span>
          </div>
          {context.portfolioValue && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#1a1a2e] rounded-md">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-[#a0a0b8]">${context.portfolioValue.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-[#00bbff] text-white' 
                  : 'bg-[#1a1a2e] text-white border border-[#2a2a3e]'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line.startsWith('•') ? (
                        <span className="flex items-start gap-2">
                          <span className="text-[#00bbff] mt-1">•</span>
                          <span>{line.substring(1).trim()}</span>
                        </span>
                      ) : line.startsWith('**') && line.endsWith('**') ? (
                        <strong className="text-[#00bbff]">{line.slice(2, -2)}</strong>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.slice(0, 3).map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-2 bg-[#2a2a3e] hover:bg-[#3a3a4e] rounded text-sm text-[#a0a0b8] hover:text-white transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Action Items */}
                {message.actionItems && message.actionItems.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actionItems.map((action, i) => (
                      <button
                        key={i}
                        onClick={action.action}
                        className="flex items-center gap-2 w-full p-2 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 rounded text-sm text-[#00bbff] transition-colors"
                      >
                        {action.icon && <action.icon className="w-4 h-4" />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3a3a4e] text-xs text-[#606078]">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.type === 'ai' && (
                    <div className="flex gap-1">
                      <button className="hover:text-green-400"><ThumbsUp className="w-3 h-3" /></button>
                      <button className="hover:text-red-400"><ThumbsDown className="w-3 h-3" /></button>
                      <button className="hover:text-[#00bbff]"><Copy className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-3 flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-[#00bbff] border-t-transparent rounded-full"></div>
                <span className="text-[#a0a0b8]">AI is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="border-t border-[#2a2a3e] pt-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your portfolio, strategies, or market conditions..."
                className="w-full p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-white placeholder-[#606078] resize-none focus:outline-none focus:border-[#00bbff] focus:ring-1 focus:ring-[#00bbff] min-h-[44px] max-h-24"
                rows={1}
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="h-11 px-4 bg-[#00bbff] hover:bg-[#00a3e0] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

