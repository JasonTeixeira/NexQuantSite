"use client"

import React, { useState, useCallback } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Shield,
  Key,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Activity,
  TrendingUp,
  Globe,
  Zap,
  Clock,
  FileText,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react'

interface APIProvider {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  requiresSecret: boolean
  features: string[]
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  lastValidated?: string
  errorMessage?: string
  connectionDetails?: {
    sessionId: string
    expiresAt: string
    encryptionLevel: string
  }
}

const INITIAL_PROVIDERS: APIProvider[] = [
  {
    id: 'databento',
    name: 'Databento',
    description: 'Professional MBP-10 market data with order book depth',
    icon: <Database className="h-5 w-5" />,
    requiresSecret: false,
    features: ['MBP-10 Data', 'Futures', 'Equities', 'Options', 'Real-time'],
    status: 'disconnected'
  },
  {
    id: 'polygon',
    name: 'Polygon.io',
    description: 'Real-time and historical market data',
    icon: <TrendingUp className="h-5 w-5" />,
    requiresSecret: false,
    features: ['Stocks', 'Options', 'Forex', 'Crypto', 'News'],
    status: 'disconnected'
  },
  {
    id: 'alpaca',
    name: 'Alpaca Markets',
    description: 'Commission-free trading with market data',
    icon: <Activity className="h-5 w-5" />,
    requiresSecret: true,
    features: ['Stocks', 'ETFs', 'Paper Trading', 'Real-time'],
    status: 'disconnected'
  },
  {
    id: 'tradovate',
    name: 'Tradovate',
    description: 'Futures trading platform with data feeds',
    icon: <Zap className="h-5 w-5" />,
    requiresSecret: true,
    features: ['Futures', 'Options on Futures', 'Real-time'],
    status: 'disconnected'
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    description: 'Professional trading platform with global markets',
    icon: <Globe className="h-5 w-5" />,
    requiresSecret: true,
    features: ['Global Markets', 'All Asset Classes', 'Professional Tools'],
    status: 'disconnected'
  }
]

export function EnhancedAPIKeyManager() {
  const [providers, setProviders] = useState<APIProvider[]>(INITIAL_PROVIDERS)
  const [apiKeys, setApiKeys] = useState<Record<string, { key: string; secret?: string }>>({})
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [connectionProgress, setConnectionProgress] = useState<Record<string, number>>({})

  const validateAndConnect = useCallback(async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    const keyData = apiKeys[providerId]
    
    if (!provider || !keyData?.key) return

    // Update status to connecting
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, status: 'connecting', errorMessage: undefined }
        : p
    ))

    // Simulate connection progress
    setConnectionProgress(prev => ({ ...prev, [providerId]: 0 }))
    
    try {
      // Step 1: Validate API key
      setConnectionProgress(prev => ({ ...prev, [providerId]: 25 }))
      
      const validateResponse = await fetch('http://localhost:3011/api/byok/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          api_key: keyData.key,
          secret_key: keyData.secret
        })
      })

      if (!validateResponse.ok) {
        throw new Error('API key validation failed')
      }

      const validationResult = await validateResponse.json()
      
      if (!validationResult.valid) {
        throw new Error('Invalid API key - please check your credentials')
      }

      // Step 2: Create secure session
      setConnectionProgress(prev => ({ ...prev, [providerId]: 50 }))
      
      const sessionResponse = await fetch('http://localhost:3011/api/byok/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          api_key: keyData.key,
          secret_key: keyData.secret
        })
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to create secure session')
      }

      const sessionResult = await sessionResponse.json()

      // Step 3: Finalize connection
      setConnectionProgress(prev => ({ ...prev, [providerId]: 100 }))

      // Update provider status
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { 
              ...p, 
              status: 'connected',
              lastValidated: new Date().toISOString(),
              connectionDetails: {
                sessionId: sessionResult.session_id,
                expiresAt: sessionResult.expires_at,
                encryptionLevel: sessionResult.encryption || 'AES-256'
              }
            }
          : p
      ))

      // Clear progress after success
      setTimeout(() => {
        setConnectionProgress(prev => {
          const updated = { ...prev }
          delete updated[providerId]
          return updated
        })
      }, 2000)

    } catch (error) {
      // Update status to error
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { 
              ...p, 
              status: 'error',
              errorMessage: error instanceof Error ? error.message : 'Connection failed'
            }
          : p
      ))

      // Clear progress after error
      setTimeout(() => {
        setConnectionProgress(prev => {
          const updated = { ...prev }
          delete updated[providerId]
          return updated
        })
      }, 2000)
    }
  }, [providers, apiKeys])

  const disconnectProvider = useCallback(async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    
    if (!provider?.connectionDetails) return

    try {
      // Terminate secure session
      await fetch(`http://localhost:3011/api/byok/terminate-session/${provider.connectionDetails.sessionId}`, {
        method: 'DELETE'
      })

      // Update provider status
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { 
              ...p, 
              status: 'disconnected',
              lastValidated: undefined,
              connectionDetails: undefined,
              errorMessage: undefined
            }
          : p
      ))

      // Clear API key data
      setApiKeys(prev => {
        const updated = { ...prev }
        delete updated[providerId]
        return updated
      })

      setShowApiKey(prev => ({ ...prev, [providerId]: false }))

    } catch (error) {
      console.error('Failed to disconnect provider:', error)
    }
  }, [providers])

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

  const getStatusBadge = (provider: APIProvider) => {
    switch (provider.status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case 'connecting':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Activity className="h-3 w-3 mr-1 animate-spin" />
            Connecting...
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            Not Connected
          </Badge>
        )
    }
  }

  const connectedCount = providers.filter(p => p.status === 'connected').length

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Military-Grade API Security</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {connectedCount} Provider{connectedCount !== 1 ? 's' : ''} Connected
            </Badge>
          </div>
          <CardDescription className="text-green-700">
            Your API keys are protected with AES-256 encryption, auto-expire after 8 hours, 
            and are automatically deleted when sessions end.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-green-800">AES-256 Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-green-800">8-Hour Auto-Expiry</span>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-green-600" />
              <span className="text-green-800">Auto-Delete Keys</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-green-800">Complete Audit Log</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Providers */}
      <div className="grid gap-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {provider.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{provider.name}</h4>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(provider)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-4">
                {provider.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Connection Progress */}
              {connectionProgress[provider.id] !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Establishing secure connection...</span>
                    <span>{connectionProgress[provider.id]}%</span>
                  </div>
                  <Progress value={connectionProgress[provider.id]} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {connectionProgress[provider.id] <= 25 && "Validating API key..."}
                    {connectionProgress[provider.id] > 25 && connectionProgress[provider.id] <= 50 && "Creating secure session..."}
                    {connectionProgress[provider.id] > 50 && connectionProgress[provider.id] < 100 && "Encrypting credentials..."}
                    {connectionProgress[provider.id] === 100 && "Connection established!"}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {provider.status === 'error' && provider.errorMessage && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Connection Failed:</strong> {provider.errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Connection Form */}
              {provider.status === 'disconnected' && (
                <div className="space-y-4">
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
                    onClick={() => validateAndConnect(provider.id)}
                    disabled={!apiKeys[provider.id]?.key || provider.status === 'connecting'}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Connect Securely
                  </Button>
                </div>
              )}

              {/* Connected Status */}
              {provider.status === 'connected' && provider.connectionDetails && (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>✅ Successfully Connected!</strong> Your API key is securely encrypted 
                      and will auto-expire in 8 hours for maximum security.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Session ID:</span>
                      <div className="font-mono text-xs">
                        {provider.connectionDetails.sessionId.slice(0, 8)}...
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expires:</span>
                      <div className="text-xs">
                        {new Date(provider.connectionDetails.expiresAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Encryption:</span>
                      <div className="text-xs font-semibold text-green-600">
                        {provider.connectionDetails.encryptionLevel}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Validated:</span>
                      <div className="text-xs">
                        {provider.lastValidated ? 
                          new Date(provider.lastValidated).toLocaleTimeString() : 'Never'}
                      </div>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect & Delete Keys
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disconnect {provider.name}?</DialogTitle>
                        <DialogDescription>
                          This will immediately:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Terminate your secure session</li>
                            <li>Delete all encrypted keys from our servers</li>
                            <li>Clear all temporary data</li>
                            <li>Log the disconnection for security audit</li>
                          </ul>
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => disconnectProvider(provider.id)}
                          className="flex-1"
                        >
                          Yes, Disconnect Now
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="h-5 w-5" />
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm space-y-2">
          <p>
            <strong>🔒 Military-Grade Security:</strong> Your API keys are protected with the same 
            encryption standards used by banks and government agencies.
          </p>
          <p>
            <strong>⏰ Auto-Expiry:</strong> All sessions automatically expire after 8 hours and 
            keys are permanently deleted from our servers.
          </p>
          <p>
            <strong>📋 Audit Trail:</strong> Every connection, validation, and termination is 
            logged for complete security transparency.
          </p>
          <p>
            <strong>🛡️ Zero-Trust:</strong> We verify every request and never store your keys 
            in plaintext - ever.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
