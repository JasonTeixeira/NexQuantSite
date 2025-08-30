// 🎨 EMAIL SHOWCASE API - Test all email templates
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend-service'
import { 
  NewsletterWelcomeTemplate, 
  SubscriptionWelcomeTemplate, 
  PaymentConfirmationTemplate, 
  ContactConfirmationTemplate 
} from '@/lib/email/email-templates'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const emailType = searchParams.get('type') || 'all'
  const testEmail = searchParams.get('email') || 'sage@sageideas.org'
  
  const results: any[] = []
  
  try {
    // 1. Newsletter Welcome Email
    if (emailType === 'all' || emailType === 'newsletter') {
      const newsletterResult = await sendEmail({
        to: testEmail,
        subject: '📈 Welcome to Nexural Insights! Your Weekly Trading Intelligence',
        html: NewsletterWelcomeTemplate('Sage'),
        text: `Welcome to Nexural Insights! Hi Sage, you're now subscribed to our weekly trading intelligence.`,
        tags: [{ name: 'type', value: 'newsletter-showcase' }]
      })
      
      results.push({
        type: 'Newsletter Welcome',
        success: newsletterResult.success,
        emailId: newsletterResult.data?.id,
        error: newsletterResult.error
      })
    }
    
    // 2. Subscription Welcome Email
    if (emailType === 'all' || emailType === 'subscription') {
      const features = [
        'Real-time AI trading signals',
        'Advanced portfolio analytics',
        'Risk management tools', 
        'Expert trading community',
        'Educational resources & webinars',
        '24/7 priority customer support',
        'Exclusive market insights',
        'Professional trading tools'
      ]
      
      const subscriptionResult = await sendEmail({
        to: testEmail,
        subject: '🚀 Welcome to Nexural Pro! Your Trading Superpowers Activated',
        html: SubscriptionWelcomeTemplate('Sage', 'Pro Plan', features),
        text: `Welcome to Nexural Pro! Hi Sage, your Pro Plan is now active with all premium features.`,
        tags: [{ name: 'type', value: 'subscription-showcase' }]
      })
      
      results.push({
        type: 'Subscription Welcome',
        success: subscriptionResult.success,
        emailId: subscriptionResult.data?.id,
        error: subscriptionResult.error
      })
    }
    
    // 3. Payment Confirmation Email
    if (emailType === 'all' || emailType === 'payment') {
      const nextBillingDate = new Date()
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      const formattedDate = nextBillingDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      const paymentResult = await sendEmail({
        to: testEmail,
        subject: '✅ Payment Confirmed - Nexural Pro Plan Active',
        html: PaymentConfirmationTemplate(
          'Sage', 
          '€29.99', 
          'Pro Plan', 
          'https://nexural.io/invoice/sample', 
          formattedDate
        ),
        text: `Payment Confirmed! Hi Sage, your €29.99 payment for Pro Plan has been processed.`,
        tags: [{ name: 'type', value: 'payment-showcase' }]
      })
      
      results.push({
        type: 'Payment Confirmation',
        success: paymentResult.success,
        emailId: paymentResult.data?.id,
        error: paymentResult.error
      })
    }
    
    // 4. Contact Confirmation Email
    if (emailType === 'all' || emailType === 'contact') {
      const contactResult = await sendEmail({
        to: testEmail,
        subject: '✉️ Message Received - Nexural Support Team',
        html: ContactConfirmationTemplate('Sage', 'Question about Pro Plan features'),
        text: `Message Received! Hi Sage, we got your message about "Question about Pro Plan features".`,
        tags: [{ name: 'type', value: 'contact-showcase' }]
      })
      
      results.push({
        type: 'Contact Confirmation',
        success: contactResult.success,
        emailId: contactResult.data?.id,
        error: contactResult.error
      })
    }
    
    // Summary
    const successful = results.filter(r => r.success).length
    const total = results.length
    
    return NextResponse.json({
      success: true,
      message: `Email showcase complete! Sent ${successful}/${total} emails successfully.`,
      testEmail,
      emailType,
      results,
      summary: {
        total,
        successful,
        failed: total - successful
      }
    })
    
  } catch (error: any) {
    console.error('Email showcase error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}

// Quick test specific email types
export async function POST(request: NextRequest) {
  const { emailType, testEmail, customData } = await request.json()
  
  try {
    let result
    
    switch (emailType) {
      case 'newsletter':
        result = await sendEmail({
          to: testEmail,
          subject: '📈 Newsletter Test - Nexural Insights',
          html: NewsletterWelcomeTemplate(customData?.name || 'Test User'),
          tags: [{ name: 'type', value: 'newsletter-test' }]
        })
        break
        
      case 'subscription':
        const features = customData?.features || [
          'AI Trading Signals', 'Portfolio Analytics', 'Risk Management'
        ]
        result = await sendEmail({
          to: testEmail,
          subject: '🚀 Subscription Test - Welcome to Pro!',
          html: SubscriptionWelcomeTemplate(
            customData?.name || 'Test User', 
            customData?.plan || 'Pro Plan', 
            features
          ),
          tags: [{ name: 'type', value: 'subscription-test' }]
        })
        break
        
      case 'payment':
        result = await sendEmail({
          to: testEmail,
          subject: '✅ Payment Test - Transaction Confirmed',
          html: PaymentConfirmationTemplate(
            customData?.name || 'Test User',
            customData?.amount || '€29.99',
            customData?.plan || 'Pro Plan',
            'https://nexural.io/invoice/test',
            new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })
          ),
          tags: [{ name: 'type', value: 'payment-test' }]
        })
        break
        
      case 'contact':
        result = await sendEmail({
          to: testEmail,
          subject: '✉️ Contact Test - Message Received',
          html: ContactConfirmationTemplate(
            customData?.name || 'Test User',
            customData?.subject || 'Test inquiry'
          ),
          tags: [{ name: 'type', value: 'contact-test' }]
        })
        break
        
      default:
        return NextResponse.json({
          error: 'Invalid email type. Use: newsletter, subscription, payment, or contact'
        }, { status: 400 })
    }
    
    return NextResponse.json({
      success: result.success,
      emailType,
      testEmail,
      emailId: result.data?.id,
      error: result.error
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

