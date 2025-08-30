export interface Notification {
  id: string
  userId: string
  type: "info" | "success" | "warning" | "error" | "trading" | "learning" | "system"
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
  expiresAt?: string
  actionUrl?: string
  actionLabel?: string
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  source: "system" | "trading" | "learning" | "billing" | "security"
}

export interface NotificationPreferences {
  userId: string
  email: {
    enabled: boolean
    types: string[]
    frequency: "immediate" | "daily" | "weekly"
  }
  push: {
    enabled: boolean
    types: string[]
  }
  inApp: {
    enabled: boolean
    types: string[]
  }
  sms: {
    enabled: boolean
    types: string[]
    phoneNumber?: string
  }
}

export class NotificationSystem {
  private notifications: Map<string, Notification> = new Map()
  private preferences: Map<string, NotificationPreferences> = new Map()
  private subscribers: Map<string, (notification: Notification) => void> = new Map()

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Mock notifications for demo
    const mockNotifications: Notification[] = [
      {
        id: "notif-001",
        userId: "user-001",
        type: "trading",
        title: "Trade Signal Alert",
        message: "New BUY signal for BTC/USDT with 85% confidence",
        data: { symbol: "BTCUSDT", signal: "BUY", confidence: 85 },
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        priority: "high",
        category: "signals",
        source: "trading",
        actionUrl: "/dashboard/signals",
        actionLabel: "View Signal",
      },
      {
        id: "notif-002",
        userId: "user-001",
        type: "learning",
        title: "Course Progress",
        message: "You've completed 'Advanced Trading Strategies' module",
        data: { courseId: "course-001", moduleId: "module-005" },
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        priority: "medium",
        category: "achievements",
        source: "learning",
        actionUrl: "/learn",
        actionLabel: "Continue Learning",
      },
      {
        id: "notif-003",
        userId: "user-001",
        type: "system",
        title: "System Maintenance",
        message: "Scheduled maintenance tonight from 2-4 AM EST",
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        category: "maintenance",
        source: "system",
      },
    ]

    mockNotifications.forEach((notif) => this.notifications.set(notif.id, notif))

    // Mock preferences
    const mockPreferences: NotificationPreferences = {
      userId: "user-001",
      email: {
        enabled: true,
        types: ["trading", "learning", "system"],
        frequency: "immediate",
      },
      push: {
        enabled: true,
        types: ["trading", "system"],
      },
      inApp: {
        enabled: true,
        types: ["trading", "learning", "system", "billing"],
      },
      sms: {
        enabled: false,
        types: [],
      },
    }

    this.preferences.set("user-001", mockPreferences)
  }

  // Create notification
  createNotification(notification: Omit<Notification, "id" | "createdAt">): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      id,
      createdAt: new Date().toISOString(),
      ...notification,
    }

    this.notifications.set(id, newNotification)

    // Trigger real-time updates
    this.notifySubscribers(newNotification)

    // Send via configured channels
    this.sendNotification(newNotification)

    return id
  }

  // Get notifications for user
  getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      type?: string
      category?: string
    } = {},
  ): { notifications: Notification[]; total: number; unreadCount: number } {
    const userNotifications = Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .filter((n) => !options.unreadOnly || !n.read)
      .filter((n) => !options.type || n.type === options.type)
      .filter((n) => !options.category || n.category === options.category)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = userNotifications.length
    const unreadCount = userNotifications.filter((n) => !n.read).length

    const offset = options.offset || 0
    const limit = options.limit || 50
    const paginatedNotifications = userNotifications.slice(offset, offset + limit)

    return {
      notifications: paginatedNotifications,
      total,
      unreadCount,
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId)
    if (!notification) return false

    notification.read = true
    this.notifications.set(notificationId, notification)
    return true
  }

  // Mark all notifications as read for user
  markAllAsRead(userId: string): number {
    let count = 0
    this.notifications.forEach((notification) => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true
        count++
      }
    })
    return count
  }

  // Delete notification
  deleteNotification(notificationId: string): boolean {
    return this.notifications.delete(notificationId)
  }

  // Get user preferences
  getUserPreferences(userId: string): NotificationPreferences | null {
    return this.preferences.get(userId) || null
  }

  // Update user preferences
  updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): boolean {
    const current = this.preferences.get(userId)
    if (!current) return false

    const updated = { ...current, ...preferences }
    this.preferences.set(userId, updated)
    return true
  }

  // Subscribe to real-time notifications
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    this.subscribers.set(userId, callback)

    return () => {
      this.subscribers.delete(userId)
    }
  }

  // Send notification via configured channels
  private async sendNotification(notification: Notification) {
    const preferences = this.preferences.get(notification.userId)
    if (!preferences) return

    // In-app notification (always sent if enabled)
    if (preferences.inApp.enabled && preferences.inApp.types.includes(notification.type)) {
      // Already handled by storing in notifications map
    }

    // Email notification
    if (preferences.email.enabled && preferences.email.types.includes(notification.type)) {
      await this.sendEmailNotification(notification)
    }

    // Push notification
    if (preferences.push.enabled && preferences.push.types.includes(notification.type)) {
      await this.sendPushNotification(notification)
    }

    // SMS notification
    if (preferences.sms.enabled && preferences.sms.types.includes(notification.type)) {
      await this.sendSMSNotification(notification)
    }
  }

  private async sendEmailNotification(notification: Notification) {
    // Implementation would integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Sending email notification: ${notification.title}`)
  }

  private async sendPushNotification(notification: Notification) {
    // Implementation would integrate with push service (Firebase, OneSignal, etc.)
    console.log(`Sending push notification: ${notification.title}`)
  }

  private async sendSMSNotification(notification: Notification) {
    // Implementation would integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`Sending SMS notification: ${notification.title}`)
  }

  private notifySubscribers(notification: Notification) {
    const callback = this.subscribers.get(notification.userId)
    if (callback) {
      callback(notification)
    }
  }

  // Utility methods
  getNotificationStats(userId: string): {
    total: number
    unread: number
    byType: Record<string, number>
    byPriority: Record<string, number>
  } {
    const userNotifications = Array.from(this.notifications.values()).filter((n) => n.userId === userId)

    const stats = {
      total: userNotifications.length,
      unread: userNotifications.filter((n) => !n.read).length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    }

    userNotifications.forEach((notification) => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
    })

    return stats
  }

  // Clean up expired notifications
  cleanupExpiredNotifications(): number {
    const now = new Date()
    let cleaned = 0

    this.notifications.forEach((notification, id) => {
      if (notification.expiresAt && new Date(notification.expiresAt) < now) {
        this.notifications.delete(id)
        cleaned++
      }
    })

    return cleaned
  }

  // Bulk operations
  createBulkNotification(userIds: string[], notification: Omit<Notification, "id" | "userId" | "createdAt">): string[] {
    const ids: string[] = []

    userIds.forEach((userId) => {
      const id = this.createNotification({ ...notification, userId })
      ids.push(id)
    })

    return ids
  }
}

// Export singleton instance
export const notificationSystem = new NotificationSystem()

// Notification templates for common scenarios
export const NotificationTemplates = {
  tradeSignal: (symbol: string, signal: "BUY" | "SELL", confidence: number) => ({
    type: "trading" as const,
    title: "Trade Signal Alert",
    message: `New ${signal} signal for ${symbol} with ${confidence}% confidence`,
    data: { symbol, signal, confidence },
    priority: "high" as const,
    category: "signals",
    source: "trading" as const,
    actionUrl: "/dashboard/signals",
    actionLabel: "View Signal",
  }),

  courseComplete: (courseName: string, courseId: string) => ({
    type: "learning" as const,
    title: "Course Completed!",
    message: `Congratulations! You've completed "${courseName}"`,
    data: { courseId },
    priority: "medium" as const,
    category: "achievements",
    source: "learning" as const,
    actionUrl: "/learn",
    actionLabel: "Continue Learning",
  }),

  paymentFailed: (amount: number, currency: string) => ({
    type: "error" as const,
    title: "Payment Failed",
    message: `Your payment of ${amount} ${currency} could not be processed`,
    priority: "high" as const,
    category: "billing",
    source: "billing" as const,
    actionUrl: "/billing",
    actionLabel: "Update Payment",
  }),

  securityAlert: (action: string, location: string) => ({
    type: "warning" as const,
    title: "Security Alert",
    message: `${action} detected from ${location}`,
    priority: "urgent" as const,
    category: "security",
    source: "security" as const,
    actionUrl: "/settings/security",
    actionLabel: "Review Activity",
  }),
}
