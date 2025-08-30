// ⚙️ USER SETTINGS API
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const settings = {
      account: {
        email: authResult.userEmail || 'user@example.com',
        username: authResult.userName || 'username',
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false
      },
      notifications: {
        email: {
          trades: true,
          news: true,
          promotions: false,
          security: true
        },
        push: {
          trades: true,
          news: false,
          promotions: false,
          security: true
        }
      },
      trading: {
        defaultLeverage: 1,
        riskLevel: 'moderate',
        paperTrading: false,
        autoStopLoss: true,
        stopLossPercentage: 5
      },
      privacy: {
        profileVisibility: 'public',
        showTrades: false,
        showProfit: false,
        allowMessages: true
      },
      display: {
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        compactView: false
      }
    }
    
    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error: any) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const updates = await request.json()
    
    // Validate settings updates
    if (updates.trading?.stopLossPercentage) {
      const stopLoss = updates.trading.stopLossPercentage
      if (stopLoss < 1 || stopLoss > 50) {
        return NextResponse.json(
          { success: false, error: 'Stop loss must be between 1% and 50%' },
          { status: 400 }
        )
      }
    }
    
    // Mock update (in production, this would update the database)
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      updates
    })
  } catch (error: any) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

