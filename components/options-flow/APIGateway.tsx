"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Globe, Shield, Zap, Activity, BarChart3, Key, 
  Clock, Users, Server, AlertTriangle, CheckCircle,
  XCircle, Plus, Copy, Trash2, Eye, Settings,
  Database, Cloud, Lock, Unlock, Crown
} from "lucide-react"

interface APIEndpoint {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description: string
  rateLimit: {
    requests: number
    window: number // seconds
    burst: number
  }
  authentication: {
    required: boolean
    type: 'api-key' | 'jwt' | 'oauth' | 'basic'
  }
  caching: {
    enabled: boolean
    ttl: number // seconds
  }
  monitoring: {
    enabled: boolean
    alertThreshold: number
  }
  enabled: boolean
  version: string
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  rateLimit: {
    requests: number
    window: number
  }
  usage: {
    total: number
    today: number
    thisMonth: number
  }
  lastUsed?: Date
  createdAt: Date
  expiresAt?: Date
  enabled: boolean
}

interface APIMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  rateLimitedRequests: number
  uniqueIPs: number
  topEndpoints: { path: string; requests: number }[]
  responseTimePercentiles: { p50: number; p95: number; p99: number }
}

interface APIGatewayProps {
  className?: string
}

export default function APIGateway({ className = "" }: APIGatewayProps) {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([])
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([])
  const [metrics, setMetrics] = useState<APIMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    rateLimitedRequests: 0,
    uniqueIPs: 0,
    topEndpoints: [],
    responseTimePercentiles: { p50: 0, p95: 0, p99: 0 }
  })
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [newKeyName, setNewKeyName] = useState("")

  // Initialize with example data
  useEffect(() => {
    const exampleEndpoints: APIEndpoint[] = [
      {
        id: '1',
        name: 'Live Options Flow',
        path: '/api/v1/flow/live',
        method: 'GET',
        description: 'Real-time options flow data stream',
        version: 'v1',
        enabled: true,
        rateLimit: { requests: 100, window: 60, burst: 150 },
        authentication: { required: true, type: 'api-key' },
        caching: { enabled: true, ttl: 30 },
        monitoring: { enabled: true, alertThreshold: 95 }
      },
      {
        id: '2',
        name: 'Smart Money Analysis',
        path: '/api/v1/analysis/smart-money',
        method: 'GET',
        description: 'AI-powered smart money detection',
        version: 'v1',
        enabled: true,
        rateLimit: { requests: 50, window: 60, burst: 75 },
        authentication: { required: true, type: 'jwt' },
        caching: { enabled: true, ttl: 60 },
        monitoring: { enabled: true, alertThreshold: 90 }
      },
      {
        id: '3',
        name: 'Gamma Squeeze Predictor',
        path: '/api/v1/analysis/gamma-squeeze',
        method: 'POST',
        description: 'ML-based gamma squeeze risk assessment',
        version: 'v1',
        enabled: true,
        rateLimit: { requests: 25, window: 60, burst: 40 },
        authentication: { required: true, type: 'api-key' },
        caching: { enabled: false, ttl: 0 },
        monitoring: { enabled: true, alertThreshold: 85 }
      },
      {
        id: '4',
        name: 'Historical Flow Data',
        path: '/api/v1/flow/history',
        method: 'GET',
        description: 'Historical options flow analysis',
        version: 'v1',
        enabled: true,
        rateLimit: { requests: 20, window: 60, burst: 30 },
        authentication: { required: true, type: 'jwt' },
        caching: { enabled: true, ttl: 300 },
        monitoring: { enabled: true, alertThreshold: 80 }
      },
      {
        id: '5',
        name: 'Webhook Notifications',
        path: '/api/v1/webhooks/notify',
        method: 'POST',
        description: 'Real-time webhook notifications',
        version: 'v1',
        enabled: true,
        rateLimit: { requests: 1000, window: 60, burst: 1500 },
        authentication: { required: true, type: 'api-key' },
        caching: { enabled: false, ttl: 0 },
        monitoring: { enabled: true, alertThreshold: 98 }
      }
    ]

    const exampleAPIKeys: APIKey[] = [
      {
        id: '1',
        name: 'Production Trading Bot',
        key: 'nexural_prod_' + Math.random().toString(36).substring(7),
        permissions: ['flow:read', 'analysis:read', 'webhooks:write'],
        rateLimit: { requests: 1000, window: 3600 },
        usage: { total: 45672, today: 1234, thisMonth: 12890 },
        lastUsed: new Date(Date.now() - 300000), // 5 mins ago
        createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
        enabled: true
      },
      {
        id: '2',
        name: 'Development Environment',
        key: 'nexural_dev_' + Math.random().toString(36).substring(7),
        permissions: ['flow:read', 'analysis:read'],
        rateLimit: { requests: 100, window: 3600 },
        usage: { total: 2341, today: 89, thisMonth: 892 },
        lastUsed: new Date(Date.now() - 1800000), // 30 mins ago
        createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
        enabled: true
      },
      {
        id: '3',
        name: 'Analytics Dashboard',
        key: 'nexural_dash_' + Math.random().toString(36).substring(7),
        permissions: ['flow:read', 'analysis:read', 'webhooks:read'],
        rateLimit: { requests: 500, window: 3600 },
        usage: { total: 8934, today: 234, thisMonth: 3456 },
        lastUsed: new Date(Date.now() - 120000), // 2 mins ago
        createdAt: new Date(Date.now() - 86400000 * 14), // 14 days ago
        enabled: true
      }
    ]

    const exampleMetrics: APIMetrics = {
      totalRequests: 156789,
      successfulRequests: 152341,
      failedRequests: 4448,
      averageResponseTime: 145,
      rateLimitedRequests: 892,
      uniqueIPs: 234,
      topEndpoints: [
        { path: '/api/v1/flow/live', requests: 89234 },
        { path: '/api/v1/analysis/smart-money', requests: 34567 },
        { path: '/api/v1/webhooks/notify', requests: 23456 },
        { path: '/api/v1/flow/history', requests: 9532 }
      ],
      responseTimePercentiles: { p50: 98, p95: 287, p99: 456 }
    }

    setEndpoints(exampleEndpoints)
    setAPIKeys(exampleAPIKeys)
    setMetrics(exampleMetrics)
    setSelectedEndpoint(exampleEndpoints[0])
  }, [])

  const generateAPIKey = () => {
    if (!newKeyName.trim()) return

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `nexural_${Date.now().toString(36)}_${Math.random().toString(36).substring(7)}`,
      permissions: ['flow:read'],
      rateLimit: { requests: 100, window: 3600 },
      usage: { total: 0, today: 0, thisMonth: 0 },
      createdAt: new Date(),
      enabled: true
    }

    setAPIKeys([...apiKeys, newKey])
    setNewKeyName("")
  }

  const toggleEndpoint = (endpointId: string) => {
    setEndpoints(endpoints.map(ep =>
      ep.id === endpointId ? { ...ep, enabled: !ep.enabled } : ep
    ))
  }

  const toggleAPIKey = (keyId: string) => {
    setAPIKeys(apiKeys.map(key =>
      key.id === keyId ? { ...key, enabled: !key.enabled } : key
    ))
  }

  const deleteAPIKey = (keyId: string) => {
    setAPIKeys(apiKeys.filter(key => key.id !== keyId))
  }

  const copyAPIKey = (key: string) => {
    navigator.clipboard.writeText(key)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const formatTimeAgo = (date?: Date) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-400' : 'text-gray-400'
  }

  const getMethodColor = (method: string) => {
    const colors = {
      'GET': 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      'POST': 'bg-green-500/20 text-green-400 border-green-400/30',
      'PUT': 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
      'DELETE': 'bg-red-500/20 text-red-400 border-red-400/30'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-400/30'
  }

  const getSuccessRate = () => {
    if (metrics.totalRequests === 0) return 0
    return (metrics.successfulRequests / metrics.totalRequests) * 100
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/40 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(6, 182, 212, 0.3)",
                "0 0 30px rgba(37, 99, 235, 0.5)",
                "0 0 20px rgba(6, 182, 212, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Globe className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">API Gateway</h2>
            <p className="text-gray-400">Enterprise-grade API management and monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge className="bg-green-500/20 text-green-400 border border-green-400/30">
            {endpoints.filter(ep => ep.enabled).length} Active Endpoints
          </Badge>
          <Badge className="bg-primary/20 text-primary border border-primary/30">
            {apiKeys.filter(key => key.enabled).length} Active Keys
          </Badge>
        </div>
      </motion.div>

      {/* Overview Metrics */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {[
          { 
            label: "Total Requests", 
            value: metrics.totalRequests.toLocaleString(),
            icon: Activity,
            color: "text-blue-400" 
          },
          { 
            label: "Success Rate", 
            value: `${getSuccessRate().toFixed(1)}%`,
            icon: CheckCircle,
            color: "text-green-400" 
          },
          { 
            label: "Avg Response", 
            value: `${metrics.averageResponseTime}ms`,
            icon: Zap,
            color: "text-yellow-400" 
          },
          { 
            label: "Rate Limited", 
            value: metrics.rateLimitedRequests.toLocaleString(),
            icon: Shield,
            color: "text-orange-400" 
          },
          { 
            label: "Unique IPs", 
            value: metrics.uniqueIPs.toLocaleString(),
            icon: Users,
            color: "text-purple-400" 
          },
          { 
            label: "P99 Latency", 
            value: `${metrics.responseTimePercentiles.p99}ms`,
            icon: BarChart3,
            color: "text-red-400" 
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <div className={`text-lg font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              {metric.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-primary/20 mb-6">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Endpoints List */}
            <div className="lg:col-span-1">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    API Endpoints ({endpoints.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {endpoints.map((endpoint, index) => (
                    <motion.div
                      key={endpoint.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                        selectedEndpoint?.id === endpoint.id
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-primary/20 hover:border-primary/40 bg-black/20'
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={endpoint.enabled}
                            onCheckedChange={() => toggleEndpoint(endpoint.id)}
                          />
                          <div className={`w-2 h-2 rounded-full ${
                            endpoint.enabled ? 'bg-green-400' : 'bg-gray-400'
                          }`} />
                        </div>
                      </div>
                      
                      <h3 className="text-white font-medium text-sm mb-1">{endpoint.name}</h3>
                      <p className="text-gray-400 text-xs mb-2 font-mono">{endpoint.path}</p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                          {endpoint.rateLimit.requests}/min
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {endpoint.version}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Endpoint Details */}
            <div className="lg:col-span-2">
              {selectedEndpoint ? (
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        {selectedEndpoint.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(selectedEndpoint.method)}>
                          {selectedEndpoint.method}
                        </Badge>
                        <Switch
                          checked={selectedEndpoint.enabled}
                          onCheckedChange={() => toggleEndpoint(selectedEndpoint.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Endpoint Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-400">Path</Label>
                          <div className="text-white font-mono p-2 bg-black/40 rounded mt-1">
                            {selectedEndpoint.path}
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-400">Version</Label>
                          <div className="text-white p-2 bg-black/40 rounded mt-1">
                            {selectedEndpoint.version}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-gray-400">Description</Label>
                        <div className="text-white p-2 bg-black/40 rounded mt-1">
                          {selectedEndpoint.description}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-3">Rate Limiting</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-gray-400 text-xs">Requests/Window</Label>
                          <div className="text-lg font-bold text-primary">
                            {selectedEndpoint.rateLimit.requests}
                          </div>
                          <div className="text-xs text-gray-400">per {selectedEndpoint.rateLimit.window}s</div>
                        </div>
                        <div>
                          <Label className="text-gray-400 text-xs">Burst Limit</Label>
                          <div className="text-lg font-bold text-yellow-400">
                            {selectedEndpoint.rateLimit.burst}
                          </div>
                          <div className="text-xs text-gray-400">max burst</div>
                        </div>
                        <div>
                          <Label className="text-gray-400 text-xs">Auth Required</Label>
                          <div className="text-lg font-bold text-red-400">
                            {selectedEndpoint.authentication.required ? 'Yes' : 'No'}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {selectedEndpoint.authentication.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-3">Caching & Monitoring</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-gray-400">Enable Caching</Label>
                            <Switch checked={selectedEndpoint.caching.enabled} />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Cache TTL</Label>
                            <Input
                              type="number"
                              value={selectedEndpoint.caching.ttl}
                              className="bg-black/40 border-primary/20 mt-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-gray-400">Enable Monitoring</Label>
                            <Switch checked={selectedEndpoint.monitoring.enabled} />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Alert Threshold (%)</Label>
                            <Input
                              type="number"
                              value={selectedEndpoint.monitoring.alertThreshold}
                              className="bg-black/40 border-primary/20 mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                      <div className="flex gap-4">
                        <Button className="bg-primary/20 text-primary hover:bg-primary/30">
                          <Eye className="w-4 h-4 mr-2" />
                          View Logs
                        </Button>
                        <Button variant="outline">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy cURL
                        </Button>
                        <Button variant="outline">
                          Test Endpoint
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">Select an Endpoint</h3>
                      <p className="text-gray-400">Choose an endpoint from the list to configure settings</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="keys">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New Key */}
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Generate New API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Key Name</Label>
                  <Input
                    placeholder="e.g., Production Bot"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-black/60 border-primary/30 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['flow:read', 'analysis:read', 'webhooks:write', 'admin:read'].map(perm => (
                      <div key={perm} className="flex items-center gap-2">
                        <Switch />
                        <Label className="text-gray-400 text-xs">{perm}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Rate Limit (requests/hour)</Label>
                  <Select>
                    <SelectTrigger className="bg-black/60 border-primary/30 mt-2">
                      <SelectValue placeholder="Select limit..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 requests/hour</SelectItem>
                      <SelectItem value="500">500 requests/hour</SelectItem>
                      <SelectItem value="1000">1,000 requests/hour</SelectItem>
                      <SelectItem value="5000">5,000 requests/hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={generateAPIKey}
                  disabled={!newKeyName.trim()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Generate API Key
                </Button>
              </CardContent>
            </Card>

            {/* API Keys List */}
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Active API Keys ({apiKeys.filter(k => k.enabled).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {apiKeys.map((apiKey, index) => (
                  <motion.div
                    key={apiKey.id}
                    className="p-4 bg-black/20 rounded-lg border border-primary/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{apiKey.name}</h3>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={apiKey.enabled}
                          onCheckedChange={() => toggleAPIKey(apiKey.id)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyAPIKey(apiKey.key)}
                          className="p-1"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAPIKey(apiKey.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs font-mono text-gray-400 mb-3 p-2 bg-black/40 rounded">
                      {apiKey.key}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-gray-400">Today</div>
                        <div className="text-primary font-bold">{apiKey.usage.today}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">This Month</div>
                        <div className="text-green-400 font-bold">{apiKey.usage.thisMonth}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Total</div>
                        <div className="text-yellow-400 font-bold">{apiKey.usage.total}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 text-xs">
                      <span className="text-gray-500">
                        Rate: {apiKey.rateLimit.requests}/hr
                      </span>
                      <span className="text-gray-500">
                        Last used: {formatTimeAgo(apiKey.lastUsed)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {apiKey.permissions.map(perm => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Endpoints */}
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Most Popular Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topEndpoints.map((endpoint, index) => (
                    <div key={endpoint.path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-sm font-bold ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-orange-400' : 'text-gray-400'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-mono text-sm">{endpoint.path}</div>
                          <div className="text-gray-400 text-xs">
                            {endpoint.requests.toLocaleString()} requests
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(endpoint.requests / metrics.topEndpoints[0].requests) * 100}
                        className="w-24 h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Success Rate</span>
                      <span className="text-green-400 font-bold">{getSuccessRate().toFixed(1)}%</span>
                    </div>
                    <Progress value={getSuccessRate()} className="h-2" />
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-3">Response Time Percentiles</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-black/20 rounded-lg">
                        <div className="text-lg font-bold text-green-400">
                          {metrics.responseTimePercentiles.p50}ms
                        </div>
                        <div className="text-xs text-gray-400">P50</div>
                      </div>
                      <div className="p-3 bg-black/20 rounded-lg">
                        <div className="text-lg font-bold text-yellow-400">
                          {metrics.responseTimePercentiles.p95}ms
                        </div>
                        <div className="text-xs text-gray-400">P95</div>
                      </div>
                      <div className="p-3 bg-black/20 rounded-lg">
                        <div className="text-lg font-bold text-red-400">
                          {metrics.responseTimePercentiles.p99}ms
                        </div>
                        <div className="text-xs text-gray-400">P99</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Average Response Time</span>
                      <span className="text-primary font-bold">{metrics.averageResponseTime}ms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white">Gateway Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Rate Limiting</Label>
                    <p className="text-gray-400 text-sm">Global rate limiting for all endpoints</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">API Versioning</Label>
                    <p className="text-gray-400 text-sm">Enable API version headers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Request Logging</Label>
                    <p className="text-gray-400 text-sm">Log all API requests for monitoring</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div>
                  <Label className="text-white">Default Rate Limit</Label>
                  <Select>
                    <SelectTrigger className="bg-black/60 border-primary/30 mt-2">
                      <SelectValue placeholder="Select default limit..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 requests/hour</SelectItem>
                      <SelectItem value="500">500 requests/hour</SelectItem>
                      <SelectItem value="1000">1,000 requests/hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">CORS Protection</Label>
                    <p className="text-gray-400 text-sm">Enable Cross-Origin Resource Sharing</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">IP Whitelist</Label>
                    <p className="text-gray-400 text-sm">Restrict access by IP addresses</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Request Signing</Label>
                    <p className="text-gray-400 text-sm">Require HMAC request signatures</p>
                  </div>
                  <Switch />
                </div>
                
                <div>
                  <Label className="text-white">SSL Certificate</Label>
                  <div className="flex items-center gap-2 mt-2 p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 text-sm">Valid SSL certificate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info */}
      <motion.div
        className="text-center p-6 bg-black/20 rounded-xl border border-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-semibold text-white">Enterprise API Gateway</span>
        </div>
        <p className="text-xs text-gray-400 max-w-4xl mx-auto">
          Full-featured API gateway with rate limiting, authentication, caching, monitoring, and analytics. 
          Enterprise-grade security with CORS protection, IP whitelisting, and request signing. Real-time metrics 
          and performance monitoring for optimal API management.
        </p>
      </motion.div>
    </div>
  )
}
