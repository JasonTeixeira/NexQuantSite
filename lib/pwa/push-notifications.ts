// 📢 PUSH NOTIFICATIONS SERVICE - PWA Push Notifications
// Comprehensive push notification system for mobile and desktop

import { emailService } from '@/lib/email/email-service'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PushSubscription {
  id: string
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent: string
  createdAt: Date
  active: boolean
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

export interface NotificationTemplate {
  type: string
  title: string
  body: string
  icon?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
  }>
}

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

export const NotificationTemplates: Record<string, NotificationTemplate> = {
  trade_alert: {
    type: 'trade_alert',
    title: '📈 Trade Alert',
    body: 'A trading opportunity has been detected',
    icon: '/icons/trade-alert.png',
    data: { url: '/dashboard' },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  },
  
  community_mention: {
    type: 'community_mention',
    title: '💬 You were mentioned',
    body: 'Someone mentioned you in a community post',
    icon: '/icons/community-mention.png',
    data: { url: '/community' },
    actions: [
      { action: 'view', title: 'View Post' },
      { action: 'reply', title: 'Reply' }
    ]
  },
  
  strategy_update: {
    type: 'strategy_update',
    title: '🚀 Strategy Update',
    body: 'One of your strategies has new performance data',
    icon: '/icons/strategy-update.png',
    data: { url: '/marketplace' },
    actions: [
      { action: 'view', title: 'View Strategy' }
    ]
  },
  
  course_reminder: {
    type: 'course_reminder',
    title: '🎓 Course Reminder',
    body: "Don't forget to continue your learning journey",
    icon: '/icons/course-reminder.png',
    data: { url: '/learning' },
    actions: [
      { action: 'continue', title: 'Continue Learning' },
      { action: 'later', title: 'Remind Later' }
    ]
  },
  
  market_news: {
    type: 'market_news',
    title: '📰 Market News',
    body: 'Important market developments that may affect your trades',
    icon: '/icons/market-news.png',
    data: { url: '/dashboard' },
    actions: [
      { action: 'read', title: 'Read More' }
    ]
  },
  
  price_alert: {
    type: 'price_alert',
    title: '💰 Price Alert',
    body: 'A symbol you are watching has reached your target price',
    icon: '/icons/price-alert.png',
    data: { url: '/dashboard' },
    actions: [
      { action: 'trade', title: 'Trade Now' },
      { action: 'view', title: 'View Chart' }
    ]
  }
}

// ============================================================================
// PUSH NOTIFICATION SERVICE
// ============================================================================

export class PushNotificationService {
  private static vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'YOUR_VAPID_PRIVATE_KEY'
  }

  // Register service worker and get push permission
  static async requestPermission(): Promise<{
    granted: boolean
    subscription?: PushSubscriptionJSON
    error?: string
  }> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        return { granted: false, error: 'Service Worker not supported' }
      }

      // Check if Push API is supported
      if (!('PushManager' in window)) {
        return { granted: false, error: 'Push messaging not supported' }
      }

      // Request notification permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        return { granted: false, error: 'Notification permission denied' }
      }

      // Get existing service worker registration (don't register a new one)
      let registration = await navigator.serviceWorker.getRegistration()
      
      if (!registration) {
        // If no existing registration, wait for the main one to be ready
        registration = await navigator.serviceWorker.ready
      }
      
      // Ensure service worker is ready
      await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKeys.publicKey)
      })

      console.log('✅ Push subscription created:', subscription)

      return {
        granted: true,
        subscription: subscription.toJSON()
      }

    } catch (error: any) {
      console.error('❌ Push notification permission error:', error)
      return { 
        granted: false, 
        error: error.message || 'Failed to request permission'
      }
    }
  }

  // Send push notification to user
  static async sendNotification(
    userId: string,
    template: keyof typeof NotificationTemplates,
    customData?: Partial<NotificationPayload>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const notificationTemplate = NotificationTemplates[template]
      if (!notificationTemplate) {
        return { success: false, error: `Template '${template}' not found` }
      }

      // Get user's push subscriptions from database
      const subscriptions = await this.getUserSubscriptions(userId)
      
      if (subscriptions.length === 0) {
        return { success: false, error: 'No active subscriptions found' }
      }

      // Prepare notification payload
      const payload: NotificationPayload = {
        ...notificationTemplate,
        ...customData,
        data: {
          ...notificationTemplate.data,
          ...customData?.data,
          timestamp: Date.now(),
          userId
        }
      }

      // Send to all user's subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendToSubscription(sub, payload))
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      console.log(`📱 Push notifications sent: ${successful} success, ${failed} failed`)

      return { 
        success: successful > 0,
        error: failed > 0 ? `${failed} notifications failed to send` : undefined
      }

    } catch (error: any) {
      console.error('❌ Send notification error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to send notification'
      }
    }
  }

  // Send bulk notifications
  static async sendBulkNotification(
    userIds: string[],
    template: keyof typeof NotificationTemplates,
    customData?: Partial<NotificationPayload>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0
    let failed = 0

    // Process in batches to avoid overwhelming the system
    const batchSize = 100
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize)
      
      const results = await Promise.allSettled(
        batch.map(userId => this.sendNotification(userId, template, customData))
      )

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          sent++
        } else {
          failed++
        }
      })
    }

    return { sent, failed }
  }

  // Save push subscription to database
  static async saveSubscription(
    userId: string,
    subscription: PushSubscriptionJSON
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real app, save to database
      // For now, store in localStorage as demo
      const subscriptions = JSON.parse(
        localStorage.getItem('push-subscriptions') || '[]'
      )

      const newSubscription = {
        id: crypto.randomUUID(),
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString(),
        active: true
      }

      subscriptions.push(newSubscription)
      localStorage.setItem('push-subscriptions', JSON.stringify(subscriptions))

      console.log('💾 Push subscription saved:', newSubscription.id)

      return { success: true }
    } catch (error: any) {
      console.error('❌ Save subscription error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to save subscription'
      }
    }
  }

  // Get user's subscriptions
  private static async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      // In a real app, fetch from database
      // For now, get from localStorage as demo
      const subscriptions = JSON.parse(
        localStorage.getItem('push-subscriptions') || '[]'
      )

      return subscriptions.filter((sub: any) => 
        sub.userId === userId && sub.active
      )
    } catch (error) {
      console.error('Error getting user subscriptions:', error)
      return []
    }
  }

  // Send notification to specific subscription
  private static async sendToSubscription(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      // In a real app, use web-push library to send to the subscription endpoint
      // For demo purposes, we'll simulate the notification
      console.log('📱 Sending push notification:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        payload: payload.title
      })

      // Simulate sending (in production, use actual push service)
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.endpoint,
          payload
        })
      })

      if (!response.ok) {
        throw new Error(`Push send failed: ${response.statusText}`)
      }

    } catch (error) {
      console.error('❌ Send to subscription error:', error)
      throw error
    }
  }

  // Utility to convert VAPID key
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Schedule notification for later
  static async scheduleNotification(
    userId: string,
    template: keyof typeof NotificationTemplates,
    scheduledFor: Date,
    customData?: Partial<NotificationPayload>
  ): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
    try {
      const scheduleId = crypto.randomUUID()
      
      // In a real app, save to database with cron job
      // For demo, use setTimeout (won't persist across page refreshes)
      const delay = scheduledFor.getTime() - Date.now()
      
      if (delay <= 0) {
        return this.sendNotification(userId, template, customData)
      }

      setTimeout(() => {
        this.sendNotification(userId, template, customData)
      }, delay)

      console.log(`⏰ Notification scheduled for ${scheduledFor.toISOString()}`)

      return { success: true, scheduleId }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to schedule notification'
      }
    }
  }

  // Test notification
  static async sendTestNotification(userId: string): Promise<void> {
    await this.sendNotification(userId, 'market_news', {
      title: '🧪 Test Notification',
      body: 'This is a test notification from Nexural Trading!',
      data: { test: true }
    })
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// Initialize push notifications
export const initializePushNotifications = async (userId: string) => {
  try {
    const result = await PushNotificationService.requestPermission()
    
    if (result.granted && result.subscription) {
      await PushNotificationService.saveSubscription(userId, result.subscription)
      console.log('✅ Push notifications initialized')
      return true
    } else {
      console.log('❌ Push notifications not granted:', result.error)
      return false
    }
  } catch (error) {
    console.error('Push notification initialization error:', error)
    return false
  }
}

// Send common notification types
export const sendTradeAlert = (userId: string, symbol: string, message: string) => {
  return PushNotificationService.sendNotification(userId, 'trade_alert', {
    title: `📈 ${symbol} Trade Alert`,
    body: message,
    data: { symbol, type: 'trade_alert' }
  })
}

export const sendCommunityMention = (userId: string, mentionedBy: string, postTitle: string) => {
  return PushNotificationService.sendNotification(userId, 'community_mention', {
    body: `${mentionedBy} mentioned you in "${postTitle}"`,
    data: { mentionedBy, postTitle }
  })
}

export const sendPriceAlert = (userId: string, symbol: string, price: number, targetPrice: number) => {
  return PushNotificationService.sendNotification(userId, 'price_alert', {
    title: `💰 ${symbol} Price Alert`,
    body: `${symbol} has reached $${price} (target: $${targetPrice})`,
    data: { symbol, price, targetPrice }
  })
}

export default PushNotificationService

