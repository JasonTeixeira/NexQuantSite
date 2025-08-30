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
  Brain,
  Eye,
  Layers,
  Shuffle,
  RotateCcw
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
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface MarketRegime {
  id: string
  name: string
  description: string
  probability: number
  duration: number
  characteristics: string[]
  color: string
  isActive: boolean
}

interface RegimeHistory {
  date: string
  regime: string
  probability: number
  returns: number
  volatility: number
  correlation: number
}

interface RegimeIndicator {
  name: string
  value: number
  signal: "bullish" | "bearish" | "neutral"
  weight: number
  contribution: number
}

interface RegimeTransition {
  from: string
  to: string
  probability: number
  expectedDuration: number
  triggerConditions: string[]
}

export function RegimeDetection() {
  const [currentRegime, setCurrentRegime] = useState<MarketRegime | null>(null)
  const [regimes, setRegimes] = useState<MarketRegime[]>([])
  const [regimeHistory, setRegimeHistory] = useState<RegimeHistory[]>([])
  const [indicators, setIndicators] = useState<RegimeIndicator[]>([])
  const [transitions, setTransitions] = useState<RegimeTransition[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState("1Y")

  // Mock data initialization
  useEffect(() => {
    const mockRegimes: MarketRegime[] = [
      {
        id: "bull_trend",
        name: "Bull Trend",
        description: "Strong upward momentum with low volatility",
        probability: 0.15,
        duration: 45,
        characteristics: ["Rising prices", "Low volatility", "High correlation", "Strong momentum"],
        color: "#4ade80",
        isActive: false
      },
      {
        id: "bear_trend", 
        name: "Bear Trend",
        description: "Sustained downward pressure with increasing volatility",
        probability: 0.08,
        duration: 32,
        characteristics: ["Falling prices", "High volatility", "Flight to quality", "Negative sentiment"],
        color: "#f87171",
        isActive: false
      },
      {
        id: "sideways",
        name: "Sideways/Consolidation",
        description: "Range-bound market with moderate volatility",
        probability: 0.45,
        duration: 78,
        characteristics: ["Range-bound", "Mean reversion", "Moderate volatility", "Mixed signals"],
        color: "#fbbf24",
        isActive: true
      },
      {
        id: "high_vol",
        name: "High Volatility",
        description: "Elevated volatility with uncertain direction",
        probability: 0.22,
        duration: 18,
        characteristics: ["High volatility", "Whipsaw moves", "Low correlation", "Uncertainty"],
        color: "#a78bfa",
        isActive: false
      },
      {
        id: "crisis",
        name: "Crisis/Stress",
        description: "Market stress with extreme volatility and correlations",
        probability: 0.10,
        duration: 12,
        characteristics: ["Extreme volatility", "High correlation", "Flight to safety", "Liquidity issues"],
        color: "#ef4444",
        isActive: false
      }
    ]

    const mockHistory: RegimeHistory[] = []
    const regimeNames = ["Bull Trend", "Sideways", "High Volatility", "Bear Trend", "Crisis"]
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 2)

    for (let i = 0; i < 500; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      
      let regime = "Sideways"
      let probability = 0.6 + Math.random() * 0.3
      
      // Add some regime changes
      if (i < 100) regime = "Bull Trend"
      else if (i < 150) regime = "High Volatility"
      else if (i < 200) regime = "Bear Trend"
      else if (i < 250) regime = "Crisis"
      else if (i < 350) regime = "Sideways"
      else regime = "Bull Trend"

      mockHistory.push({
        date: date.toISOString().split('T')[0],
        regime,
        probability,
        returns: (Math.random() - 0.5) * 0.04,
        volatility: 0.1 + Math.random() * 0.3,
        correlation: 0.3 + Math.random() * 0.6
      })
    }

    const mockIndicators: RegimeIndicator[] = [
      { name: "VIX Level", value: 18.5, signal: "neutral", weight: 0.20, contribution: 0.15 },
      { name: "Term Structure", value: 0.85, signal: "bullish", weight: 0.15, contribution: 0.12 },
      { name: "Credit Spreads", value: 125, signal: "neutral", weight: 0.18, contribution: 0.14 },
      { name: "Momentum", value: 0.65, signal: "bullish", weight: 0.12, contribution: 0.08 },
      { name: "Mean Reversion", value: -0.35, signal: "bearish", weight: 0.10, contribution: -0.04 },
      { name: "Cross-Asset Correlation", value: 0.72, signal: "neutral", weight: 0.15, contribution: 0.11 },
      { name: "Liquidity Conditions", value: 0.88, signal: "bullish", weight: 0.10, contribution: 0.09 }
    ]

    const mockTransitions: RegimeTransition[] = [
      {
        from: "Sideways",
        to: "Bull Trend",
        probability: 0.25,
        expectedDuration: 15,
        triggerConditions: ["VIX < 15", "Momentum > 0.7", "Credit spreads tightening"]
      },
      {
        from: "Sideways", 
        to: "High Volatility",
        probability: 0.35,
        expectedDuration: 8,
        triggerConditions: ["VIX > 25", "Correlation spike", "News events"]
      },
      {
        from: "High Volatility",
        to: "Bear Trend",
        probability: 0.40,
        expectedDuration: 12,
        triggerConditions: ["Sustained selling", "Credit stress", "Momentum breakdown"]
      },
      {
        from: "Bull Trend",
        to: "Sideways",
        probability: 0.30,
        expectedDuration: 20,
        triggerConditions: ["Momentum fade", "Valuation concerns", "Policy uncertainty"]
      }
    ]

    setRegimes(mockRegimes)
    setCurrentRegime(mockRegimes.find(r => r.isActive) || mockRegimes[2])
    setRegimeHistory(mockHistory)
    setIndicators(mockIndicators)
    setTransitions(mockTransitions)
  }, [])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "bullish": return "text-green-400"
      case "bearish": return "text-red-400"
      case "neutral": return "text-yellow-400"
      default: return "text-gray-400"
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "bullish": return <TrendingUp className="h-4 w-4" />
      case "bearish": return <TrendingDown className="h-4 w-4" />
      case "neutral": return <Activity className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const COLORS = ['#4ade80', '#f87171', '#fbbf24', '#a78bfa', '#ef4444']

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Eye className="h-8 w-8 text-[#00bbff]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Market Regime Detection</h1>
              <p className="text-sm text-[#a0a0b8]">AI-powered market regime identification and adaptation</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32 bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
                <SelectItem value="2Y">2 Years</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => {
                console.log('Recalibrate Model clicked')
                alert('Recalibrating regime detection model with latest market data...')
              }}
              className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
            >
              <Brain className="h-4 w-4 mr-2" />
              Recalibrate Model
            </Button>
          </div>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#1a1a2e]">
            <TabsTrigger value="current" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Current Regime
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Regime History
            </TabsTrigger>
            <TabsTrigger value="indicators" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Indicators
            </TabsTrigger>
            <TabsTrigger value="transitions" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Transitions
            </TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Strategies
            </TabsTrigger>
            <TabsTrigger value="model" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Model Config
            </TabsTrigger>
          </TabsList>

          {/* Current Regime Tab */}
          <TabsContent value="current" className="space-y-6">
            {/* Current Regime Status */}
            {currentRegime && (
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3`} style={{ backgroundColor: currentRegime.color }}></div>
                    Current Market Regime: {currentRegime.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <p className="text-[#a0a0b8] mb-4">{currentRegime.description}</p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Confidence Level</span>
                            <span className="text-white">{formatPercent(currentRegime.probability)}</span>
                          </div>
                          <Progress value={currentRegime.probability * 100} className="h-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration (days):</span>
                          <span className="text-white">{currentRegime.duration}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-white mb-2">Key Characteristics:</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentRegime.characteristics.map((char, i) => (
                            <Badge key={i} variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Regime Probabilities</h4>
                      <div className="space-y-2">
                        {regimes.map((regime, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: regime.color }}></div>
                              <span className="text-sm text-white">{regime.name}</span>
                            </div>
                            <span className="text-sm font-mono text-[#00bbff]">{formatPercent(regime.probability)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regime Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Regime Probability Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={regimes.map(r => ({ name: r.name, value: r.probability, color: r.color }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {regimes.map((regime, index) => (
                          <Cell key={`cell-${index}`} fill={regime.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Market Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Volatility Regime</div>
                        <div className="text-xl font-mono text-yellow-400">Moderate</div>
                        <div className="text-xs text-gray-400">18.5% VIX</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Trend Strength</div>
                        <div className="text-xl font-mono text-[#00bbff]">Weak</div>
                        <div className="text-xs text-gray-400">0.35 ADX</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Correlation Regime</div>
                        <div className="text-xl font-mono text-white">Normal</div>
                        <div className="text-xs text-gray-400">0.72 avg</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Liquidity</div>
                        <div className="text-xl font-mono text-green-400">Good</div>
                        <div className="text-xs text-gray-400">0.88 score</div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#00bbff]/10 border border-[#00bbff]/20 rounded-lg">
                      <div className="flex items-center text-[#00bbff] text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Regime detection confidence: High (87%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Regime Changes */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Recent Regime Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "2024-01-12", from: "High Volatility", to: "Sideways", confidence: 0.89, duration: 3 },
                    { date: "2024-01-08", from: "Bear Trend", to: "High Volatility", confidence: 0.92, duration: 4 },
                    { date: "2024-01-03", from: "Sideways", to: "Bear Trend", confidence: 0.76, duration: 5 },
                    { date: "2023-12-28", from: "Bull Trend", to: "Sideways", confidence: 0.84, duration: 6 }
                  ].map((change, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-400">{change.date}</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white">{change.from}</span>
                          <Shuffle className="h-4 w-4 text-[#00bbff]" />
                          <span className="text-white">{change.to}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-gray-400">Confidence: </span>
                          <span className="text-[#00bbff]">{formatPercent(change.confidence)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Duration: </span>
                          <span className="text-white">{change.duration}d</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regime History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Regime Timeline */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Regime Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={regimeHistory.slice(-252)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis yAxisId="returns" stroke="#888" />
                    <YAxis yAxisId="probability" orientation="right" stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar yAxisId="returns" dataKey="returns" fill="#00bbff" fillOpacity={0.3} />
                    <Line yAxisId="probability" type="monotone" dataKey="probability" stroke="#fbbf24" strokeWidth={2} name="Confidence" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regime Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Regime Duration Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={regimes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={100} />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="duration" fill="#00bbff" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Regime Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regimes.map((regime, i) => (
                      <div key={i} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: regime.color }}></div>
                            <span className="font-semibold text-white">{regime.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Avg Return</div>
                            <div className={`font-mono ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                              {(Math.random() - 0.5).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400">Frequency: </span>
                            <span className="text-white">{Math.floor(Math.random() * 50 + 10)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Volatility: </span>
                            <span className="text-white">{(Math.random() * 0.3 + 0.1).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Sharpe: </span>
                            <span className="text-white">{(Math.random() * 2 - 0.5).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Indicators Tab */}
          <TabsContent value="indicators" className="space-y-6">
            {/* Indicator Contributions */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Regime Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {indicators.map((indicator, i) => (
                    <div key={i} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={getSignalColor(indicator.signal)}>
                            {getSignalIcon(indicator.signal)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{indicator.name}</h4>
                            <div className="text-sm text-gray-400">Weight: {formatPercent(indicator.weight)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-mono text-white">{indicator.value.toFixed(2)}</div>
                          <div className={`text-sm font-mono ${indicator.contribution > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {indicator.contribution > 0 ? '+' : ''}{indicator.contribution.toFixed(3)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">Signal:</span>
                          <Badge variant="outline" className={`${getSignalColor(indicator.signal)} border-current`}>
                            {indicator.signal}
                          </Badge>
                        </div>
                        <div className="w-32 bg-[#2a2a3e] rounded-full h-2">
                          <div 
                            className="bg-[#00bbff] h-2 rounded-full" 
                            style={{ width: `${Math.abs(indicator.contribution) * 500}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Indicator Chart */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Indicator Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={indicators}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="contribution" fill="#00bbff" />
                    <ReferenceLine y={0} stroke="#888" strokeDasharray="2 2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Indicator Correlations */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Indicator Correlation Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {indicators.map((indicator, i) => (
                    <div key={i} className="p-2 text-center text-gray-400 font-mono">
                      {indicator.name.split(' ')[0]}
                    </div>
                  ))}
                  {indicators.map((row, i) => 
                    indicators.map((col, j) => {
                      const correlation = i === j ? 1 : (Math.random() - 0.5) * 2
                      const intensity = Math.abs(correlation)
                      const color = correlation > 0 ? 'bg-green-500' : 'bg-red-500'
                      return (
                        <div 
                          key={`${i}-${j}`} 
                          className={`p-2 text-center text-xs font-mono ${color}`}
                          style={{ opacity: intensity }}
                        >
                          {correlation.toFixed(2)}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transitions Tab */}
          <TabsContent value="transitions" className="space-y-6">
            {/* Transition Probabilities */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Regime Transition Probabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transitions.map((transition, i) => (
                    <div key={i} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-semibold">{transition.from}</span>
                            <Shuffle className="h-4 w-4 text-[#00bbff]" />
                            <span className="text-white font-semibold">{transition.to}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-mono text-[#00bbff]">{formatPercent(transition.probability)}</div>
                          <div className="text-sm text-gray-400">{transition.expectedDuration} days</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Trigger Conditions:</div>
                        <div className="flex flex-wrap gap-2">
                          {transition.triggerConditions.map((condition, j) => (
                            <Badge key={j} variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transition Matrix */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Transition Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="p-2 text-left text-gray-400">From / To</th>
                        {regimes.map(regime => (
                          <th key={regime.id} className="p-2 text-center text-gray-400">{regime.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {regimes.map((fromRegime, i) => (
                        <tr key={fromRegime.id} className="border-t border-[#2a2a3e]">
                          <td className="p-2 font-semibold text-white">{fromRegime.name}</td>
                          {regimes.map((toRegime, j) => {
                            const probability = i === j ? 0.4 + Math.random() * 0.3 : Math.random() * 0.3
                            return (
                              <td key={toRegime.id} className="p-2 text-center">
                                <div 
                                  className="px-2 py-1 rounded text-xs font-mono bg-[#00bbff]"
                                  style={{ opacity: probability }}
                                >
                                  {formatPercent(probability)}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            {/* Regime-Based Strategies */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  regime: "Bull Trend",
                  strategy: "Momentum Following",
                  description: "Long equity momentum with trend-following signals",
                  allocation: "80% Equity, 20% Cash",
                  expectedReturn: "12-18%",
                  maxDrawdown: "8-12%",
                  color: "#4ade80"
                },
                {
                  regime: "Bear Trend", 
                  strategy: "Defensive Positioning",
                  description: "Short equity, long bonds and defensive assets",
                  allocation: "20% Equity, 60% Bonds, 20% Gold",
                  expectedReturn: "4-8%",
                  maxDrawdown: "3-6%",
                  color: "#f87171"
                },
                {
                  regime: "Sideways",
                  strategy: "Mean Reversion",
                  description: "Range-bound trading with mean reversion signals",
                  allocation: "50% Equity, 30% Bonds, 20% Alternatives",
                  expectedReturn: "6-10%",
                  maxDrawdown: "5-8%",
                  color: "#fbbf24"
                },
                {
                  regime: "High Volatility",
                  strategy: "Volatility Trading",
                  description: "Long volatility with options strategies",
                  allocation: "30% Equity, 40% Options, 30% Cash",
                  expectedReturn: "8-15%",
                  maxDrawdown: "10-15%",
                  color: "#a78bfa"
                },
                {
                  regime: "Crisis",
                  strategy: "Flight to Quality",
                  description: "Safe haven assets and cash preservation",
                  allocation: "10% Equity, 70% Bonds, 20% Gold",
                  expectedReturn: "2-5%",
                  maxDrawdown: "2-4%",
                  color: "#ef4444"
                }
              ].map((strategy, i) => (
                <Card key={i} className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{strategy.strategy}</CardTitle>
                      <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: strategy.color }}></div>
                    </div>
                    <div className="text-sm text-gray-400">{strategy.regime} Regime</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a0a0b8] mb-4">{strategy.description}</p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-400">Allocation: </span>
                        <span className="text-white">{strategy.allocation}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Expected Return: </span>
                        <span className="text-green-400">{strategy.expectedReturn}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Max Drawdown: </span>
                        <span className="text-red-400">{strategy.maxDrawdown}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log(`Activate Strategy clicked for ${strategy.strategy}`)
                        alert(`Activating ${strategy.strategy} regime-based strategy...`)
                      }}
                      className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                    >
                      Activate Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Strategy Performance */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Regime-Adaptive Strategy Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { date: '2023-01', adaptive: 100, buyHold: 100, regime: 'Bull' },
                    { date: '2023-03', adaptive: 108, buyHold: 105, regime: 'Bull' },
                    { date: '2023-06', adaptive: 115, buyHold: 98, regime: 'Sideways' },
                    { date: '2023-09', adaptive: 118, buyHold: 92, regime: 'Bear' },
                    { date: '2023-12', adaptive: 125, buyHold: 108, regime: 'Bull' },
                    { date: '2024-01', adaptive: 132, buyHold: 112, regime: 'Sideways' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="adaptive" stroke="#00bbff" strokeWidth={3} name="Regime-Adaptive" />
                    <Line type="monotone" dataKey="buyHold" stroke="#888" strokeWidth={2} name="Buy & Hold" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Model Configuration Tab */}
          <TabsContent value="model" className="space-y-6">
            {/* Model Parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Model Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Model Type</label>
                      <Select defaultValue="hmm">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="hmm">Hidden Markov Model</SelectItem>
                          <SelectItem value="ml">Machine Learning Ensemble</SelectItem>
                          <SelectItem value="hybrid">Hybrid HMM-ML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Lookback Period</label>
                      <Select defaultValue="252">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="126">6 Months</SelectItem>
                          <SelectItem value="252">1 Year</SelectItem>
                          <SelectItem value="504">2 Years</SelectItem>
                          <SelectItem value="1260">5 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Update Frequency</label>
                      <Select defaultValue="daily">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="intraday">Intraday</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Confidence Threshold</label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="range" 
                          min="0.5" 
                          max="0.95" 
                          step="0.05"
                          defaultValue="0.75" 
                          className="flex-1"
                        />
                        <span className="text-white">75%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Model Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Accuracy</div>
                        <div className="text-xl font-mono text-green-400">87.3%</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Precision</div>
                        <div className="text-xl font-mono text-[#00bbff]">84.1%</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Recall</div>
                        <div className="text-xl font-mono text-white">89.7%</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">F1 Score</div>
                        <div className="text-xl font-mono text-purple-400">86.8%</div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Model performance: Excellent
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        console.log('Retrain Model clicked')
                        alert('Retraining regime detection model with extended dataset...')
                      }}
                      className="w-full bg-[#00bbff] hover:bg-[#0099cc] text-white"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retrain Model
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Importance */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Feature Importance for Regime Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { feature: "Volatility", importance: 0.24 },
                    { feature: "Momentum", importance: 0.19 },
                    { feature: "Correlation", importance: 0.16 },
                    { feature: "Credit Spreads", importance: 0.14 },
                    { feature: "Term Structure", importance: 0.12 },
                    { feature: "Liquidity", importance: 0.09 },
                    { feature: "Sentiment", importance: 0.06 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="feature" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Importance"]}
                    />
                    <Bar dataKey="importance" fill="#00bbff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
