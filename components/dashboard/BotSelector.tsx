"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Cpu, GitBranch, Crosshair, Zap, Atom } from "lucide-react"
import type { BotPerformance } from "@/lib/dashboard-data"

interface BotSelectorProps {
  bots: BotPerformance[]
  selectedBot: BotPerformance | null
  onSelectBot: (bot: BotPerformance | null) => void
  viewMode: "bots" | "signals" | "combined"
}

const botIcons: { [key: string]: React.ElementType } = {
  Q: Cpu,
  R: GitBranch,
  X: Crosshair,
  O: Zap,
  Z: Atom,
}

const botColors = [
  "#00FF88", // Primary green
  "#00D4FF", // Blue
  "#A78BFA", // Purple
  "#FBBF24", // Yellow
  "#EC4899", // Pink
  "#FF6B35", // Orange
]

export default function BotSelector({ bots, selectedBot, onSelectBot, viewMode }: BotSelectorProps) {
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  const getTitle = () => {
    if (viewMode === "signals") return "Select Signal"
    return "Select Bot"
  }

  const getItems = () => {
    if (viewMode === "signals") {
      return [
        { id: "all", name: "All Signals", metric: "+69%", icon: "📊" },
        { id: "es", name: "/ES S&P 500", metric: "+75%", icon: "📈" },
        { id: "nq", name: "/NQ NASDAQ", metric: "+72%", icon: "💻" },
        { id: "ym", name: "/YM Dow Jones", metric: "+68%", icon: "🏭" },
        { id: "rty", name: "/RTY Russell", metric: "+65%", icon: "🏪" },
      ]
    }

    return [
      { id: "all", name: "All Bots", metric: "+82%", icon: "📊" },
      ...bots.map((bot, index) => ({
        id: bot.name,
        name:
          bot.name === "Q"
            ? "Quantum Engine"
            : bot.name === "R"
              ? "Reversal Matrix"
              : bot.name === "X"
                ? "Volatility Scanner"
                : bot.name === "O"
                  ? "Execution Precision"
                  : bot.name === "Z"
                    ? "Zenith Mean Rev"
                    : bot.name,
        metric: formatPercent(bot.pnlPercent),
        icon: bot.name,
        bot: bot,
      })),
    ]
  }

  const items = getItems()

  return (
    <Card className="bg-black/40 border-primary/30 shadow-[0_0_20px_rgba(0,255,68,0.1)] backdrop-blur-sm h-fit">
      <CardHeader>
        <CardTitle className="text-white font-bold text-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          {getTitle()}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => {
            const isSelected = item.id === "all" ? !selectedBot : selectedBot?.name === item.id
            const color = botColors[index % botColors.length]
            const IconComponent = typeof item.icon === "string" && botIcons[item.icon] ? botIcons[item.icon] : Activity

            return (
              <motion.div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                  isSelected
                    ? "bg-primary/10 border-primary/50"
                    : "bg-black/50 border-transparent hover:bg-black/70 hover:border-primary/30"
                }`}
                style={{ "--item-color": color } as React.CSSProperties}
                onClick={() => {
                  if (item.id === "all") {
                    onSelectBot(null)
                  } else if ("bot" in item) {
                    onSelectBot(item.bot)
                  }
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {typeof item.icon === "string" && botIcons[item.icon] ? (
                      <IconComponent className="h-5 w-5" />
                    ) : (
                      <span className="text-lg">{item.icon}</span>
                    )}
                  </div>
                  <span className="font-semibold text-white">{item.name}</span>
                </div>
                <span
                  className="font-bold font-mono text-sm"
                  style={{ color: item.metric.startsWith("+") ? color : "#FF3366" }}
                >
                  {item.metric}
                </span>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
