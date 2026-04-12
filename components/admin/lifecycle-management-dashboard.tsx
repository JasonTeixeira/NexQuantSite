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
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar } from "recharts"
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Settings,
  BarChart3,
  PieChartIcon,
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  Target,
  GitBranch,
  Workflow,
} from "lucide-react"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { userLifecycleAutomation } from "@/lib/user-lifecycle-automation"
import { toast } from "sonner"

interface UserLifecycleMetrics {
  stage: string
  userCount: number
  avgDuration: number
  completionRate: number
  conversionRate: number
  automationSuccessRate: number
  nextStageFlow: number
  revenueImpact: number
}

interface AutomationPerformance {
  ruleId: string
  ruleName: string
  stage: string
  triggered: number
  successful: number
  failed: number
  successRate: number
  avgResponseTime: number
  revenueGenerated: number
  lastTriggered: Date
  isActive: boolean
}

export default function LifecycleManagementDashboard() {
  const [lifecycleStages, setLifecycleStages] = useState(userLifecycleAutomation.getLifecycleStages())
  const [selectedStage, setSelectedStage] = useState<string>("onboarding")
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Mock data for lifecycle metrics
  const [lifecycleMetrics] = useState<UserLifecycleMetrics[]>([
    {
      stage: "onboarding",
      userCount: 1250,
      avgDuration: 4.2,
      completionRate: 87.5,
      conversionRate: 78.3,
      automationSuccessRate: 94.2,
      nextStageFlow: 81.4,
      revenueImpact: 0,
    },
    {
      stage: "activation",
      userCount: 980,
      avgDuration: 8.7,
      completionRate: 72.1,
      conversionRate: 65.8,
      automationSuccessRate: 89.7,
      nextStageFlow: 68.2,
      revenueImpact: 45000,
    },
    {
      stage: "engaged",
      userCount: 3200,
      avgDuration: 45.2,
      completionRate: 0,
      conversionRate: 0,
      automationSuccessRate: 92.1,
      nextStageFlow: 15.8,
      revenueImpact: 285000,
    },
    {
      stage: "at_risk",
      userCount: 890,
      avgDuration: 18.3,
      completionRate: 34.5,
      conversionRate: 28.7,
      automationSuccessRate: 76.3,
      nextStageFlow: 42.1,
      revenueImpact: -125000,
    },
    {
      stage: "churned",
      userCount: 432,
      avgDuration: 0,
      completionRate: 0,
      conversionRate: 0,
      automationSuccessRate: 45.2,
      nextStageFlow: 8.9,
      revenueImpact: -89000,
    },
  ])

  const [automationPerformance] = useState<AutomationPerformance[]>([
    {
      ruleId: "welcome_series",
      ruleName: "Welcome Email Series",
      stage: "onboarding",
      triggered: 1250,
      successful: 1178,
      failed: 72,
      successRate: 94.2,
      avgResponseTime: 2.3,
      revenueGenerated: 0,
      lastTriggered: new Date(Date.now() - 5 * 60 * 1000),
      isActive: true,
    },
    {
      ruleId: "activation_nudge",
      ruleName: "First Trade Activation",
      stage: "activation",
      triggered: 980,
      successful: 879,
      failed: 101,
      successRate: 89.7,
      avgResponseTime: 4.7,
      revenueGenerated: 45000,
      lastTriggered: new Date(Date.now() - 12 * 60 * 1000),
      isActive: true,
    },
    {
      ruleId: "engagement_maintain",
      ruleName: "Weekly Engagement",
      stage: "engaged",
      triggered: 3200,
      successful: 2947,
      failed: 253,
      successRate: 92.1,
      avgResponseTime: 1.8,
      revenueGenerated: 285000,
      lastTriggered: new Date(Date.now() - 3 * 60 * 1000),
      isActive: true,
    },
    {
      ruleId: "winback_campaign",
      ruleName: "At-Risk Win-Back",
      stage: "at_risk",
      triggered: 890,
      successful: 679,
      failed: 211,
      successRate: 76.3,
      avgResponseTime: 8.2,
      revenueGenerated: -125000,
      lastTriggered: new Date(Date.now() - 8 * 60 * 1000),
      isActive: true,
    },
  ])

  // Mock flow data for lifecycle progression
  const flowData = [
    { stage: "Registration", users: 5000, percentage: 100 },
    { stage: "Onboarding", users: 4200, percentage: 84 },
    { stage: "Activation", users: 3150, percentage: 63 },
    { stage: "Engaged", users: 2520, percentage: 50.4 },
    { stage: "At Risk", users: 378, percentage: 7.56 },
    { stage: "Recovered", users: 159, percentage: 3.18 },
  ]

  // Mock time series data
  const timeSeriesData = [
    { date: "2024-01-01", onboarding: 120, activation: 89, engaged: 245, at_risk: 45, churned: 23 },
    { date: "2024-01-02", onboarding: 135, activation: 102, engaged: 267, at_risk: 38, churned: 19 },
    { date: "2024-01-03", onboarding: 142, activation: 98, engaged: 289, at_risk: 52, churned: 31 },
    { date: "2024-01-04", onboarding: 128, activation: 115, engaged: 301, at_risk: 43, churned: 27 },
    { date: "2024-01-05", onboarding: 156, activation: 132, engaged: 324, at_risk: 39, churned: 22 },
    { date: "2024-01-06", onboarding: 148, activation: 127, engaged: 342, at_risk: 48, churned: 25 },
    { date: "2024-01-07", onboarding: 163, activation: 145, engaged: 358, at_risk: 41, churned: 28 },
  ]

  const engagementTrends = useMemo(() => {
    return lifecycleMetrics.map((metric) => ({
      stage: metric.stage,
      engagement: metric.automationSuccessRate,
      users: metric.userCount,
      completion: metric.completionRate,
    }))
  }, [lifecycleMetrics])

  const totalUsers = useMemo(() => {
    return lifecycleMetrics.reduce((sum, metric) => sum + metric.userCount, 0)
  }, [lifecycleMetrics])

  const overallPerformance = useMemo(() => {
    const totalTriggered = automationPerformance.reduce((sum, perf) => sum + perf.triggered, 0)
    const totalSuccessful = automationPerformance.reduce((sum, perf) => sum + perf.successful, 0)
    const totalRevenue = automationPerformance.reduce((sum, perf) => sum + perf.revenueGenerated, 0)
    const avgSuccessRate = totalTriggered > 0 ? (totalSuccessful / totalTriggered) * 100 : 0

    return {
      totalTriggered,
      totalSuccessful,
      totalRevenue,
      avgSuccessRate,
    }
  }, [automationPerformance])

  useEffect(() => {
    if (isRealTimeEnabled) {
      const interval = setInterval(() => {
        setLastUpdated(new Date())
        // In real implementation, this would fetch fresh data
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isRealTimeEnabled])

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "onboarding":
        return <Users className="w-5 h-5" />
      case "activation":
        return <PlayCircle className="w-5 h-5" />
      case "engaged":
        return <Activity className="w-5 h-5" />
      case "at_risk":
        return <AlertTriangle className="w-5 h-5" />
      case "churned":
        return <XCircle className="w-5 h-5" />
      default:
        return <div className="w-5 h-5" />
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "onboarding":
        return "text-blue-400"
      case "activation":
        return "text-green-400"
      case "engaged":
        return "text-purple-400"
      case "at_risk":
        return "text-yellow-400"
      case "churned":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const toggleAutomationRule = (ruleId: string) => {
    // In real implementation, this would call an API
    toast.success(`Automation rule ${ruleId} toggled`)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Workflow className="w-10 h-10 mr-4 text-primary" />
              USER <span className="text-primary ml-2">LIFECYCLE</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Automated user journey management with intelligent lifecycle tracking
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="realtime" checked={isRealTimeEnabled} onCheckedChange={setIsRealTimeEnabled} />
              <Label htmlFor="realtime" className="text-gray-300">
                Real-time Updates
              </Label>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] bg-white/10 border-primary/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-primary/30">
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {isRealTimeEnabled && <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />}
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users in Journey</p>
                    <p className="text-3xl font-bold text-white">{totalUsers.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">+8.2% this month</p>
                  </div>
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-black/40 border-green-500/30 hover:border-green-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Automation Success Rate</p>
                    <p className="text-3xl font-bold text-white">{overallPerformance.avgSuccessRate.toFixed(1)}%</p>
                    <p className="text-green-400 text-sm">+2.1% improvement</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Zap className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-black/40 border-blue-500/30 hover:border-blue-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Automations Triggered</p>
                    <p className="text-3xl font-bold text-white">
                      {overallPerformance.totalTriggered.toLocaleString()}
                    </p>
                    <p className="text-blue-400 text-sm">Last 30 days</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Activity className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-black/40 border-yellow-500/30 hover:border-yellow-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Revenue Impact</p>
                    <p className="text-3xl font-bold text-white">
                      ${(overallPerformance.totalRevenue / 1000).toFixed(0)}K
                    </p>
                    <p className={`text-sm ${overallPerformance.totalRevenue > 0 ? "text-green-400" : "text-red-400"}`}>
                      {overallPerformance.totalRevenue > 0 ? "+" : ""}
                      {((overallPerformance.totalRevenue / 1000000) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="stages" className="data-[state=active]:bg-primary">
              Lifecycle Stages
            </TabsTrigger>
            <TabsTrigger value="automations" className="data-[state=active]:bg-primary">
              Automations
            </TabsTrigger>
            <TabsTrigger value="flow" className="data-[state=active]:bg-primary">
              User Flow
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lifecycle Stage Distribution */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Stage Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Current user distribution across lifecycle stages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lifecycleMetrics.map((metric, index) => (
                      <div key={metric.stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`${getStageColor(metric.stage)}`}>{getStageIcon(metric.stage)}</div>
                          <div>
                            <div className="text-white font-medium capitalize">{metric.stage.replace("_", " ")}</div>
                            <div className="text-gray-400 text-sm">{metric.userCount.toLocaleString()} users</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {((metric.userCount / totalUsers) * 100).toFixed(1)}%
                          </div>
                          <Progress value={(metric.userCount / totalUsers) * 100} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lifecycle Trends */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Lifecycle Trends
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    User progression through lifecycle stages over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="onboarding"
                          stackId="1"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="activation"
                          stackId="1"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="engaged"
                          stackId="1"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="at_risk"
                          stackId="1"
                          stroke="#F59E0B"
                          fill="#F59E0B"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="churned"
                          stackId="1"
                          stroke="#EF4444"
                          fill="#EF4444"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Stage Performance Overview */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">Stage Performance Overview</CardTitle>
                <CardDescription className="text-gray-400">Detailed metrics for each lifecycle stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Stage</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Users</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg Duration</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Completion Rate</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Automation Success</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lifecycleMetrics.map((metric, index) => (
                        <tr key={metric.stage} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`${getStageColor(metric.stage)}`}>{getStageIcon(metric.stage)}</div>
                              <span className="text-white font-medium capitalize">
                                {metric.stage.replace("_", " ")}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-white font-medium">
                            {metric.userCount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-300">
                            {metric.avgDuration > 0 ? `${metric.avgDuration} days` : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`${
                                metric.completionRate > 70
                                  ? "text-green-400"
                                  : metric.completionRate > 40
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {metric.completionRate > 0 ? `${metric.completionRate}%` : "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`${
                                metric.automationSuccessRate > 90
                                  ? "text-green-400"
                                  : metric.automationSuccessRate > 75
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {metric.automationSuccessRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`${metric.revenueImpact > 0 ? "text-green-400" : metric.revenueImpact < 0 ? "text-red-400" : "text-gray-400"}`}
                            >
                              {metric.revenueImpact !== 0
                                ? `${metric.revenueImpact > 0 ? "+" : ""}$${(metric.revenueImpact / 1000).toFixed(0)}K`
                                : "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stages" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lifecycleStages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-3">
                        <div className={`${getStageColor(stage.id)}`}>{getStageIcon(stage.id)}</div>
                        {stage.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400">{stage.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Stage Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {lifecycleMetrics.find((m) => m.stage === stage.id)?.userCount.toLocaleString() || "0"}
                          </div>
                          <div className="text-xs text-gray-400">Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {lifecycleMetrics.find((m) => m.stage === stage.id)?.automationSuccessRate.toFixed(1) ||
                              "0"}
                            %
                          </div>
                          <div className="text-xs text-gray-400">Success Rate</div>
                        </div>
                      </div>

                      {/* Criteria */}
                      <div>
                        <h4 className="text-white font-medium mb-2">Entry Criteria</h4>
                        <div className="space-y-1">
                          {stage.criteria.map((criteria, idx) => (
                            <div key={criteria.id} className="text-xs text-gray-300 bg-gray-800/30 rounded px-2 py-1">
                              {criteria.field} {criteria.operator} {criteria.value?.toString()}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <h4 className="text-white font-medium mb-2">Automated Actions</h4>
                        <div className="space-y-1">
                          {stage.actions.map((action, idx) => (
                            <div key={action.id} className="flex items-center gap-2 text-xs">
                              {action.type === "email" && <Mail className="w-3 h-3 text-blue-400" />}
                              {action.type === "sms" && <MessageSquare className="w-3 h-3 text-green-400" />}
                              {action.type === "push" && <Smartphone className="w-3 h-3 text-purple-400" />}
                              {action.type === "in_app" && <Bell className="w-3 h-3 text-yellow-400" />}
                              <span className="text-gray-300">{action.template || action.content || action.type}</span>
                              {action.delay && (
                                <Badge className="bg-gray-700 text-gray-300 text-xs ml-auto">
                                  {action.delay > 60 ? `${Math.floor(action.delay / 60)}h` : `${action.delay}m`}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Duration */}
                      {stage.duration && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                          <span className="text-gray-400 text-sm">Duration</span>
                          <span className="text-white text-sm">{stage.duration} days</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="automations" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {automationPerformance.map((automation, index) => (
                <motion.div
                  key={automation.ruleId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-black/40 border-primary/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`${getStageColor(automation.stage)}`}>{getStageIcon(automation.stage)}</div>
                          <div>
                            <CardTitle className="text-white">{automation.ruleName}</CardTitle>
                            <CardDescription className="text-gray-400 capitalize">
                              {automation.stage.replace("_", " ")} Stage
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${
                              automation.isActive
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}
                          >
                            {automation.isActive ? "Active" : "Paused"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleAutomationRule(automation.ruleId)}
                            className={`${
                              automation.isActive
                                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            }`}
                          >
                            {automation.isActive ? (
                              <PauseCircle className="w-4 h-4" />
                            ) : (
                              <PlayCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{automation.triggered.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Triggered</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {automation.successful.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">{automation.failed.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Failed</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-2xl font-bold ${
                              automation.successRate > 90
                                ? "text-green-400"
                                : automation.successRate > 75
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {automation.successRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {automation.avgResponseTime.toFixed(1)}s
                          </div>
                          <div className="text-xs text-gray-400">Avg Response</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-2xl font-bold ${
                              automation.revenueGenerated > 0
                                ? "text-green-400"
                                : automation.revenueGenerated < 0
                                  ? "text-red-400"
                                  : "text-gray-400"
                            }`}
                          >
                            {automation.revenueGenerated !== 0
                              ? `${automation.revenueGenerated > 0 ? "+" : ""}$${(automation.revenueGenerated / 1000).toFixed(0)}K`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-400">Revenue Impact</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">Last Triggered:</span>
                          <span className="text-white">{formatTimeAgo(automation.lastTriggered)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={automation.successRate} className="w-20 h-2" />
                          <span className="text-gray-300 text-xs">{automation.successRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flow" className="space-y-6">
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  User Lifecycle Flow
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Visual representation of user progression through lifecycle stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flowData.map((step, index) => (
                    <div key={step.stage} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="text-white font-medium">{step.stage}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{step.users.toLocaleString()} users</div>
                            <div className="text-gray-400 text-sm">{step.percentage}%</div>
                          </div>
                        </div>
                        <Progress value={step.percentage} className="h-3" />
                      </div>
                      {index < flowData.length - 1 && (
                        <div className="text-gray-400">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement vs Success Rate */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Automation Performance
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Success rates across different lifecycle stages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagementTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="stage" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="engagement" fill="#00ff44" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue Impact by Stage */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Revenue Impact Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-400">Revenue attribution by lifecycle stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={lifecycleMetrics.map((m) => ({
                          stage: m.stage.replace("_", " "),
                          revenue: m.revenueImpact / 1000,
                          users: m.userCount,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="stage" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics Summary */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">Advanced Analytics Summary</CardTitle>
                <CardDescription className="text-gray-400">
                  Key insights and recommendations from lifecycle data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h4 className="text-white font-medium">Top Performer</h4>
                    </div>
                    <p className="text-green-300 text-sm mb-2">
                      Engaged stage shows highest automation success rate at 92.1%
                    </p>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Optimize for retention</Badge>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-white font-medium">Needs Attention</h4>
                    </div>
                    <p className="text-yellow-300 text-sm mb-2">
                      At-risk stage has 76.3% automation success - improve win-back campaigns
                    </p>
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Action required</Badge>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-medium">Opportunity</h4>
                    </div>
                    <p className="text-blue-300 text-sm mb-2">
                      Activation stage shows 65.8% conversion - optimize onboarding flow
                    </p>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">Growth potential</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
