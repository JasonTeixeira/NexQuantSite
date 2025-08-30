"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Bell } from "lucide-react"

interface WatchlistItem {
  symbol: string
  price: number
  change: number
  changePercent: number
  alert?: {
    type: "above" | "below"
    price: number
  }
}

interface FuturesWatchlistProps {
  data: WatchlistItem[]
}

export default function FuturesWatchlist({ data }: FuturesWatchlistProps) {
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
          <span className="text-primary">WATCHLIST</span>
        </CardTitle>
        <p className="text-gray-400 text-sm">Monitored assets with alerts</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div
            key={item.symbol}
            className="bg-black/50 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{item.symbol}</span>
                {item.alert && (
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                    <Bell className="h-3 w-3 mr-1" />
                    Alert
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {item.changePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-primary" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-sm font-mono ${item.changePercent >= 0 ? "text-primary" : "text-red-400"}`}>
                  {formatPercent(item.changePercent)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-mono font-bold">{formatCurrency(item.price)}</span>
              {item.alert && (
                <span className="text-gray-400 text-xs font-mono">
                  Alert {item.alert.type} {formatCurrency(item.alert.price)}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
