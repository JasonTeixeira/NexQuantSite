"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { PerformanceDataPoint, BotPerformance } from "@/lib/dashboard-data"

interface PerformanceSectionProps {
  data: PerformanceDataPoint[]
  selectedBot: BotPerformance | null
  timeframe: string
  onTimeframeChange: (timeframe: string) => void
  viewMode: "bots" | "signals" | "combined"
}

export default function PerformanceSection({
  data,
  selectedBot,
  timeframe,
  onTimeframeChange,
  viewMode,
}: PerformanceSectionProps) {
  const timeframes = ["1D", "1W", "1M", "3M", "1Y"]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}%`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-primary/30 rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-mono" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Mock performance metrics based on view mode
  const getMetrics = () => {
    if (viewMode === "signals") {
      return {
        totalPnl: 67420.5,
        winRate: 69,
        totalTrades: 1456,
        avgReturn: 12.3,
        change: 1.8,
      }
    }
    return {
      totalPnl: selectedBot ? 25000 : 91741,
      winRate: selectedBot ? selectedBot.winRate : 82,
      totalTrades: selectedBot ? selectedBot.trades : 1923,
      avgReturn: 15.7,
      change: -0.57,
    }
  }

  const metrics = getMetrics()

  const getTitle = () => {
    if (selectedBot) return `${selectedBot.name.toUpperCase()} PERFORMANCE`
    if (viewMode === "signals") return "FUTURES SIGNAL PERFORMANCE"
    return "BOT PERFORMANCE METRICS"
  }

  return (
    <Card className="bg-black/40 border-primary/30 shadow-[0_0_20px_rgba(0,255,68,0.1)] backdrop-blur-sm relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-400/5 animate-pulse" />

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-bold text-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {getTitle()}
          </CardTitle>
          <div className="flex items-center gap-2">
            {metrics.change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-sm font-mono ${metrics.change >= 0 ? "text-primary" : "text-red-400"}`}>
              {formatPercent(metrics.change)}
            </span>
          </div>
        </div>

        {/* Time Selector */}
        <div className="flex gap-1 bg-black/50 p-1 rounded-lg w-fit">
          {timeframes.map((period) => (
            <button
              key={period}
              onClick={() => onTimeframeChange(period)}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${
                timeframe === period
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "text-gray-400 hover:text-primary hover:bg-primary/10"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Chart */}
        <div className="h-[350px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00FF88"
                strokeWidth={3}
                fill="url(#performanceGradient)"
                dot={false}
                activeDot={{ r: 6, fill: "#00FF88", strokeWidth: 2, stroke: "#000" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className="bg-black/50 border border-primary/20 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">Total P&L</p>
            <p className={`text-xl font-bold font-mono ${metrics.totalPnl >= 0 ? "text-primary" : "text-red-400"}`}>
              {formatCurrency(metrics.totalPnl)}
            </p>
          </motion.div>

          <motion.div
            className="bg-black/50 border border-primary/20 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">Win Rate</p>
            <p className="text-xl font-bold font-mono text-white">{metrics.winRate}%</p>
          </motion.div>

          <motion.div
            className="bg-black/50 border border-primary/20 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">Total Trades</p>
            <p className="text-xl font-bold font-mono text-white">{metrics.totalTrades}</p>
          </motion.div>

          <motion.div
            className="bg-black/50 border border-primary/20 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">Monthly ROI</p>
            <p className="text-xl font-bold font-mono text-primary">+{metrics.avgReturn}%</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
