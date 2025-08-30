"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, TrendingDown, Activity, BarChart3, PieChart, Clock, 
  DollarSign, Target, Shield, Zap, Brain, AlertTriangle, Calendar,
  LineChart, X, ArrowUpCircle, ArrowDownCircle
} from "lucide-react"
import type { BotPerformance } from "@/lib/dashboard-data"
import BotPerformanceChart from "./BotPerformanceChart"

interface BotDetailsModalProps {
  bot: BotPerformance | null
  isOpen: boolean
  onClose: () => void
  botName: string
  botType: string
  botColor: string
}

const formatPercent = (value: number, decimals: number = 1) => {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(decimals)}%`
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function BotDetailsModal({ 
  bot, isOpen, onClose, botName, botType, botColor 
}: BotDetailsModalProps) {
  if (!bot) return null

  // Generate comprehensive mock data for demonstration
  const detailedMetrics = {
    // Core Performance
    totalReturn: bot.pnlPercent,
    sharpeRatio: bot.sharpe,
    sortinoRatio: bot.sharpe * 1.2,
    calmarRatio: bot.sharpe * 0.8,
    maxDrawdown: Math.abs(bot.pnlPercent) * 0.3,
    volatility: Math.abs(bot.pnlPercent) * 0.7,
    winRate: bot.winRate,
    profitFactor: 1.8,
    
    // Trading Stats
    totalTrades: bot.trades,
    winningTrades: Math.floor(bot.trades * (bot.winRate / 100)),
    losingTrades: bot.trades - Math.floor(bot.trades * (bot.winRate / 100)),
    avgWin: 145.50,
    avgLoss: -89.30,
    avgTradeTime: "4h 23m",
    
    // Risk Metrics
    valueAtRisk: 2.1,
    expectedShortfall: 3.8,
    beta: 0.85,
    alpha: 4.2,
    correlation: 0.23,
    
    // Time-based Performance
    mtdReturn: 8.7,
    qtdReturn: 22.1,
    ytdReturn: 67.3,
    
    // Strategy Details
    algorithm: getAlgorithmDetails(botType),
    indicators: getIndicators(botType),
    timeframe: "5m, 15m, 1h",
    markets: ["FOREX", "CRYPTO", "STOCKS"],
    
    // Recent Trades (mock data)
    recentTrades: [
      { symbol: "EUR/USD", type: "BUY", pnl: 127.50, time: "2h ago", duration: "45m" },
      { symbol: "BTC/USD", type: "SELL", pnl: -89.20, time: "4h ago", duration: "1h 15m" },
      { symbol: "AAPL", type: "BUY", pnl: 203.80, time: "6h ago", duration: "2h 30m" },
      { symbol: "GBP/JPY", type: "SELL", pnl: 156.90, time: "8h ago", duration: "1h 05m" },
      { symbol: "ETH/USD", type: "BUY", pnl: -67.40, time: "10h ago", duration: "3h 20m" }
    ]
  }

  function getAlgorithmDetails(type: string) {
    const algorithms = {
      "Momentum": "Advanced MACD crossover with RSI divergence and volume confirmation",
      "Reversal": "Mean reversion using Bollinger Bands and stochastic oscillator patterns",
      "Volatility": "VIX-based volatility breakout with dynamic stop-loss management", 
      "Execution": "Smart order routing with VWAP optimization and slippage minimization",
      "Mean Reversion": "Statistical arbitrage using Z-score analysis and Kalman filtering"
    }
    return algorithms[type] || "Multi-factor quantitative trading algorithm"
  }

  function getIndicators(type: string) {
    const indicators = {
      "Momentum": ["MACD", "RSI", "Volume Profile", "EMA Crossover"],
      "Reversal": ["Bollinger Bands", "Stochastic", "Williams %R", "CCI"],
      "Volatility": ["VIX", "ATR", "Bollinger Width", "Volatility Ratio"],
      "Execution": ["VWAP", "TWAP", "Order Book", "Market Impact"],
      "Mean Reversion": ["Z-Score", "Cointegration", "Kalman Filter", "Statistical Models"]
    }
    return indicators[type] || ["RSI", "MACD", "EMA", "Volume"]
  }

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = "primary" 
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    trend?: "up" | "down" | "neutral"
    color?: string
  }) => (
    <Card className="bg-black/40 border border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Icon className="h-5 w-5 text-primary/60" />
          {trend && (
            <div className={`flex items-center gap-1 ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend === 'up' && <ArrowUpCircle className="h-4 w-4" />}
              {trend === 'down' && <ArrowDownCircle className="h-4 w-4" />}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400 uppercase tracking-wider">{title}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-black/95 border border-primary/30 backdrop-blur-xl">
            <DialogHeader className="border-b border-primary/20 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${botColor}20` }}
                  >
                    <Activity className="h-6 w-6" style={{ color: botColor }} />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">{botName}</DialogTitle>
                    <p className="text-sm text-primary/80 font-mono uppercase tracking-wider">{botType} STRATEGY</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    LIVE
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-primary/20">
              <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-primary/20">
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="strategy">Strategy</TabsTrigger>
                  <TabsTrigger value="trades">Recent Trades</TabsTrigger>
                  <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-6 mt-6">
                  {/* Comprehensive Performance Chart */}
                  <BotPerformanceChart
                    bot={bot}
                    botName={botName}
                    botType={botType}
                    botColor={botColor}
                  />

                  {/* Key Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      title="Total Return"
                      value={formatPercent(detailedMetrics.totalReturn)}
                      icon={TrendingUp}
                      trend={detailedMetrics.totalReturn >= 0 ? "up" : "down"}
                    />
                    <MetricCard
                      title="Sharpe Ratio"
                      value={detailedMetrics.sharpeRatio.toFixed(2)}
                      subtitle="Risk-adjusted return"
                      icon={Target}
                      trend={detailedMetrics.sharpeRatio >= 1 ? "up" : "neutral"}
                    />
                    <MetricCard
                      title="Max Drawdown"
                      value={formatPercent(-Math.abs(detailedMetrics.maxDrawdown))}
                      subtitle="Largest peak-to-trough decline"
                      icon={TrendingDown}
                      trend="down"
                    />
                    <MetricCard
                      title="Win Rate"
                      value={`${detailedMetrics.winRate.toFixed(1)}%`}
                      subtitle={`${detailedMetrics.winningTrades} / ${detailedMetrics.totalTrades} trades`}
                      icon={Target}
                      trend={detailedMetrics.winRate >= 60 ? "up" : "neutral"}
                    />
                  </div>

                  {/* Advanced Metrics */}
                  <Card className="bg-black/40 border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Advanced Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <div className="text-sm text-gray-400 mb-2">SORTINO RATIO</div>
                          <div className="text-xl font-bold text-white">{detailedMetrics.sortinoRatio.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Downside deviation adjusted</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-2">CALMAR RATIO</div>
                          <div className="text-xl font-bold text-white">{detailedMetrics.calmarRatio.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Return vs max drawdown</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-2">PROFIT FACTOR</div>
                          <div className="text-xl font-bold text-white">{detailedMetrics.profitFactor.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Gross profit / Gross loss</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-2">VOLATILITY</div>
                          <div className="text-xl font-bold text-white">{detailedMetrics.volatility.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Annual volatility</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-2">ALPHA</div>
                          <div className="text-xl font-bold text-primary">{formatPercent(detailedMetrics.alpha, 1)}</div>
                          <div className="text-xs text-gray-500">Excess return vs benchmark</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-2">BETA</div>
                          <div className="text-xl font-bold text-white">{detailedMetrics.beta.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Market correlation</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time-based Performance */}
                  <Card className="bg-black/40 border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Performance by Period
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-black/20 rounded-lg border border-primary/10">
                          <div className="text-2xl font-bold text-white mb-2">{formatPercent(detailedMetrics.mtdReturn)}</div>
                          <div className="text-sm text-gray-400">Month to Date</div>
                        </div>
                        <div className="text-center p-4 bg-black/20 rounded-lg border border-primary/10">
                          <div className="text-2xl font-bold text-white mb-2">{formatPercent(detailedMetrics.qtdReturn)}</div>
                          <div className="text-sm text-gray-400">Quarter to Date</div>
                        </div>
                        <div className="text-center p-4 bg-black/20 rounded-lg border border-primary/10">
                          <div className="text-2xl font-bold text-primary mb-2">{formatPercent(detailedMetrics.ytdReturn)}</div>
                          <div className="text-sm text-gray-400">Year to Date</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="strategy" className="space-y-6 mt-6">
                  <Card className="bg-black/40 border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Algorithm Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-400 mb-2">STRATEGY DESCRIPTION</div>
                          <div className="text-white">{detailedMetrics.algorithm}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm text-gray-400 mb-2">TECHNICAL INDICATORS</div>
                            <div className="flex flex-wrap gap-2">
                              {detailedMetrics.indicators.map((indicator, i) => (
                                <Badge key={i} variant="outline" className="text-primary border-primary/30">
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400 mb-2">TIMEFRAMES</div>
                            <div className="text-white font-mono">{detailedMetrics.timeframe}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-2">SUPPORTED MARKETS</div>
                          <div className="flex gap-2">
                            {detailedMetrics.markets.map((market, i) => (
                              <Badge key={i} className="bg-primary/20 text-primary">
                                {market}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-black/40 border border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          Trade Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Average Win</span>
                          <span className="text-green-400 font-mono">{formatCurrency(detailedMetrics.avgWin)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Average Loss</span>
                          <span className="text-red-400 font-mono">{formatCurrency(detailedMetrics.avgLoss)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Avg Trade Time</span>
                          <span className="text-white font-mono">{detailedMetrics.avgTradeTime}</span>
                        </div>
                        <div className="pt-4 border-t border-primary/20">
                          <div className="text-sm text-gray-400 mb-2">WIN/LOSS DISTRIBUTION</div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-green-400">Wins: {detailedMetrics.winningTrades}</span>
                                <span className="text-red-400">Losses: {detailedMetrics.losingTrades}</span>
                              </div>
                              <Progress 
                                value={detailedMetrics.winRate} 
                                className="h-2 bg-red-900/30"
                                style={{ 
                                  background: `linear-gradient(90deg, #10b981 0%, #10b981 ${detailedMetrics.winRate}%, #dc2626 ${detailedMetrics.winRate}%, #dc2626 100%)`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/40 border border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          Execution Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Avg Slippage</span>
                          <span className="text-white font-mono">-0.12 pips</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Fill Rate</span>
                          <span className="text-primary font-mono">99.8%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Avg Execution</span>
                          <span className="text-white font-mono">0.023s</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Latency</span>
                          <span className="text-primary font-mono">2.1ms</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="trades" className="space-y-6 mt-6">
                  <Card className="bg-black/40 border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-primary" />
                        Recent Trading Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {detailedMetrics.recentTrades.map((trade, i) => (
                          <motion.div 
                            key={i}
                            className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-primary/10 hover:border-primary/30 transition-all duration-300"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.type}
                              </div>
                              <div>
                                <div className="text-white font-semibold">{trade.symbol}</div>
                                <div className="text-xs text-gray-400">{trade.time} • Duration: {trade.duration}</div>
                              </div>
                            </div>
                            <div className={`text-lg font-bold font-mono ${
                              trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(trade.pnl)}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="risk" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard
                      title="Value at Risk (95%)"
                      value={`${detailedMetrics.valueAtRisk}%`}
                      subtitle="Maximum expected loss"
                      icon={Shield}
                      trend="down"
                    />
                    <MetricCard
                      title="Expected Shortfall"
                      value={`${detailedMetrics.expectedShortfall}%`}
                      subtitle="Average loss beyond VaR"
                      icon={AlertTriangle}
                      trend="down"
                    />
                  </div>

                  <Card className="bg-black/40 border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-400">Risk Level</span>
                              <span className="text-yellow-400">MODERATE</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-400">Leverage Usage</span>
                              <span className="text-white">2.5x</span>
                            </div>
                            <Progress value={25} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-400">Position Size</span>
                              <span className="text-white">3.2%</span>
                            </div>
                            <Progress value={32} className="h-2" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Market Correlation</span>
                            <span className="text-white font-mono">{detailedMetrics.correlation.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Stop Loss</span>
                            <span className="text-white font-mono">2.5%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Take Profit</span>
                            <span className="text-white font-mono">7.5%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Risk/Reward</span>
                            <span className="text-primary font-mono">1:3</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
