"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Trade {
  id: string
  bot: string
  pair: string
  type: "Buy" | "Sell"
  amount: number
  price: number
  pnl: number
  time: string
}

interface TradeHistoryTableProps {
  data: Trade[]
}

export default function TradeHistoryTable({ data }: TradeHistoryTableProps) {
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
        <CardTitle className="text-white font-bold text-xl">
          TRADE <span className="text-primary">HISTORY</span>
        </CardTitle>
        <p className="text-gray-400 text-sm">Recent trading activity across all bots</p>
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
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">AMOUNT</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">PRICE</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">P&L</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((trade) => (
                <tr key={trade.id} className="border-b border-gray-800/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 text-gray-300 text-sm font-mono">{trade.time}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                      {trade.bot}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-white text-sm font-mono">{trade.pair}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`${
                        trade.type === "Buy"
                          ? "border-primary/30 text-primary bg-primary/10"
                          : "border-red-400/30 text-red-400 bg-red-400/10"
                      }`}
                    >
                      {trade.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-white text-sm font-mono">{trade.amount.toFixed(4)}</td>
                  <td className="py-3 px-4 text-right text-white text-sm font-mono">{formatCurrency(trade.price)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {trade.pnl >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-primary" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span
                        className={`text-sm font-mono font-bold ${trade.pnl >= 0 ? "text-primary" : "text-red-400"}`}
                      >
                        {formatCurrency(trade.pnl)}
                      </span>
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
