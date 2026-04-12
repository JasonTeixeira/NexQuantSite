"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Terminal, TrendingUp, Shield, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface NexusAIPromptProps {
  onCommand?: (command: string) => void
  className?: string
}

export default function NexusAIPrompt({ onCommand, className = "" }: NexusAIPromptProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Welcome to Nexus AI! I can help you analyze strategies, manage risk, and optimize your portfolio. Try commands like "analyze portfolio", "check risk", or ask me anything about trading.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickActions = [
    { icon: TrendingUp, label: "Analyze Portfolio", command: "analyze my current portfolio performance" },
    { icon: Shield, label: "Risk Check", command: "perform a comprehensive risk analysis" },
    { icon: Target, label: "Optimize", command: "suggest portfolio optimizations" }
  ]

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)
    
    // Call the onCommand callback if provided
    if (onCommand) {
      onCommand(input.trim())
    }

    const currentInput = input.trim()
    setInput('')

    try {
      // Simulate AI processing with realistic responses
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      const aiResponse = generateAIResponse(currentInput)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '❌ Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('portfolio') || lowerInput.includes('analyze')) {
      return `📊 **Portfolio Analysis Complete**

**Current Performance:**
• Total Return: +12.7% YTD
• Sharpe Ratio: 1.84
• Max Drawdown: -3.2%
• Beta: 0.92

**Key Insights:**
• Your tech allocation (35%) is performing well
• Consider rebalancing energy sector (overweight at 15%)
• Strong momentum in your growth positions

**Recommendations:**
• Take profits on NVDA (+47% position)
• Add defensive positions for Q4
• Consider increasing cash allocation to 8%`
    }
    
    if (lowerInput.includes('risk')) {
      return `🛡️ **Risk Analysis Summary**

**Risk Metrics:**
• Portfolio VaR (95%): -2.1%
• Expected Shortfall: -3.8%
• Correlation to SPY: 0.78

**Risk Factors:**
⚠️ High concentration in tech sector
⚠️ Limited international exposure
✅ Good sector diversification otherwise

**Recommendations:**
• Reduce single-stock concentration
• Add international ETFs
• Consider hedging with VIX calls`
    }
    
    if (lowerInput.includes('optimize')) {
      return `🎯 **Portfolio Optimization Suggestions**

**Efficient Frontier Analysis:**
• Current Sharpe: 1.84
• Optimal Sharpe: 2.12 (achievable)

**Recommended Changes:**
1. Reduce AAPL from 8% to 5%
2. Add SCHD (dividend ETF) 7%
3. Increase VXUS to 15%
4. Add small-cap value exposure

**Expected Impact:**
• +15% improvement in risk-adjusted returns
• -12% reduction in portfolio volatility
• Better downside protection`
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('command')) {
      return `🤖 **Available Commands:**

**Analysis:**
• "analyze portfolio" - Full performance review
• "check risk" - Risk metrics and warnings
• "optimize" - Improvement suggestions

**Market Data:**
• "market outlook" - Current market analysis
• "sector rotation" - Sector performance insights
• "earnings calendar" - Upcoming earnings

**Strategy:**
• "backtest [strategy]" - Run historical analysis
• "paper trade" - Start virtual trading
• "alerts" - Set up notifications

Just ask me anything in natural language!`
    }
    
    // Default response for unrecognized inputs
    return `🤖 I understand you're asking about "${input}". 

I can help you with:
• Portfolio analysis and optimization
• Risk management and alerts  
• Market insights and strategy testing
• Backtesting and performance metrics

Try asking something like "What's my portfolio performance?" or "How can I reduce risk?"`
  }

  const handleQuickAction = (command: string) => {
    setInput(command)
    // Auto-send the quick action
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`bg-[#0f1320] border-t border-[#2a2a3e] ${className}`}>
      {/* Expandable Chat History */}
      {isExpanded && (
        <div className="border-b border-[#2a2a3e] max-h-80 overflow-y-auto">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-md p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-[#00bbff] text-white ml-auto' 
                    : 'bg-[#1a1a2e] border border-[#2a2a3e] text-white'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-[#2a2a3e] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#a0a0b8]" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[#606078]">Quick Actions:</span>
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.command)}
              className="bg-[#15151f] border-[#2a2a3e] text-[#a0a0b8] hover:text-white hover:border-[#00bbff]/50 transition-colors text-xs h-7"
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Input Area */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          {/* AI Status Indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
              <Terminal className="w-3 h-3 text-white" />
            </div>
            <span className="text-cyan-400 font-mono text-sm font-semibold">nexus@ai $</span>
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your portfolio, risk, or trading strategies..."
              className="bg-transparent border-none text-white font-mono text-sm placeholder:text-[#606078] focus:outline-none focus:ring-0 pr-12"
              disabled={isProcessing}
              autoFocus
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            size="sm"
            className="bg-[#00bbff] hover:bg-[#0099dd] text-white border-0 h-8 w-8 p-0 flex-shrink-0"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>

          {/* Expand/Collapse Button */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="bg-[#15151f] border-[#2a2a3e] text-[#a0a0b8] hover:text-white hover:border-[#00bbff]/50 h-8 w-8 p-0 flex-shrink-0"
          >
            {isExpanded ? '▼' : '▲'}
          </Button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 mt-2 text-cyan-400 font-mono text-xs">
            <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <span>Processing your request...</span>
          </div>
        )}

        {/* AI Status */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs text-[#606078]">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>AI Active • {messages.length - 1} interactions</span>
          </div>
          <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30 text-xs">
            Context Aware
          </Badge>
        </div>
      </div>
    </div>
  )
}
