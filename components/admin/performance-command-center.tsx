"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChartContainer } from "@/components/ui/chart"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, BarChart, Bar, ComposedChart
} from "recharts"
import {
  Activity, Zap, Cpu, HardDrive, Wifi, Database, Server, Globe,
  AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  RefreshCw, Settings, Download, Eye, Target, Monitor, BarChart3,
  Gauge, ThermometerSun, Shield, ArrowUp, ArrowDown, Minus
} from "lucide-react"
import { toast } from "sonner"

interface SystemMetrics {
  cpu: { usage: number; cores: number; temperature: number; processes: number }
  memory: { used: number; total: number; percentage: number; available: number }
  disk: { used: number; total: number; percentage: number; readSpeed: number; writeSpeed: number }
  network: { inbound: number; outbound: number; latency: number; packetsLost: number }
}

interface PerformanceMetrics {
  webVitals: { lcp: number; fid: number; cls: number; fcp: number; ttfb: number }
  lighthouse: { performance: number; accessibility: number; bestPractices: number; seo: number; pwa: number }
  userExperience: { pageLoadTime: number; bounceRate: number; errorRate: number; uptime: number; availability: number }
}

interface ApplicationMetrics {
  api: { responseTime: number; requestsPerSecond: number; errorRate: number; activeConnections: number; cacheHitRate: number }
  database: { queryTime: number; connections: number; cacheHitRate: number; slowQueries: number; lockWaitTime: number }
  security: { threats: number; blockedRequests: number; failedLogins: number; securityScore: number }
}

const METRIC_THRESHOLDS = {
  cpu: { warning: 70, critical: 85 },
  memory: { warning: 75, critical: 90 },
  disk: { warning: 80, critical: 95 },
  responseTime: { warning: 500, critical: 1000 },
  errorRate: { warning: 1, critical: 5 },
  uptime: { warning: 99.5, critical: 99.0 }
}

export default function PerformanceCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, cores: 0, temperature: 0, processes: 0 },
    memory: { used: 0, total: 0, percentage: 0, available: 0 },
    disk: { used: 0, total: 0, percentage: 0, readSpeed: 0, writeSpeed: 0 },
    network: { inbound: 0, outbound: 0, latency: 0, packetsLost: 0 }
  })

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    webVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
    lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, pwa: 0 },
    userExperience: { pageLoadTime: 0, bounceRate: 0, errorRate: 0, uptime: 0, availability: 0 }
  })

  const [applicationMetrics, setApplicationMetrics] = useState<ApplicationMetrics>({
    api: { responseTime: 0, requestsPerSecond: 0, errorRate: 0, activeConnections: 0, cacheHitRate: 0 },
    database: { queryTime: 0, connections: 0, cacheHitRate: 0, slowQueries: 0, lockWaitTime: 0 },
    security: { threats: 0, blockedRequests: 0, failedLogins: 0, securityScore: 0 }
  })

  useEffect(() => {
    loadPerformanceData()
  }, [selectedTimeframe])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRealTimeEnabled) {
      interval = setInterval(() => {
        updateRealTimeMetrics()
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  const loadPerformanceData = async () => {
    setIsLoading(true)
    try {
      // Mock comprehensive performance data
      const mockSystemMetrics: SystemMetrics = {
        cpu: { usage: 45.8, cores: 8, temperature: 62, processes: 147 },
        memory: { used: 12.4, total: 16, percentage: 77.5, available: 3.6 },
        disk: { used: 456, total: 1024, percentage: 44.5, readSpeed: 145.6, writeSpeed: 89.2 },
        network: { inbound: 234.5, outbound: 187.3, latency: 23, packetsLost: 0.02 }
      }

      const mockPerformanceMetrics: PerformanceMetrics = {
        webVitals: { lcp: 1.2, fid: 45, cls: 0.08, fcp: 0.9, ttfb: 234 },
        lighthouse: { performance: 94, accessibility: 97, bestPractices: 92, seo: 89, pwa: 85 },
        userExperience: { pageLoadTime: 1.8, bounceRate: 32.5, errorRate: 0.8, uptime: 99.95, availability: 99.98 }
      }

      const mockApplicationMetrics: ApplicationMetrics = {
        api: { responseTime: 156, requestsPerSecond: 1247, errorRate: 0.3, activeConnections: 892, cacheHitRate: 94.2 },
        database: { queryTime: 23, connections: 45, cacheHitRate: 87.5, slowQueries: 2, lockWaitTime: 12 },
        security: { threats: 17, blockedRequests: 145, failedLogins: 8, securityScore: 95 }
      }

      setSystemMetrics(mockSystemMetrics)
      setPerformanceMetrics(mockPerformanceMetrics)
      setApplicationMetrics(mockApplicationMetrics)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading performance data:", error)
      toast.error("Failed to load performance data")
      setIsLoading(false)
    }
  }

  const updateRealTimeMetrics = () => {
    setSystemMetrics(prev => ({
      ...prev,
      cpu: {
        ...prev.cpu,
        usage: Math.max(10, Math.min(95, prev.cpu.usage + (Math.random() - 0.5) * 5)),
        temperature: Math.max(40, Math.min(85, prev.cpu.temperature + (Math.random() - 0.5) * 2))
      },
      memory: {
        ...prev.memory,
        percentage: Math.max(20, Math.min(95, prev.memory.percentage + (Math.random() - 0.5) * 3))
      },
      network: {
        ...prev.network,
        inbound: Math.max(0, prev.network.inbound + (Math.random() - 0.5) * 50),
        outbound: Math.max(0, prev.network.outbound + (Math.random() - 0.5) * 30),
        latency: Math.max(10, Math.min(100, prev.network.latency + (Math.random() - 0.5) * 5))
      }
    }))

    setApplicationMetrics(prev => ({
      ...prev,
      api: {
        ...prev.api,
        responseTime: Math.max(50, Math.min(2000, prev.api.responseTime + (Math.random() - 0.5) * 100)),
        requestsPerSecond: Math.max(100, prev.api.requestsPerSecond + (Math.random() - 0.5) * 200)
      }
    }))

    setLastUpdated(new Date())
  }

  const performanceTimeSeriesData = [
    { time: "00:00", cpu: 42, memory: 68, responseTime: 145, requests: 1100 },
    { time: "00:05", cpu: 45, memory: 71, responseTime: 156, requests: 1205 },
    { time: "00:10", cpu: 38, memory: 74, responseTime: 134, requests: 1340 },
    { time: "00:15", cpu: 52, memory: 72, responseTime: 189, requests: 1180 },
    { time: "00:20", cpu: 46, memory: 75, responseTime: 167, requests: 1425 },
    { time: "00:25", cpu: 41, memory: 78, responseTime: 142, requests: 1390 }
  ]

  const getMetricStatus = (value: number, thresholds: { warning: number; critical: number }, reverse = false) => {
    if (reverse) {
      if (value < thresholds.critical) return { color: "text-red-400", status: "critical" }
      if (value < thresholds.warning) return { color: "text-yellow-400", status: "warning" }
      return { color: "text-green-400", status: "good" }
    } else {
      if (value > thresholds.critical) return { color: "text-red-400", status: "critical" }
      if (value > thresholds.warning) return { color: "text-yellow-400", status: "warning" }
      return { color: "text-green-400", status: "good" }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical": return <XCircle className="w-4 h-4 text-red-400" />
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "good": return <CheckCircle className="w-4 h-4 text-green-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const overallSystemHealth = useMemo(() => {
    const cpuStatus = getMetricStatus(systemMetrics.cpu.usage, METRIC_THRESHOLDS.cpu)
    const memoryStatus = getMetricStatus(systemMetrics.memory.percentage, METRIC_THRESHOLDS.memory)
    const diskStatus = getMetricStatus(systemMetrics.disk.percentage, METRIC_THRESHOLDS.disk)
    const responseStatus = getMetricStatus(applicationMetrics.api.responseTime, METRIC_THRESHOLDS.responseTime)

    const criticalCount = [cpuStatus, memoryStatus, diskStatus, responseStatus]
      .filter(s => s.status === "critical").length

    if (criticalCount > 0) return { status: "critical", color: "text-red-400", text: "Critical Issues" }
    
    const warningCount = [cpuStatus, memoryStatus, diskStatus, responseStatus]
      .filter(s => s.status === "warning").length
      
    if (warningCount > 0) return { status: "warning", color: "text-yellow-400", text: "Performance Issues" }
    
    return { status: "good", color: "text-green-400", text: "All Systems Operational" }
  }, [systemMetrics, applicationMetrics])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading performance monitoring...</p>
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
            <Monitor className="w-8 h-8 mr-3 text-blue-400" />
            Performance Command Center
          </h1>
          <p className="text-gray-400 mt-1">
            Comprehensive system, application, and user experience monitoring
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
              <SelectItem value="5m">5 Minutes</SelectItem>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadPerformanceData} className="border-gray-600 text-gray-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card className={`bg-gray-900/50 border-2 ${overallSystemHealth.status === 'critical' ? 'border-red-500/30' : overallSystemHealth.status === 'warning' ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(overallSystemHealth.status)}
              <div>
                <h2 className={`text-xl font-bold ${overallSystemHealth.color}`}>
                  {overallSystemHealth.text}
                </h2>
                <p className="text-gray-400 text-sm">
                  System status as of {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{performanceMetrics.userExperience.uptime}%</div>
                <div className="text-gray-400 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{applicationMetrics.api.responseTime}ms</div>
                <div className="text-gray-400 text-sm">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{applicationMetrics.api.requestsPerSecond}</div>
                <div className="text-gray-400 text-sm">Requests/sec</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">System Overview</TabsTrigger>
          <TabsTrigger value="webvitals" className="data-[state=active]:bg-blue-600">Web Vitals</TabsTrigger>
          <TabsTrigger value="application" className="data-[state=active]:bg-blue-600">Application</TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-blue-600">Database</TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">Alerts & Config</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">CPU Usage</p>
                    <p className={`text-2xl font-bold ${getMetricStatus(systemMetrics.cpu.usage, METRIC_THRESHOLDS.cpu).color}`}>
                      {systemMetrics.cpu.usage.toFixed(1)}%
                    </p>
                    <p className="text-gray-500 text-xs">{systemMetrics.cpu.cores} cores • {systemMetrics.cpu.temperature}°C</p>
                  </div>
                  <Cpu className="w-8 h-8 text-blue-400" />
                </div>
                <div className="mt-2">
                  <Progress value={systemMetrics.cpu.usage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Memory Usage</p>
                    <p className={`text-2xl font-bold ${getMetricStatus(systemMetrics.memory.percentage, METRIC_THRESHOLDS.memory).color}`}>
                      {systemMetrics.memory.percentage.toFixed(1)}%
                    </p>
                    <p className="text-gray-500 text-xs">{systemMetrics.memory.used}GB / {systemMetrics.memory.total}GB</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-green-400" />
                </div>
                <div className="mt-2">
                  <Progress value={systemMetrics.memory.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Disk Usage</p>
                    <p className={`text-2xl font-bold ${getMetricStatus(systemMetrics.disk.percentage, METRIC_THRESHOLDS.disk).color}`}>
                      {systemMetrics.disk.percentage.toFixed(1)}%
                    </p>
                    <p className="text-gray-500 text-xs">{systemMetrics.disk.used}GB / {systemMetrics.disk.total}GB</p>
                  </div>
                  <Database className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <Progress value={systemMetrics.disk.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Network Latency</p>
                    <p className={`text-2xl font-bold ${systemMetrics.network.latency < 50 ? 'text-green-400' : systemMetrics.network.latency < 100 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {systemMetrics.network.latency}ms
                    </p>
                    <p className="text-gray-500 text-xs">
                      ↓ {systemMetrics.network.inbound.toFixed(1)} MB/s • ↑ {systemMetrics.network.outbound.toFixed(1)} MB/s
                    </p>
                  </div>
                  <Wifi className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance Trends
                </CardTitle>
                <CardDescription>System metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <ComposedChart data={performanceTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }} />
                    <Area yAxisId="left" type="monotone" dataKey="cpu" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name="CPU %" />
                    <Area yAxisId="left" type="monotone" dataKey="memory" fill="#10B981" fillOpacity={0.3} stroke="#10B981" name="Memory %" />
                    <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#F59E0B" strokeWidth={2} name="Response Time (ms)" />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  System Resources
                </CardTitle>
                <CardDescription>Current resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">CPU Usage</span>
                      <span className={getMetricStatus(systemMetrics.cpu.usage, METRIC_THRESHOLDS.cpu).color}>
                        {systemMetrics.cpu.usage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.cpu.usage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Memory Usage</span>
                      <span className={getMetricStatus(systemMetrics.memory.percentage, METRIC_THRESHOLDS.memory).color}>
                        {systemMetrics.memory.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.memory.percentage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Disk Usage</span>
                      <span className={getMetricStatus(systemMetrics.disk.percentage, METRIC_THRESHOLDS.disk).color}>
                        {systemMetrics.disk.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.disk.percentage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Cache Hit Rate</span>
                      <span className="text-green-400">
                        {applicationMetrics.api.cacheHitRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={applicationMetrics.api.cacheHitRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webvitals" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Core Web Vitals
              </CardTitle>
              <CardDescription>Google Core Web Vitals performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(performanceMetrics.webVitals).map(([key, value]) => (
                  <Card key={key} className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <div className="mb-2">
                        <div className="text-2xl font-bold text-blue-400">
                          {key === 'cls' ? value.toFixed(3) : Math.round(value)}
                          {key === 'lcp' || key === 'fcp' ? 's' : key === 'fid' || key === 'ttfb' ? 'ms' : ''}
                        </div>
                        <div className="text-gray-400 text-sm uppercase">{key}</div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Good</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  API Performance
                </CardTitle>
                <CardDescription>Application layer performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Response Time</span>
                    <span className={getMetricStatus(applicationMetrics.api.responseTime, METRIC_THRESHOLDS.responseTime).color}>
                      {applicationMetrics.api.responseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Requests/Second</span>
                    <span className="text-white">{applicationMetrics.api.requestsPerSecond}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Error Rate</span>
                    <span className={getMetricStatus(applicationMetrics.api.errorRate, METRIC_THRESHOLDS.errorRate).color}>
                      {applicationMetrics.api.errorRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Connections</span>
                    <span className="text-white">{applicationMetrics.api.activeConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Metrics
                </CardTitle>
                <CardDescription>Security monitoring and threat detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Security Score</span>
                    <span className="text-green-400">{applicationMetrics.security.securityScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Threats</span>
                    <span className={applicationMetrics.security.threats > 0 ? 'text-yellow-400' : 'text-green-400'}>
                      {applicationMetrics.security.threats}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Blocked Requests</span>
                    <span className="text-blue-400">{applicationMetrics.security.blockedRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Failed Logins</span>
                    <span className={applicationMetrics.security.failedLogins > 10 ? 'text-yellow-400' : 'text-green-400'}>
                      {applicationMetrics.security.failedLogins}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Database Performance
              </CardTitle>
              <CardDescription>Database layer performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Query Time</span>
                    <span className="text-white">{applicationMetrics.database.queryTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Connections</span>
                    <span className="text-white">{applicationMetrics.database.connections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Cache Hit Rate</span>
                    <span className="text-green-400">{applicationMetrics.database.cacheHitRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Slow Queries</span>
                    <span className={applicationMetrics.database.slowQueries === 0 ? 'text-green-400' : 'text-yellow-400'}>
                      {applicationMetrics.database.slowQueries}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Query Performance</span>
                      <span className="text-green-400">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Connection Pool</span>
                      <span className="text-blue-400">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Alert Configuration
              </CardTitle>
              <CardDescription>System monitoring and alert settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">CPU Threshold Alert</p>
                    <p className="text-gray-400 text-sm">Alert when CPU usage exceeds 85%</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Memory Threshold Alert</p>
                    <p className="text-gray-400 text-sm">Alert when memory usage exceeds 90%</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Response Time Alert</p>
                    <p className="text-gray-400 text-sm">Alert when API response time exceeds 1000ms</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Security Alert</p>
                    <p className="text-gray-400 text-sm">Alert on suspicious activity or threats</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
