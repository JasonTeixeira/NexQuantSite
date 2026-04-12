// 💳 STRIPE PAYMENT SERVICE
import Stripe from 'stripe'

// NEVER hardcode API keys!
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Publishable key for frontend
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: [
      '5 Trading Signals/month',
      'Basic Market Data',
      'Community Access',
      'Educational Content'
    ]
  },
  starter: {
    name: 'Starter',
    priceId: 'price_starter', // Update with your actual price ID
    price: 29.99,
    features: [
      '50 Trading Signals/month',
      'Real-time Market Data',
      'Advanced Analytics',
      'Priority Support',
      '2 Trading Bots'
    ]
  },
  professional: {
    name: 'Professional',
    priceId: 'price_professional', // Update with your actual price ID
    price: 99.99,
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
    name: 'Enterprise',
    priceId: 'price_enterprise', // Update with your actual price ID
    price: 499.99,
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
}

// Create checkout session
export async function createCheckoutSession({
  userId,
  email,
  priceId,
  successUrl,
  cancelUrl,
  mode = 'subscription'
}: {
  userId: string
  email: string
  priceId: string
  successUrl: string
  cancelUrl: string
  mode?: 'payment' | 'subscription'
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
      subscription_data: mode === 'subscription' ? {
        trial_period_days: 14,
        metadata: {
          userId,
        }
      } : undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      automatic_tax: {
        enabled: true,
      },
    })

    return { success: true, session }
  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error)
    return { success: false, error: error.message }
  }
}

// Create customer portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { success: true, url: session.url }
  } catch (error: any) {
    console.error('❌ Portal session error:', error)
    return { success: false, error: error.message }
  }
}

// Get subscription status
export async function getSubscriptionStatus(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return {
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.items.data[0]?.price.id,
      }
    }
  } catch (error: any) {
    console.error('❌ Get subscription error:', error)
    return { success: false, error: error.message }
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return { success: true, subscription }
  } catch (error: any) {
    console.error('❌ Cancel subscription error:', error)
    return { success: false, error: error.message }
  }
}

// Process webhook
export async function processWebhook(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required')
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('✅ Checkout completed:', session.id)
        // TODO: Update user subscription in database
        break
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        console.log('✅ Subscription updated:', subscription.id)
        // TODO: Update subscription in database
        break
        
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription
        console.log('❌ Subscription cancelled:', deletedSub.id)
        // TODO: Update subscription status in database
        break
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('✅ Payment successful:', invoice.id)
        // TODO: Send receipt email
        break
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('❌ Payment failed:', failedInvoice.id)
        // TODO: Send payment failure email
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return { success: true, event }
  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    return { success: false, error: error.message }
  }
}

// Create payment intent (for one-time payments)
export async function createPaymentIntent({
  amount,
  currency = 'usd',
  metadata
}: {
  amount: number
  currency?: string
  metadata?: Record<string, string>
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    })

    return { 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }
  } catch (error: any) {
    console.error('❌ Payment intent error:', error)
    return { success: false, error: error.message }
  }
}

// Refund payment
export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
    })

    return { success: true, refund }
  } catch (error: any) {
    console.error('❌ Refund error:', error)
    return { success: false, error: error.message }
  }
}

