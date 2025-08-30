"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, Cpu, GitBranch, Crosshair, Zap, Atom } from "lucide-react"

interface BotPerformance {
  name: string
  status: "Active" | "Paused" | "Stopped"
  pnl: number
  pnlPercent: number
  sharpe: number
  maxDrawdown: number
  winRate: number
  trades: number
  performanceHistory: Array<{ date: string; value: number }>
}

interface BotPerformanceTableProps {
  data: BotPerformance[]
  onSelectBot: (bot: BotPerformance) => void
  selectedBotName?: string
}

const botIcons: { [key: string]: React.ElementType } = {
  Q: Cpu,
  R: GitBranch,
  X: Crosshair,
  O: Zap,
  Z: Atom,
}

export default function BotPerformanceTable({ data, onSelectBot, selectedBotName }: BotPerformanceTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}%`
  }

  return (
    <Card className="bg-black border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-bold text-xl">
            BOT <span className="text-primary">PERFORMANCE</span>
          </CardTitle>
          <p className="text-gray-400 text-sm font-mono">24H METRICS</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {data.map((bot) => {
            const BotIcon = botIcons[bot.name] || Activity
            const isSelected = bot.name === selectedBotName

            return (
              <div
                key={bot.name}
                onClick={() => onSelectBot(bot)}
                className={`bg-black/50 border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${
                  isSelected ? "border-primary" : "border-primary/20"
                }`}
              >
                {/* Bot Icon and Performance Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-black border border-primary/30 rounded-lg flex items-center justify-center">
                    <BotIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    {bot.pnlPercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-primary" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span
                      className={`text-sm font-mono font-bold ${bot.pnlPercent >= 0 ? "text-primary" : "text-red-400"}`}
                    >
                      {formatPercent(bot.pnlPercent)}
                    </span>
                  </div>
                </div>

                {/* Bot Performance Chart Area (Placeholder) */}
                <div className="h-16 mb-4 bg-black/30 rounded border border-primary/10 flex items-center justify-center">
                  <div className="text-xs text-gray-500 font-mono">CHART</div>
                </div>

                {/* Bot Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-mono uppercase">P&L</span>
                    <span className={`text-sm font-bold font-mono ${bot.pnl >= 0 ? "text-primary" : "text-red-400"}`}>
                      {formatCurrency(bot.pnl)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-mono uppercase">Win Rate</span>
                    <span className="text-sm font-mono text-white">{bot.winRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
