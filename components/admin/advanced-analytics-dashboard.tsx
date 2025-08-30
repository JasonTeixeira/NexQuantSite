"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  Eye,
  RefreshCw,
  Lightbulb,
  Star,
  Award,
} from "lucide-react"
import { advancedAnalyticsEngine } from "@/lib/advanced-analytics-engine"
import { toast } from "sonner"

export default function AdvancedAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedMetricCategory, setSelectedMetricCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "predictive">("overview")

  // Get analytics data from engine
  const metrics = useMemo(() => advancedAnalyticsEngine.getMetrics(), [])
  const cohortAnalysis = useMemo(() => advancedAnalyticsEngine.getCohortAnalysis(), [])
  const funnelAnalysis = useMemo(() => advancedAnalyticsEngine.getFunnelAnalysis(), [])
  const behaviorPatterns = useMemo(() => advancedAnalyticsEngine.getBehaviorPatterns(), [])
  const insights = useMemo(() => advancedAnalyticsEngine.generateInsights(), [])
  const recommendations = useMemo(() => advancedAnalyticsEngine.generateRecommendations(), [])

  const filteredMetrics = useMemo(() => {
    if (selectedMetricCategory === "all") return metrics
    return metrics.filter((m) => m.category === selectedMetricCategory)
  }, [metrics, selectedMetricCategory])

  const overallPerformance = useMemo(() => {
    const totalUsers = 15420
    const activeUsers = 8932
    const conversionRate = metrics.find((m) => m.id === "conversion_rate")?.value || 0
    const retentionRate = metrics.find((m) => m.id === "retention_30d")?.value || 0
    const avgRevenue = metrics.find((m) => m.id === "arpu")?.value || 0
    const churnRate = metrics.find((m) => m.id === "churn_rate")?.value || 0

    return {
      totalUsers,
      activeUsers,
      conversionRate,
      retentionRate,
      avgRevenue,
      churnRate,
      healthScore: Math.round(conversionRate * 0.3 + retentionRate * 0.4 + (100 - churnRate) * 0.3),
    }
  }, [metrics])

  useEffect(() => {
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        setLastUpdated(new Date())
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [realTimeEnabled])

  const refreshData = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastUpdated(new Date())
    setIsLoading(false)
    toast.success("Analytics data refreshed")
  }

  const getMetricIcon = (category: string) => {
    switch (category) {
      case "engagement":
        return <Activity className="w-5 h-5" />
      case "retention":
        return <Users className="w-5 h-5" />
      case "conversion":
        return <Target className="w-5 h-5" />
      case "revenue":
        return <DollarSign className="w-5 h-5" />
      case "behavior":
        return <Brain className="w-5 h-5" />
      default:
        return <BarChart3 className="w-5 h-5" />
    }
  }

  const getMetricColor = (category: string) => {
    switch (category) {
      case "engagement":
        return "text-blue-400"
      case "retention":
        return "text-green-400"
      case "conversion":
        return "text-purple-400"
      case "revenue":
        return "text-yellow-400"
      case "behavior":
        return "text-pink-400"
      default:
        return "text-gray-400"
    }
  }

  // Mock real-time data updates
  const realTimeMetrics = [
    { label: "Active Users Now", value: "1,247", change: "+23", trend: "up" },
    { label: "Conversion Rate", value: "8.7%", change: "+0.3%", trend: "up" },
    { label: "Revenue/Hour", value: "$2.4K", change: "-$180", trend: "down" },
    { label: "Engagement Score", value: "87.3", change: "+2.1", trend: "up" },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Brain className="w-10 h-10 mr-4 text-primary" />
              ADVANCED <span className="text-primary ml-2">ANALYTICS</span>
            </h1>
            <p className="text-gray-400 text-lg">
              AI-powered insights and predictive analytics for data-driven decision making
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="realtime" checked={realTimeEnabled} onCheckedChange={setRealTimeEnabled} />
              <Label htmlFor="realtime" className="text-gray-300">
                Real-time
              </Label>
            </div>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[120px] bg-white/10 border-primary/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-primary/30">
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {realTimeEnabled && <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />}
              {lastUpdated.toLocaleTimeString()}
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

        {/* Real-time Metrics Bar */}
        {realTimeEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {realTimeMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-black/40 border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-xs">{metric.label}</p>
                        <p className="text-xl font-bold text-white">{metric.value}</p>
                      </div>
                      <div
                        className={`flex items-center text-sm ${
                          metric.trend === "up" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {metric.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {metric.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm">Platform Health Score</p>
                    <p className="text-3xl font-bold text-white">{overallPerformance.healthScore}</p>
                    <p className="text-blue-400 text-sm">Excellent performance</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Award className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <Progress value={overallPerformance.healthScore} className="mt-3 h-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-white">{overallPerformance.activeUsers.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">+12.5% growth</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Users className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Conversion Rate</p>
                    <p className="text-3xl font-bold text-white">{overallPerformance.conversionRate.toFixed(1)}%</p>
                    <p className="text-purple-400 text-sm">Above target</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Target className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">Avg Revenue/User</p>
                    <p className="text-3xl font-bold text-white">${overallPerformance.avgRevenue.toFixed(0)}</p>
                    <p className="text-yellow-400 text-sm">+5.2% increase</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <DollarSign className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Analytics Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-primary">
              Engagement
            </TabsTrigger>
            <TabsTrigger value="conversion" className="data-[state=active]:bg-primary">
              Conversion
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="data-[state=active]:bg-primary">
              Cohorts
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-primary">
              Behavior
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary">
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`${getMetricColor(metric.category)}`}>{getMetricIcon(metric.category)}</div>
                          <CardTitle className="text-lg text-white">{metric.name}</CardTitle>
                        </div>
                        <Badge
                          className={`${
                            metric.trend === "up"
                              ? "bg-green-500/20 text-green-400"
                              : metric.trend === "down"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {metric.trend === "up" ? "↗" : metric.trend === "down" ? "↘" : "→"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-end justify-between">
                          <div className="text-3xl font-bold text-white">
                            {typeof metric.value === "number" && metric.value > 1000
                              ? metric.value.toLocaleString()
                              : metric.value}
                            {metric.category === "revenue" && "$"}
                            {metric.name.includes("Rate") && "%"}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              metric.change > 0
                                ? "text-green-400"
                                : metric.change < 0
                                  ? "text-red-400"
                                  : "text-gray-400"
                            }`}
                          >
                            {metric.change > 0 ? "+" : ""}
                            {metric.change}%
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm">{metric.description}</p>

                        <div className="space-y-2">
                          {metric.benchmark && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Benchmark</span>
                              <span className="text-gray-300">{metric.benchmark}</span>
                            </div>
                          )}
                          {metric.target && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Target</span>
                              <span className="text-primary">{metric.target}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Timeframe</span>
                            <span className="text-gray-300">{metric.timeframe}</span>
                          </div>
                        </div>

                        {metric.target && <Progress value={(metric.value / metric.target) * 100} className="h-2" />}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Conversion Funnel Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    User journey from first visit to conversion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelAnalysis.map((funnel) => (
                    <div key={funnel.id} className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">{funnel.name}</h4>
                        <Badge className="bg-primary/20 text-primary">{funnel.totalConversionRate}% overall</Badge>
                      </div>

                      <div className="space-y-3">
                        {funnel.steps.map((step, index) => (
                          <div key={step.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-white font-medium">{step.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold">{step.users.toLocaleString()}</div>
                                <div className="text-gray-400 text-sm">{step.conversionRate}%</div>
                              </div>
                            </div>
                            <Progress value={step.conversionRate} className="h-2" />
                            {step.dropoffRate > 0 && (
                              <div className="text-red-400 text-xs">
                                {step.dropoffRate}% drop-off | Avg time: {Math.floor(step.avgTimeToComplete / 60)}m
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {funnel.identifiedBottlenecks.length > 0 && (
                        <div className="mt-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                          <h5 className="text-red-300 font-medium mb-2">🚨 Identified Bottlenecks</h5>
                          <ul className="space-y-1">
                            {funnel.identifiedBottlenecks.map((bottleneck, idx) => (
                              <li key={idx} className="text-red-200 text-sm">
                                • {bottleneck}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Conversion Metrics */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Conversion Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Conversion Rate by Source */}
                    <div>
                      <h4 className="text-white font-medium mb-3">Conversion Rate by Traffic Source</h4>
                      <div className="space-y-3">
                        {[
                          { source: "Organic Search", rate: 12.8, users: 4520 },
                          { source: "Direct", rate: 18.5, users: 2890 },
                          { source: "Social Media", rate: 6.2, users: 1340 },
                          { source: "Paid Ads", rate: 22.1, users: 890 },
                          { source: "Referral", rate: 15.3, users: 670 },
                        ].map((item) => (
                          <div key={item.source} className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium">{item.source}</div>
                              <div className="text-gray-400 text-sm">{item.users} users</div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold">{item.rate}%</div>
                              <Progress value={item.rate} className="w-16 h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Time to Convert */}
                    <div>
                      <h4 className="text-white font-medium mb-3">Average Time to Convert</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">7.2</div>
                          <div className="text-xs text-gray-400">Days (Free to Paid)</div>
                        </div>
                        <div className="text-center p-3 bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">2.8</div>
                          <div className="text-xs text-gray-400">Sessions (Trial Start)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {cohortAnalysis.map((cohort, index) => (
                <motion.div
                  key={cohort.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-black/40 border-primary/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">{cohort.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {cohort.size.toLocaleString()} users • Created {cohort.createdAt.toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className="bg-primary/20 text-primary">Active Cohort</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Retention Rates */}
                        <div>
                          <h4 className="text-white font-medium mb-3">Retention Rates</h4>
                          <div className="space-y-2">
                            {Object.entries(cohort.retentionRates).map(([period, rate]) => (
                              <div key={period} className="flex items-center justify-between">
                                <span className="text-gray-300">{period}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={rate} className="w-16 h-2" />
                                  <span className="text-white font-medium w-12 text-right">{rate}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Revenue Metrics */}
                        <div>
                          <h4 className="text-white font-medium mb-3">Revenue Metrics</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Revenue</span>
                              <span className="text-green-400 font-bold">
                                ${cohort.revenueMetrics.totalRevenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Revenue/User</span>
                              <span className="text-blue-400 font-bold">
                                ${cohort.revenueMetrics.avgRevenuePerUser.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Predicted LTV</span>
                              <span className="text-purple-400 font-bold">
                                ${cohort.revenueMetrics.ltv.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Behavior Metrics */}
                        <div>
                          <h4 className="text-white font-medium mb-3">Behavior Patterns</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg Session Duration</span>
                              <span className="text-white">{cohort.behaviorMetrics.avgSessionDuration}m</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sessions/User</span>
                              <span className="text-white">{cohort.behaviorMetrics.avgSessionsPerUser}</span>
                            </div>

                            <div className="mt-4">
                              <h5 className="text-gray-300 text-sm mb-2">Feature Adoption</h5>
                              <div className="space-y-1">
                                {Object.entries(cohort.behaviorMetrics.featureAdoption).map(([feature, rate]) => (
                                  <div key={feature} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 capitalize">{feature.replace("_", " ")}</span>
                                    <div className="flex items-center gap-1">
                                      <Progress value={rate} className="w-12 h-1" />
                                      <span className="text-white w-8 text-right">{rate}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {behaviorPatterns.map((pattern, index) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-black/40 border-primary/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" />
                            {pattern.name}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {pattern.userCount.toLocaleString()} users • {pattern.frequency}% frequency
                          </CardDescription>
                        </div>
                        <Badge
                          className={`${
                            pattern.impact === "high"
                              ? "bg-red-500/20 text-red-400"
                              : pattern.impact === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {pattern.impact} impact
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-300">{pattern.description}</p>

                        {/* Correlation Metrics */}
                        <div>
                          <h4 className="text-white font-medium mb-3">Impact Correlation</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Retention</span>
                              <div className="flex items-center gap-2">
                                <Progress value={pattern.correlation.retention * 100} className="w-20 h-2" />
                                <span className="text-green-400 font-bold">
                                  {(pattern.correlation.retention * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Revenue</span>
                              <div className="flex items-center gap-2">
                                <Progress value={pattern.correlation.revenue * 100} className="w-20 h-2" />
                                <span className="text-blue-400 font-bold">
                                  {(pattern.correlation.revenue * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Engagement</span>
                              <div className="flex items-center gap-2">
                                <Progress value={pattern.correlation.engagement * 100} className="w-20 h-2" />
                                <span className="text-purple-400 font-bold">
                                  {(pattern.correlation.engagement * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actionable Insights */}
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <h4 className="text-primary font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Actionable Insights
                          </h4>
                          <ul className="space-y-1">
                            {pattern.actionableInsights.map((insight, idx) => (
                              <li key={idx} className="text-primary/80 text-sm">
                                • {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI-Generated Insights */}
              <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Machine learning powered discoveries and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Lightbulb className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-purple-100 text-sm">{insight}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                {(Math.random() * 20 + 80).toFixed(0)}% confidence
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">High impact</Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strategic Recommendations */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Strategic Recommendations
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Prioritized action items based on data analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations
                      .sort((a, b) => a.priority - b.priority)
                      .map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border border-primary/20 bg-black/20"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                {rec.priority}
                              </div>
                              <h4 className="text-white font-medium">{rec.category}</h4>
                            </div>
                            <div className="flex gap-2">
                              <Badge
                                className={`text-xs ${
                                  rec.impact === "high"
                                    ? "bg-red-500/20 text-red-400"
                                    : rec.impact === "medium"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-green-500/20 text-green-400"
                                }`}
                              >
                                {rec.impact} impact
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  rec.effort === "high"
                                    ? "bg-red-500/20 text-red-400"
                                    : rec.effort === "medium"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-green-500/20 text-green-400"
                                }`}
                              >
                                {rec.effort} effort
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm">{rec.recommendation}</p>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Predictive Analytics */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Predictive Analytics Preview
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered predictions for user behavior and business metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      metric: "Churn Risk",
                      current: "6.2%",
                      predicted: "4.8%",
                      confidence: 87,
                      trend: "improving",
                    },
                    {
                      metric: "Revenue Growth",
                      current: "$195K",
                      predicted: "$245K",
                      confidence: 92,
                      trend: "growth",
                    },
                    {
                      metric: "User Acquisition",
                      current: "1,247",
                      predicted: "1,580",
                      confidence: 78,
                      trend: "growth",
                    },
                    {
                      metric: "Conversion Rate",
                      current: "8.7%",
                      predicted: "10.2%",
                      confidence: 85,
                      trend: "improving",
                    },
                  ].map((prediction, index) => (
                    <motion.div
                      key={prediction.metric}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30"
                    >
                      <div className="text-center">
                        <h4 className="text-white font-medium text-sm mb-2">{prediction.metric}</h4>
                        <div className="text-2xl font-bold text-blue-400 mb-1">{prediction.predicted}</div>
                        <div className="text-gray-400 text-xs mb-2">from {prediction.current}</div>
                        <Progress value={prediction.confidence} className="h-1 mb-2" />
                        <div className="text-xs text-blue-300">{prediction.confidence}% confidence</div>
                      </div>
                    </motion.div>
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
