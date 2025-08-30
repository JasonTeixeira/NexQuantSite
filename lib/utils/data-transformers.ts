// Data transformation utilities for API responses

export interface ApiPaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ChartDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface TimeSeriesData {
  symbol: string
  timeframe: string
  data: ChartDataPoint[]
}

// Transform API user data to store format
export function transformUserData(apiUser: any) {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name || apiUser.displayName,
    role: apiUser.role || "user",
    permissions: apiUser.permissions || [],
    avatar: apiUser.avatar || apiUser.profileImage,
    subscription: apiUser.subscription
      ? {
          plan: apiUser.subscription.plan,
          status: apiUser.subscription.status,
          expiresAt: apiUser.subscription.expiresAt || apiUser.subscription.expires_at,
        }
      : undefined,
    preferences: {
      theme: apiUser.preferences?.theme || "dark",
      notifications: apiUser.preferences?.notifications ?? true,
      language: apiUser.preferences?.language || "en",
    },
  }
}

// Transform API trading signal to store format
export function transformTradingSignal(apiSignal: any) {
  return {
    id: apiSignal.id,
    symbol: apiSignal.symbol,
    type: apiSignal.type,
    price: Number.parseFloat(apiSignal.price),
    targetPrice: apiSignal.target_price ? Number.parseFloat(apiSignal.target_price) : undefined,
    stopLoss: apiSignal.stop_loss ? Number.parseFloat(apiSignal.stop_loss) : undefined,
    confidence: Number.parseFloat(apiSignal.confidence),
    timestamp: apiSignal.timestamp || apiSignal.created_at,
    status: apiSignal.status,
    botId: apiSignal.bot_id || apiSignal.botId,
    reasoning: apiSignal.reasoning || apiSignal.description,
  }
}

// Transform API portfolio data
export function transformPortfolioData(apiPortfolio: any) {
  return {
    totalValue: Number.parseFloat(apiPortfolio.total_value || apiPortfolio.totalValue),
    totalPnL: Number.parseFloat(apiPortfolio.total_pnl || apiPortfolio.totalPnL),
    totalPnLPercentage: Number.parseFloat(apiPortfolio.total_pnl_percentage || apiPortfolio.totalPnLPercentage),
    availableBalance: Number.parseFloat(apiPortfolio.available_balance || apiPortfolio.availableBalance),
    positions: (apiPortfolio.positions || []).map((pos: any) => ({
      symbol: pos.symbol,
      quantity: Number.parseFloat(pos.quantity),
      avgPrice: Number.parseFloat(pos.avg_price || pos.avgPrice),
      currentPrice: Number.parseFloat(pos.current_price || pos.currentPrice),
      pnl: Number.parseFloat(pos.pnl),
      pnlPercentage: Number.parseFloat(pos.pnl_percentage || pos.pnlPercentage),
      side: pos.side,
      openTime: pos.open_time || pos.openTime,
    })),
  }
}

// Transform API course data
export function transformCourseData(apiCourse: any) {
  return {
    id: apiCourse.id,
    title: apiCourse.title,
    description: apiCourse.description,
    level: apiCourse.level,
    duration: Number.parseInt(apiCourse.duration),
    progress: Number.parseFloat(apiCourse.progress || 0),
    completed: apiCourse.completed || false,
    modules: (apiCourse.modules || []).map((mod: any) => ({
      id: mod.id,
      title: mod.title,
      type: mod.type,
      duration: Number.parseInt(mod.duration),
      completed: mod.completed || false,
      progress: Number.parseFloat(mod.progress || 0),
      content: mod.content,
      videoUrl: mod.video_url || mod.videoUrl,
      questions: mod.questions,
    })),
    instructor: apiCourse.instructor
      ? {
          name: apiCourse.instructor.name,
          avatar: apiCourse.instructor.avatar,
          bio: apiCourse.instructor.bio,
        }
      : undefined,
    thumbnail: apiCourse.thumbnail,
    tags: apiCourse.tags || [],
    rating: Number.parseFloat(apiCourse.rating || 0),
    enrolledCount: Number.parseInt(apiCourse.enrolled_count || apiCourse.enrolledCount || 0),
  }
}

// Transform market data for charts
export function transformMarketDataForChart(apiData: any[], timeframe: string): TimeSeriesData {
  return {
    symbol: apiData[0]?.symbol || "UNKNOWN",
    timeframe,
    data: apiData.map((item) => ({
      timestamp: item.timestamp || item.time,
      value: Number.parseFloat(item.price || item.close),
      label: new Date(item.timestamp || item.time).toLocaleTimeString(),
    })),
  }
}

// Transform paginated API response
export function transformPaginatedResponse<T>(
  apiResponse: any,
  transformer?: (item: any) => T,
): ApiPaginatedResponse<T> {
  const data = apiResponse.data || apiResponse.items || []

  return {
    data: transformer ? data.map(transformer) : data,
    pagination: {
      page: Number.parseInt(apiResponse.page || apiResponse.current_page || 1),
      limit: Number.parseInt(apiResponse.limit || apiResponse.per_page || 10),
      total: Number.parseInt(apiResponse.total || apiResponse.total_count || 0),
      totalPages: Number.parseInt(apiResponse.total_pages || apiResponse.totalPages || 1),
      hasNext: apiResponse.has_next ?? apiResponse.hasNext ?? false,
      hasPrev: apiResponse.has_prev ?? apiResponse.hasPrev ?? false,
    },
  }
}

// Format currency values
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Format percentage values
export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`
}

// Format large numbers
export function formatNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`
  }
  return value.toFixed(2)
}

// Calculate technical indicators (placeholder implementations)
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = []
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

export function calculateRSI(data: number[], period = 14): number[] {
  const rsi: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period

    if (avgLoss === 0) {
      rsi.push(100)
    } else {
      const rs = avgGain / avgLoss
      rsi.push(100 - 100 / (1 + rs))
    }
  }

  return rsi
}

// Validate and sanitize API responses
export function validateApiResponse(response: any, requiredFields: string[]): boolean {
  if (!response || typeof response !== "object") {
    return false
  }

  return requiredFields.every((field) => {
    const keys = field.split(".")
    let current = response

    for (const key of keys) {
      if (current[key] === undefined || current[key] === null) {
        return false
      }
      current = current[key]
    }

    return true
  })
}

// Error response transformer
export function transformApiError(error: any) {
  return {
    message: error.message || error.error || "An unexpected error occurred",
    code: error.code || error.error_code || "UNKNOWN_ERROR",
    status: error.status || error.statusCode || 500,
    details: error.details || error.data || null,
  }
}
