"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PerformanceData {
  date: string
  value: number
  benchmark?: number
}

interface PerformanceOverviewProps {
  data: PerformanceData[]
  botName?: string
  timeframe?: string
}

export default function PerformanceOverview({ data, botName, timeframe = "24H" }: PerformanceOverviewProps) {
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
        <div className="bg-black border border-primary/30 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Mock performance metrics
  const totalPnl = -3240.5
  const winRate = 78.5
  const totalTrades = 189
  const avgReturn = 15.2

  const performanceChange = -0.57

  return (
    <Card className="bg-black border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-bold text-xl">
            {timeframe} HOUR <span className="text-primary">PERFORMANCE</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {performanceChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-sm font-mono ${performanceChange >= 0 ? "text-primary" : "text-red-400"}`}>
              {formatPercent(performanceChange)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  // Format time for 24H view
                  if (timeframe === "24H") {
                    return value.split(" ")[1] || value
                  }
                  return value
                }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00FF88"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#00FF88" }}
                name="Portfolio Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">Total P&L</p>
            <p className={`text-lg font-bold font-mono ${totalPnl >= 0 ? "text-primary" : "text-red-400"}`}>
              {formatCurrency(totalPnl)}
            </p>
          </div>
          <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">Win Rate</p>
            <p className="text-lg font-bold font-mono text-white">{winRate}%</p>
          </div>
          <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">Total Trades</p>
            <p className="text-lg font-bold font-mono text-white">{totalTrades}</p>
          </div>
          <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">Avg Return</p>
            <p className="text-lg font-bold font-mono text-primary">+{avgReturn}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
