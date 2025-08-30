"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface FuturesMarket {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  openInterest: number
  fundingRate: number
}

interface FuturesMarketTrackerProps {
  data: FuturesMarket[]
}

export default function FuturesMarketTracker({ data }: FuturesMarketTrackerProps) {
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

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  return (
    <Card className="bg-black border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
      <CardHeader>
        <CardTitle className="text-white font-bold text-xl">
          FUTURES <span className="text-primary">MARKET</span>
        </CardTitle>
        <p className="text-gray-400 text-sm">Real-time futures market data</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm font-mono">SYMBOL</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">PRICE</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">24H CHANGE</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">VOLUME</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">OPEN INT</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm font-mono">FUNDING</th>
              </tr>
            </thead>
            <tbody>
              {data.map((market) => (
                <tr key={market.symbol} className="border-b border-gray-800/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-white font-medium">{market.symbol}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-white text-sm font-mono">{formatCurrency(market.price)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {market.changePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-primary" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span
                        className={`text-sm font-mono ${market.changePercent >= 0 ? "text-primary" : "text-red-400"}`}
                      >
                        {formatPercent(market.changePercent)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300 text-sm font-mono">
                    {formatVolume(market.volume)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300 text-sm font-mono">
                    {formatVolume(market.openInterest)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-mono ${market.fundingRate >= 0 ? "text-primary" : "text-red-400"}`}>
                      {formatPercent(market.fundingRate)}
                    </span>
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
