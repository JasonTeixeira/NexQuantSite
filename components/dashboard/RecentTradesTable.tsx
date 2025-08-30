"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"

interface RecentTrade {
  id: string
  time: string
  bot: string
  pair: string
  type: "LONG" | "SHORT"
  entry: number
  exit: number
  pnl: number
  pnlPercent: number
}

interface RecentTradesTableProps {
  data: RecentTrade[]
}

export default function RecentTradesTable({ data }: RecentTradesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredData = data.filter(
    (trade) =>
      trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.bot.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="bg-black border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white font-bold text-xl">
              RECENT <span className="text-primary">TRADES</span>
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">Latest trading activity across all bots</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black border-primary/30 text-white placeholder-gray-400 focus:border-primary"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm font-mono">TIME</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm font-mono">BOT</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm font-mono">PAIR</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm font-mono">TYPE</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">ENTRY</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">EXIT</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">P&L</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-800/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 text-gray-300 text-sm font-mono">{trade.time}</td>
                  <td className="py-3 px-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{trade.bot}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white text-sm font-mono font-medium">{trade.pair}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`font-mono ${
                        trade.type === "LONG"
                          ? "border-primary/30 text-primary bg-primary/10"
                          : "border-red-400/30 text-red-400 bg-red-400/10"
                      }`}
                    >
                      {trade.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-white text-sm font-mono">{formatCurrency(trade.entry)}</td>
                  <td className="py-3 px-4 text-right text-white text-sm font-mono">{formatCurrency(trade.exit)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {trade.pnlPercent >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-primary" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <div className="text-right">
                        <div
                          className={`text-sm font-mono font-bold ${
                            trade.pnlPercent >= 0 ? "text-primary" : "text-red-400"
                          }`}
                        >
                          {formatPercent(trade.pnlPercent)}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{formatCurrency(trade.pnl)}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
