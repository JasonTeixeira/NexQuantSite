"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  DollarSign,
  TestTube,
  Users,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Target,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { toast } from "sonner"

interface StrategyUsageStats {
  period: string
  totalRevenue: number
  totalTests: number
  totalUsers: number
  avgRevenuePerTest: number
  avgRevenuePerUser: number
  testTypes: {
    backtest: { count: number; revenue: number }
    live_test: { count: number; revenue: number }
    optimization: { count: number; revenue: number }
    monte_carlo: { count: number; revenue: number }
    stress_test: { count: number; revenue: number }
  }
  topStrategies: Array<{
    name: string
    tests: number
    revenue: number
    avgCost: number
  }>
  revenueByDay: Array<{
    date: string
    revenue: number
    tests: number
  }>
  userActivity: Array<{
    userId: string
    username: string
    tests: number
    revenue: number
    lastActive: string
  }>
}

export default function StrategyTestingAnalytics() {
  const [stats, setStats] = useState<StrategyUsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days")
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      // Mock data - in production, fetch from your analytics API
      const mockStats: StrategyUsageStats = {
        period: selectedPeriod,
        totalRevenue: 2847.62,
        totalTests: 18420,
        totalUsers: 456,
        avgRevenuePerTest: 0.15,
        avgRevenuePerUser: 6.24,
        testTypes: {
          backtest: { count: 12500, revenue: 1250.50 },
          live_test: { count: 3200, revenue: 960.80 },
          optimization: { count: 1800, revenue: 450.20 },
          monte_carlo: { count: 720, revenue: 108.12 },
          stress_test: { count: 200, revenue: 78.00 }
        },
        topStrategies: [
          { name: "AI Momentum Strategy", tests: 2340, revenue: 468.75, avgCost: 0.20 },
          { name: "Mean Reversion Pro", tests: 1890, revenue: 283.50, avgCost: 0.15 },
          { name: "Volatility Breakout", tests: 1560, revenue: 312.25, avgCost: 0.20 },
          { name: "Trend Following V2", tests: 1200, revenue: 180.80, avgCost: 0.15 },
          { name: "Scalping Algorithm", tests: 980, revenue: 147.20, avgCost: 0.15 }
        ],
        revenueByDay: generateMockDailyData(),
        userActivity: [
          { userId: "user_1", username: "ProTrader123", tests: 45, revenue: 9.75, lastActive: "2024-01-20 14:30" },
          { userId: "user_2", username: "AlgoMaster", tests: 38, revenue: 11.40, lastActive: "2024-01-20 13:45" },
          { userId: "user_3", username: "QuantWizard", tests: 29, revenue: 8.70, lastActive: "2024-01-20 12:15" },
          { userId: "user_4", username: "TradeBot", tests: 56, revenue: 14.20, lastActive: "2024-01-20 11:30" },
          { userId: "user_5", username: "AIStrategist", tests: 42, revenue: 12.60, lastActive: "2024-01-20 10:45" }
        ]
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setStats(mockStats)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    if (!stats) return
    
    const exportData = {
      summary: {
        period: stats.period,
        totalRevenue: stats.totalRevenue,
        totalTests: stats.totalTests,
        totalUsers: stats.totalUsers
      },
      testTypes: stats.testTypes,
      topStrategies: stats.topStrategies,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `strategy-testing-analytics-${selectedPeriod}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Analytics data exported')
  }

  if (isLoading || !stats) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  const testTypeData = Object.entries(stats.testTypes).map(([type, data]) => ({
    name: type.replace('_', ' ').toUpperCase(),
    tests: data.count,
    revenue: data.revenue,
    fill: getTestTypeColor(type)
  }))

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Strategy Testing Analytics</h1>
          <p className="text-gray-400">Revenue and usage analytics for pay-per-use strategy testing</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tests</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalTests.toLocaleString()}</p>
              </div>
              <TestTube className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-purple-400">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg per Test</p>
                <p className="text-2xl font-bold text-yellow-400">${stats.avgRevenuePerTest.toFixed(2)}</p>
              </div>
              <Target className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg per User</p>
                <p className="text-2xl font-bold text-pink-400">${stats.avgRevenuePerUser.toFixed(2)}</p>
              </div>
              <Activity className="w-8 h-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-types">Test Types</TabsTrigger>
          <TabsTrigger value="strategies">Top Strategies</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Trend */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F9FAFB' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Revenue ($)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tests" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Tests"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-types" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Types Pie Chart */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Test Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={testTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="tests"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {testTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Test Types Revenue */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Revenue by Test Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.testTypes).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: getTestTypeColor(type) }}
                        />
                        <span className="text-white capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">${data.revenue.toFixed(2)}</div>
                        <div className="text-gray-400 text-sm">{data.count} tests</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topStrategies.map((strategy, index) => (
                  <div key={strategy.name} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{strategy.name}</h3>
                        <p className="text-gray-400 text-sm">{strategy.tests} tests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">${strategy.revenue.toFixed(2)}</div>
                      <div className="text-gray-400 text-sm">Avg: ${strategy.avgCost.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Top Users by Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.userActivity.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{user.username}</h3>
                        <p className="text-gray-400 text-sm">Last active: {user.lastActive}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">${user.revenue.toFixed(2)}</div>
                      <div className="text-gray-400 text-sm">{user.tests} tests</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-center text-gray-500 text-sm">
        Last updated: {lastUpdated.toLocaleString()}
      </div>
    </div>
  )
}

// Helper Functions
function generateMockDailyData() {
  const data = []
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.random() * 150 + 50,
      tests: Math.floor(Math.random() * 800 + 200)
    })
  }
  
  return data
}

function getTestTypeColor(type: string): string {
  const colors = {
    backtest: '#10B981',
    live_test: '#3B82F6',
    optimization: '#F59E0B',
    monte_carlo: '#EF4444',
    stress_test: '#8B5CF6'
  }
  return colors[type as keyof typeof colors] || '#6B7280'
}
