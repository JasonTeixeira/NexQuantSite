/**
 * Real-time Testing Notifications System
 * Handles alerts, notifications, and real-time updates for testing events
 */

import { TestResult, TestType } from '@/lib/testing/comprehensive-test-suite'
import { ScheduledTestResult, TestAlert } from '@/lib/testing/test-scheduler'

export interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'webhook' | 'slack' | 'discord' | 'teams' | 'sms'
  config: Record<string, any>
  enabled: boolean
  filters: NotificationFilter[]
}

export interface NotificationFilter {
  type: 'test_type' | 'severity' | 'score_threshold' | 'environment'
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

export interface TestNotification {
  id: string
  type: 'test_started' | 'test_completed' | 'test_failed' | 'alert_created' | 'system_health'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: string
  data?: Record<string, any>
  channels: string[]
  sent: boolean
  sentAt?: string
  errors?: string[]
}

export interface WebSocketMessage {
  type: 'notification' | 'test_update' | 'system_status' | 'alert'
  payload: any
  timestamp: string
}

export class TestingNotificationManager {
  private channels: Map<string, NotificationChannel> = new Map()
  private notifications: TestNotification[] = []
  private webSocketClients: Set<WebSocket> = new Set()
  private isEnabled = true

  constructor() {
    this.initializeDefaultChannels()
  }

  /**
   * Add notification channel
   */
  addChannel(channel: Omit<NotificationChannel, 'id'>): string {
    const id = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newChannel: NotificationChannel = { id, ...channel }
    
    this.channels.set(id, newChannel)
    console.log(`📢 Added notification channel: ${channel.name} (${channel.type})`)
    
    return id
  }

  /**
   * Update notification channel
   */
  updateChannel(id: string, updates: Partial<NotificationChannel>): boolean {
    const existing = this.channels.get(id)
    if (!existing) return false

    const updated = { ...existing, ...updates }
    this.channels.set(id, updated)
    
    console.log(`📝 Updated notification channel: ${updated.name}`)
    return true
  }

  /**
   * Remove notification channel
   */
  removeChannel(id: string): boolean {
    const existing = this.channels.get(id)
    if (!existing) return false

    this.channels.delete(id)
    console.log(`🗑️  Removed notification channel: ${existing.name}`)
    return true
  }

  /**
   * Send test started notification
   */
  async notifyTestStarted(sessionId: string, testTypes: TestType[], environment?: string): Promise<void> {
    if (!this.isEnabled) return

    const notification: TestNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'test_started',
      severity: 'info',
      title: 'Test Session Started',
      message: `Started testing session with ${testTypes.length} test types: ${testTypes.join(', ')}`,
      timestamp: new Date().toISOString(),
      data: {
        sessionId,
        testTypes,
        environment
      },
      channels: this.getMatchingChannels('test_started', 'info', { testTypes, environment }),
      sent: false
    }

    await this.sendNotification(notification)
    this.broadcastWebSocket({
      type: 'notification',
      payload: notification,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send test completed notification
   */
  async notifyTestCompleted(sessionId: string, result: TestResult | ScheduledTestResult): Promise<void> {
    if (!this.isEnabled) return

    const severity = this.getResultSeverity(result)
    const isScheduledResult = 'scheduledTestId' in result
    
    const notification: TestNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'test_completed',
      severity,
      title: `Test ${isScheduledResult ? 'Schedule' : 'Session'} ${result.status === 'passed' ? 'Completed' : 'Failed'}`,
      message: isScheduledResult 
        ? `Scheduled test completed: ${(result as ScheduledTestResult).testsPassed}/${(result as ScheduledTestResult).testsRun} tests passed (Score: ${(result as ScheduledTestResult).overallScore}/100)`
        : `Test completed: ${result.name} - Status: ${result.status} (Score: ${result.score}/100)`,
      timestamp: new Date().toISOString(),
      data: {
        sessionId,
        result
      },
      channels: this.getMatchingChannels('test_completed', severity, { 
        result: result.status,
        score: isScheduledResult ? (result as ScheduledTestResult).overallScore : result.score
      }),
      sent: false
    }

    await this.sendNotification(notification)
    this.broadcastWebSocket({
      type: 'test_update',
      payload: { sessionId, result },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send alert notification
   */
  async notifyAlert(alert: TestAlert): Promise<void> {
    if (!this.isEnabled) return

    const notification: TestNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'alert_created',
      severity: alert.level === 'info' ? 'info' : alert.level === 'warning' ? 'warning' : 'error',
      title: alert.title,
      message: alert.message,
      timestamp: new Date().toISOString(),
      data: {
        alert
      },
      channels: this.getMatchingChannels('alert_created', alert.level, { alertLevel: alert.level }),
      sent: false
    }

    await this.sendNotification(notification)
    this.broadcastWebSocket({
      type: 'alert',
      payload: alert,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send system health notification
   */
  async notifySystemHealth(metrics: {
    cpuUsage: number
    memoryUsage: number
    responseTime: number
    errorRate: number
    status: string
  }): Promise<void> {
    if (!this.isEnabled) return

    // Only notify if there are issues
    const hasIssues = metrics.cpuUsage > 80 || metrics.memoryUsage > 80 || 
                     metrics.responseTime > 2000 || metrics.errorRate > 5

    if (!hasIssues) return

    const severity: TestNotification['severity'] = 
      metrics.cpuUsage > 95 || metrics.memoryUsage > 95 || metrics.errorRate > 10 ? 'critical' :
      metrics.cpuUsage > 90 || metrics.memoryUsage > 90 || metrics.errorRate > 7 ? 'error' : 'warning'

    const issues = []
    if (metrics.cpuUsage > 80) issues.push(`CPU: ${metrics.cpuUsage.toFixed(1)}%`)
    if (metrics.memoryUsage > 80) issues.push(`Memory: ${metrics.memoryUsage.toFixed(1)}%`)
    if (metrics.responseTime > 2000) issues.push(`Response: ${metrics.responseTime.toFixed(0)}ms`)
    if (metrics.errorRate > 5) issues.push(`Errors: ${metrics.errorRate.toFixed(1)}%`)

    const notification: TestNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'system_health',
      severity,
      title: 'System Health Alert',
      message: `System performance issues detected: ${issues.join(', ')}`,
      timestamp: new Date().toISOString(),
      data: { metrics },
      channels: this.getMatchingChannels('system_health', severity, { metrics }),
      sent: false
    }

    await this.sendNotification(notification)
    this.broadcastWebSocket({
      type: 'system_status',
      payload: metrics,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Register WebSocket client
   */
  registerWebSocketClient(ws: WebSocket): void {
    this.webSocketClients.add(ws)
    console.log(`🔌 WebSocket client connected (${this.webSocketClients.size} total)`)

    ws.on('close', () => {
      this.webSocketClients.delete(ws)
      console.log(`🔌 WebSocket client disconnected (${this.webSocketClients.size} remaining)`)
    })

    // Send current status to new client
    this.sendWebSocketMessage(ws, {
      type: 'system_status',
      payload: { connected: true, timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Get notifications
   */
  getNotifications(limit = 50): TestNotification[] {
    return this.notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  /**
   * Get notification channels
   */
  getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values())
  }

  /**
   * Enable/disable notifications
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    console.log(`📢 Notifications ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Private Methods
   */
  private async sendNotification(notification: TestNotification): Promise<void> {
    this.notifications.unshift(notification)
    
    // Keep only last 1000 notifications
    if (this.notifications.length > 1000) {
      this.notifications = this.notifications.slice(0, 1000)
    }

    const errors: string[] = []

    // Send to each matching channel
    for (const channelId of notification.channels) {
      const channel = this.channels.get(channelId)
      if (!channel || !channel.enabled) continue

      try {
        await this.sendToChannel(channel, notification)
        console.log(`📤 Sent notification to ${channel.name}: ${notification.title}`)
      } catch (error: any) {
        const errorMsg = `Failed to send to ${channel.name}: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    // Update notification status
    notification.sent = errors.length === 0
    notification.sentAt = new Date().toISOString()
    if (errors.length > 0) {
      notification.errors = errors
    }
  }

  private async sendToChannel(channel: NotificationChannel, notification: TestNotification): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmail(channel, notification)
        break
      case 'webhook':
        await this.sendWebhook(channel, notification)
        break
      case 'slack':
        await this.sendSlack(channel, notification)
        break
      case 'discord':
        await this.sendDiscord(channel, notification)
        break
      case 'teams':
        await this.sendTeams(channel, notification)
        break
      case 'sms':
        await this.sendSMS(channel, notification)
        break
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`)
    }
  }

  private async sendEmail(channel: NotificationChannel, notification: TestNotification): Promise<void> {
    // Mock email sending - implement with your email service
    console.log(`📧 [MOCK] Email to ${channel.config.recipients}: ${notification.title}`)
    
    // In production:
    // await emailService.send({
    //   to: channel.config.recipients,
    //   subject: `[${notification.severity.toUpperCase()}] ${notification.title}`,
    //   text: notification.message,
    //   html: this.formatEmailNotification(notification)
    // })
  }

  private async sendWebhook(channel: NotificationChannel, notification: TestNotification): Promise<void> {
    const payload = {
      type: notification.type,
      severity: notification.severity,
      title: notification.title,
      message: notification.message,
      timestamp: notification.timestamp,
      data: notification.data
    }

    // Mock webhook - implement with actual HTTP request
    console.log(`🌐 [MOCK] Webhook to ${channel.config.url}:`, payload)
    
    // In production:
    // const response = await fetch(channel.config.url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     ...(channel.config.headers || {})
    //   },
    //   body: JSON.stringify(payload)
    // })
    // 
    // if (!response.ok) {
    //   throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
    // }
  }

  private async sendSlack(channel: NotificationChannel, notification: TestNotification): Promise<void> {
    const emoji = this.getSeverityEmoji(notification.severity)
    const color = this.getSeverityColor(notification.severity)
    
    const payload = {
      text: `${emoji} ${notification.title}`,
      attachments: [{
        color,
        text: notification.message,
        ts: Math.floor(new Date(notification.timestamp).getTime() / 1000)
      }]
    }

    console.log(`💬 [MOCK] Slack to ${channel.config.webhook}:`, payload)
    
    // In production:
    // await fetch(channel.config.webhook, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // })
  }

  private async sendDiscord(channel: NotificationChannel, notification: TestNotification): Promise<void> {
    const payload = {
      embeds: [{
        title: notification.title,
        description: notification.message,
        color: parseInt(this.getSeverityColor(notification.severity).substring(1), 16),
        timestamp: notification.timestamp
      }]
    }

    console.log(`🎮 [MOCK] Discord to ${channel.config.webhook}:`, payload)
  }

  private async sendTeams(channel: NotificationChannel, notification: TestNotification): Promise<void> {
    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      summary: notification.title,
      themeColor: this.getSeverityColor(notification.severity),
      sections: [{
        activityTitle: notification.title,
        activitySubtitle: notification.message,
        activityImage: "https://nexuraltrading.com/icon.png"
      }]
    }

    console.log(`👔 [MOCK] Teams to ${channel.config.webhook}:`, payload)
  }

  private async sendSMS(channel: NotificationChannel, notification: TestNotification): Promise<void> {
    const message = `[${notification.severity.toUpperCase()}] ${notification.title}: ${notification.message}`
    
    console.log(`📱 [MOCK] SMS to ${channel.config.phoneNumbers}: ${message}`)
    
    // In production, use SMS service like Twilio
  }

  private broadcastWebSocket(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message)
    
    for (const client of this.webSocketClients) {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr)
        }
      } catch (error: any) {
        console.error('Failed to send WebSocket message:', error.message)
        this.webSocketClients.delete(client)
      }
    }
  }

  private sendWebSocketMessage(client: WebSocket, message: WebSocketMessage): void {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    } catch (error: any) {
      console.error('Failed to send WebSocket message to client:', error.message)
    }
  }

  private getMatchingChannels(type: string, severity: string, context: Record<string, any>): string[] {
    const matching: string[] = []

    for (const [id, channel] of this.channels) {
      if (!channel.enabled) continue

      // Check filters
      let matches = true
      for (const filter of channel.filters) {
        if (!this.filterMatches(filter, { type, severity, ...context })) {
          matches = false
          break
        }
      }

      if (matches) {
        matching.push(id)
      }
    }

    return matching
  }

  private filterMatches(filter: NotificationFilter, context: Record<string, any>): boolean {
    const contextValue = context[filter.type]
    
    switch (filter.operator) {
      case 'equals':
        return contextValue === filter.value
      case 'contains':
        return Array.isArray(contextValue) 
          ? contextValue.includes(filter.value)
          : String(contextValue).includes(String(filter.value))
      case 'greater_than':
        return Number(contextValue) > Number(filter.value)
      case 'less_than':
        return Number(contextValue) < Number(filter.value)
      default:
        return true
    }
  }

  private getResultSeverity(result: TestResult | ScheduledTestResult): TestNotification['severity'] {
    if ('overallScore' in result) {
      // Scheduled test result
      const score = result.overallScore
      if (result.status === 'failed') return 'error'
      if (result.status === 'partial') return 'warning'
      if (score < 70) return 'warning'
      return 'info'
    } else {
      // Individual test result
      if (result.status === 'failed') return 'error'
      if (result.score < 70) return 'warning'
      return 'info'
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#ff0000'
      case 'error': return '#ff4444'
      case 'warning': return '#ffaa00'
      case 'info': return '#0088ff'
      default: return '#888888'
    }
  }

  private initializeDefaultChannels(): void {
    // Admin Email Channel
    this.addChannel({
      name: 'Admin Email',
      type: 'email',
      enabled: true,
      config: {
        recipients: ['admin@nexuraltrading.com']
      },
      filters: [
        { type: 'severity', operator: 'contains', value: ['error', 'critical'] }
      ]
    })

    // System Health Webhook
    this.addChannel({
      name: 'System Health Webhook',
      type: 'webhook',
      enabled: true,
      config: {
        url: 'https://api.nexuraltrading.com/webhooks/health',
        headers: {
          'Authorization': 'Bearer webhook_token_here'
        }
      },
      filters: [
        { type: 'type', operator: 'equals', value: 'system_health' }
      ]
    })

    console.log('📋 Initialized default notification channels')
  }
}

// Global notification manager instance
export const testingNotificationManager = new TestingNotificationManager()
