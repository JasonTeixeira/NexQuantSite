"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Cpu, HardDrive, Wifi, Database, Thermometer } from "lucide-react"
import { toast } from "sonner"

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: "healthy" | "warning" | "critical"
  threshold: { warning: number; critical: number }
  history: Array<{ timestamp: string; value: number }>
  icon: any
  category: string
}

interface SystemService {
  id: string
  name: string
  status: "running" | "stopped" | "error" | "starting" | "stopping"
  uptime: number
  cpu: number
  memory: number
  port: number
  version: string
  lastRestart: string
  dependencies: string[]
  healthCheck: string
}

interface SystemAlert {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  category: string
  timestamp: string
  status: "active" | "acknowledged" | "resolved"
  affectedServices: string[]
  resolution?: string
}

interface PerformanceTest {
  id: string
  name: string
  type: "cpu" | "memory" | "disk" | "network" | "database"
  status: "idle" | "running" | "completed" | "failed"
  progress: number
  duration: number
  results?: {
    score: number
    details: Record<string, any>
  }
  lastRun: string
}

const systemMetrics: SystemMetric[] = [
  {
    id: "cpu",
    name: "CPU Usage",
    value: 45.2,
    unit: "%",
    status: "healthy",
    threshold: { warning: 70, critical: 90 },
    history: [
      { timestamp: "00:00", value: 35 },
      { timestamp: "04:00", value: 42 },
      { timestamp: "08:00", value: 65 },
      { timestamp: "12:00", value: 78 },
      { timestamp: "16:00", value: 45 },
      { timestamp: "20:00", value: 38 },
    ],
    icon: Cpu,
    category: "Performance",
  },
  {
    id: "memory",
    name: "Memory Usage",
    value: 68.7,
    unit: "%",
    status: "warning",
    threshold: { warning: 70, critical: 85 },
    history: [
      { timestamp: "00:00", value: 45 },
      { timestamp: "04:00", value: 52 },
      { timestamp: "08:00", value: 71 },
      { timestamp: "12:00", value: 83 },
      { timestamp: "16:00", value: 67 },
      { timestamp: "20:00", value: 54 },
    ],
    icon: HardDrive,
    category: "Performance",
  },
  {
    id: "disk",
    name: "Disk Usage",
    value: 23.4,
    unit: "%",
    status: "healthy",
    threshold: { warning: 80, critical: 95 },
    history: [
      { timestamp: "00:00", value: 20 },
      { timestamp: "04:00", value: 21 },
      { timestamp: "08:00", value: 22 },
      { timestamp: "12:00", value: 24 },
      { timestamp: "16:00", value: 23 },
      { timestamp: "20:00", value: 23 },
    ],
    icon: Database,
    category: "Storage",
  },
  {
    id: "network",
    name: "Network Load",
    value: 12.8,
    unit: "Mbps",
    status: "healthy",
    threshold: { warning: 80, critical: 95 },
    history: [
      { timestamp: "00:00", value: 8 },
      { timestamp: "04:00", value: 15 },
      { timestamp: "08:00", value: 25 },
      { timestamp: "12:00", value: 18 },
      { timestamp: "16:00", value: 12 },
      { timestamp: "20:00", value: 9 },
    ],
    icon: Wifi,
    category: "Network",
  },
  {
    id: "temperature",
    name: "CPU Temperature",
    value: 62.5,
    unit: "°C",
    status: "healthy",
    threshold: { warning: 75, critical: 85 },
    history: [
      { timestamp: "00:00", value: 58 },
      { timestamp: "04:00", value: 61 },
      { timestamp: "08:00", value: 68 },
      { timestamp: "12:00", value: 72 },
      { timestamp: "16:00", value: 62 },
      { timestamp: "20:00", value: 59 },
    ],
    icon: Thermometer,
    category: "Hardware",
  },
]

export default function SystemDiagnosticsClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<SystemMetric[]>(systemMetrics)
  const [services, setServices] = useState<SystemService[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [performanceTests, setPerformanceTests] = useState<PerformanceTest[]>([])
  const [selectedMetric, setSelectedMetric] = useState<SystemMetric | null>(null)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  useEffect(() => {
    loadSystemData()
    
    if (isRealTimeEnabled) {
      const interval = setInterval(() => {
        updateMetrics()
      }, refreshInterval * 1000)
      
      return () => clearInterval(interval)
    }
  }, [isRealTimeEnabled, refreshInterval])

  const loadSystemData = () => {
    // Mock services data
    const mockServices: SystemService[] = [
      {
        id: "api-gateway",
        name: "API Gateway",
        status: "running",
        uptime: 2592000, // 30 days
        cpu: 15.2,
        memory: 512,
        port: 8080,
        version: "2.1.0",
        lastRestart: "2024-01-01 00:00:00",
        dependencies: ["database", "redis"],
        healthCheck: "/health",
      },
      {
        id: "database",
        name: "PostgreSQL Database",
        status: "running",
        uptime: 5184000, // 60 days
        cpu: 25.8,
        memory: 2048,
        port: 5432,
        version: "14.2",
        lastRestart: "2023-12-01 00:00:00",
        dependencies: [],
        healthCheck: "SELECT 1",
      },
      {
        id: "redis",
        name: "Redis Cache",
        status: "running",
        uptime: 2592000,
        cpu: 5.1,
        memory: 256,
        port: 6379,
        version: "7.0.5",
        lastRestart: "2024-01-01 00:00:00",
        dependencies: [],
        healthCheck: "PING",
      },
      {
        id: "trading-engine",
        name: "Trading Engine",
        status: "error",
        uptime: 86400, // 1 day
        cpu: 45.6,
        memory: 1024,
        port: 8081,
        version: "1.5.2",
        lastRestart: "2024-01-20 00:00:00",
        dependencies: ["database", "api-gateway"],
        healthCheck: "/trading/health",
      },
      {
        id: "notification-service",
        name: "Notification Service",
        status: "error",
        uptime: 0,
        cpu: 0,
        memory: 0,
        port: 8082,
        version: "1.2.1",
        lastRestart: "2024-01-20 14:30:00",
        dependencies: ["database"],
        healthCheck: "/notifications/health",
      },
    ]

    // Mock alerts data
    const mockAlerts: SystemAlert[] = [
      {
        id: "1",
        title: "High Memory Usage",
        description: "Memory usage has exceeded 70% threshold",
        severity: "medium",
        category: "Performance",
        timestamp: "2024-01-20 15:30:00",
        status: "active",
        affectedServices: ["trading-engine"],
      },
      {
        id: "2",
        title: "Service Down",
        description: "Notification service is not responding",
        severity: "high",
        category: "Service",
        timestamp: "2024-01-20 14:30:00",
        status: "active",
        affectedServices: ["notification-service"],
      },
      {
        id: "3",
        title: "Database Connection Pool Full",
        description: "Database connection pool has reached maximum capacity",
        severity: "critical",
        category: "Database",
        timestamp: "2024-01-20 13:15:00",
        status: "resolved",
        affectedServices: ["database"],
        resolution: "Increased connection pool size from 100 to 200",
      },
    ]

    // Mock performance tests
    const mockTests: PerformanceTest[] = [
      {
        id: "cpu-stress",
        name: "CPU Stress Test",
        type: "cpu",
        status: "completed",
        progress: 100,
        duration: 300,
        results: {
          score: 8.5,
          details: {
            singleCore: 1250,
            multiCore: 8900,
            temperature: 68.2,
          },
        },
        lastRun: "2024-01-20 12:00:00",
      },
      {
        id: "memory-test",
        name: "Memory Bandwidth Test",
        type: "memory",
        status: "completed",
        progress: 100,
        duration: 180,
        results: {
          score: 9.2,
          details: {
            readSpeed: 25600,
            writeSpeed: 23400,
            latency: 65,
          },
        },
        lastRun: "2024-01-20 11:30:00",
      },
      {
        id: "disk-benchmark",
        name: "Disk I/O Benchmark",
        type: "disk",
        status: "running",
        progress: 65,
        duration: 600,
        lastRun: "2024-01-20 15:45:00",
      },
    ]

    setServices(mockServices)
    setAlerts(mockAlerts)
    setPerformanceTests(mockTests)
  }

  const updateMetrics = () => {
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
      status: metric.value > metric.threshold.critical ? "critical" :
              metric.value > metric.threshold.warning ? "warning" : "healthy",
    })))
  }

  const restartService = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, status: "starting", lastRestart: new Date().toISOString() }
        : service
    ))
    
    setTimeout(() => {
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status: "running", uptime: 0 }
          : service
      ))
      toast.success(`${serviceId} restarted successfully`)
    }, 5000)
  }

  const runPerformanceTest = (testId: string) => {
    const test = performanceTests.find(t => t.id === testId)
    if (!test) return

    setPerformanceTests(prev => prev.map(t => 
      t.id === testId 
        ? { ...t, status: "running", lastRun: new Date().toISOString() }
        : t
    ))

    setTimeout(() => {
      setPerformanceTests(prev => prev.map(t => 
        t.id === testId 
          ? { ...t, status: "completed", duration: Math.floor(Math.random() * 1000) + 500 }
          : t
      ))
      toast.success(`${test.name} test completed successfully`)
    }, 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading system diagnostics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              SYSTEM <span className="text-primary">DIAGNOSTICS</span>
            </h1>
            <p className="text-gray-400">Real-time system monitoring and performance diagnostics</p>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.id} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <metric.icon className="w-8 h-8 text-blue-400" />
                  <Badge
                    className={
                      metric.status === "healthy"
                        ? "bg-green-500/20 text-green-400"
                        : metric.status === "warning"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }
                  >
                    {metric.status}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{metric.name}</h3>
                <div className="text-3xl font-bold text-white mb-2">
                  {metric.value}{metric.unit}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
