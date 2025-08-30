import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

export interface TradingSignal {
  id: string
  symbol: string
  type: "buy" | "sell"
  price: number
  targetPrice: number
  stopLoss: number
  confidence: number
  timeframe: string
  strategy: string
  createdAt: string
  status: "active" | "executed" | "expired" | "cancelled"
}

export interface Portfolio {
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  dayPnL: number
  dayPnLPercent: number
  positions: Position[]
  cash: number
  marginUsed: number
  marginAvailable: number
}

export interface Position {
  id: string
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  pnl: number
  pnlPercent: number
  side: "long" | "short"
  openedAt: string
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
    totalPnLPercent: number
    sharpeRatio: number
    maxDrawdown: number
  }
  settings: Record<string, any>
  createdAt: string
}

export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high24h: number
  low24h: number
  marketCap?: number
  lastUpdated: string
}

interface TradingState {
  signals: TradingSignal[]
  portfolio: Portfolio | null
  positions: Position[]
  bots: TradingBot[]
  marketData: Record<string, MarketData>
  watchlist: string[]
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

interface TradingActions {
  setSignals: (signals: TradingSignal[]) => void
  addSignal: (signal: TradingSignal) => void
  updateSignal: (id: string, updates: Partial<TradingSignal>) => void
  setPortfolio: (portfolio: Portfolio) => void
  updatePosition: (id: string, updates: Partial<Position>) => void
  setBots: (bots: TradingBot[]) => void
  updateBot: (id: string, updates: Partial<TradingBot>) => void
  setMarketData: (symbol: string, data: MarketData) => void
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastUpdated: () => void
}

export const useTradingStore = create<TradingState & TradingActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    signals: [],
    portfolio: null,
    positions: [],
    bots: [],
    marketData: {},
    watchlist: [],
    isLoading: false,
    error: null,
    lastUpdated: null,

    // Actions
    setSignals: (signals) => set({ signals }),

    addSignal: (signal) =>
      set((state) => ({
        signals: [signal, ...state.signals],
      })),

    updateSignal: (id, updates) =>
      set((state) => ({
        signals: state.signals.map((signal) => (signal.id === id ? { ...signal, ...updates } : signal)),
      })),

    setPortfolio: (portfolio) =>
      set({
        portfolio,
        positions: portfolio.positions,
      }),

    updatePosition: (id, updates) =>
      set((state) => ({
        positions: state.positions.map((position) => (position.id === id ? { ...position, ...updates } : position)),
      })),

    setBots: (bots) => set({ bots }),

    updateBot: (id, updates) =>
      set((state) => ({
        bots: state.bots.map((bot) => (bot.id === id ? { ...bot, ...updates } : bot)),
      })),

    setMarketData: (symbol, data) =>
      set((state) => ({
        marketData: { ...state.marketData, [symbol]: data },
      })),

    addToWatchlist: (symbol) =>
      set((state) => ({
        watchlist: state.watchlist.includes(symbol) ? state.watchlist : [...state.watchlist, symbol],
      })),

    removeFromWatchlist: (symbol) =>
      set((state) => ({
        watchlist: state.watchlist.filter((s) => s !== symbol),
      })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setLastUpdated: () => set({ lastUpdated: new Date().toISOString() }),
  })),
)
