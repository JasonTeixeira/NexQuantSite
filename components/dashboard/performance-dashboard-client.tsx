'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Target, Activity, Award, Calendar, Download, RefreshCw } from 'lucide-react'

const performanceMetrics = {
  totalReturn: 24.8,
  sharpeRatio: 1.85,
  maxDrawdown: -8.2,
  winRate: 68.5,
  profitFactor: 2.34,
  avgWin: 2.8,
  avgLoss: -1.2,
  totalTrades: 247,
  winningTrades: 169,
  losingTrades: 78
}

const monthlyReturns = [
  { month: 'Jan', return: 3.2, benchmark: 1.8 },
  { month: 'Feb', return: -1.5, benchmark: 0.5 },
  { month: 'Mar', return: 4.8, benchmark: 2.1 },
  { month: 'Apr', return: 2.1, benchmark: 1.2 },
  { month: 'May', return: 6.2, benchmark: 3.1 },
  { month: 'Jun', return: -2.8, benchmark: -0.8 },
  { month: 'Jul', return: 5.5, benchmark: 2.8 },
  { month: 'Aug', return: 3.9, benchmark: 1.9 }
]

const drawdownData = [
  { date: '2024-01', drawdown: 0 },
  { date: '2024-02', drawdown: -2.1 },
  { date: '2024-03', drawdown: -1.2 },
  { date: '2024-04', drawdown: -3.8 },
  { date: '2024-05', drawdown: -1.5 },
  { date: '2024-06', drawdown: -8.2 },
  { date: '2024-07', drawdown: -4.1 },
  { date: '2024-08', drawdown: -2.3 }
]

const tradeAnalysis = [
  { category: 'Technology', trades: 89, winRate: 72.1, avgReturn: 3.2 },
  { category: 'Healthcare', trades: 45, winRate: 66.7, avgReturn: 2.8 },
  { category: 'Finance', trades: 38, winRate: 63.2, avgReturn: 2.1 },
  { category: 'Energy', trades: 32, winRate: 59.4, avgReturn: 1.9 },
  { category: 'Consumer', trades: 43, winRate: 69.8, avgReturn: 2.5 }
]

export default function PerformanceDashboardClient() {
  const [timeframe, setTimeframe] = useState('YTD')
  const [benchmark, setBenchmark] = useState('SPY')

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] bg-clip-text text-transparent">
              Performance Analytics
            </h1>
            <p className="text-gray-400 mt-1">Detailed performance metrics and statistics</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="YTD">YTD</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={benchmark} onValueChange={setBenchmark}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPY">S&P 500</SelectItem>
                <SelectItem value="QQQ">NASDAQ</SelectItem>
                <SelectItem value="IWM">Russell 2000</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="border-gray-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm" className="border-gray-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total Return</p>
                <p className="text-2xl font-bold text-[#B8FF00]">+{performanceMetrics.totalReturn}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="text-2xl font-bold">{performanceMetrics.sharpeRatio}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-500">{performanceMetrics.maxDrawdown}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-[#B8FF00]">{performanceMetrics.winRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Profit Factor</p>
                <p className="text-2xl font-bold">{performanceMetrics.profitFactor}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold">{performanceMetrics.totalTrades}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <Tabs defaultValue="returns" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="returns">Monthly Returns</TabsTrigger>
            <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
            <TabsTrigger value="analysis">Trade Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="returns" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Monthly Returns vs Benchmark</CardTitle>
                <CardDescription>Compare your performance against the selected benchmark</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    return: {
                      label: "Your Return",
                      color: "#B8FF00",
                    },
                    benchmark: {
                      label: "Benchmark",
                      color: "#00D4FF",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyReturns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        content={<ChartTooltipContent />}
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      />
                      <Bar dataKey="return" fill="#B8FF00" name="Your Return" />
                      <Bar dataKey="benchmark" fill="#00D4FF" name="Benchmark" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drawdown" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Drawdown Analysis</CardTitle>
                <CardDescription>Track portfolio drawdowns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    drawdown: {
                      label: "Drawdown",
                      color: "#FF6B6B",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={drawdownData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        content={<ChartTooltipContent />}
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="drawdown" 
                        stroke="#FF6B6B" 
                        fill="#FF6B6B" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Trade Analysis by Sector</CardTitle>
                <CardDescription>Performance breakdown by trading categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 font-medium text-gray-400">Sector</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-400">Trades</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-400">Win Rate</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-400">Avg Return</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-400">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeAnalysis.map((sector, index) => (
                        <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-4 px-4 font-medium">{sector.category}</td>
                          <td className="py-4 px-4 text-right">{sector.trades}</td>
                          <td className="py-4 px-4 text-right">
                            <Badge 
                              variant="outline" 
                              className={`${sector.winRate >= 70 ? 'border-[#B8FF00] text-[#B8FF00]' : 
                                sector.winRate >= 60 ? 'border-yellow-500 text-yellow-500' : 
                                'border-red-500 text-red-500'}`}
                            >
                              {sector.winRate}%
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={sector.avgReturn >= 0 ? 'text-[#B8FF00]' : 'text-red-500'}>
                              {sector.avgReturn >= 0 ? '+' : ''}{sector.avgReturn}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end">
                              {sector.avgReturn >= 2.5 ? (
                                <TrendingUp className="w-4 h-4 text-[#B8FF00]" />
                              ) : sector.avgReturn >= 1.5 ? (
                                <Activity className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              )}
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
        </Tabs>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#B8FF00]" />
                Risk Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Volatility</span>
                <span>12.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Beta</span>
                <span>0.85</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Alpha</span>
                <span className="text-[#B8FF00]">+3.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Information Ratio</span>
                <span>1.24</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#B8FF00]" />
                Trade Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Win</span>
                <span className="text-[#B8FF00]">+{performanceMetrics.avgWin}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Loss</span>
                <span className="text-red-500">{performanceMetrics.avgLoss}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Winning Trades</span>
                <span>{performanceMetrics.winningTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Losing Trades</span>
                <span>{performanceMetrics.losingTrades}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B8FF00]" />
                Time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Hold Time</span>
                <span>3.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Month</span>
                <span className="text-[#B8FF00]">May (+6.2%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Worst Month</span>
                <span className="text-red-500">Jun (-2.8%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Consistency</span>
                <span>78%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
