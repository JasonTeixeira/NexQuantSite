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
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, Cell, Funnel, FunnelChart, Treemap
} from "recharts"
import {
  TrendingUp, TrendingDown, Users, Target, Filter, Download, RefreshCw,
  BarChart3, PieChart, Calendar, Eye, UserCheck, UserMinus, ArrowRight,
  Zap, Award, AlertTriangle, Clock, ChevronDown, Settings
} from "lucide-react"
import { toast } from "sonner"

interface CohortData {
  cohortMonth: string
  cohortSize: number
  periods: {
    period: number
    users: number
    retention: number
  }[]
}

interface FunnelStep {
  name: string
  users: number
  conversionRate: number
  dropOffRate: number
  stage: number
}

interface UserSegment {
  id: string
  name: string
  users: number
  percentage: number
  growth: number
  value: number
  color: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export default function CohortFunnelAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months")
  const [selectedCohortType, setSelectedCohortType] = useState("monthly")
  const [selectedFunnel, setSelectedFunnel] = useState("signup")
  const [selectedSegment, setSelectedSegment] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("cohorts")

  // Mock data for cohort analysis
  const [cohortData, setCohortData] = useState<CohortData[]>([])
  
  // Mock data for funnel analysis
  const [funnelData, setFunnelData] = useState<{[key: string]: FunnelStep[]}>({})
  
  // Mock data for user segments
  const [userSegments, setUserSegments] = useState<UserSegment[]>([])

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeframe, selectedCohortType])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Mock cohort data
      const mockCohortData: CohortData[] = [
        {
          cohortMonth: "2024-01",
          cohortSize: 1250,
          periods: [
            { period: 0, users: 1250, retention: 100 },
            { period: 1, users: 892, retention: 71.4 },
            { period: 2, users: 645, retention: 51.6 },
            { period: 3, users: 478, retention: 38.2 },
            { period: 4, users: 365, retention: 29.2 },
            { period: 5, users: 289, retention: 23.1 }
          ]
        },
        {
          cohortMonth: "2023-12",
          cohortSize: 1180,
          periods: [
            { period: 0, users: 1180, retention: 100 },
            { period: 1, users: 826, retention: 70.0 },
            { period: 2, users: 590, retention: 50.0 },
            { period: 3, users: 425, retention: 36.0 },
            { period: 4, users: 318, retention: 26.9 },
            { period: 5, users: 248, retention: 21.0 },
            { period: 6, users: 201, retention: 17.0 }
          ]
        },
        {
          cohortMonth: "2023-11",
          cohortSize: 980,
          periods: [
            { period: 0, users: 980, retention: 100 },
            { period: 1, users: 686, retention: 70.0 },
            { period: 2, users: 480, retention: 49.0 },
            { period: 3, users: 343, retention: 35.0 },
            { period: 4, users: 255, retention: 26.0 },
            { period: 5, users: 196, retention: 20.0 },
            { period: 6, users: 147, retention: 15.0 },
            { period: 7, users: 118, retention: 12.0 }
          ]
        }
      ]

      // Mock funnel data
      const mockFunnelData = {
        signup: [
          { name: "Landing Page Visit", users: 25400, conversionRate: 100, dropOffRate: 0, stage: 1 },
          { name: "Signup Started", users: 8890, conversionRate: 35.0, dropOffRate: 65.0, stage: 2 },
          { name: "Email Verified", users: 6845, conversionRate: 77.0, dropOffRate: 23.0, stage: 3 },
          { name: "Profile Completed", users: 5234, conversionRate: 76.5, dropOffRate: 23.5, stage: 4 },
          { name: "First Trade", users: 3456, conversionRate: 66.0, dropOffRate: 34.0, stage: 5 },
          { name: "Active User", users: 2789, conversionRate: 80.7, dropOffRate: 19.3, stage: 6 }
        ],
        purchase: [
          { name: "Free User", users: 8920, conversionRate: 100, dropOffRate: 0, stage: 1 },
          { name: "Viewed Pricing", users: 3890, conversionRate: 43.6, dropOffRate: 56.4, stage: 2 },
          { name: "Started Checkout", users: 1456, conversionRate: 37.4, dropOffRate: 62.6, stage: 3 },
          { name: "Payment Info", users: 945, conversionRate: 64.9, dropOffRate: 35.1, stage: 4 },
          { name: "Purchase Complete", users: 723, conversionRate: 76.5, dropOffRate: 23.5, stage: 5 }
        ],
        engagement: [
          { name: "New User", users: 5670, conversionRate: 100, dropOffRate: 0, stage: 1 },
          { name: "First Week Active", users: 4234, conversionRate: 74.7, dropOffRate: 25.3, stage: 2 },
          { name: "Used Key Feature", users: 2890, conversionRate: 68.3, dropOffRate: 31.7, stage: 3 },
          { name: "Weekly Active", users: 2156, conversionRate: 74.6, dropOffRate: 25.4, stage: 4 },
          { name: "Power User", users: 1445, conversionRate: 67.0, dropOffRate: 33.0, stage: 5 }
        ]
      }

      // Mock user segments
      const mockUserSegments: UserSegment[] = [
        { id: "1", name: "New Users", users: 1250, percentage: 28.5, growth: 12.3, value: 89, color: COLORS[0] },
        { id: "2", name: "Active Traders", users: 2890, percentage: 34.2, growth: 8.7, value: 245, color: COLORS[1] },
        { id: "3", name: "Premium Users", users: 890, percentage: 15.8, growth: 15.6, value: 487, color: COLORS[2] },
        { id: "4", name: "Dormant Users", users: 1567, percentage: 12.8, growth: -3.4, value: 23, color: COLORS[3] },
        { id: "5", name: "Enterprise", users: 234, percentage: 4.2, growth: 23.1, value: 1247, color: COLORS[4] },
        { id: "6", name: "At Risk", users: 445, percentage: 4.5, growth: -8.9, value: 156, color: COLORS[5] }
      ]

      setCohortData(mockCohortData)
      setFunnelData(mockFunnelData)
      setUserSegments(mockUserSegments)
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate loading
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading analytics data:", error)
      toast.error("Failed to load analytics data")
      setIsLoading(false)
    }
  }

  const cohortRetentionData = useMemo(() => {
    if (!cohortData.length) return []
    
    const maxPeriods = Math.max(...cohortData.map(c => c.periods.length))
    return Array.from({ length: maxPeriods }, (_, periodIndex) => {
      const dataPoint: any = { period: `Month ${periodIndex}` }
      cohortData.forEach(cohort => {
        const periodData = cohort.periods[periodIndex]
        if (periodData) {
          dataPoint[cohort.cohortMonth] = periodData.retention
        }
      })
      return dataPoint
    })
  }, [cohortData])

  const overallStats = useMemo(() => {
    const totalUsers = userSegments.reduce((sum, segment) => sum + segment.users, 0)
    const avgRetention = cohortData.length > 0 
      ? cohortData[0].periods.find(p => p.period === 1)?.retention || 0 
      : 0
    const funnelConversion = funnelData[selectedFunnel] 
      ? ((funnelData[selectedFunnel][funnelData[selectedFunnel].length - 1]?.users || 0) / 
         (funnelData[selectedFunnel][0]?.users || 1)) * 100 
      : 0

    return {
      totalUsers,
      avgRetention: Math.round(avgRetention * 10) / 10,
      funnelConversion: Math.round(funnelConversion * 10) / 10,
      segments: userSegments.length
    }
  }, [userSegments, cohortData, funnelData, selectedFunnel])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading advanced analytics...</p>
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
            <BarChart3 className="w-8 h-8 mr-3 text-blue-400" />
            Cohort & Funnel Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            Advanced user behavior and conversion analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-600 text-gray-400">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadAnalyticsData} className="border-gray-600 text-gray-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{overallStats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Retention</p>
                <p className="text-2xl font-bold text-white">{overallStats.avgRetention}%</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Funnel Conversion</p>
                <p className="text-2xl font-bold text-white">{overallStats.funnelConversion}%</p>
              </div>
              <Target className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">User Segments</p>
                <p className="text-2xl font-bold text-white">{overallStats.segments}</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="cohorts" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Cohort Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="funnels" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Funnel Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="segments" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            User Segments
          </TabsTrigger>
        </TabsList>

        {/* Cohort Analysis Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedCohortType} onValueChange={setSelectedCohortType}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="monthly">Monthly Cohorts</SelectItem>
                <SelectItem value="weekly">Weekly Cohorts</SelectItem>
                <SelectItem value="daily">Daily Cohorts</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cohort Retention Chart */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Retention by Cohort</CardTitle>
                <CardDescription>
                  How different user cohorts retain over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-80">
                  <LineChart data={cohortRetentionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                    {cohortData.map((cohort, index) => (
                      <Line
                        key={cohort.cohortMonth}
                        type="monotone"
                        dataKey={cohort.cohortMonth}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Cohort Heatmap Table */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Cohort Retention Heatmap</CardTitle>
                <CardDescription>
                  Detailed retention percentages by cohort and period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-gray-400 p-2">Cohort</th>
                        <th className="text-center text-gray-400 p-2">Size</th>
                        {Array.from({ length: 6 }, (_, i) => (
                          <th key={i} className="text-center text-gray-400 p-2">M{i}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cohortData.map((cohort, cohortIndex) => (
                        <tr key={cohort.cohortMonth} className="border-b border-gray-800">
                          <td className="text-white p-2 font-medium">{cohort.cohortMonth}</td>
                          <td className="text-gray-300 p-2 text-center">{cohort.cohortSize}</td>
                          {Array.from({ length: 6 }, (_, periodIndex) => {
                            const periodData = cohort.periods[periodIndex]
                            const retention = periodData?.retention || 0
                            const intensity = Math.min(retention / 100, 1)
                            
                            return (
                              <td key={periodIndex} className="p-2 text-center">
                                <div 
                                  className="rounded px-2 py-1 text-xs font-medium"
                                  style={{
                                    backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
                                    color: intensity > 0.5 ? '#ffffff' : '#e5e7eb'
                                  }}
                                >
                                  {periodData ? `${retention.toFixed(1)}%` : '-'}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnel Analysis Tab */}
        <TabsContent value="funnels" className="space-y-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="signup">Signup Funnel</SelectItem>
                <SelectItem value="purchase">Purchase Funnel</SelectItem>
                <SelectItem value="engagement">Engagement Funnel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Visualization */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white capitalize">{selectedFunnel} Funnel</CardTitle>
                <CardDescription>
                  User flow and conversion rates at each step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData[selectedFunnel]?.map((step, index) => (
                    <div key={step.name} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{step.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{step.users.toLocaleString()}</div>
                          <div className="text-gray-400 text-sm">{step.conversionRate.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Progress 
                        value={step.conversionRate} 
                        className="h-3 bg-gray-800"
                      />
                      {index < funnelData[selectedFunnel].length - 1 && step.dropOffRate > 0 && (
                        <div className="mt-1 text-red-400 text-xs">
                          Drop-off: {step.dropOffRate.toFixed(1)}%
                        </div>
                      )}
                      {index < funnelData[selectedFunnel].length - 1 && (
                        <div className="absolute -bottom-2 left-4">
                          <ArrowRight className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Funnel Chart */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Conversion Chart</CardTitle>
                <CardDescription>
                  Visual representation of user flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-80">
                  <BarChart data={funnelData[selectedFunnel]} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={120} />
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

        {/* User Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSegments.map((segment) => (
              <Card key={segment.id} className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">{segment.name}</h3>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Users:</span>
                      <span className="text-white font-medium">{segment.users.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Percentage:</span>
                      <span className="text-white font-medium">{segment.percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growth:</span>
                      <span className={`font-medium ${segment.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {segment.growth >= 0 ? '+' : ''}{segment.growth}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Value:</span>
                      <span className="text-white font-medium">${segment.value}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Segment Performance Chart */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Segment Growth Comparison</CardTitle>
              <CardDescription>
                Growth trends across different user segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <BarChart data={userSegments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Bar dataKey="growth" fill="#3B82F6" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
