// User Models
export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  role: "user" | "premium" | "admin" | "super_admin"
  status: "active" | "inactive" | "suspended" | "pending_verification"
  emailVerified: boolean
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  backupCodes?: string[]
  preferences: UserPreferences
  subscription?: Subscription
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  loginAttempts: number
  lockedUntil?: Date
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  currency: string
  notifications: NotificationSettings
  trading: TradingPreferences
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  trading: boolean
  news: boolean
  marketing: boolean
}

export interface TradingPreferences {
  defaultRiskLevel: number
  autoTrade: boolean
  maxDailyLoss: number
  preferredExchanges: string[]
  tradingHours: {
    start: string
    end: string
    timezone: string
  }
}

export interface PrivacySettings {
  profileVisible: boolean
  tradingStatsVisible: boolean
  leaderboardVisible: boolean
  allowDataSharing: boolean
}

// Subscription Models
export interface Subscription {
  id: string
  userId: string
  planId: string
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialStart?: Date
  trialEnd?: Date
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  limits: PlanLimits
  stripePriceId?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PlanLimits {
  maxBots: number
  maxSignals: number
  maxPortfolios: number
  apiCallsPerMonth: number
  realTimeData: boolean
  advancedAnalytics: boolean
  prioritySupport: boolean
}

// Trading Models
export interface TradingBot {
  id: string
  userId: string
  name: string
  description: string
  strategy: string
  status: "active" | "paused" | "stopped" | "error"
  config: BotConfig
  performance: BotPerformance
  createdAt: Date
  updatedAt: Date
  lastRunAt?: Date
  nextRunAt?: Date
}

export interface BotConfig {
  symbol: string
  exchange: string
  timeframe: string
  riskLevel: number
  maxPositionSize: number
  stopLoss: number
  takeProfit: number
  indicators: IndicatorConfig[]
  conditions: TradingCondition[]
}

export interface IndicatorConfig {
  name: string
  parameters: Record<string, any>
  weight: number
}

export interface TradingCondition {
  indicator: string
  operator: "gt" | "lt" | "eq" | "gte" | "lte"
  value: number
  action: "buy" | "sell" | "hold"
}

export interface BotPerformance {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalReturn: number
  totalReturnPercent: number
  maxDrawdown: number
  sharpeRatio: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
}

// Signal Models
export interface TradingSignal {
  id: string
  botId?: string
  userId?: string
  symbol: string
  exchange: string
  type: "buy" | "sell"
  price: number
  stopLoss?: number
  takeProfit?: number
  confidence: number
  timeframe: string
  status: "pending" | "active" | "executed" | "expired" | "canceled"
  reason: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  executedAt?: Date
  executedPrice?: number
}

// Portfolio Models
export interface Portfolio {
  id: string
  userId: string
  name: string
  description?: string
  type: "live" | "paper" | "backtest"
  exchange: string
  totalValue: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  positions: Position[]
  performance: PortfolioPerformance
  createdAt: Date
  updatedAt: Date
}

export interface Position {
  id: string
  portfolioId: string
  symbol: string
  side: "long" | "short"
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  realizedPnl: number
  openedAt: Date
  updatedAt: Date
}

export interface PortfolioPerformance {
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  totalTrades: number
  averageHoldingPeriod: number
}

// Trade Models
export interface Trade {
  id: string
  userId: string
  portfolioId: string
  botId?: string
  signalId?: string
  symbol: string
  exchange: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop" | "stop_limit"
  quantity: number
  price: number
  executedQuantity: number
  executedPrice: number
  status: "pending" | "filled" | "partially_filled" | "canceled" | "rejected"
  fees: number
  pnl?: number
  pnlPercent?: number
  orderId?: string
  exchangeOrderId?: string
  createdAt: Date
  updatedAt: Date
  executedAt?: Date
}

// Market Data Models
export interface MarketData {
  symbol: string
  exchange: string
  price: number
  change: number
  changePercent: number
  volume: number
  high24h: number
  low24h: number
  open24h: number
  marketCap?: number
  timestamp: Date
}

export interface Candle {
  symbol: string
  exchange: string
  timeframe: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: Date
}

// Learning Models
export interface Course {
  id: string
  title: string
  description: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
  duration: number // minutes
  lessons: Lesson[]
  prerequisites: string[]
  tags: string[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  content: string
  type: "video" | "text" | "quiz" | "interactive"
  duration: number
  order: number
  videoUrl?: string
  resources: LessonResource[]
  quiz?: Quiz
  createdAt: Date
  updatedAt: Date
}

export interface LessonResource {
  id: string
  name: string
  type: "pdf" | "link" | "download"
  url: string
}

export interface Quiz {
  id: string
  lessonId: string
  questions: QuizQuestion[]
  passingScore: number
  timeLimit?: number
}

export interface QuizQuestion {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "fill_blank"
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
}

export interface UserProgress {
  id: string
  userId: string
  courseId: string
  lessonId?: string
  status: "not_started" | "in_progress" | "completed"
  progress: number // 0-100
  score?: number
  timeSpent: number // minutes
  lastAccessedAt: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Blog Models
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  authorId: string
  author: User
  category: string
  tags: string[]
  status: "draft" | "published" | "archived"
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  views: number
  likes: number
  seoTitle?: string
  seoDescription?: string
}

// Analytics Models
export interface AnalyticsEvent {
  id: string
  userId?: string
  sessionId: string
  event: string
  properties: Record<string, any>
  timestamp: Date
  userAgent?: string
  ipAddress?: string
  country?: string
  city?: string
}

export interface UserSession {
  id: string
  userId?: string
  sessionId: string
  startTime: Date
  endTime?: Date
  duration?: number
  pageViews: number
  events: number
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  device: string
  browser: string
  os: string
}

// Notification Models
export interface Notification {
  id: string
  userId: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  readAt?: Date
  createdAt: Date
  expiresAt?: Date
}

// Audit Models
export interface AuditLog {
  id: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}
