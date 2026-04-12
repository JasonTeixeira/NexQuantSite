"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, TrendingUp, DollarSign, Activity, AlertTriangle, Zap, BarChart3, Shield, Server, 
  Bell, Settings, Calendar, Download, RefreshCw, Eye, EyeOff, Globe, Smartphone,
  Filter, Clock, Target, Brain, TrendingDown, ArrowUpRight, ArrowDownRight, Mail
} from "lucide-react"
import { toast } from "sonner"
import NewsletterManagement from "./NewsletterManagement"

export default function AdminDashboardClient() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [activeTab, setActiveTab] = useState("overview")

  const stats = {
    totalUsers: 12450,
    activeUsers: 8920,
    newUsers: 342,
    totalRevenue: 485720,
    monthlyRecurringRevenue: 125000,
    conversionRate: 3.2,
    churnRate: 2.1,
    averageOrderValue: 89.5,
    customerSatisfaction: 4.8,
    totalOrders: 5420,
    pendingOrders: 23,
    completedOrders: 5397
  }

  const systemHealth = {
    status: "healthy",
    uptime: "99.9%",
    responseTime: "145ms", 
    errorRate: "0.02%",
    backupStatus: "completed",
    activeConnections: 1247,
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 32
  }

  const notifications = [
    { id: 1, type: "warning", message: "High CPU usage detected", time: "2 min ago" },
    { id: 2, type: "info", message: "Daily backup completed", time: "1 hour ago" },
    { id: 3, type: "success", message: "New user milestone reached", time: "3 hours ago" }
  ]

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        console.log("Updating dashboard data...")
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [realTimeUpdates])

  const handleExportData = () => {
    toast.success("Dashboard data exported successfully!")
  }

  const handleRefreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Dashboard data refreshed!")
    }, 1000)
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-start justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with NEXURAL today.</p>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
            <Badge className={`${realTimeUpdates ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {realTimeUpdates ? 'Real-time Updates' : 'Manual Updates'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24H</SelectItem>
              <SelectItem value="7d">7D</SelectItem>
              <SelectItem value="30d">30D</SelectItem>
              <SelectItem value="90d">90D</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportData} className="border-gray-700 hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshData} className="border-gray-700 hover:bg-gray-800">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            className="border-gray-700 hover:bg-gray-800"
          >
            {realTimeUpdates ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {realTimeUpdates ? 'Live' : 'Manual'}
          </Button>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Mail className="w-4 h-4 mr-2" />
            Newsletter
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Performance
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-black/40 backdrop-blur-xl border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">+12.5%</span>
                      <span className="text-gray-500 text-xs">vs last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-green-500/20 hover:border-green-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.activeUsers.toLocaleString()}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">+8.2%</span>
                      <span className="text-gray-500 text-xs">vs last week</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">${stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">+15.3%</span>
                      <span className="text-gray-500 text-xs">vs last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">MRR</p>
                    <p className="text-2xl font-bold text-white mt-1">${stats.monthlyRecurringRevenue.toLocaleString()}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">+9.7%</span>
                      <span className="text-gray-500 text-xs">vs last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Conversion Rate</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={stats.conversionRate * 10} className="w-20" />
                    <span className="text-white font-medium">{stats.conversionRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Churn Rate</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={stats.churnRate * 10} className="w-20" />
                    <span className="text-white font-medium">{stats.churnRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Avg Order Value</span>
                  <span className="text-white font-medium">${stats.averageOrderValue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Customer Satisfaction</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={stats.customerSatisfaction * 20} className="w-20" />
                    <span className="text-white font-medium">{stats.customerSatisfaction}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'warning' ? 'bg-yellow-400' :
                      notification.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white text-sm">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.newUsers}</div>
                <p className="text-gray-400">New users this week</p>
                <div className="mt-4">
                  <Progress value={75} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Order Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Orders</span>
                    <span className="text-white">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Completed</span>
                    <span className="text-green-400">{stats.completedOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending</span>
                    <span className="text-yellow-400">{stats.pendingOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ${(stats.totalRevenue / 1000).toFixed(0)}K
                </div>
                <p className="text-gray-400">Total revenue</p>
                <div className="mt-4 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">+15.3% growth</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card className="bg-black/40 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{systemHealth.uptime}</div>
                  <p className="text-gray-400">Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{systemHealth.responseTime}</div>
                  <p className="text-gray-400">Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{systemHealth.errorRate}</div>
                  <p className="text-gray-400">Error Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6 mt-6">
          <Card className="bg-black/40 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Server className="w-5 h-5 mr-2" />
                System Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">CPU Usage</span>
                <div className="flex items-center space-x-2">
                  <Progress value={systemHealth.cpuUsage} className="w-32" />
                  <span className="text-white font-medium">{systemHealth.cpuUsage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Memory Usage</span>
                <div className="flex items-center space-x-2">
                  <Progress value={systemHealth.memoryUsage} className="w-32" />
                  <span className="text-white font-medium">{systemHealth.memoryUsage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Disk Usage</span>
                <div className="flex items-center space-x-2">
                  <Progress value={systemHealth.diskUsage} className="w-32" />
                  <span className="text-white font-medium">{systemHealth.diskUsage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Active Connections</span>
                <span className="text-white font-medium">{systemHealth.activeConnections}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-6 mt-6">
          <NewsletterManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
