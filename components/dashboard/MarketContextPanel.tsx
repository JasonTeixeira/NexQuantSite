"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

interface MarketData {
  btcPrice: number
  btcChange: number
  fearGreed: number
  fearGreedText: string
  spyPrice: number
  spyChange: number
  isLive: boolean
}

export default function MarketContextPanel() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true)
      
      // Always set fallback data first
      const fallbackData = {
        btcPrice: 115566,
        btcChange: 2.13,
        fearGreed: 60,
        fearGreedText: "Greed",
        spyPrice: 645.31,
        spyChange: 1.54,
        isLive: false
      }
      
      try {
        // Try to fetch real data, but don't block the UI if it fails
        const cryptoPromise = fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }).then(res => res.json()).catch(() => null)

        const fearGreedPromise = fetch('https://api.alternative.me/fng/', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }).then(res => res.json()).catch(() => null)

        const spyPromise = fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=BILEQT4FR4AYF3HW`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }).then(res => res.json()).catch(() => null)

        const [cryptoData, fearGreedData, spyData] = await Promise.all([
          cryptoPromise,
          fearGreedPromise, 
          spyPromise
        ])

        const getFearText = (value: number) => {
          if (value >= 75) return "Extreme Greed"
          if (value >= 55) return "Greed" 
          if (value >= 45) return "Neutral"
          if (value >= 25) return "Fear"
          return "Extreme Fear"
        }

        // Build market data from successful responses, fallback for failed ones
        const marketData = { ...fallbackData }
        let hasLiveData = false

        if (cryptoData?.bitcoin?.usd) {
          marketData.btcPrice = cryptoData.bitcoin.usd
          marketData.btcChange = cryptoData.bitcoin.usd_24h_change || 0
          hasLiveData = true
        }

        if (fearGreedData?.data?.[0]?.value) {
          const fearIndex = parseInt(fearGreedData.data[0].value)
          marketData.fearGreed = fearIndex
          marketData.fearGreedText = getFearText(fearIndex)
          hasLiveData = true
        }

        if (spyData?.["Global Quote"]?.["05. price"]) {
          const spyQuote = spyData["Global Quote"]
          const spyPrice = parseFloat(spyQuote["05. price"])
          const spyChange = parseFloat(spyQuote["09. change"] || "0")
          const spyChangePercent = spyPrice > 0 ? (spyChange / (spyPrice - spyChange)) * 100 : 0
          
          marketData.spyPrice = spyPrice
          marketData.spyChange = spyChangePercent
          hasLiveData = true
        }

        marketData.isLive = hasLiveData
        setMarketData(marketData)
      } catch (error) {
        console.warn('Using fallback market data due to API error:', error)
        setMarketData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
    
    // Update every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getFearColor = (value: number) => {
    if (value >= 75) return "text-red-400"
    if (value >= 55) return "text-orange-400" 
    if (value >= 45) return "text-yellow-400"
    if (value >= 25) return "text-blue-400"
    return "text-green-400"
  }

  if (loading) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Market Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-24 mx-auto bg-gray-800/50" />
                <Skeleton className="h-4 w-16 mx-auto bg-gray-800/50" />
                <Skeleton className="h-4 w-20 mx-auto bg-gray-800/50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!marketData) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-primary" />
            Market Context
            <Badge className={`ml-auto text-xs ${
              marketData.isLive 
                ? "bg-green-500/20 text-green-400 animate-pulse" 
                : "bg-yellow-500/20 text-yellow-400"
            }`}>
              {marketData.isLive ? "Live" : "Cached"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bitcoin */}
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-4 h-4 text-orange-400 mr-1" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Bitcoin</span>
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-1">
                ${marketData.btcPrice.toLocaleString()}
              </div>
              <div className={`text-sm flex items-center justify-center gap-1 ${
                marketData.btcChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {marketData.btcChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {marketData.btcChange >= 0 ? '+' : ''}{marketData.btcChange.toFixed(2)}% (24h)
              </div>
            </div>

            {/* Fear & Greed */}
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Fear & Greed</span>
              </div>
              <div className={`text-2xl font-bold mb-1 ${getFearColor(marketData.fearGreed)}`}>
                {marketData.fearGreed}
              </div>
              <div className="text-sm text-gray-400">
                {marketData.fearGreedText}
              </div>
            </div>

            {/* S&P 500 (SPY) */}
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">S&P 500 (SPY)</span>
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                ${marketData.spyPrice.toFixed(2)}
              </div>
              <div className={`text-sm flex items-center justify-center gap-1 ${
                marketData.spyChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {marketData.spyChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {marketData.spyChange >= 0 ? '+' : ''}{marketData.spyChange.toFixed(2)}%
              </div>
            </div>
          </div>
          
          {/* Market Insight */}
          <div className="mt-6 pt-4 border-t border-gray-800/50">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Market Insight</p>
              <p className="text-sm text-gray-400">
                {marketData.fearGreed >= 60 
                  ? "Markets showing greed - consider taking profits" 
                  : marketData.fearGreed <= 40
                  ? "Fear in markets - potential buying opportunity"
                  : "Balanced market sentiment - monitor trends"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}