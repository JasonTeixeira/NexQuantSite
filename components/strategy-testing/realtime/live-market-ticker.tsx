// 📊 LIVE MARKET TICKER - Professional real-time market data display
// Shows live prices with smooth animations and status indicators

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useMarketData } from '@/lib/hooks/use-realtime-data'
import { Badge } from '@/components/ui/badge'
import { TrendingUpIcon, TrendingDownIcon, WifiIcon, WifiOffIcon } from 'lucide-react'

interface TickerSymbol {
  symbol: string
  displayName: string
  priority: number
}

interface LiveMarketTickerProps {
  symbols?: string[]
  autoScroll?: boolean
  showStatus?: boolean
  className?: string
}

export function LiveMarketTicker({ 
  symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'SPY', 'QQQ'],
  autoScroll = true,
  showStatus = true,
  className = ""
}: LiveMarketTickerProps) {
  const { marketData, isConnected, getPrice, getChange, getChangePercent } = useMarketData(symbols)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flashingSymbols, setFlashingSymbols] = useState<Set<string>>(new Set())

  // Auto-scroll through symbols
  useEffect(() => {
    if (autoScroll && symbols.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % symbols.length)
      }, 3000) // Change every 3 seconds

      return () => clearInterval(interval)
    }
  }, [autoScroll, symbols.length])

  // Flash animation for price changes
  useEffect(() => {
    const newFlashing = new Set<string>()
    
    symbols.forEach(symbol => {
      const data = marketData[symbol]
      if (data && data.timestamp) {
        // Check if this is a recent update (within last 2 seconds)
        if (Date.now() - data.timestamp < 2000) {
          newFlashing.add(symbol)
        }
      }
    })

    if (newFlashing.size > 0) {
      setFlashingSymbols(newFlashing)
      
      // Clear flashing after animation
      setTimeout(() => {
        setFlashingSymbols(new Set())
      }, 1000)
    }
  }, [marketData, symbols])

  const formatPrice = (price: number) => {
    return price >= 1000 ? price.toFixed(0) : price.toFixed(2)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}`
  }

  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : ''
    return `${sign}${changePercent.toFixed(2)}%`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getFlashColor = (symbol: string, change: number) => {
    if (!flashingSymbols.has(symbol)) return ''
    return change >= 0 ? 'bg-green-500/20 animate-pulse' : 'bg-red-500/20 animate-pulse'
  }

  // Memoized symbol data for performance
  const symbolsData = useMemo(() => {
    return symbols.map(symbol => {
      const price = getPrice(symbol) || 0
      const change = getChange(symbol) || 0
      const changePercent = getChangePercent(symbol) || 0
      const data = marketData[symbol]
      
      return {
        symbol,
        price,
        change,
        changePercent,
        volume: data?.volume || 0,
        source: data?.source || 'Loading...',
        lastUpdate: data?.timestamp || 0
      }
    })
  }, [symbols, marketData, getPrice, getChange, getChangePercent])

  if (symbols.length === 0) {
    return null
  }

  return (
    <div className={`bg-[#0a0b1a] border-y border-[#2a2a3e] overflow-hidden ${className}`}>
      {/* Header with status */}
      {showStatus && (
        <div className="px-4 py-2 bg-[#1a1a25] border-b border-[#2a2a3e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-white">LIVE MARKET DATA</div>
            <Badge 
              className={`text-xs ${isConnected 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {isConnected ? (
                <>
                  <WifiIcon className="w-3 h-3 mr-1" />
                  CONNECTED
                </>
              ) : (
                <>
                  <WifiOffIcon className="w-3 h-3 mr-1" />
                  RECONNECTING
                </>
              )}
            </Badge>
          </div>
          
          <div className="text-xs text-gray-400">
            {symbolsData.length} symbols • Updated {isConnected ? 'live' : 'cached'}
          </div>
        </div>
      )}

      {/* Ticker Display */}
      <div className="p-3">
        {/* Desktop: Show all symbols in scrolling row */}
        <div className="hidden md:block">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {symbolsData.map((item, index) => (
              <div
                key={item.symbol}
                className={`flex items-center gap-3 min-w-[200px] p-2 rounded-lg transition-all duration-300 ${
                  getFlashColor(item.symbol, item.change)
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.symbol}</span>
                    <span className="font-mono text-white text-sm">
                      ${formatPrice(item.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`flex items-center gap-1 ${getChangeColor(item.change)}`}>
                      {item.change >= 0 ? (
                        <TrendingUpIcon className="w-3 h-3" />
                      ) : (
                        <TrendingDownIcon className="w-3 h-3" />
                      )}
                      {formatChange(item.change)}
                    </span>
                    <span className={getChangeColor(item.change)}>
                      ({formatChangePercent(item.changePercent)})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Show one symbol at a time with auto-scroll */}
        <div className="md:hidden">
          {symbolsData[currentIndex] && (
            <div className={`text-center p-4 rounded-lg transition-all duration-500 ${
              getFlashColor(symbolsData[currentIndex].symbol, symbolsData[currentIndex].change)
            }`}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="font-bold text-white text-lg">
                  {symbolsData[currentIndex].symbol}
                </span>
                <span className="font-mono text-white text-lg">
                  ${formatPrice(symbolsData[currentIndex].price)}
                </span>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <span className={`flex items-center gap-1 ${
                  getChangeColor(symbolsData[currentIndex].change)
                }`}>
                  {symbolsData[currentIndex].change >= 0 ? (
                    <TrendingUpIcon className="w-4 h-4" />
                  ) : (
                    <TrendingDownIcon className="w-4 h-4" />
                  )}
                  {formatChange(symbolsData[currentIndex].change)}
                </span>
                <span className={getChangeColor(symbolsData[currentIndex].change)}>
                  ({formatChangePercent(symbolsData[currentIndex].changePercent)})
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1 mt-3">
                {symbols.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with data source info */}
      <div className="px-4 py-2 bg-[#0f1320] border-t border-[#2a2a3e]">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Data: {symbolsData[0]?.source || 'Multiple Sources'}
          </div>
          <div>
            Last Update: {isConnected ? 'Live' : 'Cached'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMarketTicker
