"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Zap, Target, Clock, TrendingUp, Settings, Play, Pause, Brain } from "lucide-react"

interface ExecutionAlgorithm {
  id: string
  name: string
  description: string
  performance: number
  active: boolean
  trades: number
  fillRate: number
  slippage: number
}

interface SmartOrder {
  id: string
  symbol: string
  side: "buy" | "sell"
  quantity: number
  algorithm: string
  status: "pending" | "working" | "filled" | "cancelled"
  fillPercent: number
  avgPrice: number
  slippage: number
  timeInForce: string
}

export default function IntelligentExecution() {
  const [algorithms, setAlgorithms] = useState<ExecutionAlgorithm[]>([])
  const [smartOrders, setSmartOrders] = useState<SmartOrder[]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("twap")
  const [orderSymbol, setOrderSymbol] = useState("")
  const [orderQuantity, setOrderQuantity] = useState("")
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy")

  // Mock execution algorithms
  useEffect(() => {
    const mockAlgorithms: ExecutionAlgorithm[] = [
      {
        id: "twap",
        name: "AI-Enhanced TWAP",
        description: "Time-weighted average price with ML optimization",
        performance: 94.2,
        active: true,
        trades: 1247,
        fillRate: 98.7,
        slippage: -0.02,
      },
      {
        id: "vwap",
        name: "Smart VWAP",
        description: "Volume-weighted with predictive volume modeling",
        performance: 91.8,
        active: true,
        trades: 892,
        fillRate: 97.3,
        slippage: 0.01,
      },
      {
        id: "implementation",
        name: "Implementation Shortfall",
        description: "Minimizes market impact with dynamic participation",
        performance: 89.5,
        active: false,
        trades: 634,
        fillRate: 96.1,
        slippage: -0.03,
      },
      {
        id: "liquidity",
        name: "Liquidity Seeking",
        description: "AI-powered dark pool and venue selection",
        performance: 96.1,
        active: true,
        trades: 445,
        fillRate: 99.2,
        slippage: -0.05,
      },
    ]

    const mockOrders: SmartOrder[] = [
      {
        id: "1",
        symbol: "AAPL",
        side: "buy",
        quantity: 10000,
        algorithm: "AI-Enhanced TWAP",
        status: "working",
        fillPercent: 67,
        avgPrice: 178.45,
        slippage: -0.02,
        timeInForce: "2h 15m",
      },
      {
        id: "2",
        symbol: "MSFT",
        side: "sell",
        quantity: 5000,
        algorithm: "Smart VWAP",
        status: "filled",
        fillPercent: 100,
        avgPrice: 412.67,
        slippage: 0.01,
        timeInForce: "Completed",
      },
      {
        id: "3",
        symbol: "GOOGL",
        side: "buy",
        quantity: 2500,
        algorithm: "Liquidity Seeking",
        status: "working",
        fillPercent: 23,
        avgPrice: 142.89,
        slippage: -0.04,
        timeInForce: "45m",
      },
    ]

    setAlgorithms(mockAlgorithms)
    setSmartOrders(mockOrders)
  }, [])

  const toggleAlgorithm = (id: string) => {
    setAlgorithms((prev) => prev.map((algo) => (algo.id === id ? { ...algo, active: !algo.active } : algo)))
  }

  const submitSmartOrder = () => {
    if (!orderSymbol || !orderQuantity) return

    const newOrder: SmartOrder = {
      id: Date.now().toString(),
      symbol: orderSymbol.toUpperCase(),
      side: orderSide,
      quantity: Number.parseInt(orderQuantity),
      algorithm: algorithms.find((a) => a.id === selectedAlgorithm)?.name || "AI-Enhanced TWAP",
      status: "pending",
      fillPercent: 0,
      avgPrice: 0,
      slippage: 0,
      timeInForce: "Pending",
    }

    setSmartOrders((prev) => [newOrder, ...prev])
    setOrderSymbol("")
    setOrderQuantity("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filled":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "working":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  // Mock execution performance data
  const performanceData = [
    { time: "09:30", slippage: -0.02, fillRate: 98.5 },
    { time: "10:00", slippage: -0.01, fillRate: 97.8 },
    { time: "10:30", slippage: -0.03, fillRate: 99.1 },
    { time: "11:00", slippage: 0.01, fillRate: 96.7 },
    { time: "11:30", slippage: -0.02, fillRate: 98.9 },
    { time: "12:00", slippage: -0.04, fillRate: 99.3 },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Intelligent Execution</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">4 Algorithms Active</Badge>
        </div>
      </div>

      {/* Smart Order Entry */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Smart Order Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Symbol</label>
              <Input
                value={orderSymbol}
                onChange={(e) => setOrderSymbol(e.target.value)}
                placeholder="AAPL"
                className="bg-[#15151f] border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Side</label>
              <Select value={orderSide} onValueChange={(value: "buy" | "sell") => setOrderSide(value)}>
                <SelectTrigger className="bg-[#15151f] border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Quantity</label>
              <Input
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                placeholder="1000"
                type="number"
                className="bg-[#15151f] border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Algorithm</label>
              <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                <SelectTrigger className="bg-[#15151f] border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {algorithms
                    .filter((a) => a.active)
                    .map((algo) => (
                      <SelectItem key={algo.id} value={algo.id}>
                        {algo.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={submitSmartOrder} className="w-full bg-blue-600 hover:bg-blue-700">
                Submit Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Algorithms */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-400" />
            Execution Algorithms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {algorithms.map((algo) => (
              <div key={algo.id} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{algo.name}</h4>
                    <p className="text-sm text-gray-400">{algo.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={algo.active ? "default" : "outline"}
                    onClick={() => toggleAlgorithm(algo.id)}
                    className={algo.active ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {algo.active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Performance</span>
                    <div className="text-green-400 font-semibold">{algo.performance}%</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Fill Rate</span>
                    <div className="text-white">{algo.fillRate}%</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg Slippage</span>
                    <div className={algo.slippage < 0 ? "text-green-400" : "text-red-400"}>
                      {algo.slippage > 0 ? "+" : ""}
                      {algo.slippage}bps
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Execution Algorithms */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Advanced Execution Algorithms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Machine Learning Algorithms</h4>
              {[
                { name: "Reinforcement Learning TWAP", performance: 96.8, trades: 2341, slippage: -0.08 },
                { name: "Deep Q-Network Execution", performance: 94.2, trades: 1876, slippage: -0.06 },
                { name: "Genetic Algorithm Optimizer", performance: 92.1, trades: 1523, slippage: -0.04 },
                { name: "Neural Network Router", performance: 95.3, trades: 2087, slippage: -0.07 },
              ].map((algo, index) => (
                <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-white">{algo.name}</h5>
                    <Badge className="bg-purple-500/20 text-purple-400">ML-Powered</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Performance</span>
                      <div className="text-green-400 font-semibold">{algo.performance}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Trades</span>
                      <div className="text-white">{algo.trades.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Slippage</span>
                      <div className="text-green-400">{algo.slippage}bps</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Market Impact Models</h4>
              {[
                { model: "Almgren-Chriss", accuracy: 89.4, calibration: "Daily", lastUpdate: "2h ago" },
                { model: "Linear Impact", accuracy: 76.2, calibration: "Intraday", lastUpdate: "30m ago" },
                { model: "Square-Root Law", accuracy: 82.7, calibration: "Real-time", lastUpdate: "5m ago" },
                { model: "ML Impact Predictor", accuracy: 94.1, calibration: "Adaptive", lastUpdate: "1m ago" },
              ].map((model, index) => (
                <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-white">{model.model}</h5>
                    <Badge className="bg-blue-500/20 text-blue-400">{model.accuracy}% accurate</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Calibration</span>
                      <div className="text-white">{model.calibration}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Update</span>
                      <div className="text-gray-300">{model.lastUpdate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Smart Orders */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-400" />
            Active Smart Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {smartOrders.map((order) => (
              <div key={order.id} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-white">{order.symbol}</h4>
                    <Badge
                      className={order.side === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                    >
                      {order.side.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Time Remaining</div>
                    <div className="text-white font-mono">{order.timeInForce}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Quantity</span>
                    <div className="text-white font-mono">{order.quantity.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Algorithm</span>
                    <div className="text-white">{order.algorithm}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Fill %</span>
                    <div className="text-white">{order.fillPercent}%</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg Price</span>
                    <div className="text-white font-mono">${order.avgPrice}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Slippage</span>
                    <div className={order.slippage < 0 ? "text-green-400" : "text-red-400"}>
                      {order.slippage > 0 ? "+" : ""}
                      {order.slippage}bps
                    </div>
                  </div>
                </div>
                {order.status === "working" && (
                  <div className="mt-3">
                    <Progress value={order.fillPercent} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Performance */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Execution Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="fillRate" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dark Pool Intelligence */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            Dark Pool Intelligence & Venue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-white font-medium">Dark Pool Activity</h4>
              {[
                { venue: "Goldman Sachs Sigma X", volume: 2.4, fillRate: 94.2, avgSize: 1250 },
                { venue: "Morgan Stanley MS Pool", volume: 1.8, fillRate: 91.7, avgSize: 980 },
                { venue: "Credit Suisse CrossFinder", volume: 1.6, fillRate: 89.3, avgSize: 1100 },
                { venue: "UBS ATS", volume: 1.2, fillRate: 87.8, avgSize: 850 },
              ].map((pool, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-white mb-2">{pool.venue}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Volume</span>
                      <div className="text-blue-400">{pool.volume}B</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Fill Rate</span>
                      <div className="text-green-400">{pool.fillRate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Size</span>
                      <div className="text-white">{pool.avgSize}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-medium">Venue Performance</h4>
              {[
                { venue: "NYSE", latency: 0.12, fillRate: 98.7, cost: 0.8 },
                { venue: "NASDAQ", latency: 0.08, fillRate: 97.9, cost: 0.9 },
                { venue: "BATS", latency: 0.15, fillRate: 96.4, cost: 0.6 },
                { venue: "IEX", latency: 0.35, fillRate: 94.2, cost: 0.3 },
              ].map((venue, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-white mb-2">{venue.venue}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Latency</span>
                      <div className="text-yellow-400">{venue.latency}ms</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Fill Rate</span>
                      <div className="text-green-400">{venue.fillRate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Cost</span>
                      <div className="text-blue-400">{venue.cost}bps</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-medium">Smart Routing Metrics</h4>
              {[
                { metric: "Price Improvement", value: "2.3bps", trend: "up" },
                { metric: "Fill Rate", value: "97.8%", trend: "up" },
                { metric: "Market Impact", value: "-0.8bps", trend: "down" },
                { metric: "Execution Speed", value: "0.15ms", trend: "down" },
                { metric: "Venue Diversity", value: "8.2", trend: "up" },
                { metric: "Hidden Liquidity", value: "34.7%", trend: "up" },
              ].map((metric, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">{metric.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-400">{metric.value}</span>
                      <div
                        className={`w-2 h-2 rounded-full ${metric.trend === "up" ? "bg-green-400" : "bg-red-400"}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
