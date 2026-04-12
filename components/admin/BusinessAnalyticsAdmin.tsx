"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  Target, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  MousePointer,
  Zap,
  Award,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  MessageSquare,
  Gift,
  Database,
  Smartphone
} from "lucide-react"

// Import our analytics data (same as before but integrated into admin)
const mockRealtimeData = {
  activeUsers: 1247,
  pageViewsLast5Min: 89,
  conversionsLast5Min: 12,
  systemAlerts: 3,
  securityThreats: 1,
  communityActivity: 45,
  topPages: [
    { page: '/', activeUsers: 234 },
    { page: '/dashboard', activeUsers: 189 },
    { page: '/pricing', activeUsers: 156 },
    { page: '/community', activeUsers: 134 },
    { page: '/backtesting', activeUsers: 98 }
  ],
  topCountries: [
    { country: 'United States', activeUsers: 498 },
    { country: 'United Kingdom', activeUsers: 249 },
    { country: 'Canada', activeUsers: 187 },
    { country: 'Germany', activeUsers: 125 },
    { country: 'Australia', activeUsers: 100 }
  ]
}

const mockBusinessMetrics = {
  period: 'last_30_days',
  totalRevenue: 247680,
  monthlyRecurringRevenue: 189450,
  totalUsers: 12456,
  activeUsers: 8934,
  newUsers: 1567,
  customerLifetimeValue: 2450,
  customerAcquisitionCost: 125,
  churnRate: 0.045,
  retentionRate: 0.955,
  conversionRates: {
    signup: 12.4,
    trial: 34.7,
    paid: 18.9,
    premium: 8.3
  },
  referralStats: {
    totalReferrals: 4523,
    activeReferrers: 892,
    referralRevenue: 45680,
    conversionRate: 23.4
  }
}

const mockSecurityStats = {
  threatLevel: 'low',
  blockedAttacks: 156,
  securityScore: 94,
  activeThreats: 1,
  last24Hours: {
    rateLimits: 23,
    bruteForce: 5,
    xssAttempts: 12,
    sqlInjection: 3
  }
}

const mockCommunityStats = {
  totalPosts: 12456,
  activeModerators: 8,
  reportedContent: 3,
  communityHealth: 92,
  engagementRate: 78.5,
  newMembers24h: 45
}

const mockRevenueData = [
  { month: 'Jan', revenue: 185000, mrr: 165000, referralRevenue: 18500 },
  { month: 'Feb', revenue: 198000, mrr: 178000, referralRevenue: 19800 },
  { month: 'Mar', revenue: 212000, mrr: 189000, referralRevenue: 21200 },
  { month: 'Apr', revenue: 234000, mrr: 198000, referralRevenue: 23400 },
  { month: 'May', revenue: 247000, mrr: 215000, referralRevenue: 24700 },
  { month: 'Jun', revenue: 268000, mrr: 231000, referralRevenue: 26800 }
]

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884D8']

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value)
}

export default function BusinessAnalyticsAdmin() {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1500)
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Business Analytics Command Center
          </h1>
          <p className="text-gray-400">
            Centralized business intelligence, monitoring, and management dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48 bg-gray-900 border-gray-700">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Critical Alerts Bar */}
      {(mockSecurityStats.activeThreats > 0 || mockCommunityStats.reportedContent > 0) && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Admin Attention Required</span>
          </div>
          <div className="flex gap-6 text-sm">
            {mockSecurityStats.activeThreats > 0 && (
              <span>🔒 {mockSecurityStats.activeThreats} active security threat(s)</span>
            )}
            {mockCommunityStats.reportedContent > 0 && (
              <span>👥 {mockCommunityStats.reportedContent} content report(s) pending</span>
            )}
          </div>
        </div>
      )}

      {/* Real-time Admin Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Users</p>
                <p className="text-xl font-bold text-green-400">{formatNumber(mockRealtimeData.activeUsers)}</p>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12%
                </div>
              </div>
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Revenue (30d)</p>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(mockBusinessMetrics.totalRevenue)}</p>
                <div className="flex items-center text-xs text-blue-400 mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +18%
                </div>
              </div>
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Security Score</p>
                <p className="text-xl font-bold text-cyan-400">{mockSecurityStats.securityScore}/100</p>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Secure
                </div>
              </div>
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Community</p>
                <p className="text-xl font-bold text-purple-400">{formatNumber(mockCommunityStats.totalPosts)}</p>
                <div className="flex items-center text-xs text-purple-400 mt-1">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Posts
                </div>
              </div>
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Referrals</p>
                <p className="text-xl font-bold text-amber-400">{formatNumber(mockBusinessMetrics.referralStats.totalReferrals)}</p>
                <div className="flex items-center text-xs text-amber-400 mt-1">
                  <Gift className="w-3 h-3 mr-1" />
                  Total
                </div>
              </div>
              <Gift className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Updated</p>
                <p className="text-sm font-medium">{lastUpdated.toLocaleTimeString()}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Live
                </div>
              </div>
              <Database className="w-6 h-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-gray-900">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Key Business Metrics */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(mockBusinessMetrics.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">MRR</span>
                  <span className="font-semibold">
                    {formatCurrency(mockBusinessMetrics.monthlyRecurringRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Referral Revenue</span>
                  <span className="font-semibold text-amber-400">
                    {formatCurrency(mockBusinessMetrics.referralStats.referralRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">LTV : CAC Ratio</span>
                  <span className="font-semibold text-cyan-400">
                    {(mockBusinessMetrics.customerLifetimeValue / mockBusinessMetrics.customerAcquisitionCost).toFixed(1)}:1
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* User Metrics */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  User Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-xl font-bold text-blue-400">
                    {formatNumber(mockBusinessMetrics.totalUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Users</span>
                  <span className="font-semibold">
                    {formatNumber(mockBusinessMetrics.activeUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">New Users (30d)</span>
                  <span className="font-semibold">
                    {formatNumber(mockBusinessMetrics.newUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Retention Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-400">
                      {formatPercentage(mockBusinessMetrics.retentionRate * 100)}
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Security Score</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">{mockSecurityStats.securityScore}/100</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Community Health</span>
                  <span className="font-semibold text-purple-400">
                    {mockCommunityStats.communityHealth}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Threats</span>
                  <span className={`font-semibold ${mockSecurityStats.activeThreats > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {mockSecurityStats.activeThreats}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Uptime</span>
                  <span className="font-semibold text-green-400">99.9%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-700">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <span>View Reports</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-700">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              <span>Manage Community</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-amber-900/20 hover:bg-amber-900/30 border border-amber-700">
              <Gift className="w-6 h-6 text-amber-400" />
              <span>Referral Console</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-cyan-900/20 hover:bg-cyan-900/30 border border-cyan-700">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span>Security Center</span>
            </Button>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Comprehensive revenue tracking and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [formatCurrency(typeof value === 'number' ? value : parseFloat(value as string) || 0), '']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Total Revenue"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mrr" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="MRR"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="referralRevenue" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        name="Referral Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">+18.4%</div>
                    <p className="text-gray-400 text-sm">Month over month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">ARPU</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">$89</div>
                    <p className="text-gray-400 text-sm">Average revenue per user</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400 mb-2">4.5%</div>
                    <p className="text-gray-400 text-sm">Monthly churn rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">LTV:CAC</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">19.6:1</div>
                    <p className="text-gray-400 text-sm">Lifetime value ratio</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>User Segmentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div>
                      <div className="font-semibold">Premium Users</div>
                      <div className="text-sm text-gray-400">High-value subscribers</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-400">2,341</div>
                      <div className="text-sm text-gray-400">18.8%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div>
                      <div className="font-semibold">Active Traders</div>
                      <div className="text-sm text-gray-400">Regular platform users</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">6,789</div>
                      <div className="text-sm text-gray-400">54.5%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div>
                      <div className="font-semibold">New Users</div>
                      <div className="text-sm text-gray-400">Recently registered</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-400">3,326</div>
                      <div className="text-sm text-gray-400">26.7%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockRealtimeData.topCountries}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ country, activeUsers, percent }) => `${country}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="activeUsers"
                      >
                        {mockRealtimeData.topCountries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs would continue similarly with integrated admin features... */}
        <TabsContent value="security">
          <div className="text-center py-12 text-gray-400">
            🔒 Security monitoring dashboard will be integrated here
            <br />
            <small>Threat analytics, security scores, and monitoring tools</small>
          </div>
        </TabsContent>

        <TabsContent value="community">
          <div className="text-center py-12 text-gray-400">
            👥 Community management dashboard will be integrated here
            <br />
            <small>User moderation, content management, and engagement tools</small>
          </div>
        </TabsContent>

        <TabsContent value="referrals">
          <div className="text-center py-12 text-gray-400">
            🎁 Referral management dashboard will be integrated here
            <br />
            <small>Referral tracking, payouts, and performance analytics</small>
          </div>
        </TabsContent>

        <TabsContent value="realtime">
          <div className="text-center py-12 text-gray-400">
            ⚡ Real-time monitoring dashboard will be integrated here
            <br />
            <small>Live user activity, system performance, and alerts</small>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
