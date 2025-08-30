"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, Activity, Target } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Button } from "@/components/ui/button"

interface RiskMetric {
  name: string
  current: number
  limit: number
  status: "safe" | "warning" | "danger"
  unit: string
}

interface VaRData {
  timeframe: string
  var95: number
  var99: number
  expectedShortfall: number
}

interface StressTest {
  scenario: string
  impact: number
  probability: number
  description: string
}

interface RealTimeAlert {
  id: number
  type: string
  message: string
  severity: "LOW" | "MEDIUM" | "HIGH"
  timestamp: Date
}

interface RiskControl {
  name: string
  enabled: boolean
  description: string
}

interface StressScenario {
  name: string
  impact: number
  probability: number
  hedgeRatio: number
}

export function RiskManagement() {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([])
  const [varData, setVarData] = useState<VaRData[]>([])
  const [stressTests, setStressTests] = useState<StressTest[]>([])
  const [portfolioVaR, setPortfolioVaR] = useState(0)
  const [realTimeAlerts] = useState<RealTimeAlert[]>([
    {
      id: 1,
      type: "POSITION_LIMIT",
      message: "AAPL position approaching 90% of limit",
      severity: "MEDIUM",
      timestamp: new Date(),
    },
    {
      id: 2,
      type: "CORRELATION",
      message: "Tech sector correlation exceeded 0.85",
      severity: "HIGH",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: 3,
      type: "VAR_BREACH",
      message: "Intraday VaR increased by 15%",
      severity: "MEDIUM",
      timestamp: new Date(Date.now() - 600000),
    },
  ])
  const [riskControls] = useState<RiskControl[]>([
    { name: "Auto Position Sizing", enabled: true, description: "Automatically size positions based on volatility" },
    { name: "Stop Loss Orders", enabled: true, description: "Automatic stop-loss at 2% portfolio impact" },
    { name: "Correlation Monitoring", enabled: true, description: "Alert when sector correlation > 0.8" },
    { name: "Leverage Control", enabled: true, description: "Prevent leverage exceeding 4.0x" },
    { name: "Concentration Limits", enabled: false, description: "Limit single position to 5% of portfolio" },
  ])
  const [stressScenarios] = useState<StressScenario[]>([
    { name: "COVID-19 Repeat", impact: -18.5, probability: 8, hedgeRatio: 0.65 },
    { name: "Flash Crash", impact: -12.3, probability: 15, hedgeRatio: 0.45 },
    { name: "Interest Rate Shock", impact: -8.7, probability: 25, hedgeRatio: 0.78 },
    { name: "Geopolitical Crisis", impact: -15.2, probability: 12, hedgeRatio: 0.52 },
  ])

  // Mock data initialization
  useEffect(() => {
    const mockRiskMetrics: RiskMetric[] = [
      { name: "Portfolio VaR (1D, 95%)", current: 125000, limit: 200000, status: "safe", unit: "$" },
      { name: "Maximum Drawdown", current: 8.5, limit: 15, status: "safe", unit: "%" },
      { name: "Leverage Ratio", current: 2.3, limit: 4.0, status: "safe", unit: "x" },
      { name: "Concentration Risk", current: 25, limit: 30, status: "warning", unit: "%" },
      { name: "Beta to Market", current: 1.15, limit: 1.5, status: "safe", unit: "" },
      { name: "Volatility (30D)", current: 18.5, limit: 25, status: "safe", unit: "%" },
    ]

    const mockVarData: VaRData[] = [
      { timeframe: "1D", var95: 125000, var99: 185000, expectedShortfall: 220000 },
      { timeframe: "1W", var95: 280000, var99: 415000, expectedShortfall: 495000 },
      { timeframe: "1M", var95: 560000, var99: 830000, expectedShortfall: 990000 },
      { timeframe: "3M", var95: 970000, var99: 1440000, expectedShortfall: 1720000 },
    ]

    const mockStressTests: StressTest[] = [
      {
        scenario: "Market Crash (-20%)",
        impact: -1850000,
        probability: 5,
        description: "Broad market decline similar to March 2020",
      },
      {
        scenario: "Interest Rate Spike (+200bp)",
        impact: -920000,
        probability: 15,
        description: "Sudden monetary policy tightening",
      },
      {
        scenario: "Tech Sector Collapse (-35%)",
        impact: -1200000,
        probability: 8,
        description: "Technology sector specific crash",
      },
      { scenario: "Credit Crisis", impact: -2100000, probability: 3, description: "Corporate credit market freeze" },
      {
        scenario: "Currency Devaluation",
        impact: -650000,
        probability: 12,
        description: "Major currency pair disruption",
      },
    ]

    setRiskMetrics(mockRiskMetrics)
    setVarData(mockVarData)
    setStressTests(mockStressTests)
    setPortfolioVaR(125000)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setRiskMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          current: metric.current * (1 + (Math.random() - 0.5) * 0.02),
        })),
      )
      setPortfolioVaR((prev) => prev * (1 + (Math.random() - 0.5) * 0.05))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-green-400 bg-green-500/20 border-green-500/30"
      case "warning":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
      case "danger":
        return "text-red-400 bg-red-500/20 border-red-500/30"
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <Shield className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
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
          <h1 className="text-2xl font-bold text-white">Risk Management</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">Portfolio VaR (1D): </span>
              <span className="text-red-400 font-bold">{formatCurrency(portfolioVaR)}</span>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              Risk Level: LOW
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[#1a1a2e]">
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Risk Metrics
            </TabsTrigger>
            <TabsTrigger value="var" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              VaR Analysis
            </TabsTrigger>
            <TabsTrigger
              value="stress"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Stress Tests
            </TabsTrigger>
            <TabsTrigger
              value="limits"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Risk Limits
            </TabsTrigger>
            <TabsTrigger
              value="monitoring"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Real-Time Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskMetrics.map((metric, index) => (
                <Card key={index} className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-400 flex items-center justify-between">
                      {metric.name}
                      {getStatusIcon(metric.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">
                          {metric.unit === "$"
                            ? formatCurrency(metric.current)
                            : `${metric.current.toFixed(metric.unit === "%" ? 1 : 2)}${metric.unit}`}
                        </span>
                        <Badge variant="outline" className={getStatusColor(metric.status)}>
                          {metric.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Limit:</span>
                          <span className="text-gray-300">
                            {metric.unit === "$"
                              ? formatCurrency(metric.limit)
                              : `${metric.limit.toFixed(metric.unit === "%" ? 1 : 2)}${metric.unit}`}
                          </span>
                        </div>
                        <Progress value={(metric.current / metric.limit) * 100} className="h-2" />
                        <div className="text-xs text-gray-400">
                          {((metric.current / metric.limit) * 100).toFixed(1)}% of limit
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="var" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Value at Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={varData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="timeframe" stroke="#888" />
                      <YAxis stroke="#888" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), ""]}
                      />
                      <Bar dataKey="var95" fill="#00bbff" name="VaR 95%" />
                      <Bar dataKey="var99" fill="#ff6b6b" name="VaR 99%" />
                      <Bar dataKey="expectedShortfall" fill="#ffa500" name="Expected Shortfall" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Risk Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {varData.map((item, index) => (
                      <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">{item.timeframe}</span>
                          <Target className="h-4 w-4 text-[#00bbff]" />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">VaR 95%:</span>
                            <span className="text-[#00bbff]">{formatCurrency(item.var95)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">VaR 99%:</span>
                            <span className="text-red-400">{formatCurrency(item.var99)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Expected Shortfall:</span>
                            <span className="text-orange-400">{formatCurrency(item.expectedShortfall)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stress" className="space-y-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Stress Test Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stressTests.map((test, index) => (
                    <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-orange-400" />
                          <span className="font-semibold text-white">{test.scenario}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-gray-400 border-gray-500/30">
                            {test.probability}% probability
                          </Badge>
                          <span className={`font-bold ${test.impact < 0 ? "text-red-400" : "text-green-400"}`}>
                            {formatCurrency(test.impact)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{test.description}</p>
                      <div className="mt-3">
                        <Progress value={(Math.abs(test.impact) / 2500000) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Position Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Single Position Limit</span>
                        <span className="text-white">$500,000</span>
                      </div>
                    </div>
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Sector Concentration</span>
                        <span className="text-white">30%</span>
                      </div>
                    </div>
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Maximum Leverage</span>
                        <span className="text-white">4.0x</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Risk Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <span className="text-gray-400">Auto Stop-Loss</span>
                      <Badge variant="outline" className="text-green-400 border-green-500/30">
                        ENABLED
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <span className="text-gray-400">Position Sizing</span>
                      <Badge variant="outline" className="text-green-400 border-green-500/30">
                        ACTIVE
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <span className="text-gray-400">Correlation Limits</span>
                      <Badge variant="outline" className="text-green-400 border-green-500/30">
                        MONITORED
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Real-Time Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {realTimeAlerts.map((alert) => (
                      <div key={alert.id} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant="outline"
                            className={
                              alert.severity === "HIGH"
                                ? "text-red-400 border-red-500/30"
                                : alert.severity === "MEDIUM"
                                  ? "text-yellow-400 border-yellow-500/30"
                                  : "text-blue-400 border-blue-500/30"
                            }
                          >
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-gray-400">{alert.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-white">{alert.message}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            onClick={() => {
                              console.log('Acknowledge alert clicked')
                              window.alert('Alert acknowledged and marked as reviewed.')
                            }}
                            size="sm"
                            variant="outline"
                            className="text-xs border-[#00bbff]/30 text-[#00bbff] bg-transparent"
                          >
                            Acknowledge
                          </Button>
                          <Button
                            onClick={() => {
                              console.log('Take action clicked')
                              window.alert('Opening risk mitigation actions...')
                            }}
                            size="sm"
                            variant="outline"
                            className="text-xs border-red-500/30 text-red-400 bg-transparent"
                          >
                            Take Action
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Automated Risk Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskControls.map((control, i) => (
                      <div key={i} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{control.name}</span>
                          <Badge
                            variant="outline"
                            className={
                              control.enabled
                                ? "text-green-400 border-green-500/30"
                                : "text-gray-400 border-gray-500/30"
                            }
                          >
                            {control.enabled ? "ENABLED" : "DISABLED"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{control.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Advanced Stress Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stressScenarios.map((scenario, i) => (
                    <div key={i} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white font-semibold">{scenario.name}</span>
                        <span className="text-red-400 font-bold">{scenario.impact}%</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Probability:</span>
                          <span className="text-yellow-400">{scenario.probability}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hedge Ratio:</span>
                          <span className="text-[#00bbff]">{scenario.hedgeRatio.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          console.log('Run scenario clicked')
                          window.alert('Running stress test scenario...')
                        }}
                        size="sm"
                        className="w-full mt-3 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                        variant="outline"
                      >
                        Run Scenario
                      </Button>
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
