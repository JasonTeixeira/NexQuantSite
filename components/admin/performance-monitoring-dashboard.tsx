"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Users,
  BarChart3,
} from "lucide-react"

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: "good" | "warning" | "critical"
  trend: "up" | "down" | "stable"
  threshold: number
}

interface Alert {
  id: string
  type: "error" | "warning" | "info"
  title: string
  message: string
  timestamp: number
  resolved: boolean
  severity: "low" | "medium" | "high" | "critical"
}

interface PerformanceData {
  timestamp: number
  cpu: number
  memory: number
  disk: number
  network: number
  responseTime: number
  activeUsers: number
}

export default function PerformanceMonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)

  // Initialize mock data
  useEffect(() => {
    const initialMetrics: SystemMetric[] = [
      { name: "CPU Usage", value: 45, unit: "%", status: "good", trend: "stable", threshold: 80 },
      { name: "Memory Usage", value: 68, unit: "%", status: "warning", trend: "up", threshold: 85 },
      { name: "Disk Usage", value: 32, unit: "%", status: "good", trend: "stable", threshold: 90 },
      { name: "Network I/O", value: 156, unit: "MB/s", status: "good", trend: "down", threshold: 500 },
      { name: "Response Time", value: 245, unit: "ms", status: "good", trend: "stable", threshold: 1000 },
      { name: "Active Users", value: 1247, unit: "", status: "good", trend: "up", threshold: 5000 },
      { name: "Database Connections", value: 23, unit: "", status: "good", trend: "stable", threshold: 100 },
      { name: "Error Rate", value: 0.12, unit: "%", status: "good", trend: "down", threshold: 1 },
    ]

    const initialAlerts: Alert[] = [
      {
        id: "alert_001",
        type: "warning",
        title: "High Memory Usage",
        message: "Memory usage has exceeded 65% for the past 10 minutes",
        timestamp: Date.now() - 600000,
        resolved: false,
        severity: "medium",
      },
      {
        id: "alert_002",
        type: "info",
        title: "Scheduled Maintenance",
        message: "Database maintenance scheduled for tonight at 2:00 AM",
        timestamp: Date.now() - 3600000,
        resolved: false,
        severity: "low",
      },
      {
        id: "alert_003",
        type: "error",
        title: "API Endpoint Timeout",
        message: "Payment processing endpoint experiencing timeouts",
        timestamp: Date.now() - 1800000,
        resolved: true,
        severity: "high",
      },
    ]

    setSystemMetrics(initialMetrics)
    setAlerts(initialAlerts)

    // Generate initial performance data
    const data: PerformanceData[] = []
    for (let i = 29; i >= 0; i--) {
      data.push({
        timestamp: Date.now() - i * 60000,
        cpu: 30 + Math.random() * 40,
        memory: 50 + Math.random() * 30,
        disk: 25 + Math.random() * 20,
        network: 100 + Math.random() * 200,
        responseTime: 200 + Math.random() * 300,
        activeUsers: 1000 + Math.random() * 500,
      })
    }
    setPerformanceData(data)
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Update system metrics
      setSystemMetrics((prev) =>
        prev.map((metric) => {
          let newValue = metric.value
          const change = (Math.random() - 0.5) * 10

          switch (metric.name) {
            case "CPU Usage":
              newValue = Math.max(0, Math.min(100, metric.value + change * 0.5))
              break
            case "Memory Usage":
              newValue = Math.max(0, Math.min(100, metric.value + change * 0.3))
              break
            case "Disk Usage":
              newValue = Math.max(0, Math.min(100, metric.value + change * 0.1))
              break
            case "Network I/O":
              newValue = Math.max(0, metric.value + change * 2)
              break
            case "Response Time":
              newValue = Math.max(50, metric.value + change * 5)
              break
            case "Active Users":
              newValue = Math.max(0, metric.value + Math.floor(change * 10))
              break
            case "Database Connections":
              newValue = Math.max(0, Math.min(100, metric.value + Math.floor(change * 0.5)))
              break
            case "Error Rate":
              newValue = Math.max(0, Math.min(5, metric.value + change * 0.01))
              break
          }

          const status =
            newValue > metric.threshold * 0.9 ? "critical" : newValue > metric.threshold * 0.7 ? "warning" : "good"

          const trend = newValue > metric.value ? "up" : newValue < metric.value ? "down" : "stable"

          return { ...metric, value: newValue, status, trend }
        }),
      )

      // Add new performance data point
      setPerformanceData((prev) => {
        const newData = [...prev.slice(1)]
        newData.push({
          timestamp: Date.now(),
          cpu: 30 + Math.random() * 40,
          memory: 50 + Math.random() * 30,
          disk: 25 + Math.random() * 20,
          network: 100 + Math.random() * 200,
          responseTime: 200 + Math.random() * 300,
          activeUsers: 1000 + Math.random() * 500,
        })
        return newData
      })

      // Occasionally add new alerts
      if (Math.random() < 0.1) {
        const alertTypes = ["warning", "info", "error"] as const
        const severities = ["low", "medium", "high"] as const
        const messages = [
          "High CPU usage detected",
          "Database query optimization needed",
          "Network latency increased",
          "Disk space running low",
          "Unusual user activity pattern",
        ]

        const newAlert: Alert = {
          id: `alert_${Date.now()}`,
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          title: "System Alert",
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: Date.now(),
          resolved: false,
          severity: severities[Math.floor(Math.random() * severities.length)],
        }

        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "critical":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />
      case "down":
        return <TrendingDown className="h-3 w-3" />
      default:
        return null
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)))
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "") return Math.floor(value).toLocaleString()
    return `${value.toFixed(unit === "%" ? 1 : 0)}${unit}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">Real-time system performance and health monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={isMonitoring ? "destructive" : "default"} onClick={() => setIsMonitoring(!isMonitoring)}>
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
          <Badge variant={isMonitoring ? "default" : "secondary"}>{isMonitoring ? "Live" : "Paused"}</Badge>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.slice(0, 8).map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {metric.name.includes("CPU") && <Cpu className="h-4 w-4" />}
                  {metric.name.includes("Memory") && <Server className="h-4 w-4" />}
                  {metric.name.includes("Disk") && <HardDrive className="h-4 w-4" />}
                  {metric.name.includes("Network") && <Wifi className="h-4 w-4" />}
                  {metric.name.includes("Response") && <Zap className="h-4 w-4" />}
                  {metric.name.includes("Users") && <Users className="h-4 w-4" />}
                  {metric.name.includes("Database") && <Database className="h-4 w-4" />}
                  {metric.name.includes("Error") && <AlertTriangle className="h-4 w-4" />}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <div className={`flex items-center space-x-1 ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</div>
                {metric.unit === "%" && (
                  <Progress
                    value={metric.value}
                    className={`h-2 ${
                      metric.status === "critical"
                        ? "bg-red-100"
                        : metric.status === "warning"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                    }`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.slice(0, 4).map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            metric.status === "good"
                              ? "bg-green-500"
                              : metric.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatValue(metric.value, metric.unit)}</div>
                        <div className="text-xs text-muted-foreground">
                          Threshold: {formatValue(metric.threshold, metric.unit)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Application Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.slice(4, 8).map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            metric.status === "good"
                              ? "bg-green-500"
                              : metric.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatValue(metric.value, metric.unit)}</div>
                        <div className="text-xs text-muted-foreground">
                          Threshold: {formatValue(metric.threshold, metric.unit)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${alert.resolved ? "opacity-50" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                              {alert.resolved && (
                                <Badge variant="outline" className="text-green-600">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(alert.timestamp)}</p>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends (Last 30 minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Performance charts would be rendered here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { endpoint: "/api/auth/login", avgResponse: 145, requests: 1247, errors: 2 },
                  { endpoint: "/api/trading/orders", avgResponse: 89, requests: 3456, errors: 0 },
                  { endpoint: "/api/market/data", avgResponse: 234, requests: 8901, errors: 5 },
                  { endpoint: "/api/user/profile", avgResponse: 67, requests: 567, errors: 1 },
                  { endpoint: "/api/admin/dashboard", avgResponse: 456, requests: 123, errors: 0 },
                ].map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{endpoint.endpoint}</div>
                        <div className="text-sm text-muted-foreground">
                          {endpoint.requests.toLocaleString()} requests
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{endpoint.avgResponse}ms</div>
                      <div className={`text-sm ${endpoint.errors > 0 ? "text-red-500" : "text-green-500"}`}>
                        {endpoint.errors} errors
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
