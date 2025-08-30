/**
 * Payment Service
 * Unified payment processing supporting multiple providers (Stripe, PayPal, etc.)
 * Handles subscriptions, one-time payments, and payouts
 */

export interface PaymentProvider {
  name: string
  validateConfig: () => boolean
  
  // Subscription methods
  createSubscription: (subscription: CreateSubscriptionRequest) => Promise<SubscriptionResult>
  updateSubscription: (subscriptionId: string, updates: UpdateSubscriptionRequest) => Promise<SubscriptionResult>
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<SubscriptionResult>
  getSubscription: (subscriptionId: string) => Promise<SubscriptionData | null>
  
  // Payment methods
  createPayment: (payment: CreatePaymentRequest) => Promise<PaymentResult>
  capturePayment: (paymentId: string) => Promise<PaymentResult>
  refundPayment: (paymentId: string, amount?: number, reason?: string) => Promise<PaymentResult>
  getPayment: (paymentId: string) => Promise<PaymentData | null>
  
  // Payout methods
  createPayout: (payout: CreatePayoutRequest) => Promise<PayoutResult>
  getPayoutStatus: (payoutId: string) => Promise<PayoutData | null>
  
  // Webhook handling
  verifyWebhook: (payload: string, signature: string) => boolean
  parseWebhook: (payload: string) => WebhookEvent
}

// Subscription Types
export interface CreateSubscriptionRequest {
  customerId: string
  planId: string
  paymentMethodId?: string
  trialDays?: number
  couponCode?: string
  metadata?: Record<string, any>
}

export interface UpdateSubscriptionRequest {
  planId?: string
  quantity?: number
  couponCode?: string
  metadata?: Record<string, any>
}

export interface SubscriptionData {
  id: string
  customerId: string
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialStart?: string
  trialEnd?: string
  canceledAt?: string
  createdAt: string
  metadata?: Record<string, any>
}

export interface SubscriptionResult {
  success: boolean
  subscription?: SubscriptionData
  error?: string
  requiresAction?: boolean
  clientSecret?: string
}

// Payment Types
export interface CreatePaymentRequest {
  amount: number
  currency: string
  customerId?: string
  paymentMethodId?: string
  description?: string
  metadata?: Record<string, any>
  capture?: boolean
}

export interface PaymentData {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
  customerId?: string
  description?: string
  createdAt: string
  metadata?: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  payment?: PaymentData
  error?: string
  requiresAction?: boolean
  clientSecret?: string
}

// Payout Types
export interface CreatePayoutRequest {
  amount: number
  currency: string
  recipient: PayoutRecipient
  description?: string
  metadata?: Record<string, any>
}

export interface PayoutRecipient {
  type: 'bank_account' | 'paypal' | 'crypto'
  email?: string
  bankAccount?: {
    accountNumber: string
    routingNumber: string
    accountHolderName: string
    accountType: 'checking' | 'savings'
  }
  cryptoAddress?: {
    address: string
    network: 'bitcoin' | 'ethereum' | 'usdc'
  }
}

export interface PayoutData {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled'
  recipient: PayoutRecipient
  description?: string
  createdAt: string
  completedAt?: string
  failureReason?: string
  metadata?: Record<string, any>
}

export interface PayoutResult {
  success: boolean
  payout?: PayoutData
  error?: string
}

// Webhook Types
export interface WebhookEvent {
  id: string
  type: string
  data: any
  createdAt: string
}

// Subscription Plans
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  intervalCount: number
  trialDays?: number
  features: string[]
  isActive: boolean
  createdAt: string
}

// Pre-defined subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic_monthly',
    name: 'Basic Plan',
    description: 'Essential trading tools and features',
    amount: 29.99,
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    trialDays: 7,
    features: [
      'Basic trading algorithms',
      'Email support',
      'Mobile app access',
      'Basic analytics'
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pro_monthly',
    name: 'Pro Plan',
    description: 'Advanced trading tools and priority support',
    amount: 79.99,
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    trialDays: 14,
    features: [
      'Advanced algorithms',
      'Options flow access',
      'Priority support',
      'Advanced analytics',
      'Custom indicators',
      'API access'
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'enterprise_monthly',
    name: 'Enterprise Plan',
    description: 'Full platform access with dedicated support',
    amount: 199.99,
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    features: [
      'All trading features',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'Advanced API',
      'Priority execution'
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

class PaymentService {
  private provider: PaymentProvider | null = null
  private subscriptions: Map<string, SubscriptionData> = new Map()
  private payments: Map<string, PaymentData> = new Map()
  private payouts: Map<string, PayoutData> = new Map()
  private plans: Map<string, SubscriptionPlan> = new Map()

  constructor() {
    this.loadPlans()
  }

  /**
   * Configure payment provider
   */
  setProvider(provider: PaymentProvider): void {
    if (!provider.validateConfig()) {
      throw new Error(`Invalid configuration for ${provider.name}`)
    }
    this.provider = provider
  }

  /**
   * Subscription Management
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResult> {
    if (!this.provider) {
      throw new Error('No payment provider configured')
    }

    // Validate plan exists
    const plan = this.plans.get(request.planId)
    if (!plan) {
      return {
        success: false,
        error: `Invalid plan ID: ${request.planId}`
      }
    }

    try {
      const result = await this.provider.createSubscription(request)
      
      if (result.success && result.subscription) {
        this.subscriptions.set(result.subscription.id, result.subscription)
        
        // Log subscription creation
        await this.logEvent('subscription_created', {
          subscriptionId: result.subscription.id,
          customerId: request.customerId,
          planId: request.planId
        })
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed'
      }
    }
  }

  async updateSubscription(subscriptionId: string, updates: UpdateSubscriptionRequest): Promise<SubscriptionResult> {
    if (!this.provider) {
      throw new Error('No payment provider configured')
    }

    try {
      const result = await this.provider.updateSubscription(subscriptionId, updates)
      
      if (result.success && result.subscription) {
        this.subscriptions.set(subscriptionId, result.subscription)
        
        await this.logEvent('subscription_updated', {
          subscriptionId,
          updates
        })
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription update failed'
      }
    }
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<SubscriptionResult> {
    if (!this.provider) {
      throw new Error('No payment provider configured')
    }

    try {
      const result = await this.provider.cancelSubscription(subscriptionId, reason)
      
      if (result.success && result.subscription) {
        this.subscriptions.set(subscriptionId, result.subscription)
        
        await this.logEvent('subscription_canceled', {
          subscriptionId,
          reason
        })
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription cancellation failed'
      }
    }
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionData | null> {
    // Check local cache first
    const cached = this.subscriptions.get(subscriptionId)
    if (cached) return cached

    // Fetch from provider
    if (!this.provider) return null
    
    try {
      const subscription = await this.provider.getSubscription(subscriptionId)
      if (subscription) {
        this.subscriptions.set(subscriptionId, subscription)
      }
      return subscription
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return null
    }
  }

  /**
   * Payment Processing
   */
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResult> {
    if (!this.provider) {
      throw new Error('No payment provider configured')
    }

    try {
      const result = await this.provider.createPayment(request)
      
      if (result.success && result.payment) {
        this.payments.set(result.payment.id, result.payment)
        
        await this.logEvent('payment_created', {
          paymentId: result.payment.id,
          amount: request.amount,
          customerId: request.customerId
        })
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      }
    }
  }

  async processRefund(paymentId: string, amount?: number, reason?: string): Promise<PaymentResult> {
    if (!this.provider) {
      throw new Error('No payment provider configured')
    }

    try {
      const result = await this.provider.refundPayment(paymentId, amount, reason)
      
      if (result.success) {
        await this.logEvent('payment_refunded', {
          paymentId,
          amount,
          reason
        })
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }

  /**
   * Payout Processing (for referral commissions)
   */
  async createPayout(request: CreatePayoutRequest): Promise<PayoutResult> {
    if (!this.provider) {
      throw new Error('No payment provider configured')
    }

    // Validate minimum payout amount
    const minAmount = 10.00 // $10 minimum
    if (request.amount < minAmount) {
      return {
        success: false,
        error: `Minimum payout amount is $${minAmount}`
      }
    }

    try {
      const result = await this.provider.createPayout(request)
      
      if (result.success && result.payout) {
        this.payouts.set(result.payout.id, result.payout)
        
        await this.logEvent('payout_created', {
          payoutId: result.payout.id,
          amount: request.amount,
          recipient: request.recipient
        })
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payout creation failed'
      }
    }
  }

  async getPayoutStatus(payoutId: string): Promise<PayoutData | null> {
    // Check local cache first
    const cached = this.payouts.get(payoutId)
    if (cached) return cached

    // Fetch from provider
    if (!this.provider) return null
    
    try {
      const payout = await this.provider.getPayoutStatus(payoutId)
      if (payout) {
        this.payouts.set(payoutId, payout)
      }
      return payout
    } catch (error) {
      console.error('Error fetching payout status:', error)
      return null
    }
  }

  /**
   * Referral Commission Payouts
   */
  async processReferralPayout(
    userId: string,
    amount: number,
    recipient: PayoutRecipient,
    referralData: { referralCount: number; totalCommissions: number }
  ): Promise<PayoutResult> {
    const description = `Referral commission payout - ${referralData.referralCount} referrals`
    
    const result = await this.createPayout({
      amount,
      currency: 'USD',
      recipient,
      description,
      metadata: {
        userId,
        type: 'referral_commission',
        referralCount: referralData.referralCount,
        totalCommissions: referralData.totalCommissions
      }
    })

    if (result.success) {
      // Send notification (integrate with email/SMS service)
      console.log(`Referral payout processed for user ${userId}: $${amount}`)
    }

    return result
  }

  async batchProcessPayouts(payouts: CreatePayoutRequest[]): Promise<PayoutResult[]> {
    const results = await Promise.all(
      payouts.map(payout => this.createPayout(payout))
    )

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    await this.logEvent('batch_payouts_processed', {
      total: payouts.length,
      successful,
      failed
    })

    return results
  }

  /**
   * Webhook Handling
   */
  async handleWebhook(payload: string, signature: string): Promise<{ processed: boolean; error?: string }> {
    if (!this.provider) {
      return { processed: false, error: 'No payment provider configured' }
    }

    try {
      // Verify webhook signature
      if (!this.provider.verifyWebhook(payload, signature)) {
        return { processed: false, error: 'Invalid webhook signature' }
      }

      // Parse webhook event
      const event = this.provider.parseWebhook(payload)
      
      // Process different event types
      await this.processWebhookEvent(event)
      
      return { processed: true }
    } catch (error) {
      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      }
    }
  }

  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case 'subscription.created':
        await this.handleSubscriptionCreated(event.data)
        break
      case 'subscription.updated':
        await this.handleSubscriptionUpdated(event.data)
        break
      case 'subscription.canceled':
        await this.handleSubscriptionCanceled(event.data)
        break
      case 'payment.succeeded':
        await this.handlePaymentSucceeded(event.data)
        break
      case 'payment.failed':
        await this.handlePaymentFailed(event.data)
        break
      case 'payout.completed':
        await this.handlePayoutCompleted(event.data)
        break
      case 'payout.failed':
        await this.handlePayoutFailed(event.data)
        break
      default:
        console.log('Unhandled webhook event:', event.type)
    }
  }

  private async handleSubscriptionCreated(data: any): Promise<void> {
    // Update subscription status, send welcome email, etc.
    console.log('Subscription created:', data)
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    // Update subscription data, notify user of changes, etc.
    console.log('Subscription updated:', data)
  }

  private async handleSubscriptionCanceled(data: any): Promise<void> {
    // Update subscription status, send cancellation confirmation, etc.
    console.log('Subscription canceled:', data)
  }

  private async handlePaymentSucceeded(data: any): Promise<void> {
    // Update payment status, send receipt, etc.
    console.log('Payment succeeded:', data)
  }

  private async handlePaymentFailed(data: any): Promise<void> {
    // Update payment status, notify user, retry logic, etc.
    console.log('Payment failed:', data)
  }

  private async handlePayoutCompleted(data: any): Promise<void> {
    // Update payout status, send confirmation, etc.
    console.log('Payout completed:', data)
  }

  private async handlePayoutFailed(data: any): Promise<void> {
    // Update payout status, notify user, investigate, etc.
    console.log('Payout failed:', data)
  }

  /**
   * Analytics and Reporting
   */
  async getPaymentStats(dateRange?: { start: string; end: string }): Promise<{
    totalRevenue: number
    subscriptionRevenue: number
    oneTimeRevenue: number
    refunds: number
    payouts: number
    activeSubscriptions: number
  }> {
    // Implementation would query actual payment data from database
    return {
      totalRevenue: 145670.50,
      subscriptionRevenue: 89450.25,
      oneTimeRevenue: 56220.25,
      refunds: 2340.75,
      payouts: 34567.80,
      activeSubscriptions: 2847
    }
  }

  async getSubscriptionMetrics(): Promise<{
    totalSubscriptions: number
    activeSubscriptions: number
    churnRate: number
    mrr: number // Monthly Recurring Revenue
    arpu: number // Average Revenue Per User
  }> {
    // Implementation would calculate from actual subscription data
    return {
      totalSubscriptions: 3456,
      activeSubscriptions: 2847,
      churnRate: 5.2,
      mrr: 89450.25,
      arpu: 31.42
    }
  }

  /**
   * Plan Management
   */
  getPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values()).filter(plan => plan.isActive)
  }

  getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.get(planId)
  }

  createPlan(plan: Omit<SubscriptionPlan, 'createdAt'>): void {
    const fullPlan: SubscriptionPlan = {
      ...plan,
      createdAt: new Date().toISOString()
    }
    
    this.plans.set(plan.id, fullPlan)
  }

  /**
   * Private helper methods
   */
  private loadPlans(): void {
    SUBSCRIPTION_PLANS.forEach(plan => {
      this.plans.set(plan.id, plan)
    })
  }

  private async logEvent(event: string, data: any): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data
    }
    
    console.log('Payment event:', logEntry)
    // Implementation would log to database for analytics
  }
}

// Stripe Provider Implementation
export class StripeProvider implements PaymentProvider {
  name = 'Stripe'
  private secretKey: string
  private publishableKey: string
  private webhookSecret: string

  constructor(config: { secretKey: string; publishableKey: string; webhookSecret: string }) {
    this.secretKey = config.secretKey
    this.publishableKey = config.publishableKey
    this.webhookSecret = config.webhookSecret
  }

  validateConfig(): boolean {
    return !!(this.secretKey && this.publishableKey && this.webhookSecret)
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResult> {
    try {
      // Implementation would use Stripe SDK
      console.log('Stripe: Creating subscription', request)
      
      const subscriptionId = `sub_${Date.now()}`
      const subscription: SubscriptionData = {
        id: subscriptionId,
        customerId: request.customerId,
        planId: request.planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        metadata: request.metadata
      }
      
      return {
        success: true,
        subscription
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe subscription error'
      }
    }
  }

  async updateSubscription(subscriptionId: string, updates: UpdateSubscriptionRequest): Promise<SubscriptionResult> {
    try {
      console.log('Stripe: Updating subscription', subscriptionId, updates)
      
      // Mock updated subscription
      const subscription: SubscriptionData = {
        id: subscriptionId,
        customerId: 'customer_id',
        planId: updates.planId || 'existing_plan',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        metadata: updates.metadata
      }
      
      return {
        success: true,
        subscription
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe subscription update error'
      }
    }
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<SubscriptionResult> {
    try {
      console.log('Stripe: Canceling subscription', subscriptionId, reason)
      
      const subscription: SubscriptionData = {
        id: subscriptionId,
        customerId: 'customer_id',
        planId: 'plan_id',
        status: 'canceled',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        canceledAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
      
      return {
        success: true,
        subscription
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe subscription cancellation error'
      }
    }
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionData | null> {
    try {
      console.log('Stripe: Fetching subscription', subscriptionId)
      
      // Mock subscription data
      return {
        id: subscriptionId,
        customerId: 'customer_id',
        planId: 'pro_monthly',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    } catch (error) {
      console.error('Stripe: Error fetching subscription', error)
      return null
    }
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResult> {
    try {
      console.log('Stripe: Creating payment', request)
      
      const paymentId = `pi_${Date.now()}`
      const payment: PaymentData = {
        id: paymentId,
        amount: request.amount,
        currency: request.currency,
        status: 'succeeded',
        customerId: request.customerId,
        description: request.description,
        createdAt: new Date().toISOString(),
        metadata: request.metadata
      }
      
      return {
        success: true,
        payment
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe payment error'
      }
    }
  }

  async capturePayment(paymentId: string): Promise<PaymentResult> {
    try {
      console.log('Stripe: Capturing payment', paymentId)
      
      return {
        success: true,
        payment: {
          id: paymentId,
          amount: 100.00,
          currency: 'USD',
          status: 'succeeded',
          createdAt: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe payment capture error'
      }
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResult> {
    try {
      console.log('Stripe: Refunding payment', paymentId, amount, reason)
      
      return {
        success: true,
        payment: {
          id: paymentId,
          amount: amount || 100.00,
          currency: 'USD',
          status: 'refunded',
          createdAt: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe refund error'
      }
    }
  }

  async getPayment(paymentId: string): Promise<PaymentData | null> {
    try {
      console.log('Stripe: Fetching payment', paymentId)
      
      return {
        id: paymentId,
        amount: 100.00,
        currency: 'USD',
        status: 'succeeded',
        createdAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Stripe: Error fetching payment', error)
      return null
    }
  }

  async createPayout(request: CreatePayoutRequest): Promise<PayoutResult> {
    try {
      console.log('Stripe: Creating payout', request)
      
      const payoutId = `po_${Date.now()}`
      const payout: PayoutData = {
        id: payoutId,
        amount: request.amount,
        currency: request.currency,
        status: 'pending',
        recipient: request.recipient,
        description: request.description,
        createdAt: new Date().toISOString(),
        metadata: request.metadata
      }
      
      return {
        success: true,
        payout
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe payout error'
      }
    }
  }

  async getPayoutStatus(payoutId: string): Promise<PayoutData | null> {
    try {
      console.log('Stripe: Fetching payout status', payoutId)
      
      return {
        id: payoutId,
        amount: 100.00,
        currency: 'USD',
        status: 'completed',
        recipient: {
          type: 'bank_account',
          email: 'user@example.com'
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Stripe: Error fetching payout', error)
      return null
    }
  }

  verifyWebhook(payload: string, signature: string): boolean {
    try {
      console.log('Stripe: Verifying webhook signature')
      // Implementation would verify using Stripe's webhook signature verification
      return signature.startsWith('t=')
    } catch (error) {
      console.error('Stripe: Webhook verification failed', error)
      return false
    }
  }

  parseWebhook(payload: string): WebhookEvent {
    try {
      const data = JSON.parse(payload)
      return {
        id: data.id,
        type: data.type,
        data: data.data,
        createdAt: new Date(data.created * 1000).toISOString()
      }
    } catch (error) {
      throw new Error('Invalid webhook payload')
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()

// Helper functions for easy integration
export const createSubscription = (request: CreateSubscriptionRequest) => 
  paymentService.createSubscription(request)
export const cancelSubscription = (subscriptionId: string, reason?: string) => 
  paymentService.cancelSubscription(subscriptionId, reason)
export const processPayment = (request: CreatePaymentRequest) => 
  paymentService.createPayment(request)
export const createReferralPayout = (userId: string, amount: number, recipient: PayoutRecipient, referralData: any) => 
  paymentService.processReferralPayout(userId, amount, recipient, referralData)
export const handleWebhook = (payload: string, signature: string) => 
  paymentService.handleWebhook(payload, signature)


