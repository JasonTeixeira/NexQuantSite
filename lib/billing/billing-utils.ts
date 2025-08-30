/**
 * Comprehensive Billing & Subscription Management System
 * Handles payments, subscriptions, invoices, and revenue analytics
 */

// Billing System Types
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  type: 'free' | 'basic' | 'pro' | 'enterprise' | 'custom'
  status: 'active' | 'inactive' | 'deprecated'
  pricing: {
    monthly: number
    yearly: number
    currency: string
    yearlyDiscount?: number // percentage
  }
  limits: {
    tradingSignals: number | 'unlimited'
    backtests: number | 'unlimited'
    portfolios: number | 'unlimited'
    apiCalls: number | 'unlimited'
    supportLevel: 'basic' | 'priority' | 'dedicated'
    dataRetention: number // days
  }
  features: string[]
  addOns: PlanAddOn[]
  trialPeriod?: number // days
  setupFee?: number
  isPopular?: boolean
  isCustom?: boolean
  customPricing?: {
    minUsers?: number
    pricePerUser?: number
    customFeatures?: string[]
  }
}

export interface PlanAddOn {
  id: string
  name: string
  description: string
  price: number
  currency: string
  type: 'one_time' | 'recurring'
  category: 'data' | 'support' | 'features' | 'limits'
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'unpaid' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialStart?: string
  trialEnd?: string
  cancelAt?: string
  canceledAt?: string
  addOns: SubscriptionAddOn[]
  customizations?: {
    customLimits?: Record<string, number>
    customFeatures?: string[]
    customPrice?: number
  }
  billingCycle: 'monthly' | 'yearly'
  paymentMethodId?: string
  prorationBehavior: 'create_prorations' | 'none' | 'always_invoice'
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface SubscriptionAddOn {
  id: string
  addOnId: string
  quantity: number
  addedAt: string
  metadata?: Record<string, any>
}

export interface PaymentMethod {
  id: string
  userId: string
  type: 'card' | 'paypal' | 'bank_account' | 'crypto'
  status: 'active' | 'inactive' | 'expired'
  isDefault: boolean
  details: {
    // Card details
    last4?: string
    brand?: string
    expMonth?: number
    expYear?: number
    // PayPal details
    paypalEmail?: string
    // Bank details
    bankName?: string
    accountLast4?: string
    // Crypto details
    walletAddress?: string
    currency?: string
  }
  billingAddress?: BillingAddress
  createdAt: string
  updatedAt: string
}

export interface BillingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  userId: string
  subscriptionId?: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  amountDue: number
  amountPaid: number
  amountRemaining: number
  currency: string
  description?: string
  dueDate: string
  paidAt?: string
  items: InvoiceItem[]
  tax: {
    amount: number
    rate: number
    jurisdiction?: string
  }
  discount?: {
    amount: number
    couponId?: string
    description?: string
  }
  paymentMethodId?: string
  attemptCount: number
  nextPaymentAttempt?: string
  hostedInvoiceUrl?: string
  invoicePdf?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  amount: number
  quantity: number
  unitAmount: number
  period?: {
    start: string
    end: string
  }
  type: 'subscription' | 'one_time' | 'usage' | 'tax' | 'discount'
  metadata?: Record<string, any>
}

export interface PaymentTransaction {
  id: string
  invoiceId?: string
  userId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  paymentMethodId: string
  paymentMethodType: 'card' | 'paypal' | 'bank_account' | 'crypto'
  processorTransactionId?: string
  processorFee?: number
  applicationFee?: number
  refundedAmount?: number
  failureReason?: string
  type: 'payment' | 'refund' | 'chargeback' | 'dispute'
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface BillingAnalytics {
  period: string
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  customers: {
    total: number
    new: number
    churned: number
    upgraded: number
    downgraded: number
  }
  revenue: {
    gross: number
    net: number
    refunds: number
    chargebacks: number
  }
  subscriptions: {
    total: number
    active: number
    trial: number
    cancelled: number
    pastDue: number
  }
  churn: {
    rate: number // percentage
    voluntaryRate: number
    involuntaryRate: number
  }
  ltv: number // Customer Lifetime Value
  cac: number // Customer Acquisition Cost
  plans: Array<{
    planId: string
    revenue: number
    customers: number
    churn: number
  }>
  paymentMethods: Record<string, number>
  geography: Record<string, number>
}

export interface Coupon {
  id: string
  code: string
  name: string
  type: 'percent' | 'fixed'
  value: number
  currency?: string
  duration: 'once' | 'repeating' | 'forever'
  durationInMonths?: number
  maxRedemptions?: number
  currentRedemptions: number
  isActive: boolean
  validFrom: string
  validUntil?: string
  applicablePlans?: string[]
  minimumAmount?: number
  firstTimeOnly?: boolean
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Default subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    description: 'Perfect for getting started with algorithmic trading',
    type: 'free',
    status: 'active',
    pricing: {
      monthly: 0,
      yearly: 0,
      currency: 'USD'
    },
    limits: {
      tradingSignals: 5,
      backtests: 3,
      portfolios: 1,
      apiCalls: 100,
      supportLevel: 'basic',
      dataRetention: 30
    },
    features: [
      'Basic trading signals',
      'Simple backtesting',
      'Community access',
      'Email support',
      'Mobile app access'
    ],
    addOns: [],
    trialPeriod: 0
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Advanced features for serious traders',
    type: 'pro',
    status: 'active',
    pricing: {
      monthly: 99,
      yearly: 990,
      currency: 'USD',
      yearlyDiscount: 16.7 // $99*12 = $1188, $990 = 16.7% discount
    },
    limits: {
      tradingSignals: 'unlimited',
      backtests: 'unlimited',
      portfolios: 5,
      apiCalls: 10000,
      supportLevel: 'priority',
      dataRetention: 365
    },
    features: [
      'Unlimited AI trading signals',
      'Advanced backtesting suite',
      'Real-time market data',
      'Portfolio optimization',
      'Priority support',
      'Advanced analytics',
      'API access',
      'Custom indicators',
      'Risk management tools'
    ],
    addOns: [
      {
        id: 'extra_portfolios',
        name: 'Additional Portfolios',
        description: 'Add 5 more portfolios',
        price: 19,
        currency: 'USD',
        type: 'recurring',
        category: 'limits'
      },
      {
        id: 'premium_data',
        name: 'Premium Data Feed',
        description: 'Level 2 market data and news',
        price: 49,
        currency: 'USD',
        type: 'recurring',
        category: 'data'
      }
    ],
    trialPeriod: 14,
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for institutional clients',
    type: 'enterprise',
    status: 'active',
    pricing: {
      monthly: 999,
      yearly: 9990,
      currency: 'USD',
      yearlyDiscount: 16.7
    },
    limits: {
      tradingSignals: 'unlimited',
      backtests: 'unlimited',
      portfolios: 'unlimited',
      apiCalls: 'unlimited',
      supportLevel: 'dedicated',
      dataRetention: -1 // -1 represents unlimited
    },
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'White-label solutions',
      'Advanced compliance tools',
      'Multi-user management',
      'Custom SLA agreements',
      'On-premise deployment',
      '24/7 phone support',
      'Training and onboarding'
    ],
    addOns: [],
    trialPeriod: 30,
    isCustom: true,
    customPricing: {
      minUsers: 10,
      pricePerUser: 99,
      customFeatures: [
        'Custom algorithms',
        'Dedicated infrastructure',
        'Compliance reporting'
      ]
    }
  }
]

// Billing Configuration
export const BILLING_CONFIG = {
  currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  paymentMethods: ['card', 'paypal', 'bank_account'],
  billingCycles: ['monthly', 'yearly'],
  taxRates: {
    US: 0.08,
    CA: 0.13,
    EU: 0.20,
    UK: 0.20,
    AU: 0.10
  },
  trialPeriods: {
    free: 0,
    basic: 7,
    pro: 14,
    enterprise: 30
  },
  gracePeriods: {
    pastDue: 3, // days
    dunning: 7  // days
  },
  invoiceRetentionDays: 2555, // ~7 years
  webhookRetryAttempts: 3
}

// Billing Management Class
export class BillingManager {
  // Create subscription
  static async createSubscription(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    paymentMethodId?: string,
    couponCode?: string,
    addOns?: Array<{ addOnId: string; quantity: number }>
  ): Promise<UserSubscription> {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan) throw new Error('Plan not found')

    const now = new Date()
    const subscription: UserSubscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      status: plan.trialPeriod ? 'trialing' : 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: this.calculatePeriodEnd(now, billingCycle).toISOString(),
      billingCycle,
      paymentMethodId,
      prorationBehavior: 'create_prorations',
      addOns: addOns?.map(addon => ({
        id: `addon_${Date.now()}_${addon.addOnId}`,
        addOnId: addon.addOnId,
        quantity: addon.quantity,
        addedAt: now.toISOString()
      })) || [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    // Set trial period if applicable
    if (plan.trialPeriod) {
      subscription.trialStart = now.toISOString()
      subscription.trialEnd = new Date(now.getTime() + plan.trialPeriod * 24 * 60 * 60 * 1000).toISOString()
    }

    // Apply coupon if provided
    if (couponCode) {
      // In production, validate and apply coupon
      subscription.metadata = { appliedCoupon: couponCode }
    }

    return subscription
  }

  // Update subscription
  static async updateSubscription(
    subscriptionId: string,
    updates: Partial<UserSubscription>
  ): Promise<UserSubscription> {
    // In production, this would update the database
    console.log(`Updating subscription ${subscriptionId}:`, updates)
    
    // Mock updated subscription
    return {
      id: subscriptionId,
      ...updates,
      updatedAt: new Date().toISOString()
    } as UserSubscription
  }

  // Cancel subscription
  static async cancelSubscription(
    subscriptionId: string,
    cancelAt?: 'now' | 'period_end',
    reason?: string
  ): Promise<UserSubscription> {
    const now = new Date()
    
    const updates: Partial<UserSubscription> = {
      status: cancelAt === 'now' ? 'cancelled' : 'active',
      canceledAt: now.toISOString(),
      metadata: { cancellationReason: reason }
    }

    if (cancelAt === 'period_end') {
      // Will cancel at end of current period
      updates.cancelAt = updates.currentPeriodEnd
    }

    return this.updateSubscription(subscriptionId, updates)
  }

  // Generate invoice
  static async generateInvoice(
    userId: string,
    subscriptionId: string,
    items: Omit<InvoiceItem, 'id'>[],
    dueDate?: Date
  ): Promise<Invoice> {
    const now = new Date()
    const invoiceNumber = this.generateInvoiceNumber()
    
    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      userId,
      subscriptionId,
      status: 'open',
      amountDue: 0,
      amountPaid: 0,
      amountRemaining: 0,
      currency: 'USD',
      dueDate: (dueDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)).toISOString(),
      items: items.map(item => ({
        ...item,
        id: `ii_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
      })),
      tax: { amount: 0, rate: 0 },
      attemptCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    // Calculate amounts
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = this.calculateTax(subtotal, userId)
    
    invoice.amountDue = subtotal + taxAmount
    invoice.amountRemaining = invoice.amountDue
    invoice.tax.amount = taxAmount

    return invoice
  }

  // Process payment
  static async processPayment(
    invoiceId: string,
    paymentMethodId: string,
    amount?: number
  ): Promise<PaymentTransaction> {
    const transaction: PaymentTransaction = {
      id: `txn_${Date.now()}`,
      invoiceId,
      userId: 'user_placeholder', // Would be fetched from invoice
      amount: amount || 0,
      currency: 'USD',
      status: 'processing',
      paymentMethodId,
      paymentMethodType: 'card',
      type: 'payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Simulate payment processing
    setTimeout(() => {
      transaction.status = Math.random() > 0.05 ? 'succeeded' : 'failed'
      if (transaction.status === 'failed') {
        transaction.failureReason = 'insufficient_funds'
      }
    }, 2000)

    return transaction
  }

  // Calculate billing analytics
  static calculateBillingAnalytics(
    subscriptions: UserSubscription[],
    invoices: Invoice[],
    transactions: PaymentTransaction[],
    period: 'month' | 'quarter' | 'year' = 'month'
  ): BillingAnalytics {
    const now = new Date()
    const startDate = this.getPeriodStart(now, period)
    
    // Filter data for period
    const periodSubscriptions = subscriptions.filter(sub => 
      new Date(sub.createdAt) >= startDate
    )
    const periodInvoices = invoices.filter(inv => 
      new Date(inv.createdAt) >= startDate
    )
    const periodTransactions = transactions.filter(txn => 
      new Date(txn.createdAt) >= startDate && txn.status === 'succeeded'
    )

    // Calculate MRR (Monthly Recurring Revenue)
    const activeSubscriptions = subscriptions.filter(sub => 
      ['active', 'trialing'].includes(sub.status)
    )
    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === sub.planId)
      if (!plan) return sum
      
      const monthlyRevenue = sub.billingCycle === 'yearly' 
        ? plan.pricing.yearly / 12 
        : plan.pricing.monthly
      
      return sum + monthlyRevenue
    }, 0)

    // Calculate revenue metrics
    const grossRevenue = periodTransactions.reduce((sum, txn) => sum + txn.amount, 0)
    const refunds = periodTransactions
      .filter(txn => txn.type === 'refund')
      .reduce((sum, txn) => sum + txn.amount, 0)
    const chargebacks = periodTransactions
      .filter(txn => txn.type === 'chargeback')
      .reduce((sum, txn) => sum + txn.amount, 0)

    // Calculate churn rate
    const totalCustomersStart = subscriptions.length
    const churnedCustomers = subscriptions.filter(sub => 
      sub.status === 'cancelled' && 
      sub.canceledAt && 
      new Date(sub.canceledAt) >= startDate
    ).length
    const churnRate = totalCustomersStart > 0 ? (churnedCustomers / totalCustomersStart) * 100 : 0

    return {
      period: period,
      mrr,
      arr: mrr * 12,
      customers: {
        total: subscriptions.length,
        new: periodSubscriptions.length,
        churned: churnedCustomers,
        upgraded: 0, // Would calculate based on plan changes
        downgraded: 0
      },
      revenue: {
        gross: grossRevenue,
        net: grossRevenue - refunds - chargebacks,
        refunds,
        chargebacks
      },
      subscriptions: {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        trial: subscriptions.filter(s => s.status === 'trialing').length,
        cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
        pastDue: subscriptions.filter(s => s.status === 'past_due').length
      },
      churn: {
        rate: churnRate,
        voluntaryRate: churnRate * 0.8, // Estimate
        involuntaryRate: churnRate * 0.2
      },
      ltv: this.calculateLTV(mrr, churnRate),
      cac: 0, // Would need marketing spend data
      plans: this.calculatePlanMetrics(subscriptions),
      paymentMethods: this.calculatePaymentMethodDistribution(transactions),
      geography: {} // Would need user location data
    }
  }

  // Utility methods
  private static calculatePeriodEnd(start: Date, cycle: 'monthly' | 'yearly'): Date {
    const end = new Date(start)
    if (cycle === 'yearly') {
      end.setFullYear(end.getFullYear() + 1)
    } else {
      end.setMonth(end.getMonth() + 1)
    }
    return end
  }

  private static generateInvoiceNumber(): string {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `INV-${year}${month}-${random}`
  }

  private static calculateTax(amount: number, userId: string): number {
    // In production, would determine tax rate based on user location
    const taxRate = BILLING_CONFIG.taxRates.US
    return Math.round(amount * taxRate * 100) / 100
  }

  private static getPeriodStart(date: Date, period: 'month' | 'quarter' | 'year'): Date {
    const start = new Date(date)
    switch (period) {
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
      case 'quarter':
        start.setMonth(start.getMonth() - 3)
        break
      case 'year':
        start.setFullYear(start.getFullYear() - 1)
        break
    }
    return start
  }

  private static calculateLTV(mrr: number, churnRate: number): number {
    // LTV = (Average Revenue per Customer) / Churn Rate
    if (churnRate === 0) return 0
    const avgRevenuePerCustomer = mrr // Simplified
    return (avgRevenuePerCustomer / (churnRate / 100)) * 12
  }

  private static calculatePlanMetrics(subscriptions: UserSubscription[]) {
    const planMetrics = new Map()
    
    subscriptions.forEach(sub => {
      const existing = planMetrics.get(sub.planId) || {
        planId: sub.planId,
        revenue: 0,
        customers: 0,
        churn: 0
      }
      
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === sub.planId)
      if (plan) {
        existing.customers++
        if (sub.status === 'active') {
          existing.revenue += sub.billingCycle === 'yearly' 
            ? plan.pricing.yearly / 12 
            : plan.pricing.monthly
        }
        if (sub.status === 'cancelled') {
          existing.churn++
        }
      }
      
      planMetrics.set(sub.planId, existing)
    })
    
    return Array.from(planMetrics.values())
  }

  private static calculatePaymentMethodDistribution(transactions: PaymentTransaction[]) {
    const distribution: Record<string, number> = {}
    
    transactions.forEach(txn => {
      distribution[txn.paymentMethodType] = (distribution[txn.paymentMethodType] || 0) + 1
    })
    
    return distribution
  }
}

// Mock data for testing
export const mockSubscriptions: UserSubscription[] = [
  {
    id: 'sub_001',
    userId: 'user_001',
    planId: 'pro',
    status: 'active',
    currentPeriodStart: '2024-01-15T00:00:00Z',
    currentPeriodEnd: '2024-02-15T00:00:00Z',
    billingCycle: 'monthly',
    paymentMethodId: 'pm_001',
    prorationBehavior: 'create_prorations',
    addOns: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
]

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-202401-ABC123',
    userId: 'user_001',
    subscriptionId: 'sub_001',
    status: 'paid',
    amountDue: 10692, // $99 + tax
    amountPaid: 10692,
    amountRemaining: 0,
    currency: 'USD',
    dueDate: '2024-02-14T00:00:00Z',
    paidAt: '2024-01-15T10:30:00Z',
    items: [
      {
        id: 'ii_001',
        description: 'Professional Plan - Monthly',
        amount: 9900, // $99.00 in cents
        quantity: 1,
        unitAmount: 9900,
        period: {
          start: '2024-01-15T00:00:00Z',
          end: '2024-02-15T00:00:00Z'
        },
        type: 'subscription'
      }
    ],
    tax: {
      amount: 792, // $7.92 in cents
      rate: 8
    },
    attemptCount: 1,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
]

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_001',
    userId: 'user_001',
    type: 'card',
    status: 'active',
    isDefault: true,
    details: {
      last4: '4242',
      brand: 'Visa',
      expMonth: 12,
      expYear: 2026
    },
    billingAddress: {
      name: 'John Doe',
      line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
]

export default BillingManager
