import { NextRequest, NextResponse } from 'next/server'
import { emailService, sendReferralInvitation } from '@/lib/services/email-service'
import { smsService } from '@/lib/services/sms-service'
import { paymentService, createReferralPayout } from '@/lib/services/payment-service'

// GET /api/referrals - Get user's referral data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Mock referral data - in production, this would come from database
    const referralData = {
      userId,
      referralCode: `REF_${userId.toUpperCase()}`,
      stats: {
        totalReferrals: 47,
        activeReferrals: 35,
        totalEarnings: 2847.50,
        monthlyEarnings: 485.25,
        pendingPayouts: 185.50,
        conversionRate: 23.8,
        tier: 'Gold'
      },
      referrals: [
        {
          id: 'ref1',
          name: 'Alex Thompson',
          username: 'alex_new',
          joinDate: '2024-01-15T10:30:00Z',
          status: 'active',
          totalDeposit: 5000,
          commission: 125.00,
          trades: 23
        }
      ],
      commissionHistory: [
        {
          id: 'comm1',
          date: '2024-01-15',
          referralName: 'Alex Thompson',
          type: 'signup_bonus',
          amount: 25.00,
          status: 'paid'
        }
      ]
    }

    return NextResponse.json(referralData)
  } catch (error) {
    console.error('Referrals API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/referrals/invite - Send referral invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referrerId, inviteEmail, invitePhone, personalMessage, method } = body

    if (!referrerId || (!inviteEmail && !invitePhone)) {
      return NextResponse.json(
        { error: 'Referrer ID and at least one contact method required' },
        { status: 400 }
      )
    }

    // Get referrer information (mock data)
    const referrer = {
      id: referrerId,
      name: 'John Doe',
      username: 'john_trader',
      referralCode: `REF_${referrerId.toUpperCase()}`,
      stats: {
        totalTrades: 150,
        winRate: 72.5,
        totalPnL: 25670.50
      }
    }

    const referralLink = `https://nexural.com/ref/${referrer.referralCode}`
    const bonusAmount = 50

    const invitationData = {
      referrerName: referrer.name,
      referralLink,
      bonusAmount,
      personalMessage: personalMessage || `Join me on Nexural Trading! You'll get a $${bonusAmount} welcome bonus.`
    }

    const results: any = {
      success: false,
      emailSent: false,
      smsSent: false
    }

    // Send email invitation
    if (inviteEmail && (method === 'email' || method === 'both')) {
      try {
        const emailResult = await sendReferralInvitation(inviteEmail, invitationData)
        results.emailSent = emailResult.success
        results.emailError = emailResult.error
      } catch (error) {
        results.emailError = 'Email service unavailable'
      }
    }

    // Send SMS invitation
    if (invitePhone && (method === 'sms' || method === 'both')) {
      try {
        // Use SMS service to send referral notification
        const smsResult = await smsService.sendTemplate('referral_invitation', invitePhone, {
          referralName: referrer.name,
          bonus: bonusAmount
        })
        results.smsSent = smsResult.success
        results.smsError = smsResult.error
      } catch (error) {
        results.smsError = 'SMS service unavailable'
      }
    }

    results.success = results.emailSent || results.smsSent

    // Log invitation attempt (in production, save to database)
    console.log('Referral invitation sent:', {
      referrerId,
      inviteEmail,
      invitePhone,
      method,
      results
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Referral invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}