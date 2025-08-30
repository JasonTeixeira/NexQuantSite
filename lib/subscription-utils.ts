/**
 * Subscription and Access Control Utilities
 * 
 * This module handles subscription verification and premium feature access control.
 * Replace mock data with real API calls when backend is connected.
 */

// User subscription types
export interface UserSubscription {
  id: string
  userId: string
  planType: 'free' | 'basic' | 'automation' | 'premium' | 'enterprise'
  isActive: boolean
  currentPeriodEnd: Date
  features: PremiumFeature[]
  testingCredits: number
  createdAt: Date
  updatedAt: Date
}

// Premium features available
export type PremiumFeature = 
  | 'options_flow'
  | 'advanced_scanner'
  | 'testing_engine_access'
  | 'unlimited_bots'
  | 'priority_signals'
  | 'api_access'
  | 'white_label'
  | 'custom_indicators'

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [] as PremiumFeature[],
    testingCredits: 3,
    botLimit: 1,
    signalLimit: 10
  },
  basic: {
    name: 'Basic',
    price: 29,
    features: ['priority_signals'] as PremiumFeature[],
    testingCredits: 10,
    botLimit: 3,
    signalLimit: 50
  },
  automation: {
    name: 'Automation Pro',
    price: 99,
    features: ['options_flow', 'advanced_scanner', 'priority_signals', 'unlimited_bots'] as PremiumFeature[],
    testingCredits: 25,
    botLimit: -1, // unlimited
    signalLimit: -1 // unlimited
  },
  premium: {
    name: 'Premium',
    price: 199,
    features: [
      'options_flow', 
      'advanced_scanner', 
      'testing_engine_access',
      'unlimited_bots',
      'priority_signals',
      'api_access',
      'custom_indicators'
    ] as PremiumFeature[],
    testingCredits: 100,
    botLimit: -1,
    signalLimit: -1
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    features: [
      'options_flow',
      'advanced_scanner',
      'testing_engine_access',
      'unlimited_bots',
      'priority_signals',
      'api_access',
      'white_label',
      'custom_indicators'
    ] as PremiumFeature[],
    testingCredits: 500,
    botLimit: -1,
    signalLimit: -1
  }
} as const

// Mock user data - Replace with real auth context
const mockUserSubscription: UserSubscription = {
  id: 'sub_mock_123',
  userId: 'user_mock_123',
  planType: 'free', // Change this to test different subscription levels
  isActive: true,
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  features: [],
  testingCredits: 3,
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * Get current user's subscription data
 * TODO: Replace with real API call
 */
export async function getUserSubscription(): Promise<UserSubscription | null> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return mockUserSubscription
}

/**
 * Check if user has access to a specific premium feature
 */
export function hasFeatureAccess(subscription: UserSubscription | null, feature: PremiumFeature): boolean {
  if (!subscription || !subscription.isActive) {
    return false
  }

  return subscription.features.includes(feature)
}

/**
 * Check if user has automation subscription (for Options Flow access)
 */
export function hasAutomationAccess(subscription: UserSubscription | null): boolean {
  if (!subscription || !subscription.isActive) {
    return false
  }

  return ['automation', 'premium', 'enterprise'].includes(subscription.planType)
}

/**
 * Check if user has testing engine access
 */
export function hasTestingEngineAccess(subscription: UserSubscription | null): boolean {
  if (!subscription) {
    return false
  }

  // Free users get limited credits, paid users get unlimited access
  return subscription.testingCredits > 0 || hasFeatureAccess(subscription, 'testing_engine_access')
}

/**
 * Get remaining testing credits
 */
export function getTestingCredits(subscription: UserSubscription | null): number {
  if (!subscription) {
    return 0
  }

  return subscription.testingCredits
}

/**
 * Check if subscription is about to expire (within 7 days)
 */
export function isSubscriptionExpiringSoon(subscription: UserSubscription | null): boolean {
  if (!subscription || !subscription.isActive) {
    return false
  }

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return subscription.currentPeriodEnd <= sevenDaysFromNow
}

/**
 * Get upgrade suggestions based on current plan
 */
export function getUpgradeSuggestions(subscription: UserSubscription | null) {
  if (!subscription) {
    return {
      suggestedPlan: 'basic',
      reason: 'Get started with premium signals and more bots'
    }
  }

  switch (subscription.planType) {
    case 'free':
      return {
        suggestedPlan: 'automation',
        reason: 'Unlock Options Flow and unlimited bots'
      }
    case 'basic':
      return {
        suggestedPlan: 'automation',
        reason: 'Access professional trading tools'
      }
    case 'automation':
      return {
        suggestedPlan: 'premium',
        reason: 'Get API access and advanced testing'
      }
    default:
      return null
  }
}

/**
 * Format subscription status for UI display
 */
export function formatSubscriptionStatus(subscription: UserSubscription | null) {
  if (!subscription) {
    return {
      status: 'No Subscription',
      color: 'gray',
      badge: 'Free'
    }
  }

  if (!subscription.isActive) {
    return {
      status: 'Expired',
      color: 'red',
      badge: 'Expired'
    }
  }

  if (isSubscriptionExpiringSoon(subscription)) {
    return {
      status: 'Expires Soon',
      color: 'yellow',
      badge: SUBSCRIPTION_PLANS[subscription.planType].name
    }
  }

  return {
    status: 'Active',
    color: 'green',
    badge: SUBSCRIPTION_PLANS[subscription.planType].name
  }
}

/**
 * Calculate savings for annual vs monthly billing
 */
export function calculateAnnualSavings(monthlyPrice: number): {
  annualPrice: number
  monthlySavings: number
  percentSavings: number
} {
  const annualPrice = monthlyPrice * 10 // 2 months free
  const monthlySavings = monthlyPrice * 2
  const percentSavings = Math.round((monthlySavings / (monthlyPrice * 12)) * 100)

  return {
    annualPrice,
    monthlySavings,
    percentSavings
  }
}

// Export mock data for development
export { mockUserSubscription }
