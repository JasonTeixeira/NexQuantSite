'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, AlertTriangle, Eye, Settings, Download } from 'lucide-react'

const portfolioData = {
  totalValue: 125750.50,
  totalPnL: 8750.25,
  totalPnLPercent: 7.48,
  dayChange: 1250.75,
  dayChangePercent: 1.01,
  positions: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 150,
      avgPrice: 175.50,
      currentPrice: 182.25,
      value: 27337.50,
      pnl: 1012.50,
      pnlPercent: 3.85,
      allocation: 21.7,
      sector: 'Technology'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      quantity: 80,
      avgPrice: 310.25,
      currentPrice: 325.80,
      value: 26064.00,
      pnl: 1244.00,
      pnlPercent: 5.02,
      allocation: 20.7,
      sector: 'Technology'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 45,
      avgPrice: 135.75,
      currentPrice: 142.10,
      value: 6394.50,
      pnl: 285.75,
      pnlPercent: 4.68,
      allocation: 5.1,
      sector: 'Technology'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      quantity: 60,
      avgPrice: 245.80,
      currentPrice: 238.50,
      value: 14310.00,
      pnl: -438.00,
      pnlPercent: -2.97,
      allocation: 11.4,
      sector: 'Automotive'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      quantity: 25,
      avgPrice: 420.50,
      currentPrice: 465.25,
      value: 11631.25,
      pnl: 1118.75,
      pnlPercent: 10.64,
      allocation: 9.2,
      sector: 'Technology'
    }
  ]
}

const allocationData = [
  { name: 'Technology', value: 56.5, color: '#B8FF00' },
  { name: 'Healthcare', value: 15.2, color: '#00D4FF' },
  { name: 'Finance', value: 12.8, color: '#FF6B6B' },
  { name: 'Automotive', value: 11.4, color: '#4ECDC4' },
  { name: 'Energy', value: 4.1, color: '#45B7D1' }
]

const performanceData = [
  { date: '2024-01', value: 100000 },
  { date: '2024-02', value: 102500 },
  { date: '2024-03', value: 98750 },
  { date: '2024-04', value: 105200 },
  { date: '2024-05', value: 108900 },
  { date: '2024-06', value: 112300 },
  { date: '2024-07', value: 118750 },
  { date: '2024-08', value: 125750 }
]

export default function PortfolioDashboardClient() {
  const [timeframe, setTimeframe] = useState('1M')
  const [sortBy, setSortBy] = useState('allocation')

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] bg-clip-text text-transparent">
              Portfolio Overview
            </h1>
            <p className="text-gray-400 mt-1">Track your positions and performance</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="border-gray-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" size="sm" className="border-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Portfolio Value</p>
                  <p className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-[#B8FF00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total P&L</p>
                  <p className="text-2xl font-bold text-[#B8FF00]">
                    +${portfolioData.totalPnL.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#B8FF00]">+{portfolioData.totalPnLPercent}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#B8FF00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Day Change</p>
                  <p className="text-2xl font-bold text-[#B8FF00]">
                    +${portfolioData.dayChange.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#B8FF00]">+{portfolioData.dayChangePercent}%</p>
                </div>
                <Activity className="w-8 h-8 text-[#B8FF00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Positions</p>
                  <p className="text-2xl font-bold">{portfolioData.positions.length}</p>
                </div>
                <Target className="w-8 h-8 text-[#B8FF00]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance Chart */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Historical portfolio value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Portfolio Value",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#B8FF00" 
                      strokeWidth={2}
                      dot={{ fill: '#B8FF00', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Asset Allocation Chart */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Portfolio distribution by sector</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  allocation: {
                    label: "Allocation",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Allocation']}
                      labelStyle={{ color: '#fff' }}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="mt-4 space-y-2">
                {allocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions Table */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Current Positions</CardTitle>
                <CardDescription>Your active trading positions</CardDescription>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allocation">Allocation</SelectItem>
                  <SelectItem value="pnl">P&L</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="symbol">Symbol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Avg Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Current Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Value</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">P&L</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Allocation</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.positions.map((position, index) => (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">{position.symbol}</div>
                          <div className="text-sm text-gray-400">{position.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{position.quantity}</td>
                      <td className="py-4 px-4 text-right">${position.avgPrice.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right">${position.currentPrice.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right font-medium">
                        ${position.value.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className={`font-medium ${position.pnl >= 0 ? 'text-[#B8FF00]' : 'text-red-500'}`}>
                          {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                        </div>
                        <div className={`text-sm ${position.pnl >= 0 ? 'text-[#B8FF00]' : 'text-red-500'}`}>
                          {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge variant="outline" className="border-gray-600">
                          {position.allocation}%
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Settings className="w-4 h-4" />
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
      </div>
    </div>
  )
}
