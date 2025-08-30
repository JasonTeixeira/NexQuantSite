"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from "recharts"
import {
  Database, Globe, Shield, Zap, Activity, Eye, Settings, Plus, 
  Trash2, Edit, Copy, MoreVertical, Play, Pause, AlertTriangle,
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Users,
  Key, Lock, Unlock, Route, Server, Cloud, Code, FileText,
  BarChart3, PieChart as PieChartIcon, RefreshCw, Download,
  Upload, Search, Filter, Target, Gauge, ThermometerSun,
  Wifi, HardDrive, Cpu
} from "lucide-react"
import { toast } from "sonner"

interface APIEndpoint {
  id: string
  name: string
  path: string
  method: string
  version: string
  status: "active" | "inactive" | "deprecated"
  description: string
  upstream: string
  rateLimit: {
    requests: number
    window: string
    burst: number
  }
  authentication: string[]
  caching: {
    enabled: boolean
    ttl: number
  }
  analytics: {
    requests24h: number
    avgResponse: number
    errorRate: number
    p99: number
  }
}

interface RateLimitRule {
  id: string
  name: string
  description: string
  pattern: string
  method: string
  limit: number
  window: string
  action: "throttle" | "block" | "queue"
  priority: number
  enabled: boolean
}

interface SecurityPolicy {
  id: string
  name: string
  description: string
  rules: Array<{
    type: "ip_whitelist" | "ip_blacklist" | "cors" | "csrf" | "sql_injection" | "xss"
    config: Record<string, any>
    enabled: boolean
  }>
  endpoints: string[]
  enabled: boolean
}

interface GatewayMetrics {
  requests: {
    total: number
    successful: number
    failed: number
    rate: number
  }
  latency: {
    avg: number
    p50: number
    p95: number
    p99: number
  }
  throughput: {
    rps: number
    bandwidth: number
  }
  errors: {
    rate: number
    types: Record<string, number>
  }
  cache: {
    hitRate: number
    size: number
  }
}

const MOCK_ENDPOINTS: APIEndpoint[] = [
  {
    id: "api1",
    name: "User Management API",
    path: "/api/v1/users",
    method: "GET",
    version: "v1",
    status: "active",
    description: "Retrieve user information and profiles",
    upstream: "https://users-service.internal:8080",
    rateLimit: {
      requests: 1000,
      window: "1m",
      burst: 50
    },
    authentication: ["jwt", "api_key"],
    caching: {
      enabled: true,
      ttl: 300
    },
    analytics: {
      requests24h: 24567,
      avgResponse: 156,
      errorRate: 0.8,
      p99: 340
    }
  },
  {
    id: "api2", 
    name: "Trading API",
    path: "/api/v2/trades",
    method: "POST",
    version: "v2",
    status: "active",
    description: "Execute trading operations",
    upstream: "https://trading-engine.internal:9090",
    rateLimit: {
      requests: 100,
      window: "1m",
      burst: 10
    },
    authentication: ["jwt", "hmac"],
    caching: {
      enabled: false,
      ttl: 0
    },
    analytics: {
      requests24h: 8934,
      avgResponse: 45,
      errorRate: 0.3,
      p99: 120
    }
  },
  {
    id: "api3",
    name: "Analytics API",
    path: "/api/v1/analytics",
    method: "GET", 
    version: "v1",
    status: "deprecated",
    description: "Legacy analytics endpoint",
    upstream: "https://analytics.internal:8081",
    rateLimit: {
      requests: 500,
      window: "1m",
      burst: 25
    },
    authentication: ["api_key"],
    caching: {
      enabled: true,
      ttl: 600
    },
    analytics: {
      requests24h: 1234,
      avgResponse: 892,
      errorRate: 2.1,
      p99: 1500
    }
  }
]

const MOCK_RATE_LIMITS: RateLimitRule[] = [
  {
    id: "rl1",
    name: "Global Rate Limit",
    description: "Overall API request limit per client",
    pattern: "/api/*",
    method: "*", 
    limit: 10000,
    window: "1h",
    action: "throttle",
    priority: 1,
    enabled: true
  },
  {
    id: "rl2",
    name: "Trading Rate Limit",
    description: "Strict limits for trading operations",
    pattern: "/api/*/trades*",
    method: "POST",
    limit: 100,
    window: "1m",
    action: "block",
    priority: 10,
    enabled: true
  },
  {
    id: "rl3",
    name: "Public API Limit",
    description: "Generous limits for public endpoints",
    pattern: "/api/v1/public/*",
    method: "GET",
    limit: 5000,
    window: "1h", 
    action: "queue",
    priority: 5,
    enabled: true
  }
]

const MOCK_SECURITY_POLICIES: SecurityPolicy[] = [
  {
    id: "sp1",
    name: "Production Security",
    description: "Standard security policies for production APIs",
    rules: [
      {
        type: "cors",
        config: {
          allowedOrigins: ["https://app.example.com"],
          allowedMethods: ["GET", "POST"],
          allowedHeaders: ["Authorization", "Content-Type"]
        },
        enabled: true
      },
      {
        type: "ip_whitelist",
        config: {
          ips: ["192.168.1.0/24", "10.0.0.0/8"]
        },
        enabled: true
      },
      {
        type: "sql_injection",
        config: {
          patterns: ["'", "--", "/*", "*/", "xp_", "sp_"],
          action: "block"
        },
        enabled: true
      }
    ],
    endpoints: ["/api/v1/*", "/api/v2/*"],
    enabled: true
  },
  {
    id: "sp2",
    name: "Trading Security",
    description: "Enhanced security for trading endpoints",
    rules: [
      {
        type: "ip_whitelist",
        config: {
          ips: ["203.0.113.0/24"]
        },
        enabled: true
      },
      {
        type: "csrf",
        config: {
          tokenHeader: "X-CSRF-Token",
          cookieName: "csrf_token"
        },
        enabled: true
      }
    ],
    endpoints: ["/api/*/trades*"],
    enabled: true
  }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export default function APIGatewayManagement() {
  const [activeTab, setActiveTab] = useState("overview")
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>(MOCK_ENDPOINTS)
  const [rateLimits, setRateLimits] = useState<RateLimitRule[]>(MOCK_RATE_LIMITS)
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>(MOCK_SECURITY_POLICIES)
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"create" | "edit" | "security" | "logs">("create")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const [metrics, setMetrics] = useState<GatewayMetrics>({
    requests: {
      total: 345672,
      successful: 331245,
      failed: 14427,
      rate: 1247
    },
    latency: {
      avg: 156,
      p50: 89,
      p95: 234,
      p99: 456
    },
    throughput: {
      rps: 1247,
      bandwidth: 45.6
    },
    errors: {
      rate: 4.2,
      types: {
        "4xx": 12234,
        "5xx": 2193,
        "timeout": 345,
        "ratelimit": 1889
      }
    },
    cache: {
      hitRate: 87.3,
      size: 2.4
    }
  })

  // Mock real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        requests: {
          ...prev.requests,
          rate: prev.requests.rate + Math.floor(Math.random() * 20) - 10
        },
        latency: {
          ...prev.latency,
          avg: Math.max(50, prev.latency.avg + Math.floor(Math.random() * 10) - 5)
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Time series data for charts
  const requestTimeSeriesData = [
    { time: "00:00", requests: 980, errors: 15, latency: 145 },
    { time: "04:00", requests: 650, errors: 8, latency: 132 },
    { time: "08:00", requests: 1340, errors: 25, latency: 167 },
    { time: "12:00", requests: 1890, errors: 42, latency: 189 },
    { time: "16:00", requests: 2150, errors: 38, latency: 203 },
    { time: "20:00", requests: 1620, errors: 22, latency: 156 }
  ]

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(endpoint => {
      const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          endpoint.path.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || endpoint.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [endpoints, searchTerm, filterStatus])

  const handleEndpointToggle = (endpointId: string) => {
    setEndpoints(prev => prev.map(ep => 
      ep.id === endpointId 
        ? { ...ep, status: ep.status === 'active' ? 'inactive' : 'active' }
        : ep
    ))
  }

  const handleRateLimitToggle = (ruleId: string) => {
    setRateLimits(prev => prev.map(rl => 
      rl.id === ruleId ? { ...rl, enabled: !rl.enabled } : rl
    ))
  }

  const handleSecurityPolicyToggle = (policyId: string) => {
    setSecurityPolicies(prev => prev.map(sp => 
      sp.id === policyId ? { ...sp, enabled: !sp.enabled } : sp
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4 text-green-400" />
      case "inactive": return <XCircle className="w-4 h-4 text-red-400" />
      case "deprecated": return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-500/20 text-green-400"
      case "POST": return "bg-blue-500/20 text-blue-400"
      case "PUT": return "bg-yellow-500/20 text-yellow-400"
      case "DELETE": return "bg-red-500/20 text-red-400"
      case "PATCH": return "bg-purple-500/20 text-purple-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getHealthStatus = (endpoint: APIEndpoint) => {
    if (endpoint.analytics.errorRate > 5) return { color: "text-red-400", status: "unhealthy" }
    if (endpoint.analytics.errorRate > 2) return { color: "text-yellow-400", status: "degraded" }
    return { color: "text-green-400", status: "healthy" }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-400" />
            API Gateway Management
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor, secure, and manage your API gateway with advanced features
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => { setDialogType("create"); setDialogOpen(true) }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Endpoint
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-400">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Requests/sec</p>
                <p className="text-2xl font-bold text-white">{metrics.requests.rate.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Latency</p>
                <p className="text-2xl font-bold text-white">{metrics.latency.avg}ms</p>
              </div>
              <Gauge className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Error Rate</p>
                <p className="text-2xl font-bold text-white">{metrics.errors.rate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-white">{metrics.cache.hitRate.toFixed(1)}%</p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-teal-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Throughput</p>
                <p className="text-2xl font-bold text-white">{metrics.throughput.bandwidth.toFixed(1)} MB/s</p>
              </div>
              <Wifi className="w-8 h-8 text-teal-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">P99 Latency</p>
                <p className="text-2xl font-bold text-white">{metrics.latency.p99}ms</p>
              </div>
              <Target className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="endpoints" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Endpoints
          </TabsTrigger>
          <TabsTrigger 
            value="ratelimits" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Rate Limits
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="config" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Volume */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Request Volume
                </CardTitle>
                <CardDescription>API request patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <AreaChart data={requestTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Area type="monotone" dataKey="requests" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name="Requests" />
                    <Area type="monotone" dataKey="errors" fill="#EF4444" fillOpacity={0.3} stroke="#EF4444" name="Errors" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Error Distribution */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Error Distribution
                </CardTitle>
                <CardDescription>Types of errors encountered</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <PieChart>
                    <Pie
                      data={Object.entries(metrics.errors.types).map(([key, value]) => ({
                        name: key,
                        value,
                        color: COLORS[Object.keys(metrics.errors.types).indexOf(key)]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {Object.entries(metrics.errors.types).map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Object.entries(metrics.errors.types).map(([key, value], index) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-gray-300 text-sm">{key}: {value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Endpoints */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Endpoints</CardTitle>
              <CardDescription>Most active API endpoints and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.slice(0, 5).map((endpoint) => {
                  const health = getHealthStatus(endpoint)
                  return (
                    <div key={endpoint.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <div>
                          <div className="text-white font-medium">{endpoint.name}</div>
                          <div className="text-gray-400 text-sm">{endpoint.path}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="text-white font-medium">{endpoint.analytics.requests24h.toLocaleString()}</div>
                          <div className="text-gray-400">requests</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-medium">{endpoint.analytics.avgResponse}ms</div>
                          <div className="text-gray-400">avg latency</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-medium ${health.color}`}>{endpoint.analytics.errorRate.toFixed(1)}%</div>
                          <div className="text-gray-400">error rate</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(endpoint.status)}
                          <span className={`text-sm ${health.color}`}>{health.status}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-gray-400 text-sm">
              {filteredEndpoints.length} of {endpoints.length} endpoints
            </div>
          </div>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">API Endpoints</CardTitle>
              <CardDescription>
                Manage your API endpoints, routing, and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Endpoint</TableHead>
                    <TableHead className="text-gray-300">Method</TableHead>
                    <TableHead className="text-gray-300">Version</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Requests</TableHead>
                    <TableHead className="text-gray-300">Latency</TableHead>
                    <TableHead className="text-gray-300">Error Rate</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEndpoints.map((endpoint) => {
                    const health = getHealthStatus(endpoint)
                    return (
                      <TableRow key={endpoint.id} className="border-gray-700">
                        <TableCell>
                          <div>
                            <div className="text-white font-medium">{endpoint.name}</div>
                            <div className="text-gray-400 text-sm font-mono">{endpoint.path}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{endpoint.version}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(endpoint.status)}
                            <span className="text-white capitalize">{endpoint.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{endpoint.analytics.requests24h.toLocaleString()}</TableCell>
                        <TableCell className="text-white">{endpoint.analytics.avgResponse}ms</TableCell>
                        <TableCell>
                          <span className={health.color}>{endpoint.analytics.errorRate.toFixed(1)}%</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedEndpoint(endpoint)
                                setDialogType("edit")
                                setDialogOpen(true)
                              }}
                              className="h-8 w-8 p-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Switch
                              checked={endpoint.status === 'active'}
                              onCheckedChange={() => handleEndpointToggle(endpoint.id)}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-1">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Logs
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Security
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem className="text-red-400">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="ratelimits" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Rate Limiting Rules</CardTitle>
                  <CardDescription>
                    Configure API rate limits and throttling policies
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => toast.success("Rate limit rule created!")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Rule Name</TableHead>
                    <TableHead className="text-gray-300">Pattern</TableHead>
                    <TableHead className="text-gray-300">Method</TableHead>
                    <TableHead className="text-gray-300">Limit</TableHead>
                    <TableHead className="text-gray-300">Window</TableHead>
                    <TableHead className="text-gray-300">Action</TableHead>
                    <TableHead className="text-gray-300">Priority</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateLimits.map((rule) => (
                    <TableRow key={rule.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">{rule.name}</div>
                          <div className="text-gray-400 text-sm">{rule.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-blue-400 bg-gray-800 px-2 py-1 rounded text-sm">
                          {rule.pattern}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMethodColor(rule.method)}>
                          {rule.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{rule.limit.toLocaleString()}</TableCell>
                      <TableCell className="text-white">{rule.window}</TableCell>
                      <TableCell>
                        <Badge className={
                          rule.action === 'block' ? 'bg-red-500/20 text-red-400' :
                          rule.action === 'throttle' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {rule.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{rule.priority}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {rule.enabled ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-white">{rule.enabled ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-1"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleRateLimitToggle(rule.id)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Policies
                  </CardTitle>
                  <CardDescription>
                    Configure security rules and threat protection
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => toast.success("Security policy created!")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityPolicies.map((policy) => (
                  <Card key={policy.id} className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">{policy.name}</CardTitle>
                          <CardDescription>{policy.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={policy.enabled}
                            onCheckedChange={() => handleSecurityPolicyToggle(policy.id)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-1">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Policy
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-gray-300 text-sm">Applied to:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {policy.endpoints.map((endpoint, index) => (
                              <Badge key={index} className="bg-blue-500/20 text-blue-400 text-xs">
                                {endpoint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-300 text-sm">Security Rules:</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                            {policy.rules.map((rule, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                                <span className="text-white text-sm capitalize">
                                  {rule.type.replace('_', ' ')}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {rule.enabled ? (
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <XCircle className="w-3 h-3 text-red-400" />
                                  )}
                                  <span className="text-gray-400 text-xs">
                                    {rule.enabled ? 'On' : 'Off'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latency Distribution */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Latency Distribution</CardTitle>
                <CardDescription>Response time percentiles</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <BarChart data={[
                    { percentile: "P50", latency: metrics.latency.p50 },
                    { percentile: "P95", latency: metrics.latency.p95 },
                    { percentile: "P99", latency: metrics.latency.p99 },
                    { percentile: "Max", latency: metrics.latency.p99 * 1.5 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="percentile" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey="latency" fill="#3B82F6" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Response Codes */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Response Codes</CardTitle>
                <CardDescription>HTTP status code distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">2xx Success</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85.6} className="w-24 h-2" />
                      <span className="text-green-400 font-medium">85.6%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">3xx Redirect</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={8.2} className="w-24 h-2" />
                      <span className="text-blue-400 font-medium">8.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">4xx Client Error</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={4.8} className="w-24 h-2" />
                      <span className="text-yellow-400 font-medium">4.8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">5xx Server Error</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={1.4} className="w-24 h-2" />
                      <span className="text-red-400 font-medium">1.4%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Detailed Performance Metrics</CardTitle>
              <CardDescription>Comprehensive API performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Request Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Requests</span>
                      <span className="text-white">{metrics.requests.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Successful</span>
                      <span className="text-green-400">{metrics.requests.successful.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed</span>
                      <span className="text-red-400">{metrics.requests.failed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Rate</span>
                      <span className="text-white">{metrics.requests.rate}/sec</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Latency Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average</span>
                      <span className="text-white">{metrics.latency.avg}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P50 (Median)</span>
                      <span className="text-white">{metrics.latency.p50}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P95</span>
                      <span className="text-yellow-400">{metrics.latency.p95}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P99</span>
                      <span className="text-red-400">{metrics.latency.p99}ms</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Cache & Throughput</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cache Hit Rate</span>
                      <span className="text-green-400">{metrics.cache.hitRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cache Size</span>
                      <span className="text-white">{metrics.cache.size.toFixed(1)} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Throughput</span>
                      <span className="text-white">{metrics.throughput.bandwidth.toFixed(1)} MB/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Peak RPS</span>
                      <span className="text-blue-400">{(metrics.throughput.rps * 1.3).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gateway Settings */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Gateway Configuration</CardTitle>
                <CardDescription>Core gateway settings and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Enable Request Logging</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Enable Response Compression</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Enable CORS</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Enable Circuit Breaker</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Default Timeout (seconds)</Label>
                  <Input 
                    type="number" 
                    defaultValue="30"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Max Request Size (MB)</Label>
                  <Input 
                    type="number" 
                    defaultValue="10"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Gateway Settings
                </Button>
              </CardContent>
            </Card>

            {/* Load Balancing */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Load Balancing</CardTitle>
                <CardDescription>Configure load balancing and health checks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Load Balancing Algorithm</Label>
                  <Select defaultValue="round_robin">
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="least_connections">Least Connections</SelectItem>
                      <SelectItem value="weighted">Weighted</SelectItem>
                      <SelectItem value="ip_hash">IP Hash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Health Check Interval (seconds)</Label>
                  <Input 
                    type="number" 
                    defaultValue="30"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Health Check Timeout (seconds)</Label>
                  <Input 
                    type="number" 
                    defaultValue="5"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Enable Circuit Breaker</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Enable Sticky Sessions</Label>
                    <Switch />
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Update Load Balancer
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Endpoint Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {dialogType === 'create' ? 'Add API Endpoint' : 'Edit API Endpoint'}
            </DialogTitle>
            <DialogDescription>
              Configure the API endpoint routing and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Endpoint Name</Label>
                <Input 
                  defaultValue={selectedEndpoint?.name}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  placeholder="e.g. User Management API"
                />
              </div>
              <div>
                <Label className="text-gray-300">Version</Label>
                <Input 
                  defaultValue={selectedEndpoint?.version}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  placeholder="e.g. v1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Path</Label>
                <Input 
                  defaultValue={selectedEndpoint?.path}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  placeholder="e.g. /api/v1/users"
                />
              </div>
              <div>
                <Label className="text-gray-300">Method</Label>
                <Select defaultValue={selectedEndpoint?.method}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Upstream URL</Label>
              <Input 
                defaultValue={selectedEndpoint?.upstream}
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="https://backend-service.internal:8080"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea 
                defaultValue={selectedEndpoint?.description}
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="Describe the endpoint functionality"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Rate Limit (per minute)</Label>
                <Input 
                  type="number"
                  defaultValue={selectedEndpoint?.rateLimit.requests}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300">Cache TTL (seconds)</Label>
                <Input 
                  type="number"
                  defaultValue={selectedEndpoint?.caching.ttl}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2 pb-2">
                  <Switch defaultChecked={selectedEndpoint?.caching.enabled} />
                  <Label className="text-gray-300">Enable Caching</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setDialogOpen(false)
                toast.success(dialogType === 'create' ? "Endpoint created!" : "Endpoint updated!")
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {dialogType === 'create' ? 'Create Endpoint' : 'Update Endpoint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
