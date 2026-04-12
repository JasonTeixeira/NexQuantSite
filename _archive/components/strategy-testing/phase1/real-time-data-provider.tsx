"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from "react"

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

interface RealTimeDataContextType {
  marketData: Map<string, MarketData>
  isConnected: boolean
  subscribe: (symbol: string) => void
  unsubscribe: (symbol: string) => void
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
}

const RealTimeDataContext = createContext<RealTimeDataContextType | null>(null)

export const useRealTimeData = () => {
  const context = useContext(RealTimeDataContext)
  if (!context) {
    throw new Error("useRealTimeData must be used within RealTimeDataProvider")
  }
  return context
}

export const RealTimeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const wsRef = useRef<WebSocket | null>(null)
  const subscriptionsRef = useRef<Set<string>>(new Set())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate real-time market data (replace with actual WebSocket connection)
  const simulateMarketData = () => {
    const symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "META", "AMZN", "NFLX"]

    const updateData = () => {
      setMarketData((prev) => {
        const newData = new Map(prev)

        symbols.forEach((symbol) => {
          const existing = newData.get(symbol)
          const basePrice = existing?.price || 100 + Math.random() * 400
          const change = (Math.random() - 0.5) * 5
          const newPrice = Math.max(0.01, basePrice + change)

          newData.set(symbol, {
            symbol,
            price: newPrice,
            change: newPrice - (existing?.price || newPrice),
            changePercent: existing?.price ? ((newPrice - existing.price) / existing.price) * 100 : 0,
            volume: Math.floor(Math.random() * 1000000),
            timestamp: Date.now(),
          })
        })

        return newData
      })
    }

    // Initial data
    updateData()

    // Update every 1 second
    const interval = setInterval(updateData, 1000)
    return () => clearInterval(interval)
  }

  const connectWebSocket = () => {
    setConnectionStatus("connecting")

    // For demo purposes, simulate connection
    setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus("connected")
      console.log("[v0] Real-time data connection established")
    }, 1000)

    return simulateMarketData()
  }

  const subscribe = useCallback((symbol: string) => {
    subscriptionsRef.current.add(symbol)
    console.log(`[v0] Subscribed to ${symbol}`)
  }, [])

  const unsubscribe = useCallback((symbol: string) => {
    subscriptionsRef.current.delete(symbol)
    console.log(`[v0] Unsubscribed from ${symbol}`)
  }, [])

  useEffect(() => {
    const cleanup = connectWebSocket()

    return () => {
      if (cleanup) cleanup()
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  const contextValue = useMemo(() => ({
    marketData,
    isConnected,
    subscribe,
    unsubscribe,
    connectionStatus,
  }), [marketData, isConnected, subscribe, unsubscribe, connectionStatus])

  return (
    <RealTimeDataContext.Provider value={contextValue}>
      {children}
    </RealTimeDataContext.Provider>
  )
}
