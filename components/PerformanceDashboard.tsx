"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Cpu,
  GitBranch,
  Crosshair,
  Zap,
  Atom,
  Activity,
  DollarSign,
  BarChart,
  Clock,
} from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

// Static data for initial render (prevents hydration mismatch)
const getStaticChartData = () => {
  const data = []
  let value = 50000
  for (let i = 24; i >= 0; i--) {
    // Use deterministic values for initial render
    value += Math.sin(i * 0.3) * 500
    data.push({ time: `${i}h ago`, value: value.toFixed(2) })
  }
  return data.reverse()
}

const generateChartData = () => {
  const data = []
  let value = 50000
  for (let i = 24; i >= 0; i--) {
    value += (Math.random() - 0.48) * 1000
    data.push({ time: `${i}h ago`, value: value.toFixed(2) })
  }
  return data.reverse()
}

const initialBotStats = [
  { name: "Q", icon: Cpu, pnl: 1245.67, winRate: 78.2 },
  { name: "R", icon: GitBranch, pnl: 987.12, winRate: 85.1 },
  { name: "X", icon: Crosshair, pnl: 2103.45, winRate: 92.5 },
  { name: "O", icon: Zap, pnl: -350.88, winRate: 65.7 },
  { name: "Z", icon: Atom, pnl: 1854.21, winRate: 88.9 },
]

// Static signals for initial render
const getStaticSignals = () => [
  { id: "static-1", pair: "ES", direction: "LONG" as const, profit: "2.1", time: "Just now" },
  { id: "static-2", pair: "NQ", direction: "SHORT" as const, profit: "-0.8", time: "2m ago" },
  { id: "static-3", pair: "YM", direction: "LONG" as const, profit: "1.5", time: "5m ago" },
  { id: "static-4", pair: "RTY", direction: "SHORT" as const, profit: "0.3", time: "8m ago" },
  { id: "static-5", pair: "ES", direction: "LONG" as const, profit: "1.9", time: "10m ago" },
]

const generateSignal = () => ({
  id: `signal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  pair: ["ES", "NQ", "YM", "RTY"][Math.floor(Math.random() * 4)],
  direction: (Math.random() > 0.5 ? "LONG" : "SHORT") as "LONG" | "SHORT",
  profit: (Math.random() * 4 - 1).toFixed(2),
  time: "Just now",
})

export default function PerformanceDashboard() {
  // Use static data for initial render to prevent hydration mismatch
  const [chartData, setChartData] = useState(getStaticChartData())
  const [botStats, setBotStats] = useState(initialBotStats)
  const [signals, setSignals] = useState(getStaticSignals())
  const [overallPnl, setOverallPnl] = useState(24532.12)
  const [isClient, setIsClient] = useState(false)

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true)
    // Initialize with random data after hydration
    setChartData(generateChartData())
    setSignals(Array.from({ length: 5 }, generateSignal))
  }, [])

  useEffect(() => {
    // Only start intervals after client-side hydration
    if (!isClient) return
    const interval = setInterval(() => {
      // Update chart
      setChartData((prev) => {
        const newData = [...prev.slice(1)]
        const lastValue = Number.parseFloat(newData[newData.length - 1].value)
        const newValue = lastValue + (Math.random() - 0.48) * 1000
        newData.push({ time: "Now", value: newValue.toFixed(2) })
        return newData
      })

      // Update bot stats
      setBotStats((prev) =>
        prev.map((bot) => ({
          ...bot,
          pnl: bot.pnl + (Math.random() - 0.45) * 20,
        })),
      )

      // Update overall PNL
      setOverallPnl((prev) => prev + (Math.random() - 0.45) * 100)

      // Update signals
      setSignals((prev) => [generateSignal(), ...prev.slice(0, 4)])
    }, 3000)

    return () => clearInterval(interval)
  }, [isClient])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

  return (
    <section id="dashboard" className="py-20 bg-black relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-mono">
            LIVE PERFORMANCE <span className="text-primary">MATRIX</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Real-time data stream from the Nexural trading core.
          </p>
        </motion.div>

        <motion.div
          className="cyberpunk-card border-2 border-primary/30 bg-black/50 backdrop-blur-xl p-4 md:p-8 shadow-[0_0_40px_rgba(184,255,0,0.1)]"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <CardHeader className="flex flex-row items-center justify-between !pb-2">
            <CardTitle className="text-2xl font-mono text-white">SYSTEM STATUS</CardTitle>
            <div className="flex items-center gap-2 text-primary">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span className="font-mono text-sm">LIVE</span>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="font-mono text-lg text-gray-300 mb-4">PORTFOLIO (24H)</h3>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Portfolio Value",
                        color: "hsl(var(--primary))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(184, 255, 0, 0.1)" />
                        <XAxis
                          dataKey="time"
                          stroke="rgba(255,255,255,0.4)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.4)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          content={<ChartTooltipContent />}
                          cursor={{ stroke: "#B8FF00", strokeWidth: 1, strokeDasharray: "3 3" }}
                          wrapperClassName="cyberpunk-card !bg-black/80 !border-primary/50"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="url(#line-gradient)"
                          strokeWidth={2}
                          dot={false}
                        />
                        <defs>
                          <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#B8FF00" />
                            <stop offset="100%" stopColor="#50ff88" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
              <div className="lg:col-span-1 space-y-6">
                <div className="cyberpunk-card border border-gray-800 p-4">
                  <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                    <DollarSign size={16} /> 24H P&L
                  </p>
                  <p className={cn("text-3xl font-bold font-mono", overallPnl >= 0 ? "text-primary" : "text-red-500")}>
                    {formatCurrency(overallPnl)}
                  </p>
                </div>
                <div className="cyberpunk-card border border-gray-800 p-4">
                  <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                    <Activity size={16} /> WIN RATE
                  </p>
                  <p className="text-3xl font-bold font-mono text-white">81.7%</p>
                </div>
                <div className="cyberpunk-card border border-gray-800 p-4">
                  <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                    <BarChart size={16} /> TRADES (24H)
                  </p>
                  <p className="text-3xl font-bold font-mono text-white">189</p>
                </div>
              </div>
            </div>

            <div className="my-12 border-t border-primary/20" />

            <div className="grid lg:grid-cols-2 gap-8 mt-16">
              <div className="px-1 mx-0">
                <h3 className="font-mono text-lg text-gray-300 mb-4">BOT PERFORMANCE (24H)</h3>
                <div className="space-y-2">
                  {botStats.map((bot) => (
                    <div
                      key={bot.name}
                      className="flex items-center justify-between p-3 bg-gray-900/50 cyberpunk-card border border-transparent hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black flex items-center justify-center cyberpunk-button">
                          <bot.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-mono text-white">{bot.name} Bot</span>
                      </div>
                      <div className={cn("font-mono font-bold", bot.pnl >= 0 ? "text-primary" : "text-red-500")}>
                        {formatCurrency(bot.pnl)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-mono text-lg text-gray-300 mb-4">LIVE SIGNALS FEED</h3>
                <div className="space-y-2">
                  {signals.map((signal) => (
                    <div
                      key={signal.id}
                      className="flex items-center justify-between p-3 bg-gray-900/50 cyberpunk-card border border-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 flex items-center justify-center cyberpunk-button",
                            signal.direction === "LONG" ? "bg-primary/20" : "bg-red-500/20",
                          )}
                        >
                          {signal.direction === "LONG" ? (
                            <TrendingUp className="w-4 h-4 text-primary" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <span className="font-mono text-white">{signal.pair} </span>
                          <span
                            className={cn(
                              "text-xs font-bold",
                              signal.direction === "LONG" ? "text-primary" : "text-red-500",
                            )}
                          >
                            {signal.direction}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "font-mono font-bold",
                            Number.parseFloat(signal.profit) >= 0 ? "text-primary" : "text-red-500",
                          )}
                        >
                          {Number.parseFloat(signal.profit) >= 0 ? "+" : ""}
                          {signal.profit}%
                        </div>
                        <div className="text-xs text-gray-500 font-mono flex items-center justify-end gap-1">
                          <Clock size={10} /> {signal.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </motion.div>
      </div>
    </section>
  )
}
