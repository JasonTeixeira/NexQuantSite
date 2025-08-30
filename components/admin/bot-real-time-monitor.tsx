"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, Cpu, MemoryStick, Wifi, Server,
  AlertTriangle, CheckCircle, Clock, Zap,
  TrendingUp, TrendingDown, RefreshCw,
  Monitor, Database, Network, Signal
} from "lucide-react"

interface RealTimeMetrics {
  botId: string
  botName: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  cpuUsage: number
  memoryUsage: number
  activeExecutions: number
  queuedOrders: number
  latency: number
  throughput: number
  errorRate: number
  uptime: number
  lastHeartbeat: string
}

const MOCK_REAL_TIME_DATA: RealTimeMetrics[] = [
  {
    botId: 'quantum',
    botName: 'Quantum Momentum Engine',
    status: 'healthy',
    cpuUsage: 34,
    memoryUsage: 42,
    activeExecutions: 23,
    queuedOrders: 7,
    latency: 8,
    throughput: 247,
    errorRate: 0.2,
    uptime: 99.7,
    lastHeartbeat: new Date().toISOString()
  },
  {
    botId: 'execution',
    botName: 'Execution Precision Protocol',
    status: 'healthy',
    cpuUsage: 45,
    memoryUsage: 52,
    activeExecutions: 67,
    queuedOrders: 12,
    latency: 4,
    throughput: 892,
    errorRate: 0.1,
    uptime: 99.9,
    lastHeartbeat: new Date().toISOString()
  },
  {
    botId: 'oracle',
    botName: 'Oracle Volatility Scanner',
    status: 'warning',
    cpuUsage: 67,
    memoryUsage: 71,
    activeExecutions: 45,
    queuedOrders: 23,
    latency: 15,
    throughput: 156,
    errorRate: 2.1,
    uptime: 97.8,
    lastHeartbeat: new Date(Date.now() - 30000).toISOString()
  },
  {
    botId: 'reversal',
    botName: 'Reversal Recognition Matrix',
    status: 'healthy',
    cpuUsage: 28,
    memoryUsage: 35,
    activeExecutions: 34,
    queuedOrders: 8,
    latency: 12,
    throughput: 198,
    errorRate: 0.8,
    uptime: 99.4,
    lastHeartbeat: new Date().toISOString()
  },
  {
    botId: 'zenith',
    botName: 'Zenith Mean Reversion',
    status: 'healthy',
    cpuUsage: 22,
    memoryUsage: 28,
    activeExecutions: 19,
    queuedOrders: 4,
    latency: 10,
    throughput: 134,
    errorRate: 0.5,
    uptime: 99.2,
    lastHeartbeat: new Date().toISOString()
  }
]

export default function BotRealTimeMonitor() {
  const [metrics, setMetrics] = useState<RealTimeMetrics[]>(MOCK_REAL_TIME_DATA)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        cpuUsage: Math.max(10, Math.min(90, metric.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(15, Math.min(95, metric.memoryUsage + (Math.random() - 0.5) * 8)),
        activeExecutions: Math.max(0, metric.activeExecutions + Math.floor((Math.random() - 0.5) * 10)),
        queuedOrders: Math.max(0, metric.queuedOrders + Math.floor((Math.random() - 0.5) * 5)),
        latency: Math.max(2, Math.min(30, metric.latency + (Math.random() - 0.5) * 4)),
        throughput: Math.max(50, metric.throughput + Math.floor((Math.random() - 0.5) * 50)),
        errorRate: Math.max(0, Math.min(5, metric.errorRate + (Math.random() - 0.5) * 0.5)),
        lastHeartbeat: new Date().toISOString()
      })))
      setLastUpdate(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    setLastUpdate(new Date())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-600 text-green-100'
      case 'warning': return 'bg-yellow-600 text-yellow-100'
      case 'critical': return 'bg-red-600 text-red-100'
      case 'offline': return 'bg-gray-600 text-gray-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'offline': return <Server className="w-4 h-4" />
      default: return <Server className="w-4 h-4" />
    }
  }

  const overallHealth = metrics.filter(m => m.status === 'healthy').length / metrics.length * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Monitor className="w-6 h-6 mr-2 text-blue-400" />
            Real-time Bot Monitoring
          </h2>
          <p className="text-gray-400">Live performance and health metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-gray-400 text-sm">Overall Health</div>
            <div className={`text-lg font-bold ${overallHealth >= 90 ? 'text-green-400' : overallHealth >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
              {overallHealth.toFixed(0)}%
            </div>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-sm text-gray-400 flex items-center">
        <Clock className="w-4 h-4 mr-1" />
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <motion.div
            key={metric.botId}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{metric.botName}</CardTitle>
                  <Badge className={getStatusColor(metric.status)}>
                    {getStatusIcon(metric.status)}
                    <span className="ml-1">{metric.status}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* System Resources */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 flex items-center">
                        <Cpu className="w-3 h-3 mr-1" />
                        CPU Usage
                      </span>
                      <span className="text-white">{metric.cpuUsage}%</span>
                    </div>
                    <Progress 
                      value={metric.cpuUsage} 
                      className={`h-2 ${metric.cpuUsage > 80 ? 'bg-red-900' : metric.cpuUsage > 60 ? 'bg-yellow-900' : 'bg-green-900'}`} 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 flex items-center">
                        <MemoryStick className="w-3 h-3 mr-1" />
                        Memory
                      </span>
                      <span className="text-white">{metric.memoryUsage}%</span>
                    </div>
                    <Progress 
                      value={metric.memoryUsage} 
                      className={`h-2 ${metric.memoryUsage > 80 ? 'bg-red-900' : metric.memoryUsage > 60 ? 'bg-yellow-900' : 'bg-green-900'}`}
                    />
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Activity className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-400 text-xs">Active</span>
                    </div>
                    <div className="text-white font-bold">{metric.activeExecutions}</div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span className="text-gray-400 text-xs">Queue</span>
                    </div>
                    <div className="text-white font-bold">{metric.queuedOrders}</div>
                  </div>

                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Wifi className="w-3 h-3 text-green-400" />
                      <span className="text-gray-400 text-xs">Latency</span>
                    </div>
                    <div className={`font-bold ${metric.latency <= 10 ? 'text-green-400' : metric.latency <= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {metric.latency}ms
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-3 h-3 text-orange-400" />
                      <span className="text-gray-400 text-xs">Throughput</span>
                    </div>
                    <div className="text-white font-bold">{metric.throughput}/min</div>
                  </div>
                </div>

                {/* Error Rate & Uptime */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Error Rate:</span>
                    <span className={`font-bold ${metric.errorRate <= 1 ? 'text-green-400' : metric.errorRate <= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {metric.errorRate}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Uptime:</span>
                    <span className={`font-bold ${metric.uptime >= 99 ? 'text-green-400' : metric.uptime >= 95 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {metric.uptime}%
                    </span>
                  </div>
                </div>

                {/* Last Heartbeat */}
                <div className="text-xs text-gray-500 text-center">
                  Last heartbeat: {new Date(metric.lastHeartbeat).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* System Overview */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-400" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {metrics.filter(m => m.status === 'healthy').length}
              </div>
              <div className="text-gray-400 text-sm">Healthy Bots</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-gray-400 text-sm">Warning Status</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {metrics.reduce((sum, m) => sum + m.activeExecutions, 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Executions</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {metrics.reduce((sum, m) => sum + m.throughput, 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Throughput/min</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            System Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <div className="text-yellow-200 font-semibold">High Resource Usage Warning</div>
                <div className="text-yellow-300 text-sm">Oracle Volatility Scanner is using 67% CPU and 71% memory. Consider optimization.</div>
                <div className="text-yellow-400 text-xs">2 minutes ago</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <div className="text-green-200 font-semibold">Algorithm Update Completed</div>
                <div className="text-green-300 text-sm">Execution Precision Protocol updated to v4.1.0 successfully. All users migrated.</div>
                <div className="text-green-400 text-xs">1 hour ago</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <Signal className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-blue-200 font-semibold">New Bot Deployment</div>
                <div className="text-blue-300 text-sm">156 new users deployed bots in the last hour. System handling load well.</div>
                <div className="text-blue-400 text-xs">5 minutes ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
