// 📧 TEST EMAIL ENDPOINT
import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, sendEmail, EmailTemplates } from '@/lib/email/resend-service'

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'test' } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      )
    }
    
    let result
    
    switch (type) {
      case 'welcome':
        const welcomeTemplate = EmailTemplates.welcome(
          'Test User',
          'https://nexuraltrading.com/verify?token=test123'
        )
        result = await sendEmail({
          to: email,
          ...welcomeTemplate
        })
        break
        
      case 'reset':
        const resetTemplate = EmailTemplates.passwordReset(
          'https://nexuraltrading.com/reset?token=test123'
        )
        result = await sendEmail({
          to: email,
          ...resetTemplate
        })
        break
        
      case 'payment':
        const paymentTemplate = EmailTemplates.paymentSuccess(99.99, 'Professional')
        result = await sendEmail({
          to: email,
          ...paymentTemplate
        })
        break
        
      default:
        result = await sendTestEmail(email)
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        data: result.data
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

