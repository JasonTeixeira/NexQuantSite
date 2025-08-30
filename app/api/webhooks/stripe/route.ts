import { NextRequest, NextResponse } from 'next/server'
import { paymentService, handleWebhook } from '@/lib/services/payment-service'
import { emailService } from '@/lib/services/email-service'
import { smsService } from '@/lib/services/sms-service'

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature header' },
        { status: 400 }
      )
    }

    // Handle webhook using payment service
    const webhookResult = await handleWebhook(body, signature)

    if (!webhookResult.processed) {
      console.error('Webhook processing failed:', webhookResult.error)
      return NextResponse.json(
        { error: webhookResult.error },
        { status: 400 }
      )
    }

    // Parse the webhook event for additional processing
    const event = JSON.parse(body)
    
    // Handle specific events that require additional actions
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
        
      default:
        console.log('Unhandled webhook event:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    )
  }
}

// Handle successful payment
async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const customerId = paymentIntent.customer
    const amount = paymentIntent.amount / 100 // Convert from cents
    
    // Get customer data (mock)
    const customer = await getCustomerById(customerId)
    
    if (customer) {
      // Send payment confirmation email
      await emailService.send({
        to: customer.email,
        subject: 'Payment Confirmed',
        html: `
          <h2>Payment Confirmed</h2>
          <p>Hi ${customer.name},</p>
          <p>We've successfully processed your payment of $${amount.toFixed(2)}.</p>
          <p>Transaction ID: ${paymentIntent.id}</p>
          <p>Thank you for your business!</p>
        `,
        category: 'transactional'
      })

      // Send SMS notification if available
      if (customer.phoneNumber) {
        await smsService.send({
          to: customer.phoneNumber,
          message: `Payment confirmed: $${amount.toFixed(2)}. Transaction ID: ${paymentIntent.id}`,
          type: 'transactional'
        })
      }
    }

    console.log('Payment success handled:', { customerId, amount, paymentIntentId: paymentIntent.id })
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: any) {
  try {
    const customerId = paymentIntent.customer
    const amount = paymentIntent.amount / 100
    const failureReason = paymentIntent.last_payment_error?.message || 'Payment method declined'
    
    const customer = await getCustomerById(customerId)
    
    if (customer) {
      // Send payment failure notification
      await emailService.send({
        to: customer.email,
        subject: 'Payment Failed - Action Required',
        html: `
          <h2>Payment Failed</h2>
          <p>Hi ${customer.name},</p>
          <p>We were unable to process your payment of $${amount.toFixed(2)}.</p>
          <p>Reason: ${failureReason}</p>
          <p>Please update your payment method or try again.</p>
          <a href="https://nexural.com/billing" style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Update Payment Method</a>
        `,
        category: 'transactional'
      })

      // Send SMS alert
      if (customer.phoneNumber) {
        await smsService.send({
          to: customer.phoneNumber,
          message: `Payment failed: $${amount.toFixed(2)}. Please update your payment method: https://nexural.com/billing`,
          type: 'transactional'
        })
      }
    }

    console.log('Payment failure handled:', { customerId, amount, reason: failureReason })
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// Handle successful invoice payment (subscription renewal)
async function handleInvoicePaymentSuccess(invoice: any) {
  try {
    const customerId = invoice.customer
    const subscriptionId = invoice.subscription
    const amount = invoice.amount_paid / 100
    
    const customer = await getCustomerById(customerId)
    const subscription = await paymentService.getSubscription(subscriptionId)
    
    if (customer && subscription) {
      // Send subscription renewal confirmation
      await emailService.send({
        to: customer.email,
        subject: 'Subscription Renewed',
        html: `
          <h2>Subscription Renewed</h2>
          <p>Hi ${customer.name},</p>
          <p>Your subscription has been renewed successfully.</p>
          <p>Amount: $${amount.toFixed(2)}</p>
          <p>Next billing date: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
          <p>Thank you for continuing with Nexural Trading!</p>
        `,
        category: 'transactional'
      })
    }

    console.log('Subscription renewal handled:', { customerId, subscriptionId, amount })
  } catch (error) {
    console.error('Error handling invoice payment success:', error)
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const customerId = invoice.customer
    const subscriptionId = invoice.subscription
    const amount = invoice.amount_due / 100
    const attemptCount = invoice.attempt_count || 1
    
    const customer = await getCustomerById(customerId)
    
    if (customer) {
      // Send payment failure notification with urgency based on attempt count
      const isUrgent = attemptCount >= 3
      const subject = isUrgent ? 'URGENT: Subscription Payment Failed' : 'Subscription Payment Failed'
      
      await emailService.send({
        to: customer.email,
        subject,
        html: `
          <h2>${isUrgent ? 'URGENT: ' : ''}Subscription Payment Failed</h2>
          <p>Hi ${customer.name},</p>
          <p>We were unable to process your subscription payment of $${amount.toFixed(2)}.</p>
          ${isUrgent ? '<p><strong>Your subscription will be cancelled if payment is not updated within 24 hours.</strong></p>' : ''}
          <p>Please update your payment method to continue your subscription.</p>
          <a href="https://nexural.com/billing" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Update Payment Method Now</a>
        `,
        category: 'transactional'
      })

      // Send SMS alert for urgent cases
      if (customer.phoneNumber && isUrgent) {
        await smsService.send({
          to: customer.phoneNumber,
          message: `URGENT: Subscription payment failed. Update payment method within 24h to avoid cancellation: https://nexural.com/billing`,
          type: 'transactional',
          priority: 'urgent'
        })
      }
    }

    console.log('Invoice payment failure handled:', { customerId, subscriptionId, amount, attemptCount })
  } catch (error) {
    console.error('Error handling invoice payment failure:', error)
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: any) {
  try {
    const customerId = subscription.customer
    const customer = await getCustomerById(customerId)
    
    if (customer) {
      // Send welcome email with subscription details
      await emailService.send({
        to: customer.email,
        subject: 'Welcome to Nexural Trading!',
        html: `
          <h2>Welcome to Nexural Trading!</h2>
          <p>Hi ${customer.name},</p>
          <p>Thank you for subscribing to our platform. Your subscription is now active!</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Explore our AI-powered trading algorithms</li>
            <li>Set up your trading preferences</li>
            <li>Join our community of successful traders</li>
            <li>Access our comprehensive learning resources</li>
          </ul>
          <a href="https://nexural.com/dashboard" style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Get Started</a>
          <p>If you have any questions, our support team is here to help!</p>
        `,
        category: 'transactional'
      })
    }

    console.log('Subscription creation handled:', { customerId, subscriptionId: subscription.id })
  } catch (error) {
    console.error('Error handling subscription creation:', error)
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer
    const customer = await getCustomerById(customerId)
    
    if (customer) {
      // Determine what changed and send appropriate notification
      const changeNotification = getSubscriptionChangeMessage(subscription)
      
      await emailService.send({
        to: customer.email,
        subject: 'Subscription Updated',
        html: `
          <h2>Subscription Updated</h2>
          <p>Hi ${customer.name},</p>
          <p>Your subscription has been updated:</p>
          ${changeNotification}
          <p>Changes will be reflected in your next billing cycle.</p>
        `,
        category: 'transactional'
      })
    }

    console.log('Subscription update handled:', { customerId, subscriptionId: subscription.id })
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

// Handle subscription deleted (cancelled)
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer
    const customer = await getCustomerById(customerId)
    
    if (customer) {
      // Send cancellation confirmation and retention offer
      await emailService.send({
        to: customer.email,
        subject: 'Subscription Cancelled - We\'ll Miss You!',
        html: `
          <h2>Subscription Cancelled</h2>
          <p>Hi ${customer.name},</p>
          <p>We're sorry to see you go! Your subscription has been cancelled.</p>
          <p>Your account will remain active until ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}.</p>
          <p>If you change your mind, you can reactivate your subscription at any time.</p>
          <p>We'd love to know why you cancelled so we can improve. <a href="https://nexural.com/feedback">Share your feedback</a></p>
          <a href="https://nexural.com/pricing" style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Reactivate Subscription</a>
        `,
        category: 'transactional'
      })
    }

    console.log('Subscription cancellation handled:', { customerId, subscriptionId: subscription.id })
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}

// Helper function to get customer data (mock)
async function getCustomerById(customerId: string) {
  // Mock customer data - in production, this would query the database
  return {
    id: customerId,
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890'
  }
}

// Helper function to format subscription change message
function getSubscriptionChangeMessage(subscription: any): string {
  // This would analyze the subscription object to determine what changed
  // For now, return a generic message
  return `
    <ul>
      <li>Subscription status: ${subscription.status}</li>
      <li>Next billing: ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}</li>
    </ul>
  `
}


