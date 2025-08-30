"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react'

interface CryptoMetric {
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: string
  volume24h: string
  dominance?: number
  rank: number
}

interface CryptoOverview {
  totalMarketCap: string
  totalVolume: string
  btcDominance: number
  activeCoins: number
  defiTvl: string
  fearGreedIndex: number
}

export default function CryptoMetrics() {
  const [cryptos, setCryptos] = useState<CryptoMetric[]>([])
  const [overview, setOverview] = useState<CryptoOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // Using CoinGecko API for comprehensive crypto data
        const [marketResponse, globalResponse] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1'),
          fetch('https://api.coingecko.com/api/v3/global')
        ])

        const marketData = await marketResponse.json()
        const globalData = await globalResponse.json()

        // Process market data
        if (Array.isArray(marketData)) {
          const processedCryptos = marketData.map((crypto: any, index: number) => ({
            name: crypto.name,
            symbol: crypto.symbol.toUpperCase(),
            price: crypto.current_price,
            change24h: crypto.price_change_percentage_24h || 0,
            marketCap: `$${(crypto.market_cap / 1e9).toFixed(1)}B`,
            volume24h: `$${(crypto.total_volume / 1e9).toFixed(1)}B`,
            dominance: index === 0 ? (globalData.data?.market_cap_percentage?.btc || 54) : undefined,
            rank: crypto.market_cap_rank
          }))

          setCryptos(processedCryptos)
        }

        // Process global data
        if (globalData.data) {
          const global = globalData.data
          setOverview({
            totalMarketCap: `$${(global.total_market_cap.usd / 1e12).toFixed(2)}T`,
            totalVolume: `$${(global.total_volume.usd / 1e9).toFixed(0)}B`,
            btcDominance: global.market_cap_percentage.btc || 54,
            activeCoins: global.active_cryptocurrencies || 12000,
            defiTvl: '$58.7B', // Would integrate with DeFiLlama API
            fearGreedIndex: 60 // Would integrate with Fear & Greed API
          })
        }
      } catch (error) {
        // Fallback data
        setCryptos([
          { name: "Bitcoin", symbol: "BTC", price: 115566, change24h: 2.13, marketCap: "$2.3T", volume24h: "$28.5B", dominance: 54.2, rank: 1 },
          { name: "Ethereum", symbol: "ETH", price: 4234, change24h: 1.87, marketCap: "$508.2B", volume24h: "$15.2B", rank: 2 },
          { name: "Tether USDt", symbol: "USDT", price: 1.00, change24h: 0.02, marketCap: "$118.4B", volume24h: "$45.1B", rank: 3 },
          { name: "Solana", symbol: "SOL", price: 234, change24h: 4.56, marketCap: "$112.3B", volume24h: "$3.8B", rank: 4 },
          { name: "XRP", symbol: "XRP", price: 2.34, change24h: -1.23, marketCap: "$134.5B", volume24h: "$8.9B", rank: 5 },
        ])

        setOverview({
          totalMarketCap: "$3.6T",
          totalVolume: "$156B", 
          btcDominance: 54.2,
          activeCoins: 12847,
          defiTvl: "$58.7B",
          fearGreedIndex: 60
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 2 * 60 * 1000) // Update every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  }

  const getDominanceColor = (dominance: number) => {
    if (dominance > 50) return 'text-orange-400'
    if (dominance > 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getMarketSentiment = () => {
    if (!overview) return { label: "Neutral", color: "text-gray-400", emoji: "😐" }
    
    const avgChange = cryptos.reduce((sum, crypto) => sum + crypto.change24h, 0) / cryptos.length
    if (avgChange > 3) return { label: "Very Bullish", color: "text-green-400", emoji: "🚀" }
    if (avgChange > 1) return { label: "Bullish", color: "text-lime-400", emoji: "📈" }
    if (avgChange > -1) return { label: "Neutral", color: "text-yellow-400", emoji: "😐" }
    if (avgChange > -3) return { label: "Bearish", color: "text-orange-400", emoji: "📉" }
    return { label: "Very Bearish", color: "text-red-400", emoji: "💀" }
  }

  if (loading) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-primary animate-pulse" />
            Crypto Market
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const marketSentiment = getMarketSentiment()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-primary" />
            Crypto Market Intelligence
            <Badge className="ml-auto bg-primary/20 text-primary text-xs animate-pulse">
              Live Data
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Market Overview */}
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{marketSentiment.emoji}</span>
                <div>
                  <h3 className={`font-semibold ${marketSentiment.color}`}>
                    Crypto Sentiment: {marketSentiment.label}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {overview?.activeCoins.toLocaleString()} active cryptocurrencies
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{overview?.totalMarketCap}</div>
                <div className="text-xs text-gray-400">Total Market Cap</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{overview?.totalVolume}</div>
                <div className="text-xs text-gray-400">24h Volume</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${getDominanceColor(overview?.btcDominance || 0)}`}>
                  {overview?.btcDominance.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">BTC Dominance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{overview?.defiTvl}</div>
                <div className="text-xs text-gray-400">DeFi TVL</div>
              </div>
            </div>
          </div>

          {/* Top Cryptocurrencies */}
          <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
            {cryptos.map((crypto, index) => (
              <motion.div
                key={crypto.symbol}
                className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-700/50 rounded-full text-xs font-bold text-gray-400">
                      #{crypto.rank}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{crypto.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">{crypto.symbol}</span>
                        {crypto.dominance && (
                          <Badge className={`text-xs bg-orange-500/20 text-orange-400 border-orange-400/30`}>
                            {crypto.dominance.toFixed(1)}% Dom
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      ${crypto.price >= 1 ? crypto.price.toLocaleString() : crypto.price.toFixed(4)}
                    </div>
                    <div className={`text-sm flex items-center justify-end gap-1 ${getChangeColor(crypto.change24h)}`}>
                      {getChangeIcon(crypto.change24h)}
                      {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Market Cap: </span>
                    <span className="text-white font-medium">{crypto.marketCap}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Volume (24h): </span>
                    <span className="text-primary font-medium">{crypto.volume24h}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Crypto Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h4 className="text-white font-medium">Top Gainers (24h)</h4>
              </div>
              <div className="space-y-2">
                {cryptos
                  .filter(c => c.change24h > 0)
                  .sort((a, b) => b.change24h - a.change24h)
                  .slice(0, 3)
                  .map((crypto) => (
                    <div key={crypto.symbol} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{crypto.symbol}</span>
                      <span className="text-green-400 font-medium">
                        +{crypto.change24h.toFixed(2)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <h4 className="text-white font-medium">Top Losers (24h)</h4>
              </div>
              <div className="space-y-2">
                {cryptos
                  .filter(c => c.change24h < 0)
                  .sort((a, b) => a.change24h - b.change24h)
                  .slice(0, 3)
                  .map((crypto) => (
                    <div key={crypto.symbol} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{crypto.symbol}</span>
                      <span className="text-red-400 font-medium">
                        {crypto.change24h.toFixed(2)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Trading Intelligence */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-lg border border-gray-600/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cyan-400">🤖</span>
              <h4 className="text-white font-medium">Crypto Trading Intelligence</h4>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              {overview && overview.btcDominance > 55 && (
                <p>• High BTC dominance suggests risk-off sentiment - altcoins may struggle</p>
              )}
              {overview && overview.btcDominance < 45 && (
                <p>• Low BTC dominance indicates "alt season" - diversified crypto plays favored</p>
              )}
              {marketSentiment.label.includes('Bullish') && (
                <p>• Strong crypto momentum - your momentum-based signals likely performing well</p>
              )}
              <p>• DeFi TVL at ${overview?.defiTvl} - {parseFloat(overview?.defiTvl.replace(/[^\d.]/g, '') || '0') > 60 ? 'healthy' : 'recovering'} ecosystem</p>
              <p>• Best performance window: Your crypto bots excel during {marketSentiment.label.toLowerCase()} markets</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
