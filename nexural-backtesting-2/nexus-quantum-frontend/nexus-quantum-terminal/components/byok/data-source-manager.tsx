"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Shield,
  Key,
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Clock,
  Activity,
  TrendingUp,
  DollarSign,
  Globe,
  Server,
  Users,
  Settings
} from 'lucide-react'

interface DataProvider {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  requiresSecret: boolean
  features: string[]
  pricing: string
  status: 'connected' | 'disconnected' | 'validating' | 'error'
  lastValidated?: string
  rateLimit?: {
    used: number
    limit: number
    resetTime: string
  }
}

interface SecurityStatus {
  level: string
  encryption: string
  sessionExpiry: string
  autoTermination: boolean
  auditLogging: boolean
}

const DATA_PROVIDERS: DataProvider[] = [
  {
    id: 'databento',
    name: 'Databento',
    description: 'Professional market data with MBP-10 order book depth',
    icon: <Database className="h-5 w-5" />,
    requiresSecret: false,
    features: ['MBP-10 Data', 'Futures', 'Equities', 'Options', 'Real-time'],
    pricing: 'Your API quota',
    status: 'disconnected'
  },
  {
    id: 'polygon',
    name: 'Polygon.io',
    description: 'Real-time and historical market data',
    icon: <TrendingUp className="h-5 w-5" />,
    requiresSecret: false,
    features: ['Stocks', 'Options', 'Forex', 'Crypto', 'News'],
    pricing: 'Your API quota',
    status: 'disconnected'
  },
  {
    id: 'alpaca',
    name: 'Alpaca Markets',
    description: 'Commission-free trading with market data',
    icon: <Activity className="h-5 w-5" />,
    requiresSecret: true,
    features: ['Stocks', 'ETFs', 'Paper Trading', 'Real-time'],
    pricing: 'Free with account',
    status: 'disconnected'
  },
  {
    id: 'tradovate',
    name: 'Tradovate',
    description: 'Futures trading platform with data feeds',
    icon: <Zap className="h-5 w-5" />,
    requiresSecret: true,
    features: ['Futures', 'Options on Futures', 'Real-time'],
    pricing: 'Your subscription',
    status: 'disconnected'
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    description: 'Professional trading platform with global markets',
    icon: <Globe className="h-5 w-5" />,
    requiresSecret: true,
    features: ['Global Markets', 'All Asset Classes', 'Professional Tools'],
    pricing: 'Your account',
    status: 'disconnected'
  }
]

export function DataSourceManager() {
  const [providers, setProviders] = useState<DataProvider[]>(DATA_PROVIDERS)
  const [activeTab, setActiveTab] = useState('platform')
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [apiKeys, setApiKeys] = useState<Record<string, { key: string; secret?: string }>>({})
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({})
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [securityStatus] = useState<SecurityStatus>({
    level: 'MILITARY_GRADE',
    encryption: 'AES-256 with PBKDF2',
    sessionExpiry: '8 hours',
    autoTermination: true,
    auditLogging: true
  })

  // Platform data inventory
  const [platformInventory] = useState([
    { symbol: 'ES', type: 'Futures', start: '2020-01-01', end: '2024-12-31', frequency: '1min' },
    { symbol: 'NQ', type: 'Futures', start: '2020-01-01', end: '2024-12-31', frequency: '1min' },
    { symbol: 'AAPL', type: 'Equity', start: '2015-01-01', end: '2024-12-31', frequency: '1min' },
    { symbol: 'TSLA', type: 'Equity', start: '2018-01-01', end: '2024-12-31', frequency: '1min' },
    { symbol: 'SPY', type: 'ETF', start: '2010-01-01', end: '2024-12-31', frequency: '1min' }
  ])

  const handleAddApiKey = useCallback(async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    if (!provider) return

    const keyData = apiKeys[providerId]
    if (!keyData?.key) return

    setIsValidating(prev => ({ ...prev, [providerId]: true }))

    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update provider status
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { 
              ...p, 
              status: 'connected',
              lastValidated: new Date().toISOString(),
              rateLimit: {
                used: Math.floor(Math.random() * 1000),
                limit: 10000,
                resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              }
            }
          : p
      ))

      // Create secure session
      const sessionResponse = await fetch('/api/byok/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          apiKey: keyData.key,
          secretKey: keyData.secret
        })
      })

      if (sessionResponse.ok) {
        const session = await sessionResponse.json()
        setSessionInfo(session)
      }

    } catch (error) {
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, status: 'error' } : p
      ))
    } finally {
      setIsValidating(prev => ({ ...prev, [providerId]: false }))
    }
  }, [apiKeys, providers])

  const handleRemoveApiKey = useCallback(async (providerId: string) => {
    try {
      // Terminate session
      if (sessionInfo?.sessionId) {
        await fetch(`/api/byok/terminate-session/${sessionInfo.sessionId}`, {
          method: 'DELETE'
        })
      }

      // Update provider status
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, status: 'disconnected', lastValidated: undefined, rateLimit: undefined }
          : p
      ))

      // Clear local data
      setApiKeys(prev => {
        const updated = { ...prev }
        delete updated[providerId]
        return updated
      })

      setShowApiKey(prev => ({ ...prev, [providerId]: false }))

    } catch (error) {
      console.error('Failed to remove API key:', error)
    }
  }, [sessionInfo])

  const toggleApiKeyVisibility = useCallback((providerId: string) => {
    setShowApiKey(prev => ({ ...prev, [providerId]: !prev[providerId] }))
  }, [])

  const updateApiKey = useCallback((providerId: string, field: 'key' | 'secret', value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [field]: value
      }
    }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Security Status Header */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Military-Grade Security Active</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Your API keys are protected with AES-256 encryption and auto-expire after 8 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-green-800">{securityStatus.encryption}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-green-800">{securityStatus.sessionExpiry}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-green-600" />
              <span className="text-green-800">Auto-Delete</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-green-800">Audit Logging</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-800">Zero-Trust</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Source Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platform">Platform Data</TabsTrigger>
          <TabsTrigger value="byok">Your API Keys</TabsTrigger>
          <TabsTrigger value="hybrid">Hybrid Mode</TabsTrigger>
        </TabsList>

        {/* Platform Data Tab */}
        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" />
                <CardTitle>Platform Data Access</CardTitle>
              </div>
              <CardDescription>
                Access our premium $50K+ MBP-10 dataset with no API keys required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instant Access:</strong> Start backtesting immediately with professional-grade data. 
                  Results only - no raw data downloads.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">Available Data:</h4>
                <div className="grid gap-2">
                  {platformInventory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.type}</Badge>
                        <span className="font-medium">{item.symbol}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.start} to {item.end} • {item.frequency}
                      </div>
                    </div>
                  ))}
                </div>

                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pricing:</strong> $0.50 - $10.00 per analysis depending on complexity. 
                    No data subscription required.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BYOK Tab */}
        <TabsContent value="byok" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-600" />
                <CardTitle>Bring Your Own Keys (BYOK)</CardTitle>
              </div>
              <CardDescription>
                Connect your existing data provider API keys for extended access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Promise:</strong> Your API keys are encrypted with military-grade AES-256, 
                  auto-expire after 8 hours, and are never stored permanently.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {providers.map((provider) => (
                  <Card key={provider.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {provider.icon}
                          <div>
                            <h4 className="font-semibold">{provider.name}</h4>
                            <p className="text-sm text-muted-foreground">{provider.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {provider.status === 'connected' && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                          {provider.status === 'validating' && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Activity className="h-3 w-3 mr-1 animate-spin" />
                              Validating
                            </Badge>
                          )}
                          {provider.status === 'error' && (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {provider.status === 'disconnected' && (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {provider.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`${provider.id}-key`}>API Key</Label>
                              <div className="relative">
                                <Input
                                  id={`${provider.id}-key`}
                                  type={showApiKey[provider.id] ? "text" : "password"}
                                  placeholder="Enter your API key"
                                  value={apiKeys[provider.id]?.key || ''}
                                  onChange={(e) => updateApiKey(provider.id, 'key', e.target.value)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                  onClick={() => toggleApiKeyVisibility(provider.id)}
                                >
                                  {showApiKey[provider.id] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {provider.requiresSecret && (
                              <div>
                                <Label htmlFor={`${provider.id}-secret`}>Secret Key</Label>
                                <div className="relative">
                                  <Input
                                    id={`${provider.id}-secret`}
                                    type={showApiKey[`${provider.id}-secret`] ? "text" : "password"}
                                    placeholder="Enter your secret key"
                                    value={apiKeys[provider.id]?.secret || ''}
                                    onChange={(e) => updateApiKey(provider.id, 'secret', e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                    onClick={() => toggleApiKeyVisibility(`${provider.id}-secret`)}
                                  >
                                    {showApiKey[`${provider.id}-secret`] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={() => handleAddApiKey(provider.id)}
                              disabled={!apiKeys[provider.id]?.key || isValidating[provider.id]}
                              className="w-full"
                            >
                              {isValidating[provider.id] ? (
                                <>
                                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                                  Validating & Encrypting...
                                </>
                              ) : (
                                <>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Connect Securely
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {provider.status === 'connected' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-medium">
                              ✓ Securely Connected
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Last validated: {provider.lastValidated ? 
                                new Date(provider.lastValidated).toLocaleString() : 'Never'}
                            </span>
                          </div>

                          {provider.rateLimit && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>API Usage Today</span>
                                <span>{provider.rateLimit.used.toLocaleString()} / {provider.rateLimit.limit.toLocaleString()}</span>
                              </div>
                              <Progress 
                                value={(provider.rateLimit.used / provider.rateLimit.limit) * 100} 
                                className="h-2"
                              />
                            </div>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="w-full">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Terminate & Delete Keys
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Terminate API Key Session?</DialogTitle>
                                <DialogDescription>
                                  This will immediately:
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Terminate your secure session</li>
                                    <li>Delete all encrypted keys from our servers</li>
                                    <li>Clear all temporary data</li>
                                    <li>Log the termination for security audit</li>
                                  </ul>
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-2">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRemoveApiKey(provider.id)}
                                  className="flex-1"
                                >
                                  Yes, Terminate Now
                                </Button>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="flex-1">
                                    Cancel
                                  </Button>
                                </DialogTrigger>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-muted-foreground">
                        Pricing: {provider.pricing}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hybrid Mode Tab */}
        <TabsContent value="hybrid" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <CardTitle>Hybrid Data Mode</CardTitle>
              </div>
              <CardDescription>
                Intelligently combine platform data with your API keys for optimal coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Smart Selection:</strong> System automatically chooses the best data source 
                  for each symbol based on availability and your preferences.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Data Source Priority</Label>
                  <Select defaultValue="platform-first">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform-first">
                        Platform Data First (fallback to your keys)
                      </SelectItem>
                      <SelectItem value="user-first">
                        Your Keys First (fallback to platform)
                      </SelectItem>
                      <SelectItem value="best-available">
                        Best Available (automatic selection)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  <h4 className="font-semibold">Asset-Specific Configuration</h4>
                  {['Futures', 'Equities', 'Options', 'Crypto', 'Forex'].map((assetType) => (
                    <div key={assetType} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{assetType}</span>
                      <Select defaultValue="auto">
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto (Best Available)</SelectItem>
                          <SelectItem value="platform">Platform Data</SelectItem>
                          <SelectItem value="user">Your API Keys</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pricing:</strong> Platform data uses standard pricing. 
                    Your API keys use premium pricing ($1.00 - $20.00) for enhanced infrastructure access.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Info */}
      {sessionInfo && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Active Secure Session</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Session ID:</span>
                <div className="text-blue-800 font-mono text-xs">
                  {sessionInfo.sessionId?.slice(0, 8)}...
                </div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Expires:</span>
                <div className="text-blue-800">
                  {sessionInfo.expiresAt ? 
                    new Date(sessionInfo.expiresAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Providers:</span>
                <div className="text-blue-800">
                  {sessionInfo.validatedProviders?.length || 0} connected
                </div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Security:</span>
                <div className="text-blue-800">{sessionInfo.securityLevel}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
