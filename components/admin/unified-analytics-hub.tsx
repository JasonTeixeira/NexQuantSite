"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart,
  Treemap, RadialBarChart, RadialBar, ScatterChart, Scatter
} from "recharts"
import {
  BarChart3, Brain, TrendingUp, TrendingDown, Users, DollarSign, Target,
  Activity, Zap, Eye, Clock, RefreshCw, Download, Settings, Filter,
  Globe, Smartphone, Calendar, Award, AlertTriangle, CheckCircle,
  ArrowUp, ArrowDown, ArrowRight, Minus, PieChart as PieChartIcon, LineChart as LineChartIcon
} from "lucide-react"
import { toast } from "sonner"

interface AnalyticsMetrics {
  overview: {
    totalUsers: number
    activeUsers: number
    revenue: number
    conversions: number
    growth: {
      users: number
      revenue: number
      engagement: number
    }
  }
  userAnalytics: {
    newUsers: number
    returningUsers: number
    averageSession: number
    bounceRate: number
    usersByCountry: Array<{country: string, users: number, percentage: number}>
    usersByDevice: Array<{device: string, users: number, percentage: number}>
  }
  businessIntelligence: {
    kpis: Array<{
      name: string
      value: number
      target: number
      change: number
      trend: "up" | "down" | "stable"
      category: string
    }>
    insights: Array<{
      title: string
      description: string
      impact: "high" | "medium" | "low"
      category: string
      recommendation: string
    }>
    predictions: Array<{
      metric: string
      currentValue: number
      predictedValue: number
      confidence: number
      timeframe: string
    }>
  }
  engagement: {
    pageViews: number
    uniqueVisitors: number
    averageTimeOnSite: number
    pagesPerSession: number
    topPages: Array<{page: string, views: number, uniqueViews: number}>
    exitPages: Array<{page: string, exits: number, exitRate: number}>
  }
  conversion: {
    funnelData: Array<{
      stage: string
      users: number
      conversionRate: number
      dropOff: number
    }>
    goalCompletions: Array<{
      goal: string
      completions: number
      value: number
      conversionRate: number
    }>
  }
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export default function UnifiedAnalyticsHub() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")
  const [selectedMetricCategory, setSelectedMetricCategory] = useState("all")
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const [analytics, setAnalytics] = useState<AnalyticsMetrics>({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      revenue: 0,
      conversions: 0,
      growth: { users: 0, revenue: 0, engagement: 0 }
    },
    userAnalytics: {
      newUsers: 0,
      returningUsers: 0,
      averageSession: 0,
      bounceRate: 0,
      usersByCountry: [],
      usersByDevice: []
    },
    businessIntelligence: {
      kpis: [],
      insights: [],
      predictions: []
    },
    engagement: {
      pageViews: 0,
      uniqueVisitors: 0,
      averageTimeOnSite: 0,
      pagesPerSession: 0,
      topPages: [],
      exitPages: []
    },
    conversion: {
      funnelData: [],
      goalCompletions: []
    }
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeframe])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRealTimeEnabled) {
      interval = setInterval(() => {
        updateRealTimeMetrics()
      }, 30000) // Update every 30 seconds
    }
    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Comprehensive mock analytics data
      const mockAnalytics: AnalyticsMetrics = {
        overview: {
          totalUsers: 24567,
          activeUsers: 8934,
          revenue: 185420,
          conversions: 1256,
          growth: {
            users: 15.4,
            revenue: 23.7,
            engagement: 8.2
          }
        },
        userAnalytics: {
          newUsers: 1876,
          returningUsers: 7058,
          averageSession: 847, // seconds
          bounceRate: 32.5,
          usersByCountry: [
            { country: "United States", users: 9823, percentage: 40.0 },
            { country: "United Kingdom", users: 3689, percentage: 15.0 },
            { country: "Germany", users: 2456, percentage: 10.0 },
            { country: "Canada", users: 1967, percentage: 8.0 },
            { country: "Australia", users: 1478, percentage: 6.0 },
            { country: "Others", users: 5154, percentage: 21.0 }
          ],
          usersByDevice: [
            { device: "Desktop", users: 12284, percentage: 50.0 },
            { device: "Mobile", users: 8670, percentage: 35.3 },
            { device: "Tablet", users: 3613, percentage: 14.7 }
          ]
        },
        businessIntelligence: {
          kpis: [
            { name: "Customer Acquisition Cost", value: 45.80, target: 50.00, change: -8.4, trend: "up", category: "marketing" },
            { name: "Lifetime Value", value: 890.50, target: 850.00, change: 4.8, trend: "up", category: "revenue" },
            { name: "Monthly Recurring Revenue", value: 142800, target: 140000, change: 2.0, trend: "up", category: "revenue" },
            { name: "Churn Rate", value: 3.2, target: 5.0, change: -0.8, trend: "up", category: "retention" },
            { name: "Net Promoter Score", value: 78, target: 75, change: 4.0, trend: "up", category: "satisfaction" },
            { name: "Support Ticket Volume", value: 234, target: 300, change: -12.5, trend: "up", category: "support" }
          ],
          insights: [
            {
              title: "Premium User Conversion Spike",
              description: "Premium conversions increased 34% this week, driven by the new pricing strategy.",
              impact: "high",
              category: "revenue",
              recommendation: "Extend the promotional pricing for another 2 weeks to maximize conversions."
            },
            {
              title: "Mobile Engagement Drop",
              description: "Mobile user engagement decreased 12% compared to last month.",
              impact: "medium",
              category: "engagement",
              recommendation: "Review mobile UX and implement mobile-specific optimizations."
            },
            {
              title: "Geographic Expansion Opportunity",
              description: "Strong organic growth in APAC region suggests expansion potential.",
              impact: "high",
              category: "growth",
              recommendation: "Consider localized marketing campaigns and regional partnerships."
            }
          ],
          predictions: [
            { metric: "Monthly Revenue", currentValue: 142800, predictedValue: 168400, confidence: 89, timeframe: "Next Month" },
            { metric: "User Growth", currentValue: 24567, predictedValue: 28920, confidence: 76, timeframe: "Next Quarter" },
            { metric: "Conversion Rate", currentValue: 5.12, predictedValue: 6.34, confidence: 82, timeframe: "Next Month" }
          ]
        },
        engagement: {
          pageViews: 156780,
          uniqueVisitors: 12450,
          averageTimeOnSite: 423, // seconds
          pagesPerSession: 3.8,
          topPages: [
            { page: "/dashboard", views: 34567, uniqueViews: 8934 },
            { page: "/signals", views: 23456, uniqueViews: 6789 },
            { page: "/pricing", views: 18234, uniqueViews: 12456 },
            { page: "/learn", views: 15678, uniqueViews: 9876 },
            { page: "/bots", views: 12345, uniqueViews: 7654 }
          ],
          exitPages: [
            { page: "/pricing", exits: 2456, exitRate: 19.8 },
            { page: "/checkout", exits: 1876, exitRate: 45.2 },
            { page: "/settings", exits: 1234, exitRate: 23.1 },
            { page: "/support", exits: 987, exitRate: 31.5 }
          ]
        },
        conversion: {
          funnelData: [
            { stage: "Landing Page Visit", users: 25400, conversionRate: 100, dropOff: 0 },
            { stage: "Sign Up Started", users: 8890, conversionRate: 35.0, dropOff: 65.0 },
            { stage: "Email Verified", users: 6845, conversionRate: 77.0, dropOff: 23.0 },
            { stage: "First Trade", users: 3456, conversionRate: 50.5, dropOff: 49.5 },
            { stage: "Premium Upgrade", users: 1234, conversionRate: 35.7, dropOff: 64.3 }
          ],
          goalCompletions: [
            { goal: "Newsletter Signup", completions: 5678, value: 12.50, conversionRate: 22.4 },
            { goal: "Premium Subscription", completions: 1234, value: 99.00, conversionRate: 4.9 },
            { goal: "Course Completion", completions: 2456, value: 199.00, conversionRate: 9.7 },
            { goal: "Referral Made", completions: 876, value: 25.00, conversionRate: 3.5 }
          ]
        }
      }

      setAnalytics(mockAnalytics)
      setLastUpdated(new Date())
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading analytics data:", error)
      toast.error("Failed to load analytics data")
      setIsLoading(false)
    }
  }

  const updateRealTimeMetrics = () => {
    setAnalytics(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        activeUsers: prev.overview.activeUsers + Math.floor(Math.random() * 10) - 5,
        conversions: prev.overview.conversions + Math.floor(Math.random() * 3)
      }
    }))
    setLastUpdated(new Date())
  }

  // Time series data for charts
  const timeSeriesData = [
    { date: "Jan 15", users: 8234, revenue: 12450, conversions: 89 },
    { date: "Jan 16", users: 8567, revenue: 13200, conversions: 102 },
    { date: "Jan 17", users: 8890, revenue: 14100, conversions: 98 },
    { date: "Jan 18", users: 9123, revenue: 15230, conversions: 115 },
    { date: "Jan 19", users: 9456, revenue: 16450, conversions: 124 },
    { date: "Jan 20", users: 9789, revenue: 17680, conversions: 138 }
  ]

  const filteredKPIs = useMemo(() => {
    if (selectedMetricCategory === "all") return analytics.businessIntelligence.kpis
    return analytics.businessIntelligence.kpis.filter(kpi => kpi.category === selectedMetricCategory)
  }, [analytics.businessIntelligence.kpis, selectedMetricCategory])

  const getTrendIcon = (trend: string, change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-400" />
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-gray-400"
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading unified analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-400" />
            Unified Analytics Hub
          </h1>
          <p className="text-gray-400 mt-1">
            Comprehensive analytics, insights, and business intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label className="text-gray-300 text-sm">Real-time</Label>
            <Switch 
              checked={isRealTimeEnabled} 
              onCheckedChange={setIsRealTimeEnabled}
            />
          </div>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32 bg-gray-900/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData} className="border-gray-600 text-gray-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-400">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      {isRealTimeEnabled && (
        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Real-time monitoring active</span>
              </div>
              <span className="text-gray-400 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{analytics.overview.totalUsers.toLocaleString()}</p>
                <div className="flex items-center space-x-1">
                  {getTrendIcon("up", analytics.overview.growth.users)}
                  <span className={`text-sm ${getTrendColor(analytics.overview.growth.users)}`}>
                    {analytics.overview.growth.users}%
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-white">${analytics.overview.revenue.toLocaleString()}</p>
                <div className="flex items-center space-x-1">
                  {getTrendIcon("up", analytics.overview.growth.revenue)}
                  <span className={`text-sm ${getTrendColor(analytics.overview.growth.revenue)}`}>
                    {analytics.overview.growth.revenue}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{analytics.overview.activeUsers.toLocaleString()}</p>
                <div className="flex items-center space-x-1">
                  {getTrendIcon("up", analytics.overview.growth.engagement)}
                  <span className={`text-sm ${getTrendColor(analytics.overview.growth.engagement)}`}>
                    {analytics.overview.growth.engagement}%
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversions</p>
                <p className="text-2xl font-bold text-white">{analytics.overview.conversions.toLocaleString()}</p>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm">
                    {((analytics.overview.conversions / analytics.overview.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            User Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="business" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger 
            value="engagement" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Engagement
          </TabsTrigger>
          <TabsTrigger 
            value="conversion" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Conversion
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Trends */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LineChartIcon className="w-5 h-5 mr-2" />
                  Growth Trends
                </CardTitle>
                <CardDescription>User and revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <ComposedChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Area yAxisId="left" type="monotone" dataKey="users" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Traffic Sources
                </CardTitle>
                <CardDescription>Where your users are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Direct", value: 45, color: "#3B82F6" },
                        { name: "Organic Search", value: 28, color: "#10B981" },
                        { name: "Social Media", value: 15, color: "#F59E0B" },
                        { name: "Referral", value: 8, color: "#EF4444" },
                        { name: "Paid Ads", value: 4, color: "#8B5CF6" }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {[
                        { name: "Direct", value: 45, color: "#3B82F6" },
                        { name: "Organic Search", value: 28, color: "#10B981" },
                        { name: "Social Media", value: 15, color: "#F59E0B" },
                        { name: "Referral", value: 8, color: "#EF4444" },
                        { name: "Paid Ads", value: 4, color: "#8B5CF6" }
                      ].map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { name: "Direct", value: 45, color: "#3B82F6" },
                    { name: "Organic Search", value: 28, color: "#10B981" },
                    { name: "Social Media", value: 15, color: "#F59E0B" },
                    { name: "Referral", value: 8, color: "#EF4444" },
                    { name: "Paid Ads", value: 4, color: "#8B5CF6" }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300 text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">New Users</p>
                  <p className="text-2xl font-bold text-white">{analytics.userAnalytics.newUsers.toLocaleString()}</p>
                  <p className="text-blue-400 text-xs">This period</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Returning Users</p>
                  <p className="text-2xl font-bold text-white">{analytics.userAnalytics.returningUsers.toLocaleString()}</p>
                  <p className="text-green-400 text-xs">This period</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Avg Session</p>
                  <p className="text-2xl font-bold text-white">{Math.floor(analytics.userAnalytics.averageSession / 60)}m</p>
                  <p className="text-yellow-400 text-xs">{analytics.userAnalytics.averageSession % 60}s</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-red-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Bounce Rate</p>
                  <p className="text-2xl font-bold text-white">{analytics.userAnalytics.bounceRate}%</p>
                  <p className="text-red-400 text-xs">Industry avg: 45%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users by Country */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Users by Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.userAnalytics.usersByCountry.map((country) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <span className="text-white">{country.country}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={country.percentage} className="w-24 h-2" />
                        <span className="text-gray-400 text-sm w-12">{country.percentage}%</span>
                        <span className="text-white text-sm w-16">{country.users.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Users by Device */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Users by Device
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-48">
                  <BarChart data={analytics.userAnalytics.usersByDevice}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="device" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey="users" fill="#3B82F6" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Intelligence Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedMetricCategory} onValueChange={setSelectedMetricCategory}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKPIs.map((kpi, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{kpi.name}</h3>
                    {getTrendIcon(kpi.trend, kpi.change)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        {kpi.name.includes('Cost') || kpi.name.includes('Value') || kpi.name.includes('Revenue') 
                          ? `$${kpi.value.toLocaleString()}` 
                          : `${kpi.value.toLocaleString()}${kpi.name.includes('Rate') || kpi.name.includes('Score') ? '' : ''}`
                        }
                      </span>
                      <span className={`text-sm ${getTrendColor(kpi.change)}`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Target</span>
                        <span className="text-gray-300">
                          {kpi.name.includes('Cost') || kpi.name.includes('Value') || kpi.name.includes('Revenue') 
                            ? `$${kpi.target.toLocaleString()}` 
                            : kpi.target.toLocaleString()
                          }
                        </span>
                      </div>
                      <Progress 
                        value={(kpi.value / kpi.target) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Machine learning insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.businessIntelligence.insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{insight.title}</h4>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                    <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                      <p className="text-blue-300 text-sm">
                        <strong>Recommendation:</strong> {insight.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Predictive Analytics
              </CardTitle>
              <CardDescription>
                AI predictions based on historical data and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.businessIntelligence.predictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div>
                      <h4 className="text-white font-medium">{prediction.metric}</h4>
                      <p className="text-gray-400 text-sm">{prediction.timeframe}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">
                          {prediction.metric.includes('Revenue') ? '$' : ''}
                          {prediction.currentValue.toLocaleString()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-green-400 font-medium">
                          {prediction.metric.includes('Revenue') ? '$' : ''}
                          {prediction.predictedValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-12">
                          <Progress value={prediction.confidence} className="h-1" />
                        </div>
                        <span className="text-gray-400 text-xs">{prediction.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Page Views</p>
                  <p className="text-2xl font-bold text-white">{analytics.engagement.pageViews.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Unique Visitors</p>
                  <p className="text-2xl font-bold text-white">{analytics.engagement.uniqueVisitors.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Avg Time on Site</p>
                  <p className="text-2xl font-bold text-white">{Math.floor(analytics.engagement.averageTimeOnSite / 60)}m</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Pages/Session</p>
                  <p className="text-2xl font-bold text-white">{analytics.engagement.pagesPerSession}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Top Pages</CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.engagement.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white">{page.page}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">{page.views.toLocaleString()} views</span>
                        <span className="text-blue-400 text-sm">({page.uniqueViews.toLocaleString()} unique)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exit Pages */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Exit Pages</CardTitle>
                <CardDescription>Where users leave your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.engagement.exitPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white">{page.page}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-red-400 text-sm">{page.exitRate}%</span>
                        <span className="text-gray-400 text-sm">({page.exits} exits)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Conversion Funnel</CardTitle>
                <CardDescription>User journey and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.conversion.funnelData.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{step.stage}</span>
                        <div className="text-right">
                          <div className="text-white font-bold">{step.users.toLocaleString()}</div>
                          <div className="text-gray-400 text-sm">{step.conversionRate.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Progress value={step.conversionRate} className="h-3" />
                      {index < analytics.conversion.funnelData.length - 1 && step.dropOff > 0 && (
                        <div className="mt-1 text-red-400 text-xs">
                          Drop-off: {step.dropOff.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goal Completions */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Goal Completions</CardTitle>
                <CardDescription>Conversion tracking by goal type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.conversion.goalCompletions.map((goal, index) => (
                    <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{goal.goal}</h4>
                        <Badge className="bg-green-500/20 text-green-400">
                          {goal.conversionRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{goal.completions.toLocaleString()} completions</span>
                        <span className="text-green-400 font-medium">
                          ${(goal.completions * goal.value).toLocaleString()} value
                        </span>
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
