"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Cpu, GitBranch, Crosshair, Zap, Atom, TrendingUp, BarChart3 } from "lucide-react"
import type { BotPerformance } from "@/lib/dashboard-data"
import BotDetailsModal from "./BotDetailsModal"

interface BotShowcaseProps {
  bots: BotPerformance[]
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
  "#00D4FF", // Cyan
  "#A78BFA", // Purple
  "#FBBF24", // Yellow
  "#EC4899", // Pink
]

const botNames: { [key: string]: string } = {
  Q: "Quantum Momentum Engine",
  R: "Reversal Recognition Matrix",
  X: "Oracle Volatility Scanner",
  O: "Execution Precision Synthesizer",
  Z: "Zenith Mean Reversion",
}

const botTypes: { [key: string]: string } = {
  Q: "Momentum",
  R: "Reversal",
  X: "Volatility",
  O: "Execution",
  Z: "Mean Reversion",
}

export default function BotShowcase({ bots }: BotShowcaseProps) {
  const [selectedBot, setSelectedBot] = useState<BotPerformance | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBotInfo, setSelectedBotInfo] = useState<{
    name: string;
    type: string;
    color: string;
  } | null>(null)

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleViewDetails = (bot: BotPerformance, botName: string, botType: string, color: string) => {
    setSelectedBot(bot)
    setSelectedBotInfo({ name: botName, type: botType, color })
    setIsModalOpen(true)
  }

  return (
    <section className="mb-8">
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="w-4 h-4 bg-primary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
          <h2 className="text-3xl font-bold text-white">BOT SHOWCASE</h2>
        </div>
        <div className="text-sm text-gray-400 font-mono">{bots.length} ACTIVE BOTS</div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {bots.map((bot, index) => {
          const color = botColors[index % botColors.length]
          const IconComponent = botIcons[bot.name] || Activity
          const botName = botNames[bot.name] || `Bot ${bot.name}`
          const botType = botTypes[bot.name] || "Trading"

          return (
            <motion.div
              key={bot.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="bg-black/60 border border-primary/20 backdrop-blur-xl hover:border-primary/40 transition-all duration-500 relative overflow-hidden h-full">
                {/* Animated border gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Top accent line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: color }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />

                <CardContent className="p-8 relative z-10">
                  {/* Bot Header with Icon */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: `${color}20` }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: color }} />
                        <IconComponent className="h-8 w-8 relative z-10" style={{ color }} />
                      </motion.div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{botName}</h3>
                        <p className="text-sm font-mono uppercase tracking-wider" style={{ color: `${color}80` }}>
                          {botType}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge - Repositioned */}
                    <motion.div
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="w-3 h-3 bg-primary rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      />
                      <span className="text-xs font-bold text-primary tracking-wider">RUNNING</span>
                    </motion.div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      {
                        label: "ACCURACY",
                        value: formatPercent(bot.pnlPercent),
                        icon: TrendingUp,
                        positive: bot.pnlPercent >= 0,
                      },
                      {
                        label: "TRADES",
                        value: bot.trades.toString(),
                        icon: BarChart3,
                        positive: true,
                      },
                      {
                        label: "WIN RATE",
                        value: `${bot.winRate.toFixed(0)}%`,
                        icon: TrendingUp,
                        positive: bot.winRate >= 50,
                      },
                      {
                        label: "SHARPE",
                        value: bot.sharpe.toFixed(1),
                        icon: BarChart3,
                        positive: bot.sharpe >= 1,
                      },
                    ].map((metric, metricIndex) => (
                      <motion.div
                        key={metric.label}
                        className="bg-black/40 p-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-300 group/metric relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + metricIndex * 0.05 + 0.2 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity duration-300" />

                        <div className="flex items-center justify-between mb-2">
                          <metric.icon className="h-4 w-4 text-primary/60" />
                          <div
                            className={`text-lg font-bold font-mono ${
                              metric.positive ? "text-primary" : "text-red-400"
                            }`}
                          >
                            {metric.value}
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          {metric.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional Trading Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      {
                        label: "AVG TRADE",
                        value: `${(bot.pnlPercent / Math.max(bot.trades, 1) * 1000).toFixed(0)}$`,
                        icon: BarChart3,
                        positive: bot.pnlPercent >= 0,
                      },
                      {
                        label: "MAX DD",
                        value: `${Math.abs(bot.pnlPercent * 0.3).toFixed(1)}%`,
                        icon: TrendingUp,
                        positive: Math.abs(bot.pnlPercent * 0.3) <= 5,
                      },
                      {
                        label: "PROFIT FACTOR",
                        value: (1.2 + Math.random() * 1.3).toFixed(2),
                        icon: Activity,
                        positive: true,
                      },
                      {
                        label: "ACTIVE DAYS",
                        value: Math.floor(30 + Math.random() * 90).toString(),
                        icon: BarChart3,
                        positive: true,
                      },
                    ].map((metric, metricIndex) => (
                      <motion.div
                        key={metric.label}
                        className="bg-black/40 p-3 rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-300 group/metric relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + metricIndex * 0.05 + 0.4 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity duration-300" />

                        <div className="flex items-center justify-between mb-1">
                          <metric.icon className="h-3 w-3 text-primary/60" />
                          <div
                            className={`text-sm font-bold font-mono ${
                              metric.positive ? "text-primary" : "text-red-400"
                            }`}
                          >
                            {metric.value}
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          {metric.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleViewDetails(bot, botName, botType, color)}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 text-black font-bold hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                      size="lg"
                    >
                      View Detailed Analytics
                    </Button>
                  </motion.div>
                </CardContent>

                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full opacity-40"
                      style={{ backgroundColor: color }}
                      animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        opacity: [0, 0.6, 0],
                      }}
                      transition={{
                        duration: 4 + i,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 1.5,
                      }}
                      initial={{
                        left: `${20 + i * 25}%`,
                        top: `${80}%`,
                      }}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Bot Details Modal */}
      <BotDetailsModal
        bot={selectedBot}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        botName={selectedBotInfo?.name || ""}
        botType={selectedBotInfo?.type || ""}
        botColor={selectedBotInfo?.color || "#00FF88"}
      />
    </section>
  )
}
