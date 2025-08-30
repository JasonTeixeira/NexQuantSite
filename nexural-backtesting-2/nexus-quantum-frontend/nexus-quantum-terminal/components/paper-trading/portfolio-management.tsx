// 📊 PORTFOLIO MANAGEMENT - Session-based paper trading with multiple broker support
// Handles user portfolios, broker connections, and long-term tracking

"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PlusIcon, 
  SettingsIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  DollarSignIcon,
  CalendarIcon,
  BarChart3Icon,
  WifiIcon,
  WifiOffIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  RefreshCwIcon
} from 'lucide-react'
import { PAPER_TRADING_BROKERS } from '@/lib/paper-trading/broker-integrations'
import { PortfolioSummary } from '@/lib/paper-trading/paper-trading-service'

interface PortfolioManagementProps {
  sessionId: string | null
  onCreatePortfolio?: (portfolio: any) => void
  onSelectPortfolio?: (portfolioId: string) => void
  className?: string
}

interface BrokerConnection {
  brokerId: string
  connected: boolean
  lastConnect: Date | null
  accountInfo?: any
}

// Mock data for demonstration
const DEMO_PORTFOLIOS: PortfolioSummary[] = [
  {
    id: 'port_1',
    name: 'Growth Strategy',
    broker: 'alpaca',
    balance: 125340.50,
    totalReturn: 25340.50,
    totalReturnPercent: 25.34,
    dayChange: 1240.30,
    dayChangePercent: 1.02,
    positionCount: 8,
    lastUpdated: new Date(Date.now() - 300000) // 5 min ago
  },
  {
    id: 'port_2',
    name: 'Conservative Income',
    broker: 'interactive_brokers',
    balance: 87650.25,
    totalReturn: -2349.75,
    totalReturnPercent: -2.61,
    dayChange: -450.20,
    dayChangePercent: -0.51,
    positionCount: 12,
    lastUpdated: new Date(Date.now() - 600000) // 10 min ago
  }
]

const DEMO_CONNECTIONS: BrokerConnection[] = [
  {
    brokerId: 'alpaca',
    connected: true,
    lastConnect: new Date(Date.now() - 3600000), // 1 hour ago
    accountInfo: { accountId: 'ALPACA123', buyingPower: 125340.50 }
  },
  {
    brokerId: 'interactive_brokers',
    connected: false,
    lastConnect: null
  }
]

export function PortfolioManagement({ 
  sessionId, 
  onCreatePortfolio,
  onSelectPortfolio,
  className = ""
}: PortfolioManagementProps) {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>(DEMO_PORTFOLIOS)
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnection[]>(DEMO_CONNECTIONS)
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false)
  const [showBrokerSetup, setShowBrokerSetup] = useState(false)
  const [selectedBroker, setSelectedBroker] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [portfolioForm, setPortfolioForm] = useState({
    name: '',
    broker: '',
    initialBalance: 100000
  })

  const [brokerForm, setBrokerForm] = useState({
    brokerId: '',
    apiKey: '',
    secret: ''
  })

  useEffect(() => {
    if (sessionId) {
      loadUserPortfolios()
      loadBrokerConnections()
    }
  }, [sessionId])

  const loadUserPortfolios = async () => {
    // In real implementation, this would call PaperTradingService
    setIsLoading(true)
    try {
      // const service = new PaperTradingService(config)
      // const userPortfolios = await service.getUserPortfolios(sessionId)
      // setPortfolios(userPortfolios)
    } catch (error) {
      console.error('Failed to load portfolios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadBrokerConnections = async () => {
    // Load current broker connection status
  }

  const handleConnectBroker = async () => {
    if (!brokerForm.brokerId) return

    setIsLoading(true)
    try {
      // const service = new PaperTradingService(config)
      // const connected = await service.connectBroker(
      //   sessionId!, 
      //   brokerForm.brokerId, 
      //   `${brokerForm.apiKey}:${brokerForm.secret}`
      // )

      // For demo, simulate connection
      const connected = Math.random() > 0.2 // 80% success rate

      if (connected) {
        setBrokerConnections(prev => prev.map(conn => 
          conn.brokerId === brokerForm.brokerId 
            ? { ...conn, connected: true, lastConnect: new Date() }
            : conn
        ))
        setBrokerForm({ brokerId: '', apiKey: '', secret: '' })
        setShowBrokerSetup(false)
      } else {
        alert('Failed to connect to broker. Please check your credentials.')
      }
    } catch (error) {
      console.error('Broker connection failed:', error)
      alert('Connection failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePortfolio = async () => {
    if (!portfolioForm.name || !portfolioForm.broker) return

    setIsLoading(true)
    try {
      // const service = new PaperTradingService(config)
      // const portfolio = await service.createPortfolio(
      //   sessionId!,
      //   portfolioForm.broker,
      //   portfolioForm.name,
      //   portfolioForm.initialBalance
      // )

      // For demo, create mock portfolio
      const newPortfolio: PortfolioSummary = {
        id: 'port_' + Date.now(),
        name: portfolioForm.name,
        broker: portfolioForm.broker,
        balance: portfolioForm.initialBalance,
        totalReturn: 0,
        totalReturnPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        positionCount: 0,
        lastUpdated: new Date()
      }

      setPortfolios(prev => [...prev, newPortfolio])
      setPortfolioForm({ name: '', broker: '', initialBalance: 100000 })
      setShowCreatePortfolio(false)

      if (onCreatePortfolio) {
        onCreatePortfolio(newPortfolio)
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error)
      alert('Failed to create portfolio: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const getBrokerInfo = (brokerId: string) => {
    return PAPER_TRADING_BROKERS.find(b => b.id === brokerId)
  }

  const getBrokerConnection = (brokerId: string) => {
    return brokerConnections.find(c => c.brokerId === brokerId)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (!sessionId) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <ShieldCheckIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
          <p className="text-gray-400 mb-4">
            Please sign in to access your paper trading portfolios and manage broker connections.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Paper Trading Portfolios</h2>
          <p className="text-gray-400">Manage your paper trading accounts and broker connections</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowBrokerSetup(true)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Broker Setup
          </Button>
          <Button
            onClick={() => setShowCreatePortfolio(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Portfolio
          </Button>
        </div>
      </div>

      <Tabs defaultValue="portfolios" className="w-full">
        <TabsList className="bg-[#1a1a2e] border-[#2a2a3e]">
          <TabsTrigger value="portfolios">My Portfolios ({portfolios.length})</TabsTrigger>
          <TabsTrigger value="brokers">Broker Connections</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
        </TabsList>

        {/* Portfolios Tab */}
        <TabsContent value="portfolios" className="space-y-4">
          {portfolios.length === 0 ? (
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardContent className="py-12 text-center">
                <BarChart3Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Portfolios Yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first paper trading portfolio to start testing strategies risk-free.
                </p>
                <Button
                  onClick={() => setShowCreatePortfolio(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Your First Portfolio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map(portfolio => {
                const broker = getBrokerInfo(portfolio.broker)
                const connection = getBrokerConnection(portfolio.broker)
                
                return (
                  <Card 
                    key={portfolio.id}
                    className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#3a3a4e] cursor-pointer transition-colors"
                    onClick={() => onSelectPortfolio && onSelectPortfolio(portfolio.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">{portfolio.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400">{broker?.name}</span>
                            {connection?.connected ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                <WifiIcon className="w-3 h-3 mr-1" />
                                LIVE
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                <WifiOffIcon className="w-3 h-3 mr-1" />
                                OFFLINE
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Open portfolio settings
                          }}
                        >
                          <SettingsIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Portfolio Value */}
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(portfolio.balance)}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={getChangeColor(portfolio.totalReturn)}>
                            {portfolio.totalReturn >= 0 ? (
                              <TrendingUpIcon className="w-4 h-4 inline mr-1" />
                            ) : (
                              <TrendingDownIcon className="w-4 h-4 inline mr-1" />
                            )}
                            {formatCurrency(portfolio.totalReturn)} ({formatPercent(portfolio.totalReturnPercent)})
                          </span>
                        </div>
                      </div>

                      {/* Today's Change */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Today's Change</span>
                        <span className={getChangeColor(portfolio.dayChange)}>
                          {formatCurrency(portfolio.dayChange)} ({formatPercent(portfolio.dayChangePercent)})
                        </span>
                      </div>

                      {/* Positions */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Positions</span>
                        <span className="text-white">{portfolio.positionCount}</span>
                      </div>

                      {/* Last Updated */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Last Updated</span>
                        <span className="text-white">{formatTimeAgo(portfolio.lastUpdated)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Brokers Tab */}
        <TabsContent value="brokers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAPER_TRADING_BROKERS.filter(b => b.status === 'active').map(broker => {
              const connection = getBrokerConnection(broker.id)
              
              return (
                <Card key={broker.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{broker.name}</CardTitle>
                        <p className="text-sm text-gray-400 mt-1">{broker.description}</p>
                      </div>
                      {connection?.connected ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          CONNECTED
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          DISCONNECTED
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div>
                      <div className="text-sm font-medium text-white mb-2">Features</div>
                      <div className="flex flex-wrap gap-1">
                        {broker.features.slice(0, 3).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Asset Classes */}
                    <div>
                      <div className="text-sm font-medium text-white mb-2">Assets</div>
                      <div className="text-sm text-gray-400">
                        {broker.assetClasses.join(', ')}
                      </div>
                    </div>

                    {/* Commission */}
                    <div>
                      <div className="text-sm font-medium text-white mb-1">Commission</div>
                      <div className="text-sm text-gray-400">{broker.commissionStructure}</div>
                    </div>

                    {/* Connection Status */}
                    {connection?.connected ? (
                      <div className="space-y-2">
                        <div className="text-sm text-green-400">
                          ✅ Connected {connection.lastConnect && formatTimeAgo(connection.lastConnect)}
                        </div>
                        {connection.accountInfo && (
                          <div className="text-xs text-gray-500">
                            Account: {connection.accountInfo.accountId}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setBrokerForm({ ...brokerForm, brokerId: broker.id })
                          setShowBrokerSetup(true)
                        }}
                      >
                        Connect Broker
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardContent className="py-12 text-center">
              <BarChart3Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Performance Analytics</h3>
              <p className="text-gray-400 mb-6">
                Detailed performance analytics and benchmarking coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Portfolio Modal */}
      {showCreatePortfolio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-[#1a1a2e] border-[#2a2a3e] w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Create New Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="portfolio-name" className="text-white">Portfolio Name</Label>
                <Input
                  id="portfolio-name"
                  value={portfolioForm.name}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, name: e.target.value })}
                  className="bg-[#2a2a3e] border-[#3a3a4e] text-white"
                  placeholder="e.g., Growth Strategy"
                />
              </div>

              <div>
                <Label htmlFor="broker-select" className="text-white">Broker</Label>
                <select
                  id="broker-select"
                  value={portfolioForm.broker}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, broker: e.target.value })}
                  className="w-full p-2 bg-[#2a2a3e] border border-[#3a3a4e] rounded-md text-white"
                >
                  <option value="">Select a broker</option>
                  {brokerConnections
                    .filter(c => c.connected)
                    .map(connection => {
                      const broker = getBrokerInfo(connection.brokerId)
                      return (
                        <option key={connection.brokerId} value={connection.brokerId}>
                          {broker?.name}
                        </option>
                      )
                    })
                  }
                </select>
              </div>

              <div>
                <Label htmlFor="initial-balance" className="text-white">Initial Balance</Label>
                <Input
                  id="initial-balance"
                  type="number"
                  value={portfolioForm.initialBalance}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, initialBalance: parseFloat(e.target.value) || 0 })}
                  className="bg-[#2a2a3e] border-[#3a3a4e] text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                  onClick={() => setShowCreatePortfolio(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleCreatePortfolio}
                  disabled={!portfolioForm.name || !portfolioForm.broker || isLoading}
                >
                  {isLoading ? <RefreshCwIcon className="w-4 h-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Broker Setup Modal */}
      {showBrokerSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-[#1a1a2e] border-[#2a2a3e] w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Connect Broker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="broker-select" className="text-white">Broker</Label>
                <select
                  id="broker-select"
                  value={brokerForm.brokerId}
                  onChange={(e) => setBrokerForm({ ...brokerForm, brokerId: e.target.value })}
                  className="w-full p-2 bg-[#2a2a3e] border border-[#3a3a4e] rounded-md text-white"
                >
                  <option value="">Select a broker</option>
                  {PAPER_TRADING_BROKERS
                    .filter(b => b.status === 'active' && b.requiresApiKey)
                    .map(broker => (
                      <option key={broker.id} value={broker.id}>
                        {broker.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {brokerForm.brokerId && (
                <>
                  <div>
                    <Label htmlFor="api-key" className="text-white">API Key</Label>
                    <Input
                      id="api-key"
                      value={brokerForm.apiKey}
                      onChange={(e) => setBrokerForm({ ...brokerForm, apiKey: e.target.value })}
                      className="bg-[#2a2a3e] border-[#3a3a4e] text-white"
                      placeholder="Your API key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="api-secret" className="text-white">API Secret</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      value={brokerForm.secret}
                      onChange={(e) => setBrokerForm({ ...brokerForm, secret: e.target.value })}
                      className="bg-[#2a2a3e] border-[#3a3a4e] text-white"
                      placeholder="Your API secret"
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangleIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-300">
                        <div className="font-medium mb-1">Paper Trading Only</div>
                        <div>This connects to the broker's paper trading environment. Your real funds are never at risk.</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                  onClick={() => setShowBrokerSetup(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleConnectBroker}
                  disabled={!brokerForm.brokerId || !brokerForm.apiKey || !brokerForm.secret || isLoading}
                >
                  {isLoading ? <RefreshCwIcon className="w-4 h-4 animate-spin" /> : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PortfolioManagement
