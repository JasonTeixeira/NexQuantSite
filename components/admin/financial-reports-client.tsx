"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie, // Import Pie component
} from "recharts"

// Mock financial data
const revenueData = [
  { month: "Jan", revenue: 125000, expenses: 85000, profit: 40000, subscriptions: 450, churn: 12 },
  { month: "Feb", revenue: 142000, expenses: 92000, profit: 50000, subscriptions: 520, churn: 8 },
  { month: "Mar", revenue: 138000, expenses: 88000, profit: 50000, subscriptions: 495, churn: 15 },
  { month: "Apr", revenue: 165000, expenses: 105000, profit: 60000, subscriptions: 580, churn: 10 },
  { month: "May", revenue: 178000, expenses: 112000, profit: 66000, subscriptions: 625, churn: 7 },
  { month: "Jun", revenue: 195000, expenses: 118000, profit: 77000, subscriptions: 680, churn: 9 },
]

const expenseBreakdown = [
  { category: "Personnel", amount: 65000, percentage: 55, color: "#3B82F6" },
  { category: "Infrastructure", amount: 25000, percentage: 21, color: "#10B981" },
  { category: "Marketing", amount: 15000, percentage: 13, color: "#F59E0B" },
  { category: "Operations", amount: 8000, percentage: 7, color: "#EF4444" },
  { category: "Other", amount: 5000, percentage: 4, color: "#8B5CF6" },
]

const kpiMetrics = [
  {
    title: "Monthly Recurring Revenue",
    value: "$195,000",
    change: "+12.5%",
    trend: "up",
    target: "$200,000",
    progress: 97.5,
  },
  {
    title: "Customer Acquisition Cost",
    value: "$45",
    change: "-8.2%",
    trend: "down",
    target: "$40",
    progress: 88.9,
  },
  {
    title: "Lifetime Value",
    value: "$1,250",
    change: "+15.3%",
    trend: "up",
    target: "$1,500",
    progress: 83.3,
  },
  {
    title: "Gross Margin",
    value: "72.5%",
    change: "+2.1%",
    trend: "up",
    target: "75%",
    progress: 96.7,
  },
]

const recentTransactions = [
  {
    id: "TXN-001",
    type: "subscription",
    description: "Premium Plan - Annual",
    amount: 1200,
    status: "completed",
    date: "2024-01-15T10:30:00Z",
    customer: "John Doe",
  },
  {
    id: "TXN-002",
    type: "refund",
    description: "Pro Plan Refund",
    amount: -299,
    status: "processed",
    date: "2024-01-15T09:15:00Z",
    customer: "Jane Smith",
  },
  {
    id: "TXN-003",
    type: "subscription",
    description: "Basic Plan - Monthly",
    amount: 29,
    status: "completed",
    date: "2024-01-15T08:45:00Z",
    customer: "Mike Johnson",
  },
  {
    id: "TXN-004",
    type: "upgrade",
    description: "Basic to Pro Upgrade",
    amount: 70,
    status: "pending",
    date: "2024-01-15T08:20:00Z",
    customer: "Sarah Wilson",
  },
]

export default function FinancialReportsClient() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  const exportReport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting report in ${format} format`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400"
      case "processed":
        return "bg-blue-500/20 text-blue-400"
      case "failed":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
          <p className="text-gray-400 mt-1">Comprehensive financial analytics and reporting dashboard</p>
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
              <Button className="bg-primary hover:bg-primary/80">
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
      <Card className="bg-gray-900/50 border-gray-800">
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
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="subscriptions">Subscriptions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => (
          <Card key={index} className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all">
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
                  <span className={`text-sm font-medium ${metric.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                    {metric.change}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Target: {metric.target}</span>
                    <span className="text-gray-300">{metric.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={metric.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-primary">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-primary">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="profitability" className="data-[state=active]:bg-primary">
            Profitability
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-primary">
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LineChart className="w-5 h-5 mr-2 text-primary" />
                  Revenue vs Profit Trend
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Monthly revenue and profit comparison over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={revenueData}>
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
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
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
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                Monthly Performance Summary
              </CardTitle>
              <CardDescription className="text-gray-400">Comprehensive view of key financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
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
                  <Bar dataKey="profit" fill="#10B981" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-gray-400">Latest financial transactions and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-700 rounded-lg">
                          {transaction.type === "subscription" && <Users className="w-4 h-4 text-blue-400" />}
                          {transaction.type === "refund" && <ArrowDownRight className="w-4 h-4 text-red-400" />}
                          {transaction.type === "upgrade" && <ArrowUpRight className="w-4 h-4 text-green-400" />}
                        </div>
                        <div>
                          <div className="font-medium text-white">{transaction.description}</div>
                          <div className="text-sm text-gray-400">
                            {transaction.customer} • {formatDate(transaction.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`font-bold ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                            {formatCurrency(transaction.amount)}
                          </div>
                          <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                              Download Receipt
                            </DropdownMenuItem>
                            {transaction.status === "pending" && (
                              <DropdownMenuItem className="text-yellow-400 hover:bg-gray-800">
                                Process Payment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
