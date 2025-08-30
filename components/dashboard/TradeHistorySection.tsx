"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RecentTrade, BotPerformance } from "@/lib/dashboard-data"

interface TradeHistorySectionProps {
  trades: RecentTrade[]
  selectedBot: BotPerformance | null
}

export default function TradeHistorySection({ trades, selectedBot }: TradeHistorySectionProps) {
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

  // Filter trades if a bot is selected
  const filteredTrades = selectedBot ? trades.filter((trade) => trade.bot === selectedBot.name) : trades

  return (
    <Card className="bg-black/40 border-primary/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white font-bold text-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          RECENT TRADES
          {selectedBot && <span className="text-sm text-gray-400 font-normal">- {selectedBot.name} Bot</span>}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Bot
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Pair
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Entry
                </th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Exit
                </th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  P&L
                </th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Return
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.slice(0, 10).map((trade, index) => (
                <motion.tr
                  key={trade.id}
                  className="border-b border-primary/10 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <td className="py-4 px-4 text-sm text-gray-300">{trade.time}</td>
                  <td className="py-4 px-4">
                    <div className="w-8 h-8 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{trade.bot}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-mono font-semibold text-white">{trade.pair}</td>
                  <td className="py-4 px-4">
                    <Badge
                      className={`${
                        trade.type === "LONG"
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {trade.type}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm font-mono text-right text-gray-300">{trade.entry.toFixed(2)}</td>
                  <td className="py-4 px-4 text-sm font-mono text-right text-gray-300">{trade.exit.toFixed(2)}</td>
                  <td className="py-4 px-4 text-sm font-mono text-right">
                    <span className={trade.pnl >= 0 ? "text-primary" : "text-red-400"}>
                      {formatCurrency(trade.pnl)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-mono text-right">
                    <span className={trade.pnlPercent >= 0 ? "text-primary" : "text-red-400"}>
                      {formatPercent(trade.pnlPercent)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
