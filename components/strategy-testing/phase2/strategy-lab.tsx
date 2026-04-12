"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  FlaskConical, 
  GitBranch, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  Brain,
  Activity
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"

interface StrategyNode {
  id: string
  type: "data" | "indicator" | "signal" | "filter" | "position" | "risk"
  name: string
  parameters: Record<string, any>
  connections: string[]
  position: { x: number; y: number }
}

interface BacktestResult {
  date: string
  portfolioValue: number
  benchmark: number
  drawdown: number
  signal: number
  position: number
}

interface FactorExposure {
  factor: string
  exposure: number
  tstat: number
  pvalue: number
}

interface StrategyMetrics {
  totalReturn: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  calmarRatio: number
  informationRatio: number
  beta: number
  alpha: number
}

export function StrategyLab() {
  const [activeStrategy, setActiveStrategy] = useState("momentum_crossover")
  const [isRunning, setIsRunning] = useState(false)
  const [strategyNodes, setStrategyNodes] = useState<StrategyNode[]>([])
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [strategyMetrics, setStrategyMetrics] = useState<StrategyMetrics | null>(null)
  const [factorExposures, setFactorExposures] = useState<FactorExposure[]>([])

  // Strategy templates
  const [strategyTemplates] = useState([
    {
      id: "momentum_crossover",
      name: "Momentum Crossover",
      description: "Moving average crossover with momentum filter",
      category: "Trend Following",
      complexity: "Beginner",
      expectedReturn: "12-18%",
      maxDrawdown: "8-15%"
    },
    {
      id: "mean_reversion",
      name: "Mean Reversion",
      description: "RSI-based mean reversion with volatility filter",
      category: "Mean Reversion", 
      complexity: "Intermediate",
      expectedReturn: "8-14%",
      maxDrawdown: "6-12%"
    },
    {
      id: "pairs_trading",
      name: "Statistical Arbitrage",
      description: "Pairs trading with cointegration analysis",
      category: "Market Neutral",
      complexity: "Advanced",
      expectedReturn: "10-16%",
      maxDrawdown: "4-8%"
    },
    {
      id: "ml_ensemble",
      name: "ML Ensemble",
      description: "Machine learning ensemble with feature selection",
      category: "Machine Learning",
      complexity: "Expert",
      expectedReturn: "15-25%",
      maxDrawdown: "10-18%"
    }
  ])

  // Available indicators
  const [indicators] = useState([
    { name: "SMA", category: "Trend", params: ["period"] },
    { name: "EMA", category: "Trend", params: ["period", "alpha"] },
    { name: "RSI", category: "Momentum", params: ["period", "overbought", "oversold"] },
    { name: "MACD", category: "Momentum", params: ["fast", "slow", "signal"] },
    { name: "Bollinger Bands", category: "Volatility", params: ["period", "std_dev"] },
    { name: "ATR", category: "Volatility", params: ["period"] },
    { name: "Stochastic", category: "Momentum", params: ["k_period", "d_period"] },
    { name: "Williams %R", category: "Momentum", params: ["period"] },
    { name: "CCI", category: "Momentum", params: ["period"] },
    { name: "ADX", category: "Trend", params: ["period"] }
  ])

  // Mock data initialization
  useEffect(() => {
    // Generate mock backtest results
    const mockResults: BacktestResult[] = []
    const startValue = 1000000
    let portfolioValue = startValue
    let benchmarkValue = startValue

    for (let i = 0; i < 252 * 2; i++) {
      const date = new Date(2022, 0, 1)
      date.setDate(date.getDate() + i)

      const signal = Math.sin(i / 20) + Math.random() * 0.5 - 0.25
      const portfolioReturn = signal * 0.001 + (Math.random() - 0.5) * 0.01
      const benchmarkReturn = (Math.random() - 0.5) * 0.008

      portfolioValue *= 1 + portfolioReturn
      benchmarkValue *= 1 + benchmarkReturn

      const drawdown = Math.max(0, ((Math.max(...mockResults.map(r => r.portfolioValue), portfolioValue) - portfolioValue) / Math.max(...mockResults.map(r => r.portfolioValue), portfolioValue)) * 100)

      mockResults.push({
        date: date.toISOString().split('T')[0],
        portfolioValue,
        benchmark: benchmarkValue,
        drawdown,
        signal,
        position: signal > 0.1 ? 1 : signal < -0.1 ? -1 : 0
      })
    }

    const mockMetrics: StrategyMetrics = {
      totalReturn: 28.5,
      annualizedReturn: 13.8,
      volatility: 16.2,
      sharpeRatio: 0.85,
      maxDrawdown: 11.3,
      winRate: 58.7,
      profitFactor: 1.42,
      calmarRatio: 1.22,
      informationRatio: 0.67,
      beta: 0.78,
      alpha: 0.045
    }

    const mockFactorExposures: FactorExposure[] = [
      { factor: "Market", exposure: 0.78, tstat: 12.4, pvalue: 0.000 },
      { factor: "Size", exposure: -0.12, tstat: -2.1, pvalue: 0.036 },
      { factor: "Value", exposure: 0.23, tstat: 3.8, pvalue: 0.000 },
      { factor: "Momentum", exposure: 0.45, tstat: 7.2, pvalue: 0.000 },
      { factor: "Quality", exposure: 0.18, tstat: 2.9, pvalue: 0.004 },
      { factor: "Low Vol", exposure: -0.08, tstat: -1.3, pvalue: 0.194 }
    ]

    setBacktestResults(mockResults)
    setStrategyMetrics(mockMetrics)
    setFactorExposures(mockFactorExposures)
  }, [])

  const runBacktest = async () => {
    setIsRunning(true)
    // Simulate backtest execution
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsRunning(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FlaskConical className="h-8 w-8 text-[#00bbff]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Strategy Lab</h1>
              <p className="text-sm text-[#a0a0b8]">Build, test, and optimize trading strategies</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => {
                console.log('Save strategy clicked')
                alert('Strategy saved successfully!')
              }}
              variant="outline" 
              className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Strategy
            </Button>
            <Button onClick={runBacktest} disabled={isRunning} className="bg-[#00bbff] hover:bg-[#0099cc] text-white">
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Backtest
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#1a1a2e]">
            <TabsTrigger value="builder" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Strategy Builder
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Templates
            </TabsTrigger>
            <TabsTrigger value="indicators" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Indicators
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Backtest Results
            </TabsTrigger>
            <TabsTrigger value="factor-analysis" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Factor Analysis
            </TabsTrigger>
            <TabsTrigger value="optimization" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Optimization
            </TabsTrigger>
          </TabsList>

          {/* Strategy Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visual Strategy Builder */}
              <Card className="lg:col-span-2 bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <GitBranch className="h-5 w-5 mr-2" />
                    Visual Strategy Builder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-[#15151f] rounded-lg border border-[#2a2a3e] p-4 relative">
                    {/* Canvas for drag-and-drop strategy building */}
                    <div className="absolute inset-4 border-2 border-dashed border-[#2a2a3e] rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <GitBranch className="h-12 w-12 text-[#2a2a3e] mx-auto mb-4" />
                        <p className="text-[#a0a0b8] mb-2">Drag components to build your strategy</p>
                        <p className="text-sm text-[#666]">Connect data sources → indicators → signals → positions</p>
                      </div>
                    </div>
                    
                    {/* Sample strategy nodes */}
                    <div className="absolute top-8 left-8 bg-[#00bbff]/20 border border-[#00bbff] rounded-lg p-3 w-32">
                      <div className="text-xs text-[#00bbff] font-semibold">Data Source</div>
                      <div className="text-xs text-white mt-1">OHLCV</div>
                    </div>
                    
                    <div className="absolute top-8 left-48 bg-green-500/20 border border-green-500 rounded-lg p-3 w-32">
                      <div className="text-xs text-green-400 font-semibold">Indicator</div>
                      <div className="text-xs text-white mt-1">SMA(20)</div>
                    </div>
                    
                    <div className="absolute top-8 left-88 bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 w-32">
                      <div className="text-xs text-yellow-400 font-semibold">Signal</div>
                      <div className="text-xs text-white mt-1">Crossover</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Component Library */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Component Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-[#00bbff] mb-2">Data Sources</h4>
                      <div className="space-y-2">
                        {["OHLCV", "Volume", "Options", "Futures"].map((source) => (
                          <div key={source} className="p-2 bg-[#15151f] rounded border border-[#2a2a3e] cursor-pointer hover:border-[#00bbff] transition-colors">
                            <div className="text-xs text-white">{source}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2">Indicators</h4>
                      <div className="space-y-2">
                        {["SMA", "EMA", "RSI", "MACD"].map((indicator) => (
                          <div key={indicator} className="p-2 bg-[#15151f] rounded border border-[#2a2a3e] cursor-pointer hover:border-green-500 transition-colors">
                            <div className="text-xs text-white">{indicator}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">Signals</h4>
                      <div className="space-y-2">
                        {["Crossover", "Threshold", "Divergence"].map((signal) => (
                          <div key={signal} className="p-2 bg-[#15151f] rounded border border-[#2a2a3e] cursor-pointer hover:border-yellow-500 transition-colors">
                            <div className="text-xs text-white">{signal}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategy Configuration */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Strategy Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Strategy Name</label>
                    <Input
                      placeholder="My Strategy"
                      className="bg-[#15151f] border-[#2a2a3e] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Universe</label>
                    <Select defaultValue="sp500">
                      <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                        <SelectItem value="sp500">S&P 500</SelectItem>
                        <SelectItem value="nasdaq100">NASDAQ 100</SelectItem>
                        <SelectItem value="russell2000">Russell 2000</SelectItem>
                        <SelectItem value="custom">Custom Universe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Frequency</label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                        <SelectItem value="1min">1 Minute</SelectItem>
                        <SelectItem value="5min">5 Minutes</SelectItem>
                        <SelectItem value="1hour">1 Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Capital</label>
                    <Input
                      placeholder="1000000"
                      className="bg-[#15151f] border-[#2a2a3e] text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategyTemplates.map((template) => (
                <Card key={template.id} className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                        {template.complexity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a0a0b8] mb-4">{template.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white">{template.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Expected Return:</span>
                        <span className="text-green-400">{template.expectedReturn}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Max Drawdown:</span>
                        <span className="text-red-400">{template.maxDrawdown}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log(`Using template: ${template.name}`)
                        alert(`Loading ${template.name} template...`)
                      }}
                      className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Indicators Tab */}
          <TabsContent value="indicators" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {indicators.map((indicator, i) => (
                <Card key={i} className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{indicator.name}</CardTitle>
                      <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                        {indicator.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-400">Parameters:</div>
                      {indicator.params.map((param, j) => (
                        <div key={j} className="flex items-center justify-between">
                          <span className="text-sm text-[#a0a0b8] capitalize">{param.replace('_', ' ')}:</span>
                          <Input
                            placeholder="Value"
                            className="w-20 h-8 text-xs bg-[#15151f] border-[#2a2a3e] text-white"
                          />
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30">
                      Add to Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* Performance Chart */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Strategy Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={backtestResults.slice(-252)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="drawdown"
                      stackId="1"
                      stroke="#ff6b6b"
                      fill="#ff6b6b"
                      fillOpacity={0.3}
                    />
                    <Line
                      type="monotone"
                      dataKey="portfolioValue"
                      stroke="#00bbff"
                      strokeWidth={2}
                      name="Strategy"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#888"
                      strokeWidth={2}
                      name="Benchmark"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            {strategyMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Return</p>
                        <p className="text-2xl font-bold text-green-400">{strategyMetrics.totalReturn.toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Sharpe Ratio</p>
                        <p className="text-2xl font-bold text-[#00bbff]">{strategyMetrics.sharpeRatio.toFixed(2)}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-[#00bbff]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Max Drawdown</p>
                        <p className="text-2xl font-bold text-red-400">-{strategyMetrics.maxDrawdown.toFixed(1)}%</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Win Rate</p>
                        <p className="text-2xl font-bold text-green-400">{strategyMetrics.winRate.toFixed(1)}%</p>
                      </div>
                      <Target className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Factor Analysis Tab */}
          <TabsContent value="factor-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Factor Exposures */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Factor Exposures</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={factorExposures}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="factor" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="exposure" fill="#00bbff" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Factor Statistics */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Factor Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {factorExposures.map((factor, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex-1">
                          <div className="font-semibold text-white">{factor.factor}</div>
                          <div className="text-sm text-gray-400">
                            t-stat: {factor.tstat.toFixed(2)} | p-value: {factor.pvalue.toFixed(3)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono ${factor.exposure > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {factor.exposure > 0 ? '+' : ''}{factor.exposure.toFixed(3)}
                          </div>
                          <Badge
                            variant="outline"
                            className={factor.pvalue < 0.05 ? "text-green-400 border-green-500/30" : "text-gray-400 border-gray-500/30"}
                          >
                            {factor.pvalue < 0.05 ? "Significant" : "Not Sig."}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Factor Radar Chart */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Factor Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={factorExposures.map(f => ({ ...f, absExposure: Math.abs(f.exposure) }))}>
                    <PolarGrid stroke="#2a2a3e" />
                    <PolarAngleAxis dataKey="factor" tick={{ fill: '#888', fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Radar
                      name="Factor Exposure"
                      dataKey="absExposure"
                      stroke="#00bbff"
                      fill="#00bbff"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Parameter Optimization */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Parameter Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Optimization Objective</label>
                      <Select defaultValue="sharpe">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="sharpe">Maximize Sharpe Ratio</SelectItem>
                          <SelectItem value="return">Maximize Return</SelectItem>
                          <SelectItem value="calmar">Maximize Calmar Ratio</SelectItem>
                          <SelectItem value="sortino">Maximize Sortino Ratio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Optimization Method</label>
                      <Select defaultValue="grid">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="grid">Grid Search</SelectItem>
                          <SelectItem value="random">Random Search</SelectItem>
                          <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                          <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm text-gray-400">Parameter Ranges</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">SMA Period:</span>
                          <div className="flex items-center space-x-2">
                            <Input className="w-16 h-8 text-xs bg-[#15151f] border-[#2a2a3e]" placeholder="10" />
                            <span className="text-gray-400">to</span>
                            <Input className="w-16 h-8 text-xs bg-[#15151f] border-[#2a2a3e]" placeholder="50" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">RSI Period:</span>
                          <div className="flex items-center space-x-2">
                            <Input className="w-16 h-8 text-xs bg-[#15151f] border-[#2a2a3e]" placeholder="10" />
                            <span className="text-gray-400">to</span>
                            <Input className="w-16 h-8 text-xs bg-[#15151f] border-[#2a2a3e]" placeholder="30" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        console.log('Starting optimization')
                        alert('Parameter optimization started! This may take several minutes...')
                      }}
                      className="w-full bg-[#00bbff] hover:bg-[#0099cc] text-white"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Start Optimization
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Results */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Optimization Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="text-sm text-gray-400 mb-2">Best Parameters</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white">SMA Period:</span>
                          <span className="text-[#00bbff]">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white">RSI Period:</span>
                          <span className="text-[#00bbff]">18</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white">Threshold:</span>
                          <span className="text-[#00bbff]">0.15</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="text-sm text-gray-400 mb-2">Optimized Performance</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white">Sharpe Ratio:</span>
                          <span className="text-green-400">1.24</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white">Annual Return:</span>
                          <span className="text-green-400">18.7%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white">Max Drawdown:</span>
                          <span className="text-red-400">-8.3%</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button variant="outline" className="border-[#00bbff]/30 text-[#00bbff] hover:bg-[#00bbff]/20">
                        Apply Optimized Parameters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Optimization Surface */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Parameter Optimization Surface</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="x" stroke="#888" name="SMA Period" />
                    <YAxis dataKey="y" stroke="#888" name="RSI Period" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Scatter
                      name="Sharpe Ratio"
                      data={[
                        { x: 10, y: 14, z: 0.65 }, { x: 15, y: 14, z: 0.78 }, { x: 20, y: 14, z: 0.92 },
                        { x: 25, y: 14, z: 1.15 }, { x: 30, y: 14, z: 0.88 }, { x: 35, y: 14, z: 0.72 },
                        { x: 10, y: 18, z: 0.72 }, { x: 15, y: 18, z: 0.89 }, { x: 20, y: 18, z: 1.08 },
                        { x: 25, y: 18, z: 1.24 }, { x: 30, y: 18, z: 0.95 }, { x: 35, y: 18, z: 0.81 },
                        { x: 10, y: 22, z: 0.68 }, { x: 15, y: 22, z: 0.84 }, { x: 20, y: 22, z: 0.98 },
                        { x: 25, y: 22, z: 1.12 }, { x: 30, y: 22, z: 0.87 }, { x: 35, y: 22, z: 0.75 }
                      ]}
                      fill="#00bbff"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
