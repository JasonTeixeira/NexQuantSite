// 📧 CONTACT FORM API
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, EmailTemplates } from '@/lib/email/resend-service'

// Simple rate limiting store (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function simpleRateLimit(ip: string, maxRequests = 5, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'
    
    // Rate limiting: 5 contacts per hour
    if (!simpleRateLimit(clientIP, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many contact form submissions. Please try again later.' },
        { status: 429 }
      )
    }

    const body: ContactFormData = await request.json()
    
    // Validation
    const { name, email, subject, message } = body
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
    
    // Length validation
    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
      return NextResponse.json(
        { error: 'Field length exceeded' },
        { status: 400 }
      )
    }
    
    // Message length minimum
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      )
    }
    
    // Sanitize input (basic)
    const sanitized = {
      name: name.trim().replace(/[<>]/g, ''),
      email: email.trim().toLowerCase(),
      subject: subject.trim().replace(/[<>]/g, ''),
      message: message.trim().replace(/[<>]/g, '')
    }
    
    // Send simple email notification
    const emailResult = await sendEmail({
      to: 'sage@sageideas.org',
      subject: `Contact Form: ${sanitized.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitized.name}</p>
        <p><strong>Email:</strong> ${sanitized.email}</p>
        <p><strong>Subject:</strong> ${sanitized.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${sanitized.message}</p>
        <hr>
        <p><a href="mailto:${sanitized.email}">Reply to ${sanitized.name}</a></p>
      `,
      text: `
New Contact: ${sanitized.name} (${sanitized.email})
Subject: ${sanitized.subject}
Message: ${sanitized.message}
      `
    })
    
    if (!emailResult.success) {
      console.error('Failed to send contact email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again or email us directly.' },
        { status: 500 }
      )
    }
    
    // Send confirmation email to user using professional template
    const { ContactConfirmationTemplate } = await import('@/lib/email/email-templates')
    
    const confirmationResult = await sendEmail({
      to: sanitized.email,
      subject: 'Message Received - Nexural Support Team ✉️',
      html: ContactConfirmationTemplate(sanitized.name, sanitized.subject),
      text: `
Hi ${sanitized.name},

Thank you for contacting Nexural Trading Platform. We've received your message about "${sanitized.subject}".

Our team will review your message and respond within 2-4 hours.

For urgent matters, email support@nexural.io directly.

Best regards,
The Nexural Trading Team

nexural.io | contact@nexural.io
      `,
      tags: [
        { name: 'type', value: 'contact-confirmation' },
        { name: 'user', value: sanitized.email }
      ]
    })
    
    // Log contact (in production, save to database)
    console.log('Contact form submission:', {
      name: sanitized.name,
      email: sanitized.email,
      subject: sanitized.subject,
      timestamp: new Date().toISOString(),
      emailSent: emailResult.success,
      confirmationSent: confirmationResult.success
    })
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.',
      emailId: emailResult.data?.id
    })
    
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again or email us directly at contact@nexural.io' },
      { status: 500 }
    )
  }
}
