"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { 
  PieChart,
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Eye,
  Users,
  Clock,
  Target,
  Award,
  DollarSign,
  Activity,
  Zap,
  Star,
  BookOpen,
  Video,
  FileQuestion,
  Trophy,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  Flame,
  Crown,
  Sparkles,
  Shield,
  Layers,
  Database,
  Cpu,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Navigation,
  Map,
  Route,
  Compass,
  Hash,
  Percent,
  PlayCircle,
  PauseCircle,
  FastForward,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import { toast } from "sonner"

interface AnalyticsData {
  overview: {
    totalStudents: number
    activeStudents: number
    totalCourses: number
    completionRate: number
    averageEngagement: number
    totalRevenue: number
    growthRate: number
    retentionRate: number
  }
  
  studentMetrics: {
    learningVelocity: number
    averageSessionTime: number
    dropoffRate: number
    satisfactionScore: number
    progressDistribution: {
      [key: string]: number
    }
  }
  
  contentPerformance: {
    topCourses: Array<{
      id: string
      name: string
      enrollments: number
      completion: number
      rating: number
      revenue: number
      engagement: number
    }>
    
    contentTypes: {
      video: { engagement: number, completion: number }
      quiz: { engagement: number, completion: number }
      text: { engagement: number, completion: number }
      interactive: { engagement: number, completion: number }
    }
  }
  
  predictiveAnalytics: {
    riskStudents: number
    projectedDropoff: number
    revenueForecasting: {
      thisMonth: number
      nextMonth: number
      quarter: number
    }
    trendingTopics: string[]
    recommendedActions: Array<{
      type: 'course' | 'student' | 'content'
      priority: 'high' | 'medium' | 'low'
      action: string
      impact: string
    }>
  }
  
  deviceAnalytics: {
    desktop: number
    mobile: number
    tablet: number
  }
  
  geographics: {
    [country: string]: number
  }
  
  timeAnalytics: {
    peakHours: number[]
    weeklyPattern: number[]
    monthlyTrend: number[]
  }
}

const MOCK_ANALYTICS: AnalyticsData = {
  overview: {
    totalStudents: 8459,
    activeStudents: 3247,
    totalCourses: 127,
    completionRate: 78.3,
    averageEngagement: 85.7,
    totalRevenue: 847620,
    growthRate: 12.5,
    retentionRate: 87.2
  },
  
  studentMetrics: {
    learningVelocity: 2.3, // lessons per day
    averageSessionTime: 28.5, // minutes
    dropoffRate: 12.8, // percentage
    satisfactionScore: 4.7, // out of 5
    progressDistribution: {
      '0-25%': 1247,
      '26-50%': 1856,
      '51-75%': 2341,
      '76-100%': 3015
    }
  },
  
  contentPerformance: {
    topCourses: [
      {
        id: '1',
        name: 'Trading Fundamentals',
        enrollments: 2150,
        completion: 85.3,
        rating: 4.8,
        revenue: 127800,
        engagement: 92.1
      },
      {
        id: '2',
        name: 'Technical Analysis Mastery',
        enrollments: 1875,
        completion: 79.2,
        rating: 4.7,
        revenue: 98750,
        engagement: 88.4
      },
      {
        id: '3',
        name: 'Risk Management Pro',
        enrollments: 1624,
        completion: 88.7,
        rating: 4.9,
        revenue: 156200,
        engagement: 94.2
      }
    ],
    
    contentTypes: {
      video: { engagement: 89.2, completion: 82.4 },
      quiz: { engagement: 76.5, completion: 91.3 },
      text: { engagement: 62.8, completion: 95.1 },
      interactive: { engagement: 94.7, completion: 78.9 }
    }
  },
  
  predictiveAnalytics: {
    riskStudents: 342,
    projectedDropoff: 8.2,
    revenueForecasting: {
      thisMonth: 89450,
      nextMonth: 97200,
      quarter: 278600
    },
    trendingTopics: [
      'Cryptocurrency Trading',
      'Options Strategies', 
      'Risk Management',
      'Technical Analysis',
      'Market Psychology'
    ],
    recommendedActions: [
      {
        type: 'student',
        priority: 'high',
        action: 'Reach out to 47 at-risk students in Technical Analysis course',
        impact: 'Could prevent 15-20 dropouts and save $12,450 in revenue'
      },
      {
        type: 'content',
        priority: 'medium',
        action: 'Add more interactive elements to Options Trading lessons 8-12',
        impact: 'Expected to increase engagement by 12-18%'
      },
      {
        type: 'course',
        priority: 'high',
        action: 'Create Advanced Cryptocurrency Trading course',
        impact: 'Potential $45K+ revenue in first quarter based on demand'
      }
    ]
  },
  
  deviceAnalytics: {
    desktop: 52.3,
    mobile: 34.7,
    tablet: 13.0
  },
  
  geographics: {
    'United States': 3247,
    'Canada': 856,
    'United Kingdom': 734,
    'Germany': 512,
    'Australia': 389,
    'Netherlands': 267,
    'Singapore': 234,
    'Other': 2220
  },
  
  timeAnalytics: {
    peakHours: [9, 13, 19, 21], // Hours of day
    weeklyPattern: [67, 89, 92, 88, 85, 45, 41], // Mon-Sun percentages
    monthlyTrend: [78, 82, 85, 89, 92, 88, 91, 87, 84, 86, 89, 91] // Last 12 months
  }
}

export default function LearningAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>(MOCK_ANALYTICS)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (value < threshold) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <TrendingUp className="w-4 h-4 text-gray-400" />
  }

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Analytics data refreshed!")
    }, 1500)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-400" />
            Learning Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            Advanced AI-powered insights and predictive analytics for your learning platform
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* ===== KEY METRICS OVERVIEW ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{formatNumber(data.overview.totalStudents)}</div>
                <div className="text-blue-300 text-xs">Total Students</div>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(data.overview.growthRate, 0)}
                  <span className="text-green-400 text-xs ml-1">+{data.overview.growthRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Activity className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{formatNumber(data.overview.activeStudents)}</div>
                <div className="text-green-300 text-xs">Active Students</div>
                <div className="text-green-400 text-xs mt-1">
                  {formatPercentage((data.overview.activeStudents / data.overview.totalStudents) * 100)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Target className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{formatPercentage(data.overview.completionRate)}</div>
                <div className="text-purple-300 text-xs">Completion</div>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(data.overview.completionRate, 75)}
                  <span className="text-green-400 text-xs ml-1">+2.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Flame className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{formatPercentage(data.overview.averageEngagement)}</div>
                <div className="text-yellow-300 text-xs">Engagement</div>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(data.overview.averageEngagement, 80)}
                  <span className="text-green-400 text-xs ml-1">+4.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{formatCurrency(data.overview.totalRevenue)}</div>
                <div className="text-pink-300 text-xs">Revenue</div>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(data.overview.growthRate, 0)}
                  <span className="text-green-400 text-xs ml-1">+{data.overview.growthRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Clock className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{data.studentMetrics.averageSessionTime.toFixed(1)}m</div>
                <div className="text-orange-300 text-xs">Avg Session</div>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(data.studentMetrics.averageSessionTime, 25)}
                  <span className="text-green-400 text-xs ml-1">+8.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-br from-teal-900/50 to-teal-800/30 border-teal-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Shield className="w-6 h-6 text-teal-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{formatPercentage(data.overview.retentionRate)}</div>
                <div className="text-teal-300 text-xs">Retention</div>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(data.overview.retentionRate, 85)}
                  <span className="text-green-400 text-xs ml-1">+1.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border-indigo-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <AlertTriangle className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{data.predictiveAnalytics.riskStudents}</div>
                <div className="text-indigo-300 text-xs">At Risk</div>
                <div className="text-orange-400 text-xs mt-1">
                  {formatPercentage(data.studentMetrics.dropoffRate)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== AI INSIGHTS BANNER ===== */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-800/30"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-900/50 rounded-lg">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center">
                🤖 AI-Powered Insights
                <Badge className="ml-2 bg-purple-600 text-xs">Live</Badge>
              </h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p>• <strong className="text-white">High Impact Alert:</strong> 47 students in Technical Analysis are at risk - potential $12.4K revenue impact</p>
                <p>• <strong className="text-white">Growth Opportunity:</strong> Create Cryptocurrency Trading course - projected $45K+ Q1 revenue</p>
                <p>• <strong className="text-white">Engagement Boost:</strong> Add interactive elements to Options lessons - expected +15% engagement</p>
              </div>
            </div>
          </div>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Lightbulb className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </motion.div>

      {/* ===== MAIN ANALYTICS TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            📊 Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-purple-600">
            👥 Students
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-purple-600">
            📚 Content
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-purple-600">
            🔮 Predictive
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-purple-600">
            💰 Business
          </TabsTrigger>
          <TabsTrigger value="realtime" className="data-[state=active]:bg-purple-600">
            ⚡ Real-time
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Learning Progress Distribution */}
            <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Learning Progress Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.studentMetrics.progressDistribution).map(([range, count]) => {
                    const percentage = (count / data.overview.totalStudents) * 100
                    return (
                      <div key={range}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">{range} Complete</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{formatNumber(count)}</span>
                            <span className="text-gray-400">({formatPercentage(percentage)})</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Courses */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                  Top Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.contentPerformance.topCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{course.name}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <span>{formatNumber(course.enrollments)} enrolled</span>
                          <span>{formatPercentage(course.completion)} completion</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${
                        course.engagement >= 90 ? 'text-green-400' :
                        course.engagement >= 80 ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {formatPercentage(course.engagement)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Type Performance */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Content Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(data.contentPerformance.contentTypes).map(([type, metrics]) => {
                  const icon = {
                    video: Video,
                    quiz: FileQuestion,
                    text: BookOpen,
                    interactive: Zap
                  }[type] || BookOpen

                  const IconComponent = icon

                  return (
                    <div key={type} className="text-center">
                      <div className="p-4 bg-gray-800 rounded-lg mb-3">
                        <IconComponent className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                        <h3 className="text-white font-semibold capitalize">{type}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Engagement</div>
                          <div className="flex items-center justify-center space-x-2">
                            <Progress value={metrics.engagement} className="flex-1 h-2" />
                            <span className="text-white text-sm font-medium">{formatPercentage(metrics.engagement)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Completion</div>
                          <div className="flex items-center justify-center space-x-2">
                            <Progress value={metrics.completion} className="flex-1 h-2" />
                            <span className="text-white text-sm font-medium">{formatPercentage(metrics.completion)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Device & Geographic Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Device Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <span className="text-white">Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={data.deviceAnalytics.desktop} className="w-24 h-2" />
                      <span className="text-white font-medium">{formatPercentage(data.deviceAnalytics.desktop)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-green-400" />
                      <span className="text-white">Mobile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={data.deviceAnalytics.mobile} className="w-24 h-2" />
                      <span className="text-white font-medium">{formatPercentage(data.deviceAnalytics.mobile)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tablet className="w-4 h-4 text-purple-400" />
                      <span className="text-white">Tablet</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={data.deviceAnalytics.tablet} className="w-24 h-2" />
                      <span className="text-white font-medium">{formatPercentage(data.deviceAnalytics.tablet)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.geographics)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([country, count]) => {
                      const percentage = (count / data.overview.totalStudents) * 100
                      return (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-white">{country}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={percentage} className="w-16 h-2" />
                            <span className="text-gray-400 text-sm w-12 text-right">{formatNumber(count)}</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== STUDENTS TAB ===== */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Learning Velocity</p>
                    <p className="text-2xl font-bold text-white">{data.studentMetrics.learningVelocity}</p>
                    <p className="text-blue-400 text-sm">lessons/day avg</p>
                  </div>
                  <FastForward className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Session Time</p>
                    <p className="text-2xl font-bold text-white">{data.studentMetrics.averageSessionTime}m</p>
                    <p className="text-green-400 text-sm">+8% vs last month</p>
                  </div>
                  <Clock className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Satisfaction</p>
                    <p className="text-2xl font-bold text-white">{data.studentMetrics.satisfactionScore}/5</p>
                    <p className="text-purple-400 text-sm">Excellent rating</p>
                  </div>
                  <Star className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Dropoff Rate</p>
                    <p className="text-2xl font-bold text-white">{formatPercentage(data.studentMetrics.dropoffRate)}</p>
                    <p className="text-orange-400 text-sm">Below industry avg</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Student Behavior Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Advanced Student Behavior Analysis</h3>
                  <p>Interactive charts showing learning patterns, session analytics, and engagement metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== CONTENT TAB ===== */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Content Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Content Performance Trends</h3>
                    <p>Analyze which content types drive the highest engagement and completion rates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Learning Path Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Route className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Student Journey Mapping</h3>
                    <p>Visualize how students progress through courses and identify optimization opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {data.predictiveAnalytics.trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
                      <Hash className="w-3 h-3 mr-1" />
                      {topic}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PREDICTIVE TAB ===== */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300">At-Risk Students</p>
                    <p className="text-3xl font-bold text-white">{data.predictiveAnalytics.riskStudents}</p>
                    <p className="text-red-400 text-sm">Require intervention</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300">Projected Dropoff</p>
                    <p className="text-3xl font-bold text-white">{formatPercentage(data.predictiveAnalytics.projectedDropoff)}</p>
                    <p className="text-yellow-400 text-sm">Next 30 days</p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300">Revenue Forecast</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(data.predictiveAnalytics.revenueForecasting.nextMonth)}</p>
                    <p className="text-green-400 text-sm">Next month</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                AI-Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.predictiveAnalytics.recommendedActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      action.priority === 'high' ? 'bg-red-900/20 border-red-500' :
                      action.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                      'bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${
                            action.priority === 'high' ? 'bg-red-600' :
                            action.priority === 'medium' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }`}>
                            {action.priority.toUpperCase()}
                          </Badge>
                          <Badge className="bg-gray-700 capitalize">
                            {action.type}
                          </Badge>
                        </div>
                        <h4 className="text-white font-semibold mb-1">{action.action}</h4>
                        <p className="text-gray-300 text-sm">{action.impact}</p>
                      </div>
                      <Button size="sm" className="ml-4 bg-purple-600 hover:bg-purple-700">
                        Act Now
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== BUSINESS TAB ===== */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(data.predictiveAnalytics.revenueForecasting.thisMonth)}</p>
                    <p className="text-green-400 text-sm">+18% vs last month</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Next Month</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(data.predictiveAnalytics.revenueForecasting.nextMonth)}</p>
                    <p className="text-blue-400 text-sm">Projected +8.6%</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Quarter Forecast</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(data.predictiveAnalytics.revenueForecasting.quarter)}</p>
                    <p className="text-purple-400 text-sm">Q1 2024 target</p>
                  </div>
                  <Target className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Revenue Analytics & Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <LineChart className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Business Intelligence Dashboard</h3>
                  <p>Advanced revenue forecasting, cohort analysis, and business performance metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== REAL-TIME TAB ===== */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">247</div>
                  <div className="text-green-300 text-sm">Online Now</div>
                  <Badge className="mt-1 bg-green-600 animate-pulse">Live</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <PlayCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">89</div>
                  <div className="text-blue-300 text-sm">Watching Videos</div>
                  <Badge className="mt-1 bg-blue-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <FileQuestion className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">34</div>
                  <div className="text-purple-300 text-sm">Taking Quizzes</div>
                  <Badge className="mt-1 bg-purple-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-yellow-300 text-sm">Completing Courses</div>
                  <Badge className="mt-1 bg-yellow-600">Success</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Real-Time Activity Feed
                <Badge className="ml-2 bg-green-600 animate-pulse">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Activity className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold text-white mb-2">Live Learning Activity</h3>
                  <p>Real-time feed of student activities, completions, and platform interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

