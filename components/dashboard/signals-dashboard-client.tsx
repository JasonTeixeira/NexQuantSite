'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, Clock, Target, Zap, Play, Pause, Settings, Filter, Bell } from 'lucide-react'

const liveSignals = [
  {
    id: 1,
    symbol: 'AAPL',
    action: 'BUY',
    price: 182.25,
    targetPrice: 195.50,
    stopLoss: 175.80,
    confidence: 87,
    timeframe: '1D',
    strategy: 'Momentum Breakout',
    timestamp: '2024-01-15 09:32:15',
    status: 'active',
    potentialReturn: 7.3,
    riskReward: 2.1
  },
  {
    id: 2,
    symbol: 'TSLA',
    action: 'SELL',
    price: 238.50,
    targetPrice: 220.00,
    stopLoss: 248.75,
    confidence: 92,
    timeframe: '4H',
    strategy: 'Mean Reversion',
    timestamp: '2024-01-15 09:28:42',
    status: 'active',
    potentialReturn: 7.8,
    riskReward: 1.8
  },
  {
    id: 3,
    symbol: 'NVDA',
    action: 'BUY',
    price: 465.25,
    targetPrice: 485.00,
    stopLoss: 450.30,
    confidence: 79,
    timeframe: '1H',
    strategy: 'Technical Breakout',
    timestamp: '2024-01-15 09:25:18',
    status: 'active',
    potentialReturn: 4.2,
    riskReward: 1.3
  },
  {
    id: 4,
    symbol: 'MSFT',
    action: 'BUY',
    price: 325.80,
    targetPrice: 340.25,
    stopLoss: 315.50,
    confidence: 84,
    timeframe: '2H',
    strategy: 'Earnings Play',
    timestamp: '2024-01-15 09:20:33',
    status: 'executed',
    potentialReturn: 4.4,
    riskReward: 1.4
  },
  {
    id: 5,
    symbol: 'GOOGL',
    action: 'SELL',
    price: 142.10,
    targetPrice: 135.75,
    stopLoss: 146.80,
    confidence: 76,
    timeframe: '30M',
    strategy: 'Scalping',
    timestamp: '2024-01-15 09:15:27',
    status: 'expired',
    potentialReturn: 4.5,
    riskReward: 1.4
  }
]

const signalStats = {
  totalSignals: 1247,
  activeSignals: 23,
  successRate: 73.2,
  avgReturn: 4.8,
  todaySignals: 12,
  executedToday: 8
}

export default function SignalsDashboardClient() {
  const [selectedSignal, setSelectedSignal] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterStrategy, setFilterStrategy] = useState('all')
  const [autoExecute, setAutoExecute] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const executeSignal = async (signal: any) => {
    setIsExecuting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsExecuting(false)
    setSelectedSignal(null)
  }

  const filteredSignals = liveSignals.filter(signal => {
    if (filterStatus !== 'all' && signal.status !== filterStatus) return false
    if (filterStrategy !== 'all' && signal.strategy !== filterStrategy) return false
    return true
  })

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] bg-clip-text text-transparent">
              Live Trading Signals
            </h1>
            <p className="text-gray-400 mt-1">Real-time signals with execution capabilities</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant={autoExecute ? "default" : "outline"} 
              size="sm" 
              onClick={() => setAutoExecute(!autoExecute)}
              className={autoExecute ? "bg-[#B8FF00] text-black" : "border-gray-700"}
            >
              <Zap className="w-4 h-4 mr-2" />
              Auto Execute
            </Button>
            
            <Button variant="outline" size="sm" className="border-gray-700">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            
            <Button variant="outline" size="sm" className="border-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Signal Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total Signals</p>
                <p className="text-2xl font-bold">{signalStats.totalSignals}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Active Now</p>
                <p className="text-2xl font-bold text-[#B8FF00]">{signalStats.activeSignals}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-[#B8FF00]">{signalStats.successRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Avg Return</p>
                <p className="text-2xl font-bold">{signalStats.avgReturn}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Today's Signals</p>
                <p className="text-2xl font-bold">{signalStats.todaySignals}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Executed Today</p>
                <p className="text-2xl font-bold text-[#B8FF00]">{signalStats.executedToday}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filters:</span>
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStrategy} onValueChange={setFilterStrategy}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strategies</SelectItem>
                  <SelectItem value="Momentum Breakout">Momentum Breakout</SelectItem>
                  <SelectItem value="Mean Reversion">Mean Reversion</SelectItem>
                  <SelectItem value="Technical Breakout">Technical Breakout</SelectItem>
                  <SelectItem value="Earnings Play">Earnings Play</SelectItem>
                  <SelectItem value="Scalping">Scalping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Signals List */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Live Signals Feed</CardTitle>
            <CardDescription>Real-time trading signals from our algorithms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSignals.map((signal) => (
                <div 
                  key={signal.id} 
                  className="border border-gray-800 rounded-lg p-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold">{signal.symbol}</span>
                        <Badge 
                          variant="outline" 
                          className={`${signal.action === 'BUY' ? 'border-[#B8FF00] text-[#B8FF00]' : 'border-red-500 text-red-500'}`}
                        >
                          {signal.action}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${
                            signal.status === 'active' ? 'border-[#B8FF00] text-[#B8FF00]' :
                            signal.status === 'executed' ? 'border-blue-500 text-blue-500' :
                            'border-gray-500 text-gray-500'
                          }`}
                        >
                          {signal.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Entry:</span>
                          <span className="ml-2 font-medium">${signal.price}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Target:</span>
                          <span className="ml-2 font-medium text-[#B8FF00]">${signal.targetPrice}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Stop Loss:</span>
                          <span className="ml-2 font-medium text-red-500">${signal.stopLoss}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">R/R:</span>
                          <span className="ml-2 font-medium">{signal.riskReward}:1</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {signal.confidence}% confidence
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {signal.timeframe}
                        </span>
                        <span>{signal.strategy}</span>
                        <span>{signal.timestamp}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Potential Return</div>
                        <div className="font-bold text-[#B8FF00]">+{signal.potentialReturn}%</div>
                      </div>
                      
                      {signal.status === 'active' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                              onClick={() => setSelectedSignal(signal)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Execute
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-800">
                            <DialogHeader>
                              <DialogTitle>Execute Signal</DialogTitle>
                              <DialogDescription>
                                Review and execute the trading signal for {selectedSignal?.symbol}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedSignal && (
                              <div className="space-y-4">
                                <Alert className="bg-blue-900/20 border-blue-700">
                                  <AlertDescription className="text-blue-300">
                                    <strong>{selectedSignal.action}</strong> {selectedSignal.symbol} at ${selectedSignal.price}
                                  </AlertDescription>
                                </Alert>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input 
                                      id="quantity" 
                                      placeholder="100" 
                                      className="bg-gray-800 border-gray-700"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="orderType">Order Type</Label>
                                    <Select defaultValue="market">
                                      <SelectTrigger className="bg-gray-800 border-gray-700">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="market">Market</SelectItem>
                                        <SelectItem value="limit">Limit</SelectItem>
                                        <SelectItem value="stop">Stop</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Target Price:</span>
                                    <span className="text-[#B8FF00]">${selectedSignal.targetPrice}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Stop Loss:</span>
                                    <span className="text-red-500">${selectedSignal.stopLoss}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Risk/Reward:</span>
                                    <span>{selectedSignal.riskReward}:1</span>
                                  </div>
                                </div>
                                
                                <div className="flex gap-3">
                                  <Button 
                                    onClick={() => executeSignal(selectedSignal)}
                                    disabled={isExecuting}
                                    className="flex-1 bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                                  >
                                    {isExecuting ? 'Executing...' : 'Execute Trade'}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setSelectedSignal(null)}
                                    className="border-gray-700"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
