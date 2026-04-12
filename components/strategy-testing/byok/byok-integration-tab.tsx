"use client"

import React, { useState } from 'react'
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
  TabsItem 
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Key,
  Database,
  Zap,
  CheckCircle,
  Star,
  TrendingUp,
  Activity,
  Lock,
  Globe,
  DollarSign
} from 'lucide-react'

import { DataSourceManager } from './data-source-manager'
import { SecurityDashboard } from './security-dashboard'
import { BacktestDataSelector } from './backtest-data-selector'

export function BYOKIntegrationTab() {
  const [activeSubTab, setActiveSubTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bring Your Own Keys (BYOK)
          </CardTitle>
          <CardDescription className="text-lg">
            Military-grade security meets professional trading infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="flex justify-center mb-2">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div className="font-semibold text-green-800">AES-256 Encryption</div>
              <div className="text-sm text-green-700">Military-grade security</div>
            </div>
            <div className="p-4">
              <div className="flex justify-center mb-2">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="font-semibold text-blue-800">8-Hour Sessions</div>
              <div className="text-sm text-blue-700">Auto-expiring keys</div>
            </div>
            <div className="p-4">
              <div className="flex justify-center mb-2">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div className="font-semibold text-purple-800">Global Markets</div>
              <div className="text-sm text-purple-700">All asset classes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main BYOK Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsItem value="overview">Overview</TabsItem>
          <TabsItem value="data-sources">Data Sources</TabsItem>
          <TabsItem value="backtest-setup">Backtest Setup</TabsItem>
          <TabsItem value="security">Security</TabsItem>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Platform Data (Default)
                </CardTitle>
                <CardDescription>
                  Start immediately with our premium dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>$50K+ MBP-10 Dataset:</strong> Professional-grade market data 
                    with no API keys required.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">15,000+ symbols available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Futures, equities, options coverage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">1-minute to daily frequency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Instant access, no setup</span>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">Pricing: $0.50 - $10.00 per analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BYOK Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-600" />
                  Your API Keys (BYOK)
                </CardTitle>
                <CardDescription>
                  Connect your existing data subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Star className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Premium Infrastructure:</strong> Use your data quotas with 
                    our AI-powered analysis engine.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">100,000+ symbols available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Global markets, all asset classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Tick-level to daily data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Full data access + AI infrastructure</span>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">Pricing: $1.00 - $20.00 per analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supported Providers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Supported Data Providers
              </CardTitle>
              <CardDescription>
                Connect any of these professional data providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Databento', desc: 'MBP-10 Professional', icon: <Database className="h-5 w-5" /> },
                  { name: 'Polygon.io', desc: 'Real-time Market Data', icon: <TrendingUp className="h-5 w-5" /> },
                  { name: 'Alpaca', desc: 'Commission-free Trading', icon: <Activity className="h-5 w-5" /> },
                  { name: 'Tradovate', desc: 'Futures Trading', icon: <Zap className="h-5 w-5" /> },
                  { name: 'Interactive Brokers', desc: 'Global Markets', icon: <Globe className="h-5 w-5" /> }
                ].map((provider) => (
                  <div key={provider.name} className="text-center p-4 border rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex justify-center mb-2 text-blue-600">
                      {provider.icon}
                    </div>
                    <div className="font-semibold text-sm">{provider.name}</div>
                    <div className="text-xs text-muted-foreground">{provider.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Promise */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Shield className="h-5 w-5" />
                Security Promise
              </CardTitle>
              <CardDescription className="text-green-700">
                Your API keys are protected with military-grade security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>AES-256 encryption with PBKDF2</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>8-hour session auto-expiry</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>Zero-trust architecture</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>Automatic key deletion</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete audit logging</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>SOC 2 ready compliance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="data-sources">
          <DataSourceManager />
        </TabsContent>

        {/* Backtest Setup Tab */}
        <TabsContent value="backtest-setup">
          <BacktestDataSelector />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
