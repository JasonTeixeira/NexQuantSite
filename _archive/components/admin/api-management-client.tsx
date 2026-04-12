"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Zap,
  Plus,
  Settings,
  Shield,
  Activity,
  Clock,
  AlertTriangle,
  Key,
  Code,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Edit,
  Link,
  Monitor,
  Webhook,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

// Mock API data
const apiEndpoints = [
  {
    id: "api-001",
    name: "Trading Signals API",
    endpoint: "/api/v1/signals",
    method: "GET",
    status: "active",
    version: "v1.2",
    requests: 15420,
    errors: 23,
    avgResponseTime: 145,
    uptime: 99.8,
    rateLimit: "1000/hour",
    authentication: "API Key",
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "api-002",
    name: "User Management API",
    endpoint: "/api/v1/users",
    method: "POST",
    status: "active",
    version: "v2.0",
    requests: 8750,
    errors: 12,
    avgResponseTime: 89,
    uptime: 99.9,
    rateLimit: "500/hour",
    authentication: "OAuth 2.0",
    lastUpdated: "2024-01-15T09:15:00Z",
  },
  {
    id: "api-003",
    name: "Market Data API",
    endpoint: "/api/v1/market-data",
    method: "GET",
    status: "maintenance",
    version: "v1.5",
    requests: 25600,
    errors: 156,
    avgResponseTime: 234,
    uptime: 98.5,
    rateLimit: "2000/hour",
    authentication: "Bearer Token",
    lastUpdated: "2024-01-15T08:45:00Z",
  },
  {
    id: "api-004",
    name: "Payment Processing API",
    endpoint: "/api/v1/payments",
    method: "POST",
    status: "deprecated",
    version: "v1.0",
    requests: 3200,
    errors: 45,
    avgResponseTime: 567,
    uptime: 97.2,
    rateLimit: "100/hour",
    authentication: "API Key",
    lastUpdated: "2024-01-14T16:20:00Z",
  },
]

const apiKeys = [
  {
    id: "key-001",
    name: "Production Key",
    key: "nexural_prod_1234567890abcdef",
    permissions: ["read", "write"],
    rateLimit: "10000/hour",
    lastUsed: "2024-01-15T14:30:00Z",
    status: "active",
    expiresAt: "2024-12-31T23:59:59Z",
  },
  {
    id: "key-002",
    name: "Development Key",
    key: "nexural_dev_abcdef1234567890",
    permissions: ["read"],
    rateLimit: "1000/hour",
    lastUsed: "2024-01-15T12:15:00Z",
    status: "active",
    expiresAt: "2024-06-30T23:59:59Z",
  },
  {
    id: "key-003",
    name: "Testing Key",
    key: "nexural_test_567890abcdef1234",
    permissions: ["read", "write", "admin"],
    rateLimit: "5000/hour",
    lastUsed: "2024-01-14T18:45:00Z",
    status: "inactive",
    expiresAt: "2024-03-31T23:59:59Z",
  },
]

const webhooks = [
  {
    id: "webhook-001",
    name: "Payment Success",
    url: "https://api.example.com/webhooks/payment-success",
    events: ["payment.completed", "payment.failed"],
    status: "active",
    lastTriggered: "2024-01-15T13:20:00Z",
    successRate: 98.5,
    retryCount: 3,
  },
  {
    id: "webhook-002",
    name: "User Registration",
    url: "https://api.example.com/webhooks/user-registered",
    events: ["user.created", "user.verified"],
    status: "active",
    lastTriggered: "2024-01-15T11:45:00Z",
    successRate: 99.2,
    retryCount: 2,
  },
  {
    id: "webhook-003",
    name: "Signal Alert",
    url: "https://api.example.com/webhooks/signal-alert",
    events: ["signal.created", "signal.updated"],
    status: "failed",
    lastTriggered: "2024-01-15T10:10:00Z",
    successRate: 85.3,
    retryCount: 5,
  },
]

const apiMetrics = [
  { time: "00:00", requests: 1200, errors: 5, responseTime: 150 },
  { time: "04:00", requests: 800, errors: 2, responseTime: 145 },
  { time: "08:00", requests: 2500, errors: 12, responseTime: 165 },
  { time: "12:00", requests: 3200, errors: 18, responseTime: 180 },
  { time: "16:00", requests: 2800, errors: 15, responseTime: 170 },
  { time: "20:00", requests: 1800, errors: 8, responseTime: 155 },
]

export default function ApiManagementClient() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("all")
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTestingApi, setIsTestingApi] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400"
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-400"
      case "deprecated":
        return "bg-red-500/20 text-red-400"
      case "failed":
        return "bg-red-500/20 text-red-400"
      case "inactive":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500/20 text-blue-400"
      case "POST":
        return "bg-green-500/20 text-green-400"
      case "PUT":
        return "bg-yellow-500/20 text-yellow-400"
      case "DELETE":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const testApiEndpoint = async (endpoint: any) => {
    setIsTestingApi(true)
    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsTestingApi(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Zap className="w-8 h-8 mr-3 text-primary" />
            API Management
          </h1>
          <p className="text-gray-400 mt-1">Comprehensive API integration, monitoring, and security management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
            <FileText className="w-4 h-4 mr-2" />
            Documentation
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/80">
                <Plus className="w-4 h-4 mr-2" />
                New API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New API Key</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Generate a new API key with specific permissions and rate limits
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keyName" className="text-gray-300">
                      Key Name
                    </Label>
                    <Input
                      id="keyName"
                      placeholder="Enter key name"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment" className="text-gray-300">
                      Environment
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="permissions" className="text-gray-300">
                    Permissions
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="read" />
                      <Label htmlFor="read" className="text-gray-300">
                        Read
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="write" />
                      <Label htmlFor="write" className="text-gray-300">
                        Write
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="admin" />
                      <Label htmlFor="admin" className="text-gray-300">
                        Admin
                      </Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="rateLimit" className="text-gray-300">
                    Rate Limit
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select rate limit" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="100">100 requests/hour</SelectItem>
                      <SelectItem value="1000">1,000 requests/hour</SelectItem>
                      <SelectItem value="5000">5,000 requests/hour</SelectItem>
                      <SelectItem value="10000">10,000 requests/hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiresAt" className="text-gray-300">
                    Expiration Date
                  </Label>
                  <Input id="expiresAt" type="date" className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-primary hover:bg-primary/80">Generate Key</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* API Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-white">52,970</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400">+12.5%</span>
              <span className="text-gray-400 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Error Rate</p>
                <p className="text-2xl font-bold text-white">0.44%</p>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400">-2.1%</span>
              <span className="text-gray-400 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">156ms</p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-red-400 mr-1" />
              <span className="text-red-400">+5.2%</span>
              <span className="text-gray-400 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Keys</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Key className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400">+3</span>
              <span className="text-gray-400 ml-1">new this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main API Management Tabs */}
      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="endpoints" className="data-[state=active]:bg-primary">
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="keys" className="data-[state=active]:bg-primary">
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-primary">
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-primary">
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <div className="grid gap-4">
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{endpoint.name}</h3>
                        <Badge className={getStatusColor(endpoint.status)}>{endpoint.status}</Badge>
                        <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {endpoint.version}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <Code className="w-4 h-4 text-gray-400" />
                        <code className="text-sm bg-gray-800 px-2 py-1 rounded text-green-400">
                          {endpoint.endpoint}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.endpoint)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Requests:</span>
                          <span className="text-white ml-2 font-medium">{endpoint.requests.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Errors:</span>
                          <span className="text-red-400 ml-2 font-medium">{endpoint.errors}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Avg Response:</span>
                          <span className="text-white ml-2 font-medium">{endpoint.avgResponseTime}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Uptime:</span>
                          <span className="text-green-400 ml-2 font-medium">{endpoint.uptime}%</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Shield className="w-4 h-4" />
                          <span>{endpoint.authentication}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Rate limit: {endpoint.rateLimit}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="w-4 h-4" />
                          <span>Updated: {formatDate(endpoint.lastUpdated)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiEndpoint(endpoint)}
                        disabled={isTestingApi}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        {isTestingApi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Test
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Endpoint
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Monitor className="w-4 h-4 mr-2" />
                            View Metrics
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          {endpoint.status === "active" ? (
                            <DropdownMenuItem className="text-yellow-400 hover:bg-gray-800">
                              <Pause className="w-4 h-4 mr-2" />
                              Disable
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-400 hover:bg-gray-800">
                              <Play className="w-4 h-4 mr-2" />
                              Enable
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <Card key={key.id} className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{key.name}</h3>
                        <Badge className={getStatusColor(key.status)}>{key.status}</Badge>
                        <div className="flex items-center space-x-2">
                          {key.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs text-gray-300 border-gray-600">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <Key className="w-4 h-4 text-gray-400" />
                        <code className="text-sm bg-gray-800 px-2 py-1 rounded text-green-400 font-mono">
                          {showApiKeys ? key.key : key.key.replace(/./g, "*").slice(0, -8) + key.key.slice(-8)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKeys(!showApiKeys)}
                          className="text-gray-400 hover:text-white"
                        >
                          {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.key)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Rate Limit:</span>
                          <span className="text-white ml-2 font-medium">{key.rateLimit}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Used:</span>
                          <span className="text-white ml-2 font-medium">{formatDate(key.lastUsed)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Expires:</span>
                          <span className="text-white ml-2 font-medium">{formatDate(key.expiresAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate Key
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Revoke Key
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{webhook.name}</h3>
                        <Badge className={getStatusColor(webhook.status)}>{webhook.status}</Badge>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <Link className="w-4 h-4 text-gray-400" />
                        <code className="text-sm bg-gray-800 px-2 py-1 rounded text-blue-400">{webhook.url}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.url)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <Webhook className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs text-gray-300 border-gray-600">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Success Rate:</span>
                          <span className="text-green-400 ml-2 font-medium">{webhook.successRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Retry Count:</span>
                          <span className="text-white ml-2 font-medium">{webhook.retryCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Triggered:</span>
                          <span className="text-white ml-2 font-medium">{formatDate(webhook.lastTriggered)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Play className="w-4 h-4" />
                        Test
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Webhook
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Activity className="w-4 h-4 mr-2" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  API Request Volume
                </CardTitle>
                <CardDescription className="text-gray-400">Request volume over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={apiMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Response Time Trends
                </CardTitle>
                <CardDescription className="text-gray-400">Average response times and error rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={apiMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                    <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
