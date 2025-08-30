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
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Settings,
} from "lucide-react"
import { biEngine } from "@/lib/business-intelligence-engine"
import { toast } from "sonner"

export default function BusinessIntelligenceDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedMetricCategory, setSelectedMetricCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "predictive">("overview")

  // State for data
  const [kpis, setKpis] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [dashboards, setDashboards] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [executiveSummary, setExecutiveSummary] = useState<any>(null)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [kpisData, insightsData, dashboardsData, reportsData, modelsData, summaryData] = await Promise.all([
        biEngine.getKPIs(),
        biEngine.getInsights(),
        biEngine.getDashboards(),
        biEngine.getReports(),
        biEngine.getModels(),
        biEngine.getExecutiveSummary(),
      ])

      setKpis(kpisData)
      setInsights(insightsData)
      setDashboards(dashboardsData)
      setReports(reportsData)
      setModels(modelsData)
      setExecutiveSummary(summaryData)
    } catch (error) {
      console.error("Error loading BI data:", error)
      toast.error("Failed to load business intelligence data")
    }
  }

  const filteredKpis = useMemo(() => {
    if (selectedMetricCategory === "all") return kpis
    return kpis.filter((kpi) => kpi.category === selectedMetricCategory)
  }, [kpis, selectedMetricCategory])

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
    await loadData()
    setLastUpdated(new Date())
    setIsLoading(false)
    toast.success("Business intelligence data refreshed")
  }

  const getMetricIcon = (category: string) => {
    switch (category) {
      case "financial":
        return <DollarSign className="w-5 h-5" />
      case "customer":
        return <Users className="w-5 h-5" />
      case "operational":
        return <Activity className="w-5 h-5" />
      case "product":
        return <Target className="w-5 h-5" />
      case "marketing":
        return <BarChart3 className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  const getMetricColor = (category: string) => {
    switch (category) {
      case "financial":
        return "text-green-400"
      case "customer":
        return "text-blue-400"
      case "operational":
        return "text-purple-400"
      case "product":
        return "text-yellow-400"
      case "marketing":
        return "text-pink-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  // Mock real-time data updates
  const realTimeMetrics = [
    { label: "Revenue/Hour", value: "$12.4K", change: "+$1.2K", trend: "up" },
    { label: "Active Users", value: "8,247", change: "+156", trend: "up" },
    { label: "Conversion Rate", value: "8.7%", change: "+0.3%", trend: "up" },
    { label: "System Load", value: "67%", change: "-5%", trend: "down" },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Brain className="w-10 h-10 mr-4 text-primary" />
              BUSINESS <span className="text-primary ml-2">INTELLIGENCE</span>
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

        {/* Executive Summary Cards */}
        {executiveSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm">Total Revenue</p>
                      <p className="text-3xl font-bold text-white">
                        ${executiveSummary.overview.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-green-400 text-sm">+12.5% growth</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white">
                        {executiveSummary.overview.totalUsers.toLocaleString()}
                      </p>
                      <p className="text-blue-400 text-sm">+8.3% growth</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Users className="h-8 w-8 text-blue-400" />
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
                      <p className="text-purple-300 text-sm">Growth Rate</p>
                      <p className="text-3xl font-bold text-white">
                        {executiveSummary.overview.growthRate.toFixed(1)}%
                      </p>
                      <p className="text-purple-400 text-sm">Above target</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-purple-400" />
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
                      <p className="text-yellow-300 text-sm">Profit Margin</p>
                      <p className="text-3xl font-bold text-white">
                        {executiveSummary.overview.profitMargin.toFixed(1)}%
                      </p>
                      <p className="text-yellow-400 text-sm">Healthy margin</p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Target className="h-8 w-8 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Main BI Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="kpis" className="data-[state=active]:bg-primary">
              KPIs
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary">
              Insights
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="data-[state=active]:bg-primary">
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary">
              Reports
            </TabsTrigger>
            <TabsTrigger value="predictive" className="data-[state=active]:bg-primary">
              Predictive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {executiveSummary?.keyMetrics.slice(0, 6).map((metric: any, index: number) => (
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
                        <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-end justify-between">
                          <div className="text-3xl font-bold text-white">
                            {typeof metric.value === "number" && metric.value > 1000
                              ? metric.value.toLocaleString()
                              : metric.value}
                            {metric.category === "financial" && "$"}
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
                          {metric.target && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Target</span>
                              <span className="text-primary">{metric.target}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Period</span>
                            <span className="text-gray-300">{metric.period}</span>
                          </div>
                        </div>

                        {metric.target && <Progress value={(metric.value / metric.target) * 100} className="h-2" />}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Critical Insights */}
            <Card className="bg-black/40 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Critical Insights Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executiveSummary?.criticalInsights.map((insight: any) => (
                    <div key={insight.id} className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{insight.title}</h4>
                        <Badge className={getPriorityColor(insight.priority)}>{insight.priority}</Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                        <span>Impact: {insight.impact}</span>
                        <span>Type: {insight.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            {/* KPI Filters */}
            <div className="flex items-center gap-4">
              <Select value={selectedMetricCategory} onValueChange={setSelectedMetricCategory}>
                <SelectTrigger className="w-[200px] bg-white/10 border-primary/30 text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-primary/30">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKpis.map((kpi, index) => (
                <motion.div
                  key={kpi.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`${getMetricColor(kpi.category)}`}>{getMetricIcon(kpi.category)}</div>
                          <CardTitle className="text-lg text-white">{kpi.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(kpi.status)}>{kpi.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-end justify-between">
                          <div className="text-3xl font-bold text-white">
                            {typeof kpi.value === "number" && kpi.value > 1000 ? kpi.value.toLocaleString() : kpi.value}
                            {kpi.unit === "USD" && "$"}
                            {kpi.unit === "percent" && "%"}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              kpi.changePercent > 0
                                ? "text-green-400"
                                : kpi.changePercent < 0
                                  ? "text-red-400"
                                  : "text-gray-400"
                            }`}
                          >
                            {kpi.changePercent > 0 ? "+" : ""}
                            {kpi.changePercent.toFixed(1)}%
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm">{kpi.description}</p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Target</span>
                            <span className="text-primary">
                              {kpi.target}
                              {kpi.unit === "USD" && "$"}
                              {kpi.unit === "percent" && "%"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Period</span>
                            <span className="text-gray-300">{kpi.period}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Last Updated</span>
                            <span className="text-gray-300">{new Date(kpi.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
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
                    {insights.slice(0, 5).map((insight, index) => (
                      <motion.div
                        key={insight.id}
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
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white font-medium">{insight.title}</h4>
                              <Badge className={getPriorityColor(insight.priority)}>{insight.priority}</Badge>
                            </div>
                            <p className="text-purple-100 text-sm mb-2">{insight.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                {(insight.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">{insight.impact} impact</Badge>
                              <Badge className="bg-green-500/20 text-green-400 text-xs">{insight.type}</Badge>
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
                    {insights
                      .filter((i) => i.type === "recommendation")
                      .slice(0, 5)
                      .map((rec, index) => (
                        <motion.div
                          key={rec.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border border-primary/20 bg-black/20"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                {index + 1}
                              </div>
                              <h4 className="text-white font-medium">{rec.title}</h4>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
                          {rec.actions && rec.actions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-gray-400 text-xs font-medium">Recommended Actions:</p>
                              <ul className="space-y-1">
                                {rec.actions.slice(0, 3).map((action: string, actionIndex: number) => (
                                  <li key={actionIndex} className="text-gray-300 text-xs flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboards" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Custom Dashboards</h3>
              <Button className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                <Settings className="w-4 h-4 mr-2" />
                Create Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{dashboard.name}</CardTitle>
                        {dashboard.isDefault && (
                          <Badge className="bg-primary/20 text-primary border-primary/30">Default</Badge>
                        )}
                      </div>
                      <CardDescription className="text-gray-400">{dashboard.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Widgets</span>
                          <span className="text-white">{dashboard.widgets.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Category</span>
                          <span className="text-white capitalize">{dashboard.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Last Updated</span>
                          <span className="text-white">{new Date(dashboard.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Refresh Rate</span>
                          <span className="text-white">{Math.floor(dashboard.refreshInterval / 1000)}s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Analytics Reports</h3>
              <Button className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                <FileText className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{report.name}</CardTitle>
                        <Badge
                          className={
                            report.status === "active"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : report.status === "paused"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-400">{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Type</span>
                          <span className="text-white capitalize">{report.type}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Format</span>
                          <span className="text-white uppercase">{report.format}</span>
                        </div>
                        {report.schedule && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Frequency</span>
                            <span className="text-white capitalize">{report.schedule.frequency}</span>
                          </div>
                        )}
                        {report.lastGenerated && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Last Generated</span>
                            <span className="text-white">{new Date(report.lastGenerated).toLocaleDateString()}</span>
                          </div>
                        )}
                        {report.nextGeneration && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Next Generation</span>
                            <span className="text-white">{new Date(report.nextGeneration).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Predictive Models */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Predictive Models
                  </CardTitle>
                  <CardDescription className="text-gray-400">AI models for forecasting and prediction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {models.map((model, index) => (
                      <motion.div
                        key={model.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-primary/20 bg-black/20"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">{model.name}</h4>
                            <p className="text-gray-400 text-sm">{model.description}</p>
                          </div>
                          <Badge
                            className={
                              model.status === "ready"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : model.status === "training"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                            }
                          >
                            {model.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white ml-2 capitalize">{model.type}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Algorithm:</span>
                            <span className="text-white ml-2">{model.algorithm}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Accuracy:</span>
                            <span className="text-green-400 ml-2 font-medium">
                              {(model.accuracy * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Last Trained:</span>
                            <span className="text-white ml-2">{new Date(model.lastTrained).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                          {model.status === "ready" && (
                            <Button size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary">
                              <Brain className="w-3 h-3 mr-1" />
                              Predict
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Predictions Preview */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Predictive Analytics Preview
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    AI-powered predictions for business metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {executiveSummary &&
                      [
                        {
                          metric: "Revenue (Next 30 Days)",
                          current: `$${executiveSummary.overview.totalRevenue.toLocaleString()}`,
                          predicted: `$${executiveSummary.predictions.revenueNext30Days.toLocaleString()}`,
                          confidence: 92,
                          trend: "growth",
                        },
                        {
                          metric: "User Growth (Next 30 Days)",
                          current: executiveSummary.overview.totalUsers.toLocaleString(),
                          predicted: `+${executiveSummary.predictions.userGrowthNext30Days.toLocaleString()}`,
                          confidence: 78,
                          trend: "growth",
                        },
                        {
                          metric: "Churn Risk Users",
                          current: "Current Risk",
                          predicted: executiveSummary.predictions.churnRiskUsers.toLocaleString(),
                          confidence: 85,
                          trend: "warning",
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
