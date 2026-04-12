"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, TrendingUp, DollarSign, Activity, AlertTriangle, Zap, BarChart3, Shield, Server, 
  Bell, Settings, Calendar, Download, RefreshCw, Eye, EyeOff, Globe, Smartphone,
  Filter, Clock, Target, Brain, TrendingDown, ArrowUpRight, ArrowDownRight,
  Database, Network, Lock, Gauge, LineChart, PieChart, Building2, Crown, Layers,
  Grid, Wifi, Play, Pause, Search as SearchIcon
} from "lucide-react"
import { toast } from "sonner"

// Import our SaaS engines
import { tenantManager, Tenant } from "@/lib/saas/tenant-manager"
import { apiGateway } from "@/lib/saas/api-gateway"
import { realtimeEngine } from "@/lib/saas/realtime-engine"
import { securityEngine } from "@/lib/saas/security-engine"
import { monitoringEngine } from "@/lib/saas/monitoring-engine"

// Import Global Infrastructure components
import GlobalInfrastructureDashboard from "@/components/global/GlobalInfrastructureDashboard"

// Import Options Flow components
import { OptionsFlowGenerator, OptionsFlow } from "@/lib/options-flow-data"

interface UnifiedMetrics {
  // Traditional Admin Metrics
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  conversionRate: number
  churnRate: number
  customerSatisfaction: number
  
  // SaaS Platform Metrics
  totalTenants: number
  activeTenants: number
  trialTenants: number
  totalApiRequests: number
  responseTime: number
  uptime: number
  errorRate: number
  
  // System Health
  serverLoad: number
  databaseConnections: number
  cacheHitRate: number
  storageUsage: number
  securityEvents: number
  threatsBlocked: number
  complianceScore: number
}

interface DashboardAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: Date
  source: string
}

export default function UnifiedAdminDashboard() {
  const [metrics, setMetrics] = useState<UnifiedMetrics | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  
  // Options Flow State Management
  const [optionsFlowData, setOptionsFlowData] = useState<OptionsFlow[]>([])
  const [isOptionsFlowLive, setIsOptionsFlowLive] = useState(false)
  const [optionsFlowSpeed, setOptionsFlowSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [optionsFlowFilter, setOptionsFlowFilter] = useState<'all' | 'unusual' | 'smart-money'>('all')
  const [optionsFlowSymbol, setOptionsFlowSymbol] = useState<'ALL' | 'SPY' | 'QQQ' | 'AAPL' | 'MSFT' | 'TSLA'>('ALL')

  useEffect(() => {
    loadUnifiedDashboardData()
    
    // Initialize Options Flow data
    setOptionsFlowData(OptionsFlowGenerator.generateRealtimeFlow(25))
    
    // Real-time updates
    const interval = setInterval(loadUnifiedDashboardData, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [selectedTimeRange])

  // Options Flow Live Updates
  useEffect(() => {
    if (!isOptionsFlowLive) return

    const speedMap = {
      slow: 10000,
      normal: 5000,
      fast: 2000
    }

    const interval = setInterval(() => {
      setOptionsFlowData(prev => {
        const newFlow = OptionsFlowGenerator.generateRealtimeFlow(1)
        const updated = [...newFlow, ...prev].slice(0, 100) // Keep last 100 flows
        return updated
      })
    }, speedMap[optionsFlowSpeed])

    return () => clearInterval(interval)
  }, [isOptionsFlowLive, optionsFlowSpeed])

  const loadUnifiedDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Unified metrics combining traditional admin + SaaS
      const unifiedMetrics: UnifiedMetrics = {
        // Traditional Admin
        totalUsers: 12450,
        activeUsers: 8920,
        newUsers: 342,
        totalRevenue: 485720,
        monthlyRecurringRevenue: 125000,
        conversionRate: 3.2,
        churnRate: 2.1,
        customerSatisfaction: 4.8,
        
        // SaaS Platform
        totalTenants: 1247,
        activeTenants: 1156,
        trialTenants: 91,
        totalApiRequests: 15420000,
        responseTime: 89,
        uptime: 99.97,
        errorRate: 0.03,
        
        // System Health
        serverLoad: 67,
        databaseConnections: 342,
        cacheHitRate: 94.2,
        storageUsage: 78,
        securityEvents: 12,
        threatsBlocked: 145,
        complianceScore: 96
      }
      
      // Load tenant data
      const tenantAnalytics = await tenantManager.getAllTenantsAnalytics()
      
      // Generate unified alerts
      const dashboardAlerts: DashboardAlert[] = [
        {
          id: '1',
          type: 'warning',
          message: 'High API usage detected for enterprise tenant',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          source: 'API Gateway'
        },
        {
          id: '2',
          type: 'info',
          message: 'New enterprise tenant onboarded successfully',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          source: 'Tenant Manager'
        },
        {
          id: '3',
          type: 'error',
          message: 'Security threat blocked from suspicious IP',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          source: 'Security Engine'
        },
        {
          id: '4',
          type: 'critical',
          message: 'Database connection spike detected',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          source: 'Monitoring'
        }
      ]
      
      setMetrics(unifiedMetrics)
      setAlerts(dashboardAlerts)
      
    } catch (error) {
      console.error('Error loading unified dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshData = () => {
    loadUnifiedDashboardData()
    toast.success("Dashboard data refreshed!")
  }

  const handleExportData = () => {
    toast.success("Dashboard data exported successfully!")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Server className="w-16 h-16 text-primary" />
            </motion.div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">Loading Unified Admin Dashboard...</h2>
              <p className="text-gray-400">Aggregating platform, tenant, and system metrics</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced Header */}
      <div className="border-b border-gray-800 bg-black/60 backdrop-blur-md">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Server className="w-10 h-10 text-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Enterprise Admin Control Center</h1>
                <p className="text-gray-400">Unified Platform & SaaS Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={handleRefreshData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto p-6 space-y-6">
        {/* Critical Alerts Bar */}
        {alerts.filter(a => a.type === 'critical' || a.type === 'error').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="flex-1">
                <h3 className="font-medium text-red-400 mb-1">
                  Critical Alerts ({alerts.filter(a => a.type === 'critical' || a.type === 'error').length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {alerts.filter(a => a.type === 'critical' || a.type === 'error').slice(0, 3).map(alert => (
                    <Badge 
                      key={alert.id} 
                      variant="outline" 
                      className="text-xs border-red-500/30 text-red-400"
                    >
                      {alert.source}: {alert.message.slice(0, 50)}...
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </motion.div>
        )}

        {/* Unified Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-10 bg-black/40 border border-primary/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="options-flow">Options Flow</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="api">API Gateway</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Unified KPIs */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top-Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-black/40 backdrop-blur-sm border border-green-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-400">Total Revenue</p>
                        <p className="text-3xl font-bold text-white">
                          ${metrics.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          MRR: ${metrics.monthlyRecurringRevenue.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-black/40 backdrop-blur-sm border border-blue-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-400">Active Users/Tenants</p>
                        <p className="text-3xl font-bold text-white">
                          {metrics.activeUsers.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {metrics.activeTenants} active tenants
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-400">API Performance</p>
                        <p className="text-3xl font-bold text-white">
                          {(metrics.totalApiRequests / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {metrics.responseTime}ms avg response
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-black/40 backdrop-blur-sm border border-orange-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-400">System Health</p>
                        <p className="text-3xl font-bold text-white">
                          {metrics.uptime}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {metrics.errorRate}% error rate
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Platform Health Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-primary" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Server Load</span>
                      <span className="text-sm font-medium">{metrics.serverLoad}%</span>
                    </div>
                    <Progress value={metrics.serverLoad} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Cache Hit Rate</span>
                      <span className="text-sm font-medium">{metrics.cacheHitRate}%</span>
                    </div>
                    <Progress value={metrics.cacheHitRate} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Storage Usage</span>
                      <span className="text-sm font-medium">{metrics.storageUsage}%</span>
                    </div>
                    <Progress value={metrics.storageUsage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">{metrics.securityEvents}</div>
                      <div className="text-sm text-gray-400">Security Events</div>
                    </div>
                    
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{metrics.threatsBlocked}</div>
                      <div className="text-sm text-gray-400">Threats Blocked</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Compliance Score</span>
                    <span className="text-sm font-medium">{metrics.complianceScore}%</span>
                  </div>
                  <Progress value={metrics.complianceScore} className="h-2" />
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Business Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Conversion Rate</span>
                      <span className="text-sm font-medium text-green-400">{metrics.conversionRate}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Churn Rate</span>
                      <span className="text-sm font-medium text-red-400">{metrics.churnRate}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Customer Satisfaction</span>
                      <span className="text-sm font-medium text-primary">{metrics.customerSatisfaction}/5.0</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Trial Tenants</span>
                      <span className="text-sm font-medium text-yellow-400">{metrics.trialTenants}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Activity Feed */}
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Unified Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {alerts.map((alert, i) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'critical' ? 'bg-red-500 animate-pulse' :
                        alert.type === 'error' ? 'bg-orange-500' :
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm text-white">{alert.message}</div>
                        <div className="text-xs text-gray-400">
                          {alert.timestamp.toLocaleTimeString()} • {alert.source}
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${
                        alert.type === 'critical' ? 'border-red-500/30 text-red-400' :
                        alert.type === 'error' ? 'border-orange-500/30 text-orange-400' :
                        alert.type === 'warning' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-green-500/30 text-green-400'
                      }`}>
                        {alert.type}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Options Flow Management Tab */}
          <TabsContent value="options-flow" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Options Flow Control Center</h2>
                  <p className="text-gray-400">Manage and monitor real-time options flow data</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`px-3 py-1 ${isOptionsFlowLive ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                  <Wifi className="w-4 h-4 mr-1" />
                  {isOptionsFlowLive ? 'LIVE' : 'STOPPED'}
                </Badge>
                <Button
                  variant={isOptionsFlowLive ? "destructive" : "default"}
                  onClick={() => setIsOptionsFlowLive(!isOptionsFlowLive)}
                  className="min-w-[120px]"
                >
                  {isOptionsFlowLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isOptionsFlowLive ? 'Stop Flow' : 'Start Flow'}
                </Button>
              </div>
            </div>

            {/* Options Flow System Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-black/40 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Active Flows</p>
                      <p className="text-2xl font-bold text-primary">{optionsFlowData.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Real-time option flows</p>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Smart Money</p>
                      <p className="text-2xl font-bold text-green-400">
                        {Math.round(optionsFlowData.filter(f => f.smartMoneyScore > 70).length / Math.max(optionsFlowData.length, 1) * 100)}%
                      </p>
                    </div>
                    <Brain className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Institutional flow</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Unusual Activity</p>
                      <p className="text-2xl font-bold text-yellow-400">{optionsFlowData.filter(f => f.isUnusual).length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Anomaly alerts</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Total Premium</p>
                      <p className="text-2xl font-bold text-blue-400">
                        ${(optionsFlowData.reduce((sum, f) => sum + (f.size * f.premium), 0) / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Volume today</p>
                </CardContent>
              </Card>
            </div>

            {/* Options Flow Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Data Controls */}
              <Card className="bg-black/40 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="w-5 h-5 text-primary" />
                    Flow Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Update Speed</label>
                    <Select value={optionsFlowSpeed} onValueChange={(value: any) => setOptionsFlowSpeed(value)}>
                      <SelectTrigger className="bg-black/60 border-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow (10s intervals)</SelectItem>
                        <SelectItem value="normal">Normal (5s intervals)</SelectItem>
                        <SelectItem value="fast">Fast (2s intervals)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400">Symbol Filter</label>
                    <Select value={optionsFlowSymbol} onValueChange={(value: any) => setOptionsFlowSymbol(value)}>
                      <SelectTrigger className="bg-black/60 border-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Symbols</SelectItem>
                        <SelectItem value="SPY">SPY</SelectItem>
                        <SelectItem value="QQQ">QQQ</SelectItem>
                        <SelectItem value="AAPL">AAPL</SelectItem>
                        <SelectItem value="MSFT">MSFT</SelectItem>
                        <SelectItem value="TSLA">TSLA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400">Flow Type</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        variant={optionsFlowFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOptionsFlowFilter('all')}
                        className="h-8"
                      >
                        All Flow
                      </Button>
                      <Button
                        variant={optionsFlowFilter === 'unusual' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOptionsFlowFilter('unusual')}
                        className="h-8"
                      >
                        Unusual
                      </Button>
                      <Button
                        variant={optionsFlowFilter === 'smart-money' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOptionsFlowFilter('smart-money')}
                        className="h-8"
                      >
                        Smart Money
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setOptionsFlowData(OptionsFlowGenerator.generateRealtimeFlow(50))
                        toast.success('Options flow data refreshed')
                      }}
                      className="flex-1"
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Data
                    </Button>
                    <Button
                      onClick={() => {
                        setOptionsFlowData([])
                        toast.info('Options flow data cleared')
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Clear Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Configuration */}
              <Card className="bg-black/40 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5 text-blue-400" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <span className="text-green-400 font-medium">Data Feed</span>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                      <Activity className="w-4 h-4 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <span className="text-blue-400 font-medium">AI Engine</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Brain className="w-4 h-4 mr-1" />
                      Online
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <span className="text-yellow-400 font-medium">Alert System</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <Bell className="w-4 h-4 mr-1" />
                      Ready
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <Button
                      onClick={() => window.open('/options-flow', '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Open Options Flow Platform
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Options Flow Activity */}
            <Card className="bg-black/40 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Grid className="w-5 h-5 text-purple-400" />
                  Recent Flow Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {optionsFlowData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-gray-400">Time</th>
                          <th className="text-left py-3 px-4 text-gray-400">Symbol</th>
                          <th className="text-left py-3 px-4 text-gray-400">Type</th>
                          <th className="text-left py-3 px-4 text-gray-400">Strike</th>
                          <th className="text-left py-3 px-4 text-gray-400">Size</th>
                          <th className="text-left py-3 px-4 text-gray-400">Premium</th>
                          <th className="text-left py-3 px-4 text-gray-400">Score</th>
                          <th className="text-left py-3 px-4 text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optionsFlowData.slice(0, 10).map((flow, index) => (
                          <tr key={index} className="border-b border-gray-800/50 hover:bg-primary/5">
                            <td className="py-3 px-4 text-gray-300">{flow.timestamp.toLocaleTimeString()}</td>
                            <td className="py-3 px-4 font-bold text-white">{flow.symbol}</td>
                            <td className="py-3 px-4">
                              <Badge variant={flow.type === 'call' ? 'default' : 'destructive'}>
                                {flow.type}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-300">${flow.strike}</td>
                            <td className="py-3 px-4 text-blue-400">{flow.size.toLocaleString()}</td>
                            <td className="py-3 px-4 text-green-400">${flow.premium.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <div className="text-sm font-mono text-white">{flow.smartMoneyScore}</div>
                                <div className={`w-2 h-2 rounded-full ${flow.smartMoneyScore > 70 ? 'bg-green-400' : flow.smartMoneyScore > 50 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {flow.isUnusual && (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Unusual
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No options flow data available</p>
                    <p className="text-sm">Start the live feed or refresh data to see activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex items-center gap-4">
                <Input placeholder="Search users..." className="w-64" />
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-green-500/30">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-400">{metrics.totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Users</div>
                  <div className="text-xs text-green-400 mt-1">+{metrics.newUsers} today</div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-sm border border-blue-500/30">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-400">{metrics.activeUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                  <div className="text-xs text-blue-400 mt-1">{((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% active</div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/30">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-400">{metrics.conversionRate}%</div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                  <div className="text-xs text-purple-400 mt-1">+0.3% this month</div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-sm border border-orange-500/30">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-400">{metrics.churnRate}%</div>
                  <div className="text-sm text-gray-400">Churn Rate</div>
                  <div className="text-xs text-orange-400 mt-1">-0.1% this month</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Enterprise Tenant Management</h2>
              <div className="flex items-center gap-4">
                <Input placeholder="Search tenants..." className="w-64" />
                <Button>
                  <Building2 className="w-4 h-4 mr-2" />
                  Add Tenant
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Enterprise Corp {i + 1}</CardTitle>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Plan</p>
                          <p className="font-medium">Enterprise</p>
                        </div>
                        <div>
                          <p className="text-gray-400">MRR</p>
                          <p className="font-medium text-green-400">$2,999</p>
                        </div>
                        <div>
                          <p className="text-gray-400">API Calls</p>
                          <p className="font-medium">{(Math.random() * 50000).toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Users</p>
                          <p className="font-medium">{Math.floor(Math.random() * 50) + 10}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Settings className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* API Gateway Tab */}
          <TabsContent value="api" className="space-y-6">
            <h2 className="text-2xl font-bold">API Gateway Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">API Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {metrics.responseTime}ms
                  </div>
                  <p className="text-sm text-gray-400">Average Response Time</p>
                  <div className="mt-4 text-xs text-green-400">
                    -12ms from last hour
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-green-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {(metrics.totalApiRequests / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-sm text-gray-400">API Requests Today</p>
                  <div className="mt-4 text-xs text-green-400">
                    +15% from yesterday
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-red-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {metrics.errorRate}%
                  </div>
                  <p className="text-sm text-gray-400">Error Rate</p>
                  <div className="mt-4 text-xs text-red-400">
                    +0.01% from last hour
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Rate Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {Math.floor(metrics.totalApiRequests / 1000)}
                  </div>
                  <p className="text-sm text-gray-400">Rate Limited Today</p>
                  <div className="mt-4 text-xs text-blue-400">
                    Normal levels
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <h2 className="text-2xl font-bold">Security Dashboard</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-red-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    Threat Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {metrics.threatsBlocked}
                  </div>
                  <p className="text-sm text-gray-400">Threats blocked this month</p>
                  <div className="mt-4 text-xs text-red-400">
                    +12% from last month
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Shield className="w-5 h-5" />
                    Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {metrics.securityEvents}
                  </div>
                  <p className="text-sm text-gray-400">Events requiring attention</p>
                  <div className="mt-4 text-xs text-yellow-400">
                    -8% from last month
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-green-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Lock className="w-5 h-5" />
                    Compliance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {metrics.complianceScore}%
                  </div>
                  <p className="text-sm text-gray-400">Overall compliance rating</p>
                  <Progress value={metrics.complianceScore} className="h-2 mt-4" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Monitoring</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Database Connections</span>
                      <span className="text-sm font-medium">{metrics.databaseConnections}</span>
                    </div>
                    <Progress value={(metrics.databaseConnections / 500) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Cache Hit Rate</span>
                      <span className="text-sm font-medium">{metrics.cacheHitRate}%</span>
                    </div>
                    <Progress value={metrics.cacheHitRate} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Server Load</span>
                      <span className="text-sm font-medium">{metrics.serverLoad}%</span>
                    </div>
                    <Progress value={metrics.serverLoad} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle>Infrastructure Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'API Gateway', status: 'Operational', color: 'green' },
                      { name: 'Database Cluster', status: 'Operational', color: 'green' },
                      { name: 'Redis Cache', status: 'Operational', color: 'green' },
                      { name: 'Message Queue', status: 'Degraded', color: 'yellow' },
                      { name: 'File Storage', status: 'Operational', color: 'green' }
                    ].map((service, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <span className="font-medium">{service.name}</span>
                        <Badge 
                          variant="outline" 
                          className={`${
                            service.color === 'green' ? 'border-green-500/30 text-green-400' :
                            service.color === 'yellow' ? 'border-yellow-500/30 text-yellow-400' :
                            'border-red-500/30 text-red-400'
                          }`}
                        >
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Business Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        ${metrics.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total Revenue</div>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {metrics.churnRate}%
                      </div>
                      <div className="text-sm text-gray-400">Churn Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total Tenants</span>
                      <span className="text-lg font-bold">{metrics.totalTenants}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Active Tenants</span>
                      <span className="text-lg font-bold text-green-400">{metrics.activeTenants}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Trial Tenants</span>
                      <span className="text-lg font-bold text-yellow-400">{metrics.trialTenants}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <h2 className="text-2xl font-bold">System Status</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Resource Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">CPU Usage</span>
                        <span>{(Math.random() * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.random() * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Memory Usage</span>
                        <span>{(Math.random() * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.random() * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Disk Usage</span>
                        <span>{metrics.storageUsage}%</span>
                      </div>
                      <Progress value={metrics.storageUsage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Network I/O</span>
                        <span>{(Math.random() * 100).toFixed(1)} MB/s</span>
                      </div>
                      <Progress value={Math.random() * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Global Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { region: 'US East', status: 'Operational', latency: '12ms' },
                      { region: 'US West', status: 'Operational', latency: '8ms' },
                      { region: 'Europe', status: 'Operational', latency: '45ms' },
                      { region: 'Asia Pacific', status: 'Degraded', latency: '102ms' }
                    ].map((region, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div>
                          <div className="font-medium">{region.region}</div>
                          <div className="text-xs text-gray-400">Latency: {region.latency}</div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${
                            region.status === 'Operational' ? 'border-green-500/30 text-green-400' :
                            region.status === 'Degraded' ? 'border-yellow-500/30 text-yellow-400' :
                            'border-red-500/30 text-red-400'
                          }`}
                        >
                          {region.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Global Infrastructure Tab */}
          <TabsContent value="global" className="space-y-6">
            <GlobalInfrastructureDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
