import { NextRequest, NextResponse } from 'next/server'
import { smsService, generateOTP, verifyOTP, sendLogin2FA } from '@/lib/services/sms-service'
import { emailService } from '@/lib/services/email-service'

// POST /api/auth/2fa/send - Send 2FA code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, phoneNumber, purpose = 'login', method = 'sms' } = body

    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { error: 'User ID and phone number required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Rate limiting - check if user has requested too many codes recently
    // In production, this would be checked against database
    const rateLimitKey = `2fa_${userId}_${Date.now().toString().slice(0, -4)}` // 10-minute window
    
    try {
      let result: any = { success: false }
      
      if (method === 'sms' || method === 'both') {
        // Send SMS 2FA code
        switch (purpose) {
          case 'login':
            result = await sendLogin2FA(phoneNumber)
            break
          case 'signup':
            result = await smsService.sendVerificationCode(phoneNumber, 5)
            break
          case 'password_reset':
            const { code } = await generateOTP(phoneNumber, 'password_reset')
            result = await smsService.sendTemplate('verification_code', phoneNumber, {
              code,
              minutes: 10
            })
            break
          case 'transaction':
            const transactionCode = await generateOTP(phoneNumber, 'transaction')
            result = await smsService.sendTemplate('verification_code', phoneNumber, {
              code: transactionCode.code,
              minutes: 15
            })
            break
          default:
            return NextResponse.json(
              { error: 'Invalid purpose' },
              { status: 400 }
            )
        }
      }

      if (method === 'email' || method === 'both') {
        // For email 2FA, we'd use the email service
        // This is a backup method when SMS fails
        const user = await getUserById(userId) // Mock function
        
        if (user?.email) {
          const { code } = await generateOTP(phoneNumber, purpose as any)
          await emailService.send({
            to: user.email,
            subject: 'Your Nexural Verification Code',
            html: `
              <h2>Verification Code</h2>
              <p>Hi ${user.name},</p>
              <p>Your verification code is: <strong>${code}</strong></p>
              <p>This code expires in 10 minutes.</p>
              <p>If you didn't request this code, please contact our support team.</p>
            `,
            category: 'transactional'
          })
          
          result = { success: true, messageId: `email_${Date.now()}` }
        }
      }

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || '2FA code sending failed' },
          { status: 500 }
        )
      }

      // Log the 2FA attempt
      console.log('2FA code sent:', {
        userId,
        phoneNumber: phoneNumber.replace(/(\+\d{1,3})\d+(\d{4})/, '$1****$2'),
        purpose,
        method,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: `2FA code sent via ${method}`,
        messageId: result.messageId
      })

    } catch (serviceError) {
      console.error('2FA service error:', serviceError)
      return NextResponse.json(
        { error: '2FA service temporarily unavailable' },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('2FA send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/auth/2fa/verify - Verify 2FA code
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, phoneNumber, code, purpose = 'login' } = body

    if (!userId || !phoneNumber || !code) {
      return NextResponse.json(
        { error: 'User ID, phone number, and code required' },
        { status: 400 }
      )
    }

    // Verify the code
    const verificationResult = await verifyOTP(
      phoneNumber, 
      code.toString().trim(), 
      purpose as any
    )

    if (!verificationResult.success) {
      // Log failed verification attempt
      console.log('2FA verification failed:', {
        userId,
        phoneNumber: phoneNumber.replace(/(\+\d{1,3})\d+(\d{4})/, '$1****$2'),
        purpose,
        error: verificationResult.error,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      )
    }

    // Log successful verification
    console.log('2FA verification successful:', {
      userId,
      phoneNumber: phoneNumber.replace(/(\+\d{1,3})\d+(\d{4})/, '$1****$2'),
      purpose,
      timestamp: new Date().toISOString()
    })

    // In production, update user session/token to mark 2FA as completed
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
      verified: true
    })

  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/2fa/status - Get 2FA status for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // In production, this would check user's 2FA settings from database
    const user2FAStatus = {
      userId,
      enabled: true,
      phoneNumber: '+1****567890', // Masked phone number
      backupEmail: true,
      lastUsed: '2024-01-15T10:30:00Z',
      methods: ['sms', 'email'],
      trustedDevices: 2
    }

    return NextResponse.json(user2FAStatus)

  } catch (error) {
    console.error('2FA status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    phoneNumber: '+1234567890',
    is2FAEnabled: true
  }
}
