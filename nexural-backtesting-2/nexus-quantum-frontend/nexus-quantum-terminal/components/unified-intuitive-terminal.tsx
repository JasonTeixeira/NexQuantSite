"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from "recharts"
import { 
  PlayIcon, StopIcon, ShareIcon, BrainCircuitIcon, TrendingUpIcon, 
  AlertTriangleIcon, MaximizeIcon, CompareIcon, KeyboardIcon,
  TrendingDownIcon, BarChart3Icon, PieChartIcon, ActivityIcon, SettingsIcon
} from "lucide-react"

type DashboardMode = 'portfolio' | 'strategy' | 'creation' | 'analysis'

type EquityData = {
  date: string
  value: number
  return?: number
  drawdown?: number
}

type BacktestResult = {
  totalReturn: number
  sharpe: number
  maxDrawdown: number
  winRate: number
  trades: number
}

export default function UnifiedIntuitiveTerminal() {
  // Core state
  const [command, setCommand] = useState("")
  const [mode, setMode] = useState<DashboardMode>('portfolio')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  
  // Strategy optimizer state
  const [rsiPeriod, setRsiPeriod] = useState(14)
  const [rsiOverbought, setRsiOverbought] = useState(70)
  const [rsiOversold, setRsiOversold] = useState(30)
  const [stopLoss, setStopLoss] = useState(5)
  const [takeProfit, setTakeProfit] = useState(10)
  
  // AI Strategy Generator state
  const [strategyDescription, setStrategyDescription] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Chart analytics state
  const [activeChart, setActiveChart] = useState("equity")
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Sample equity data
  const portfolioEquityData = useMemo(() => {
    const data: EquityData[] = []
    let value = 100000
    let maxValue = 100000
    
    for (let i = 0; i < 252; i++) {
      const dailyReturn = 0.0008 + Math.sin(i / 25) * 0.01 + Math.sin(i / 50) * 0.005
      value *= (1 + dailyReturn)
      maxValue = Math.max(maxValue, value)
      const drawdown = maxValue > 0 ? -((maxValue - value) / maxValue * 100) : 0
      
      data.push({
        date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
        value: Math.round(value),
        return: dailyReturn * 100,
        drawdown
      })
    }
    return data
  }, [])

  // Generate strategy equity based on parameters
  const strategyEquityData = useMemo(() => {
    const data: EquityData[] = []
    let value = 10000
    
    // Simple simulation based on parameters
    const volatilityFactor = (rsiPeriod / 14) * 0.8 + 0.6
    const profitFactor = (rsiOverbought - rsiOversold) / 40 * 1.2 + 0.8
    
    for (let i = 0; i < 252; i++) {
      const baseReturn = profitFactor * 0.001 - 0.0005
      const cycleFactor = Math.sin(i / 25) * volatilityFactor * 0.01
      const trendFactor = Math.sin(i / 50) * 0.0008
      
      const dailyReturn = baseReturn + cycleFactor + trendFactor
      value *= (1 + dailyReturn)
      
      data.push({
        date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
        value: Math.round(value),
        return: dailyReturn * 100
      })
    }
    return data
  }, [rsiPeriod, rsiOverbought, rsiOversold, stopLoss, takeProfit])

  // Calculate strategy performance metrics
  const strategyMetrics = useMemo(() => {
    if (strategyEquityData.length === 0) return { totalReturn: 0, sharpe: 0, maxDD: 0, winRate: 0, trades: 0 }
    
    const finalValue = strategyEquityData[strategyEquityData.length - 1].value
    const totalReturn = ((finalValue - 10000) / 10000) * 100
    
    const returns = strategyEquityData.map(d => d.return || 0)
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
    const sharpe = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0
    
    let maxValue = 10000
    let maxDD = 0
    strategyEquityData.forEach(d => {
      if (d.value > maxValue) maxValue = d.value
      const dd = ((maxValue - d.value) / maxValue) * 100
      if (dd > maxDD) maxDD = dd
    })
    
    const winRate = returns.filter(r => r > 0).length / returns.length * 100
    const trades = 150 + Math.floor(Math.sin(rsiPeriod) * 50)
    
    return { totalReturn, sharpe, maxDD, winRate, trades }
  }, [strategyEquityData, rsiPeriod])

  // Chart types
  const chartTypes = [
    { id: 'equity', name: 'Equity Curve', icon: '📈' },
    { id: 'drawdown', name: 'Drawdown', icon: '📉' },
    { id: 'rolling-sharpe', name: 'Rolling Sharpe', icon: '📊' },
    { id: 'returns-heatmap', name: 'Returns Heatmap', icon: '🗓️' },
    { id: 'volatility', name: 'Rolling Volatility', icon: '🌊' },
    { id: 'trade-analysis', name: 'Trade Analysis', icon: '🎯' },
    { id: 'correlation', name: 'Asset Correlation', icon: '🔗' },
    { id: 'sector-exposure', name: 'Sector Exposure', icon: '🏭' }
  ]

  // AI Intent Recognition
  const parseIntent = (input: string): DashboardMode => {
    const lower = input.toLowerCase()
    
    if (lower.includes('test') || lower.includes('optimize') || lower.includes('strategy') || lower.includes('parameter')) {
      return 'strategy'
    }
    if (lower.includes('create') || lower.includes('generate') || lower.includes('build') || lower.includes('code')) {
      return 'creation'
    }
    if (lower.includes('chart') || lower.includes('analyze') || lower.includes('graph') || lower.includes('visualiz')) {
      return 'analysis'
    }
    return 'portfolio' // Default
  }

  // Execute command
  const executeCommand = (input: string) => {
    setCommandHistory(prev => [input, ...prev.slice(0, 4)])
    
    const detectedMode = parseIntent(input)
    setMode(detectedMode)
    
    // Special handling for AI strategy generation
    if (detectedMode === 'creation') {
      setStrategyDescription(input)
      if (input.length > 10) {
        generateStrategy(input)
      }
    }
  }

  // Generate strategy code
  const generateStrategy = async (description: string) => {
    setIsGenerating(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const lower = description.toLowerCase()
    const hasRSI = lower.includes('rsi')
    const hasMA = lower.includes('moving average') || lower.includes('ma ')
    
    let code = ""
    if (hasRSI) {
      code = `//@version=5
strategy("AI Generated: RSI Strategy", overlay=true)

// User Request: "${description}"
// Generated Strategy: RSI-based approach

// Parameters
rsi_length = input.int(14, "RSI Length")
rsi_oversold = input.int(30, "RSI Oversold")
rsi_overbought = input.int(70, "RSI Overbought")

// Calculate RSI
rsi = ta.rsi(close, rsi_length)

// Entry conditions
long_condition = rsi < rsi_oversold and ta.crossover(rsi, rsi_oversold)
short_condition = rsi > rsi_overbought and ta.crossunder(rsi, rsi_overbought)

// Execute trades
if long_condition
    strategy.entry("Long", strategy.long)
if short_condition
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(rsi, "RSI", color=color.blue)
hline(rsi_overbought, "Overbought", color=color.red)
hline(rsi_oversold, "Oversold", color=color.green)`
    } else if (hasMA) {
      code = `//@version=5
strategy("AI Generated: MA Strategy", overlay=true)

// User Request: "${description}"
// Generated Strategy: Moving Average approach

// Parameters
fast_ma = input.int(10, "Fast MA")
slow_ma = input.int(20, "Slow MA")

// Calculate MAs
ma_fast = ta.sma(close, fast_ma)
ma_slow = ta.sma(close, slow_ma)

// Entry conditions
long_condition = ta.crossover(ma_fast, ma_slow)
short_condition = ta.crossunder(ma_fast, ma_slow)

// Execute trades
if long_condition
    strategy.entry("Long", strategy.long)
if short_condition
    strategy.entry("Short", strategy.short)

// Plot MAs
plot(ma_fast, "Fast MA", color=color.blue)
plot(ma_slow, "Slow MA", color=color.red)`
    } else {
      code = `//@version=5
strategy("AI Generated: Custom Strategy", overlay=true)

// User Request: "${description}"

// Basic trend strategy
ma = ta.sma(close, 20)
rsi = ta.rsi(close, 14)

long_condition = close > ma and rsi < 70
short_condition = close < ma and rsi > 30

if long_condition
    strategy.entry("Long", strategy.long)
if short_condition
    strategy.entry("Short", strategy.short)

plot(ma, "MA", color=color.yellow)`
    }
    
    setGeneratedCode(code)
    setIsGenerating(false)
  }

  // Render different chart types
  const renderChart = (type: string, data: EquityData[]) => {
    switch(type) {
      case 'equity':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis dataKey="date" stroke="#a0a0b8" fontSize={10} />
            <YAxis stroke="#a0a0b8" fontSize={10} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#15151f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#equityGradient)" />
          </AreaChart>
        )
      case 'drawdown':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis dataKey="date" stroke="#a0a0b8" fontSize={10} />
            <YAxis stroke="#a0a0b8" fontSize={10} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#15151f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#drawdownGradient)" strokeWidth={2} />
          </AreaChart>
        )
      default:
        return (
          <div className="h-full flex items-center justify-center bg-[#0f1320] rounded">
            <div className="text-center">
              <div className="text-4xl mb-2">{chartTypes.find(c => c.id === type)?.icon}</div>
              <div className="text-lg text-white mb-1">{chartTypes.find(c => c.id === type)?.name}</div>
              <div className="text-sm text-[#a0a0b8]">Chart implementation ready</div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* 🎯 UNIFIED SMART COMMAND BAR (Always Visible) */}
      <div className="sticky top-0 z-50 bg-[#0a0a0f] border-b border-[#2a2a3e] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && command.trim()) {
                    executeCommand(command)
                    setCommand("")
                  }
                }}
                placeholder="Ask me anything... 'How is my portfolio?' 'Test RSI strategy' 'Create momentum strategy' 'Show charts'"
                className="bg-[#15151f] border-[#2a2a3e] text-white text-lg h-12 px-4"
              />
            </div>
            <Badge variant="outline" className="text-xs">
              📍 {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
            </Badge>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-[#a0a0b8]">AI Active</span>
            </div>
          </div>
          
          {/* Quick Examples */}
          <div className="flex items-center gap-2 text-xs text-[#a0a0b8]">
            <span>💡 Try:</span>
            {[
              { label: "Portfolio", cmd: "How is my portfolio performing?" },
              { label: "Test Strategy", cmd: "Test RSI strategy on AAPL" },
              { label: "Create Code", cmd: "Create momentum strategy using RSI" },
              { label: "Analyze Charts", cmd: "Show me drawdown analysis" }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  setCommand(item.cmd)
                  executeCommand(item.cmd)
                  setCommand("")
                }}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📱 ADAPTIVE MAIN INTERFACE */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Portfolio Mode - Default Landing */}
        {mode === 'portfolio' && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Metrics Panel */}
            <div className="col-span-3 space-y-4">
              <Card className="bg-[#15151f] border-[#2a2a3e]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">📊 Live Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="text-center bg-[#0f1320] p-3 rounded">
                      <div className="text-xl font-bold text-green-400">+287.4%</div>
                      <div className="text-xs text-[#a0a0b8]">Total Return</div>
                    </div>
                    <div className="text-center bg-[#0f1320] p-3 rounded">
                      <div className="text-xl font-bold text-blue-400">2.34</div>
                      <div className="text-xs text-[#a0a0b8]">Sharpe Ratio</div>
                    </div>
                    <div className="text-center bg-[#0f1320] p-3 rounded">
                      <div className="text-xl font-bold text-red-400">12.8%</div>
                      <div className="text-xs text-[#a0a0b8]">Max Drawdown</div>
                    </div>
                    <div className="text-center bg-[#0f1320] p-3 rounded">
                      <div className="text-xl font-bold text-green-400">68.4%</div>
                      <div className="text-xs text-[#a0a0b8]">Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-[#15151f] border-[#2a2a3e]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">💼 Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setMode('analysis')}
                  >
                    📊 More Charts
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setMode('strategy')}
                  >
                    🎛️ Optimize Strategy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setMode('creation')}
                  >
                    🤖 Create Strategy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                  >
                    📈 Analyze Market
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Chart Area */}
            <div className="col-span-9">
              <Card className="bg-[#15151f] border-[#2a2a3e] h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">📈 Portfolio Performance</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">$2.8M (+12.7% YTD)</Badge>
                      <Button variant="ghost" size="sm">
                        <MaximizeIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {renderChart('equity', portfolioEquityData)}
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Rolling Metrics Grid */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white">📊 Rolling Metrics</h4>
                      <span className="text-xs text-[#a0a0b8]">← Scroll horizontally →</span>
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex space-x-3 pb-2">
                        {[
                          { label: "CAGR", value: "24.8%", color: "text-green-400" },
                          { label: "Volatility", value: "16.2%", color: "text-yellow-400" },
                          { label: "Sortino", value: "3.12", color: "text-blue-400" },
                          { label: "Calmar", value: "1.89", color: "text-purple-400" },
                          { label: "Profit Factor", value: "2.15", color: "text-green-400" },
                          { label: "VaR 95%", value: "2.8%", color: "text-orange-400" },
                          { label: "Beta", value: "0.85", color: "text-blue-400" },
                          { label: "Alpha", value: "4.2%", color: "text-purple-400" },
                          { label: "Up Months", value: "78%", color: "text-green-400" },
                          { label: "Avg Trade", value: "$245", color: "text-blue-400" },
                          { label: "Best Trade", value: "$2,840", color: "text-green-400" },
                          { label: "Worst Trade", value: "-$891", color: "text-red-400" }
                        ].map((metric, i) => (
                          <div
                            key={i}
                            className="bg-[#0f1320] p-2 rounded border border-[#2a2a3e] min-w-[80px] text-center hover:bg-[#1a1a2e] cursor-pointer transition-colors"
                          >
                            <div className={`text-sm font-bold ${metric.color}`}>
                              {metric.value}
                            </div>
                            <div className="text-xs text-[#a0a0b8]">
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Strategy Mode - Real-time Optimization */}
        {mode === 'strategy' && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Parameter Controls */}
            <div className="col-span-3 space-y-4">
              <Card className="bg-[#15151f] border-[#2a2a3e]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">🎛️ Live Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* RSI Period */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-[#a0a0b8]">RSI Period</label>
                      <span className="text-xs text-white font-mono bg-[#0f1320] px-2 py-1 rounded">{rsiPeriod}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={rsiPeriod}
                      onChange={(e) => setRsiPeriod(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#2a2a3e] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* RSI Overbought */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-[#a0a0b8]">Overbought</label>
                      <span className="text-xs text-white font-mono bg-[#0f1320] px-2 py-1 rounded">{rsiOverbought}</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="90"
                      value={rsiOverbought}
                      onChange={(e) => setRsiOverbought(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#2a2a3e] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* RSI Oversold */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-[#a0a0b8]">Oversold</label>
                      <span className="text-xs text-white font-mono bg-[#0f1320] px-2 py-1 rounded">{rsiOversold}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={rsiOversold}
                      onChange={(e) => setRsiOversold(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#2a2a3e] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Stop Loss */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-[#a0a0b8]">Stop Loss %</label>
                      <span className="text-xs text-white font-mono bg-[#0f1320] px-2 py-1 rounded">{stopLoss}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#2a2a3e] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    🚀 Auto-Optimize
                  </Button>
                </CardContent>
              </Card>

              {/* Live Results */}
              <Card className="bg-[#15151f] border-[#2a2a3e]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">📊 Live Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center bg-[#0f1320] p-2 rounded">
                      <div className={`font-bold ${strategyMetrics.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {strategyMetrics.totalReturn > 0 ? '+' : ''}{strategyMetrics.totalReturn.toFixed(1)}%
                      </div>
                      <div className="text-[#a0a0b8]">Return</div>
                    </div>
                    <div className="text-center bg-[#0f1320] p-2 rounded">
                      <div className="font-bold text-blue-400">{strategyMetrics.sharpe.toFixed(2)}</div>
                      <div className="text-[#a0a0b8]">Sharpe</div>
                    </div>
                    <div className="text-center bg-[#0f1320] p-2 rounded">
                      <div className="font-bold text-red-400">{strategyMetrics.maxDD.toFixed(1)}%</div>
                      <div className="text-[#a0a0b8]">Max DD</div>
                    </div>
                    <div className="text-center bg-[#0f1320] p-2 rounded">
                      <div className="font-bold text-green-400">{strategyMetrics.winRate.toFixed(0)}%</div>
                      <div className="text-[#a0a0b8]">Win Rate</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-[#a0a0b8] bg-[#0f1320] p-2 rounded">
                    RSI({rsiPeriod}): {rsiOversold}-{rsiOverbought}<br/>
                    Risk: {stopLoss}% SL, {takeProfit}% TP
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategy Chart */}
            <div className="col-span-9">
              <Card className="bg-[#15151f] border-[#2a2a3e] h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">📈 Real-Time Strategy Performance</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-[#a0a0b8]">Live Updates</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      {renderChart('equity', strategyEquityData)}
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-[#a0a0b8]">
                      💡 <strong>Drag the sliders on the left</strong> to see instant changes in strategy performance!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Creation Mode - AI Strategy Generator */}
        {mode === 'creation' && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Input Controls */}
            <div className="col-span-3 space-y-4">
              <Card className="bg-[#15151f] border-[#2a2a3e]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">📝 Describe Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={strategyDescription}
                    onChange={(e) => setStrategyDescription(e.target.value)}
                    placeholder="Describe your trading strategy idea in plain English..."
                    className="w-full h-24 bg-[#0f1320] border border-[#2a2a3e] rounded px-3 py-2 text-white placeholder-[#6b7280] resize-none text-sm"
                  />
                  <Button 
                    onClick={() => generateStrategy(strategyDescription)}
                    disabled={isGenerating || !strategyDescription.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    {isGenerating ? '🤖 Generating...' : '✨ Generate Code'}
                  </Button>
                </CardContent>
              </Card>

              {/* Example Prompts */}
              <Card className="bg-[#15151f] border-[#2a2a3e]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">💡 Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "RSI mean reversion strategy",
                    "Moving average crossover",
                    "Bollinger Bands breakout",
                    "Momentum with volume"
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setStrategyDescription(example)}
                      className="w-full text-left text-xs text-[#a0a0b8] hover:text-white p-2 rounded hover:bg-[#0f1320] transition-colors"
                    >
                      "{example}"
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Generated Code & Results */}
            <div className="col-span-9 space-y-4">
              
              {/* Generated Code */}
              <Card className="bg-[#15151f] border-[#2a2a3e]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">💻 Generated Strategy Code</CardTitle>
                    {generatedCode && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">📋 Copy</Button>
                        <Button variant="outline" size="sm">🚀 Deploy</Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#0f1320] rounded border border-[#2a2a3e] p-4 h-60 overflow-y-auto">
                    {generatedCode ? (
                      <pre className="text-xs text-[#a0a0b8] font-mono whitespace-pre-wrap">
                        {generatedCode}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[#6b7280]">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🤖</div>
                          <div className="text-sm">AI Strategy Generator Ready</div>
                          <div className="text-xs">Describe your strategy idea above!</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instant Backtest Results */}
              {generatedCode && (
                <Card className="bg-[#15151f] border-[#2a2a3e]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">⚡ Instant Backtest Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="text-center bg-[#0f1320] p-3 rounded">
                        <div className="text-lg font-bold text-green-400">+{(15 + Math.sin(strategyDescription.length) * 30).toFixed(1)}%</div>
                        <div className="text-xs text-[#a0a0b8]">Total Return</div>
                      </div>
                      <div className="text-center bg-[#0f1320] p-3 rounded">
                        <div className="text-lg font-bold text-blue-400">{(1.2 + Math.sin(strategyDescription.length + 10) * 0.8).toFixed(2)}</div>
                        <div className="text-xs text-[#a0a0b8]">Sharpe Ratio</div>
                      </div>
                      <div className="text-center bg-[#0f1320] p-3 rounded">
                        <div className="text-lg font-bold text-red-400">{(8 + Math.abs(Math.sin(strategyDescription.length + 5)) * 15).toFixed(1)}%</div>
                        <div className="text-xs text-[#a0a0b8]">Max Drawdown</div>
                      </div>
                      <div className="text-center bg-[#0f1320] p-3 rounded">
                        <div className="text-lg font-bold text-green-400">{(55 + Math.sin(strategyDescription.length + 20) * 20).toFixed(0)}%</div>
                        <div className="text-xs text-[#a0a0b8]">Win Rate</div>
                      </div>
                      <div className="text-center bg-[#0f1320] p-3 rounded">
                        <div className="text-lg font-bold text-blue-400">{150 + Math.floor(Math.sin(strategyDescription.length) * 100)}</div>
                        <div className="text-xs text-[#a0a0b8]">Total Trades</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Analysis Mode - Chart Browser */}
        {mode === 'analysis' && (
          <div className="space-y-6">
            
            {/* Chart Browser */}
            <Card className="bg-[#15151f] border-[#2a2a3e]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">📊 Professional Chart Analytics</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MaximizeIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                
                {/* Chart Type Tabs */}
                <div className="mb-6">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-2 pb-2">
                      {chartTypes.map((chart) => (
                        <Button
                          key={chart.id}
                          variant={activeChart === chart.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveChart(chart.id)}
                          className="text-xs whitespace-nowrap"
                        >
                          <span className="mr-1">{chart.icon}</span>
                          {chart.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                {/* Selected Chart */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart(activeChart, portfolioEquityData)}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Assistant (Always Visible at Bottom) */}
        <div className="mt-6">
          <Card className="bg-[#15151f] border-[#2a2a3e]">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuitIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white">AI Assistant</span>
                </div>
                <div className="text-xs text-[#a0a0b8]">
                  {mode === 'portfolio' && "💡 Try: 'Test my best strategy' or 'Show me sector exposure'"}
                  {mode === 'strategy' && "💡 Try adjusting RSI parameters or click 'Auto-Optimize' for best settings"}
                  {mode === 'creation' && "💡 Describe your strategy idea above and I'll generate the complete code"}
                  {mode === 'analysis' && "💡 Click different chart types to explore your data from multiple angles"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
