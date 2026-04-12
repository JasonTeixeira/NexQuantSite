"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Play, Pause, TrendingUp, TrendingDown, BarChart3, CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { format } from "date-fns"

interface BacktestResult {
  date: string
  portfolioValue: number
  benchmark: number
  drawdown: number
  returns: number
}

interface Strategy {
  id: string
  name: string
  description: string
  parameters: Record<string, any>
}

interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  calmarRatio: number
}

interface AdvancedMetrics {
  informationRatio: number
  treynorRatio: number
  jensenAlpha: number
  trackingError: number
  downside_deviation: number
  ulcer_index: number
  burke_ratio: number
  pain_index: number
}

export function BacktestingEngine() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string>("")
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date(2020, 0, 1))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [initialCapital, setInitialCapital] = useState("1000000")
  const [transactionCosts] = useState({
    commission: 0.005,
    spread: 0.002,
    marketImpact: 0.001,
    slippage: 0.0015,
    borrowingCost: 0.02,
  })
  const [walkForwardResults] = useState([
    { period: "2021-Q1", inSample: 12.5, outSample: 8.3, degradation: -33.6 },
    { period: "2021-Q2", inSample: 15.2, outSample: 11.8, degradation: -22.4 },
    { period: "2021-Q3", inSample: 9.8, outSample: 7.1, degradation: -27.6 },
    { period: "2021-Q4", inSample: 18.4, outSample: 14.2, degradation: -22.8 },
  ])
  const [dataFrequencies] = useState(["1min", "5min", "15min", "1hour", "4hour", "1day", "1week"])
  const [advancedMetrics] = useState({
    informationRatio: 0.85,
    treynorRatio: 0.12,
    jensenAlpha: 0.034,
    trackingError: 0.045,
    downside_deviation: 0.089,
    ulcer_index: 0.067,
    burke_ratio: 1.23,
    pain_index: 0.034,
  })

  // Mock data initialization
  useEffect(() => {
    const mockStrategies: Strategy[] = [
      {
        id: "momentum",
        name: "Momentum Strategy",
        description: "Buy assets with strong recent performance",
        parameters: { lookback: 20, threshold: 0.05, rebalance: "monthly" },
      },
      {
        id: "mean-reversion",
        name: "Mean Reversion",
        description: "Buy oversold assets, sell overbought",
        parameters: { rsi_period: 14, oversold: 30, overbought: 70 },
      },
      {
        id: "pairs-trading",
        name: "Pairs Trading",
        description: "Statistical arbitrage between correlated assets",
        parameters: { correlation_threshold: 0.8, zscore_entry: 2.0, zscore_exit: 0.5 },
      },
      {
        id: "ml-ensemble",
        name: "ML Ensemble",
        description: "Machine learning ensemble model",
        parameters: { models: ["rf", "xgb", "lstm"], features: 50, rebalance: "weekly" },
      },
    ]

    // Generate mock backtest data
    const mockResults: BacktestResult[] = []
    const startValue = 1000000
    let portfolioValue = startValue
    let benchmarkValue = startValue

    for (let i = 0; i < 252 * 3; i++) {
      // 3 years of daily data
      const date = new Date(2021, 0, 1)
      date.setDate(date.getDate() + i)

      const portfolioReturn = (Math.random() - 0.48) * 0.02 // Slight positive bias
      const benchmarkReturn = (Math.random() - 0.5) * 0.015

      portfolioValue *= 1 + portfolioReturn
      benchmarkValue *= 1 + benchmarkReturn

      const drawdown = Math.max(
        0,
        ((Math.max(...mockResults.map((r) => r.portfolioValue), portfolioValue) - portfolioValue) /
          Math.max(...mockResults.map((r) => r.portfolioValue), portfolioValue)) *
          100,
      )

      mockResults.push({
        date: format(date, "yyyy-MM-dd"),
        portfolioValue,
        benchmark: benchmarkValue,
        drawdown,
        returns: portfolioReturn * 100,
      })
    }

    const mockMetrics: PerformanceMetrics = {
      totalReturn: 45.8,
      annualizedReturn: 13.2,
      volatility: 18.5,
      sharpeRatio: 0.71,
      maxDrawdown: 12.3,
      winRate: 58.2,
      profitFactor: 1.45,
      calmarRatio: 1.07,
    }

    setStrategies(mockStrategies)
    setSelectedStrategy("momentum")
    setBacktestResults(mockResults)
    setPerformanceMetrics(mockMetrics)
  }, [])

  const runBacktest = async () => {
    setIsRunning(true)

    // Simulate backtest execution
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Generate new results with some randomization
    const newResults = backtestResults.map((result) => ({
      ...result,
      portfolioValue: result.portfolioValue * (1 + (Math.random() - 0.5) * 0.1),
      returns: result.returns * (1 + (Math.random() - 0.5) * 0.2),
    }))

    setBacktestResults(newResults)
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

  const getMetricColor = (value: number, isPositive = true) => {
    if (isPositive) {
      return value > 0 ? "text-green-400" : "text-red-400"
    } else {
      return value < 0 ? "text-green-400" : "text-red-400"
    }
  }

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Backtesting Engine</h1>
          <div className="flex items-center space-x-4">
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

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#1a1a2e]">
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Setup
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Results
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Metrics
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="monte-carlo"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Monte Carlo
            </TabsTrigger>
            <TabsTrigger
              value="advanced-backtest"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Strategy Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Strategy</label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                        {strategies.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            {strategy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStrategy && (
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <h4 className="text-white font-semibold mb-2">
                        {strategies.find((s) => s.id === selectedStrategy)?.name}
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">
                        {strategies.find((s) => s.id === selectedStrategy)?.description}
                      </p>
                      <div className="space-y-2">
                        {Object.entries(strategies.find((s) => s.id === selectedStrategy)?.parameters || {}).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-400 capitalize">{key.replace("_", " ")}:</span>
                              <span className="text-white">{String(value)}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Initial Capital</label>
                    <Input
                      type="number"
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(e.target.value)}
                      className="bg-[#15151f] border-[#2a2a3e] text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Backtest Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-[#15151f] border-[#2a2a3e] text-white hover:bg-[#1a1a2e]"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(startDate, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1a1a2e] border-[#2a2a3e]">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => date && setStartDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-[#15151f] border-[#2a2a3e] text-white hover:bg-[#1a1a2e]"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(endDate, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1a1a2e] border-[#2a2a3e]">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => date && setEndDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                    <h4 className="text-white font-semibold mb-3">Backtest Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">
                          {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Initial Capital:</span>
                        <span className="text-white">{formatCurrency(Number.parseInt(initialCapital))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Strategy:</span>
                        <span className="text-[#00bbff]">
                          {strategies.find((s) => s.id === selectedStrategy)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={backtestResults.slice(-252)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "portfolioValue" ? "Portfolio" : "Benchmark",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="portfolioValue"
                      stroke="#00bbff"
                      strokeWidth={2}
                      name="Portfolio"
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
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Drawdown Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={backtestResults.slice(-252)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, "Drawdown"]}
                    />
                    <Area type="monotone" dataKey="drawdown" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {performanceMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Return</p>
                        <p className={`text-2xl font-bold ${getMetricColor(performanceMetrics.totalReturn)}`}>
                          {performanceMetrics.totalReturn.toFixed(1)}%
                        </p>
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
                        <p className="text-2xl font-bold text-[#00bbff]">{performanceMetrics.sharpeRatio.toFixed(2)}</p>
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
                        <p className="text-2xl font-bold text-red-400">-{performanceMetrics.maxDrawdown.toFixed(1)}%</p>
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
                        <p className="text-2xl font-bold text-green-400">{performanceMetrics.winRate.toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {performanceMetrics && (
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Detailed Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Annualized Return:</span>
                        <span className={getMetricColor(performanceMetrics.annualizedReturn)}>
                          {performanceMetrics.annualizedReturn.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volatility:</span>
                        <span className="text-yellow-400">{performanceMetrics.volatility.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit Factor:</span>
                        <span className="text-[#00bbff]">{performanceMetrics.profitFactor.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Calmar Ratio:</span>
                        <span className="text-[#00bbff]">{performanceMetrics.calmarRatio.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Returns Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={backtestResults.slice(-50).map((result, index) => ({
                      period: `P${index + 1}`,
                      returns: result.returns,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="period" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, "Return"]}
                    />
                    <Bar dataKey="returns" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monte-carlo" className="space-y-6">
            {/* Monte Carlo Simulation Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Monte Carlo Fan Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis stroke="#888" />
                      <YAxis stroke="#888" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      {/* Confidence Intervals */}
                      <Area
                        type="monotone"
                        dataKey="ci_95_upper"
                        stackId="1"
                        stroke="none"
                        fill="#00bbff"
                        fillOpacity={0.1}
                        data={[
                          { month: 0, ci_95_upper: 1000000, ci_95_lower: 1000000, ci_75_upper: 1000000, ci_75_lower: 1000000, median: 1000000 },
                          { month: 3, ci_95_upper: 1180000, ci_95_lower: 820000, ci_75_upper: 1120000, ci_75_lower: 890000, median: 1020000 },
                          { month: 6, ci_95_upper: 1350000, ci_95_lower: 680000, ci_75_upper: 1240000, ci_75_lower: 820000, median: 1050000 },
                          { month: 12, ci_95_upper: 1620000, ci_95_lower: 520000, ci_75_upper: 1450000, ci_75_lower: 720000, median: 1130000 },
                          { month: 18, ci_95_upper: 1920000, ci_95_lower: 380000, ci_75_upper: 1680000, ci_75_lower: 640000, median: 1220000 },
                          { month: 24, ci_95_upper: 2280000, ci_95_lower: 280000, ci_75_upper: 1950000, ci_75_lower: 580000, median: 1340000 }
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="ci_75_upper"
                        stackId="2"
                        stroke="none"
                        fill="#00bbff"
                        fillOpacity={0.2}
                        data={[
                          { month: 0, ci_95_upper: 1000000, ci_95_lower: 1000000, ci_75_upper: 1000000, ci_75_lower: 1000000, median: 1000000 },
                          { month: 3, ci_95_upper: 1180000, ci_95_lower: 820000, ci_75_upper: 1120000, ci_75_lower: 890000, median: 1020000 },
                          { month: 6, ci_95_upper: 1350000, ci_95_lower: 680000, ci_75_upper: 1240000, ci_75_lower: 820000, median: 1050000 },
                          { month: 12, ci_95_upper: 1620000, ci_95_lower: 520000, ci_75_upper: 1450000, ci_75_lower: 720000, median: 1130000 },
                          { month: 18, ci_95_upper: 1920000, ci_95_lower: 380000, ci_75_upper: 1680000, ci_75_lower: 640000, median: 1220000 },
                          { month: 24, ci_95_upper: 2280000, ci_95_lower: 280000, ci_75_upper: 1950000, ci_75_lower: 580000, median: 1340000 }
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="median"
                        stroke="#00bbff"
                        strokeWidth={3}
                        name="Median"
                        dot={false}
                        data={[
                          { month: 0, ci_95_upper: 1000000, ci_95_lower: 1000000, ci_75_upper: 1000000, ci_75_lower: 1000000, median: 1000000 },
                          { month: 3, ci_95_upper: 1180000, ci_95_lower: 820000, ci_75_upper: 1120000, ci_75_lower: 890000, median: 1020000 },
                          { month: 6, ci_95_upper: 1350000, ci_95_lower: 680000, ci_75_upper: 1240000, ci_75_lower: 820000, median: 1050000 },
                          { month: 12, ci_95_upper: 1620000, ci_95_lower: 520000, ci_75_upper: 1450000, ci_75_lower: 720000, median: 1130000 },
                          { month: 18, ci_95_upper: 1920000, ci_95_lower: 380000, ci_75_upper: 1680000, ci_75_lower: 640000, median: 1220000 },
                          { month: 24, ci_95_upper: 2280000, ci_95_lower: 280000, ci_75_upper: 1950000, ci_75_lower: 580000, median: 1340000 }
                        ]}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex justify-center space-x-6 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#00bbff]/10 rounded mr-2"></div>
                      <span className="text-gray-400">95% Confidence</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#00bbff]/20 rounded mr-2"></div>
                      <span className="text-gray-400">75% Confidence</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-1 bg-[#00bbff] rounded mr-2"></div>
                      <span className="text-gray-400">Median Path</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Simulation Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Simulations</label>
                        <Input
                          type="number"
                          defaultValue="10000"
                          className="bg-[#15151f] border-[#2a2a3e] text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Time Horizon (months)</label>
                        <Input
                          type="number"
                          defaultValue="24"
                          className="bg-[#15151f] border-[#2a2a3e] text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <h4 className="text-white font-semibold mb-3">Statistical Assumptions</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expected Return (Annual):</span>
                          <span className="text-green-400">13.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volatility (Annual):</span>
                          <span className="text-yellow-400">18.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Distribution:</span>
                          <span className="text-white">Normal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fat Tails Adjustment:</span>
                          <span className="text-[#00bbff]">Student-t (df=5)</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        console.log('Run Monte Carlo clicked')
                        alert('Starting Monte Carlo simulation with 10,000 paths...')
                      }}
                      className="w-full bg-[#00bbff] hover:bg-[#0099cc] text-white"
                    >
                      Run Monte Carlo Simulation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Probability Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Probability of Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { scenario: "Positive Return", probability: 78.4, color: "text-green-400" },
                      { scenario: "Return > 10%", probability: 65.2, color: "text-green-400" },
                      { scenario: "Return > 20%", probability: 42.8, color: "text-green-300" },
                      { scenario: "Drawdown < 10%", probability: 71.6, color: "text-[#00bbff]" },
                      { scenario: "Drawdown > 20%", probability: 18.3, color: "text-yellow-400" },
                      { scenario: "Loss > 30%", probability: 5.7, color: "text-red-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-gray-300">{item.scenario}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-[#2a2a3e] rounded-full h-2 relative">
                            <div
                              className={`h-2 rounded-full bg-current ${item.color}`}
                              style={{ width: `${item.probability}%` }}
                            />
                          </div>
                          <span className={`text-sm font-mono ${item.color}`}>
                            {item.probability.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Tail Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">VaR (95%)</div>
                        <div className="text-xl font-mono text-red-400">-18.2%</div>
                        <div className="text-xs text-gray-500">1-year horizon</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Expected Shortfall</div>
                        <div className="text-xl font-mono text-red-400">-24.8%</div>
                        <div className="text-xs text-gray-500">Beyond 95% VaR</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Maximum Loss (0.1% tail):</span>
                        <span className="text-red-400">-48.6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Maximum Gain (0.1% tail):</span>
                        <span className="text-green-400">+89.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skewness:</span>
                        <span className="text-yellow-400">0.23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Excess Kurtosis:</span>
                        <span className="text-yellow-400">1.47</span>
                      </div>
                    </div>

                    <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center text-yellow-400 text-sm">
                        <span className="mr-2">⚠️</span>
                        Fat tails detected - consider stress testing
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scenario Analysis */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Bull Market",
                      description: "Market up 25%, Low volatility",
                      return: "+32.4%",
                      probability: "15%",
                      color: "text-green-400",
                      bgColor: "bg-green-500/10 border-green-500/20"
                    },
                    {
                      name: "Base Case",
                      description: "Normal market conditions",
                      return: "+13.2%",
                      probability: "60%",
                      color: "text-[#00bbff]",
                      bgColor: "bg-[#00bbff]/10 border-[#00bbff]/20"
                    },
                    {
                      name: "Bear Market",
                      description: "Market down 20%, High volatility",
                      return: "-12.8%",
                      probability: "25%",
                      color: "text-red-400",
                      bgColor: "bg-red-500/10 border-red-500/20"
                    }
                  ].map((scenario, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${scenario.bgColor}`}>
                      <h4 className={`font-semibold ${scenario.color} mb-2`}>{scenario.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{scenario.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Expected Return:</span>
                          <span className={`font-mono ${scenario.color}`}>{scenario.return}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Probability:</span>
                          <span className="text-white">{scenario.probability}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced-backtest" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Transaction Cost Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(transactionCosts).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white">{(value * 100).toFixed(3)}%</span>
                          <Input
                            type="number"
                            step="0.001"
                            defaultValue={value}
                            className="w-20 h-8 text-xs bg-[#15151f] border-[#2a2a3e]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                    <h4 className="text-white font-semibold mb-2">Data Frequency</h4>
                    <Select defaultValue="1day">
                      <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                        {dataFrequencies.map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {freq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Walk-Forward Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {walkForwardResults.map((result, i) => (
                      <div key={i} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-semibold">{result.period}</span>
                          <Badge
                            variant="outline"
                            className={
                              result.degradation > -25
                                ? "text-green-400 border-green-500/30"
                                : "text-red-400 border-red-500/30"
                            }
                          >
                            {result.degradation.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">In-Sample: </span>
                            <span className="text-green-400">{result.inSample}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Out-Sample: </span>
                            <span className="text-yellow-400">{result.outSample}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      console.log('Use template clicked')
                      alert('Loading backtest template...')
                    }}
                    className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                    variant="outline"
                  >
                    Run Walk-Forward Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Advanced Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(advancedMetrics).map(([key, value]) => (
                    <div key={key} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="text-xs text-gray-400 mb-1 capitalize">{key.replace(/_/g, " ")}</div>
                      <div className="text-lg font-bold text-[#00bbff]">{value.toFixed(3)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
