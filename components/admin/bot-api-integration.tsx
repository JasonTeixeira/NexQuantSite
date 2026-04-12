"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Database, Server, Wifi, Globe, Shield,
  Key, Code, RefreshCw, CheckCircle, AlertTriangle,
  Settings, Eye, EyeOff, Copy, Save, TestTube,
  Zap, Activity, Clock, Target, Signal
} from "lucide-react"
import { toast } from "sonner"

interface APIConnection {
  id: string
  name: string
  type: 'data_provider' | 'broker' | 'exchange' | 'news' | 'webhook'
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  endpoint: string
  apiKey: string
  lastTest: string
  responseTime: number
  requestCount: number
  errorRate: number
  rateLimit: number
  usedRequests: number
}

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  lastTrigger: string
  successRate: number
  retryCount: number
}

const MOCK_API_CONNECTIONS: APIConnection[] = [
  {
    id: 'alpaca',
    name: 'Alpaca Markets',
    type: 'broker',
    status: 'connected',
    endpoint: 'https://paper-api.alpaca.markets',
    apiKey: 'AKFZ*********************',
    lastTest: '2024-12-15T10:30:00Z',
    responseTime: 45,
    requestCount: 15420,
    errorRate: 0.2,
    rateLimit: 200,
    usedRequests: 1247
  },
  {
    id: 'polygon',
    name: 'Polygon.io',
    type: 'data_provider',
    status: 'connected',
    endpoint: 'https://api.polygon.io/v2',
    apiKey: 'POLY*********************',
    lastTest: '2024-12-15T10:32:00Z',
    responseTime: 32,
    requestCount: 28450,
    errorRate: 0.1,
    rateLimit: 5000,
    usedRequests: 3247
  },
  {
    id: 'binance',
    name: 'Binance',
    type: 'exchange',
    status: 'connected',
    endpoint: 'https://api.binance.com/api/v3',
    apiKey: 'BIN*********************',
    lastTest: '2024-12-15T10:35:00Z',
    responseTime: 78,
    requestCount: 12650,
    errorRate: 0.5,
    rateLimit: 1200,
    usedRequests: 892
  },
  {
    id: 'alpha_vantage',
    name: 'Alpha Vantage',
    type: 'data_provider',
    status: 'error',
    endpoint: 'https://www.alphavantage.co/query',
    apiKey: 'ALPHA*********************',
    lastTest: '2024-12-15T09:45:00Z',
    responseTime: 0,
    requestCount: 5640,
    errorRate: 15.2,
    rateLimit: 500,
    usedRequests: 498
  }
]

const MOCK_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'trade_alerts',
    name: 'Trade Execution Alerts',
    url: 'https://your-app.com/webhooks/trades',
    events: ['trade_opened', 'trade_closed', 'trade_error'],
    isActive: true,
    lastTrigger: '2024-12-15T10:25:00Z',
    successRate: 98.5,
    retryCount: 3
  },
  {
    id: 'bot_status',
    name: 'Bot Status Updates',
    url: 'https://your-app.com/webhooks/bot-status',
    events: ['bot_started', 'bot_stopped', 'bot_error', 'performance_alert'],
    isActive: true,
    lastTrigger: '2024-12-15T10:20:00Z',
    successRate: 99.2,
    retryCount: 2
  },
  {
    id: 'user_events',
    name: 'User Activity Events',
    url: 'https://your-app.com/webhooks/users',
    events: ['user_subscribed', 'user_cancelled', 'payment_received'],
    isActive: false,
    lastTrigger: '2024-12-15T08:15:00Z',
    successRate: 94.8,
    retryCount: 5
  }
]

export default function BotAPIIntegration() {
  const [connections, setConnections] = useState<APIConnection[]>(MOCK_API_CONNECTIONS)
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(MOCK_WEBHOOKS)
  const [selectedConnection, setSelectedConnection] = useState<APIConnection | null>(null)
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({})
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testResults, setTestResults] = useState<string>('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-600 text-green-100'
      case 'disconnected': return 'bg-gray-600 text-gray-100'
      case 'error': return 'bg-red-600 text-red-100'
      case 'testing': return 'bg-blue-600 text-blue-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'disconnected': return <Database className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      case 'testing': return <RefreshCw className="w-4 h-4 animate-spin" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const testConnection = async (connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'testing' }
        : conn
    ))

    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const success = Math.random() > 0.1 // 90% success rate for simulation
    
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { 
            ...conn, 
            status: success ? 'connected' : 'error',
            lastTest: new Date().toISOString(),
            responseTime: success ? Math.floor(Math.random() * 100) + 20 : 0
          }
        : conn
    ))

    toast.success(success ? 'Connection test successful' : 'Connection test failed')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-gray-800">
          <TabsTrigger value="connections" className="data-[state=active]:bg-blue-600">
            🔗 API Connections
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-blue-600">
            🪝 Webhooks
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
            ⚙️ Integration Settings
          </TabsTrigger>
        </TabsList>

        {/* ===== API CONNECTIONS TAB ===== */}
        <TabsContent value="connections" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">API Connections</h2>
              <p className="text-gray-400">Manage external API integrations for real-time data</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Database className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <Card key={connection.id} className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{connection.name}</CardTitle>
                    <Badge className={getStatusColor(connection.status)}>
                      {getStatusIcon(connection.status)}
                      <span className="ml-1">{connection.status}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-400 text-sm">Type</Label>
                    <div className="text-white capitalize">{connection.type.replace('_', ' ')}</div>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-sm">Endpoint</Label>
                    <div className="text-white text-sm font-mono break-all">{connection.endpoint}</div>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-sm">API Key</Label>
                    <div className="flex items-center space-x-2">
                      <div className="text-white text-sm font-mono">
                        {showApiKeys[connection.id] ? connection.apiKey : connection.apiKey.replace(/\w/g, '*')}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleApiKeyVisibility(connection.id)}
                        className="border-gray-700"
                      >
                        {showApiKeys[connection.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(connection.apiKey)}
                        className="border-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Response Time</Label>
                      <div className={`text-sm font-bold ${connection.responseTime <= 50 ? 'text-green-400' : connection.responseTime <= 100 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {connection.responseTime}ms
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Error Rate</Label>
                      <div className={`text-sm font-bold ${connection.errorRate <= 1 ? 'text-green-400' : connection.errorRate <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {connection.errorRate}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Rate Limit Usage</span>
                      <span className="text-white">{connection.usedRequests}/{connection.rateLimit}</span>
                    </div>
                    <Progress 
                      value={(connection.usedRequests / connection.rateLimit) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => testConnection(connection.id)}
                      disabled={connection.status === 'testing'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedConnection(connection)}
                      className="border-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last tested: {new Date(connection.lastTest).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== WEBHOOKS TAB ===== */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Webhook Configuration</h2>
              <p className="text-gray-400">Configure event notifications and integrations</p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Zap className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{webhook.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={webhook.isActive}
                        onCheckedChange={(checked) => {
                          setWebhooks(prev => prev.map(w => 
                            w.id === webhook.id ? { ...w, isActive: checked } : w
                          ))
                          toast.success(`Webhook ${checked ? 'enabled' : 'disabled'}`)
                        }}
                      />
                      <Badge className={webhook.isActive ? 'bg-green-600' : 'bg-gray-600'}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-400 text-sm">Webhook URL</Label>
                    <div className="text-white text-sm font-mono break-all bg-gray-800/50 p-2 rounded">
                      {webhook.url}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-sm">Events ({webhook.events.length})</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs border-gray-600">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Success Rate</Label>
                      <div className={`text-sm font-bold ${webhook.successRate >= 95 ? 'text-green-400' : webhook.successRate >= 85 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {webhook.successRate}%
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Retry Count</Label>
                      <div className="text-white text-sm font-bold">{webhook.retryCount}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-sm">Last Trigger</Label>
                    <div className="text-white text-sm">{new Date(webhook.lastTrigger).toLocaleString()}</div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <TestTube className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-700">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== INTEGRATION SETTINGS TAB ===== */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-400" />
                Global Integration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Primary Data Provider</Label>
                  <Select defaultValue="polygon">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="polygon">Polygon.io (Recommended)</SelectItem>
                      <SelectItem value="alpha">Alpha Vantage</SelectItem>
                      <SelectItem value="iex">IEX Cloud</SelectItem>
                      <SelectItem value="yahoo">Yahoo Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Backup Data Provider</Label>
                  <Select defaultValue="alpha">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="alpha">Alpha Vantage</SelectItem>
                      <SelectItem value="polygon">Polygon.io</SelectItem>
                      <SelectItem value="iex">IEX Cloud</SelectItem>
                      <SelectItem value="yahoo">Yahoo Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Primary Broker</Label>
                  <Select defaultValue="alpaca">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="alpaca">Alpaca Markets (Paper)</SelectItem>
                      <SelectItem value="alpaca_live">Alpaca Markets (Live)</SelectItem>
                      <SelectItem value="interactive">Interactive Brokers</SelectItem>
                      <SelectItem value="td">TD Ameritrade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Crypto Exchange</Label>
                  <Select defaultValue="binance">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="binance">Binance</SelectItem>
                      <SelectItem value="coinbase">Coinbase Pro</SelectItem>
                      <SelectItem value="kraken">Kraken</SelectItem>
                      <SelectItem value="bybit">Bybit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Real-time Data</Label>
                    <p className="text-gray-400 text-sm">Use real-time market data feeds</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-Failover</Label>
                    <p className="text-gray-400 text-sm">Automatically switch to backup providers on failure</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Rate Limit Monitoring</Label>
                    <p className="text-gray-400 text-sm">Monitor and alert on API rate limit usage</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Data Caching</Label>
                    <p className="text-gray-400 text-sm">Cache market data to reduce API calls</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Connection Timeout (ms)</Label>
                  <Input 
                    type="number" 
                    defaultValue="5000" 
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white">Retry Attempts</Label>
                  <Input 
                    type="number" 
                    defaultValue="3" 
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white">Cache TTL (seconds)</Label>
                  <Input 
                    type="number" 
                    defaultValue="60" 
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Usage Analytics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-400" />
                API Usage Analytics (Last 24 Hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">62.3K</div>
                  <div className="text-gray-400 text-sm">Total Requests</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">0.3%</div>
                  <div className="text-gray-400 text-sm">Error Rate</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400">47ms</div>
                  <div className="text-gray-400 text-sm">Avg Response</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-400">$247</div>
                  <div className="text-gray-400 text-sm">API Costs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== CONNECTION CONFIGURATION DIALOG ===== */}
      <Dialog open={!!selectedConnection} onOpenChange={() => setSelectedConnection(null)}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-400" />
              Configure {selectedConnection?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage API connection settings and authentication
            </DialogDescription>
          </DialogHeader>
          
          {selectedConnection && (
            <div className="space-y-4">
              <div>
                <Label className="text-white">API Endpoint</Label>
                <Input 
                  value={selectedConnection.endpoint}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-white">API Key</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input 
                    type={showApiKeys[selectedConnection.id] ? 'text' : 'password'}
                    value={selectedConnection.apiKey}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    variant="outline"
                    onClick={() => toggleApiKeyVisibility(selectedConnection.id)}
                    className="border-gray-700"
                  >
                    {showApiKeys[selectedConnection.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Rate Limit (per minute)</Label>
                  <Input 
                    type="number"
                    value={selectedConnection.rateLimit}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white">Timeout (ms)</Label>
                  <Input 
                    type="number"
                    defaultValue="5000"
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-blue-900/20 p-3 rounded-lg">
                <div>
                  <div className="text-white font-semibold">Connection Status</div>
                  <div className="text-blue-300 text-sm">
                    {selectedConnection.status === 'connected' ? 'Successfully connected' : 
                     selectedConnection.status === 'error' ? 'Connection failed' : 
                     'Testing connection...'}
                  </div>
                </div>
                <Badge className={getStatusColor(selectedConnection.status)}>
                  {selectedConnection.status}
                </Badge>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setSelectedConnection(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => testConnection(selectedConnection.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    toast.success('Configuration saved')
                    setSelectedConnection(null)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
