/**
 * Backend Connector - Centralized backend integration layer
 * This handles all communication with your backend API
 */

import { apiClient } from './client'
import { websocketManager } from '../realtime/websocket-manager'
import type { 
  User, 
  TradingSignal, 
  Portfolio, 
  Trade, 
  MarketData,
  TradingBot,
  Position 
} from '../database/models'

// API Response wrapper
interface BackendResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

// Request configuration
interface RequestOptions {
  retries?: number
  timeout?: number
  cache?: boolean
}

class BackendConnector {
  private isInitialized = false
  private authToken: string | null = null
  private refreshToken: string | null = null

  /**
   * Initialize backend connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Check backend health
      await this.healthCheck()
      
      // Initialize WebSocket connection
      await websocketManager.connect()
      
      // Setup WebSocket subscriptions
      this.setupWebSocketSubscriptions()
      
      this.isInitialized = true
      console.log('✅ Backend connector initialized')
    } catch (error) {
      console.error('❌ Failed to initialize backend connector:', error)
      throw error
    }
  }

  /**
   * Health check for backend services
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get<any>('/health')
      return response.success
    } catch (error) {
      console.error('Backend health check failed:', error)
      return false
    }
  }

  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string): Promise<User> {
    const response = await apiClient.post<BackendResponse<{
      user: User
      accessToken: string
      refreshToken: string
    }>>('/auth/login', { email, password })

    if (!response.data?.data) {
      throw new Error(response.data?.error || 'Login failed')
    }

    // Store tokens
    this.authToken = response.data.data.accessToken
    this.refreshToken = response.data.data.refreshToken
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', this.authToken)
      localStorage.setItem('refresh_token', this.refreshToken)
    }

    return response.data.data.user
  }

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username: string
  }): Promise<User> {
    const response = await apiClient.post<BackendResponse<User>>('/auth/register', userData)
    
    if (!response.data?.data) {
      throw new Error(response.data?.error || 'Registration failed')
    }

    return response.data.data
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      // Clear tokens regardless of API response
      this.authToken = null
      this.refreshToken = null
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
      }
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<BackendResponse<{
      accessToken: string
    }>>('/auth/refresh', { refreshToken: this.refreshToken })

    if (!response.data?.data?.accessToken) {
      throw new Error('Token refresh failed')
    }

    this.authToken = response.data.data.accessToken
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', this.authToken)
    }

    return this.authToken
  }

  // ==================== USER MANAGEMENT ====================

  async getUserProfile(): Promise<User> {
    const response = await apiClient.get<BackendResponse<User>>('/users/profile')
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch user profile')
    }

    return response.data.data
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const response = await apiClient.put<BackendResponse<User>>('/users/profile', updates)
    
    if (!response.data?.data) {
      throw new Error('Failed to update profile')
    }

    return response.data.data
  }

  async enable2FA(): Promise<{ secret: string; qrCode: string }> {
    const response = await apiClient.post<BackendResponse<{
      secret: string
      qrCode: string
    }>>('/users/2fa/setup')
    
    if (!response.data?.data) {
      throw new Error('Failed to setup 2FA')
    }

    return response.data.data
  }

  async verify2FA(code: string): Promise<boolean> {
    const response = await apiClient.post<BackendResponse<boolean>>('/users/2fa/verify', { code })
    return response.data?.data || false
  }

  // ==================== TRADING ====================

  async getPortfolio(): Promise<Portfolio> {
    const response = await apiClient.get<BackendResponse<Portfolio>>('/trading/portfolio')
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch portfolio')
    }

    return response.data.data
  }

  async getPositions(): Promise<Position[]> {
    const response = await apiClient.get<BackendResponse<Position[]>>('/trading/positions')
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch positions')
    }

    return response.data.data
  }

  async placeOrder(order: {
    symbol: string
    side: 'buy' | 'sell'
    type: 'market' | 'limit' | 'stop' | 'stop_limit'
    quantity: number
    price?: number
    stopPrice?: number
  }): Promise<Trade> {
    const response = await apiClient.post<BackendResponse<Trade>>('/trading/orders', order)
    
    if (!response.data?.data) {
      throw new Error(response.data?.error || 'Failed to place order')
    }

    return response.data.data
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const response = await apiClient.delete<BackendResponse<boolean>>(`/trading/orders/${orderId}`)
    return response.data?.success || false
  }

  async getTradeHistory(options?: {
    limit?: number
    offset?: number
    symbol?: string
  }): Promise<Trade[]> {
    const response = await apiClient.get<BackendResponse<Trade[]>>('/trading/history', { params: options } as any)
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch trade history')
    }

    return response.data.data
  }

  // ==================== MARKET DATA ====================

  async getTickers(): Promise<MarketData[]> {
    const response = await apiClient.get<BackendResponse<MarketData[]>>('/market/tickers', {
      cache: true
    })
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch tickers')
    }

    return response.data.data
  }

  async getTicker(symbol: string): Promise<MarketData> {
    const response = await apiClient.get<BackendResponse<MarketData>>(`/market/ticker/${symbol}`, {
      cache: true
    })
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch ticker')
    }

    return response.data.data
  }

  async getOrderBook(symbol: string, limit = 100): Promise<{
    bids: [number, number][]
    asks: [number, number][]
  }> {
    const response = await apiClient.get<BackendResponse<any>>(`/market/orderbook/${symbol}`, {
      params: { limit }
    } as any)
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch order book')
    }

    return response.data.data
  }

  async getKlines(
    symbol: string,
    interval: string,
    limit = 500
  ): Promise<Array<{
    openTime: number
    open: number
    high: number
    low: number
    close: number
    volume: number
    closeTime: number
  }>> {
    const response = await apiClient.get<BackendResponse<any[]>>(
      `/market/klines/${symbol}`,
      { params: { interval, limit } } as any
    )
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch klines')
    }

    return response.data.data
  }

  // ==================== SIGNALS ====================

  async getSignals(options?: {
    status?: string
    limit?: number
  }): Promise<TradingSignal[]> {
    const response = await apiClient.get<BackendResponse<TradingSignal[]>>('/signals', { params: options } as any)
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch signals')
    }

    return response.data.data
  }

  async getSignal(signalId: string): Promise<TradingSignal> {
    const response = await apiClient.get<BackendResponse<TradingSignal>>(`/signals/${signalId}`)
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch signal')
    }

    return response.data.data
  }

  async executeSignal(signalId: string): Promise<Trade> {
    const response = await apiClient.post<BackendResponse<Trade>>(`/signals/${signalId}/execute`)
    
    if (!response.data?.data) {
      throw new Error('Failed to execute signal')
    }

    return response.data.data
  }

  async getSignalPerformance(): Promise<any> {
    const response = await apiClient.get<BackendResponse<any>>('/signals/performance')
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch signal performance')
    }

    return response.data.data
  }

  // ==================== BOTS ====================

  async getBots(): Promise<TradingBot[]> {
    const response = await apiClient.get<BackendResponse<TradingBot[]>>('/bots')
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch bots')
    }

    return response.data.data
  }

  async createBot(bot: Partial<TradingBot>): Promise<TradingBot> {
    const response = await apiClient.post<BackendResponse<TradingBot>>('/bots', bot)
    
    if (!response.data?.data) {
      throw new Error('Failed to create bot')
    }

    return response.data.data
  }

  async updateBot(botId: string, updates: Partial<TradingBot>): Promise<TradingBot> {
    const response = await apiClient.put<BackendResponse<TradingBot>>(`/bots/${botId}`, updates)
    
    if (!response.data?.data) {
      throw new Error('Failed to update bot')
    }

    return response.data.data
  }

  async deleteBot(botId: string): Promise<boolean> {
    const response = await apiClient.delete<BackendResponse<boolean>>(`/bots/${botId}`)
    return response.data?.success || false
  }

  async startBot(botId: string): Promise<boolean> {
    const response = await apiClient.post<BackendResponse<boolean>>(`/bots/${botId}/start`)
    return response.data?.success || false
  }

  async stopBot(botId: string): Promise<boolean> {
    const response = await apiClient.post<BackendResponse<boolean>>(`/bots/${botId}/stop`)
    return response.data?.success || false
  }

  async getBotPerformance(botId: string): Promise<any> {
    const response = await apiClient.get<BackendResponse<any>>(`/bots/${botId}/performance`)
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch bot performance')
    }

    return response.data.data
  }

  // ==================== WEBSOCKET SUBSCRIPTIONS ====================

  private setupWebSocketSubscriptions(): void {
    // Subscribe to market data
    websocketManager.subscribe('market:*', (data) => {
      // Handle market updates
      this.handleMarketUpdate(data)
    })

    // Subscribe to signals
    websocketManager.subscribe('signals', (data) => {
      // Handle new signals
      this.handleSignalUpdate(data)
    })

    // Subscribe to trade executions
    websocketManager.subscribe('trades', (data) => {
      // Handle trade updates
      this.handleTradeUpdate(data)
    })

    // Subscribe to order updates
    websocketManager.subscribe('orders', (data) => {
      // Handle order updates
      this.handleOrderUpdate(data)
    })

    // Subscribe to bot status updates
    websocketManager.subscribe('bots', (data) => {
      // Handle bot status updates
      this.handleBotUpdate(data)
    })
  }

  private handleMarketUpdate(data: any): void {
    // Emit event or update store
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('market:update', { detail: data }))
    }
  }

  private handleSignalUpdate(data: any): void {
    // Emit event or update store
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('signal:new', { detail: data }))
    }
  }

  private handleTradeUpdate(data: any): void {
    // Emit event or update store
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trade:executed', { detail: data }))
    }
  }

  private handleOrderUpdate(data: any): void {
    // Emit event or update store
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('order:update', { detail: data }))
    }
  }

  private handleBotUpdate(data: any): void {
    // Emit event or update store
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bot:status', { detail: data }))
    }
  }

  // ==================== UTILITIES ====================

  isAuthenticated(): boolean {
    return !!this.authToken
  }

  getAuthToken(): string | null {
    return this.authToken
  }

  async waitForConnection(maxAttempts = 10, delay = 1000): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.healthCheck()) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    throw new Error('Failed to connect to backend after multiple attempts')
  }
}

// Export singleton instance
export const backendConnector = new BackendConnector()

// Export for use in components
export default backendConnector
