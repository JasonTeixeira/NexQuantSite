// 📧 NEWSLETTER SUBSCRIPTION API
import { NextRequest, NextResponse } from 'next/server'
// import { sendNewsletterWelcome } from '@/lib/email/newsletter-service'
import { sendEmail } from '@/lib/email/resend-service'

// Simple rate limiting for newsletter signups
const signupLimit = new Map<string, { count: number; resetTime: number }>()

function rateLimitNewsletterSignup(ip: string): boolean {
  const now = Date.now()
  const record = signupLimit.get(ip)
  
  if (!record || now > record.resetTime) {
    signupLimit.set(ip, { count: 1, resetTime: now + (24 * 60 * 60 * 1000) }) // 24 hours
    return true
  }
  
  if (record.count >= 3) { // Max 3 signups per day per IP
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'
    
    // Rate limiting
    if (!rateLimitNewsletterSignup(clientIP)) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    const { email, name, source, interests } = await request.json()
    
    // Validation
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    // Sanitize input
    const sanitized = {
      email: email.trim().toLowerCase(),
      name: name.trim().replace(/[<>]/g, ''),
      source: source?.trim() || 'website',
      interests: Array.isArray(interests) ? interests.map((i: string) => i.trim()) : []
    }
    
    // Send welcome email
    const emailResult = await sendEmail({
      to: sanitized.email,
      subject: 'Welcome to Nexural Insights! 📈',
      html: `<h1>Welcome ${sanitized.name}!</h1><p>Thanks for subscribing to Nexural Insights!</p>`,
      text: `Welcome ${sanitized.name}! Thanks for subscribing to Nexural Insights!`
    })
    
    if (!emailResult.success) {
      console.error('Failed to send newsletter welcome:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }
    
    // In production, save to database
    console.log('Newsletter subscription:', {
      email: sanitized.email,
      name: sanitized.name,
      source: sanitized.source,
      interests: sanitized.interests,
      timestamp: new Date().toISOString(),
      emailSent: emailResult.success,
      emailId: emailResult.data?.id
    })
    
    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to Nexural Insights! Check your email for confirmation.',
      emailId: emailResult.data?.id
    })
    
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}