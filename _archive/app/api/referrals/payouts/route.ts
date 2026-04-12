import { NextRequest, NextResponse } from 'next/server'
import { paymentService, createReferralPayout } from '@/lib/services/payment-service'
import { emailService } from '@/lib/services/email-service'
import { smsService } from '@/lib/services/sms-service'

// GET /api/referrals/payouts - Get user's payout history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Mock payout data - in production, this would come from database
    const payoutData = {
      userId,
      totalPaid: 2662.00,
      pendingAmount: 185.50,
      nextPayoutDate: '2024-02-01T00:00:00Z',
      payoutMethod: {
        type: 'bank_account',
        last4: '1234',
        bankName: 'Chase Bank'
      },
      history: [
        {
          id: 'payout_1',
          amount: 485.25,
          status: 'completed',
          requestedAt: '2024-01-01T00:00:00Z',
          completedAt: '2024-01-03T12:30:00Z',
          method: 'bank_account'
        },
        {
          id: 'payout_2',
          amount: 392.75,
          status: 'processing',
          requestedAt: '2024-01-15T00:00:00Z',
          method: 'paypal'
        }
      ]
    }

    return NextResponse.json(payoutData)
  } catch (error) {
    console.error('Payouts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/referrals/payouts - Request a payout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, payoutMethod } = body

    if (!userId || !amount || !payoutMethod) {
      return NextResponse.json(
        { error: 'User ID, amount, and payout method required' },
        { status: 400 }
      )
    }

    // Validate minimum payout amount
    const minPayout = 10.00
    if (amount < minPayout) {
      return NextResponse.json(
        { error: `Minimum payout amount is $${minPayout}` },
        { status: 400 }
      )
    }

    // Get user data (mock)
    const userData = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      totalEarnings: 2847.50,
      availableBalance: 185.50
    }

    // Check if user has sufficient balance
    if (amount > userData.availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance for payout' },
        { status: 400 }
      )
    }

    // Prepare payout recipient based on method
    let recipient: any
    switch (payoutMethod.type) {
      case 'bank_account':
        recipient = {
          type: 'bank_account',
          email: userData.email,
          bankAccount: {
            accountNumber: payoutMethod.accountNumber,
            routingNumber: payoutMethod.routingNumber,
            accountHolderName: payoutMethod.accountHolderName,
            accountType: payoutMethod.accountType || 'checking'
          }
        }
        break
      case 'paypal':
        recipient = {
          type: 'paypal',
          email: payoutMethod.email || userData.email
        }
        break
      case 'crypto':
        recipient = {
          type: 'crypto',
          cryptoAddress: {
            address: payoutMethod.address,
            network: payoutMethod.network
          }
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid payout method' },
          { status: 400 }
        )
    }

    // Create payout using payment service
    const referralData = {
      referralCount: 47,
      totalCommissions: userData.totalEarnings
    }

    const payoutResult = await createReferralPayout(
      userId,
      amount,
      recipient,
      referralData
    )

    if (!payoutResult.success) {
      return NextResponse.json(
        { error: payoutResult.error || 'Payout creation failed' },
        { status: 500 }
      )
    }

    // Send confirmation notifications
    try {
      // Email notification
      await emailService.send({
        to: userData.email,
        subject: 'Payout Request Confirmed',
        html: `
          <h2>Payout Request Confirmed</h2>
          <p>Hi ${userData.name},</p>
          <p>Your payout request has been received and is being processed:</p>
          <ul>
            <li>Amount: $${amount.toFixed(2)}</li>
            <li>Method: ${payoutMethod.type}</li>
            <li>Payout ID: ${payoutResult.payout?.id}</li>
          </ul>
          <p>You'll receive another notification when the payout is complete.</p>
        `,
        category: 'transactional'
      })

      // SMS notification if phone available
      if (userData.phone) {
        await smsService.send({
          to: userData.phone,
          message: `Payout request confirmed: $${amount} via ${payoutMethod.type}. Payout ID: ${payoutResult.payout?.id}`,
          type: 'transactional'
        })
      }
    } catch (notificationError) {
      console.error('Payout notification error:', notificationError)
      // Don't fail the payout if notifications fail
    }

    return NextResponse.json({
      success: true,
      payout: payoutResult.payout,
      message: 'Payout request created successfully'
    })
  } catch (error) {
    console.error('Payout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    )
  }
}

// PUT /api/referrals/payouts/[payoutId] - Update payout method
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const payoutId = searchParams.get('payoutId')
    const body = await request.json()
    const { payoutMethod } = body

    if (!payoutId || !payoutMethod) {
      return NextResponse.json(
        { error: 'Payout ID and method required' },
        { status: 400 }
      )
    }

    // In production, update payout method in database
    console.log('Updating payout method:', { payoutId, payoutMethod })

    return NextResponse.json({
      success: true,
      message: 'Payout method updated successfully'
    })
  } catch (error) {
    console.error('Payout update error:', error)
    return NextResponse.json(
      { error: 'Failed to update payout method' },
      { status: 500 }
    )
  }
}


