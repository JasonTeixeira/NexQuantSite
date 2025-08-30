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
  BarChart3, Users, DollarSign, TrendingUp, Shield, Zap, 
  Activity, AlertTriangle, Settings, Database, Network,
  Globe, Brain, Target, Crown, Building2, Gauge, 
  LineChart, PieChart, Server, Lock, Bell
} from "lucide-react"

// Import our SaaS engines
import { tenantManager, Tenant } from "@/lib/saas/tenant-manager"
import { apiGateway } from "@/lib/saas/api-gateway"
import { realtimeEngine } from "@/lib/saas/realtime-engine"
import { securityEngine } from "@/lib/saas/security-engine"
import { monitoringEngine } from "@/lib/saas/monitoring-engine"

interface SaaSMetrics {
  // Business Metrics
  totalRevenue: number
  monthlyRevenue: number
  totalTenants: number
  activeTenants: number
  trialTenants: number
  churnRate: number
  
  // Technical Metrics
  totalApiRequests: number
  responseTime: number
  uptime: number
  errorRate: number
  
  // Resource Usage
  serverLoad: number
  databaseConnections: number
  cacheHitRate: number
  storageUsage: number
  
  // Security Metrics
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

export default function SaaSAdminDashboard() {
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
    
    // Real-time updates
    const interval = setInterval(loadDashboardData, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [selectedTimeRange])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Simulate loading SaaS metrics
      const saasMetrics: SaaSMetrics = {
        totalRevenue: 450000,
        monthlyRevenue: 45000,
        totalTenants: 1247,
        activeTenants: 1156,
        trialTenants: 91,
        churnRate: 2.1,
        totalApiRequests: 15420000,
        responseTime: 89,
        uptime: 99.97,
        errorRate: 0.03,
        serverLoad: 67,
        databaseConnections: 342,
        cacheHitRate: 94.2,
        storageUsage: 78,
        securityEvents: 12,
        threatsBlocked: 145,
        complianceScore: 96
      }
      
      // Load tenant analytics
      const tenantAnalytics = await tenantManager.getAllTenantsAnalytics()
      
      // Generate sample alerts
      const dashboardAlerts: DashboardAlert[] = [
        {
          id: '1',
          type: 'warning',
          message: 'High API usage detected for tenant enterprise-corp',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          source: 'API Gateway'
        },
        {
          id: '2',
          type: 'info',
          message: 'New enterprise tenant onboarded: tech-startup-inc',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          source: 'Tenant Manager'
        },
        {
          id: '3',
          type: 'error',
          message: 'Database connection spike detected',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          source: 'Monitoring'
        }
      ]
      
      setMetrics(saasMetrics)
      setAlerts(dashboardAlerts)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
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
              <h2 className="text-2xl font-bold text-white">Loading SaaS Dashboard...</h2>
              <p className="text-gray-400">Aggregating platform metrics and tenant data</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/60 backdrop-blur-md">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Server className="w-10 h-10 text-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SaaS Control Center</h1>
                <p className="text-gray-400">Enterprise Platform Management</p>
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
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
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
        {/* Alerts Bar */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-400 mb-1">Active Alerts ({alerts.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {alerts.slice(0, 3).map(alert => (
                    <Badge 
                      key={alert.id} 
                      variant="outline" 
                      className={`text-xs ${
                        alert.type === 'critical' ? 'border-red-500/30 text-red-400' :
                        alert.type === 'error' ? 'border-orange-500/30 text-orange-400' :
                        alert.type === 'warning' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-blue-500/30 text-blue-400'
                      }`}
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

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-black/40 border border-primary/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
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
                        <p className="text-sm font-medium text-green-400">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-white">
                          ${metrics.monthlyRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          +12.5% from last month
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
                        <p className="text-sm font-medium text-blue-400">Active Tenants</p>
                        <p className="text-3xl font-bold text-white">
                          {metrics.activeTenants.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {metrics.trialTenants} on trial
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
                        <p className="text-sm font-medium text-purple-400">API Requests</p>
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
                        <p className="text-sm font-medium text-orange-400">Uptime</p>
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

            {/* System Health Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </div>

            {/* Real-time Activity Feed */}
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Real-time Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="text-sm text-white">
                          API request processed for tenant enterprise-corp
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(Date.now() - i * 30000).toLocaleTimeString()} • Response: 89ms
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                        Success
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tenant Management</h2>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search tenants..."
                  className="w-64"
                />
                <Button>
                  <Users className="w-4 h-4 mr-2" />
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

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Monitoring</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle>API Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{metrics.responseTime}ms</div>
                      <div className="text-sm text-gray-400">Average Response Time</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="text-xl font-bold text-green-400">{metrics.uptime}%</div>
                        <div className="text-xs text-gray-400">Uptime</div>
                      </div>
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="text-xl font-bold text-red-400">{metrics.errorRate}%</div>
                        <div className="text-xs text-gray-400">Error Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
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
                  <CardTitle>User Analytics</CardTitle>
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
                    <Server className="w-5 h-5" />
                    Infrastructure Status
                  </CardTitle>
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
                        <span>{(Math.random() * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.random() * 100} className="h-2" />
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
