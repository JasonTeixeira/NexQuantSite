/**
 * 📊 Dashboard Data
 * Types and functions for the trading dashboard
 */

/**
 * Bot performance data type
 */
export interface BotPerformance {
  id: string;
  name: string;
  description: string;
  type: 'forex' | 'crypto' | 'stocks' | 'futures';
  performanceHistory: PerformancePoint[];
  stats: {
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
    averageReturn: number;
    totalPnl: number;
    totalPnlPercent: number;
  };
  status: 'active' | 'paused' | 'testing';
  riskLevel: 'low' | 'medium' | 'high';
  subscription: 'free' | 'basic' | 'premium' | 'enterprise';
  creator: string;
  markets: string[];
  timeframes: string[];
  launchDate: string;
  lastUpdated: string;
  popularity: number;
  imageUrl?: string;
}

/**
 * Performance data point
 */
export interface PerformancePoint {
  date: string;
  value: number;
  pnl: number;
  trades: number;
}

/**
 * Trade history item
 */
export interface TradeHistoryItem {
  id: string;
  botId: string;
  botName: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number;
  exit: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  openTime: string;
  closeTime: string;
  status: 'open' | 'closed' | 'canceled';
  stopLoss?: number;
  takeProfit?: number;
  strategy: string;
  notes?: string;
}

/**
 * Dashboard data type
 */
export interface DashboardData {
  headerStats: {
    totalValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    accountBalance: number;
    equity: number;
    openPositions: number;
    marginLevel: number;
  };
  performanceOverview: PerformancePoint[];
  botPerformance: BotPerformance[];
  recentTrades: TradeHistoryItem[];
  marketSummary: {
    indexes: Array<{
      name: string;
      value: number;
      change: number;
      changePercent: number;
    }>;
    topGainers: Array<{
      symbol: string;
      name: string;
      changePercent: number;
    }>;
    topLosers: Array<{
      symbol: string;
      name: string;
      changePercent: number;
    }>;
  };
}

/**
 * Generate mock dashboard data
 */
export function getDashboardData(): Promise<DashboardData> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        headerStats: {
          totalValue: 127845.32,
          totalPnl: 15432.21,
          totalPnlPercent: 13.72,
          accountBalance: 112413.11,
          equity: 127845.32,
          openPositions: 8,
          marginLevel: 78.4,
        },
        performanceOverview: generatePerformanceData(180, 100000, 127845.32),
        botPerformance: generateBotPerformanceData(),
        recentTrades: generateTradeHistory(),
        marketSummary: {
          indexes: [
            { name: "S&P 500", value: 5128.62, change: 23.45, changePercent: 0.46 },
            { name: "Nasdaq", value: 16984.10, change: 112.32, changePercent: 0.67 },
            { name: "Dow Jones", value: 39875.21, change: -45.67, changePercent: -0.11 },
            { name: "Russell 2000", value: 2154.65, change: 8.21, changePercent: 0.38 },
          ],
          topGainers: [
            { symbol: "NVDA", name: "NVIDIA Corporation", changePercent: 5.32 },
            { symbol: "AAPL", name: "Apple Inc.", changePercent: 3.21 },
            { symbol: "MSFT", name: "Microsoft Corporation", changePercent: 2.87 },
            { symbol: "AMZN", name: "Amazon.com, Inc.", changePercent: 2.65 },
          ],
          topLosers: [
            { symbol: "META", name: "Meta Platforms, Inc.", changePercent: -2.12 },
            { symbol: "NFLX", name: "Netflix, Inc.", changePercent: -1.87 },
            { symbol: "TSLA", name: "Tesla, Inc.", changePercent: -1.54 },
            { symbol: "GOOG", name: "Alphabet Inc.", changePercent: -1.32 },
          ],
        },
      });
    }, 800); // Simulate network delay
  });
}

/**
 * Generate performance data
 */
function generatePerformanceData(
  days: number,
  startValue: number,
  endValue: number
): PerformancePoint[] {
  const data: PerformancePoint[] = [];
  let currentValue = startValue;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  // Calculate how much to increase each day to reach the end value
  const dailyAvgIncrease = (endValue - startValue) / days;
  
  // Add some volatility to make it look realistic
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Random volatility factor (-0.5% to +0.5% of current value)
    const volatility = (Math.random() - 0.5) * 0.01 * currentValue;
    
    // Daily change with trend + volatility
    const dailyChange = dailyAvgIncrease + volatility;
    currentValue += dailyChange;
    
    // Ensure we don't go negative (unlikely but possible with high volatility)
    if (currentValue < 0) currentValue = startValue * 0.5;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(currentValue.toFixed(2)),
      pnl: parseFloat(dailyChange.toFixed(2)),
      trades: Math.floor(Math.random() * 12) + 1, // 1-12 trades per day
    });
  }

  return data;
}

/**
 * Generate bot performance data
 */
function generateBotPerformanceData(): BotPerformance[] {
  const bots: BotPerformance[] = [
    {
      id: "bot-quantum-forex",
      name: "Quantum Forex Trader",
      description: "AI-powered forex trading bot using quantum algorithms for currency pair analysis and prediction.",
      type: "forex",
      performanceHistory: generatePerformanceData(90, 10000, 11250),
      stats: {
        winRate: 67.8,
        profitFactor: 1.92,
        sharpeRatio: 1.75,
        maxDrawdown: 8.3,
        averageReturn: 0.38,
        totalPnl: 1250,
        totalPnlPercent: 12.5,
      },
      status: "active",
      riskLevel: "medium",
      subscription: "premium",
      creator: "NexQuant Labs",
      markets: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"],
      timeframes: ["15m", "1h", "4h"],
      launchDate: "2025-04-15",
      lastUpdated: "2025-08-22",
      popularity: 89,
      imageUrl: "/images/bots/quantum-forex.png",
    },
    {
      id: "bot-nexural-crypto",
      name: "Nexural Crypto Trader",
      description: "Deep neural network for cryptocurrency trading with advanced sentiment analysis.",
      type: "crypto",
      performanceHistory: generatePerformanceData(90, 10000, 12840),
      stats: {
        winRate: 72.1,
        profitFactor: 2.15,
        sharpeRatio: 1.92,
        maxDrawdown: 12.7,
        averageReturn: 0.42,
        totalPnl: 2840,
        totalPnlPercent: 28.4,
      },
      status: "active",
      riskLevel: "high",
      subscription: "premium",
      creator: "NexQuant Labs",
      markets: ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD"],
      timeframes: ["5m", "15m", "1h", "4h"],
      launchDate: "2025-03-10",
      lastUpdated: "2025-08-28",
      popularity: 95,
      imageUrl: "/images/bots/nexural-crypto.png",
    },
    {
      id: "bot-index-master",
      name: "Index Master",
      description: "Low-risk index fund strategy with optimized entry and exit points based on market conditions.",
      type: "stocks",
      performanceHistory: generatePerformanceData(90, 10000, 10950),
      stats: {
        winRate: 65.2,
        profitFactor: 1.65,
        sharpeRatio: 1.48,
        maxDrawdown: 5.2,
        averageReturn: 0.21,
        totalPnl: 950,
        totalPnlPercent: 9.5,
      },
      status: "active",
      riskLevel: "low",
      subscription: "basic",
      creator: "NexQuant Labs",
      markets: ["SPY", "QQQ", "IWM", "DIA"],
      timeframes: ["1d", "1w"],
      launchDate: "2025-02-20",
      lastUpdated: "2025-08-15",
      popularity: 78,
      imageUrl: "/images/bots/index-master.png",
    },
    {
      id: "bot-futures-momentum",
      name: "Futures Momentum",
      description: "High-frequency futures trading bot focused on momentum indicators and breakouts.",
      type: "futures",
      performanceHistory: generatePerformanceData(90, 10000, 13560),
      stats: {
        winRate: 58.4,
        profitFactor: 2.32,
        sharpeRatio: 1.87,
        maxDrawdown: 15.8,
        averageReturn: 0.53,
        totalPnl: 3560,
        totalPnlPercent: 35.6,
      },
      status: "active",
      riskLevel: "high",
      subscription: "enterprise",
      creator: "NexQuant Labs",
      markets: ["ES", "NQ", "CL", "GC"],
      timeframes: ["5m", "15m", "1h"],
      launchDate: "2025-05-05",
      lastUpdated: "2025-08-25",
      popularity: 82,
      imageUrl: "/images/bots/futures-momentum.png",
    },
    {
      id: "bot-smart-dca",
      name: "Smart DCA",
      description: "Dollar-cost averaging bot with smart timing to optimize entries based on market conditions.",
      type: "stocks",
      performanceHistory: generatePerformanceData(90, 10000, 10780),
      stats: {
        winRate: 78.9,
        profitFactor: 1.59,
        sharpeRatio: 1.42,
        maxDrawdown: 4.8,
        averageReturn: 0.19,
        totalPnl: 780,
        totalPnlPercent: 7.8,
      },
      status: "active",
      riskLevel: "low",
      subscription: "free",
      creator: "NexQuant Labs",
      markets: ["SPY", "AAPL", "MSFT", "AMZN", "GOOGL"],
      timeframes: ["1d", "1w"],
      launchDate: "2025-01-15",
      lastUpdated: "2025-08-10",
      popularity: 91,
      imageUrl: "/images/bots/smart-dca.png",
    },
  ];

  return bots;
}

/**
 * Generate trade history data
 */
function generateTradeHistory(): TradeHistoryItem[] {
  const symbols = {
    forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "EUR/GBP"],
    crypto: ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "XRP/USD", "ADA/USD"],
    stocks: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA"],
    futures: ["ES", "NQ", "CL", "GC", "SI", "ZB", "ZN"],
  };

  const strategies = [
    "Trend Following", "Mean Reversion", "Breakout", "Scalping", 
    "Sentiment Analysis", "Statistical Arbitrage", "Market Making",
    "RSI Divergence", "MACD Crossover", "Fibonacci Retracement",
  ];

  const trades: TradeHistoryItem[] = [];
  const now = new Date();
  const botIds = [
    "bot-quantum-forex", 
    "bot-nexural-crypto", 
    "bot-index-master", 
    "bot-futures-momentum", 
    "bot-smart-dca"
  ];
  const botNames = [
    "Quantum Forex Trader", 
    "Nexural Crypto Trader", 
    "Index Master", 
    "Futures Momentum", 
    "Smart DCA"
  ];
  const botTypes = ["forex", "crypto", "stocks", "futures", "stocks"];

  // Generate 20 random trades
  for (let i = 0; i < 20; i++) {
    const botIndex = Math.floor(Math.random() * botIds.length);
    const botId = botIds[botIndex];
    const botName = botNames[botIndex];
    const botType = botTypes[botIndex] as keyof typeof symbols;
    
    const symbolList = symbols[botType];
    const symbol = symbolList[Math.floor(Math.random() * symbolList.length)];
    
    const type = Math.random() > 0.5 ? "buy" : "sell";
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    // For more recent trades
    const daysAgo = Math.floor(Math.random() * 14); // Up to 14 days ago
    const hoursAgo = Math.floor(Math.random() * 24); // Random hour of the day
    
    const openDate = new Date(now);
    openDate.setDate(now.getDate() - daysAgo);
    openDate.setHours(now.getHours() - hoursAgo);
    
    const entryPrice = parseFloat((Math.random() * 1000 + 10).toFixed(2));
    let exitPrice;
    
    // Determine if the trade was profitable based on type
    const profitable = Math.random() > 0.3; // 70% of trades are profitable
    
    if (type === "buy") {
      exitPrice = profitable 
        ? parseFloat((entryPrice * (1 + Math.random() * 0.1)).toFixed(2))
        : parseFloat((entryPrice * (1 - Math.random() * 0.05)).toFixed(2));
    } else {
      exitPrice = profitable
        ? parseFloat((entryPrice * (1 - Math.random() * 0.1)).toFixed(2))
        : parseFloat((entryPrice * (1 + Math.random() * 0.05)).toFixed(2));
    }
    
    const size = parseFloat((Math.random() * 10 + 0.1).toFixed(2));
    
    // Calculate P&L
    let pnl;
    if (type === "buy") {
      pnl = (exitPrice - entryPrice) * size;
    } else {
      pnl = (entryPrice - exitPrice) * size;
    }
    
    const pnlPercent = (pnl / (entryPrice * size)) * 100;
    
    // Determine if trade is still open
    const status = i < 5 ? "open" : "closed"; // First 5 trades are still open
    
    const closeDate = new Date(openDate);
    if (status === "closed") {
      closeDate.setHours(openDate.getHours() + Math.floor(Math.random() * 48 + 1)); // 1-48 hours duration
    }
    
    trades.push({
      id: `trade-${i.toString().padStart(5, '0')}`,
      botId,
      botName,
      symbol,
      type,
      entry: entryPrice,
      exit: status === "open" ? 0 : exitPrice,
      size,
      pnl: status === "open" ? 0 : parseFloat(pnl.toFixed(2)),
      pnlPercent: status === "open" ? 0 : parseFloat(pnlPercent.toFixed(2)),
      openTime: openDate.toISOString(),
      closeTime: status === "open" ? "" : closeDate.toISOString(),
      status,
      stopLoss: type === "buy" 
        ? parseFloat((entryPrice * 0.95).toFixed(2)) 
        : parseFloat((entryPrice * 1.05).toFixed(2)),
      takeProfit: type === "buy"
        ? parseFloat((entryPrice * 1.1).toFixed(2))
        : parseFloat((entryPrice * 0.9).toFixed(2)),
      strategy,
      notes: Math.random() > 0.7 ? "Signal confirmed by multiple indicators" : undefined,
    });
  }
  
  // Sort by date, newest first
  return trades.sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime());
}
