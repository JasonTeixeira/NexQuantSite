export interface HeaderStats {
  totalValue: number
  totalPnl: number
  totalPnlPercent: number
  activeBots: number
  totalTrades: number
}

export interface PerformanceDataPoint {
  date: string
  value: number
  benchmark?: number
}

export interface BotPerformance {
  name: string
  status: "Active" | "Paused" | "Stopped"
  pnl: number
  pnlPercent: number
  sharpe: number
  maxDrawdown: number
  winRate: number
  trades: number
  performanceHistory: Array<{ date: string; value: number }>
}

export interface PortfolioAllocation {
  name: string
  value: number
  color: string
}

export interface Trade {
  id: string
  bot: string
  pair: string
  type: "Buy" | "Sell"
  amount: number
  price: number
  pnl: number
  time: string
}

export interface FuturesMarket {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  openInterest: number
  fundingRate: number
}

export interface WatchlistItem {
  symbol: string
  price: number
  change: number
  changePercent: number
  alert?: {
    type: "above" | "below"
    price: number
  }
}

export interface RecentTrade {
  id: string
  time: string
  bot: string
  pair: string
  type: "LONG" | "SHORT"
  entry: number
  exit: number
  pnl: number
  pnlPercent: number
}

export interface DashboardData {
  headerStats: HeaderStats
  botPerformance: BotPerformance[]
  portfolioAllocation: PortfolioAllocation[]
  performanceOverview: PerformanceDataPoint[]
  tradeHistory: Trade[]
  futuresMarket: FuturesMarket[]
  futuresWatchlist: WatchlistItem[]
  recentTrades: RecentTrade[]
}

export interface DashboardStatsData {
  totalPnL: {
    value: number
    change: number
  }
  winRate: {
    value: number
    change: number
  }
  totalTrades: {
    value: number
    change: number
  }
  avgReturn: {
    value: number
    change: number
  }
}

// Mock data generation
const random = (min: number, max: number) => Math.random() * (max - min) + min

function generatePerformanceHistory(days: number, startValue: number) {
  const data = []
  let currentValue = startValue

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Add some realistic volatility
    const change = (Math.random() - 0.5) * 0.02 * currentValue
    currentValue += change

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(currentValue * 100) / 100,
      benchmark: startValue * (1 + (days - i) * 0.001), // Slight upward trend for benchmark
    })
  }

  return data
}

function generateTradeHistory(count: number): Trade[] {
  const bots = ["Z", "R", "X", "Q"]
  const pairs = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "ADAUSDT", "LINKUSDT"]
  const types: ("Buy" | "Sell")[] = ["Buy", "Sell"]

  return Array.from({ length: count }, (_, i) => ({
    id: `trade-${i}`,
    bot: bots[Math.floor(Math.random() * bots.length)],
    pair: pairs[Math.floor(Math.random() * pairs.length)],
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.random() * 10,
    price: Math.random() * 50000 + 1000,
    pnl: (Math.random() - 0.4) * 1000,
    time: `${Math.floor(Math.random() * 24)}h ago`,
  }))
}

export async function getDashboardData(): Promise<DashboardData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const headerStats: HeaderStats = {
    totalValue: 125847.32,
    totalPnl: 12847.32,
    totalPnlPercent: 11.37,
    activeBots: 4,
    totalTrades: 1247,
  }

  const botPerformance: BotPerformance[] = [
    {
      name: "Z",
      status: "Active",
      pnl: 2982.78,
      pnlPercent: 24.5,
      sharpe: 1.47,
      maxDrawdown: -3.2,
      winRate: 68.5,
      trades: 342,
      performanceHistory: generatePerformanceHistory(30, 25000),
    },
    {
      name: "R",
      status: "Active",
      pnl: 1782.89,
      pnlPercent: 18.3,
      sharpe: 1.23,
      maxDrawdown: -4.1,
      winRate: 62.3,
      trades: 289,
      performanceHistory: generatePerformanceHistory(30, 20000),
    },
    {
      name: "X",
      status: "Active",
      pnl: 2103.46,
      pnlPercent: 32.7,
      sharpe: 1.15,
      maxDrawdown: -2.8,
      winRate: 71.2,
      trades: 198,
      performanceHistory: generatePerformanceHistory(30, 18000),
    },
    {
      name: "O",
      status: "Paused",
      pnl: -350.88,
      pnlPercent: -8.2,
      sharpe: 0.98,
      maxDrawdown: -5.3,
      winRate: 65.7,
      trades: 156,
      performanceHistory: generatePerformanceHistory(30, 15000),
    },
    {
      name: "Q",
      status: "Active",
      pnl: 1854.21,
      pnlPercent: 27.4,
      sharpe: 2.31,
      maxDrawdown: -4.5,
      winRate: 88.9,
      trades: 234,
      performanceHistory: generatePerformanceHistory(30, 22000),
    },
  ]

  const portfolioAllocation: PortfolioAllocation[] = [
    { name: "Q Bot", value: 25, color: "#B8FF00" },
    { name: "R Bot", value: 20, color: "#00FF88" },
    { name: "X Bot", value: 30, color: "#00BFFF" },
    { name: "O Bot", value: 10, color: "#9966FF" },
    { name: "Z Bot", value: 15, color: "#FF6B35" },
  ]

  const performanceOverview = generatePerformanceHistory(30, 100000)

  const tradeHistory: Trade[] = generateTradeHistory(50)

  const futuresMarket: FuturesMarket[] = [
    {
      symbol: "BTCUSDT",
      price: 43250.5,
      change: 1250.3,
      changePercent: 2.98,
      volume: 2.4e9,
      openInterest: 1.2e9,
      fundingRate: 0.0125,
    },
    {
      symbol: "ETHUSDT",
      price: 2650.75,
      change: -45.25,
      changePercent: -1.68,
      volume: 1.8e9,
      openInterest: 890e6,
      fundingRate: -0.0089,
    },
    {
      symbol: "SOLUSDT",
      price: 98.45,
      change: 3.21,
      changePercent: 3.37,
      volume: 450e6,
      openInterest: 230e6,
      fundingRate: 0.0156,
    },
    {
      symbol: "ADAUSDT",
      price: 0.485,
      change: -0.012,
      changePercent: -2.41,
      volume: 180e6,
      openInterest: 95e6,
      fundingRate: -0.0034,
    },
  ]

  const futuresWatchlist: WatchlistItem[] = [
    {
      symbol: "BTCUSDT",
      price: 43250.5,
      change: 1250.3,
      changePercent: 2.98,
      alert: { type: "above", price: 45000 },
    },
    {
      symbol: "ETHUSDT",
      price: 2650.75,
      change: -45.25,
      changePercent: -1.68,
      alert: { type: "below", price: 2500 },
    },
    {
      symbol: "SOLUSDT",
      price: 98.45,
      change: 3.21,
      changePercent: 3.37,
    },
    {
      symbol: "LINKUSDT",
      price: 14.82,
      change: 0.45,
      changePercent: 3.13,
      alert: { type: "above", price: 16.0 },
    },
  ]

  const recentTrades: RecentTrade[] = [
    {
      id: "1",
      time: "7h ago",
      bot: "Z",
      pair: "RTY",
      type: "SHORT",
      entry: 4562.07,
      exit: 4678.89,
      pnl: 2562.07,
      pnlPercent: 2.52,
    },
    {
      id: "2",
      time: "14h ago",
      bot: "R",
      pair: "ES",
      type: "SHORT",
      entry: 4268.86,
      exit: 4484.56,
      pnl: 1268.86,
      pnlPercent: 5.05,
    },
    {
      id: "3",
      time: "5h ago",
      bot: "X",
      pair: "ES",
      type: "SHORT",
      entry: 4445.19,
      exit: 4453.41,
      pnl: 445.19,
      pnlPercent: 0.18,
    },
    {
      id: "4",
      time: "11h ago",
      bot: "R",
      pair: "GC",
      type: "LONG",
      entry: 4735.27,
      exit: 4750.36,
      pnl: 735.27,
      pnlPercent: 0.32,
    },
    {
      id: "5",
      time: "11h ago",
      bot: "X",
      pair: "ES",
      type: "LONG",
      entry: 4233.41,
      exit: 4610.16,
      pnl: 233.41,
      pnlPercent: 8.9,
    },
    {
      id: "6",
      time: "15h ago",
      bot: "Z",
      pair: "CL",
      type: "LONG",
      entry: 4548.35,
      exit: 4694.45,
      pnl: 548.35,
      pnlPercent: 3.21,
    },
    {
      id: "7",
      time: "7h ago",
      bot: "Z",
      pair: "RTY",
      type: "LONG",
      entry: 4192.84,
      exit: 4370.73,
      pnl: 192.84,
      pnlPercent: 4.24,
    },
    {
      id: "8",
      time: "2h ago",
      bot: "Q",
      pair: "RTY",
      type: "SHORT",
      entry: 4606.94,
      exit: 4548.97,
      pnl: -606.94,
      pnlPercent: -1.26,
    },
    {
      id: "9",
      time: "1h ago",
      bot: "Z",
      pair: "EUR/USD",
      type: "LONG",
      entry: 4826.5,
      exit: 5224.41,
      pnl: 826.5,
      pnlPercent: 8.24,
    },
    {
      id: "10",
      time: "4h ago",
      bot: "R",
      pair: "CL",
      type: "LONG",
      entry: 4933.8,
      exit: 4972.71,
      pnl: 933.8,
      pnlPercent: 0.79,
    },
  ]

  return {
    headerStats,
    botPerformance,
    portfolioAllocation,
    performanceOverview,
    tradeHistory,
    futuresMarket,
    futuresWatchlist,
    recentTrades,
  }
}

export function generateDashboardData(timeframe: string) {
  // Generate data based on timeframe
  const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 365

  const stats = {
    totalPnL: {
      value: 12847.32,
      change: 2.45,
    },
    winRate: {
      value: 68.5,
      change: 1.2,
    },
    totalTrades: {
      value: 1247,
      change: 23,
    },
    avgReturn: {
      value: 2.34,
      change: 0.12,
    },
  }

  const overview = generatePerformanceHistory(days, 100000)

  const bots = [
    {
      name: "Z",
      status: "Active" as const,
      pnl: 2982.78,
      pnlPercent: 24.5,
      sharpe: 1.47,
      maxDrawdown: -3.2,
      winRate: 68.5,
      trades: 342,
      performanceHistory: generatePerformanceHistory(days, 25000),
    },
    {
      name: "R",
      status: "Active" as const,
      pnl: 1782.89,
      pnlPercent: 18.3,
      sharpe: 1.23,
      maxDrawdown: -4.1,
      winRate: 62.3,
      trades: 289,
      performanceHistory: generatePerformanceHistory(days, 20000),
    },
    {
      name: "X",
      status: "Active" as const,
      pnl: 2103.46,
      pnlPercent: 32.7,
      sharpe: 1.15,
      maxDrawdown: -2.8,
      winRate: 71.2,
      trades: 198,
      performanceHistory: generatePerformanceHistory(days, 18000),
    },
    {
      name: "Q",
      status: "Active" as const,
      pnl: 1854.21,
      pnlPercent: 27.4,
      sharpe: 2.31,
      maxDrawdown: -4.5,
      winRate: 88.9,
      trades: 234,
      performanceHistory: generatePerformanceHistory(days, 22000),
    },
  ]

  const allocation = [
    { name: "Q Bot", value: 25, color: "#B8FF00" },
    { name: "R Bot", value: 20, color: "#00FF88" },
    { name: "X Bot", value: 30, color: "#00BFFF" },
    { name: "Z Bot", value: 25, color: "#FF6B35" },
  ]

  const trades = generateTradeHistory(50)

  const insights = [
    {
      title: "Market Volatility",
      description: "Current market conditions show increased volatility",
      trend: "up" as const,
      value: "12.5%",
    },
    {
      title: "Bot Performance",
      description: "Q Bot showing exceptional performance this period",
      trend: "up" as const,
      value: "27.4%",
    },
  ]

  return {
    stats,
    overview,
    bots,
    allocation,
    trades,
    insights,
    lastUpdated: new Date().toISOString(),
  }
}
