"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Zap,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Calculator,
  Eye,
  Layers
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
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  Surface,
  ReferenceLine
} from "recharts"

interface OptionChain {
  strike: number
  callBid: number
  callAsk: number
  callVolume: number
  callOI: number
  callIV: number
  putBid: number
  putAsk: number
  putVolume: number
  putOI: number
  putIV: number
  callDelta: number
  callGamma: number
  callTheta: number
  callVega: number
  putDelta: number
  putGamma: number
  putTheta: number
  putVega: number
}

interface VolatilitySurfacePoint {
  strike: number
  expiry: number
  iv: number
  moneyness: number
  dte: number
}

interface OptionsFlow {
  timestamp: string
  symbol: string
  type: "call" | "put"
  strike: number
  expiry: string
  volume: number
  premium: number
  side: "buy" | "sell"
  unusual: boolean
}

interface GreeksPortfolio {
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
}

export function OptionsAnalytics() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [selectedExpiry, setSelectedExpiry] = useState("2024-02-16")
  const [optionChain, setOptionChain] = useState<OptionChain[]>([])
  const [volatilitySurface, setVolatilitySurface] = useState<VolatilitySurfacePoint[]>([])
  const [optionsFlow, setOptionsFlow] = useState<OptionsFlow[]>([])
  const [portfolioGreeks, setPortfolioGreeks] = useState<GreeksPortfolio | null>(null)

  // Available symbols and expiries
  const [symbols] = useState(["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "SPY", "QQQ", "IWM"])
  const [expiries] = useState([
    "2024-01-19", "2024-01-26", "2024-02-02", "2024-02-09", 
    "2024-02-16", "2024-03-15", "2024-04-19", "2024-06-21"
  ])

  // Mock data initialization
  useEffect(() => {
    // Generate mock option chain
    const mockChain: OptionChain[] = []
    const currentPrice = 189.50
    
    for (let i = -10; i <= 10; i++) {
      const strike = currentPrice + (i * 5)
      const moneyness = strike / currentPrice
      const baseIV = 0.25 + Math.abs(i) * 0.01 + (Math.random() - 0.5) * 0.05
      
      mockChain.push({
        strike,
        callBid: Math.max(0.01, currentPrice - strike + (Math.random() - 0.5) * 2),
        callAsk: Math.max(0.02, currentPrice - strike + 0.5 + (Math.random() - 0.5) * 2),
        callVolume: Math.floor(Math.random() * 1000),
        callOI: Math.floor(Math.random() * 5000),
        callIV: Math.max(0.1, baseIV),
        putBid: Math.max(0.01, strike - currentPrice + (Math.random() - 0.5) * 2),
        putAsk: Math.max(0.02, strike - currentPrice + 0.5 + (Math.random() - 0.5) * 2),
        putVolume: Math.floor(Math.random() * 800),
        putOI: Math.floor(Math.random() * 4000),
        putIV: Math.max(0.1, baseIV + 0.02),
        callDelta: Math.max(0, Math.min(1, 0.5 + (currentPrice - strike) * 0.02)),
        callGamma: Math.exp(-Math.pow((currentPrice - strike) / 20, 2)) * 0.01,
        callTheta: -0.05 - Math.random() * 0.1,
        callVega: 0.1 + Math.random() * 0.2,
        putDelta: Math.min(0, Math.max(-1, -0.5 + (currentPrice - strike) * 0.02)),
        putGamma: Math.exp(-Math.pow((currentPrice - strike) / 20, 2)) * 0.01,
        putTheta: -0.05 - Math.random() * 0.1,
        putVega: 0.1 + Math.random() * 0.2
      })
    }

    // Generate mock volatility surface
    const mockSurface: VolatilitySurfacePoint[] = []
    const dteDays = [7, 14, 30, 60, 90, 180, 365]
    
    dteDays.forEach(dte => {
      for (let moneyness = 0.8; moneyness <= 1.2; moneyness += 0.05) {
        const strike = currentPrice * moneyness
        const baseIV = 0.20 + Math.abs(moneyness - 1) * 0.3 + (dte / 365) * 0.1
        const iv = baseIV + (Math.random() - 0.5) * 0.05
        
        mockSurface.push({
          strike,
          expiry: dte,
          iv: Math.max(0.05, iv),
          moneyness,
          dte
        })
      }
    })

    // Generate mock options flow
    const mockFlow: OptionsFlow[] = []
    const now = new Date()
    
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now.getTime() - i * 60000).toISOString()
      const type = Math.random() > 0.5 ? "call" : "put"
      const strike = currentPrice + (Math.random() - 0.5) * 40
      const volume = Math.floor(Math.random() * 2000) + 100
      const premium = Math.random() * 10 + 0.5
      const unusual = volume > 1000 && premium > 5
      
      mockFlow.push({
        timestamp,
        symbol: selectedSymbol,
        type,
        strike,
        expiry: expiries[Math.floor(Math.random() * expiries.length)],
        volume,
        premium,
        side: Math.random() > 0.5 ? "buy" : "sell",
        unusual
      })
    }

    const mockGreeks: GreeksPortfolio = {
      delta: 125.67,
      gamma: 45.23,
      theta: -234.89,
      vega: 1567.34,
      rho: 89.12
    }

    setOptionChain(mockChain)
    setVolatilitySurface(mockSurface)
    setOptionsFlow(mockFlow)
    setPortfolioGreeks(mockGreeks)
  }, [selectedSymbol, selectedExpiry])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getVolumeColor = (volume: number) => {
    if (volume > 500) return "text-green-400"
    if (volume > 200) return "text-yellow-400"
    return "text-gray-400"
  }

  const getUnusualActivityColor = (unusual: boolean) => {
    return unusual ? "text-red-400 border-red-500/30" : "text-gray-400 border-gray-500/30"
  }

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Target className="h-8 w-8 text-[#00bbff]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Options Analytics</h1>
              <p className="text-sm text-[#a0a0b8]">Advanced options trading and analysis platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-32 bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                {symbols.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
              <SelectTrigger className="w-40 bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                {expiries.map(expiry => (
                  <SelectItem key={expiry} value={expiry}>{expiry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => {
                console.log('Refresh Data clicked')
                alert('Refreshing options data from all exchanges...')
              }}
              className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="chain" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#1a1a2e]">
            <TabsTrigger value="chain" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Option Chain
            </TabsTrigger>
            <TabsTrigger value="volatility" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Volatility Surface
            </TabsTrigger>
            <TabsTrigger value="greeks" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Greeks Analysis
            </TabsTrigger>
            <TabsTrigger value="flow" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Options Flow
            </TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Strategies
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Portfolio
            </TabsTrigger>
          </TabsList>

          {/* Option Chain Tab */}
          <TabsContent value="chain" className="space-y-6">
            {/* Current Price & Market Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Current Price</p>
                      <p className="text-2xl font-bold text-white">$189.50</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="text-sm text-green-400 mt-1">+$2.45 (1.31%)</div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Implied Volatility</p>
                      <p className="text-2xl font-bold text-[#00bbff]">24.8%</p>
                    </div>
                    <Activity className="h-8 w-8 text-[#00bbff]" />
                  </div>
                  <div className="text-sm text-yellow-400 mt-1">+0.8% vs yesterday</div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Put/Call Ratio</p>
                      <p className="text-2xl font-bold text-white">0.87</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Neutral sentiment</div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Days to Expiry</p>
                      <p className="text-2xl font-bold text-white">32</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{selectedExpiry}</div>
                </CardContent>
              </Card>
            </div>

            {/* Option Chain Table */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Option Chain - {selectedSymbol} {selectedExpiry}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2a2a3e]">
                        <th className="text-left p-2 text-gray-400">Strike</th>
                        <th className="text-center p-2 text-green-400">Call Bid</th>
                        <th className="text-center p-2 text-green-400">Call Ask</th>
                        <th className="text-center p-2 text-green-400">Call Vol</th>
                        <th className="text-center p-2 text-green-400">Call OI</th>
                        <th className="text-center p-2 text-green-400">Call IV</th>
                        <th className="text-center p-2 text-red-400">Put IV</th>
                        <th className="text-center p-2 text-red-400">Put OI</th>
                        <th className="text-center p-2 text-red-400">Put Vol</th>
                        <th className="text-center p-2 text-red-400">Put Ask</th>
                        <th className="text-center p-2 text-red-400">Put Bid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionChain.slice(5, 16).map((option, i) => {
                        const isATM = Math.abs(option.strike - 189.50) < 2.5
                        return (
                          <tr key={i} className={`border-b border-[#2a2a3e] hover:bg-[#15151f] ${isATM ? 'bg-[#00bbff]/10' : ''}`}>
                            <td className="p-2 font-mono text-white font-semibold">{option.strike.toFixed(0)}</td>
                            <td className="p-2 text-center font-mono text-green-400">{option.callBid.toFixed(2)}</td>
                            <td className="p-2 text-center font-mono text-green-400">{option.callAsk.toFixed(2)}</td>
                            <td className={`p-2 text-center font-mono ${getVolumeColor(option.callVolume)}`}>
                              {option.callVolume.toLocaleString()}
                            </td>
                            <td className="p-2 text-center font-mono text-gray-300">{option.callOI.toLocaleString()}</td>
                            <td className="p-2 text-center font-mono text-green-400">{formatPercent(option.callIV)}</td>
                            <td className="p-2 text-center font-mono text-red-400">{formatPercent(option.putIV)}</td>
                            <td className="p-2 text-center font-mono text-gray-300">{option.putOI.toLocaleString()}</td>
                            <td className={`p-2 text-center font-mono ${getVolumeColor(option.putVolume)}`}>
                              {option.putVolume.toLocaleString()}
                            </td>
                            <td className="p-2 text-center font-mono text-red-400">{option.putAsk.toFixed(2)}</td>
                            <td className="p-2 text-center font-mono text-red-400">{option.putBid.toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Volume & Open Interest Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Volume Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={optionChain.slice(5, 16)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="strike" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="callVolume" fill="#4ade80" name="Call Volume" />
                      <Bar dataKey="putVolume" fill="#f87171" name="Put Volume" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Open Interest</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={optionChain.slice(5, 16)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="strike" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="callOI" stackId="1" stroke="#4ade80" fill="#4ade80" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="putOI" stackId="1" stroke="#f87171" fill="#f87171" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Volatility Surface Tab */}
          <TabsContent value="volatility" className="space-y-6">
            {/* Volatility Smile */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Volatility Smile - {selectedExpiry}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={volatilitySurface.filter(p => p.dte === 32)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="moneyness" stroke="#888" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <YAxis stroke="#888" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Implied Volatility"]}
                    />
                    <Line type="monotone" dataKey="iv" stroke="#00bbff" strokeWidth={3} dot={{ fill: "#00bbff", strokeWidth: 2, r: 4 }} />
                    <ReferenceLine x={1} stroke="#888" strokeDasharray="2 2" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Term Structure */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Volatility Term Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { dte: 7, iv: 0.28 }, { dte: 14, iv: 0.26 }, { dte: 30, iv: 0.25 },
                    { dte: 60, iv: 0.24 }, { dte: 90, iv: 0.23 }, { dte: 180, iv: 0.22 }, { dte: 365, iv: 0.21 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="dte" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Implied Volatility"]}
                    />
                    <Line type="monotone" dataKey="iv" stroke="#fbbf24" strokeWidth={3} dot={{ fill: "#fbbf24", strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Volatility Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">ATM IV</div>
                  <div className="text-xl font-mono text-[#00bbff]">24.8%</div>
                  <div className="text-xs text-green-400">+0.8%</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">IV Rank</div>
                  <div className="text-xl font-mono text-yellow-400">67%</div>
                  <div className="text-xs text-gray-400">52-week</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">HV (20d)</div>
                  <div className="text-xl font-mono text-white">22.1%</div>
                  <div className="text-xs text-red-400">-2.7%</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">IV/HV Ratio</div>
                  <div className="text-xl font-mono text-purple-400">1.12</div>
                  <div className="text-xs text-gray-400">Premium</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Greeks Analysis Tab */}
          <TabsContent value="greeks" className="space-y-6">
            {/* Greeks Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Delta Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={optionChain.slice(5, 16)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="strike" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="callDelta" stroke="#4ade80" strokeWidth={2} name="Call Delta" />
                      <Line type="monotone" dataKey="putDelta" stroke="#f87171" strokeWidth={2} name="Put Delta" />
                      <ReferenceLine y={0} stroke="#888" strokeDasharray="2 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Gamma Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={optionChain.slice(5, 16)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="strike" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="callGamma" stroke="#00bbff" fill="#00bbff" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Theta Decay</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={optionChain.slice(5, 16)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="strike" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="callTheta" fill="#f87171" name="Call Theta" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Vega Exposure</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={optionChain.slice(5, 16)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="strike" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="callVega" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Greeks Summary */}
            {portfolioGreeks && (
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Portfolio Greeks Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                      <div className="text-sm text-gray-400">Delta</div>
                      <div className={`text-xl font-mono ${portfolioGreeks.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {portfolioGreeks.delta > 0 ? '+' : ''}{portfolioGreeks.delta.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">Directional Risk</div>
                    </div>
                    <div className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                      <div className="text-sm text-gray-400">Gamma</div>
                      <div className="text-xl font-mono text-[#00bbff]">{portfolioGreeks.gamma.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Delta Sensitivity</div>
                    </div>
                    <div className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                      <div className="text-sm text-gray-400">Theta</div>
                      <div className="text-xl font-mono text-red-400">{portfolioGreeks.theta.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Time Decay</div>
                    </div>
                    <div className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                      <div className="text-sm text-gray-400">Vega</div>
                      <div className="text-xl font-mono text-purple-400">{portfolioGreeks.vega.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Vol Sensitivity</div>
                    </div>
                    <div className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                      <div className="text-sm text-gray-400">Rho</div>
                      <div className="text-xl font-mono text-yellow-400">{portfolioGreeks.rho.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Rate Sensitivity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Options Flow Tab */}
          <TabsContent value="flow" className="space-y-6">
            {/* Flow Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">Total Volume</div>
                  <div className="text-xl font-mono text-white">2.4M</div>
                  <div className="text-xs text-green-400">+15% vs avg</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">Call/Put Ratio</div>
                  <div className="text-xl font-mono text-[#00bbff]">1.34</div>
                  <div className="text-xs text-green-400">Bullish</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">Unusual Activity</div>
                  <div className="text-xl font-mono text-red-400">47</div>
                  <div className="text-xs text-gray-400">Alerts</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">Premium Flow</div>
                  <div className="text-xl font-mono text-green-400">$45.2M</div>
                  <div className="text-xs text-green-400">Net Buying</div>
                </CardContent>
              </Card>
            </div>

            {/* Options Flow Table */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Live Options Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {optionsFlow.slice(0, 20).map((flow, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${flow.unusual ? 'bg-red-500/10 border-red-500/30' : 'bg-[#15151f] border-[#2a2a3e]'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="font-mono text-white">{flow.symbol}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className={`font-semibold ${flow.type === 'call' ? 'text-green-400' : 'text-red-400'}`}>
                              {flow.type.toUpperCase()}
                            </span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-white">${flow.strike}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-400">{flow.expiry}</span>
                          </div>
                          {flow.unusual && (
                            <Badge variant="outline" className="text-red-400 border-red-500/30">
                              Unusual
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-right">
                            <div className={`font-mono ${flow.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                              {flow.side.toUpperCase()} {flow.volume.toLocaleString()}
                            </div>
                            <div className="text-gray-400">{formatCurrency(flow.premium)}</div>
                          </div>
                          <div className="text-gray-400 text-xs">
                            {new Date(flow.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            {/* Strategy Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Long Straddle",
                  description: "Buy call and put at same strike",
                  outlook: "High Volatility",
                  maxProfit: "Unlimited",
                  maxLoss: "Premium Paid",
                  breakeven: "2 Points"
                },
                {
                  name: "Iron Condor",
                  description: "Sell call/put spread combination",
                  outlook: "Low Volatility",
                  maxProfit: "Net Credit",
                  maxLoss: "Strike Width - Credit",
                  breakeven: "4 Points"
                },
                {
                  name: "Butterfly Spread",
                  description: "Buy 1, sell 2, buy 1 at different strikes",
                  outlook: "Neutral",
                  maxProfit: "Strike Width - Debit",
                  maxLoss: "Net Debit",
                  breakeven: "2 Points"
                },
                {
                  name: "Covered Call",
                  description: "Own stock + sell call option",
                  outlook: "Neutral to Bullish",
                  maxProfit: "Strike - Stock Price + Premium",
                  maxLoss: "Stock Price - Premium",
                  breakeven: "1 Point"
                },
                {
                  name: "Protective Put",
                  description: "Own stock + buy put option",
                  outlook: "Bullish with Protection",
                  maxProfit: "Unlimited",
                  maxLoss: "Stock Price - Strike + Premium",
                  breakeven: "1 Point"
                },
                {
                  name: "Calendar Spread",
                  description: "Sell near-term, buy far-term option",
                  outlook: "Time Decay",
                  maxProfit: "Variable",
                  maxLoss: "Net Debit",
                  breakeven: "Variable"
                }
              ].map((strategy, i) => (
                <Card key={i} className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{strategy.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a0a0b8] mb-4">{strategy.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Outlook:</span>
                        <span className="text-[#00bbff]">{strategy.outlook}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Max Profit:</span>
                        <span className="text-green-400">{strategy.maxProfit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Max Loss:</span>
                        <span className="text-red-400">{strategy.maxLoss}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Breakeven:</span>
                        <span className="text-white">{strategy.breakeven}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log(`Build Strategy clicked for ${strategy.name}`)
                        alert(`Building ${strategy.name} options strategy...`)
                      }}
                      className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                    >
                      Build Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Strategy P&L Chart */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Strategy P&L Profile - Long Straddle</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { price: 170, pnl: -5.5 }, { price: 175, pnl: -0.5 }, { price: 180, pnl: 4.5 },
                    { price: 185, pnl: 9.5 }, { price: 190, pnl: 14.5 }, { price: 195, pnl: 9.5 },
                    { price: 200, pnl: 4.5 }, { price: 205, pnl: -0.5 }, { price: 210, pnl: -5.5 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="price" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="pnl" stroke="#00bbff" strokeWidth={3} />
                    <ReferenceLine y={0} stroke="#888" strokeDasharray="2 2" />
                    <ReferenceLine x={189.5} stroke="#fbbf24" strokeDasharray="2 2" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">Total Positions</div>
                  <div className="text-xl font-mono text-white">23</div>
                  <div className="text-xs text-gray-400">Active Contracts</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">Portfolio Value</div>
                  <div className="text-xl font-mono text-white">$45,670</div>
                  <div className="text-xs text-green-400">+$2,340 (5.4%)</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">Daily P&L</div>
                  <div className="text-xl font-mono text-green-400">+$1,245</div>
                  <div className="text-xs text-green-400">+2.8%</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400">Buying Power</div>
                  <div className="text-xl font-mono text-[#00bbff]">$125,000</div>
                  <div className="text-xs text-gray-400">Available</div>
                </CardContent>
              </Card>
            </div>

            {/* Positions Table */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Current Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2a2a3e]">
                        <th className="text-left p-2 text-gray-400">Symbol</th>
                        <th className="text-left p-2 text-gray-400">Strategy</th>
                        <th className="text-center p-2 text-gray-400">Quantity</th>
                        <th className="text-center p-2 text-gray-400">Entry Price</th>
                        <th className="text-center p-2 text-gray-400">Current Price</th>
                        <th className="text-center p-2 text-gray-400">P&L</th>
                        <th className="text-center p-2 text-gray-400">Delta</th>
                        <th className="text-center p-2 text-gray-400">Theta</th>
                        <th className="text-center p-2 text-gray-400">DTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { symbol: "AAPL", strategy: "Long Call", qty: 5, entry: 3.45, current: 4.20, pnl: 375, delta: 2.35, theta: -12.5, dte: 32 },
                        { symbol: "MSFT", strategy: "Iron Condor", qty: -2, entry: 1.20, current: 0.85, pnl: 70, delta: -0.15, theta: 8.5, dte: 18 },
                        { symbol: "TSLA", strategy: "Straddle", qty: 3, entry: 8.90, current: 12.40, pnl: 1050, delta: 0.45, theta: -18.7, dte: 25 },
                        { symbol: "SPY", strategy: "Covered Call", qty: -10, entry: 2.10, current: 1.65, pnl: 450, delta: -3.20, theta: 15.2, dte: 11 }
                      ].map((position, i) => (
                        <tr key={i} className="border-b border-[#2a2a3e] hover:bg-[#15151f]">
                          <td className="p-2 font-mono text-white font-semibold">{position.symbol}</td>
                          <td className="p-2 text-[#00bbff]">{position.strategy}</td>
                          <td className="p-2 text-center font-mono text-white">{position.qty}</td>
                          <td className="p-2 text-center font-mono text-gray-300">{formatCurrency(position.entry)}</td>
                          <td className="p-2 text-center font-mono text-white">{formatCurrency(position.current)}</td>
                          <td className={`p-2 text-center font-mono ${position.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.pnl > 0 ? '+' : ''}{formatCurrency(position.pnl)}
                          </td>
                          <td className={`p-2 text-center font-mono ${position.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.delta > 0 ? '+' : ''}{position.delta.toFixed(2)}
                          </td>
                          <td className={`p-2 text-center font-mono ${position.theta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.theta > 0 ? '+' : ''}{position.theta.toFixed(1)}
                          </td>
                          <td className="p-2 text-center font-mono text-gray-300">{position.dte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Performance Chart */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { date: '2024-01-01', value: 40000 }, { date: '2024-01-05', value: 41200 },
                    { date: '2024-01-10', value: 39800 }, { date: '2024-01-15', value: 45670 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Portfolio Value"]}
                    />
                    <Line type="monotone" dataKey="value" stroke="#00bbff" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
