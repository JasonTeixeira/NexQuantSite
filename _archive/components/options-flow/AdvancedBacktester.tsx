"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Play, Pause, Square, BarChart3, TrendingUp, TrendingDown,
  Target, Zap, Brain, Clock, DollarSign, Percent, Shield,
  Settings, Save, Download, Upload, RefreshCw, AlertTriangle,
  CheckCircle, Activity, PieChart, Calendar, Filter, Plus,
  Minus, Eye, Code, Layers, Award, Crown, Star, Rocket
} from "lucide-react"

interface BacktestStrategy {
  id: string
  name: string
  description: string
  type: 'options' | 'stock' | 'mixed'
  code: string
  parameters: {
    [key: string]: {
      value: number | string | boolean
      min?: number
      max?: number
      step?: number
      options?: string[]
    }
  }
  createdAt: Date
  lastRun?: Date
  isPublic: boolean
  author: string
  tags: string[]
}

interface BacktestResult {
  id: string
  strategyId: string
  startDate: Date
  endDate: Date
  initialCapital: number
  finalValue: number
  totalReturn: number
  totalReturnPercent: number
  maxDrawdown: number
  maxDrawdownPercent: number
  sharpeRatio: number
  calmarRatio: number
  sortinoRatio: number
  winRate: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  averageHoldingPeriod: number
  volatility: number
  beta: number
  alpha: number
  trades: BacktestTrade[]
  equityCurve: { date: Date; value: number; drawdown: number }[]
  monthlyReturns: { month: string; return: number }[]
  riskMetrics: {
    var95: number
    var99: number
    expectedShortfall: number
    maximumLoss: number
    consecutiveLosses: number
  }
  status: 'running' | 'completed' | 'failed'
  progress: number
  duration: number
}

interface BacktestTrade {
  id: string
  entryDate: Date
  exitDate: Date
  symbol: string
  type: 'stock' | 'call' | 'put'
  side: 'long' | 'short'
  quantity: number
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPercent: number
  commission: number
  slippage: number
  holdingPeriod: number
  maxFavorable: number
  maxAdverse: number
  reason: string
}

interface OptimizationJob {
  id: string
  strategyId: string
  parameters: string[]
  ranges: { [key: string]: { min: number; max: number; step: number } }
  objective: 'sharpe' | 'return' | 'calmar' | 'sortino' | 'custom'
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  results: { parameters: any; score: number }[]
  bestResult?: { parameters: any; score: number; backtest: BacktestResult }
  startTime: Date
  estimatedCompletion?: Date
}

interface AdvancedBacktesterProps {
  className?: string
}

export default function AdvancedBacktester({ className = "" }: AdvancedBacktesterProps) {
  const [strategies, setStrategies] = useState<BacktestStrategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<BacktestStrategy | null>(null)
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [activeBacktest, setActiveBacktest] = useState<BacktestResult | null>(null)
  const [optimizationJobs, setOptimizationJobs] = useState<OptimizationJob[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [startDate, setStartDate] = useState('2020-01-01')
  const [endDate, setEndDate] = useState('2023-12-31')
  const [initialCapital, setInitialCapital] = useState(100000)
  const [commission, setCommission] = useState(1.0)
  const [slippage, setSlippage] = useState(0.01)
  const [activeTab, setActiveTab] = useState<'strategies' | 'results' | 'optimization' | 'analysis'>('strategies')

  // Initialize with example strategies
  useEffect(() => {
    const exampleStrategies: BacktestStrategy[] = [
      {
        id: '1',
        name: 'Gamma Squeeze Momentum',
        description: 'Buy calls when gamma squeeze probability exceeds 80% and momentum is positive',
        type: 'options',
        code: `
// Gamma Squeeze Momentum Strategy
def strategy(data):
    signals = []
    for i in range(1, len(data)):
        gamma_prob = data[i]['gamma_squeeze_probability']
        momentum = data[i]['price'] / data[i-lookback]['price'] - 1
        iv_rank = data[i]['iv_rank']
        
        # Entry conditions
        if (gamma_prob > gamma_threshold and 
            momentum > momentum_threshold and 
            iv_rank < iv_max_threshold):
            signals.append(('BUY_CALL', data[i]['symbol'], data[i]['date']))
            
        # Exit conditions  
        elif (gamma_prob < gamma_exit_threshold or
              days_held > max_hold_days):
            signals.append(('SELL_CALL', data[i]['symbol'], data[i]['date']))
    
    return signals
        `,
        parameters: {
          gamma_threshold: { value: 80, min: 60, max: 95, step: 5 },
          momentum_threshold: { value: 0.02, min: 0.01, max: 0.1, step: 0.01 },
          iv_max_threshold: { value: 50, min: 20, max: 80, step: 5 },
          gamma_exit_threshold: { value: 40, min: 20, max: 70, step: 5 },
          max_hold_days: { value: 7, min: 1, max: 30, step: 1 },
          lookback: { value: 5, min: 1, max: 20, step: 1 }
        },
        createdAt: new Date(Date.now() - 86400000 * 7),
        author: 'System',
        isPublic: true,
        tags: ['gamma-squeeze', 'momentum', 'options', 'short-term']
      },
      {
        id: '2',
        name: 'Smart Money Follow',
        description: 'Follow institutional flow patterns with risk management',
        type: 'options',
        code: `
// Smart Money Follow Strategy  
def strategy(data):
    signals = []
    for i in range(1, len(data)):
        smart_score = data[i]['smart_money_score']
        flow_volume = data[i]['options_volume']
        put_call_ratio = data[i]['put_call_ratio']
        
        # Long setup
        if (smart_score > smart_threshold and
            flow_volume > volume_threshold and
            put_call_ratio < pc_bullish_threshold):
            signals.append(('BUY_CALL', data[i]['symbol'], data[i]['date']))
            
        # Short setup
        elif (smart_score > smart_threshold and
              flow_volume > volume_threshold and
              put_call_ratio > pc_bearish_threshold):
            signals.append(('BUY_PUT', data[i]['symbol'], data[i]['date']))
    
    return signals
        `,
        parameters: {
          smart_threshold: { value: 85, min: 70, max: 99, step: 1 },
          volume_threshold: { value: 50000, min: 10000, max: 200000, step: 10000 },
          pc_bullish_threshold: { value: 0.7, min: 0.3, max: 0.8, step: 0.05 },
          pc_bearish_threshold: { value: 1.3, min: 1.1, max: 2.0, step: 0.05 }
        },
        createdAt: new Date(Date.now() - 86400000 * 14),
        author: 'AI Engine',
        isPublic: true,
        tags: ['smart-money', 'institutional', 'flow', 'options']
      },
      {
        id: '3',
        name: 'Mean Reversion Straddle',
        description: 'Volatility-based straddle strategy for high IV environments',
        type: 'options',
        code: `
// Mean Reversion Straddle Strategy
def strategy(data):
    signals = []
    for i in range(lookback, len(data)):
        iv_current = data[i]['implied_volatility']
        iv_avg = np.mean([data[j]['implied_volatility'] 
                         for j in range(i-lookback, i)])
        iv_percentile = data[i]['iv_percentile']
        
        # Enter straddle when IV is high
        if (iv_percentile > iv_entry_threshold and
            iv_current > iv_avg * iv_multiplier):
            signals.append(('BUY_STRADDLE', data[i]['symbol'], data[i]['date']))
            
        # Exit when IV normalizes
        elif iv_percentile < iv_exit_threshold:
            signals.append(('SELL_STRADDLE', data[i]['symbol'], data[i]['date']))
    
    return signals
        `,
        parameters: {
          lookback: { value: 20, min: 5, max: 60, step: 5 },
          iv_entry_threshold: { value: 80, min: 60, max: 95, step: 5 },
          iv_exit_threshold: { value: 40, min: 20, max: 60, step: 5 },
          iv_multiplier: { value: 1.2, min: 1.1, max: 2.0, step: 0.1 }
        },
        createdAt: new Date(Date.now() - 86400000 * 21),
        author: 'Volatility Expert',
        isPublic: true,
        tags: ['mean-reversion', 'volatility', 'straddle', 'iv-rank']
      }
    ]
    
    setStrategies(exampleStrategies)
    setSelectedStrategy(exampleStrategies[0])
  }, [])

  // Generate example backtest results
  const generateBacktestResult = (strategy: BacktestStrategy): BacktestResult => {
    const trades = 150 + Math.floor(Math.random() * 200)
    const winRate = 0.45 + Math.random() * 0.25
    const avgWin = 100 + Math.random() * 200
    const avgLoss = -(50 + Math.random() * 100)
    const totalReturn = (winRate * avgWin + (1 - winRate) * avgLoss) * trades
    
    return {
      id: Date.now().toString(),
      strategyId: strategy.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      initialCapital: initialCapital,
      finalValue: initialCapital + totalReturn,
      totalReturn: totalReturn,
      totalReturnPercent: (totalReturn / initialCapital) * 100,
      maxDrawdown: -8000 - Math.random() * 12000,
      maxDrawdownPercent: -8 - Math.random() * 12,
      sharpeRatio: 0.8 + Math.random() * 1.2,
      calmarRatio: 0.6 + Math.random() * 0.8,
      sortinoRatio: 1.0 + Math.random() * 1.5,
      winRate: winRate * 100,
      profitFactor: 1.1 + Math.random() * 0.8,
      averageWin: avgWin,
      averageLoss: Math.abs(avgLoss),
      totalTrades: trades,
      winningTrades: Math.floor(trades * winRate),
      losingTrades: Math.floor(trades * (1 - winRate)),
      averageHoldingPeriod: 3 + Math.random() * 7,
      volatility: 15 + Math.random() * 20,
      beta: 0.8 + Math.random() * 0.8,
      alpha: -2 + Math.random() * 8,
      trades: [],
      equityCurve: [],
      monthlyReturns: [],
      riskMetrics: {
        var95: -2500 - Math.random() * 2000,
        var99: -4000 - Math.random() * 3000,
        expectedShortfall: -5000 - Math.random() * 3000,
        maximumLoss: -8000 - Math.random() * 5000,
        consecutiveLosses: 3 + Math.floor(Math.random() * 5)
      },
      status: 'completed',
      progress: 100,
      duration: 45 + Math.random() * 60
    }
  }

  const runBacktest = async () => {
    if (!selectedStrategy) return
    
    setIsRunning(true)
    const newResult = generateBacktestResult(selectedStrategy)
    newResult.status = 'running'
    newResult.progress = 0
    
    setActiveBacktest(newResult)
    
    // Simulate progress
    const interval = setInterval(() => {
      setActiveBacktest(prev => {
        if (!prev) return null
        const newProgress = prev.progress + 5 + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          const completedResult = { ...prev, progress: 100, status: 'completed' as const }
          setBacktestResults(prevResults => [completedResult, ...prevResults])
          return completedResult
        }
        return { ...prev, progress: Math.min(newProgress, 100) }
      })
    }, 500)
  }

  const startOptimization = () => {
    if (!selectedStrategy) return
    
    const newOptimization: OptimizationJob = {
      id: Date.now().toString(),
      strategyId: selectedStrategy.id,
      parameters: Object.keys(selectedStrategy.parameters),
      ranges: Object.entries(selectedStrategy.parameters).reduce((acc, [key, param]) => {
        if (typeof param.value === 'number' && param.min !== undefined && param.max !== undefined) {
          acc[key] = { min: param.min, max: param.max, step: param.step || 1 }
        }
        return acc
      }, {} as any),
      objective: 'sharpe',
      status: 'running',
      progress: 0,
      results: [],
      startTime: new Date()
    }
    
    setOptimizationJobs([newOptimization, ...optimizationJobs])
    
    // Simulate optimization
    const interval = setInterval(() => {
      setOptimizationJobs(prev => prev.map(job => {
        if (job.id === newOptimization.id) {
          const newProgress = job.progress + 3 + Math.random() * 7
          if (newProgress >= 100) {
            clearInterval(interval)
            return {
              ...job,
              progress: 100,
              status: 'completed',
              bestResult: {
                parameters: selectedStrategy.parameters,
                score: 1.5 + Math.random() * 0.8,
                backtest: generateBacktestResult(selectedStrategy)
              }
            }
          }
          return { ...job, progress: Math.min(newProgress, 100) }
        }
        return job
      }))
    }, 800)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/40 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 30px rgba(6, 182, 212, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced Backtester</h2>
            <p className="text-gray-400">ML-powered strategy testing & optimization</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeBacktest && activeBacktest.status === 'running' && (
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-400/30 animate-pulse">
              Running... {activeBacktest.progress.toFixed(0)}%
            </Badge>
          )}
          <Badge className="bg-primary/20 text-primary border border-primary/30">
            {strategies.length} Strategies
          </Badge>
          <Badge className="bg-green-500/20 text-green-400 border border-green-400/30">
            {backtestResults.length} Results
          </Badge>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-primary/20 mb-6">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Strategy List */}
            <div className="lg:col-span-1">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Trading Strategies</span>
                    <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30">
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strategies.map((strategy, index) => (
                    <motion.div
                      key={strategy.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                        selectedStrategy?.id === strategy.id
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-primary/20 hover:border-primary/40 bg-black/20'
                      }`}
                      onClick={() => setSelectedStrategy(strategy)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold text-sm">{strategy.name}</h3>
                        <div className="flex items-center gap-1">
                          <Badge className={`text-xs ${
                            strategy.type === 'options' ? 'bg-blue-500/20 text-blue-400' :
                            strategy.type === 'stock' ? 'bg-green-500/20 text-green-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {strategy.type}
                          </Badge>
                          {strategy.isPublic && <Crown className="w-4 h-4 text-yellow-400" />}
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">{strategy.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {strategy.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>by {strategy.author}</span>
                        <span>{strategy.createdAt.toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Backtest Settings */}
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Backtest Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300 text-xs">Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-black/60 border-primary/30 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs">End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-black/60 border-primary/30 text-xs"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-xs">Initial Capital</Label>
                    <Input
                      type="number"
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(Number(e.target.value))}
                      className="bg-black/60 border-primary/30 text-xs"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300 text-xs">Commission ($)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={commission}
                        onChange={(e) => setCommission(Number(e.target.value))}
                        className="bg-black/60 border-primary/30 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs">Slippage (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={slippage}
                        onChange={(e) => setSlippage(Number(e.target.value))}
                        className="bg-black/60 border-primary/30 text-xs"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={runBacktest}
                    disabled={isRunning || !selectedStrategy}
                    className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  >
                    {isRunning ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                      </motion.div>
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isRunning ? 'Running...' : 'Run Backtest'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Strategy Details & Code */}
            <div className="lg:col-span-2">
              {selectedStrategy ? (
                <div className="space-y-6">
                  {/* Strategy Info */}
                  <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span>{selectedStrategy.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            selectedStrategy.type === 'options' ? 'bg-blue-500/20 text-blue-400' :
                            selectedStrategy.type === 'stock' ? 'bg-green-500/20 text-green-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {selectedStrategy.type.toUpperCase()}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Code className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{selectedStrategy.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedStrategy.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        Created by {selectedStrategy.author} on {selectedStrategy.createdAt.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strategy Parameters */}
                  <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Strategy Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedStrategy.parameters).map(([key, param]) => (
                          <div key={key}>
                            <Label className="text-gray-300 text-sm capitalize">
                              {key.replace(/_/g, ' ')}
                            </Label>
                            {typeof param.value === 'number' ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="number"
                                  value={param.value}
                                  min={param.min}
                                  max={param.max}
                                  step={param.step}
                                  className="bg-black/60 border-primary/30 text-sm"
                                />
                                {param.min !== undefined && param.max !== undefined && (
                                  <span className="text-xs text-gray-400">
                                    ({param.min}-{param.max})
                                  </span>
                                )}
                              </div>
                            ) : typeof param.value === 'boolean' ? (
                              <Switch checked={param.value} className="mt-1" />
                            ) : (
                              <Select value={param.value.toString()}>
                                <SelectTrigger className="bg-black/60 border-primary/30 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {param.options?.map(option => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strategy Code */}
                  <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Code className="w-5 h-5 text-green-400" />
                        Strategy Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-black/60 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-primary/10">
                          <code>{selectedStrategy.code}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Strategy</h3>
                      <p className="text-gray-400">Choose a strategy from the list to view details and run backtests</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Active Backtest Progress */}
          {activeBacktest && activeBacktest.status === 'running' && (
            <motion.div
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 bg-black/90 backdrop-blur-sm rounded-xl border border-primary/20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-5 h-5 text-primary" />
                  </motion.div>
                  <span className="text-white">Running backtest...</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress value={activeBacktest.progress} className="w-32 h-2" />
                  <span className="text-primary text-sm font-mono">
                    {activeBacktest.progress.toFixed(0)}%
                  </span>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveBacktest(null)}
                  className="text-red-400 hover:bg-red-500/20"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-6">
            {backtestResults.length > 0 ? (
              <>
                {backtestResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span>{strategies.find(s => s.id === result.strategyId)?.name || 'Unknown Strategy'}</span>
                            <Badge className={result.status === 'completed' ? 
                              "bg-green-500/20 text-green-400" : 
                              result.status === 'failed' ? "bg-red-500/20 text-red-400" :
                              "bg-yellow-500/20 text-yellow-400"
                            }>
                              {result.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {result.startDate.toLocaleDateString()} - {result.endDate.toLocaleDateString()}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getPerformanceColor(result.totalReturn)}`}>
                              {formatCurrency(result.totalReturn)}
                            </div>
                            <div className="text-xs text-gray-400">Total Return</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getPerformanceColor(result.totalReturnPercent)}`}>
                              {formatPercent(result.totalReturnPercent)}
                            </div>
                            <div className="text-xs text-gray-400">Return %</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                              {result.sharpeRatio.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">Sharpe Ratio</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-400">
                              {formatPercent(result.maxDrawdownPercent)}
                            </div>
                            <div className="text-xs text-gray-400">Max Drawdown</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">
                              {result.winRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-400">Win Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {result.totalTrades}
                            </div>
                            <div className="text-xs text-gray-400">Total Trades</div>
                          </div>
                        </div>

                        {/* Detailed Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-white font-semibold mb-3">Performance</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Profit Factor</span>
                                <span className="text-white">{result.profitFactor.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Calmar Ratio</span>
                                <span className="text-white">{result.calmarRatio.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Sortino Ratio</span>
                                <span className="text-white">{result.sortinoRatio.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Beta</span>
                                <span className="text-white">{result.beta.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Alpha</span>
                                <span className={getPerformanceColor(result.alpha)}>
                                  {formatPercent(result.alpha)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-white font-semibold mb-3">Trade Statistics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Winning Trades</span>
                                <span className="text-green-400">{result.winningTrades}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Losing Trades</span>
                                <span className="text-red-400">{result.losingTrades}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Average Win</span>
                                <span className="text-green-400">{formatCurrency(result.averageWin)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Average Loss</span>
                                <span className="text-red-400">{formatCurrency(-result.averageLoss)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Avg Hold Period</span>
                                <span className="text-white">{result.averageHoldingPeriod.toFixed(1)} days</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-white font-semibold mb-3">Risk Metrics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">VaR 95%</span>
                                <span className="text-red-400">{formatCurrency(result.riskMetrics.var95)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">VaR 99%</span>
                                <span className="text-red-400">{formatCurrency(result.riskMetrics.var99)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Expected Shortfall</span>
                                <span className="text-red-400">{formatCurrency(result.riskMetrics.expectedShortfall)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Max Loss</span>
                                <span className="text-red-400">{formatCurrency(result.riskMetrics.maximumLoss)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Volatility</span>
                                <span className="text-white">{result.volatility.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-6 pt-4 border-t border-gray-800">
                          <Button className="bg-primary/20 text-primary hover:bg-primary/30">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="ghost">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                          </Button>
                          <Button variant="ghost">
                            <Layers className="w-4 h-4 mr-2" />
                            Compare
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </>
            ) : (
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Backtest Results</h3>
                    <p className="text-gray-400">Run your first backtest to see results here</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="optimization">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization Setup */}
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Parameter Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStrategy ? (
                  <>
                    <div>
                      <Label className="text-gray-300">Strategy</Label>
                      <div className="p-3 bg-black/40 rounded-lg border border-primary/10 mt-2">
                        <div className="text-white font-medium">{selectedStrategy.name}</div>
                        <div className="text-gray-400 text-sm">{selectedStrategy.description}</div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-300">Optimization Objective</Label>
                      <Select defaultValue="sharpe">
                        <SelectTrigger className="bg-black/60 border-primary/30 mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sharpe">Sharpe Ratio</SelectItem>
                          <SelectItem value="return">Total Return</SelectItem>
                          <SelectItem value="calmar">Calmar Ratio</SelectItem>
                          <SelectItem value="sortino">Sortino Ratio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-gray-300">Parameters to Optimize</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {Object.entries(selectedStrategy.parameters).map(([key, param]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-black/20 rounded">
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked />
                              <span className="text-white text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                            </div>
                            <span className="text-gray-400 text-xs">
                              {typeof param.value === 'number' && param.min !== undefined && param.max !== undefined
                                ? `${param.min} - ${param.max}`
                                : 'N/A'
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={startOptimization}
                      className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Start Optimization
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Select a strategy to optimize parameters</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optimization Results */}
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Optimization Jobs ({optimizationJobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {optimizationJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    className="p-4 bg-black/20 rounded-lg border border-primary/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-medium">
                          {strategies.find(s => s.id === job.strategyId)?.name || 'Unknown'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Optimizing {job.parameters.length} parameters
                        </div>
                      </div>
                      <Badge className={
                        job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        job.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        job.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {job.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {job.status === 'running' && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-xs">Progress</span>
                          <span className="text-primary text-xs">{job.progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                    
                    {job.bestResult && (
                      <div className="p-3 bg-black/40 rounded border border-primary/10">
                        <div className="text-sm text-gray-400 mb-2">Best Result</div>
                        <div className="flex justify-between items-center">
                          <span className="text-white">Score: {job.bestResult.score.toFixed(3)}</span>
                          <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30">
                            View Details
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Started: {job.startTime.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
                
                {optimizationJobs.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No optimization jobs yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Advanced Analysis Coming Soon</h3>
            <p className="text-gray-400">
              Monte Carlo simulations, walk-forward analysis, and advanced risk decomposition
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
