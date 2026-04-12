/**
 * React hooks for backend integration
 * Use these hooks in your components instead of direct API calls
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { backendConnector } from '../api/backend-connector'
import type { 
  User, 
  TradingSignal, 
  Portfolio, 
  Trade, 
  MarketData,
  TradingBot,
  Position 
} from '../database/models'

// ==================== TYPES ====================

interface UseQueryResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  data: TData | null
  loading: boolean
  error: Error | null
  reset: () => void
}

interface UseWebSocketResult<T> {
  data: T | null
  connected: boolean
  error: Error | null
}

// ==================== QUERY HOOKS ====================

/**
 * Generic query hook for fetching data
 */
function useQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await queryFn()
      setData(result)
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Generic mutation hook for modifying data
 */
function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true)
      setError(null)
      const result = await mutationFn(variables)
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [mutationFn])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { mutate, data, loading, error, reset }
}

// ==================== AUTH HOOKS ====================

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          const profile = await backendConnector.getUserProfile()
          setUser(profile)
          setAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const user = await backendConnector.login(email, password)
    setUser(user)
    setAuthenticated(true)
    return user
  }, [])

  const logout = useCallback(async () => {
    await backendConnector.logout()
    setUser(null)
    setAuthenticated(false)
  }, [])

  const register = useCallback(async (userData: any) => {
    const user = await backendConnector.register(userData)
    return user
  }, [])

  return {
    user,
    loading,
    authenticated,
    login,
    logout,
    register
  }
}

// ==================== TRADING HOOKS ====================

export function usePortfolio() {
  return useQuery(() => backendConnector.getPortfolio())
}

export function usePositions() {
  return useQuery(() => backendConnector.getPositions())
}

export function usePlaceOrder() {
  return useMutation((order: Parameters<typeof backendConnector.placeOrder>[0]) => 
    backendConnector.placeOrder(order)
  )
}

export function useCancelOrder() {
  return useMutation((orderId: string) => 
    backendConnector.cancelOrder(orderId)
  )
}

export function useTradeHistory(options?: { limit?: number; offset?: number; symbol?: string }) {
  return useQuery(() => backendConnector.getTradeHistory(options), [options])
}

// ==================== MARKET DATA HOOKS ====================

export function useTickers() {
  return useQuery(() => backendConnector.getTickers())
}

export function useTicker(symbol: string) {
  return useQuery(() => backendConnector.getTicker(symbol), [symbol])
}

export function useOrderBook(symbol: string, limit = 100) {
  return useQuery(() => backendConnector.getOrderBook(symbol, limit), [symbol, limit])
}

export function useKlines(symbol: string, interval: string, limit = 500) {
  return useQuery(
    () => backendConnector.getKlines(symbol, interval, limit),
    [symbol, interval, limit]
  )
}

// ==================== SIGNALS HOOKS ====================

export function useSignals(options?: { status?: string; limit?: number }) {
  return useQuery(() => backendConnector.getSignals(options), [options])
}

export function useSignal(signalId: string) {
  return useQuery(() => backendConnector.getSignal(signalId), [signalId])
}

export function useExecuteSignal() {
  return useMutation((signalId: string) => 
    backendConnector.executeSignal(signalId)
  )
}

export function useSignalPerformance() {
  return useQuery(() => backendConnector.getSignalPerformance())
}

// ==================== BOTS HOOKS ====================

export function useBots() {
  return useQuery(() => backendConnector.getBots())
}

export function useCreateBot() {
  return useMutation((bot: Parameters<typeof backendConnector.createBot>[0]) => 
    backendConnector.createBot(bot)
  )
}

export function useUpdateBot() {
  return useMutation(({ botId, updates }: { 
    botId: string
    updates: Parameters<typeof backendConnector.updateBot>[1] 
  }) => backendConnector.updateBot(botId, updates))
}

export function useDeleteBot() {
  return useMutation((botId: string) => 
    backendConnector.deleteBot(botId)
  )
}

export function useStartBot() {
  return useMutation((botId: string) => 
    backendConnector.startBot(botId)
  )
}

export function useStopBot() {
  return useMutation((botId: string) => 
    backendConnector.stopBot(botId)
  )
}

export function useBotPerformance(botId: string) {
  return useQuery(() => backendConnector.getBotPerformance(botId), [botId])
}

// ==================== WEBSOCKET HOOKS ====================

export function useMarketUpdates(symbol?: string) {
  const [data, setData] = useState<MarketData | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      if (!symbol || event.detail.symbol === symbol) {
        setData(event.detail)
      }
    }

    const handleConnection = () => setConnected(true)
    const handleDisconnection = () => setConnected(false)
    const handleError = (err: any) => setError(err)

    window.addEventListener('market:update', handleUpdate as any)
    window.addEventListener('ws:connected', handleConnection)
    window.addEventListener('ws:disconnected', handleDisconnection)
    window.addEventListener('ws:error', handleError)

    return () => {
      window.removeEventListener('market:update', handleUpdate as any)
      window.removeEventListener('ws:connected', handleConnection)
      window.removeEventListener('ws:disconnected', handleDisconnection)
      window.removeEventListener('ws:error', handleError)
    }
  }, [symbol])

  return { data, connected, error }
}

export function useSignalUpdates() {
  const [data, setData] = useState<TradingSignal | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      setData(event.detail)
    }

    window.addEventListener('signal:new', handleUpdate as any)

    return () => {
      window.removeEventListener('signal:new', handleUpdate as any)
    }
  }, [])

  return { data, connected, error }
}

export function useTradeUpdates() {
  const [data, setData] = useState<Trade | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      setData(event.detail)
    }

    window.addEventListener('trade:executed', handleUpdate as any)

    return () => {
      window.removeEventListener('trade:executed', handleUpdate as any)
    }
  }, [])

  return { data, connected, error }
}

// ==================== UTILITY HOOKS ====================

export function useBackendHealth() {
  const [healthy, setHealthy] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await backendConnector.healthCheck()
        setHealthy(isHealthy)
      } catch {
        setHealthy(false)
      } finally {
        setChecking(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return { healthy, checking }
}

export function useBackendConnection() {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const connect = async () => {
      try {
        await backendConnector.initialize()
        setConnected(true)
      } catch (err) {
        setError(err as Error)
        setConnected(false)
      } finally {
        setConnecting(false)
      }
    }

    connect()
  }, [])

  return { connected, connecting, error }
}
