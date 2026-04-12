"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Zap, 
  Target, 
  Activity,
  ChevronRight,
  Sparkles,
  ArrowRight,
  PieChart,
  LineChart
} from 'lucide-react'

interface AIWelcomeLandingProps {
  onNavigate: (mainTab: string, subTab: string) => void
}

const QUICK_ACTIONS = [
  {
    id: 'analyze-portfolio',
    title: 'Analyze My Portfolio',
    description: 'Get AI-powered insights on your current positions and performance',
    icon: <PieChart className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
    action: () => ({ mainTab: 'overview', subTab: 'performance-overview' })
  },
  {
    id: 'run-backtest',
    title: 'Run a Backtest',
    description: 'Test your trading strategies against historical market data',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20 border-green-500/30',
    action: () => ({ mainTab: 'strategy', subTab: 'unified-strategy' })
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    description: 'Evaluate your portfolio risk and get hedging recommendations',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20 border-orange-500/30',
    action: () => ({ mainTab: 'overview', subTab: 'risk-management' })
  },
  {
    id: 'market-intelligence',
    title: 'Market Intelligence',
    description: 'Stay updated with AI-curated market insights and opportunities',
    icon: <Activity className="w-5 h-5" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20 border-purple-500/30',
    action: () => ({ mainTab: 'market-intelligence', subTab: 'market-intelligence' })
  },
  {
    id: 'optimize-strategy',
    title: 'Optimize Strategy',
    description: 'Use ML to find optimal parameters for your trading strategies',
    icon: <Target className="w-5 h-5" />,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20 border-pink-500/30',
    action: () => ({ mainTab: 'strategy', subTab: 'ml-factory' })
  },
  {
    id: 'setup-data',
    title: 'Connect Data Sources',
    description: 'Securely connect your API keys to access premium market data',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20 border-cyan-500/30',
    action: () => ({ mainTab: 'data-security', subTab: 'byok-demo' })
  }
]

const AI_SUGGESTIONS = [
  "Analyze current market volatility and its impact on my portfolio",
  "Show me the best performing strategies from the last month",
  "What sectors should I focus on given current market conditions?",
  "Help me optimize my risk-adjusted returns",
  "Generate a new mean reversion strategy for tech stocks"
]

export default function AIWelcomeLanding({ onNavigate }: AIWelcomeLandingProps) {
  const [currentSuggestion, setCurrentSuggestion] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  // Rotate through AI suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true)
      setTimeout(() => {
        setCurrentSuggestion((prev) => (prev + 1) % AI_SUGGESTIONS.length)
        setIsTyping(false)
      }, 500)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleQuickAction = (action: any) => {
    const { mainTab, subTab } = action()
    onNavigate(mainTab, subTab)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1320] to-[#1a1a25] p-6 overflow-y-auto">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-[#00bbff] to-[#0099cc] rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-[#00bbff] to-white bg-clip-text text-transparent">
            Hi, I'm Nexus AI
          </h1>
          
          <p className="text-xl md:text-2xl text-[#a0a0b8] mb-8 max-w-3xl mx-auto leading-relaxed">
            Your AI-powered institutional trading assistant. I'm here to help you analyze markets, 
            optimize strategies, and make smarter trading decisions.
          </p>

          {/* AI Suggestion Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="bg-[#0f1320]/80 backdrop-blur-sm border-[#00bbff]/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#00bbff]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-[#00bbff]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#a0a0b8] text-sm mb-2">💡 Try asking me:</p>
                    <p className={`text-white text-lg transition-opacity duration-500 ${isTyping ? 'opacity-50' : 'opacity-100'}`}>
                      "{AI_SUGGESTIONS[currentSuggestion]}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Badges */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              AI Active
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
              <TrendingUp className="w-3 h-3 mr-2" />
              Markets Open
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
              <Shield className="w-3 h-3 mr-2" />
              Secure
            </Badge>
          </div>
        </div>

        {/* What I Can Help You With */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Here's what I can help you with:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <Card 
                key={action.id}
                className="bg-[#0f1320] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-[#00bbff]/20"
                onClick={() => handleQuickAction(action.action)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <div className={action.color}>
                        {action.icon}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#a0a0b8] group-hover:text-[#00bbff] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#00bbff] transition-colors duration-300">
                    {action.title}
                  </h3>
                  
                  <p className="text-[#a0a0b8] text-sm leading-relaxed">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-[#0f1320] border-[#2a2a3e]">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#00bbff] mb-2">24/7</div>
              <div className="text-[#a0a0b8] text-sm">AI Monitoring</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0f1320] border-[#2a2a3e]">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-[#a0a0b8] text-sm">Accuracy Rate</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0f1320] border-[#2a2a3e]">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">1000+</div>
              <div className="text-[#a0a0b8] text-sm">Strategies Analyzed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0f1320] border-[#2a2a3e]">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">&lt;50ms</div>
              <div className="text-[#a0a0b8] text-sm">Response Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-[#00bbff]/10 to-[#0099cc]/10 border-[#00bbff]/30 shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to supercharge your trading?
              </h3>
              <p className="text-[#a0a0b8] mb-6 max-w-2xl mx-auto">
                Let's start by analyzing your portfolio or exploring market opportunities. 
                Click on any action above or ask me anything in the terminal below.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#00bbff] hover:bg-[#0099cc] text-white px-8 py-3"
                  onClick={() => handleQuickAction(QUICK_ACTIONS[0].action)}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Analyze Portfolio
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-[#2a2a3e] text-white hover:bg-[#1a1a25] px-8 py-3"
                  onClick={() => handleQuickAction(QUICK_ACTIONS[1].action)}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Run Backtest
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[#606078] text-sm">
            🤖 Powered by advanced AI models • 🔒 Bank-level security • 📊 Real-time market data
          </p>
        </div>
      </div>
    </div>
  )
}
