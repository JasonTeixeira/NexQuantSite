"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Target, Zap, Settings } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts"

interface Asset {
  symbol: string
  name: string
  currentWeight: number
  targetWeight: number
  expectedReturn: number
  volatility: number
  sharpeRatio: number
  correlation: number
}

interface OptimizationResult {
  method: string
  expectedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  assets: Asset[]
}

interface EfficientFrontierPoint {
  risk: number
  return: number
  sharpe: number
}

export function PortfolioOptimization() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([])
  const [efficientFrontier, setEfficientFrontier] = useState<EfficientFrontierPoint[]>([])
  const [riskTolerance, setRiskTolerance] = useState([50])
  const [optimizationMethod, setOptimizationMethod] = useState("max-sharpe")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [advancedOptimizers] = useState([
    "BLACK_LITTERMAN",
    "HIERARCHICAL_RISK_PARITY",
    "CRITICAL_LINE_ALGORITHM",
    "GENETIC_ALGORITHM",
    "PARTICLE_SWARM",
    "MULTI_OBJECTIVE_PARETO",
  ])
  const [constraintTypes] = useState([
    { name: "Sector Limits", enabled: true, value: "Tech: 30%, Finance: 25%" },
    { name: "ESG Score", enabled: false, value: "Minimum ESG score: 7.0" },
    { name: "Liquidity", enabled: true, value: "Min daily volume: $10M" },
    { name: "Market Cap", enabled: true, value: "Large cap only (>$10B)" },
    { name: "Geographic", enabled: false, value: "US: 70%, International: 30%" },
  ])
  const [optimizationObjectives] = useState([
    { name: "Maximize Sharpe Ratio", weight: 40, enabled: true },
    { name: "Minimize Volatility", weight: 30, enabled: true },
    { name: "Maximize Diversification", weight: 20, enabled: false },
    { name: "Minimize Turnover", weight: 10, enabled: false },
  ])

  // Mock data initialization
  useEffect(() => {
    const mockAssets: Asset[] = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        currentWeight: 15,
        targetWeight: 18,
        expectedReturn: 12.5,
        volatility: 22.1,
        sharpeRatio: 0.56,
        correlation: 0.75,
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corp.",
        currentWeight: 12,
        targetWeight: 16,
        expectedReturn: 11.8,
        volatility: 20.5,
        sharpeRatio: 0.58,
        correlation: 0.72,
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        currentWeight: 10,
        targetWeight: 14,
        expectedReturn: 13.2,
        volatility: 24.8,
        sharpeRatio: 0.53,
        correlation: 0.68,
      },
      {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        currentWeight: 8,
        targetWeight: 12,
        expectedReturn: 14.1,
        volatility: 28.3,
        sharpeRatio: 0.5,
        correlation: 0.65,
      },
      {
        symbol: "TSLA",
        name: "Tesla Inc.",
        currentWeight: 5,
        targetWeight: 8,
        expectedReturn: 18.5,
        volatility: 45.2,
        sharpeRatio: 0.41,
        correlation: 0.45,
      },
      {
        symbol: "NVDA",
        name: "NVIDIA Corp.",
        currentWeight: 7,
        targetWeight: 10,
        expectedReturn: 22.3,
        volatility: 38.7,
        sharpeRatio: 0.58,
        correlation: 0.58,
      },
      {
        symbol: "JPM",
        name: "JPMorgan Chase",
        currentWeight: 8,
        targetWeight: 6,
        expectedReturn: 8.9,
        volatility: 18.4,
        sharpeRatio: 0.48,
        correlation: 0.42,
      },
      {
        symbol: "JNJ",
        name: "Johnson & Johnson",
        currentWeight: 6,
        targetWeight: 4,
        expectedReturn: 6.8,
        volatility: 12.1,
        sharpeRatio: 0.56,
        correlation: 0.28,
      },
      {
        symbol: "SPY",
        name: "SPDR S&P 500 ETF",
        currentWeight: 15,
        targetWeight: 8,
        expectedReturn: 9.2,
        volatility: 16.8,
        sharpeRatio: 0.55,
        correlation: 1.0,
      },
      {
        symbol: "TLT",
        name: "iShares 20+ Year Treasury",
        currentWeight: 14,
        targetWeight: 4,
        expectedReturn: 3.5,
        volatility: 14.2,
        sharpeRatio: 0.25,
        correlation: -0.15,
      },
    ]

    const mockOptimizationResults: OptimizationResult[] = [
      {
        method: "Maximum Sharpe Ratio",
        expectedReturn: 12.8,
        volatility: 18.5,
        sharpeRatio: 0.69,
        maxDrawdown: 15.2,
        assets: mockAssets,
      },
      {
        method: "Minimum Variance",
        expectedReturn: 8.9,
        volatility: 12.1,
        sharpeRatio: 0.74,
        maxDrawdown: 8.7,
        assets: mockAssets.map((a) => ({ ...a, targetWeight: a.targetWeight * 0.7 })),
      },
      {
        method: "Risk Parity",
        expectedReturn: 10.5,
        volatility: 15.8,
        sharpeRatio: 0.66,
        maxDrawdown: 12.3,
        assets: mockAssets.map((a) => ({ ...a, targetWeight: 10 })),
      },
    ]

    // Generate efficient frontier
    const mockEfficientFrontier: EfficientFrontierPoint[] = []
    for (let i = 0; i <= 20; i++) {
      const risk = 8 + i * 1.5
      const ret = 4 + i * 0.8 + Math.random() * 2
      mockEfficientFrontier.push({
        risk,
        return: ret,
        sharpe: (ret - 2) / risk,
      })
    }

    setAssets(mockAssets)
    setOptimizationResults(mockOptimizationResults)
    setEfficientFrontier(mockEfficientFrontier)
  }, [])

  const runOptimization = async () => {
    setIsOptimizing(true)

    // Simulate optimization process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update target weights based on optimization method
    const updatedAssets = assets.map((asset) => {
      let newWeight = asset.currentWeight

      switch (optimizationMethod) {
        case "max-sharpe":
          newWeight = asset.sharpeRatio > 0.55 ? asset.currentWeight * 1.2 : asset.currentWeight * 0.8
          break
        case "min-variance":
          newWeight = asset.volatility < 20 ? asset.currentWeight * 1.3 : asset.currentWeight * 0.7
          break
        case "risk-parity":
          newWeight = 10 // Equal risk contribution
          break
        case "max-return":
          newWeight = asset.expectedReturn > 12 ? asset.currentWeight * 1.4 : asset.currentWeight * 0.6
          break
      }

      return { ...asset, targetWeight: Math.max(0, Math.min(25, newWeight)) }
    })

    // Normalize weights to sum to 100%
    const totalWeight = updatedAssets.reduce((sum, asset) => sum + asset.targetWeight, 0)
    const normalizedAssets = updatedAssets.map((asset) => ({
      ...asset,
      targetWeight: (asset.targetWeight / totalWeight) * 100,
    }))

    setAssets(normalizedAssets)
    setIsOptimizing(false)
  }

  const COLORS = [
    "#00bbff",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
  ]

  const pieData = assets.map((asset, index) => ({
    name: asset.symbol,
    value: asset.targetWeight,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto" data-testid="portfolio-dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Portfolio Optimization</h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
            >
              {isOptimizing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Run Optimization
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="optimizer" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[#1a1a2e]">
            <TabsTrigger
              value="optimizer"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Optimizer
            </TabsTrigger>
            <TabsTrigger
              value="efficient-frontier"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Efficient Frontier
            </TabsTrigger>
            <TabsTrigger
              value="allocation"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Asset Allocation
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Results
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimizer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Optimization Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Optimization Method</label>
                    <Select value={optimizationMethod} onValueChange={setOptimizationMethod}>
                      <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                        <SelectItem value="max-sharpe">Maximum Sharpe Ratio</SelectItem>
                        <SelectItem value="min-variance">Minimum Variance</SelectItem>
                        <SelectItem value="risk-parity">Risk Parity</SelectItem>
                        <SelectItem value="max-return">Maximum Return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Risk Tolerance: {riskTolerance[0]}%</label>
                    <Slider
                      value={riskTolerance}
                      onValueChange={setRiskTolerance}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Expected Return:</span>
                      <span className="text-green-400">12.8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Expected Volatility:</span>
                      <span className="text-yellow-400">18.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sharpe Ratio:</span>
                      <span className="text-[#00bbff]">0.69</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Asset Weights Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {assets.slice(0, 8).map((asset, index) => (
                      <div key={asset.symbol} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-mono text-white">{asset.symbol}</span>
                            <span className="text-sm text-gray-400">{asset.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-400">Current</div>
                              <div className="text-white">{asset.currentWeight.toFixed(1)}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">Target</div>
                              <div className="text-[#00bbff]">{asset.targetWeight.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="flex-1 bg-[#2a2a3e] rounded-full h-2">
                            <div
                              className="bg-gray-400 h-2 rounded-full"
                              style={{ width: `${asset.currentWeight}%` }}
                            />
                          </div>
                          <div className="flex-1 bg-[#2a2a3e] rounded-full h-2">
                            <div
                              className="bg-[#00bbff] h-2 rounded-full"
                              style={{ width: `${asset.targetWeight}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="efficient-frontier" className="space-y-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Efficient Frontier</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={efficientFrontier}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis
                      dataKey="risk"
                      stroke="#888"
                      label={{ value: "Risk (Volatility %)", position: "insideBottom", offset: -10 }}
                    />
                    <YAxis
                      dataKey="return"
                      stroke="#888"
                      label={{ value: "Expected Return %", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(2)}${name === "return" ? "%" : "%"}`,
                        name === "return" ? "Expected Return" : name === "risk" ? "Risk" : "Sharpe Ratio",
                      ]}
                    />
                    <Scatter dataKey="return" fill="#00bbff" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Target Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }: any) => `${name}: ${(value || 0).toFixed(1)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Asset Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {assets.slice(0, 6).map((asset) => (
                      <div key={asset.symbol} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-white">{asset.symbol}</span>
                          <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                            {asset.targetWeight.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gray-400">Return</div>
                            <div className="text-green-400">{asset.expectedReturn.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Volatility</div>
                            <div className="text-yellow-400">{asset.volatility.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Sharpe</div>
                            <div className="text-[#00bbff]">{asset.sharpeRatio.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optimizationResults.map((result, index) => (
                <Card key={index} className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{result.method}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expected Return:</span>
                        <span className="text-green-400">{result.expectedReturn.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volatility:</span>
                        <span className="text-yellow-400">{result.volatility.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sharpe Ratio:</span>
                        <span className="text-[#00bbff]">{result.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Drawdown:</span>
                        <span className="text-red-400">{result.maxDrawdown.toFixed(1)}%</span>
                      </div>
                      <Button
                        onClick={() => {
                          console.log(`Apply strategy clicked: ${result.method}`)
                          alert(`Applying ${result.method} optimization strategy...`)
                        }}
                        className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                        variant="outline"
                      >
                        Apply This Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Advanced Algorithms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Optimization Algorithm</label>
                    <Select defaultValue="BLACK_LITTERMAN">
                      <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                        {advancedOptimizers.map((algo) => (
                          <SelectItem key={algo} value={algo}>
                            {algo.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Multi-Objective Optimization</h4>
                    {optimizationObjectives.map((obj, i) => (
                      <div key={i} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm">{obj.name}</span>
                          <Badge
                            variant="outline"
                            className={
                              obj.enabled ? "text-green-400 border-green-500/30" : "text-gray-400 border-gray-500/30"
                            }
                          >
                            {obj.weight}%
                          </Badge>
                        </div>
                        <Slider value={[obj.weight]} max={100} step={5} className="w-full" disabled={!obj.enabled} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Portfolio Constraints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {constraintTypes.map((constraint, i) => (
                      <div key={i} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{constraint.name}</span>
                          <Badge
                            variant="outline"
                            className={
                              constraint.enabled
                                ? "text-green-400 border-green-500/30"
                                : "text-gray-400 border-gray-500/30"
                            }
                          >
                            {constraint.enabled ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{constraint.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                    <h4 className="text-white font-semibold mb-3">Optimization Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Iterations:</span>
                        <span className="text-white">10,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Convergence Tolerance:</span>
                        <span className="text-white">1e-8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rebalancing Frequency:</span>
                        <span className="text-[#00bbff]">Monthly</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
