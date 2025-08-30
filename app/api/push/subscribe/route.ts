import { NextResponse } from 'next/server'

/**
 * Push Notification Subscription Endpoint
 * Handles user subscription to push notifications
 */

interface PushSubscriptionData {
  subscription: PushSubscription
  userAgent?: string
  timestamp?: number
  userId?: string
}

// In-memory storage for demo (use database in production)
const subscriptions = new Map<string, PushSubscriptionData>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subscription, userAgent, timestamp, userId } = body as PushSubscriptionData
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }
    
    // Generate unique subscription ID
    const subscriptionId = Buffer.from(subscription.endpoint).toString('base64').slice(0, 16)
    
    // Store subscription data
    subscriptions.set(subscriptionId, {
      subscription,
      userAgent: userAgent || 'Unknown',
      timestamp: timestamp || Date.now(),
      userId: userId || 'anonymous'
    })
    
    console.log(`✅ Push: New subscription registered (ID: ${subscriptionId})`)
    
    // In production, store in database
    // await db.pushSubscriptions.create({
    //   id: subscriptionId,
    //   endpoint: subscription.endpoint,
    //   keys: subscription.keys,
    //   userAgent,
    //   userId,
    //   createdAt: new Date()
    // })
    
    return NextResponse.json({
      success: true,
      subscriptionId,
      message: 'Subscription registered successfully'
    })
    
  } catch (error) {
    console.error('❌ Push: Subscription failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to register subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return subscription statistics
  const stats = {
    totalSubscriptions: subscriptions.size,
    subscriptionsByUserAgent: {},
    recentSubscriptions: Array.from(subscriptions.values())
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 10)
      .map(sub => ({
        userAgent: sub.userAgent,
        timestamp: sub.timestamp,
        userId: sub.userId
      }))
  }
  
  // Count by user agent
  Array.from(subscriptions.values()).forEach(sub => {
    const ua = sub.userAgent || 'Unknown'
    const key = ua.includes('Chrome') ? 'Chrome' :
               ua.includes('Firefox') ? 'Firefox' :
               ua.includes('Safari') ? 'Safari' :
               ua.includes('Edge') ? 'Edge' : 'Other'
    
    stats.subscriptionsByUserAgent[key] = (stats.subscriptionsByUserAgent[key] || 0) + 1
  })
  
  return NextResponse.json(stats)
}


