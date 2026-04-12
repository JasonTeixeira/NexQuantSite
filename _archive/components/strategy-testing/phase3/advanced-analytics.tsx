"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Activity, Target } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

const performanceData = [
  { date: "2024-01-01", portfolio: 100000, benchmark: 100000, alpha: 0 },
  { date: "2024-01-02", portfolio: 101200, benchmark: 100800, alpha: 400 },
  { date: "2024-01-03", portfolio: 102800, benchmark: 101200, alpha: 1600 },
  { date: "2024-01-04", portfolio: 104500, benchmark: 102000, alpha: 2500 },
  { date: "2024-01-05", portfolio: 103900, benchmark: 101800, alpha: 2100 },
  { date: "2024-01-08", portfolio: 105600, benchmark: 102500, alpha: 3100 },
  { date: "2024-01-09", portfolio: 107200, benchmark: 103200, alpha: 4000 },
  { date: "2024-01-10", portfolio: 106800, benchmark: 102900, alpha: 3900 },
]

const attributionData = [
  { factor: "Stock Selection", contribution: 2.8, percentage: 45 },
  { factor: "Sector Allocation", contribution: 1.2, percentage: 19 },
  { factor: "Market Timing", contribution: 0.8, percentage: 13 },
  { factor: "Currency", contribution: 0.6, percentage: 10 },
  { factor: "Other", contribution: 0.8, percentage: 13 },
]

const riskMetrics = [
  { metric: "Value at Risk (95%)", value: "$1.2M", change: -5.2, status: "good" },
  { metric: "Expected Shortfall", value: "$1.8M", change: -3.1, status: "good" },
  { metric: "Maximum Drawdown", value: "8.5%", change: 1.2, status: "warning" },
  { metric: "Sharpe Ratio", value: "1.85", change: 0.15, status: "good" },
  { metric: "Information Ratio", value: "1.42", change: 0.08, status: "good" },
  { metric: "Beta", value: "0.92", change: -0.03, status: "neutral" },
]

const sectorExposure = [
  { name: "Technology", value: 28.5, color: "#00bbff" },
  { name: "Healthcare", value: 18.2, color: "#00ff88" },
  { name: "Financials", value: 15.8, color: "#ffa502" },
  { name: "Consumer", value: 12.4, color: "#ff6b35" },
  { name: "Energy", value: 10.1, color: "#ff4757" },
  { name: "Industrials", value: 8.7, color: "#a55eea" },
  { name: "Other", value: 6.3, color: "#666" },
]

const correlationData = [
  { asset1: "AAPL", asset2: "MSFT", correlation: 0.72 },
  { asset1: "AAPL", asset2: "GOOGL", correlation: 0.68 },
  { asset1: "AAPL", asset2: "TSLA", correlation: 0.45 },
  { asset1: "MSFT", asset2: "GOOGL", correlation: 0.81 },
  { asset1: "MSFT", asset2: "TSLA", correlation: 0.38 },
  { asset1: "GOOGL", asset2: "TSLA", correlation: 0.42 },
]

const mlModels = [
  { name: "Factor Attribution Model", accuracy: 94.2, status: "active", lastTrained: "2024-01-14" },
  { name: "Risk Prediction Model", accuracy: 91.8, status: "active", lastTrained: "2024-01-13" },
  { name: "Alpha Generation Model", accuracy: 87.5, status: "training", lastTrained: "2024-01-12" },
  { name: "Market Regime Model", accuracy: 89.3, status: "active", lastTrained: "2024-01-11" },
]

const customFactors = [
  { name: "ESG Score", exposure: 12.5, contribution: 0.8, significance: "high" },
  { name: "Momentum Factor", exposure: 18.3, contribution: 1.2, significance: "high" },
  { name: "Quality Factor", exposure: 15.7, contribution: 0.9, significance: "medium" },
  { name: "Low Volatility", exposure: 22.1, contribution: 1.5, significance: "high" },
  { name: "Sentiment Factor", exposure: 8.9, contribution: 0.4, significance: "low" },
]

const advancedMetrics = [
  { metric: "Information Coefficient", value: 0.08, benchmark: "> 0.05", status: "good" },
  { metric: "Hit Rate", value: 58.3, benchmark: "> 55%", status: "good" },
  { metric: "Capture Ratio (Up)", value: 102.5, benchmark: "> 95%", status: "excellent" },
  { metric: "Capture Ratio (Down)", value: 87.2, benchmark: "< 90%", status: "good" },
  { metric: "Tracking Error", value: 4.2, benchmark: "< 5%", status: "good" },
  { metric: "Active Share", value: 78.5, benchmark: "> 70%", status: "good" },
]

export function AdvancedAnalytics() {
  const [selectedTab, setSelectedTab] = useState("performance")
  const [timeframe, setTimeframe] = useState("1M")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "#00ff88"
      case "warning":
        return "#ffa502"
      case "danger":
        return "#ff4757"
      case "excellent":
        return "#00ff88"
      default:
        return "#666"
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "#00ff88" : "#ff4757"
  }

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h1>
        <p className="text-gray-400">Comprehensive performance attribution and risk analysis</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#1a1a2e] border-[#2a2a3e]">
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Performance
          </TabsTrigger>
          <TabsTrigger value="attribution" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Attribution
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="exposure" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Exposure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Performance Analysis</h2>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 bg-[#1a1a2e] border-[#2a2a3e] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#00bbff]" />
                  Total Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">+7.2%</div>
                <p className="text-xs text-[#00ff88]">+0.8% vs benchmark</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#00bbff]" />
                  Alpha Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">+4.0%</div>
                <p className="text-xs text-[#00ff88]">Annualized</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#00bbff]" />
                  Volatility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">12.8%</div>
                <p className="text-xs text-[#ffa502]">+1.2% vs benchmark</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Portfolio vs Benchmark Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Line type="monotone" dataKey="portfolio" stroke="#00bbff" strokeWidth={2} name="Portfolio" />
                    <Line type="monotone" dataKey="benchmark" stroke="#666" strokeWidth={2} name="Benchmark" />
                    <Line type="monotone" dataKey="alpha" stroke="#00ff88" strokeWidth={2} name="Alpha" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Performance Attribution</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Attribution by Factor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attributionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300">{item.factor}</span>
                          <span className="text-sm font-medium text-white">+{item.contribution}%</span>
                        </div>
                        <div className="w-full bg-[#0f0f1a] rounded-full h-2">
                          <div className="bg-[#00bbff] h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Attribution Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={attributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="contribution"
                      >
                        {attributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Monthly Attribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="factor" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="contribution" fill="#00bbff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Custom Factor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">+{factor.contribution}%</span>
                          <Badge
                            className={`text-xs ${factor.significance === "high" ? "bg-[#00ff88] text-black" : factor.significance === "medium" ? "bg-[#ffa502] text-black" : "bg-[#666] text-white"}`}
                          >
                            {factor.significance}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#2a2a3e] rounded-full h-2">
                          <div
                            className="bg-[#00bbff] h-2 rounded-full"
                            style={{ width: `${(factor.exposure / 25) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{factor.exposure}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">ML Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mlModels.map((model, index) => (
                  <div key={index} className="p-3 bg-[#0f0f1a] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{model.name}</h3>
                      <Badge
                        className={model.status === "active" ? "bg-[#00ff88] text-black" : "bg-[#ffa502] text-black"}
                      >
                        {model.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Accuracy</span>
                      <span className="text-sm font-medium text-white">{model.accuracy}%</span>
                    </div>
                    <div className="w-full bg-[#2a2a3e] rounded-full h-2 mb-2">
                      <div className="bg-[#00bbff] h-2 rounded-full" style={{ width: `${model.accuracy}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500">Last trained: {model.lastTrained}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Risk Analysis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskMetrics.map((metric, index) => (
              <Card key={index} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{metric.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">{metric.value}</span>
                    <Badge
                      variant="outline"
                      className={`border-[${getStatusColor(metric.status)}] text-[${getStatusColor(metric.status)}]`}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <p className={`text-xs mt-1 text-[${getChangeColor(metric.change)}]`}>
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}% vs last period
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Asset Correlation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {correlationData.map((corr, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-[#00bbff] font-medium">{corr.asset1}</span>
                      <span className="text-gray-400">×</span>
                      <span className="text-[#00bbff] font-medium">{corr.asset2}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-[#2a2a3e] rounded-full h-2">
                        <div
                          className="bg-[#00ff88] h-2 rounded-full"
                          style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-12 text-right">{corr.correlation.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Advanced Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedMetrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-[#0f0f1a] rounded-lg">
                    <p className="text-sm text-gray-400">{metric.metric}</p>
                    <p className="text-xl font-bold text-white">
                      {metric.value}
                      {typeof metric.value === "number" && metric.value > 10 ? "%" : ""}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge
                        className={`text-xs ${metric.status === "excellent" ? "bg-[#00ff88] text-black" : metric.status === "good" ? "bg-[#00bbff] text-black" : "bg-[#ffa502] text-black"}`}
                      >
                        {metric.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{metric.benchmark}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exposure" className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Portfolio Exposure</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Sector Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={sectorExposure}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sectorExposure.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Sector Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sectorExposure.map((sector, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }}></div>
                        <span className="text-gray-300">{sector.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-[#2a2a3e] rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${(sector.value / 30) * 100}%`,
                              backgroundColor: sector.color,
                            }}
                          ></div>
                        </div>
                        <span className="text-white font-medium w-12 text-right">{sector.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
