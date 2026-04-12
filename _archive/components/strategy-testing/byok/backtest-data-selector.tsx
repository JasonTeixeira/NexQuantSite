"use client"

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Server,
  Key,
  Zap,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Clock,
  Database,
  TrendingUp,
  Activity,
  Shield,
  Globe,
  Users,
  Star
} from 'lucide-react'

interface DataSourceOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  pricing: string
  features: string[]
  availability: 'available' | 'connected' | 'unavailable'
  recommended?: boolean
  coverage: {
    symbols: number
    markets: string[]
    frequency: string[]
  }
}

interface BacktestConfig {
  symbols: string[]
  startDate: string
  endDate: string
  frequency: string
  dataSource: string
  estimatedCost: number
}

export function BacktestDataSelector({ 
  onConfigChange,
  initialConfig 
}: {
  onConfigChange?: (config: BacktestConfig) => void
  initialConfig?: Partial<BacktestConfig>
}) {
  const [selectedSource, setSelectedSource] = useState(initialConfig?.dataSource || 'auto')
  const [config, setConfig] = useState<BacktestConfig>({
    symbols: initialConfig?.symbols || ['AAPL', 'TSLA'],
    startDate: initialConfig?.startDate || '2024-01-01',
    endDate: initialConfig?.endDate || '2024-12-31',
    frequency: initialConfig?.frequency || '1min',
    dataSource: initialConfig?.dataSource || 'auto',
    estimatedCost: 0
  })

  const [userConnections, setUserConnections] = useState({
    databento: false,
    polygon: true,
    alpaca: true,
    tradovate: false,
    ibkr: false
  })

  const dataSourceOptions: DataSourceOption[] = [
    {
      id: 'auto',
      name: 'Automatic (Smart Selection)',
      description: 'System intelligently chooses the best available data source for each symbol',
      icon: <Zap className="h-5 w-5" />,
      pricing: 'Optimized pricing',
      features: ['Best Coverage', 'Cost Optimization', 'Automatic Fallback', 'Smart Routing'],
      availability: 'available',
      recommended: true,
      coverage: {
        symbols: 50000,
        markets: ['US Equities', 'Futures', 'Options', 'Crypto'],
        frequency: ['1min', '5min', '1hour', 'daily']
      }
    },
    {
      id: 'platform',
      name: 'Platform Data (Databento)',
      description: 'Our premium $50K+ MBP-10 dataset with professional-grade market data',
      icon: <Server className="h-5 w-5" />,
      pricing: '$0.50 - $10.00 per analysis',
      features: ['MBP-10 Data', 'No API Key Required', 'Instant Access', 'Results Only'],
      availability: 'available',
      coverage: {
        symbols: 15000,
        markets: ['US Equities', 'Futures', 'Options'],
        frequency: ['1min', '5min', '1hour', 'daily']
      }
    },
    {
      id: 'user_keys',
      name: 'Your API Keys (BYOK)',
      description: 'Use your connected data provider API keys for extended access and coverage',
      icon: <Key className="h-5 w-5" />,
      pricing: '$1.00 - $20.00 per analysis',
      features: ['Full Data Access', 'Extended Coverage', 'Your Quotas', 'Premium Infrastructure'],
      availability: Object.values(userConnections).some(Boolean) ? 'connected' : 'unavailable',
      coverage: {
        symbols: 100000,
        markets: ['Global Markets', 'All Asset Classes', 'Alternative Data'],
        frequency: ['tick', '1min', '5min', '1hour', 'daily']
      }
    }
  ]

  const connectedProviders = Object.entries(userConnections)
    .filter(([_, connected]) => connected)
    .map(([provider, _]) => provider)

  const calculateEstimatedCost = (source: string, symbols: string[], frequency: string) => {
    const baseMultiplier = {
      'auto': 1.0,
      'platform': 0.8,
      'user_keys': 1.5
    }[source] || 1.0

    const frequencyMultiplier = {
      'tick': 3.0,
      '1min': 2.0,
      '5min': 1.5,
      '1hour': 1.0,
      'daily': 0.5
    }[frequency] || 1.0

    const symbolCount = symbols.length
    const baseCost = 2.50

    return Math.round((baseCost * baseMultiplier * frequencyMultiplier * symbolCount) * 100) / 100
  }

  useEffect(() => {
    const estimatedCost = calculateEstimatedCost(selectedSource, config.symbols, config.frequency)
    const newConfig = { ...config, dataSource: selectedSource, estimatedCost }
    setConfig(newConfig)
    onConfigChange?.(newConfig)
  }, [selectedSource, config.symbols, config.frequency])

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case 'connected':
        return <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
      case 'unavailable':
        return <Badge className="bg-gray-100 text-gray-800">Not Connected</Badge>
      default:
        return null
    }
  }

  const getSourceIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'unavailable':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Source Selection
          </CardTitle>
          <CardDescription>
            Choose how to power your backtest with the best data available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Hybrid Model:</strong> Mix and match platform data with your own API keys 
              for optimal coverage and cost efficiency.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Data Source Options */}
      <Card>
        <CardHeader>
          <CardTitle>Select Data Source</CardTitle>
          <CardDescription>
            Choose your preferred data source for this backtest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedSource} onValueChange={setSelectedSource}>
            <div className="space-y-4">
              {dataSourceOptions.map((option) => (
                <div key={option.id} className="relative">
                  <div className={`flex items-start space-x-4 p-4 border rounded-lg transition-all ${
                    selectedSource === option.id 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${option.availability === 'unavailable' ? 'opacity-60' : ''}`}>
                    
                    <RadioGroupItem 
                      value={option.id} 
                      id={option.id}
                      disabled={option.availability === 'unavailable'}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-full">
                            {option.icon}
                          </div>
                          <div>
                            <Label htmlFor={option.id} className="text-base font-semibold cursor-pointer">
                              {option.name}
                              {option.recommended && (
                                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Recommended
                                </Badge>
                              )}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSourceIcon(option.availability)}
                          {getAvailabilityBadge(option.availability)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700">Features</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {option.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-gray-700">Coverage</div>
                          <div className="mt-1 space-y-1">
                            <div className="text-xs text-muted-foreground">
                              {option.coverage.symbols.toLocaleString()} symbols
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {option.coverage.markets.join(', ')}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-gray-700">Pricing</div>
                          <div className="mt-1">
                            <div className="text-sm font-medium text-green-600">
                              {option.pricing}
                            </div>
                          </div>
                        </div>
                      </div>

                      {option.id === 'user_keys' && connectedProviders.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-800 mb-2">
                            Connected Providers:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {connectedProviders.map((provider) => (
                              <Badge key={provider} className="bg-blue-100 text-blue-800 capitalize">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {provider}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {option.id === 'user_keys' && connectedProviders.length === 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            No API keys connected. Visit the <strong>Your API Keys</strong> tab to connect 
                            your data providers.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Backtest Configuration
          </CardTitle>
          <CardDescription>
            Summary of your backtest setup and estimated costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Symbols</Label>
              <div className="text-sm">
                {config.symbols.join(', ')} ({config.symbols.length} symbols)
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Date Range</Label>
              <div className="text-sm">
                {config.startDate} to {config.endDate}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Frequency</Label>
              <div className="text-sm capitalize">
                {config.frequency}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Data Source</Label>
              <div className="text-sm">
                {dataSourceOptions.find(opt => opt.id === selectedSource)?.name}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Estimated Cost:</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              ${config.estimatedCost}
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span>Estimated processing time: 2-5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Results include: Performance metrics, equity curve, trade signals</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Comparison
          </CardTitle>
          <CardDescription>
            Compare costs across different data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">Platform Data</div>
                  <div className="text-sm text-muted-foreground">No API keys required</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">
                  ${calculateEstimatedCost('platform', config.symbols, config.frequency)}
                </div>
                <div className="text-xs text-muted-foreground">per analysis</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="font-medium">Your API Keys</div>
                  <div className="text-sm text-muted-foreground">Premium infrastructure</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">
                  ${calculateEstimatedCost('user_keys', config.symbols, config.frequency)}
                </div>
                <div className="text-xs text-muted-foreground">per analysis</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="font-medium">Automatic (Recommended)</div>
                  <div className="text-sm text-muted-foreground">Best value optimization</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">
                  ${calculateEstimatedCost('auto', config.symbols, config.frequency)}
                </div>
                <div className="text-xs text-muted-foreground">per analysis</div>
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>Fair Pricing:</strong> Our pricing is 50-90% less than competitors like Bloomberg Terminal 
              ($67/analysis) while providing superior AI-powered insights.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
