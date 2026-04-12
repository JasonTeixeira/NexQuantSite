"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { PlayIcon, StopIcon, DownloadIcon, ShareIcon, BrainCircuitIcon, TrendingUpIcon, AlertTriangleIcon } from "lucide-react"

type TestResult = {
  id: string
  strategy: string
  symbol: string
  period: string
  totalReturn: number
  sharpe: number
  maxDrawdown: number
  winRate: number
  equity: Array<{date: string, value: number}>
  trades: number
  status: 'running' | 'completed' | 'failed'
}

type AIInsight = {
  type: 'optimization' | 'risk' | 'opportunity'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: string
}

export default function UnifiedStrategyTerminal() {
  const [command, setCommand] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState<string>("")
  const [results, setResults] = useState<TestResult[]>([])
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)

  // Simulate running multiple backtests
  const runBacktest = async (cmd: string) => {
    setIsRunning(true)
    setProgress(0)
    setResults([])
    setAiInsights([])
    
    // Parse command (simplified)
    const symbol = cmd.includes('NQ') ? 'NQ' : 'ES'
    const tests = cmd.match(/--tests (\d+)/)?.[1] || '5'
    const capital = cmd.match(/--capital (\d+)/)?.[1] || '100000'
    const risk = cmd.match(/--risk (\d+(?:\.\d+)?)%/)?.[1] || '2'

    const strategies = [
      "SMA(10,20) Crossover",
      "EMA(12,26) MACD",
      "RSI(14) Mean Reversion", 
      "Bollinger Bands Bounce",
      "Momentum Breakout"
    ]

    // Run each test
    for (let i = 0; i < parseInt(tests); i++) {
      setCurrentTest(`Running ${strategies[i % strategies.length]} on ${symbol}...`)
      setProgress((i / parseInt(tests)) * 100)
      
      // Simulate test execution time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate realistic results
      const totalReturn = (Math.random() - 0.3) * 50 // -15% to +35%
      const sharpe = Math.random() * 3
      const maxDrawdown = Math.random() * 25
      const winRate = 45 + Math.random() * 30 // 45-75%
      
      // Generate equity curve
      const equity = []
      let value = parseFloat(capital)
      const maxValue = value
      
      for (let day = 0; day < 252; day++) {
        const dailyReturn = (totalReturn / 100) / 252 + (Math.random() - 0.5) * 0.02
        value *= (1 + dailyReturn)
        equity.push({
          date: new Date(2023, 0, day + 1).toISOString().split('T')[0],
          value: Math.round(value)
        })
      }

      const result: TestResult = {
        id: `test-${i}`,
        strategy: strategies[i % strategies.length],
        symbol,
        period: "2023-2024",
        totalReturn,
        sharpe,
        maxDrawdown,
        winRate,
        equity,
        trades: Math.floor(Math.random() * 500) + 100,
        status: 'completed'
      }

      setResults(prev => [...prev, result])
    }

    setProgress(100)
    setCurrentTest("All tests completed!")
    setIsRunning(false)

    // Generate AI insights
    setTimeout(() => {
      setAiInsights([
        {
          type: 'optimization',
          title: 'Parameter Optimization Opportunity',
          description: 'EMA(12,26) shows strong potential. Consider testing EMA(8,21) for 15% better Sharpe ratio.',
          impact: 'high',
          action: 'Run optimized parameters'
        },
        {
          type: 'risk',
          title: 'Drawdown Risk Detected',
          description: 'Momentum Breakout shows 23% max drawdown. Add stop-loss at 15% to reduce risk.',
          impact: 'medium',
          action: 'Implement risk controls'
        },
        {
          type: 'opportunity', 
          title: 'Market Regime Optimization',
          description: 'RSI Mean Reversion performs 40% better in sideways markets. Add market regime filter.',
          impact: 'high',
          action: 'Add regime detection'
        }
      ])
    }, 2000)
  }

  const exportToMarketplace = (result: TestResult) => {
    // Export logic for marketplace monetization
    console.log('Exporting strategy to marketplace:', result)
    alert(`Strategy "${result.strategy}" exported to marketplace! 🚀`)
  }

  const quickCommands = [
    "backtest --strategy 'MA Cross' --symbol NQ --period 2023-2024 --capital 100000 --risk 2% --tests 5",
    "optimize --strategy 'RSI Mean Rev' --symbol ES --lookback 14,21,28 --capital 50000 --risk 1.5%",
    "compare --strategies 'Momentum,MeanRev,Trend' --symbol NQ --period 6M --monte-carlo 1000"
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Strategy Testing Terminal
            </h1>
            <p className="text-[#a0a0b8] mt-1">
              Natural language backtesting • AI optimization • Marketplace export
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-[#a0a0b8]">Connected</span>
          </div>
        </div>

        {/* Command Interface */}
        <Card className="bg-[#15151f] border-[#2a2a3e]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainCircuitIcon className="w-5 h-5 text-blue-400" />
              Strategy Command Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Command Input */}
            <div className="flex gap-2">
              <Input 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="backtest --strategy 'Moving Average' --symbol NQ --period 2023-2024 --capital 100000 --risk 2% --tests 20"
                className="bg-[#0f1320] border-[#2a2a3e] text-white flex-1 font-mono"
                onKeyDown={(e) => e.key === 'Enter' && !isRunning && command && runBacktest(command)}
              />
              <Button 
                onClick={() => runBacktest(command)}
                disabled={isRunning || !command}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                {isRunning ? 'Running' : 'Execute'}
              </Button>
            </div>

            {/* Quick Commands */}
            <div className="space-y-2">
              <p className="text-sm text-[#a0a0b8]">Quick commands:</p>
              <div className="flex flex-wrap gap-2">
                {quickCommands.map((cmd, i) => (
                  <Button 
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setCommand(cmd)}
                    className="text-xs bg-[#0f1320] border-[#2a2a3e] hover:bg-[#1a1a2e]"
                  >
                    {cmd.split(' ').slice(0, 3).join(' ')}...
                  </Button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a0a0b8]">{currentTest}</span>
                  <span className="text-sm text-blue-400">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Test Results */}
          <Card className="bg-[#15151f] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Test Results ({results.length})</span>
                {results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Avg Return: {(results.reduce((sum, r) => sum + r.totalReturn, 0) / results.length).toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <div 
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedResult?.id === result.id 
                        ? 'bg-blue-600/20 border-blue-600/50' 
                        : 'bg-[#0f1320] border-[#2a2a3e] hover:bg-[#1a1a2e]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{result.strategy}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.totalReturn > 0 ? "default" : "destructive"}>
                          {result.totalReturn > 0 ? '+' : ''}{result.totalReturn.toFixed(1)}%
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            exportToMarketplace(result)
                          }}
                        >
                          <ShareIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-[#a0a0b8]">
                      <div>Sharpe: {result.sharpe.toFixed(2)}</div>
                      <div>DD: {result.maxDrawdown.toFixed(1)}%</div>
                      <div>Win: {result.winRate.toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
                {results.length === 0 && !isRunning && (
                  <div className="text-center py-8 text-[#a0a0b8]">
                    No test results yet. Run a backtest to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Equity Chart */}
          <Card className="bg-[#15151f] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedResult ? `${selectedResult.strategy} - Equity Curve` : 'Select a Test Result'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedResult ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedResult.equity}>
                        <defs>
                          <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                        <XAxis dataKey="date" stroke="#a0a0b8" fontSize={10} />
                        <YAxis stroke="#a0a0b8" fontSize={10} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#15151f',
                            border: '1px solid #2a2a3e',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#equity)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0f1320] p-3 rounded">
                      <div className="text-xl font-bold text-green-400">
                        +{selectedResult.totalReturn.toFixed(1)}%
                      </div>
                      <div className="text-sm text-[#a0a0b8]">Total Return</div>
                    </div>
                    <div className="bg-[#0f1320] p-3 rounded">
                      <div className="text-xl font-bold text-blue-400">
                        {selectedResult.sharpe.toFixed(2)}
                      </div>
                      <div className="text-sm text-[#a0a0b8]">Sharpe Ratio</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-[#a0a0b8]">
                  Click on a test result to view its equity curve
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <Card className="bg-[#15151f] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuitIcon className="w-5 h-5 text-purple-400" />
                AI Strategy Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="bg-[#0f1320] p-4 rounded-lg border border-[#2a2a3e]">
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === 'optimization' && <TrendingUpIcon className="w-4 h-4 text-green-400" />}
                      {insight.type === 'risk' && <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />}
                      {insight.type === 'opportunity' && <BrainCircuitIcon className="w-4 h-4 text-blue-400" />}
                      <Badge 
                        variant={insight.impact === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm text-[#a0a0b8] mb-3">{insight.description}</p>
                    {insight.action && (
                      <Button size="sm" variant="outline" className="text-xs">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
