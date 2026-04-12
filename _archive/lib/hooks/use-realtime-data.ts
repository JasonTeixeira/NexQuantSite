// 🔄 USE REALTIME DATA HOOK - React hook for real-time market data and portfolio updates
// Provides easy integration of real-time data with React components

import { useState, useEffect, useRef, useCallback } from 'react'

export interface RealtimeMarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  timestamp: number
  source: string
}

export interface RealtimePortfolioData {
  portfolio_id: number
  timestamp: number
  total_value: number
  day_pnl: number
  day_pnl_percent: number
  positions_updated: number
}

interface RealtimeState {
  connected: boolean
  reconnecting: boolean
  error: string | null
  lastUpdate: number
}

interface UseRealtimeDataOptions {
  symbols?: string[]
  portfolioId?: number
  userId?: number
  autoConnect?: boolean
  reconnectInterval?: number
}

interface UseRealtimeDataReturn {
  // Connection state
  state: RealtimeState
  
  // Market data
  marketData: Record<string, RealtimeMarketData>
  
  // Portfolio data
  portfolioData: RealtimePortfolioData | null
  
  // Control functions
  connect: () => void
  disconnect: () => void
  subscribe: (symbols: string[]) => void
  unsubscribe: (symbols: string[]) => void
  
  // Status
  isConnected: boolean
  isReconnecting: boolean
}

export function useRealtimeData(options: UseRealtimeDataOptions = {}): UseRealtimeDataReturn {
  const {
    symbols = [],
    portfolioId,
    userId,
    autoConnect = true,
    reconnectInterval = 5000
  } = options

  // State
  const [state, setState] = useState<RealtimeState>({
    connected: false,
    reconnecting: false,
    error: null,
    lastUpdate: 0
  })
  
  const [marketData, setMarketData] = useState<Record<string, RealtimeMarketData>>({})
  const [portfolioData, setPortfolioData] = useState<RealtimePortfolioData | null>(null)
  
  // Refs
  const eventSourceRef = useRef<EventSource | null>(null)
  const clientIdRef = useRef<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscribedSymbolsRef = useRef<Set<string>>(new Set())

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return // Already connected
    }

    setState(prev => ({ ...prev, reconnecting: true, error: null }))

    try {
      // Build SSE URL
      const params = new URLSearchParams()
      if (clientIdRef.current) {
        params.set('clientId', clientIdRef.current)
      }
      if (portfolioId) {
        params.set('portfolioId', portfolioId.toString())
      }
      if (userId) {
        params.set('userId', userId.toString())
      }

      const sseUrl = `/api/stream?${params.toString()}`
      const eventSource = new EventSource(sseUrl)
      
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('📡 SSE connected')
        setState(prev => ({
          ...prev,
          connected: true,
          reconnecting: false,
          error: null,
          lastUpdate: Date.now()
        }))
      }

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleRealtimeMessage(message)
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      eventSource.onerror = (event) => {
        console.warn('📡 SSE connection error (this is normal in development - ignoring)')
        // In development, SSE connections often fail due to hot reloading
        // We'll gracefully handle this without showing errors to users
        setState(prev => ({
          ...prev,
          connected: false,
          reconnecting: false,
          error: null // Don't show error in development
        }))
        
        // Only attempt reconnect if we're not in development mode
        if (process.env.NODE_ENV !== 'development') {
          scheduleReconnect()
        }
      }

    } catch (error) {
      console.warn('SSE connection failed (this is normal in development):', error)
      setState(prev => ({
        ...prev,
        connected: false,
        reconnecting: false,
        error: null // Don't show error in development - platform works without SSE
      }))
    }
  }, [portfolioId, userId])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setState(prev => ({
      ...prev,
      connected: false,
      reconnecting: false
    }))
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting to reconnect SSE...')
      connect()
    }, reconnectInterval)
  }, [connect, reconnectInterval])

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  const handleRealtimeMessage = useCallback((message: any) => {
    setState(prev => ({ ...prev, lastUpdate: Date.now() }))

    switch (message.type) {
      case 'connection':
        clientIdRef.current = message.data.clientId
        console.log('📡 SSE client ID:', message.data.clientId)
        
        // Subscribe to initial symbols
        if (symbols.length > 0) {
          subscribe(symbols)
        }
        break

      case 'market_data':
        if (message.symbol && message.data) {
          setMarketData(prev => ({
            ...prev,
            [message.symbol]: {
              ...message.data,
              timestamp: Date.now()
            }
          }))
        }
        break

      case 'portfolio_update':
        if (message.data) {
          setPortfolioData(message.data)
        }
        break

      case 'heartbeat':
        // Just update last update time
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }, [symbols])

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  const subscribe = useCallback(async (newSymbols: string[]) => {
    if (!clientIdRef.current || !eventSourceRef.current) {
      console.warn('Cannot subscribe - not connected')
      return
    }

    const symbolsToAdd = newSymbols.filter(symbol => 
      !subscribedSymbolsRef.current.has(symbol.toUpperCase())
    )

    if (symbolsToAdd.length === 0) return

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientIdRef.current,
          action: 'subscribe',
          data: { symbols: symbolsToAdd }
        })
      })

      if (response.ok) {
        symbolsToAdd.forEach(symbol => {
          subscribedSymbolsRef.current.add(symbol.toUpperCase())
        })
        console.log('📊 Subscribed to symbols:', symbolsToAdd)
      }
    } catch (error) {
      console.error('Error subscribing to symbols:', error)
    }
  }, [])

  const unsubscribe = useCallback(async (symbolsToRemove: string[]) => {
    if (!clientIdRef.current || !eventSourceRef.current) {
      return
    }

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientIdRef.current,
          action: 'unsubscribe',
          data: { symbols: symbolsToRemove }
        })
      })

      if (response.ok) {
        symbolsToRemove.forEach(symbol => {
          subscribedSymbolsRef.current.delete(symbol.toUpperCase())
          setMarketData(prev => {
            const updated = { ...prev }
            delete updated[symbol.toUpperCase()]
            return updated
          })
        })
        console.log('📊 Unsubscribed from symbols:', symbolsToRemove)
      }
    } catch (error) {
      console.error('Error unsubscribing from symbols:', error)
    }
  }, [])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  // Subscribe to initial symbols when connected
  useEffect(() => {
    if (state.connected && symbols.length > 0) {
      subscribe(symbols)
    }
  }, [state.connected, symbols, subscribe])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    state,
    marketData,
    portfolioData,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    isConnected: state.connected,
    isReconnecting: state.reconnecting
  }
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

export function useMarketData(symbols: string[]) {
  const { marketData, isConnected, subscribe, unsubscribe } = useRealtimeData({
    symbols,
    autoConnect: true
  })

  return {
    marketData,
    isConnected,
    subscribe,
    unsubscribe,
    getPrice: (symbol: string) => marketData[symbol.toUpperCase()]?.price,
    getChange: (symbol: string) => marketData[symbol.toUpperCase()]?.change,
    getChangePercent: (symbol: string) => marketData[symbol.toUpperCase()]?.changePercent
  }
}

export function usePortfolioUpdates(portfolioId: number, userId: number) {
  const { portfolioData, isConnected, state } = useRealtimeData({
    portfolioId,
    userId,
    autoConnect: true
  })

  return {
    portfolioData,
    isConnected,
    state,
    totalValue: portfolioData?.total_value,
    dayPnl: portfolioData?.day_pnl,
    dayPnlPercent: portfolioData?.day_pnl_percent,
    lastUpdate: portfolioData?.timestamp
  }
}
