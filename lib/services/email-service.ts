/**
 * Email Service
 * Unified email service supporting multiple providers (SendGrid, AWS SES, etc.)
 * Handles transactional, marketing, and notification emails
 */

export interface EmailProvider {
  name: string
  send: (email: EmailMessage) => Promise<EmailResult>
  sendBulk: (emails: EmailMessage[]) => Promise<EmailResult[]>
  validateConfig: () => boolean
}

export interface EmailMessage {
  to: string | string[]
  from?: string
  subject: string
  html?: string
  text?: string
  template?: string
  templateData?: Record<string, any>
  attachments?: EmailAttachment[]
  tags?: string[]
  metadata?: Record<string, any>
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category?: string
  unsubscribeLink?: string
  trackingPixel?: boolean
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  type?: string
  disposition?: 'attachment' | 'inline'
  contentId?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  provider?: string
  timestamp?: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  category: 'transactional' | 'marketing' | 'notification'
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  template: string
  recipients: string[]
  scheduledAt?: string
  sentAt?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
}

// Pre-built email templates
export const EMAIL_TEMPLATES = {
  // Authentication
  WELCOME: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Nexural Trading! 🚀',
    category: 'transactional' as const,
    variables: ['firstName', 'referralCode', 'bonusAmount']
  },
  EMAIL_VERIFICATION: {
    id: 'email_verification',
    name: 'Email Verification',
    subject: 'Verify your email address',
    category: 'transactional' as const,
    variables: ['firstName', 'verificationLink', 'expiryTime']
  },
  PASSWORD_RESET: {
    id: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset your password',
    category: 'transactional' as const,
    variables: ['firstName', 'resetLink', 'expiryTime']
  },
  
  // Referrals
  REFERRAL_INVITATION: {
    id: 'referral_invitation',
    name: 'Referral Invitation',
    subject: '{{referrerName}} invited you to join Nexural Trading',
    category: 'marketing' as const,
    variables: ['referrerName', 'referralLink', 'bonusAmount', 'personalMessage']
  },
  REFERRAL_SIGNUP: {
    id: 'referral_signup',
    name: 'Referral Signup Notification',
    subject: 'Great news! {{referralName}} joined through your referral',
    category: 'notification' as const,
    variables: ['referrerName', 'referralName', 'bonusAmount', 'totalReferrals']
  },
  COMMISSION_EARNED: {
    id: 'commission_earned',
    name: 'Commission Earned',
    subject: 'You earned ${{amount}} in referral commissions! 💰',
    category: 'notification' as const,
    variables: ['firstName', 'amount', 'referralName', 'totalEarnings']
  },
  
  // Trading
  TRADE_ALERT: {
    id: 'trade_alert',
    name: 'Trade Alert',
    subject: 'Trade Alert: {{symbol}} - {{action}}',
    category: 'notification' as const,
    variables: ['firstName', 'symbol', 'action', 'price', 'strategy']
  },
  MONTHLY_PERFORMANCE: {
    id: 'monthly_performance',
    name: 'Monthly Performance Report',
    subject: 'Your {{month}} trading performance summary',
    category: 'notification' as const,
    variables: ['firstName', 'month', 'totalPnL', 'winRate', 'bestTrade']
  },
  
  // Subscriptions
  SUBSCRIPTION_CREATED: {
    id: 'subscription_created',
    name: 'Subscription Created',
    subject: 'Your {{planName}} subscription is active!',
    category: 'transactional' as const,
    variables: ['firstName', 'planName', 'amount', 'renewalDate']
  },
  PAYMENT_FAILED: {
    id: 'payment_failed',
    name: 'Payment Failed',
    subject: 'Action required: Payment failed',
    category: 'transactional' as const,
    variables: ['firstName', 'amount', 'planName', 'retryDate']
  },
  
  // Marketing
  NEWSLETTER: {
    id: 'newsletter',
    name: 'Newsletter',
    subject: '{{subject}}',
    category: 'marketing' as const,
    variables: ['firstName', 'subject', 'content', 'unsubscribeLink']
  },
  FEATURE_ANNOUNCEMENT: {
    id: 'feature_announcement',
    name: 'Feature Announcement',
    subject: 'New Feature: {{featureName}}',
    category: 'marketing' as const,
    variables: ['firstName', 'featureName', 'description', 'ctaLink']
  }
}

class EmailService {
  private provider: EmailProvider | null = null
  private templates: Map<string, EmailTemplate> = new Map()
  private campaigns: Map<string, EmailCampaign> = new Map()
  private rateLimiter: Map<string, number> = new Map()

  constructor() {
    this.loadTemplates()
  }

  /**
   * Configure email provider
   */
  setProvider(provider: EmailProvider): void {
    if (!provider.validateConfig()) {
      throw new Error(`Invalid configuration for ${provider.name}`)
    }
    this.provider = provider
  }

  /**
   * Send single email
   */
  async send(email: EmailMessage): Promise<EmailResult> {
    if (!this.provider) {
      throw new Error('No email provider configured')
    }

    // Apply rate limiting
    if (!this.checkRateLimit(email.to.toString())) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        timestamp: new Date().toISOString()
      }
    }

    // Process template if specified
    if (email.template) {
      email = await this.processTemplate(email)
    }

    // Add default values
    email.from = email.from || process.env.DEFAULT_FROM_EMAIL || 'noreply@nexural.com'
    email.trackingPixel = email.trackingPixel !== false

    try {
      const result = await this.provider.send(email)
      
      // Log email for analytics
      await this.logEmail(email, result)
      
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulk(emails: EmailMessage[]): Promise<EmailResult[]> {
    if (!this.provider) {
      throw new Error('No email provider configured')
    }

    // Process templates for all emails
    const processedEmails = await Promise.all(
      emails.map(email => this.processTemplate(email))
    )

    try {
      const results = await this.provider.sendBulk(processedEmails)
      
      // Log bulk emails
      await Promise.all(
        processedEmails.map((email, index) => 
          this.logEmail(email, results[index])
        )
      )
      
      return results
    } catch (error) {
      return emails.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }))
    }
  }

  /**
   * Send template-based email
   */
  async sendTemplate(
    templateId: string,
    to: string | string[],
    data: Record<string, any>,
    options: Partial<EmailMessage> = {}
  ): Promise<EmailResult> {
    const template = this.templates.get(templateId)
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${templateId}`,
        timestamp: new Date().toISOString()
      }
    }

    const email: EmailMessage = {
      to,
      subject: template.subject || 'Email from Trading Platform',
      template: templateId,
      templateData: data,
      category: template.category,
      ...options
    } as EmailMessage

    return this.send(email)
  }

  /**
   * Quick send methods for common email types
   */
  async sendWelcome(to: string, data: { firstName: string, referralCode?: string, bonusAmount?: number }): Promise<EmailResult> {
    return this.sendTemplate('welcome', to, data)
  }

  async sendEmailVerification(to: string, data: { firstName: string, verificationLink: string }): Promise<EmailResult> {
    return this.sendTemplate('email_verification', to, data)
  }

  async sendPasswordReset(to: string, data: { firstName: string, resetLink: string }): Promise<EmailResult> {
    return this.sendTemplate('password_reset', to, data)
  }

  async sendReferralInvitation(
    to: string, 
    data: { referrerName: string, referralLink: string, bonusAmount: number, personalMessage?: string }
  ): Promise<EmailResult> {
    return this.sendTemplate('referral_invitation', to, data)
  }

  async sendCommissionEarned(
    to: string,
    data: { firstName: string, amount: number, referralName: string, totalEarnings: number }
  ): Promise<EmailResult> {
    return this.sendTemplate('commission_earned', to, data)
  }

  async sendTradeAlert(
    to: string,
    data: { firstName: string, symbol: string, action: string, price: number, strategy: string }
  ): Promise<EmailResult> {
    return this.sendTemplate('trade_alert', to, data)
  }

  /**
   * Campaign management
   */
  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'stats'>): Promise<string> {
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newCampaign: EmailCampaign = {
      ...campaign,
      id,
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      }
    }

    this.campaigns.set(id, newCampaign)
    return id
  }

  async sendCampaign(campaignId: string): Promise<EmailResult[]> {
    const campaign = this.campaigns.get(campaignId)
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`)
    }

    campaign.status = 'sending'
    campaign.sentAt = new Date().toISOString()

    const emails = campaign.recipients.map(recipient => ({
      to: recipient,
      subject: campaign.subject,
      template: campaign.template,
      templateData: {},
      category: 'marketing' as const,
      tags: ['campaign', campaignId]
    }))

    const results = await this.sendBulk(emails)
    
    // Update campaign stats
    campaign.stats.sent = results.length
    campaign.stats.delivered = results.filter(r => r.success).length
    campaign.status = results.every(r => r.success) ? 'sent' : 'failed'

    this.campaigns.set(campaignId, campaign)
    return results
  }

  /**
   * Template management
   */
  createTemplate(template: Omit<EmailTemplate, 'createdAt' | 'updatedAt'>): void {
    const now = new Date().toISOString()
    const fullTemplate: EmailTemplate = {
      ...template,
      createdAt: now,
      updatedAt: now
    }
    
    this.templates.set(template.id, fullTemplate)
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id)
  }

  updateTemplate(id: string, updates: Partial<EmailTemplate>): boolean {
    const template = this.templates.get(id)
    if (!template) return false

    const updated = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.templates.set(id, updated)
    return true
  }

  /**
   * Analytics and reporting
   */
  async getEmailStats(dateRange?: { start: string; end: string }): Promise<{
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }> {
    // Implementation would query actual email logs from database
    return {
      sent: 12450,
      delivered: 12234,
      opened: 8901,
      clicked: 3456,
      bounced: 216,
      unsubscribed: 89
    }
  }

  async getCampaignStats(campaignId: string): Promise<EmailCampaign | null> {
    return this.campaigns.get(campaignId) || null
  }

  /**
   * Private helper methods
   */
  private loadTemplates(): void {
    // Load default templates
    Object.values(EMAIL_TEMPLATES).forEach(template => {
      this.createTemplate({
        ...template,
        htmlContent: this.getDefaultHtmlTemplate(template.id),
        textContent: this.getDefaultTextTemplate(template.id),
        isActive: true
      })
    })
  }

  private async processTemplate(email: EmailMessage): Promise<EmailMessage> {
    if (!email.template) return email

    const template = this.templates.get(email.template)
    if (!template) {
      throw new Error(`Template not found: ${email.template}`)
    }

    const data = email.templateData || {}
    
    // Replace variables in subject and content
    email.subject = this.replaceVariables(template.subject, data)
    email.html = this.replaceVariables(template.htmlContent, data)
    email.text = template.textContent ? this.replaceVariables(template.textContent, data) : undefined

    return email
  }

  private replaceVariables(content: string, data: Record<string, any>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match
    })
  }

  private checkRateLimit(recipient: string): boolean {
    const now = Date.now()
    const lastSent = this.rateLimiter.get(recipient) || 0
    const minInterval = 60000 // 1 minute between emails to same recipient
    
    if (now - lastSent < minInterval) {
      return false
    }
    
    this.rateLimiter.set(recipient, now)
    return true
  }

  private async logEmail(email: EmailMessage, result: EmailResult): Promise<void> {
    // Implementation would log to database for analytics
    const logEntry = {
      timestamp: new Date().toISOString(),
      to: Array.isArray(email.to) ? email.to.join(',') : email.to,
      subject: email.subject,
      template: email.template,
      category: email.category,
      success: result.success,
      messageId: result.messageId,
      provider: result.provider,
      error: result.error
    }
    
    console.log('Email log:', logEntry)
  }

  private getDefaultHtmlTemplate(templateId: string): string {
    // Return default HTML templates
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{subject}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: white; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #0891b2; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .highlight { background: #f0f9ff; border-left: 4px solid #0891b2; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NEXURAL</h1>
        </div>
        <div class="content">
          {{content}}
        </div>
        <div class="footer">
          <p>© 2024 Nexural Trading. All rights reserved.</p>
          <p><a href="{{unsubscribeLink}}">Unsubscribe</a> | <a href="https://nexural.com">Visit Website</a></p>
        </div>
      </body>
      </html>
    `

    const templateContent = {
      welcome: `
        <h2>Welcome to Nexural Trading, {{firstName}}! 🚀</h2>
        <p>We're excited to have you join our community of successful traders.</p>
        <div class="highlight">
          <h3>Your Referral Code: {{referralCode}}</h3>
          <p>Share your code and earn up to 50% commissions on referrals!</p>
        </div>
        <a href="https://nexural.com/dashboard" class="button">Start Trading Now</a>
      `,
      email_verification: `
        <h2>Verify Your Email Address</h2>
        <p>Hi {{firstName}},</p>
        <p>Please verify your email address to complete your account setup:</p>
        <a href="{{verificationLink}}" class="button">Verify Email</a>
        <p>This link expires in {{expiryTime}}.</p>
      `,
      password_reset: `
        <h2>Reset Your Password</h2>
        <p>Hi {{firstName}},</p>
        <p>You requested to reset your password. Click the button below:</p>
        <a href="{{resetLink}}" class="button">Reset Password</a>
        <p>This link expires in {{expiryTime}}.</p>
      `
    }

    const content = templateContent[templateId as keyof typeof templateContent] || '{{content}}'
    return baseTemplate.replace('{{content}}', content)
  }

  private getDefaultTextTemplate(templateId: string): string {
    const templates = {
      welcome: `Welcome to Nexural Trading, {{firstName}}!\n\nWe're excited to have you join our community of successful traders.\n\nYour Referral Code: {{referralCode}}\nShare your code and earn up to 50% commissions on referrals!\n\nStart trading: https://nexural.com/dashboard`,
      email_verification: `Hi {{firstName}},\n\nPlease verify your email address: {{verificationLink}}\n\nThis link expires in {{expiryTime}}.`,
      password_reset: `Hi {{firstName}},\n\nReset your password: {{resetLink}}\n\nThis link expires in {{expiryTime}}.`
    }
    
    return templates[templateId as keyof typeof templates] || 'Email content'
  }
}

// SendGrid Provider Implementation
export class SendGridProvider implements EmailProvider {
  name = 'SendGrid'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  validateConfig(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('SG.')
  }

  async send(email: EmailMessage): Promise<EmailResult> {
    try {
      // Implementation would use SendGrid SDK
      console.log('SendGrid: Sending email', { to: email.to, subject: email.subject })
      
      return {
        success: true,
        messageId: `sg_${Date.now()}`,
        provider: this.name,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SendGrid error',
        provider: this.name,
        timestamp: new Date().toISOString()
      }
    }
  }

  async sendBulk(emails: EmailMessage[]): Promise<EmailResult[]> {
    return Promise.all(emails.map(email => this.send(email)))
  }
}

// AWS SES Provider Implementation  
export class AWSESProvider implements EmailProvider {
  name = 'AWS SES'
  private region: string
  private accessKeyId: string
  private secretAccessKey: string

  constructor(config: { region: string; accessKeyId: string; secretAccessKey: string }) {
    this.region = config.region
    this.accessKeyId = config.accessKeyId
    this.secretAccessKey = config.secretAccessKey
  }

  validateConfig(): boolean {
    return !!(this.region && this.accessKeyId && this.secretAccessKey)
  }

  async send(email: EmailMessage): Promise<EmailResult> {
    try {
      console.log('AWS SES: Sending email', { to: email.to, subject: email.subject })
      
      return {
        success: true,
        messageId: `aws_${Date.now()}`,
        provider: this.name,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AWS SES error',
        provider: this.name,
        timestamp: new Date().toISOString()
      }
    }
  }

  async sendBulk(emails: EmailMessage[]): Promise<EmailResult[]> {
    return Promise.all(emails.map(email => this.send(email)))
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Helper functions for easy integration
export const sendEmail = (email: EmailMessage) => emailService.send(email)
export const sendBulkEmails = (emails: EmailMessage[]) => emailService.sendBulk(emails)
export const sendWelcomeEmail = (to: string, data: any) => emailService.sendWelcome(to, data)
export const sendReferralInvitation = (to: string, data: any) => emailService.sendReferralInvitation(to, data)
export const sendCommissionNotification = (to: string, data: any) => emailService.sendCommissionEarned(to, data)
