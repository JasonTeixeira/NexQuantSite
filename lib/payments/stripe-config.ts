// 💳 STRIPE PAYMENT CONFIGURATION
// Ready for production Stripe integration

export const STRIPE_CONFIG = {
  // Stripe Keys (Set in environment variables)
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
  
  // Subscription Plans
  plans: {
    free: {
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        '5 Trading Signals/month',
        'Basic Market Data',
        'Community Access',
        'Educational Content'
      ]
    },
    starter: {
      priceId: 'price_starter',
      name: 'Starter',
      price: 29.99,
      interval: 'month',
      features: [
        '50 Trading Signals/month',
        'Real-time Market Data',
        'Advanced Analytics',
        'Priority Support',
        '2 Trading Bots'
      ]
    },
    professional: {
      priceId: 'price_professional',
      name: 'Professional',
      price: 99.99,
      interval: 'month',
      features: [
        'Unlimited Trading Signals',
        'Premium Market Data',
        'AI-Powered Insights',
        'Custom Strategies',
        '10 Trading Bots',
        'API Access',
        'White-glove Support'
      ]
    },
    enterprise: {
      priceId: 'price_enterprise',
      name: 'Enterprise',
      price: 499.99,
      interval: 'month',
      features: [
        'Everything in Professional',
        'Unlimited Trading Bots',
        'Custom Integrations',
        'Dedicated Account Manager',
        'SLA Guarantee',
        'Custom Training',
        'White-label Options'
      ]
    }
  },
  
  // One-time Products
  products: {
    premiumBot: {
      priceId: 'price_premium_bot',
      name: 'Premium Trading Bot',
      price: 299.99,
      description: 'Advanced AI-powered trading bot with lifetime updates'
    },
    strategyPack: {
      priceId: 'price_strategy_pack',
      name: 'Pro Strategy Pack',
      price: 149.99,
      description: '10 proven trading strategies with backtesting data'
    },
    course: {
      priceId: 'price_course',
      name: 'Master Trading Course',
      price: 199.99,
      description: 'Complete trading education with certification'
    }
  },
  
  // Payment Methods
  paymentMethods: ['card', 'bank_transfer', 'apple_pay', 'google_pay'],
  
  // Currency & Region
  currency: 'usd',
  allowedCountries: ['US', 'CA', 'GB', 'EU', 'AU', 'JP', 'SG'],
  
  // Trial Period
  trialDays: 14,
  
  // Tax Configuration
  automaticTax: true,
  taxIdCollection: true,
  
  // Billing Settings
  billingCycleAnchor: 'month_start',
  invoiceSettings: {
    sendInvoice: true,
    daysUntilDue: 7,
    includeUpcoming: true
  },
  
  // Customer Portal
  customerPortal: {
    enabled: true,
    features: {
      invoiceHistory: true,
      paymentMethodUpdate: true,
      subscriptionCancel: true,
      subscriptionPause: true,
      subscriptionUpdate: true
    }
  },
  
  // Webhook Events
  webhookEvents: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed'
  ]
}

// Stripe Client Initialization
export function initStripe() {
  if (typeof window === 'undefined') {
    // Server-side Stripe
    const Stripe = require('stripe')
    return new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
      telemetry: false
    })
  } else {
    // Client-side Stripe
    const { loadStripe } = require('@stripe/stripe-js')
    return loadStripe(STRIPE_CONFIG.publishableKey)
  }
}

// Price Formatting
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

// Subscription Status
export function getSubscriptionStatus(subscription: any): string {
  if (!subscription) return 'inactive'
  
  switch (subscription.status) {
    case 'active':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'canceled':
      return 'canceled'
    case 'unpaid':
      return 'unpaid'
    case 'trialing':
      return 'trialing'
    default:
      return 'inactive'
  }
}

