"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

const signals = [
  {
    ticker: "/ES",
    name: "S&P 500 E-mini",
    direction: "LONG",
    change: 2.3,
    winRate: 75,
    color: "#00FF88",
  },
  {
    ticker: "/NQ",
    name: "NASDAQ E-mini",
    direction: "LONG",
    change: 3.1,
    winRate: 72,
    color: "#00D4FF",
  },
  {
    ticker: "/YM",
    name: "Dow Jones E-mini",
    direction: "SHORT",
    change: -0.8,
    winRate: 68,
    color: "#A78BFA",
  },
  {
    ticker: "/RTY",
    name: "Russell 2000 E-mini",
    direction: "LONG",
    change: 1.5,
    winRate: 65,
    color: "#FBBF24",
  },
]

export default function SignalsSection() {
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <section className="mb-8">
      <motion.h2
        className="text-2xl font-bold mb-6 flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        FUTURES INDEX SIGNALS
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.ticker}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              className="bg-black/40 border-primary/30 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 relative overflow-hidden group"
              style={{ "--signal-color": signal.color } as React.CSSProperties}
            >
              {/* Animated bottom border */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: signal.color }}
              />

              <CardContent className="p-6 text-center">
                {/* Signal Ticker */}
                <div className="text-2xl font-bold font-mono mb-2" style={{ color: signal.color }}>
                  {signal.ticker}
                </div>

                {/* Signal Name */}
                <div className="text-sm text-gray-400 mb-4">{signal.name}</div>

                {/* Direction Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                    signal.direction === "LONG" ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {signal.direction === "LONG" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-semibold">{signal.direction}</span>
                </div>

                {/* Signal Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/50 p-3 rounded-lg border border-primary/10">
                    <div
                      className="text-lg font-bold font-mono"
                      style={{ color: signal.change >= 0 ? signal.color : "#FF3366" }}
                    >
                      {formatPercent(signal.change)}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">24H</div>
                  </div>
                  <div className="bg-black/50 p-3 rounded-lg border border-primary/10">
                    <div className="text-lg font-bold font-mono text-primary">{signal.winRate}%</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Win Rate</div>
                  </div>
                </div>

                {/* Mini Chart Placeholder */}
                <div className="h-20 bg-black/30 rounded-lg mb-6 border border-primary/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
                  <div className="text-xs text-gray-500 font-mono">SIGNAL CHART</div>
                </div>

                {/* Discord Button */}
                <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in Discord
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
