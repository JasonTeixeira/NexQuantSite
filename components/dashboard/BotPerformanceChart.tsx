"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  LineChart, BarChart3, TrendingUp, TrendingDown, 
  Calendar, Target, Activity, DollarSign 
} from "lucide-react"
import type { BotPerformance } from "@/lib/dashboard-data"

interface BotPerformanceChartProps {
  bot: BotPerformance
  botName: string
  botType: string
  botColor: string
}

export default function BotPerformanceChart({ 
  bot, botName, botType, botColor 
}: BotPerformanceChartProps) {
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "30D" | "90D" | "1Y">("30D")

  // Generate realistic performance data based on bot metrics
  const generatePerformanceData = (timeframe: string) => {
    const days = timeframe === "7D" ? 7 : timeframe === "30D" ? 30 : timeframe === "90D" ? 90 : 365
    const data = []
    let cumulative = 0
    const dailyVolatility = Math.abs(bot.pnlPercent) / 100 // Convert to daily volatility
    
    for (let i = 0; i < days; i++) {
      const dailyReturn = (Math.random() - 0.5) * dailyVolatility * 2
      cumulative += dailyReturn
      data.push({
        day: i + 1,
        return: cumulative,
        dailyReturn: dailyReturn,
        volume: Math.floor(Math.random() * 50) + 10,
        drawdown: Math.min(0, cumulative - Math.max(...data.map(d => d?.return || 0), 0))
      })
    }
    
    // Adjust final return to match bot's actual performance
    const finalAdjustment = bot.pnlPercent / 100 - cumulative
    data.forEach((point, i) => {
      point.return += finalAdjustment * (i / days)
    })
    
    return data
  }

  const performanceData = generatePerformanceData(chartTimeframe)
  const maxReturn = Math.max(...performanceData.map(d => d.return))
  const minReturn = Math.min(...performanceData.map(d => d.return))
  const maxDrawdown = Math.min(...performanceData.map(d => d.drawdown))

  // SVG Chart Component
  const EquityCurveChart = ({ data, color, height = 200 }: { 
    data: any[], color: string, height?: number 
  }) => {
    const width = 400
    const padding = 40
    
    const xScale = (day: number) => padding + (day / data.length) * (width - 2 * padding)
    const yScale = (value: number) => height - padding - ((value - minReturn) / (maxReturn - minReturn)) * (height - 2 * padding)
    
    const pathData = data.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(d.day)} ${yScale(d.return)}`
    ).join(' ')

    return (
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + ratio * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + ratio * (height - 2 * padding)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Zero line */}
          <line
            x1={padding}
            y1={yScale(0)}
            x2={width - padding}
            y2={yScale(0)}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          
          {/* Area under curve */}
          <defs>
            <linearGradient id={`gradient-${botType}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          <path
            d={`${pathData} L ${xScale(data[data.length - 1].day)} ${yScale(0)} L ${xScale(1)} ${yScale(0)} Z`}
            fill={`url(#gradient-${botType})`}
          />
          
          {/* Main equity curve */}
          <motion.path
            d={pathData}
            stroke={color}
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Data points */}
          {data.filter((_, i) => i % Math.ceil(data.length / 20) === 0).map((d, i) => (
            <motion.circle
              key={i}
              cx={xScale(d.day)}
              cy={yScale(d.return)}
              r="4"
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="hover:r-6 transition-all cursor-pointer"
            />
          ))}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-10 text-xs text-gray-400">
          <span>{(maxReturn * 100).toFixed(1)}%</span>
          <span>{((maxReturn + minReturn) / 2 * 100).toFixed(1)}%</span>
          <span>{(minReturn * 100).toFixed(1)}%</span>
        </div>
      </div>
    )
  }

  // Drawdown Chart
  const DrawdownChart = ({ data, color, height = 120 }: {
    data: any[], color: string, height?: number
  }) => {
    const width = 400
    const padding = 40
    
    const xScale = (day: number) => padding + (day / data.length) * (width - 2 * padding)
    const yScale = (value: number) => height - padding - ((value / maxDrawdown) * (height - 2 * padding))
    
    const pathData = data.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(d.day)} ${yScale(d.drawdown)}`
    ).join(' ')

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={`dd-gradient-${botType}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <path
          d={`${pathData} L ${xScale(data[data.length - 1].day)} ${height - padding} L ${xScale(1)} ${height - padding} Z`}
          fill={`url(#dd-gradient-${botType})`}
        />
        
        {/* Drawdown line */}
        <motion.path
          d={pathData}
          stroke="#ef4444"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: botColor }}
          />
          <h3 className="text-lg font-bold text-white">
            {botName} Performance Analysis
          </h3>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-primary/20">
          {["7D", "30D", "90D", "1Y"].map((tf) => (
            <Button
              key={tf}
              variant={chartTimeframe === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartTimeframe(tf as any)}
              className={`px-3 py-1 text-xs ${
                chartTimeframe === tf 
                  ? "bg-primary/20 text-primary" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="equity" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-primary/20">
          <TabsTrigger value="equity">Equity Curve</TabsTrigger>
          <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
          <TabsTrigger value="returns">Daily Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="equity">
          <Card className="bg-black/40 border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: botColor }} />
                Strategy Equity Curve
              </CardTitle>
              <div className="flex gap-4 text-sm">
                <Badge className="bg-green-500/20 text-green-400">
                  Total Return: {(bot.pnlPercent).toFixed(2)}%
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400">
                  Sharpe: {bot.sharpe.toFixed(2)}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400">
                  Win Rate: {bot.winRate.toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <EquityCurveChart data={performanceData} color={botColor} />
              
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-primary/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {performanceData.length}
                  </div>
                  <div className="text-xs text-gray-400">Trading Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {(maxReturn * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400">Peak Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {(maxDrawdown * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400">Max Drawdown</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {((maxReturn - maxDrawdown) / Math.abs(maxDrawdown)).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">Recovery Factor</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawdown">
          <Card className="bg-black/40 border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                Drawdown Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DrawdownChart data={performanceData} color={botColor} />
              
              <div className="mt-4 text-sm text-gray-400">
                <p>Maximum drawdown represents the largest peak-to-trough decline in your strategy's equity curve. Lower drawdowns indicate better risk management.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          <Card className="bg-black/40 border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" style={{ color: botColor }} />
                Daily Returns Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Returns Histogram */}
              <div className="h-40 flex items-end justify-center gap-1">
                {performanceData.slice(-20).map((d, i) => (
                  <motion.div
                    key={i}
                    className={`w-4 rounded-t ${
                      d.dailyReturn >= 0 ? 'bg-green-400/60' : 'bg-red-400/60'
                    }`}
                    style={{ 
                      height: `${Math.abs(d.dailyReturn) * 2000 + 20}px`,
                      maxHeight: '120px'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.abs(d.dailyReturn) * 2000 + 20}px` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  />
                ))}
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Avg Daily Return:</span>
                  <span className="ml-2 text-white font-mono">
                    {(performanceData.reduce((sum, d) => sum + d.dailyReturn, 0) / performanceData.length * 100).toFixed(3)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Daily Volatility:</span>
                  <span className="ml-2 text-white font-mono">
                    {(Math.sqrt(performanceData.reduce((sum, d) => sum + d.dailyReturn * d.dailyReturn, 0) / performanceData.length) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
