"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Activity,
  Users,
  CreditCard,
  Zap,
  Database,
  Cloud,
  Wifi,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Clock,
  RefreshCw,
  Download,
  Bell,
  Settings,
  Shield,
  Eye,
  Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from "recharts"

interface RealTimeCosts {
  current: number
  projected: number
  revenue: number
  margin: number
  profitLoss: number
  status: 'profitable' | 'breakeven' | 'loss'
}

interface CostBreakdown {
  compute: number
  dataFeeds: number
  storage: number
  bandwidth: number
  apiCalls: number
  total: number
}

interface UserCostProfile {
  userId: string
  username: string
  email: string
  tier: 'free' | 'starter' | 'professional' | 'enterprise'
  costs: {
    today: number
    week: number
    month: number
    lifetime: number
  }
  revenue: {
    subscription: number
    usage: number
    total: number
  }
  margin: number
  profitability: 'high' | 'medium' | 'low' | 'negative'
  testsRun: number
  creditsUsed: number
  creditsRemaining: number
  status: 'active' | 'suspended' | 'warning'
}

interface CostAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  userId?: string
  cost?: number
  timestamp: string
  acknowledged: boolean
  action?: {
    label: string
    handler: () => void
  }
}

interface InfrastructureMetrics {
  aws: {
    ec2: number
    rds: number
    s3: number
    lambda: number
    cloudwatch: number
  }
  dataProviders: {
    polygon: number
    alpaca: number
    yahoo: number
    custom: number
  }
  other: {
    monitoring: number
    backup: number
    security: number
  }
}

const COST_THRESHOLDS = {
  margin: { critical: 0, warning: 0.2, good: 0.4 },
  userCost: { high: 100, medium: 50, low: 10 },
  dailyBudget: { limit: 1000, warning: 800, safe: 500 }
}

const COLORS = {
  profit: '#10b981',
  loss: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4'
}

export default function TestingCostMonitor() {
  const [realTimeCosts, setRealTimeCosts] = useState<RealTimeCosts>({
    current: 0,
    projected: 0,
    revenue: 0,
    margin: 0,
    profitLoss: 0,
    status: 'profitable'
  })

  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    compute: 0,
    dataFeeds: 0,
    storage: 0,
    bandwidth: 0,
    apiCalls: 0,
    total: 0
  })

  const [userCosts, setUserCosts] = useState<UserCostProfile[]>([])
  const [alerts, setAlerts] = useState<CostAlert[]>([])
  const [infrastructure, setInfrastructure] = useState<InfrastructureMetrics | null>(null)
  
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Real-time cost tracking
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      await fetchRealTimeCosts()
      checkCostAlerts()
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, selectedPeriod])

  // Initial data load
  useEffect(() => {
    loadAllData()
  }, [selectedPeriod])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchRealTimeCosts(),
        fetchUserCosts(),
        fetchInfrastructureMetrics(),
        fetchAlerts()
      ])
    } catch (error) {
      console.error('Error loading cost data:', error)
      toast.error('Failed to load cost monitoring data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRealTimeCosts = async () => {
    try {
      const response = await fetch(`/api/admin/testing-costs/realtime?period=${selectedPeriod}`)
      const data = await response.json()
      
      // Calculate real costs (mock for now, replace with actual)
      const costs = {
        current: data.current || Math.random() * 500 + 100,
        projected: data.projected || Math.random() * 2000 + 500,
        revenue: data.revenue || Math.random() * 3000 + 1000,
        margin: 0,
        profitLoss: 0,
        status: 'profitable' as const
      }
      
      costs.profitLoss = costs.revenue - costs.current
      costs.margin = costs.revenue > 0 ? (costs.profitLoss / costs.revenue) * 100 : 0
      costs.status = costs.profitLoss > 0 ? 'profitable' : costs.profitLoss === 0 ? 'breakeven' : 'loss'
      
      setRealTimeCosts(costs)
      
      // Update breakdown
      setCostBreakdown({
        compute: costs.current * 0.4,
        dataFeeds: costs.current * 0.3,
        storage: costs.current * 0.1,
        bandwidth: costs.current * 0.1,
        apiCalls: costs.current * 0.1,
        total: costs.current
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching real-time costs:', error)
    }
  }

  const fetchUserCosts = async () => {
    try {
      const response = await fetch(`/api/admin/testing-costs/users?period=${selectedPeriod}`)
      const data = await response.json()
      
      // Mock data for demonstration (replace with actual API data)
      const mockUsers: UserCostProfile[] = [
        {
          userId: 'user_1',
          username: 'ProTrader123',
          email: 'pro@example.com',
          tier: 'professional',
          costs: { today: 45.67, week: 234.89, month: 892.34, lifetime: 2345.67 },
          revenue: { subscription: 99, usage: 125.50, total: 224.50 },
          margin: 178.83,
          profitability: 'high',
          testsRun: 234,
          creditsUsed: 450,
          creditsRemaining: 550,
          status: 'active'
        },
        {
          userId: 'user_2',
          username: 'AlgoMaster',
          email: 'algo@example.com',
          tier: 'enterprise',
          costs: { today: 125.43, week: 678.90, month: 2456.78, lifetime: 8901.23 },
          revenue: { subscription: 499, usage: 350.75, total: 849.75 },
          margin: 724.32,
          profitability: 'high',
          testsRun: 567,
          creditsUsed: 890,
          creditsRemaining: 9110,
          status: 'active'
        },
        {
          userId: 'user_3',
          username: 'DayTrader99',
          email: 'day@example.com',
          tier: 'starter',
          costs: { today: 78.90, week: 345.67, month: 1234.56, lifetime: 3456.78 },
          revenue: { subscription: 29, usage: 15.25, total: 44.25 },
          margin: -34.65,
          profitability: 'negative',
          testsRun: 456,
          creditsUsed: 95,
          creditsRemaining: 5,
          status: 'warning'
        }
      ]
      
      setUserCosts(data.users || mockUsers)
    } catch (error) {
      console.error('Error fetching user costs:', error)
    }
  }

  const fetchInfrastructureMetrics = async () => {
    try {
      const response = await fetch('/api/admin/testing-costs/infrastructure')
      const data = await response.json()
      
      // Mock infrastructure costs
      setInfrastructure({
        aws: {
          ec2: 234.56,
          rds: 123.45,
          s3: 45.67,
          lambda: 78.90,
          cloudwatch: 12.34
        },
        dataProviders: {
          polygon: 456.78,
          alpaca: 234.56,
          yahoo: 0,
          custom: 123.45
        },
        other: {
          monitoring: 34.56,
          backup: 23.45,
          security: 56.78
        }
      })
    } catch (error) {
      console.error('Error fetching infrastructure metrics:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/testing-costs/alerts')
      const data = await response.json()
      
      // Mock alerts for demonstration
      const mockAlerts: CostAlert[] = [
        {
          id: '1',
          type: 'critical',
          title: 'High Cost User Alert',
          message: 'User "DayTrader99" costs exceeding revenue by 78%',
          userId: 'user_3',
          cost: 78.90,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          action: {
            label: 'Suspend User',
            handler: () => suspendUser('user_3')
          }
        },
        {
          id: '2',
          type: 'warning',
          title: 'Infrastructure Cost Spike',
          message: 'AWS costs increased 45% in last hour',
          cost: 145.67,
          timestamp: new Date().toISOString(),
          acknowledged: false
        },
        {
          id: '3',
          type: 'info',
          title: 'Daily Budget Update',
          message: 'Used 65% of daily budget ($650/$1000)',
          timestamp: new Date().toISOString(),
          acknowledged: true
        }
      ]
      
      setAlerts(data.alerts || mockAlerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const checkCostAlerts = () => {
    if (!alertsEnabled) return

    // Check margin threshold
    if (realTimeCosts.margin < COST_THRESHOLDS.margin.warning * 100) {
      const alertType = realTimeCosts.margin < COST_THRESHOLDS.margin.critical * 100 ? 'critical' : 'warning'
      createAlert({
        type: alertType,
        title: `${alertType === 'critical' ? 'CRITICAL' : 'Warning'}: Low Profit Margin`,
        message: `Current margin is ${realTimeCosts.margin.toFixed(2)}%`,
        cost: realTimeCosts.current
      })
    }

    // Check user costs
    userCosts.forEach(user => {
      if (user.profitability === 'negative' && user.status === 'active') {
        createAlert({
          type: 'critical',
          title: 'Unprofitable User Active',
          message: `${user.username} is costing more than revenue generated`,
          userId: user.userId,
          cost: user.costs.today
        })
      }
    })

    // Check daily budget
    if (realTimeCosts.current > COST_THRESHOLDS.dailyBudget.warning) {
      createAlert({
        type: 'warning',
        title: 'Approaching Daily Budget Limit',
        message: `Current costs: $${realTimeCosts.current.toFixed(2)} / $${COST_THRESHOLDS.dailyBudget.limit}`,
        cost: realTimeCosts.current
      })
    }
  }

  const createAlert = (alert: Omit<CostAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlert: CostAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    }

    setAlerts(prev => {
      // Avoid duplicate alerts
      const exists = prev.find(a => 
        a.title === newAlert.title && 
        !a.acknowledged &&
        new Date(a.timestamp) > new Date(Date.now() - 60000) // Within last minute
      )
      if (exists) return prev
      
      // Show toast for critical alerts
      if (newAlert.type === 'critical') {
        toast.error(newAlert.title, { description: newAlert.message })
      } else if (newAlert.type === 'warning') {
        toast.warning(newAlert.title, { description: newAlert.message })
      }
      
      return [newAlert, ...prev].slice(0, 50) // Keep last 50 alerts
    })
  }

  const suspendUser = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/suspend`, { method: 'POST' })
      toast.success('User suspended successfully')
      await fetchUserCosts()
    } catch (error) {
      toast.error('Failed to suspend user')
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ))
  }

  const exportCostReport = async () => {
    try {
      const response = await fetch('/api/admin/testing-costs/export')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cost-report-${new Date().toISOString()}.csv`
      a.click()
      toast.success('Cost report exported')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  // Calculate metrics
  const totalInfrastructureCost = useMemo(() => {
    if (!infrastructure) return 0
    return Object.values(infrastructure.aws).reduce((a, b) => a + b, 0) +
           Object.values(infrastructure.dataProviders).reduce((a, b) => a + b, 0) +
           Object.values(infrastructure.other).reduce((a, b) => a + b, 0)
  }, [infrastructure])

  const unprofitableUsers = useMemo(() => 
    userCosts.filter(u => u.profitability === 'negative'),
    [userCosts]
  )

  const criticalAlerts = useMemo(() =>
    alerts.filter(a => a.type === 'critical' && !a.acknowledged),
    [alerts]
  )

  // Chart data
  const costTrendData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    cost: Math.random() * 100 + 20,
    revenue: Math.random() * 150 + 50,
    margin: Math.random() * 50
  }))

  const userProfitabilityData = userCosts.map(user => ({
    name: user.username,
    revenue: user.revenue.total,
    cost: user.costs.today,
    profit: user.revenue.total - user.costs.today
  }))

  const costBreakdownData = Object.entries(costBreakdown)
    .filter(([key]) => key !== 'total')
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      percentage: (value / costBreakdown.total * 100).toFixed(1)
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Cost Monitoring</h1>
          <p className="text-muted-foreground">
            Track costs, revenue, and profitability in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={realTimeCosts.status === 'profitable' ? 'default' : 'destructive'}>
            {realTimeCosts.status.toUpperCase()}
          </Badge>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchRealTimeCosts()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportCostReport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <AnimatePresence>
          {criticalAlerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <span>{alert.message}</span>
                  <div className="flex gap-2">
                    {alert.action && (
                      <Button size="sm" variant="destructive" onClick={alert.action.handler}>
                        {alert.action.label}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Costs</p>
                <p className="text-2xl font-bold">
                  ${realTimeCosts.current.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 5 min
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${realTimeCosts.status === 'loss' ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  ${realTimeCosts.revenue.toFixed(2)}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  +{((realTimeCosts.revenue / realTimeCosts.current - 1) * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className={`text-2xl font-bold ${realTimeCosts.margin < 20 ? 'text-red-500' : 'text-green-500'}`}>
                  {realTimeCosts.margin.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {realTimeCosts.status}
                </p>
              </div>
              <Activity className={`h-8 w-8 ${realTimeCosts.margin < 20 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projected Daily</p>
                <p className="text-2xl font-bold">
                  ${realTimeCosts.projected.toFixed(2)}
                </p>
                <Progress 
                  value={(realTimeCosts.projected / COST_THRESHOLDS.dailyBudget.limit) * 100} 
                  className="mt-2 h-2"
                />
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">P&L</p>
                <p className={`text-2xl font-bold ${realTimeCosts.profitLoss < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ${Math.abs(realTimeCosts.profitLoss).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {realTimeCosts.profitLoss < 0 ? 'Loss' : 'Profit'}
                </p>
              </div>
              {realTimeCosts.profitLoss < 0 ? 
                <TrendingDown className="h-8 w-8 text-red-500" /> :
                <TrendingUp className="h-8 w-8 text-green-500" />
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Costs</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cost Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Profitability Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userProfitabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill={COLORS.profit} />
                    <Bar dataKey="cost" fill={COLORS.loss} />
                    <Bar dataKey="profit" fill={COLORS.info} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unprofitable Users
                </CardTitle>
                <Users className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unprofitableUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Costing more than revenue
                </p>
                <div className="mt-2">
                  {unprofitableUsers.slice(0, 3).map(user => (
                    <div key={user.userId} className="flex justify-between text-xs mt-1">
                      <span>{user.username}</span>
                      <span className="text-red-500">-${Math.abs(user.margin).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Infrastructure Cost
                </CardTitle>
                <Cloud className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalInfrastructureCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  AWS + Data Providers + Other
                </p>
                <Progress value={65} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Alerts
                </CardTitle>
                <Bell className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{criticalAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Requiring immediate attention
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="destructive">{alerts.filter(a => a.type === 'critical').length} Critical</Badge>
                  <Badge variant="secondary">{alerts.filter(a => a.type === 'warning').length} Warning</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userCosts.map(user => (
                  <div key={user.userId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{user.username}</h4>
                          <Badge variant={user.tier === 'enterprise' ? 'default' : 'secondary'}>
                            {user.tier}
                          </Badge>
                          <Badge 
                            variant={user.profitability === 'negative' ? 'destructive' : 
                                   user.profitability === 'high' ? 'default' : 'secondary'}
                          >
                            {user.profitability}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.status === 'warning' && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <Button size="sm" variant="outline">View Details</Button>
                        {user.profitability === 'negative' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => suspendUser(user.userId)}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Today's Cost</p>
                        <p className="font-semibold">${user.costs.today.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-green-500">${user.revenue.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Margin</p>
                        <p className={`font-semibold ${user.margin < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          ${user.margin.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tests Run</p>
                        <p className="font-semibold">{user.testsRun}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Credits</p>
                        <p className="font-semibold">{user.creditsRemaining}/{user.creditsUsed + user.creditsRemaining}</p>
                      </div>
                    </div>

                    <Progress 
                      value={(user.creditsUsed / (user.creditsUsed + user.creditsRemaining)) * 100} 
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          {infrastructure && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AWS Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(infrastructure.aws).map(([service, cost]) => (
                        <div key={service} className="flex justify-between">
                          <span className="text-sm capitalize">{service}</span>
                          <span className="text-sm font-semibold">${cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Data Provider Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(infrastructure.dataProviders).map(([provider, cost]) => (
                        <div key={provider} className="flex justify-between">
                          <span className="text-sm capitalize">{provider}</span>
                          <span className="text-sm font-semibold">${cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Other Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(infrastructure.other).map(([category, cost]) => (
                        <div key={category} className="flex justify-between">
                          <span className="text-sm capitalize">{category}</span>
                          <span className="text-sm font-semibold">${cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Cost & Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.profit}
                    fill={COLORS.profit}
                    fillOpacity={0.6}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="cost"
                    stroke={COLORS.loss}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margin"
                    stroke={COLORS.purple}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <Alert 
                    key={alert.id}
                    variant={alert.type === 'critical' ? 'destructive' : 'default'}
                    className={alert.acknowledged ? 'opacity-50' : ''}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="flex justify-between">
                      {alert.title}
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                      <span>{alert.message}</span>
                      {!alert.acknowledged && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-xs text-muted-foreground text-right">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  )
}
