"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, Target, Monitor, Eye, BarChart3, Activity, RefreshCw } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Funnel,
  FunnelChart,
  LabelList,
} from "recharts"

// Mock analytics data
const userBehaviorData = [
  { hour: "00", pageViews: 1200, uniqueVisitors: 800, bounceRate: 45, avgSessionTime: 180 },
  { hour: "01", pageViews: 800, uniqueVisitors: 600, bounceRate: 48, avgSessionTime: 165 },
  { hour: "02", pageViews: 600, uniqueVisitors: 450, bounceRate: 52, avgSessionTime: 150 },
  { hour: "03", pageViews: 400, uniqueVisitors: 300, bounceRate: 55, avgSessionTime: 140 },
  { hour: "04", pageViews: 300, uniqueVisitors: 250, bounceRate: 58, avgSessionTime: 135 },
  { hour: "05", pageViews: 350, uniqueVisitors: 280, bounceRate: 54, avgSessionTime: 145 },
  { hour: "06", pageViews: 500, uniqueVisitors: 400, bounceRate: 50, avgSessionTime: 160 },
  { hour: "07", pageViews: 800, uniqueVisitors: 650, bounceRate: 46, avgSessionTime: 175 },
  { hour: "08", pageViews: 1200, uniqueVisitors: 950, bounceRate: 42, avgSessionTime: 190 },
  { hour: "09", pageViews: 1800, uniqueVisitors: 1400, bounceRate: 38, avgSessionTime: 210 },
  { hour: "10", pageViews: 2200, uniqueVisitors: 1700, bounceRate: 35, avgSessionTime: 225 },
  { hour: "11", pageViews: 2500, uniqueVisitors: 1900, bounceRate: 33, avgSessionTime: 240 },
  { hour: "12", pageViews: 2800, uniqueVisitors: 2100, bounceRate: 32, avgSessionTime: 250 },
  { hour: "13", pageViews: 2600, uniqueVisitors: 2000, bounceRate: 34, avgSessionTime: 245 },
  { hour: "14", pageViews: 2400, uniqueVisitors: 1850, bounceRate: 36, avgSessionTime: 235 },
  { hour: "15", pageViews: 2200, uniqueVisitors: 1700, bounceRate: 38, avgSessionTime: 220 },
  { hour: "16", pageViews: 2000, uniqueVisitors: 1550, bounceRate: 40, avgSessionTime: 205 },
  { hour: "17", pageViews: 1800, uniqueVisitors: 1400, bounceRate: 42, avgSessionTime: 195 },
  { hour: "18", pageViews: 1600, uniqueVisitors: 1250, bounceRate: 44, avgSessionTime: 185 },
  { hour: "19", pageViews: 1400, uniqueVisitors: 1100, bounceRate: 46, avgSessionTime: 175 },
  { hour: "20", pageViews: 1200, uniqueVisitors: 950, bounceRate: 48, avgSessionTime: 170 },
  { hour: "21", pageViews: 1000, uniqueVisitors: 800, bounceRate: 50, avgSessionTime: 165 },
  { hour: "22", pageViews: 900, uniqueVisitors: 700, bounceRate: 52, avgSessionTime: 160 },
  { hour: "23", pageViews: 1000, uniqueVisitors: 750, bounceRate: 49, avgSessionTime: 170 },
]

const conversionFunnelData = [
  { name: "Website Visitors", value: 10000, fill: "#3B82F6" },
  { name: "Sign Up Started", value: 3500, fill: "#10B981" },
  { name: "Email Verified", value: 2800, fill: "#F59E0B" },
  { name: "Trial Started", value: 2200, fill: "#EF4444" },
  { name: "Subscription", value: 850, fill: "#8B5CF6" },
]

const deviceBreakdown = [
  { device: "Desktop", users: 4500, percentage: 45, color: "#3B82F6" },
  { device: "Mobile", users: 3800, percentage: 38, color: "#10B981" },
  { device: "Tablet", users: 1200, percentage: 12, color: "#F59E0B" },
  { device: "Other", users: 500, percentage: 5, color: "#EF4444" },
]

const topPages = [
  { page: "/dashboard", views: 15420, uniqueViews: 12350, avgTime: "4:32", bounceRate: 25 },
  { page: "/signals", views: 12800, uniqueViews: 10200, avgTime: "6:15", bounceRate: 18 },
  { page: "/pricing", views: 9650, uniqueViews: 8900, avgTime: "3:45", bounceRate: 35 },
  { page: "/about", views: 7200, uniqueViews: 6800, avgTime: "2:18", bounceRate: 42 },
  { page: "/contact", views: 5400, uniqueViews: 5100, avgTime: "1:55", bounceRate: 48 },
]

const predictiveMetrics = [
  {
    metric: "User Growth",
    current: 12500,
    predicted: 15800,
    confidence: 87,
    trend: "up",
    timeframe: "Next 30 days",
  },
  {
    metric: "Revenue",
    current: 195000,
    predicted: 235000,
    confidence: 92,
    trend: "up",
    timeframe: "Next 30 days",
  },
  {
    metric: "Churn Rate",
    current: 8.5,
    predicted: 6.2,
    confidence: 78,
    trend: "down",
    timeframe: "Next 30 days",
  },
  {
    metric: "Conversion Rate",
    current: 3.2,
    predicted: 4.1,
    confidence: 85,
    trend: "up",
    timeframe: "Next 30 days",
  },
]

const realTimeMetrics = [
  { label: "Active Users", value: 1247, change: "+12", trend: "up" },
  { label: "Page Views/min", value: 89, change: "-3", trend: "down" },
  { label: "Conversion Rate", value: "3.2%", change: "+0.1%", trend: "up" },
  { label: "Avg Session Time", value: "4:32", change: "+15s", trend: "up" },
]

export default function AdvancedAnalyticsClient() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        setLastUpdated(new Date())
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [realTimeEnabled])

  const refreshData = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Brain className="w-8 h-8 mr-3 text-primary" />
            Advanced Analytics & BI
          </h1>
          <p className="text-gray-400 mt-1">Real-time insights and predictive analytics dashboard</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch id="realtime" checked={realTimeEnabled} onCheckedChange={setRealTimeEnabled} />
            <Label htmlFor="realtime" className="text-gray-300">
              Real-time Updates
            </Label>
          </div>
          <Badge variant="outline" className="text-gray-300 border-gray-600">
            {realTimeEnabled && <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />}
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button
            onClick={refreshData}
            disabled={isLoading}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {realTimeMetrics.map((metric, index) => (
          <Card key={index} className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{metric.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                </div>
                <div
                  className={`flex items-center space-x-1 ${metric.trend === "up" ? "text-green-400" : "text-red-400"}`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4 rotate-180" />
                  )}
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="behavior" className="data-[state=active]:bg-primary">
            User Behavior
          </TabsTrigger>
          <TabsTrigger value="conversion" className="data-[state=active]:bg-primary">
            Conversion
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-primary">
            Predictive
          </TabsTrigger>
          <TabsTrigger value="realtime" className="data-[state=active]:bg-primary">
            Real-time
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-primary">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  User Activity Heatmap
                </CardTitle>
                <CardDescription className="text-gray-400">
                  24-hour user activity and engagement patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userBehaviorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueVisitors"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Monitor className="w-5 h-5 mr-2 text-primary" />
                  Device Distribution
                </CardTitle>
                <CardDescription className="text-gray-400">User device preferences and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: device.color }} />
                        <span className="text-gray-300 font-medium">{device.device}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Progress value={device.percentage} className="w-24" />
                        <span className="text-white font-bold w-16 text-right">{formatNumber(device.users)}</span>
                        <span className="text-gray-400 w-12 text-right">{device.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-primary" />
                Top Performing Pages
              </CardTitle>
              <CardDescription className="text-gray-400">
                Most visited pages and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Page</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Views</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Unique Views</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg Time</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map((page, index) => (
                      <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-4 text-white font-medium">{page.page}</td>
                        <td className="py-3 px-4 text-right text-white">{formatNumber(page.views)}</td>
                        <td className="py-3 px-4 text-right text-gray-300">{formatNumber(page.uniqueViews)}</td>
                        <td className="py-3 px-4 text-right text-gray-300">{page.avgTime}</td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`${
                              page.bounceRate < 30
                                ? "text-green-400"
                                : page.bounceRate < 40
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {page.bounceRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Conversion Funnel
                </CardTitle>
                <CardDescription className="text-gray-400">User journey from visitor to customer</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                    />
                    <Funnel dataKey="value" data={conversionFunnelData} isAnimationActive>
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Conversion Rates by Stage
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed breakdown of conversion performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {conversionFunnelData.map((stage, index) => {
                    const nextStage = conversionFunnelData[index + 1]
                    const conversionRate = nextStage ? ((nextStage.value / stage.value) * 100).toFixed(1) : "100.0"

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-medium">{stage.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-bold">{formatNumber(stage.value)}</span>
                            {nextStage && (
                              <Badge className="bg-primary/20 text-primary">{conversionRate}% convert</Badge>
                            )}
                          </div>
                        </div>
                        <Progress value={(stage.value / conversionFunnelData[0].value) * 100} className="h-3" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-2xl">
                <Brain className="w-6 h-6 mr-3 text-purple-400" />
                AI-Powered Predictive Analytics
              </CardTitle>
              <CardDescription className="text-purple-200">
                Machine learning insights and forecasting for key business metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {predictiveMetrics.map((metric, index) => (
                  <Card key={index} className="bg-gray-900/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white">{metric.metric}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-400">Current</p>
                            <p className="text-xl font-bold text-white">
                              {typeof metric.current === "number" && metric.current > 1000
                                ? formatNumber(metric.current)
                                : metric.current}
                              {metric.metric.includes("Rate") ? "%" : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Predicted</p>
                            <p
                              className={`text-xl font-bold ${
                                metric.trend === "up" ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {typeof metric.predicted === "number" && metric.predicted > 1000
                                ? formatNumber(metric.predicted)
                                : metric.predicted}
                              {metric.metric.includes("Rate") ? "%" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Confidence Level</span>
                            <span className="text-white">{metric.confidence}%</span>
                          </div>
                          <Progress value={metric.confidence} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{metric.timeframe}</span>
                          <Badge
                            className={`${
                              metric.trend === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {metric.trend === "up" ? "↗" : "↘"} Trending {metric.trend}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
