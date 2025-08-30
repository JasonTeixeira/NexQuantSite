"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  DollarSign, TrendingUp, TrendingDown, Users, Target,
  BarChart3, PieChart, Calendar, Download, RefreshCw,
  Crown, Star, Award, Activity, Clock, Zap,
  Shield, Brain, Rocket, Signal, Eye
} from "lucide-react"

interface BotRevenueData {
  botId: string
  botName: string
  totalRevenue: number
  monthlyRevenue: number
  subscribers: {
    total: number
    active: number
    new: number
    churned: number
    conversionRate: number
  }
  plans: {
    free: { count: number; revenue: number }
    premium: { count: number; revenue: number }
    enterprise: { count: number; revenue: number }
  }
  usage: {
    apiCalls: number
    trades: number
    activeTime: number
    costPerCall: number
  }
  growth: {
    revenueGrowth: number
    userGrowth: number
    usageGrowth: number
  }
  forecast: {
    nextMonthRevenue: number
    nextMonthUsers: number
    confidence: number
  }
}

interface RevenueMetrics {
  totalRevenue: number
  monthlyRecurring: number
  annualRecurring: number
  avgRevenuePerUser: number
  customerLifetimeValue: number
  churnRate: number
  growthRate: number
  profitMargin: number
}

const MOCK_BOT_REVENUE: BotRevenueData[] = [
  {
    botId: 'execution',
    botName: 'Execution Precision Protocol',
    totalRevenue: 124680,
    monthlyRevenue: 15420,
    subscribers: {
      total: 1589,
      active: 1456,
      new: 89,
      churned: 23,
      conversionRate: 18.7
    },
    plans: {
      free: { count: 234, revenue: 0 },
      premium: { count: 892, revenue: 8920 },
      enterprise: { count: 463, revenue: 6500 }
    },
    usage: {
      apiCalls: 28450,
      trades: 3456,
      activeTime: 892,
      costPerCall: 0.002
    },
    growth: {
      revenueGrowth: 23.4,
      userGrowth: 12.8,
      usageGrowth: 15.6
    },
    forecast: {
      nextMonthRevenue: 17850,
      nextMonthUsers: 1734,
      confidence: 87
    }
  },
  {
    botId: 'quantum',
    botName: 'Quantum Momentum Engine', 
    totalRevenue: 87540,
    monthlyRevenue: 12340,
    subscribers: {
      total: 1247,
      active: 1156,
      new: 67,
      churned: 18,
      conversionRate: 15.2
    },
    plans: {
      free: { count: 187, revenue: 0 },
      premium: { count: 734, revenue: 7340 },
      enterprise: { count: 326, revenue: 5000 }
    },
    usage: {
      apiCalls: 15420,
      trades: 2847,
      activeTime: 654,
      costPerCall: 0.0025
    },
    growth: {
      revenueGrowth: 18.9,
      userGrowth: 9.4,
      usageGrowth: 12.3
    },
    forecast: {
      nextMonthRevenue: 14670,
      nextMonthUsers: 1364,
      confidence: 82
    }
  },
  {
    botId: 'oracle',
    botName: 'Oracle Volatility Scanner',
    totalRevenue: 75230,
    monthlyRevenue: 9870,
    subscribers: {
      total: 876,
      active: 789,
      new: 43,
      churned: 31,
      conversionRate: 12.4
    },
    plans: {
      free: { count: 156, revenue: 0 },
      premium: { count: 567, revenue: 5670 },
      enterprise: { count: 153, revenue: 4200 }
    },
    usage: {
      apiCalls: 18750,
      trades: 2134,
      activeTime: 478,
      costPerCall: 0.003
    },
    growth: {
      revenueGrowth: 8.7,
      userGrowth: 5.2,
      usageGrowth: 7.8
    },
    forecast: {
      nextMonthRevenue: 10720,
      nextMonthUsers: 922,
      confidence: 73
    }
  },
  {
    botId: 'reversal',
    botName: 'Reversal Recognition Matrix',
    totalRevenue: 62340,
    monthlyRevenue: 8450,
    subscribers: {
      total: 934,
      active: 856,
      new: 52,
      churned: 19,
      conversionRate: 14.8
    },
    plans: {
      free: { count: 198, revenue: 0 },
      premium: { count: 546, revenue: 5460 },
      enterprise: { count: 190, revenue: 2990 }
    },
    usage: {
      apiCalls: 12650,
      trades: 1923,
      activeTime: 423,
      costPerCall: 0.0028
    },
    growth: {
      revenueGrowth: 15.6,
      userGrowth: 8.9,
      usageGrowth: 11.2
    },
    forecast: {
      nextMonthRevenue: 9760,
      nextMonthUsers: 1018,
      confidence: 79
    }
  },
  {
    botId: 'zenith',
    botName: 'Zenith Mean Reversion',
    totalRevenue: 54780,
    monthlyRevenue: 7230,
    subscribers: {
      total: 743,
      active: 684,
      new: 38,
      churned: 22,
      conversionRate: 11.9
    },
    plans: {
      free: { count: 167, revenue: 0 },
      premium: { count: 423, revenue: 4230 },
      enterprise: { count: 153, revenue: 3000 }
    },
    usage: {
      apiCalls: 9870,
      trades: 1876,
      activeTime: 367,
      costPerCall: 0.0024
    },
    growth: {
      revenueGrowth: 12.1,
      userGrowth: 6.7,
      usageGrowth: 9.4
    },
    forecast: {
      nextMonthRevenue: 8110,
      nextMonthUsers: 793,
      confidence: 76
    }
  }
]

export default function BotRevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<BotRevenueData[]>(MOCK_BOT_REVENUE)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Calculate overall metrics
  const overallMetrics: RevenueMetrics = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, bot) => sum + bot.totalRevenue, 0)
    const monthlyRecurring = revenueData.reduce((sum, bot) => sum + bot.monthlyRevenue, 0)
    const totalSubscribers = revenueData.reduce((sum, bot) => sum + bot.subscribers.total, 0)
    const totalActive = revenueData.reduce((sum, bot) => sum + bot.subscribers.active, 0)
    const totalChurned = revenueData.reduce((sum, bot) => sum + bot.subscribers.churned, 0)
    
    return {
      totalRevenue,
      monthlyRecurring,
      annualRecurring: monthlyRecurring * 12,
      avgRevenuePerUser: totalRevenue / totalSubscribers,
      customerLifetimeValue: (monthlyRecurring / totalActive) * 24, // Assuming 24 month average
      churnRate: (totalChurned / totalActive) * 100,
      growthRate: revenueData.reduce((sum, bot) => sum + bot.growth.revenueGrowth, 0) / revenueData.length,
      profitMargin: 78.5 // Mock profit margin
    }
  }, [revenueData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-green-400" />
            Bot Revenue Analytics
          </h2>
          <p className="text-gray-400">Comprehensive revenue tracking and forecasting</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overall Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${(overallMetrics.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-green-400 text-sm">+{overallMetrics.growthRate.toFixed(1)}% growth</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Monthly Recurring</p>
                <p className="text-3xl font-bold text-white">${(overallMetrics.monthlyRecurring / 1000).toFixed(0)}K</p>
                <p className="text-blue-400 text-sm">MRR</p>
              </div>
              <RefreshCw className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">ARPU</p>
                <p className="text-3xl font-bold text-white">${overallMetrics.avgRevenuePerUser.toFixed(0)}</p>
                <p className="text-purple-400 text-sm">Avg Revenue Per User</p>
              </div>
              <Target className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">LTV</p>
                <p className="text-3xl font-bold text-white">${(overallMetrics.customerLifetimeValue / 1000).toFixed(1)}K</p>
                <p className="text-orange-400 text-sm">Customer Lifetime Value</p>
              </div>
              <Crown className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Bot Revenue Breakdown */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Individual Bot Revenue Analysis
            </CardTitle>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {revenueData
              .sort((a, b) => b.totalRevenue - a.totalRevenue)
              .map((bot, index) => (
              <motion.div
                key={bot.botId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{bot.botName}</CardTitle>
                        <div className="text-gray-400 text-sm">#{index + 1} by revenue</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                        {index <= 2 && <Star className="w-4 h-4 text-blue-400" />}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Revenue Metrics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Revenue:</span>
                        <span className="text-green-400 font-bold">${(bot.totalRevenue / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Monthly Revenue:</span>
                        <span className="text-blue-400 font-bold">${(bot.monthlyRevenue / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Revenue Growth:</span>
                        <span className={`font-bold ${bot.growth.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {bot.growth.revenueGrowth >= 0 ? '+' : ''}{bot.growth.revenueGrowth.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Subscriber Breakdown */}
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Subscription Plans</Label>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Free:</span>
                          <span className="text-white">{bot.plans.free.count} users</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Premium:</span>
                          <span className="text-yellow-400">{bot.plans.premium.count} users (${(bot.plans.premium.revenue / 1000).toFixed(1)}K)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Enterprise:</span>
                          <span className="text-purple-400">{bot.plans.enterprise.count} users (${(bot.plans.enterprise.revenue / 1000).toFixed(1)}K)</span>
                        </div>
                      </div>
                    </div>

                    {/* Usage Metrics */}
                    <div className="bg-gray-800/30 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">API Calls:</span>
                        <span className="text-white">{(bot.usage.apiCalls / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Trades:</span>
                        <span className="text-white">{bot.usage.trades.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Active Time:</span>
                        <span className="text-white">{bot.usage.activeTime}h</span>
                      </div>
                    </div>

                    {/* Growth Indicators */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className={`text-sm font-bold ${bot.growth.userGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {bot.growth.userGrowth >= 0 ? '+' : ''}{bot.growth.userGrowth.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">User Growth</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-bold ${bot.growth.usageGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {bot.growth.usageGrowth >= 0 ? '+' : ''}{bot.growth.usageGrowth.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Usage Growth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-purple-400">{bot.subscribers.conversionRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Conversion</div>
                      </div>
                    </div>

                    {/* Forecast */}
                    <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-700/50">
                      <div className="text-blue-200 font-semibold text-sm mb-2">Next Month Forecast</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Revenue:</span>
                          <div className="text-blue-400 font-bold">${(bot.forecast.nextMonthRevenue / 1000).toFixed(1)}K</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Users:</span>
                          <div className="text-blue-400 font-bold">{bot.forecast.nextMonthUsers}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-300">
                        Confidence: {bot.forecast.confidence}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trends and Forecasting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Revenue Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Revenue Trend Chart</h3>
                <p className="text-sm">Historical revenue trends, growth patterns, and performance analytics</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <strong className="text-white">Growth Tracking</strong>
                    <br />Monthly and quarterly trends
                  </div>
                  <div>
                    <strong className="text-white">Forecasting</strong>
                    <br />AI-powered revenue predictions
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-purple-400" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Revenue by Bot */}
              <div>
                <Label className="text-gray-400 text-sm">Revenue by Bot</Label>
                <div className="space-y-2 mt-2">
                  {revenueData
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .map((bot, index) => {
                      const percentage = (bot.totalRevenue / overallMetrics.totalRevenue) * 100
                      return (
                        <div key={bot.botId} className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full bg-blue-500" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }} />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-white">{bot.botName}</span>
                              <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={percentage} className="h-1 mt-1" />
                          </div>
                          <div className="text-green-400 text-sm font-bold">
                            ${(bot.totalRevenue / 1000).toFixed(0)}K
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Plan Distribution */}
              <div>
                <Label className="text-gray-400 text-sm">Plan Distribution</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <div className="text-gray-300 text-sm">Free</div>
                    <div className="text-white font-bold">
                      {revenueData.reduce((sum, bot) => sum + bot.plans.free.count, 0)}
                    </div>
                  </div>
                  <div className="bg-yellow-900/30 p-3 rounded-lg text-center border border-yellow-700/50">
                    <div className="text-yellow-300 text-sm">Premium</div>
                    <div className="text-white font-bold">
                      {revenueData.reduce((sum, bot) => sum + bot.plans.premium.count, 0)}
                    </div>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg text-center border border-purple-700/50">
                    <div className="text-purple-300 text-sm">Enterprise</div>
                    <div className="text-white font-bold">
                      {revenueData.reduce((sum, bot) => sum + bot.plans.enterprise.count, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-pink-400" />
            Advanced Revenue Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">{overallMetrics.churnRate.toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">Churn Rate</div>
                <div className={`text-xs mt-1 ${overallMetrics.churnRate <= 5 ? 'text-green-400' : overallMetrics.churnRate <= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {overallMetrics.churnRate <= 5 ? 'Excellent' : overallMetrics.churnRate <= 10 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">{overallMetrics.profitMargin.toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">Profit Margin</div>
                <div className="text-green-400 text-xs mt-1">Industry Leading</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">${(overallMetrics.annualRecurring / 1000000).toFixed(1)}M</div>
                <div className="text-gray-400 text-sm">Annual Recurring Revenue</div>
                <div className="text-purple-400 text-xs mt-1">ARR</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">24</div>
                <div className="text-gray-400 text-sm">Avg LTV Months</div>
                <div className="text-blue-400 text-xs mt-1">Customer Retention</div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-6 space-y-3">
            <h4 className="text-white font-semibold">Key Revenue Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="text-green-200 font-semibold">Top Performer</div>
                  <div className="text-green-300 text-sm">Execution Precision Protocol generates ${(revenueData[0]?.monthlyRevenue / 1000).toFixed(1)}K monthly with 18.7% conversion rate</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-blue-200 font-semibold">Growth Opportunity</div>
                  <div className="text-blue-300 text-sm">Oracle Bot has 8.7% growth rate - potential for optimization and marketing focus</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
