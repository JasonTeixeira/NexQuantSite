"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  BarChart3,
  Brain,
  Send,
  Lightbulb,
  Activity,
  Shield,
  Zap
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

interface StrategyAnalysis {
  id: string
  strategyName: string
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: Suggestion[]
  keyMetrics: {
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    avgReturn: number
    volatility: number
  }
  chartRecommendations: ChartRecommendation[]
  riskAssessment: RiskLevel
}

interface Suggestion {
  type: 'critical' | 'important' | 'optimization'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  implementation: string
  expectedImprovement: string
}

interface ChartRecommendation {
  chartType: 'equity' | 'drawdown' | 'rolling-sharpe' | 'monthly-returns' | 'risk-adjusted'
  title: string
  reason: string
  insights: string[]
  data: any[]
}

type RiskLevel = 'conservative' | 'moderate' | 'aggressive' | 'extreme'

export default function AIStrategyAnalyst() {
  const [analysis, setAnalysis] = useState<StrategyAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedChart, setSelectedChart] = useState<ChartRecommendation | null>(null)
  const [userQuestion, setUserQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([])
  const [isResponding, setIsResponding] = useState(false)
  const [liveMode, setLiveMode] = useState(true) // New: Live AI monitoring

  // Mock strategy analysis - in real app, this would come from your AI backend
  const generateAnalysis = async (): Promise<StrategyAnalysis> => {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate AI thinking
    
    return {
      id: 'analysis-' + Date.now(),
      strategyName: 'ML-Enhanced Momentum Strategy',
      overallScore: 73,
      strengths: [
        'Strong risk-adjusted returns (Sharpe 1.85)',
        'Consistent performance across market cycles', 
        'Good diversification across sectors',
        'Effective momentum capture during trends'
      ],
      weaknesses: [
        'Excessive drawdown during market reversals (18.5%)',
        'Poor performance in sideways markets',
        'High correlation with market beta during stress',
        'Sensitivity to transaction costs'
      ],
      suggestions: [
        {
          type: 'critical',
          title: 'Implement Dynamic Position Sizing',
          description: 'Your strategy shows 18.5% max drawdown. Implement volatility-based position sizing to reduce risk during high-volatility periods.',
          impact: 'high',
          implementation: 'Add a volatility filter using 20-day ATR. Reduce position size by 50% when ATR > 2x historical average.',
          expectedImprovement: 'Could reduce max drawdown to 12-14% while maintaining 80% of returns'
        },
        {
          type: 'important', 
          title: 'Add Market Regime Detection',
          description: 'Strategy underperforms in sideways markets. Add regime detection to reduce exposure during low-momentum periods.',
          impact: 'high',
          implementation: 'Use VIX and trend strength indicators to classify market regimes. Reduce allocation by 30% in sideways markets.',
          expectedImprovement: 'Could improve Sharpe ratio from 1.85 to 2.1+'
        },
        {
          type: 'optimization',
          title: 'Optimize Rebalancing Frequency',
          description: 'Daily rebalancing may be causing high transaction costs and reducing net returns.',
          impact: 'medium', 
          implementation: 'Test weekly or bi-weekly rebalancing. Use transaction cost analysis to find optimal frequency.',
          expectedImprovement: 'Could improve net returns by 0.8-1.2% annually'
        }
      ],
      keyMetrics: {
        sharpeRatio: 1.85,
        maxDrawdown: 18.5,
        winRate: 58.3,
        avgReturn: 15.2,
        volatility: 12.8
      },
      chartRecommendations: [
        {
          chartType: 'drawdown',
          title: 'Drawdown Analysis - Critical Risk Periods',
          reason: 'Your strategy has concerning drawdown periods that need immediate attention',
          insights: [
            'March 2020: 18.5% drawdown lasted 3.5 months',
            'Q4 2018: 12.8% drawdown during momentum reversal', 
            'Average recovery time: 4.2 months (industry avg: 2.8 months)',
            'Drawdown clustering suggests systematic risk exposure'
          ],
          data: generateDrawdownData()
        },
        {
          chartType: 'rolling-sharpe',
          title: 'Rolling 12M Sharpe Ratio - Performance Consistency',
          reason: 'Shows periods where your strategy struggled with risk-adjusted returns',
          insights: [
            'Sharpe ratio drops below 1.0 during market stress',
            'Most consistent performance in trending markets',
            'Need better downside protection mechanisms',
            'Consider adding alternative risk premia during low-Sharpe periods'
          ],
          data: generateRollingSharpeData()
        },
        {
          chartType: 'monthly-returns',
          title: 'Monthly Return Distribution - Tail Risk',
          reason: 'Reveals return skewness and tail risk characteristics',
          insights: [
            '15% of months show negative returns > -5%',
            'Positive skew in trending markets (+2.8% avg)',
            'Negative skew during reversals (-4.2% avg)',
            'Fat tails suggest need for dynamic hedging'
          ],
          data: generateMonthlyReturnsData()
        }
      ],
      riskAssessment: 'moderate'
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const result = await generateAnalysis()
      setAnalysis(result)
      setSelectedChart(result.chartRecommendations[0]) // Show first chart by default
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return
    
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }])
    setIsResponding(true)
    setUserQuestion('')
    
    // Simulate AI response based on the question
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let aiResponse = ''
    const question = userQuestion.toLowerCase()
    
    if (question.includes('drawdown') || question.includes('risk')) {
      aiResponse = `Based on your strategy's 18.5% max drawdown, I recommend implementing these immediate improvements:

1. **Volatility-Based Position Sizing**: Reduce positions by 40% when VIX > 25
2. **Stop-Loss Mechanism**: Implement 8% trailing stops on individual positions  
3. **Correlation Hedging**: Add inverse ETF allocation during high-beta periods

This could reduce your max drawdown to 12-14% while preserving 85% of your alpha generation.`
    } else if (question.includes('sharpe') || question.includes('performance')) {
      aiResponse = `Your Sharpe ratio of 1.85 is solid but improvable. Key opportunities:

1. **Regime-Aware Allocation**: Reduce exposure 30% in low-momentum periods
2. **Alternative Alpha**: Add mean-reversion overlay during oversold conditions
3. **Cost Optimization**: Move from daily to 3-day rebalancing

These changes could push your Sharpe ratio to 2.1+ while maintaining strategy integrity.`
    } else if (question.includes('improve') || question.includes('better')) {
      aiResponse = `Top 3 improvements for your strategy:

🔴 **Critical**: Dynamic position sizing to reduce tail risk
🟡 **Important**: Market regime detection for better market timing  
🟢 **Optimization**: Transaction cost reduction through smarter rebalancing

Start with dynamic position sizing - it's the highest ROI improvement with lowest implementation complexity.`
    } else {
      aiResponse = `Great question! Based on your strategy analysis, I see opportunities to improve risk-adjusted returns while reducing downside exposure. 

Would you like me to focus on:
• Risk management improvements (drawdown reduction)
• Return enhancement techniques (alpha generation)
• Cost optimization strategies (transaction efficiency)
• Market timing mechanisms (regime detection)

I can provide specific implementation details for any of these areas.`
    }
    
    setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }])
    setIsResponding(false)
  }

  const renderChart = (recommendation: ChartRecommendation) => {
    const { chartType, data } = recommendation
    
    switch (chartType) {
      case 'drawdown':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="date" stroke="#888" fontSize={10} />
              <YAxis stroke="#888" fontSize={10} />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e' }}
                labelStyle={{ color: '#888' }}
              />
              <Area 
                type="monotone" 
                dataKey="drawdown" 
                stroke="#ff3366" 
                fill="rgba(255, 51, 102, 0.2)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case 'rolling-sharpe':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="date" stroke="#888" fontSize={10} />
              <YAxis stroke="#888" fontSize={10} />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e' }}
                labelStyle={{ color: '#888' }}
              />
              <Line 
                type="monotone" 
                dataKey="sharpe" 
                stroke="#00bbff" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'monthly-returns':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="month" stroke="#888" fontSize={10} />
              <YAxis stroke="#888" fontSize={10} />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e' }}
                labelStyle={{ color: '#888' }}
              />
              <Bar 
                dataKey="return" 
                fill={(entry: any) => entry.return >= 0 ? '#00ff88' : '#ff3366'}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      
      default:
        return <div>Chart type not supported</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-[#00bbff]" />
            AI Strategy Analyst
            <Badge variant="outline" className="ml-2">
              Powered by GPT-4
            </Badge>
            {liveMode && (
              <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                LIVE MONITORING
              </Badge>
            )}
            <button
              onClick={() => setLiveMode(!liveMode)}
              className="ml-auto text-xs px-2 py-1 rounded bg-[#2a2a3e] hover:bg-[#3a3a4e] transition-colors"
            >
              {liveMode ? 'Disable Live' : 'Enable Live'}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <Activity className="w-12 h-12 mx-auto text-[#606078] mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to Analyze Your Strategy
                </h3>
                <p className="text-[#606078] mb-6">
                  I'll analyze your backtest results and provide actionable insights to improve performance
                </p>
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="bg-[#00bbff] hover:bg-[#0099cc] text-white px-8"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing Strategy...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Analyze My Strategy
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Strategy Score */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{analysis.strategyName}</h3>
                  <p className="text-[#606078]">AI Analysis Complete</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#00bbff]">{analysis.overallScore}/100</div>
                  <p className="text-xs text-[#606078]">Strategy Score</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-[#15151f] p-3 rounded-lg border border-[#2a2a3e]">
                  <div className="text-sm text-[#606078]">Sharpe Ratio</div>
                  <div className="text-lg font-semibold text-white">{analysis.keyMetrics.sharpeRatio}</div>
                </div>
                <div className="bg-[#15151f] p-3 rounded-lg border border-[#2a2a3e]">
                  <div className="text-sm text-[#606078]">Max Drawdown</div>
                  <div className="text-lg font-semibold text-[#ff3366]">{analysis.keyMetrics.maxDrawdown}%</div>
                </div>
                <div className="bg-[#15151f] p-3 rounded-lg border border-[#2a2a3e]">
                  <div className="text-sm text-[#606078]">Win Rate</div>
                  <div className="text-lg font-semibold text-white">{analysis.keyMetrics.winRate}%</div>
                </div>
                <div className="bg-[#15151f] p-3 rounded-lg border border-[#2a2a3e]">
                  <div className="text-sm text-[#606078]">Avg Return</div>
                  <div className="text-lg font-semibold text-[#00ff88]">{analysis.keyMetrics.avgReturn}%</div>
                </div>
                <div className="bg-[#15151f] p-3 rounded-lg border border-[#2a2a3e]">
                  <div className="text-sm text-[#606078]">Volatility</div>
                  <div className="text-lg font-semibold text-white">{analysis.keyMetrics.volatility}%</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                  Strategy Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-[#e0e0e0]">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <AlertTriangle className="w-4 h-4 text-[#ff3366]" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-[#ff3366] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-[#e0e0e0]">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions */}
          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lightbulb className="w-5 h-5 text-[#ffd700]" />
                AI Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.suggestions.map((suggestion, i) => (
                  <div key={i} className="bg-[#15151f] p-4 rounded-lg border border-[#2a2a3e]">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {suggestion.type === 'critical' && <Shield className="w-5 h-5 text-[#ff3366]" />}
                        {suggestion.type === 'important' && <Target className="w-5 h-5 text-[#ff9500]" />}
                        {suggestion.type === 'optimization' && <Zap className="w-5 h-5 text-[#00bbff]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{suggestion.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              suggestion.impact === 'high' ? 'border-[#ff3366] text-[#ff3366]' :
                              suggestion.impact === 'medium' ? 'border-[#ff9500] text-[#ff9500]' :
                              'border-[#606078] text-[#606078]'
                            }`}
                          >
                            {suggestion.impact} impact
                          </Badge>
                        </div>
                        <p className="text-[#e0e0e0] text-sm mb-3">{suggestion.description}</p>
                        <div className="bg-[#1a1a2e] p-3 rounded border border-[#2a2a3e]">
                          <div className="text-xs text-[#606078] mb-1">Implementation:</div>
                          <div className="text-sm text-[#e0e0e0] mb-2">{suggestion.implementation}</div>
                          <div className="text-xs text-[#606078] mb-1">Expected Improvement:</div>
                          <div className="text-sm text-[#00ff88]">{suggestion.expectedImprovement}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chart Analysis */}
          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5 text-[#00bbff]" />
                AI Chart Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chart Selector */}
                <div className="flex gap-2 flex-wrap">
                  {analysis.chartRecommendations.map((chart, i) => (
                    <Button
                      key={i}
                      variant={selectedChart?.chartType === chart.chartType ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedChart(chart)}
                      className="text-xs"
                    >
                      {chart.title}
                    </Button>
                  ))}
                </div>

                {/* Selected Chart */}
                {selectedChart && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">{selectedChart.title}</h4>
                      <p className="text-[#606078] text-sm">{selectedChart.reason}</p>
                    </div>
                    
                    {renderChart(selectedChart)}
                    
                    <div className="bg-[#15151f] p-4 rounded-lg border border-[#2a2a3e]">
                      <div className="text-sm font-semibold text-white mb-3">AI Insights:</div>
                      <ul className="space-y-2">
                        {selectedChart.insights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-[#00bbff] rounded-full mt-2 flex-shrink-0" />
                            <span className="text-[#e0e0e0]">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Q&A */}
          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="w-5 h-5 text-[#00bbff]" />
                Ask the AI Analyst
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat History */}
                {chatHistory.length > 0 && (
                  <ScrollArea className="h-64 w-full border border-[#2a2a3e] rounded-lg p-4">
                    <div className="space-y-4">
                      {chatHistory.map((message, i) => (
                        <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-[#00bbff] text-white' 
                              : 'bg-[#15151f] border border-[#2a2a3e] text-[#e0e0e0]'
                          }`}>
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      ))}
                      {isResponding && (
                        <div className="flex justify-start">
                          <div className="bg-[#15151f] border border-[#2a2a3e] text-[#e0e0e0] p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <Brain className="w-4 h-4 animate-pulse" />
                              AI is thinking...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}

                {/* Question Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask me about your strategy... e.g., 'How can I reduce my drawdown?' or 'Why does my Sharpe ratio drop during certain periods?'"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    className="flex-1 bg-[#15151f] border-[#2a2a3e] text-white placeholder-[#606078] resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleAskQuestion}
                    disabled={isResponding || !userQuestion.trim()}
                    className="bg-[#00bbff] hover:bg-[#0099cc] text-white px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Questions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserQuestion("How can I reduce my maximum drawdown?")}
                    className="text-xs"
                  >
                    Reduce Drawdown
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserQuestion("How can I improve my Sharpe ratio?")}
                    className="text-xs"
                  >
                    Improve Sharpe
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserQuestion("What's the biggest weakness in my strategy?")}
                    className="text-xs"
                  >
                    Biggest Weakness
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserQuestion("Should I change my rebalancing frequency?")}
                    className="text-xs"
                  >
                    Rebalancing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// Mock data generation functions
function generateDrawdownData() {
  const data = []
  let currentValue = 0
  
  for (let i = 0; i < 120; i++) {
    const date = new Date(2020, 0, 1)
    date.setMonth(i)
    
    // Simulate drawdown periods
    if (i >= 20 && i <= 35) { // COVID crash
      currentValue = Math.min(currentValue - Math.random() * 2, -18.5)
    } else if (i >= 70 && i <= 85) { // Rate hike fears
      currentValue = Math.min(currentValue - Math.random() * 1.5, -12.8)
    } else {
      currentValue = Math.max(currentValue + Math.random() * 0.8, 0)
    }
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      drawdown: currentValue
    })
  }
  
  return data
}

function generateRollingSharpeData() {
  const data = []
  
  for (let i = 0; i < 48; i++) {
    const date = new Date(2020, i, 1)
    let sharpe = 1.85
    
    // Add volatility to Sharpe ratio
    if (i >= 8 && i <= 18) sharpe = 0.8 + Math.random() * 0.6 // COVID period
    if (i >= 30 && i <= 38) sharpe = 1.2 + Math.random() * 0.8 // Rate uncertainty
    else sharpe = 1.5 + Math.random() * 0.7
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      sharpe: Number(sharpe.toFixed(2))
    })
  }
  
  return data
}

function generateMonthlyReturnsData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const data = []
  
  months.forEach(month => {
    // Generate realistic monthly returns with some negative months
    let ret = Math.random() * 8 - 2 // Range from -2% to +6%
    if (Math.random() < 0.25) ret = -(Math.random() * 6) // 25% chance of negative month
    
    data.push({
      month,
      return: Number(ret.toFixed(1))
    })
  })
  
  return data
}
