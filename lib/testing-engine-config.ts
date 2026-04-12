// Testing Engine Configuration and Utilities
export interface TestingEngineConfig {
  url: string
  api: string
  links: {
    engine: string
    history: string
    tutorial: string
    strategies: string
    pricing: string
  }
}

export interface UserTestingData {
  credits: number
  testsRun: number
  lastTest: {
    name: string
    time: string
    roi: number
  } | null
  winRate: number
  avgRoi: number
  recentTests: TestResult[]
  isReturningUser: boolean
  hasActiveSubscription: boolean
}

export interface TestResult {
  id: string
  strategy: string
  symbol: string
  roi: number
  winRate: number
  timestamp: string
  duration: string
}

// Configuration
export const TESTING_ENGINE_CONFIG: TestingEngineConfig = {
  // Replace with your actual testing engine URL
  url: process.env.NEXT_PUBLIC_TESTING_ENGINE_URL || 'https://testing.nexural.com',
  api: process.env.NEXT_PUBLIC_TESTING_API || 'https://api.nexural.com/testing',
  
  links: {
    engine: '/testing-engine',
    history: '/dashboard#testing',
    tutorial: '/learning',
    strategies: '/testing-engine',
    pricing: '/pricing'
  }
}

// Helper Functions
export function getTestingEngineUrl(path?: string): string {
  return `${TESTING_ENGINE_CONFIG.url}${path || ''}`
}

export function launchTestingEngine(options?: {
  strategy?: string
  symbol?: string
  returnUrl?: string
  tutorial?: boolean
  directLaunch?: boolean
}): void {
  const params = new URLSearchParams()
  
  if (options?.strategy) params.append('strategy', options.strategy)
  if (options?.symbol) params.append('symbol', options.symbol)
  if (options?.returnUrl) params.append('return', options.returnUrl)
  if (options?.tutorial) params.append('tutorial', 'true')
  if (options?.directLaunch) params.append('launch', 'true')
  
  const url = `${TESTING_ENGINE_CONFIG.url}${params.toString() ? '?' + params.toString() : ''}`
  window.open(url, '_blank')
}

// Mock data for development - Replace with actual API calls
export async function getUserTestingData(userId?: string): Promise<UserTestingData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock data - replace with actual API call
  return {
    credits: 5,
    testsRun: 23,
    lastTest: {
      name: "EURUSD Momentum Strategy",
      time: "2 hours ago",
      roi: 12.5
    },
    winRate: 67,
    avgRoi: 8.3,
    recentTests: [
      {
        id: '1',
        strategy: 'Momentum Pro',
        symbol: 'EURUSD',
        roi: 12.5,
        winRate: 72,
        timestamp: '2024-01-15T10:30:00Z',
        duration: '3 months'
      },
      {
        id: '2',
        strategy: 'Mean Reversion',
        symbol: 'GBPUSD',
        roi: -3.2,
        winRate: 45,
        timestamp: '2024-01-15T08:15:00Z',
        duration: '1 month'
      },
      {
        id: '3',
        strategy: 'Breakout Scanner',
        symbol: 'GOLD',
        roi: 8.7,
        winRate: 68,
        timestamp: '2024-01-14T16:45:00Z',
        duration: '6 months'
      }
    ],
    isReturningUser: true,
    hasActiveSubscription: false
  }
}

// Check if user has testing access
export function hasTestingAccess(credits: number, subscription: boolean): boolean {
  return credits > 0 || subscription
}

// Format ROI for display
export function formatROI(roi: number): string {
  const prefix = roi >= 0 ? '+' : ''
  return `${prefix}${roi.toFixed(1)}%`
}

// Get badge variant based on ROI
export function getROIBadgeVariant(roi: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (roi > 10) return 'default'
  if (roi > 0) return 'secondary'
  if (roi > -5) return 'outline'
  return 'destructive'
}
