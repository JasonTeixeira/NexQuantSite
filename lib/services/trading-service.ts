import { apiClient } from "@/lib/api/client"
import { useTradingStore } from "@/lib/stores/trading-store"

export interface TradingSignal {
  id: string
  symbol: string
  type: "buy" | "sell"
  price: number
  targetPrice?: number
  stopLoss?: number
  confidence: number
  timestamp: string
  status: "active" | "executed" | "expired"
  botId: string
  reasoning?: string
}

export interface Portfolio {
  totalValue: number
  totalPnL: number
  totalPnLPercentage: number
  availableBalance: number
  positions: Position[]
}

export interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
  side: "long" | "short"
  openTime: string
}

export interface TradingBot {
  id: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
    sharpeRatio: number
    maxDrawdown: number
  }
  settings: Record<string, any>
}

export interface MarketData {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  timestamp: string
}

class TradingService {
  async getSignals(params?: {
    symbol?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<TradingSignal[]> {
    const response = await apiClient.get<TradingSignal[]>("/trading/signals", {
      headers: { "X-Query-Params": JSON.stringify(params) },
    })

    // Update trading store
    const tradingStore = useTradingStore.getState()
    tradingStore.setSignals(response.data as any)

    return response.data
  }

  async createSignal(signal: Omit<TradingSignal, "id" | "timestamp" | "status">): Promise<TradingSignal> {
    const response = await apiClient.post<TradingSignal>("/trading/signals", signal)

    // Update trading store
    const tradingStore = useTradingStore.getState()
    tradingStore.addSignal(response.data as any)

    return response.data
  }

  async updateSignal(id: string, updates: Partial<TradingSignal>): Promise<TradingSignal> {
    const response = await apiClient.put<TradingSignal>(`/trading/signals/${id}`, updates)

    // Update trading store
    const tradingStore = useTradingStore.getState()
    tradingStore.updateSignal(id, response.data as any)

    return response.data
  }

  async getPortfolio(): Promise<Portfolio> {
    const response = await apiClient.get<Portfolio>("/trading/portfolio")

    // Update trading store
    const tradingStore = useTradingStore.getState()
    tradingStore.setPortfolio(response.data as any)

    return response.data
  }

  async getBots(): Promise<TradingBot[]> {
    const response = await apiClient.get<TradingBot[]>("/trading/bots")

    // Update trading store
    const tradingStore = useTradingStore.getState()
    tradingStore.setBots(response.data as any)

    return response.data
  }

  async createBot(bot: Omit<TradingBot, "id" | "performance">): Promise<TradingBot> {
    const response = await apiClient.post<TradingBot>("/trading/bots", bot)

    // Update trading store
    const tradingStore = useTradingStore.getState()
    const currentBots = tradingStore.bots
    tradingStore.setBots([...currentBots, response.data as any])

    return response.data
  }

  async updateBot(id: string, updates: Partial<TradingBot>): Promise<TradingBot> {
    const response = await apiClient.put<TradingBot>(`/trading/bots/${id}`, updates)

    // Update trading store
    const tradingStore = useTradingStore.getState()
    tradingStore.updateBot(id, response.data as any)

    return response.data
  }

  async deleteBot(id: string): Promise<void> {
    await apiClient.delete(`/trading/bots/${id}`)

    // Update trading store
    const tradingStore = useTradingStore.getState()
    const currentBots = tradingStore.bots
    tradingStore.setBots(currentBots.filter((bot) => bot.id !== id))
  }

  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    const response = await apiClient.get<MarketData[]>("/trading/market-data", {
      headers: { "X-Symbols": symbols.join(",") },
    })

    // Update trading store
    const tradingStore = useTradingStore.getState()
    response.data.forEach((data) => {
      tradingStore.setMarketData(data.symbol, data as any)
    })

    return response.data
  }

  async executeOrder(order: {
    symbol: string
    type: "market" | "limit"
    side: "buy" | "sell"
    quantity: number
    price?: number
  }): Promise<{ orderId: string; status: string }> {
    const response = await apiClient.post<{ orderId: string; status: string }>("/trading/orders", order)
    return response.data
  }

  async getOrderHistory(params?: {
    symbol?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<any[]> {
    const response = await apiClient.get<any[]>("/trading/orders/history", {
      headers: { "X-Query-Params": JSON.stringify(params) },
    })
    return response.data
  }

  async getBacktestResults(
    botId: string,
    params: {
      startDate: string
      endDate: string
      initialBalance: number
    },
  ): Promise<any> {
    const response = await apiClient.post<any>(`/trading/bots/${botId}/backtest`, params)
    return response.data
  }
}

export const tradingService = new TradingService()
