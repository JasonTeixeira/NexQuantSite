// 🔔 STRIPE WEBHOOK HANDLER
import { NextRequest, NextResponse } from 'next/server'
import { initStripe, STRIPE_CONFIG } from '@/lib/payments/stripe-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }
    
    // For development without Stripe
    if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY) {
      console.log('📦 Mock webhook received')
      return NextResponse.json({ received: true })
    }
    
    const stripe = initStripe()
    
    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
    
    // Handle webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object)
        break
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(session: any) {
  console.log('✅ Checkout completed:', session.id)
  // Update user subscription in database
  // Send welcome email
  // Grant access to features
}

async function handleSubscriptionChange(subscription: any) {
  console.log('🔄 Subscription changed:', subscription.id)
  // Update user subscription status
  // Adjust feature access
}

async function handleSubscriptionCanceled(subscription: any) {
  console.log('❌ Subscription canceled:', subscription.id)
  // Revoke premium access
  // Send cancellation email
}

async function handlePaymentSuccess(invoice: any) {
  console.log('💰 Payment succeeded:', invoice.id)
  // Record payment
  // Send receipt
}

async function handlePaymentFailed(invoice: any) {
  console.log('⚠️ Payment failed:', invoice.id)
  // Send payment failure email
  // Retry payment
  // Suspend account if needed
}

