import { NextResponse } from 'next/server'

/**
 * Push Notification Unsubscribe Endpoint
 * Handles user unsubscription from push notifications
 */

interface UnsubscribeRequest {
  subscription: PushSubscription
  userId?: string
}

// In-memory storage (use database in production)
const subscriptions = new Map<string, any>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subscription, userId } = body as UnsubscribeRequest
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }
    
    // Generate subscription ID from endpoint
    const subscriptionId = Buffer.from(subscription.endpoint).toString('base64').slice(0, 16)
    
    // Remove from storage
    const existed = subscriptions.has(subscriptionId)
    subscriptions.delete(subscriptionId)
    
    console.log(`${existed ? '✅' : '⚠️'} Push: Unsubscription processed (ID: ${subscriptionId})`)
    
    // In production, remove from database
    // await db.pushSubscriptions.delete({
    //   where: { id: subscriptionId }
    // })
    
    return NextResponse.json({
      success: true,
      subscriptionId,
      existed,
      message: existed 
        ? 'Subscription removed successfully'
        : 'Subscription was not found (may have already been removed)'
    })
    
  } catch (error) {
    console.error('❌ Push: Unsubscribe failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process unsubscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get unsubscription statistics
export async function GET() {
  // In production, this would query database for analytics
  return NextResponse.json({
    message: 'Unsubscribe endpoint ready',
    activeSubscriptions: subscriptions.size,
    endpoint: '/api/push/unsubscribe',
    method: 'POST'
  })
}


