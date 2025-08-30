"use client"

import React, { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Briefcase, TrendingUp, TrendingDown, DollarSign, Target,
  AlertTriangle, Shield, BarChart3, PieChart, Activity,
  Plus, Minus, Settings, Zap, Eye, Filter
} from "lucide-react"
import { OptionsFlow } from "@/lib/options-flow-data"

interface AdvancedPortfolioManagerProps {
  flows?: OptionsFlow[]
  className?: string
}

interface Position {
  id: string
  symbol: string
  type: 'Call' | 'Put'
  strike: number
  expiration: string
  quantity: number
  entryPrice: number
  currentPrice: number
  delta: number
  gamma: number
  theta: number
  vega: number
  impliedVolatility: number
  daysToExpiry: number
  pnl: number
  pnlPercent: number
}

interface Portfolio {
  id: string
  name: string
  description: string
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  positions: Position[]
  riskLevel: 'Low' | 'Medium' | 'High'
  maxDrawdown: number
  sharpeRatio: number
}

const AdvancedPortfolioManager = React.memo(({ flows = [], className = "" }: AdvancedPortfolioManagerProps) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('main')
  const [viewMode, setViewMode] = useState<'positions' | 'greeks' | 'risk' | 'performance'>('positions')
  const [sortBy, setSortBy] = useState<'pnl' | 'value' | 'risk'>('pnl')

  // Mock portfolio data
  const portfolios: Portfolio[] = useMemo(() => [
    {
      id: 'main',
      name: 'Main Portfolio',
      description: 'Primary trading portfolio',
      totalValue: 156420,
      totalPnL: 12450,
      totalPnLPercent: 8.65,
      riskLevel: 'Medium',
      maxDrawdown: -5.2,
      sharpeRatio: 1.34,
      positions: [
        {
          id: '1',
          symbol: 'SPY',
          type: 'Call',
          strike: 450,
          expiration: '2024-03-15',
          quantity: 5,
          entryPrice: 12.50,
          currentPrice: 15.20,
          delta: 0.65,
          gamma: 0.08,
          theta: -0.12,
          vega: 0.25,
          impliedVolatility: 0.18,
          daysToExpiry: 12,
          pnl: 1350,
          pnlPercent: 21.6
        },
        {
          id: '2',
          symbol: 'AAPL',
          type: 'Put',
          strike: 180,
          expiration: '2024-03-22',
          quantity: -3,
          entryPrice: 8.75,
          currentPrice: 6.20,
          delta: -0.45,
          gamma: 0.12,
          theta: -0.08,
          vega: 0.32,
          impliedVolatility: 0.22,
          daysToExpiry: 19,
          pnl: 765,
          pnlPercent: 29.1
        },
        {
          id: '3',
          symbol: 'MSFT',
          type: 'Call',
          strike: 400,
          expiration: '2024-04-05',
          quantity: 2,
          entryPrice: 18.90,
          currentPrice: 16.45,
          delta: 0.58,
          gamma: 0.06,
          theta: -0.15,
          vega: 0.28,
          impliedVolatility: 0.19,
          daysToExpiry: 33,
          pnl: -490,
          pnlPercent: -12.9
        }
      ]
    },
    {
      id: 'hedge',
      name: 'Hedge Portfolio',
      description: 'Risk management positions',
      totalValue: 48920,
      totalPnL: -1240,
      totalPnLPercent: -2.47,
      riskLevel: 'Low',
      maxDrawdown: -2.8,
      sharpeRatio: 0.92,
      positions: []
    }
  ], [])

  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio)

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (!currentPortfolio) return null

    const positions = currentPortfolio.positions
    const totalDelta = positions.reduce((sum, pos) => sum + pos.delta * pos.quantity, 0)
    const totalGamma = positions.reduce((sum, pos) => sum + pos.gamma * pos.quantity, 0)
    const totalTheta = positions.reduce((sum, pos) => sum + pos.theta * pos.quantity, 0)
    const totalVega = positions.reduce((sum, pos) => sum + pos.vega * pos.quantity, 0)

    return {
      totalDelta,
      totalGamma,
      totalTheta,
      totalVega,
      averageIV: positions.length > 0 ? positions.reduce((sum, pos) => sum + pos.impliedVolatility, 0) / positions.length : 0,
      averageDTE: positions.length > 0 ? positions.reduce((sum, pos) => sum + pos.daysToExpiry, 0) / positions.length : 0
    }
  }, [currentPortfolio])

  // Risk assessment
  const riskMetrics = useMemo(() => {
    if (!currentPortfolio) return null

    const positions = currentPortfolio.positions
    const totalValue = currentPortfolio.totalValue

    const concentration = positions.reduce((acc, pos) => {
      const positionValue = Math.abs(pos.quantity * pos.currentPrice * 100)
      const symbolConcentration = acc[pos.symbol] || 0
      acc[pos.symbol] = symbolConcentration + (positionValue / totalValue)
      return acc
    }, {} as Record<string, number>)

    const maxConcentration = Math.max(...Object.values(concentration))
    const diversificationScore = 1 - maxConcentration

    return {
      concentration,
      maxConcentration,
      diversificationScore,
      riskLevel: maxConcentration > 0.4 ? 'High' : maxConcentration > 0.25 ? 'Medium' : 'Low'
    }
  }, [currentPortfolio])

  const filteredPositions = useMemo(() => {
    if (!currentPortfolio) return []
    
    return [...currentPortfolio.positions].sort((a, b) => {
      switch (sortBy) {
        case 'pnl':
          return b.pnl - a.pnl
        case 'value':
          return (Math.abs(b.quantity) * b.currentPrice) - (Math.abs(a.quantity) * a.currentPrice)
        case 'risk':
          return Math.abs(b.delta * b.quantity) - Math.abs(a.delta * a.quantity)
        default:
          return 0
      }
    })
  }, [currentPortfolio, sortBy])

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }, [])

  const formatPercent = useCallback((value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-primary/20">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Advanced Portfolio Manager
          </h2>
          <p className="text-gray-400 mt-1">Real-time portfolio tracking & risk management</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/20 text-primary border border-primary/30">
            <Activity className="w-3 h-3 mr-1" />
            Live Tracking
          </Badge>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Portfolio Selection & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portfolio List */}
        <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">Portfolios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolios.map((portfolio) => (
                <motion.div
                  key={portfolio.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPortfolio === portfolio.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-gray-800 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                  onClick={() => setSelectedPortfolio(portfolio.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{portfolio.name}</h3>
                    <Badge 
                      variant={portfolio.riskLevel === 'High' ? 'destructive' : 
                              portfolio.riskLevel === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {portfolio.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{portfolio.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Value:</span>
                      <span className="text-sm font-mono text-white">
                        {formatCurrency(portfolio.totalValue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">P&L:</span>
                      <span className={`text-sm font-mono ${
                        portfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercent(portfolio.totalPnLPercent)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Overview Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                  +8.65%
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {formatCurrency(currentPortfolio?.totalValue || 0)}
                </h3>
                <p className="text-gray-400 text-sm">Total Portfolio Value</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Greeks
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {portfolioMetrics?.totalDelta.toFixed(2) || '0.00'}
                </h3>
                <p className="text-gray-400 text-sm">Portfolio Delta</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <Badge 
                  variant={riskMetrics?.riskLevel === 'High' ? 'destructive' : 
                          riskMetrics?.riskLevel === 'Medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {riskMetrics?.riskLevel}
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {((riskMetrics?.diversificationScore || 0) * 100).toFixed(0)}%
                </h3>
                <p className="text-gray-400 text-sm">Diversification Score</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <TabsList className="bg-black/60 border border-primary/20">
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Positions
            </TabsTrigger>
            <TabsTrigger value="greeks" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Greeks
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/60 border border-primary/30 rounded px-3 py-1 text-white text-sm focus:border-primary focus:outline-none"
            >
              <option value="pnl">P&L</option>
              <option value="value">Value</option>
              <option value="risk">Risk</option>
            </select>
          </div>
        </div>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Active Positions</CardTitle>
                <span className="text-sm text-gray-400">
                  {filteredPositions.length} positions
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left py-3 px-4 text-gray-400">Symbol</th>
                      <th className="text-left py-3 px-4 text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400">Strike</th>
                      <th className="text-left py-3 px-4 text-gray-400">Qty</th>
                      <th className="text-left py-3 px-4 text-gray-400">Entry</th>
                      <th className="text-left py-3 px-4 text-gray-400">Current</th>
                      <th className="text-left py-3 px-4 text-gray-400">P&L</th>
                      <th className="text-left py-3 px-4 text-gray-400">Delta</th>
                      <th className="text-left py-3 px-4 text-gray-400">DTE</th>
                      <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPositions.map((position) => (
                      <tr key={position.id} className="border-b border-gray-800/50 hover:bg-primary/5">
                        <td className="py-3 px-4 font-bold text-white">{position.symbol}</td>
                        <td className="py-3 px-4">
                          <Badge variant={position.type === 'Call' ? 'default' : 'destructive'}>
                            {position.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-300">${position.strike}</td>
                        <td className="py-3 px-4 text-blue-400">{position.quantity}</td>
                        <td className="py-3 px-4 font-mono text-gray-300">${position.entryPrice}</td>
                        <td className="py-3 px-4 font-mono text-white">${position.currentPrice}</td>
                        <td className="py-3 px-4">
                          <div className={`font-mono ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(position.pnl)}
                            <div className="text-xs">
                              {formatPercent(position.pnlPercent)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-300">
                          {position.delta.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{position.daysToExpiry}d</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Greeks Tab */}
        <TabsContent value="greeks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400">Total Delta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {portfolioMetrics?.totalDelta.toFixed(2)}
                </div>
                <Progress 
                  value={Math.abs(portfolioMetrics?.totalDelta || 0) * 10} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400">Total Gamma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {portfolioMetrics?.totalGamma.toFixed(2)}
                </div>
                <Progress 
                  value={Math.abs(portfolioMetrics?.totalGamma || 0) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400">Total Theta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {portfolioMetrics?.totalTheta.toFixed(2)}
                </div>
                <Progress 
                  value={Math.abs(portfolioMetrics?.totalTheta || 0) * 20} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400">Total Vega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {portfolioMetrics?.totalVega.toFixed(2)}
                </div>
                <Progress 
                  value={Math.abs(portfolioMetrics?.totalVega || 0) * 10} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white">Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Concentration:</span>
                    <span className="text-white font-mono">
                      {((riskMetrics?.maxConcentration || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Diversification Score:</span>
                    <span className="text-white font-mono">
                      {((riskMetrics?.diversificationScore || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Drawdown:</span>
                    <span className="text-red-400 font-mono">
                      {currentPortfolio?.maxDrawdown}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Sharpe Ratio:</span>
                    <span className="text-white font-mono">
                      {currentPortfolio?.sharpeRatio}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white">Position Concentration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(riskMetrics?.concentration || {}).map(([symbol, concentration]) => (
                    <div key={symbol}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400">{symbol}</span>
                        <span className="text-white text-sm">
                          {(concentration * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={concentration * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white">Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Performance Analytics</h3>
                <p className="text-gray-400">Detailed performance charts and analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {!currentPortfolio && (
        <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Portfolio</h3>
              <p className="text-gray-400">Choose a portfolio from the left to view details and manage positions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
})

AdvancedPortfolioManager.displayName = 'AdvancedPortfolioManager'
export default AdvancedPortfolioManager
