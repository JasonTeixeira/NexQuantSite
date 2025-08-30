"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealTimeData } from "./real-time-data-provider"
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts"

export const LiveMarketData: React.FC = () => {
  const { marketData, isConnected, connectionStatus, subscribe } = useRealTimeData()
  const [watchlist] = useState(["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"])
  const [selectedAssetClass, setSelectedAssetClass] = useState("equities")
  const [extendedWatchlist] = useState({
    equities: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN", "META", "NFLX"],
    bonds: ["TLT", "IEF", "SHY", "LQD", "HYG", "EMB"],
    commodities: ["GLD", "SLV", "USO", "UNG", "DBA", "PDBC"],
    forex: ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD"],
    crypto: ["BTC-USD", "ETH-USD", "ADA-USD", "SOL-USD", "AVAX-USD"],
  })
  const [marketDepth] = useState({
    bids: [
      { price: 150.25, size: 1000, orders: 5 },
      { price: 150.24, size: 2500, orders: 12 },
      { price: 150.23, size: 1800, orders: 8 },
    ],
    asks: [
      { price: 150.26, size: 800, orders: 3 },
      { price: 150.27, size: 1200, orders: 7 },
      { price: 150.28, size: 2000, orders: 15 },
    ],
  })

  // Sector heatmap (mock data)
  const sectorPerf = useMemo(
    () => [
      { name: "Tech", change: 1.82 },
      { name: "Energy", change: -0.56 },
      { name: "Financials", change: 0.74 },
      { name: "Healthcare", change: 0.21 },
      { name: "Industrials", change: -0.18 },
      { name: "Materials", change: 0.37 },
      { name: "Consumer", change: 1.12 },
      { name: "Utilities", change: -0.42 },
      { name: "Real Estate", change: 0.08 },
      { name: "Comm Services", change: 1.05 },
    ],
    []
  )

  // Sparkline helper
  const Sparkline: React.FC<{ points: number[]; width?: number; height?: number; positive?: boolean }> = ({
    points,
    width = 90,
    height = 28,
    positive = true,
  }) => {
    const max = Math.max(...points)
    const min = Math.min(...points)
    const range = Math.max(1e-6, max - min)
    const path = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * width
        const y = height - ((p - min) / range) * height
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(" ")
    const stroke = positive ? "#22c55e" : "#ef4444"
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
      </svg>
    )
  }

  // Search / sort state
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'symbol'|'price'|'change'|'changePercent'|'volume'>('symbol')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')

  useEffect(() => {
    // Subscribe to watchlist symbols
    watchlist.forEach((symbol) => subscribe(symbol))
  }, [watchlist, subscribe])

  const formatPrice = (price: number) => `$${price.toFixed(2)}`
  const formatChange = (change: number) => `${change >= 0 ? "+" : ""}${change.toFixed(2)}`
  const formatPercent = (percent: number) => `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`

  // CSV export
  const exportCSV = () => {
    const symbols = (extendedWatchlist as any)[selectedAssetClass] as string[]
    const rows = symbols.map((symbol) => {
      const d = marketData.get(symbol) || { price: 0, change: 0, changePercent: 0, volume: 0 }
      return { symbol, price: d.price, change: d.change, changePercent: d.changePercent, volume: d.volume }
    })
    const header = 'symbol,price,change,changePercent,volume\n'
    const csv = header + rows.map(r => `${r.symbol},${r.price},${r.change},${r.changePercent},${r.volume}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'market-data.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const filteredSymbols = ((extendedWatchlist as any)[selectedAssetClass] as string[])
    .filter((s: string) => !search || s.toLowerCase().includes(search.toLowerCase()))
    .sort((a: string, b: string) => {
      const da = marketData.get(a) || { price:0, change:0, changePercent:0, volume:0 }
      const db = marketData.get(b) || { price:0, change:0, changePercent:0, volume:0 }
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortBy) {
        case 'symbol': return dir * a.localeCompare(b)
        case 'price': return dir * ((da.price||0) - (db.price||0))
        case 'change': return dir * ((da.change||0) - (db.change||0))
        case 'changePercent': return dir * ((da.changePercent||0) - (db.changePercent||0))
        case 'volume': return dir * ((da.volume||0) - (db.volume||0))
      }
    })

  return (
    <div className="space-y-6" data-testid="market-data-table">
      {/* Connection Status */}
      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#00bbff] flex items-center gap-2">
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            Market Data Feed
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-auto">
              {connectionStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Asset Class Selector */}
      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#00bbff]">Asset Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(extendedWatchlist).map((assetClass) => (
              <Button
                key={assetClass}
                variant={selectedAssetClass === assetClass ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAssetClass(assetClass)}
                className={
                  selectedAssetClass === assetClass
                    ? "bg-[#00bbff] text-black"
                    : "border-[#2a2a3a] text-gray-400 hover:text-white hover:border-[#00bbff]/30"
                }
              >
                {assetClass.charAt(0).toUpperCase() + assetClass.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Table */}
      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#00bbff]">Watchlist</CardTitle>
            <div className="flex items-center gap-2">
              <input
                aria-label="Search symbols"
                placeholder="Search symbols"
                className="bg-[#0f0f16] border border-[#2a2a3a] rounded px-2 py-1 text-xs text-white placeholder-[#6b7280]"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={exportCSV}>Export CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border border-[#2a2a3a]">
            <table className="w-full text-sm">
              <thead className="bg-[#0f0f16] text-[#a0a0b8]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={()=>toggleSort('symbol')}>Symbol</th>
                  <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={()=>toggleSort('price')}>Price</th>
                  <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={()=>toggleSort('change')}>Change</th>
                  <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={()=>toggleSort('changePercent')}>%</th>
                  <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={()=>toggleSort('volume')}>Volume</th>
                  <th className="px-3 py-2 text-left font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredSymbols.map((symbol) => {
                  const data = marketData.get(symbol) || {
                    price: Math.random() * 1000 + 100,
                    change: (Math.random() - 0.5) * 10,
                    changePercent: (Math.random() - 0.5) * 5,
                    volume: Math.floor(Math.random() * 10000000),
                    points: Array.from({ length: 24 }, () => 100 + Math.random() * 10).map((v, i, arr) =>
                      v + (Math.random() - 0.5) * 2 + (i > 0 ? arr[i - 1] * 0.0 : 0)
                    ),
                  }
                  const isPositive = data.change >= 0
                  return (
                    <tr key={symbol} className="border-t border-[#2a2a3a] hover:bg-[#1a1a25]">
                      <td className="px-3 py-2 font-mono text-white">{symbol}</td>
                      <td className="px-3 py-2 font-mono text-white">{formatPrice(data.price)}</td>
                      <td className={`px-3 py-2 font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {formatChange(data.change)}
                      </td>
                      <td className={`px-3 py-2 font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {formatPercent(data.changePercent)}
                      </td>
                      <td className="px-3 py-2 text-[#a0a0b8]">{data.volume.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <Sparkline points={(data as any).points || []} positive={isPositive} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Market Depth/Order Book */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#15151f] border-[#2a2a3a]">
          <CardHeader>
            <CardTitle className="text-[#00bbff]">Market Depth - AAPL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {[{ side: "Bids", rows: marketDepth.bids, color: "text-green-400", bar: "bg-green-500/30" }, { side: "Asks", rows: marketDepth.asks, color: "text-red-400", bar: "bg-red-500/30" }].map(
                (col, idx) => (
                  <div key={idx}>
                    <div className="text-sm text-gray-400 mb-2">{col.side}</div>
                    <div className="space-y-1">
                      {col.rows.map((row, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-mono">
                          <span className={col.color} style={{ minWidth: 60 }}>
                            {formatPrice(row.price)}
                          </span>
                          <div className="flex-1 h-3 bg-[#0f0f16] rounded">
                            <div className={`${col.bar} h-3 rounded`} style={{ width: `${Math.min(100, row.size / 30)}%` }} />
                          </div>
                          <span className="text-white w-16 text-right">{row.size.toLocaleString()}</span>
                          <span className="text-gray-400 w-10 text-right">({row.orders})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Market News */}
        <Card className="bg-[#15151f] border-[#2a2a3a]">
          <CardHeader>
            <CardTitle className="text-[#00bbff]">Market News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[
                { time: "09:45", headline: "Fed signals potential rate cut in Q4", impact: "high" },
                { time: "09:32", headline: "NVDA earnings beat expectations", impact: "medium" },
                { time: "09:18", headline: "Oil prices surge on supply concerns", impact: "medium" },
                { time: "09:05", headline: "Tech sector shows strong momentum", impact: "low" },
              ].map((news, i) => (
                <div key={i} className="border-l-2 border-[#00bbff]/30 pl-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">{news.time}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        news.impact === "high"
                          ? "border-red-500/30 text-red-400"
                          : news.impact === "medium"
                            ? "border-yellow-500/30 text-yellow-400"
                            : "border-green-500/30 text-green-400"
                      }`}
                    >
                      {news.impact}
                    </Badge>
                  </div>
                  <div className="text-sm text-white mt-1">{news.headline}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Heatmap */}
      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader>
          <CardTitle className="text-[#00bbff]">Sector Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {sectorPerf.map((s) => (
              <div
                key={s.name}
                className={`rounded-md p-3 text-center border ${
                  s.change >= 0 ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"
                }`}
              >
                <div className="text-xs text-[#a0a0b8]">{s.name}</div>
                <div className={`font-mono ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {s.change > 0 ? "+" : ""}
                  {s.change.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Markets Overview */}
      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader>
          <CardTitle className="text-[#00bbff]">Global Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "S&P 500", value: "4,185.47", change: "+0.85%" },
              { name: "NASDAQ", value: "12,975.69", change: "+1.23%" },
              { name: "FTSE 100", value: "7,542.83", change: "-0.34%" },
              { name: "Nikkei 225", value: "33,486.89", change: "+0.67%" },
              { name: "DAX", value: "15,789.23", change: "+0.45%" },
              { name: "Shanghai", value: "3,247.56", change: "-0.12%" },
            ].map((market, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-400">{market.name}</div>
                <div className="text-sm font-mono text-white">{market.value}</div>
                <div
                  className={`text-xs font-mono ${market.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                >
                  {market.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Performance Metrics */}
      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader>
          <CardTitle className="text-[#00bbff]">Live Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-mono text-white">$2,847,392</div>
              <div className="text-sm text-gray-400">Portfolio Value</div>
              <div className="text-xs text-green-400 font-mono">+$12,847 (0.45%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-white">+18.7%</div>
              <div className="text-sm text-gray-400">YTD Return</div>
              <div className="text-xs text-green-400 font-mono">+2.3% vs SPY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-white">1.24</div>
              <div className="text-sm text-gray-400">Sharpe Ratio</div>
              <div className="text-xs text-green-400 font-mono">Above Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-white">12.4%</div>
              <div className="text-sm text-gray-400">Max Drawdown</div>
              <div className="text-xs text-yellow-400 font-mono">Within Limits</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Microstructure - Trades Tape & Spread/Volume Clocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trades Tape */}
        <Card className="bg-[#15151f] border-[#2a2a3a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#00bbff]">Live Trades Tape - AAPL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {[
                { time: "15:42:23.847", price: 189.45, size: 1200, side: "buy" },
                { time: "15:42:23.756", price: 189.44, size: 800, side: "sell" },
                { time: "15:42:23.623", price: 189.46, size: 2500, side: "buy" },
                { time: "15:42:23.445", price: 189.43, size: 1100, side: "sell" },
                { time: "15:42:23.234", price: 189.47, size: 750, side: "buy" },
                { time: "15:42:22.987", price: 189.42, size: 3200, side: "sell" },
                { time: "15:42:22.834", price: 189.48, size: 950, side: "buy" },
                { time: "15:42:22.678", price: 189.41, size: 1800, side: "sell" },
                { time: "15:42:22.456", price: 189.49, size: 600, side: "buy" },
                { time: "15:42:22.289", price: 189.40, size: 2100, side: "sell" },
                { time: "15:42:22.067", price: 189.50, size: 1400, side: "buy" },
                { time: "15:42:21.923", price: 189.39, size: 850, side: "sell" },
                { time: "15:42:21.756", price: 189.51, size: 1750, side: "buy" },
                { time: "15:42:21.534", price: 189.38, size: 900, size_large: true, side: "sell" },
                { time: "15:42:21.378", price: 189.52, size: 2800, size_large: true, side: "buy" },
              ].map((trade, i) => (
                <div key={i} className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-gray-400 w-20">{trade.time.split('.')[0]}</span>
                  <span className="text-gray-500 w-6">.{trade.time.split('.')[1].slice(0,2)}</span>
                  <span className={`w-16 text-right ${trade.side === "buy" ? "text-green-400" : "text-red-400"}`}>
                    ${trade.price.toFixed(2)}
                  </span>
                  <span className={`w-12 text-right ${trade.size_large ? "text-yellow-400 font-bold" : "text-white"}`}>
                    {trade.size.toLocaleString()}
                  </span>
                  <div className={`w-8 h-2 rounded ${trade.side === "buy" ? "bg-green-500/60" : "bg-red-500/60"}`} />
                  <span className={`text-xs ${trade.side === "buy" ? "text-green-400" : "text-red-400"}`}>
                    {trade.side.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#2a2a3a] grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm font-mono text-green-400">24,847</div>
                <div className="text-xs text-gray-400">Buy Volume</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-mono text-red-400">22,156</div>
                <div className="text-xs text-gray-400">Sell Volume</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-mono text-[#00bbff]">52.9%</div>
                <div className="text-xs text-gray-400">Buy Ratio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spread & Volume Clocks */}
        <Card className="bg-[#15151f] border-[#2a2a3a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#00bbff]">Market Microstructure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Spread Clock */}
              <div>
                <div className="text-sm text-gray-300 mb-3">Bid-Ask Spread Evolution</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-[#2a2a3a]"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-[#00bbff] border-t-transparent transform -rotate-90"
                        style={{ clipPath: "polygon(50% 0%, 100% 0%, 50% 50%)" }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-mono text-[#00bbff]">0.03</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Current Spread</div>
                  </div>
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-[#2a2a3a]"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-yellow-400 border-t-transparent transform -rotate-90"
                        style={{ clipPath: "polygon(50% 0%, 85% 15%, 50% 50%)" }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-mono text-yellow-400">0.05</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Avg Spread (5m)</div>
                  </div>
                </div>
              </div>

              {/* Volume Clock */}
              <div>
                <div className="text-sm text-gray-300 mb-3">Volume Patterns</div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { time: "09:30", vol: 85 }, { time: "10:00", vol: 72 }, { time: "10:30", vol: 68 },
                      { time: "11:00", vol: 45 }, { time: "11:30", vol: 38 }, { time: "12:00", vol: 32 },
                      { time: "12:30", vol: 28 }, { time: "13:00", vol: 35 }, { time: "13:30", vol: 42 },
                      { time: "14:00", vol: 58 }, { time: "14:30", vol: 67 }, { time: "15:00", vol: 78 },
                      { time: "15:30", vol: 92 }, { time: "16:00", vol: 98 }
                    ]}>
                      <Line 
                        type="monotone" 
                        dataKey="vol" 
                        stroke="#00bbff" 
                        strokeWidth={2} 
                        dot={false}
                      />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#666' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#0d1117',
                          border: '1px solid #2a2a3a',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: '#a0a0b8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Market Impact Gauge */}
              <div>
                <div className="text-sm text-gray-300 mb-3">Market Impact (bps)</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                    <div className="h-2 bg-[#2a2a3a] rounded-full relative">
                      <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full w-full"></div>
                      <div 
                        className="absolute top-0 w-1 h-2 bg-white rounded-full shadow-lg"
                        style={{ left: '32%' }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-green-400">2.4</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
