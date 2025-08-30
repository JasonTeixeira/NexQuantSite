"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChartIcon as PieIcon,
  LineChart,
  FileText,
  RefreshCw,
  Target,
  CheckCircle,
  Activity,
  Zap,
} from "lucide-react"
import {
  ResponsiveContainer,
  Line,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts"
import { financialEngine, type FinancialMetrics, type ProfitLossStatement } from "@/lib/financial-reporting-engine"

// Mock financial data
const revenueData = [
  { month: "Jan", revenue: 285000, expenses: 185000, profit: 100000, forecast: 290000 },
  { month: "Feb", revenue: 312000, expenses: 195000, profit: 117000, forecast: 315000 },
  { month: "Mar", revenue: 298000, expenses: 188000, profit: 110000, forecast: 305000 },
  { month: "Apr", revenue: 345000, expenses: 205000, profit: 140000, forecast: 350000 },
  { month: "May", revenue: 378000, expenses: 218000, profit: 160000, forecast: 380000 },
  { month: "Jun", revenue: 395000, expenses: 225000, profit: 170000, forecast: 400000 },
]

const cashFlowData = [
  { month: "Jan", operating: 95000, investing: -15000, financing: 25000, free: 80000 },
  { month: "Feb", operating: 105000, investing: -18000, financing: 30000, free: 87000 },
  { month: "Mar", operating: 98000, investing: -12000, financing: 20000, free: 86000 },
  { month: "Apr", revenue: 125000, investing: -25000, financing: 35000, free: 100000 },
  { month: "May", operating: 135000, investing: -20000, financing: 40000, free: 115000 },
  { month: "Jun", operating: 145000, investing: -22000, financing: 45000, free: 123000 },
]

const expenseBreakdown = [
  { category: "Personnel", amount: 95000, percentage: 42, color: "#3B82F6" },
  { category: "Infrastructure", amount: 35000, percentage: 16, color: "#10B981" },
  { category: "Marketing", amount: 28000, percentage: 12, color: "#F59E0B" },
  { category: "Data & Feeds", amount: 25000, percentage: 11, color: "#EF4444" },
  { category: "Operations", amount: 22000, percentage: 10, color: "#8B5CF6" },
  { category: "Other", amount: 20000, percentage: 9, color: "#6B7280" },
]

const revenueStreams = [
  { stream: "Premium Subscriptions", amount: 180000, growth: 15.2, color: "#3B82F6" },
  { stream: "Enterprise Plans", amount: 85000, growth: 22.8, color: "#10B981" },
  { stream: "Trading Commissions", amount: 65000, growth: 8.5, color: "#F59E0B" },
  { stream: "API Access", amount: 35000, growth: 45.3, color: "#EF4444" },
  { stream: "Data Services", amount: 30000, growth: 12.1, color: "#8B5CF6" },
]

const kpiMetrics = [
  {
    title: "Annual Recurring Revenue",
    value: "$4.2M",
    change: "+18.5%",
    trend: "up",
    target: "$5M",
    progress: 84,
    status: "good",
  },
  {
    title: "Monthly Recurring Revenue",
    value: "$350K",
    change: "+12.3%",
    trend: "up",
    target: "$400K",
    progress: 87.5,
    status: "good",
  },
  {
    title: "Customer Acquisition Cost",
    value: "$125",
    change: "-8.2%",
    trend: "down",
    target: "$100",
    progress: 80,
    status: "warning",
  },
  {
    title: "Lifetime Value",
    value: "$2,850",
    change: "+15.7%",
    trend: "up",
    target: "$3,000",
    progress: 95,
    status: "good",
  },
  {
    title: "Gross Margin",
    value: "78.5%",
    change: "+2.1%",
    trend: "up",
    target: "80%",
    progress: 98.1,
    status: "good",
  },
  {
    title: "Burn Rate",
    value: "$85K",
    change: "-5.3%",
    trend: "down",
    target: "$75K",
    progress: 88.2,
    status: "warning",
  },
]

export default function AdvancedFinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedView, setSelectedView] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null)
  const [plStatement, setPlStatement] = useState<ProfitLossStatement | null>(null)

  useEffect(() => {
    loadFinancialData()
  }, [selectedPeriod])

  const loadFinancialData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, these would be actual API calls
      const kpis = await financialEngine.calculateKPIs()
      const statement = await financialEngine.generatePLStatement(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date(),
        "monthly",
      )
      
      // Mock metrics data since getCurrentMetrics is private
      const metrics: FinancialMetrics = {
        revenue: { 
          total: 290000, 
          recurring: 240000, 
          oneTime: 50000,
          growth: 15.2,
          forecast: 320000
        },
        expenses: { 
          total: 185000, 
          operational: 120000, 
          marketing: 35000,
          personnel: 95000,
          infrastructure: 30000
        },
        profitability: {
          grossProfit: 225000,
          netProfit: 105000,
          ebitda: 130000,
          margins: {
            gross: 77.6,
            net: 36.2,
            operating: 44.8
          }
        },
        cashFlow: {
          operating: 145000,
          investing: -25000,
          financing: 50000,
          free: 120000
        },
        kpis
      }

      setFinancialMetrics(metrics)
      setPlStatement(statement)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load financial data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await loadFinancialData()
  }

  const exportReport = (format: string) => {
    console.log(`Exporting financial report in ${format} format`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "critical":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusBadgeColor = (status: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              FINANCIAL <span className="text-primary">INTELLIGENCE</span>
            </h1>
            <p className="text-gray-400">Advanced P&L analysis and financial performance insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-gray-300 border-gray-600">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 text-black">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                <DropdownMenuItem onClick={() => exportReport("pdf")} className="text-gray-300 hover:bg-gray-800">
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReport("excel")} className="text-gray-300 hover:bg-gray-800">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReport("csv")} className="text-gray-300 hover:bg-gray-800">
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-black/40 border-primary/30">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={selectedView} onValueChange={setSelectedView}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="revenue">Revenue Focus</SelectItem>
                    <SelectItem value="expenses">Expense Analysis</SelectItem>
                    <SelectItem value="profitability">Profitability</SelectItem>
                    <SelectItem value="cashflow">Cash Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-400">{metric.title}</CardTitle>
                    <div className={`p-1 rounded-full ${metric.trend === "up" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-white">{metric.value}</span>
                      <span
                        className={`text-sm font-medium ${metric.trend === "up" ? "text-green-400" : "text-red-400"}`}
                      >
                        {metric.change}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Target: {metric.target}</span>
                        <Badge className={getStatusBadgeColor(metric.status)}>{metric.status}</Badge>
                      </div>
                      <Progress value={metric.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Analytics */}
        <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/40 backdrop-blur-xl border-primary/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Expenses
            </TabsTrigger>
            <TabsTrigger
              value="profitability"
              className="data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              Profitability
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Cash Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Profit Trend */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-primary" />
                    Revenue vs Profit Trend
                  </CardTitle>
                  <CardDescription className="text-gray-400">Monthly performance with forecast overlay</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                        name="Profit"
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#F59E0B", strokeWidth: 2, r: 3 }}
                        name="Forecast"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieIcon className="w-5 h-5 mr-2 text-primary" />
                    Expense Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-400">Current month expense distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                        formatter={(value: any) => [formatCurrency(value), "Amount"]}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Streams Analysis */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Revenue Streams Performance
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Breakdown by revenue source with growth rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStreams.map((stream, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-primary/20"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stream.color }} />
                        <div>
                          <h4 className="font-medium text-white">{stream.stream}</h4>
                          <p className="text-sm text-gray-400">Monthly recurring</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{formatCurrency(stream.amount)}</div>
                        <div className="flex items-center text-sm">
                          <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                          <span className="text-green-400">+{formatPercentage(stream.growth)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            {/* Cash Flow Analysis */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Cash Flow Analysis
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Operating, investing, and financing cash flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                      formatter={(value: any) => [formatCurrency(value), ""]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="operating"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      name="Operating"
                    />
                    <Area
                      type="monotone"
                      dataKey="investing"
                      stackId="2"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.6}
                      name="Investing"
                    />
                    <Area
                      type="monotone"
                      dataKey="financing"
                      stackId="3"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      name="Financing"
                    />
                    <Line
                      type="monotone"
                      dataKey="free"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                      name="Free Cash Flow"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cash Flow Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Operating Cash Flow</p>
                      <p className="text-2xl font-bold text-white">$145K</p>
                      <p className="text-green-400 text-sm">+12% vs last month</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Free Cash Flow</p>
                      <p className="text-2xl font-bold text-white">$123K</p>
                      <p className="text-green-400 text-sm">+18% vs last month</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Zap className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Cash Runway</p>
                      <p className="text-2xl font-bold text-white">18 months</p>
                      <p className="text-yellow-400 text-sm">Based on current burn</p>
                    </div>
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Target className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Cash Conversion</p>
                      <p className="text-2xl font-bold text-white">85%</p>
                      <p className="text-green-400 text-sm">Excellent efficiency</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Financial Health Indicators */}
        <Card className="bg-black/40 border-primary/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Financial Health Indicators
            </CardTitle>
            <CardDescription className="text-gray-400">Key financial ratios and health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-medium">Liquidity Ratios</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Ratio</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">2.4</span>
                      <Badge className="bg-green-500/20 text-green-400">Healthy</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Quick Ratio</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">1.8</span>
                      <Badge className="bg-green-500/20 text-green-400">Good</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cash Ratio</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">0.9</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400">Fair</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Profitability Ratios</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gross Margin</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">78.5%</span>
                      <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Operating Margin</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">43.1%</span>
                      <Badge className="bg-green-500/20 text-green-400">Strong</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Net Margin</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">36.2%</span>
                      <Badge className="bg-green-500/20 text-green-400">Healthy</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Growth Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Revenue Growth</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">+18.5%</span>
                      <Badge className="bg-green-500/20 text-green-400">Strong</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Profit Growth</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">+22.3%</span>
                      <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Customer Growth</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">+15.7%</span>
                      <Badge className="bg-green-500/20 text-green-400">Good</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
