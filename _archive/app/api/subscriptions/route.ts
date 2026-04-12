import { NextRequest, NextResponse } from 'next/server'
import { paymentService, createSubscription, cancelSubscription } from '@/lib/services/payment-service'
import { emailService } from '@/lib/services/email-service'
import { smsService } from '@/lib/services/sms-service'

// GET /api/subscriptions - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Mock subscription data - in production, this would come from database
    const subscriptionData = {
      userId,
      activeSubscription: {
        id: 'sub_12345',
        planId: 'pro_monthly',
        planName: 'Pro Plan',
        amount: 79.99,
        currency: 'USD',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        trialEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: '2024-01-01T00:00:00Z'
      },
      paymentHistory: [
        {
          id: 'pi_1',
          amount: 79.99,
          currency: 'USD',
          status: 'succeeded',
          createdAt: '2024-01-01T00:00:00Z',
          description: 'Pro Plan - Monthly'
        },
        {
          id: 'pi_2',
          amount: 79.99,
          currency: 'USD',
          status: 'succeeded',
          createdAt: '2023-12-01T00:00:00Z',
          description: 'Pro Plan - Monthly'
        }
      ],
      upcomingInvoice: {
        amount: 79.99,
        currency: 'USD',
        periodStart: '2024-02-01T00:00:00Z',
        periodEnd: '2024-03-01T00:00:00Z'
      }
    }

    return NextResponse.json(subscriptionData)
  } catch (error) {
    console.error('Subscriptions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, planId, paymentMethodId, couponCode, trialDays } = body

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'User ID and plan ID required' },
        { status: 400 }
      )
    }

    // Get user data (mock)
    const userData = await getUserById(userId)
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get plan details
    const plan = paymentService.getPlan(planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Create subscription
    const subscriptionRequest = {
      customerId: userId,
      planId,
      paymentMethodId,
      trialDays: trialDays || plan.trialDays,
      couponCode,
      metadata: {
        userId,
        userEmail: userData.email
      }
    }

    const subscriptionResult = await createSubscription(subscriptionRequest)

    if (!subscriptionResult.success) {
      return NextResponse.json(
        { error: subscriptionResult.error || 'Subscription creation failed' },
        { status: 500 }
      )
    }

    // Send subscription confirmation notifications
    try {
      // Email confirmation
      await emailService.sendTemplate('subscription_created', userData.email, {
        firstName: userData.name,
        planName: plan.name,
        amount: plan.amount,
        renewalDate: subscriptionResult.subscription?.currentPeriodEnd
      })

      // SMS confirmation (if phone number available)
      if (userData.phoneNumber) {
        await smsService.send({
          to: userData.phoneNumber,
          message: `Welcome to ${plan.name}! Your subscription is active. Next billing: ${new Date(subscriptionResult.subscription?.currentPeriodEnd || '').toLocaleDateString()}`,
          type: 'transactional'
        })
      }
    } catch (notificationError) {
      console.error('Subscription notification error:', notificationError)
      // Don't fail the subscription if notifications fail
    }

    return NextResponse.json({
      success: true,
      subscription: subscriptionResult.subscription,
      requiresAction: subscriptionResult.requiresAction,
      clientSecret: subscriptionResult.clientSecret
    })

  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// PUT /api/subscriptions/[subscriptionId] - Update subscription
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')
    const body = await request.json()
    const { planId, quantity, couponCode } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      )
    }

    // Update subscription
    const updateResult = await paymentService.updateSubscription(subscriptionId, {
      planId,
      quantity,
      couponCode
    })

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error || 'Subscription update failed' },
        { status: 500 }
      )
    }

    // Get updated plan details for notification
    const newPlan = planId ? paymentService.getPlan(planId) : null

    // Send update notification
    try {
      const subscription = updateResult.subscription
      if (subscription) {
        // Get user data for notification
        const userData = await getUserById(subscription.customerId)
        
        if (userData) {
          await emailService.send({
            to: userData.email,
            subject: 'Subscription Updated',
            html: `
              <h2>Subscription Updated</h2>
              <p>Hi ${userData.name},</p>
              <p>Your subscription has been updated successfully.</p>
              ${newPlan ? `<p>New Plan: ${newPlan.name} - $${newPlan.amount}/${newPlan.interval}</p>` : ''}
              <p>Changes will take effect on your next billing cycle.</p>
            `,
            category: 'transactional'
          })
        }
      }
    } catch (notificationError) {
      console.error('Subscription update notification error:', notificationError)
    }

    return NextResponse.json({
      success: true,
      subscription: updateResult.subscription
    })

  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/subscriptions/[subscriptionId] - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')
    const cancelReason = searchParams.get('reason') || 'User requested cancellation'

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      )
    }

    // Get subscription details before cancellation
    const existingSubscription = await paymentService.getSubscription(subscriptionId)
    
    // Cancel subscription
    const cancelResult = await cancelSubscription(subscriptionId, cancelReason)

    if (!cancelResult.success) {
      return NextResponse.json(
        { error: cancelResult.error || 'Subscription cancellation failed' },
        { status: 500 }
      )
    }

    // Send cancellation confirmation
    try {
      if (existingSubscription) {
        const userData = await getUserById(existingSubscription.customerId)
        
        if (userData) {
          await emailService.send({
            to: userData.email,
            subject: 'Subscription Cancelled',
            html: `
              <h2>Subscription Cancelled</h2>
              <p>Hi ${userData.name},</p>
              <p>Your subscription has been cancelled as requested.</p>
              <p>Your subscription will remain active until ${new Date(existingSubscription.currentPeriodEnd).toLocaleDateString()}.</p>
              <p>You can reactivate your subscription at any time from your account settings.</p>
              <p>Thank you for being a valued customer!</p>
            `,
            category: 'transactional'
          })
        }
      }
    } catch (notificationError) {
      console.error('Cancellation notification error:', notificationError)
    }

    return NextResponse.json({
      success: true,
      subscription: cancelResult.subscription,
      message: 'Subscription cancelled successfully'
    })

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

// Helper function to get user data (mock)
async function getUserById(userId: string) {
  // Mock user data - in production, this would query the database
  return {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890'
  }
}


