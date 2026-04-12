// 💳 CREATE STRIPE CHECKOUT SESSION
import { NextRequest, NextResponse } from 'next/server'
import { initStripe, STRIPE_CONFIG } from '@/lib/payments/stripe-config'
import { verifyAuth } from '@/lib/auth/verify'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { priceId, mode = 'subscription', quantity = 1 } = await request.json()
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID required' },
        { status: 400 }
      )
    }
    
    // For development/testing without real Stripe
    if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY) {
      // Mock checkout session
      const mockSession = {
        id: `cs_test_${Date.now()}`,
        url: `/checkout/success?session_id=mock_${Date.now()}`,
        payment_status: 'unpaid',
        status: 'open',
        mode,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`
      }
      
      return NextResponse.json({
        success: true,
        session: mockSession,
        message: 'Mock checkout session created (Stripe not configured)'
      })
    }
    
    // Production Stripe checkout
    const stripe = initStripe()
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: STRIPE_CONFIG.paymentMethods,
      mode,
      line_items: [
        {
          price: priceId,
          quantity
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      customer_email: authResult.userEmail,
      metadata: {
        userId: authResult.userId || '',
        userName: authResult.userName || ''
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      automatic_tax: {
        enabled: STRIPE_CONFIG.automaticTax
      },
      tax_id_collection: {
        enabled: STRIPE_CONFIG.taxIdCollection
      },
      subscription_data: mode === 'subscription' ? {
        trial_period_days: STRIPE_CONFIG.trialDays,
        metadata: {
          userId: authResult.userId || ''
        }
      } : undefined
    })
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        url: session.url
      }
    })
  } catch (error: any) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

