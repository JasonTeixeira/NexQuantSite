"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Clock
} from "lucide-react"

interface TradingSignal {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  profit: number
  time: string
  confidence: number
}

// Mock data - Replace with real API calls
const mockRecentSignals: TradingSignal[] = [
  { id: '1', symbol: 'ES', type: 'BUY', profit: 4.2, time: '2 min', confidence: 89 },
  { id: '2', symbol: 'NQ', type: 'SELL', profit: 7.8, time: '5 min', confidence: 94 },
  { id: '3', symbol: 'GC', type: 'BUY', profit: 3.1, time: '8 min', confidence: 76 },
  { id: '4', symbol: 'CL', type: 'SELL', profit: -1.2, time: '12 min', confidence: 82 },
  { id: '5', symbol: 'RTY', type: 'BUY', profit: 5.4, time: '15 min', confidence: 87 },
  { id: '6', symbol: 'YM', type: 'SELL', profit: 2.9, time: '18 min', confidence: 91 },
]

export default function LiveSignalsBanner() {
  const [mounted, setMounted] = useState(false)
  const [signalsData, setSignalsData] = useState(mockRecentSignals)

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulate real-time signal updates
  useEffect(() => {
    if (!mounted) return

    const addNewSignal = () => {
      const symbols = ['ES', 'NQ', 'GC', 'CL', 'RTY', 'YM', 'EUR/USD', 'BTC', 'ETH']
      const types: ('BUY' | 'SELL')[] = ['BUY', 'SELL']
      
      const newSignal: TradingSignal = {
        id: Date.now().toString(),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        type: types[Math.floor(Math.random() * types.length)],
        profit: (Math.random() > 0.8 ? -1 : 1) * (Math.random() * 8 + 1), // Mostly positive
        time: 'Just now',
        confidence: Math.floor(Math.random() * 20 + 75) // 75-95%
      }

      setSignalsData(prev => [newSignal, ...prev.slice(0, 7)]) // Keep only 8 most recent
    }

    // Add new signal every 12 seconds
    const interval = setInterval(addNewSignal, 12000)
    return () => clearInterval(interval)
  }, [mounted])

  // Update time labels
  useEffect(() => {
    if (!mounted) return

    const updateTimes = () => {
      setSignalsData(prev => prev.map((signal, index) => ({
        ...signal,
        time: index === 0 && signal.time === 'Just now' ? '1 min' : signal.time
      })))
    }

    const timeInterval = setInterval(updateTimes, 60000) // Update every minute
    return () => clearInterval(timeInterval)
  }, [mounted])

  // Don't render until mounted
  if (!mounted) return null

  return (
    <motion.div 
      className="relative bg-gradient-to-r from-gray-900/95 via-black/90 to-gray-900/95 border-y border-gray-800/30 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Recent Trading Signals</h3>
            <Badge variant="outline" className="text-xs border-green-400/30 text-green-300 bg-green-400/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
              Live
            </Badge>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Real-time AI signals</span>
          </div>
        </div>
      </div>

      {/* Scrolling Signals */}
      <div className="relative overflow-hidden">
        <motion.div 
          className="flex space-x-4 pb-4"
          animate={{ x: [0, -50] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Duplicate signals for seamless loop */}
          {[...signalsData, ...signalsData].map((signal, index) => (
            <motion.div
              key={`${signal.id}-${index}`}
              className="flex-shrink-0 bg-gray-800/60 border border-gray-700/50 rounded-lg px-4 py-3 min-w-[200px] backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: (index % signalsData.length) * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-bold ${
                    signal.type === 'BUY' 
                      ? 'border-green-400/50 text-green-300 bg-green-400/10' 
                      : 'border-red-400/50 text-red-300 bg-red-400/10'
                  }`}
                >
                  {signal.type}
                </Badge>
                <span className="text-white font-bold text-sm">{signal.symbol}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {signal.profit >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={`text-sm font-bold ${
                    signal.profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {signal.profit >= 0 ? '+' : ''}{signal.profit.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-gray-400">{signal.time} ago</span>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                {signal.confidence}% confidence
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Gradient Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
    </motion.div>
  )
}
