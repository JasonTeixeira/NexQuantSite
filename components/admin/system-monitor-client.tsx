"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Zap,
} from "lucide-react"

interface SystemHealth {
  overall: number
  services: {
    api: "healthy" | "warning" | "error"
    database: "healthy" | "warning" | "error"
    trading: "healthy" | "warning" | "error"
    email: "healthy" | "warning" | "error"
    payments: "healthy" | "warning" | "error"
  }
  metrics: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  errors: Array<{
    id: string
    service: string
    message: string
    timestamp: string
    severity: "low" | "medium" | "high" | "critical"
  }>
}

export default function SystemMonitorClient() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 98.7,
    services: {
      api: "healthy",
      database: "healthy",
      trading: "warning",
      email: "healthy",
      payments: "healthy",
    },
    metrics: {
      cpu: 45,
      memory: 67,
      disk: 23,
      network: 89,
    },
    errors: [
      {
        id: "1",
        service: "Trading Engine",
        message: "High latency detected on BTC/USDT pair",
        timestamp: "2 min ago",
        severity: "medium",
      },
      {
        id: "2",
        service: "API Gateway",
        message: "Rate limit exceeded for user 12345",
        timestamp: "5 min ago",
        severity: "low",
      },
      {
        id: "3",
        service: "Database",
        message: "Slow query detected: user_trades table",
        timestamp: "8 min ago",
        severity: "medium",
      },
    ],
  })

  const [performanceHistory, setPerformanceHistory] = useState([
    { time: "00:00", cpu: 35, memory: 45, network: 67, errors: 2 },
    { time: "04:00", cpu: 42, memory: 52, network: 78, errors: 1 },
    { time: "08:00", cpu: 65, memory: 71, network: 89, errors: 3 },
    { time: "12:00", cpu: 78, memory: 83, network: 92, errors: 5 },
    { time: "16:00", cpu: 45, memory: 67, network: 85, errors: 2 },
    { time: "20:00", cpu: 38, memory: 54, network: 72, errors: 1 },
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth((prev) => ({
        ...prev,
        metrics: {
          cpu: Math.max(20, Math.min(90, prev.metrics.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(30, Math.min(95, prev.metrics.memory + (Math.random() - 0.5) * 8)),
          disk: Math.max(10, Math.min(80, prev.metrics.disk + (Math.random() - 0.5) * 5)),
          network: Math.max(40, Math.min(100, prev.metrics.network + (Math.random() - 0.5) * 15)),
        },
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <CheckCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-400/20 text-green-400 border-green-400/30"
      case "warning":
        return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
      case "error":
        return "bg-red-400/20 text-red-400 border-red-400/30"
      default:
        return "bg-gray-400/20 text-gray-400 border-gray-400/30"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-red-400/20 text-red-300 border-red-400/30"
      case "medium":
        return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
      case "low":
        return "bg-blue-400/20 text-blue-400 border-blue-400/30"
      default:
        return "bg-gray-400/20 text-gray-400 border-gray-400/30"
    }
  }

  const getMetricColor = (value: number, type: string) => {
    if (type === "disk") {
      if (value > 70) return "text-red-400"
      if (value > 50) return "text-yellow-400"
      return "text-green-400"
    }

    if (value > 80) return "text-red-400"
    if (value > 60) return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              SYSTEM <span className="text-primary">MONITOR</span>
            </h1>
            <p className="text-gray-400">Real-time system health and performance monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Live monitoring</span>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <Card className="bg-black/40 border-primary/30 shadow-[0_0_20px_rgba(0,255,68,0.1)]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Health */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-700"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${systemHealth.overall}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{systemHealth.overall}%</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">Overall System Health</p>
              </div>

              {/* Service Status */}
              <div className="col-span-2">
                <h3 className="text-white font-semibold mb-4">Service Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-black/50 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <span className="text-white text-sm">API Gateway</span>
                    </div>
                    {getStatusIcon(systemHealth.services.api)}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/50 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">Database</span>
                    </div>
                    {getStatusIcon(systemHealth.services.database)}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/50 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-yellow-400" />
                      <span className="text-white text-sm">Trading Engine</span>
                    </div>
                    {getStatusIcon(systemHealth.services.trading)}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/50 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-400" />
                      <span className="text-white text-sm">Email Service</span>
                    </div>
                    {getStatusIcon(systemHealth.services.email)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-black/40 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    <span className="text-white font-semibold">CPU</span>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricColor(systemHealth.metrics.cpu, "cpu")}`}>
                    {systemHealth.metrics.cpu}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemHealth.metrics.cpu}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-black/40 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-semibold">Memory</span>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricColor(systemHealth.metrics.memory, "memory")}`}>
                    {systemHealth.metrics.memory}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemHealth.metrics.memory}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-black/40 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold">Disk</span>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricColor(systemHealth.metrics.disk, "disk")}`}>
                    {systemHealth.metrics.disk}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemHealth.metrics.disk}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-black/40 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-semibold">Network</span>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricColor(systemHealth.metrics.network, "network")}`}>
                    {systemHealth.metrics.network}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemHealth.metrics.network}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance History & Error Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card className="bg-black/40 border-primary/30 shadow-[0_0_15px_rgba(0,255,68,0.1)]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                24-Hour Performance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cpu: { label: "CPU", color: "#00FF88" },
                  memory: { label: "Memory", color: "#3B82F6" },
                  network: { label: "Network", color: "#8B5CF6" },
                  errors: { label: "Errors", color: "#EF4444" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="cpu" stroke="#00FF88" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="network" stroke="#8B5CF6" strokeWidth={2} />
                    <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Error Log */}
          <Card className="bg-black/40 border-primary/30 shadow-[0_0_15px_rgba(0,255,68,0.1)]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Recent Errors & Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {systemHealth.errors.map((error, index) => (
                  <motion.div
                    key={error.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-black/50 border border-primary/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getSeverityColor(error.severity)} border text-xs`}>
                          {error.severity.toUpperCase()}
                        </Badge>
                        <span className="text-white text-sm font-semibold">{error.service}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{error.timestamp}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{error.message}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
