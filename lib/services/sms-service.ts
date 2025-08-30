/**
 * SMS Service
 * Unified SMS service supporting multiple providers (Twilio, AWS SNS, etc.)
 * Handles 2FA, notifications, and marketing messages
 */

export interface SMSProvider {
  name: string
  send: (message: SMSMessage) => Promise<SMSResult>
  sendBulk: (messages: SMSMessage[]) => Promise<SMSResult[]>
  validateConfig: () => boolean
  getBalance?: () => Promise<number>
}

export interface SMSMessage {
  to: string
  message: string
  from?: string
  type?: 'transactional' | 'marketing' | 'verification'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  scheduled?: string // ISO timestamp for scheduled sending
  expiryMinutes?: number // For OTP/verification codes
  metadata?: Record<string, any>
}

export interface SMSResult {
  success: boolean
  messageId?: string
  cost?: number
  error?: string
  provider?: string
  timestamp?: string
  deliveryStatus?: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'
}

export interface SMSTemplate {
  id: string
  name: string
  content: string
  type: 'transactional' | 'marketing' | 'verification'
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SMSCampaign {
  id: string
  name: string
  message: string
  recipients: string[]
  scheduledAt?: string
  sentAt?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  stats: {
    sent: number
    delivered: number
    failed: number
    cost: number
  }
}

export interface OTPCode {
  code: string
  phoneNumber: string
  expiresAt: string
  attempts: number
  verified: boolean
  purpose: 'login' | 'signup' | 'password_reset' | 'transaction' | 'withdrawal'
}

// Pre-built SMS templates
export const SMS_TEMPLATES = {
  // 2FA & Verification
  VERIFICATION_CODE: {
    id: 'verification_code',
    name: 'Verification Code',
    content: 'Your Nexural verification code is: {{code}}. Expires in {{minutes}} minutes.',
    type: 'verification' as const,
    variables: ['code', 'minutes']
  },
  LOGIN_2FA: {
    id: 'login_2fa',
    name: 'Login 2FA',
    content: 'Nexural Login Code: {{code}}. Do not share this code with anyone.',
    type: 'verification' as const,
    variables: ['code']
  },
  WITHDRAWAL_CONFIRMATION: {
    id: 'withdrawal_confirmation',
    name: 'Withdrawal Confirmation',
    content: 'Confirm withdrawal of ${{amount}}. Code: {{code}}. Reply STOP to cancel.',
    type: 'transactional' as const,
    variables: ['amount', 'code']
  },

  // Trading Notifications
  TRADE_EXECUTED: {
    id: 'trade_executed',
    name: 'Trade Executed',
    content: 'Trade executed: {{action}} {{symbol}} at ${{price}}. P&L: {{pnl}}',
    type: 'transactional' as const,
    variables: ['action', 'symbol', 'price', 'pnl']
  },
  MARGIN_CALL: {
    id: 'margin_call',
    name: 'Margin Call Alert',
    content: 'URGENT: Margin call alert. Current equity: ${{equity}}. Add funds or close positions.',
    type: 'transactional' as const,
    variables: ['equity']
  },
  STOP_LOSS_HIT: {
    id: 'stop_loss_hit',
    name: 'Stop Loss Hit',
    content: 'Stop loss triggered: {{symbol}} at ${{price}}. Loss: ${{loss}}',
    type: 'transactional' as const,
    variables: ['symbol', 'price', 'loss']
  },

  // Account & Security
  ACCOUNT_LOCKED: {
    id: 'account_locked',
    name: 'Account Locked',
    content: 'Your Nexural account has been temporarily locked due to security concerns. Contact support.',
    type: 'transactional' as const,
    variables: []
  },
  LARGE_DEPOSIT: {
    id: 'large_deposit',
    name: 'Large Deposit Alert',
    content: 'Large deposit detected: ${{amount}} added to your account.',
    type: 'transactional' as const,
    variables: ['amount']
  },
  PASSWORD_CHANGED: {
    id: 'password_changed',
    name: 'Password Changed',
    content: 'Your Nexural password was changed. If this wasn\'t you, contact support immediately.',
    type: 'transactional' as const,
    variables: []
  },

  // Referrals & Commissions
  REFERRAL_JOINED: {
    id: 'referral_joined',
    name: 'Referral Joined',
    content: '{{referralName}} joined through your referral! You earned ${{bonus}}.',
    type: 'transactional' as const,
    variables: ['referralName', 'bonus']
  },
  COMMISSION_EARNED: {
    id: 'commission_earned',
    name: 'Commission Earned',
    content: 'You earned ${{amount}} in referral commissions from {{referralName}}!',
    type: 'transactional' as const,
    variables: ['amount', 'referralName']
  },

  // Marketing
  WELCOME_BONUS: {
    id: 'welcome_bonus',
    name: 'Welcome Bonus',
    content: 'Welcome to Nexural! Your ${{bonus}} welcome bonus is ready. Start trading: {{link}}',
    type: 'marketing' as const,
    variables: ['bonus', 'link']
  },
  PROMOTIONAL: {
    id: 'promotional',
    name: 'Promotional Message',
    content: '{{message}}',
    type: 'marketing' as const,
    variables: ['message']
  }
}

class SMSService {
  private provider: SMSProvider | null = null
  private templates: Map<string, SMSTemplate> = new Map()
  private campaigns: Map<string, SMSCampaign> = new Map()
  private otpCodes: Map<string, OTPCode> = new Map()
  private rateLimiter: Map<string, number[]> = new Map()

  constructor() {
    this.loadTemplates()
  }

  /**
   * Configure SMS provider
   */
  setProvider(provider: SMSProvider): void {
    if (!provider.validateConfig()) {
      throw new Error(`Invalid configuration for ${provider.name}`)
    }
    this.provider = provider
  }

  /**
   * Send single SMS
   */
  async send(message: SMSMessage): Promise<SMSResult> {
    if (!this.provider) {
      throw new Error('No SMS provider configured')
    }

    // Validate phone number
    if (!this.isValidPhoneNumber(message.to)) {
      return {
        success: false,
        error: 'Invalid phone number format',
        timestamp: new Date().toISOString()
      }
    }

    // Check rate limiting
    if (!this.checkRateLimit(message.to)) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        timestamp: new Date().toISOString()
      }
    }

    // Add default values
    message.from = message.from || process.env.DEFAULT_SMS_FROM || 'NEXURAL'
    message.type = message.type || 'transactional'

    try {
      const result = await this.provider.send(message)
      
      // Log SMS for analytics
      await this.logSMS(message, result)
      
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
   * Send bulk SMS
   */
  async sendBulk(messages: SMSMessage[]): Promise<SMSResult[]> {
    if (!this.provider) {
      throw new Error('No SMS provider configured')
    }

    // Filter valid phone numbers
    const validMessages = messages.filter(msg => this.isValidPhoneNumber(msg.to))

    try {
      const results = await this.provider.sendBulk(validMessages)
      
      // Log bulk SMS
      await Promise.all(
        validMessages.map((message, index) => 
          this.logSMS(message, results[index])
        )
      )
      
      return results
    } catch (error) {
      return messages.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }))
    }
  }

  /**
   * Send template-based SMS
   */
  async sendTemplate(
    templateId: string,
    to: string,
    data: Record<string, any>,
    options: Partial<SMSMessage> = {}
  ): Promise<SMSResult> {
    const template = this.templates.get(templateId)
    if (!template || !template.isActive) {
      return {
        success: false,
        error: `Template not found or inactive: ${templateId}`,
        timestamp: new Date().toISOString()
      }
    }

    const message: SMSMessage = {
      to,
      message: this.replaceVariables(template.content, data),
      type: template.type,
      ...options
    }

    return this.send(message)
  }

  /**
   * OTP and 2FA Methods
   */
  async generateOTP(
    phoneNumber: string,
    purpose: OTPCode['purpose'] = 'login',
    expiryMinutes: number = 5
  ): Promise<{ code: string; expiresAt: string }> {
    const code = this.generateRandomCode(6)
    const expiresAt = new Date(Date.now() + expiryMinutes * 60000).toISOString()

    const otpCode: OTPCode = {
      code,
      phoneNumber: this.normalizePhoneNumber(phoneNumber),
      expiresAt,
      attempts: 0,
      verified: false,
      purpose
    }

    this.otpCodes.set(`${phoneNumber}_${purpose}`, otpCode)

    // Send verification SMS
    await this.sendTemplate('verification_code', phoneNumber, {
      code,
      minutes: expiryMinutes
    })

    return { code, expiresAt }
  }

  async verifyOTP(
    phoneNumber: string,
    code: string,
    purpose: OTPCode['purpose'] = 'login'
  ): Promise<{ success: boolean; error?: string }> {
    const key = `${this.normalizePhoneNumber(phoneNumber)}_${purpose}`
    const otpCode = this.otpCodes.get(key)

    if (!otpCode) {
      return { success: false, error: 'No OTP found for this number' }
    }

    if (otpCode.verified) {
      return { success: false, error: 'OTP already verified' }
    }

    if (new Date() > new Date(otpCode.expiresAt)) {
      this.otpCodes.delete(key)
      return { success: false, error: 'OTP expired' }
    }

    otpCode.attempts++

    if (otpCode.attempts > 3) {
      this.otpCodes.delete(key)
      return { success: false, error: 'Too many attempts' }
    }

    if (otpCode.code !== code) {
      return { success: false, error: 'Invalid code' }
    }

    otpCode.verified = true
    this.otpCodes.set(key, otpCode)
    
    return { success: true }
  }

  /**
   * Quick send methods for common SMS types
   */
  async sendVerificationCode(phoneNumber: string, expiryMinutes: number = 5): Promise<SMSResult> {
    const { code } = await this.generateOTP(phoneNumber, 'signup', expiryMinutes)
    return this.sendTemplate('verification_code', phoneNumber, { code, minutes: expiryMinutes })
  }

  async sendLogin2FA(phoneNumber: string): Promise<SMSResult> {
    const { code } = await this.generateOTP(phoneNumber, 'login', 10)
    return this.sendTemplate('login_2fa', phoneNumber, { code })
  }

  async sendTradeAlert(
    phoneNumber: string,
    data: { action: string; symbol: string; price: number; pnl: number }
  ): Promise<SMSResult> {
    return this.sendTemplate('trade_executed', phoneNumber, data)
  }

  async sendMarginCall(phoneNumber: string, equity: number): Promise<SMSResult> {
    return this.sendTemplate('margin_call', phoneNumber, { equity }, { priority: 'urgent' })
  }

  async sendReferralNotification(
    phoneNumber: string,
    data: { referralName: string; bonus: number }
  ): Promise<SMSResult> {
    return this.sendTemplate('referral_joined', phoneNumber, data)
  }

  async sendCommissionAlert(
    phoneNumber: string,
    data: { amount: number; referralName: string }
  ): Promise<SMSResult> {
    return this.sendTemplate('commission_earned', phoneNumber, data)
  }

  /**
   * Campaign management
   */
  async createCampaign(campaign: Omit<SMSCampaign, 'id' | 'stats'>): Promise<string> {
    const id = `sms_campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newCampaign: SMSCampaign = {
      ...campaign,
      id,
      stats: {
        sent: 0,
        delivered: 0,
        failed: 0,
        cost: 0
      }
    }

    this.campaigns.set(id, newCampaign)
    return id
  }

  async sendCampaign(campaignId: string): Promise<SMSResult[]> {
    const campaign = this.campaigns.get(campaignId)
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`)
    }

    campaign.status = 'sending'
    campaign.sentAt = new Date().toISOString()

    const messages = campaign.recipients.map(recipient => ({
      to: recipient,
      message: campaign.message,
      type: 'marketing' as const
    }))

    const results = await this.sendBulk(messages)
    
    // Update campaign stats
    campaign.stats.sent = results.length
    campaign.stats.delivered = results.filter(r => r.success).length
    campaign.stats.failed = results.filter(r => !r.success).length
    campaign.stats.cost = results.reduce((sum, r) => sum + (r.cost || 0), 0)
    campaign.status = results.every(r => r.success) ? 'sent' : 'failed'

    this.campaigns.set(campaignId, campaign)
    return results
  }

  /**
   * Analytics and reporting
   */
  async getSMSStats(dateRange?: { start: string; end: string }): Promise<{
    sent: number
    delivered: number
    failed: number
    cost: number
  }> {
    // Implementation would query actual SMS logs from database
    return {
      sent: 45670,
      delivered: 44230,
      failed: 1440,
      cost: 2283.50
    }
  }

  async getProviderBalance(): Promise<number | null> {
    if (!this.provider?.getBalance) return null
    return this.provider.getBalance()
  }

  /**
   * Private helper methods
   */
  private loadTemplates(): void {
    Object.values(SMS_TEMPLATES).forEach(template => {
      const now = new Date().toISOString()
      this.templates.set(template.id, {
        ...template,
        isActive: true,
        createdAt: now,
        updatedAt: now
      })
    })
  }

  private replaceVariables(content: string, data: Record<string, any>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match
    })
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/
    return e164Regex.test(phoneNumber)
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    return phoneNumber.replace(/[^\d+]/g, '')
  }

  private generateRandomCode(length: number = 6): string {
    const chars = '0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private checkRateLimit(phoneNumber: string): boolean {
    const now = Date.now()
    const timestamps = this.rateLimiter.get(phoneNumber) || []
    
    // Remove timestamps older than 1 hour
    const recentTimestamps = timestamps.filter(ts => now - ts < 3600000)
    
    // Limit to 10 SMS per hour per number
    if (recentTimestamps.length >= 10) {
      return false
    }
    
    recentTimestamps.push(now)
    this.rateLimiter.set(phoneNumber, recentTimestamps)
    return true
  }

  private async logSMS(message: SMSMessage, result: SMSResult): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      to: message.to,
      message: message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
      type: message.type,
      priority: message.priority,
      success: result.success,
      messageId: result.messageId,
      cost: result.cost,
      provider: result.provider,
      error: result.error
    }
    
    console.log('SMS log:', logEntry)
  }
}

// Twilio Provider Implementation
export class TwilioProvider implements SMSProvider {
  name = 'Twilio'
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor(config: { accountSid: string; authToken: string; fromNumber: string }) {
    this.accountSid = config.accountSid
    this.authToken = config.authToken
    this.fromNumber = config.fromNumber
  }

  validateConfig(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber)
  }

  async send(message: SMSMessage): Promise<SMSResult> {
    try {
      console.log('Twilio: Sending SMS', { to: message.to, message: message.message.substring(0, 50) + '...' })
      
      // Implementation would use Twilio SDK
      const messageId = `twilio_${Date.now()}`
      const cost = 0.0075 // $0.0075 per SMS
      
      return {
        success: true,
        messageId,
        cost,
        provider: this.name,
        timestamp: new Date().toISOString(),
        deliveryStatus: 'sent'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Twilio error',
        provider: this.name,
        timestamp: new Date().toISOString()
      }
    }
  }

  async sendBulk(messages: SMSMessage[]): Promise<SMSResult[]> {
    return Promise.all(messages.map(message => this.send(message)))
  }

  async getBalance(): Promise<number> {
    // Implementation would call Twilio Balance API
    return 250.75 // Mock balance
  }
}

// AWS SNS Provider Implementation
export class AWSSNSProvider implements SMSProvider {
  name = 'AWS SNS'
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

  async send(message: SMSMessage): Promise<SMSResult> {
    try {
      console.log('AWS SNS: Sending SMS', { to: message.to, message: message.message.substring(0, 50) + '...' })
      
      const messageId = `sns_${Date.now()}`
      const cost = 0.006 // $0.006 per SMS
      
      return {
        success: true,
        messageId,
        cost,
        provider: this.name,
        timestamp: new Date().toISOString(),
        deliveryStatus: 'sent'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AWS SNS error',
        provider: this.name,
        timestamp: new Date().toISOString()
      }
    }
  }

  async sendBulk(messages: SMSMessage[]): Promise<SMSResult[]> {
    return Promise.all(messages.map(message => this.send(message)))
  }
}

// Export singleton instance
export const smsService = new SMSService()

// Helper functions for easy integration
export const sendSMS = (message: SMSMessage) => smsService.send(message)
export const sendBulkSMS = (messages: SMSMessage[]) => smsService.sendBulk(messages)
export const generateOTP = (phoneNumber: string, purpose?: OTPCode['purpose']) => 
  smsService.generateOTP(phoneNumber, purpose)
export const verifyOTP = (phoneNumber: string, code: string, purpose?: OTPCode['purpose']) => 
  smsService.verifyOTP(phoneNumber, code, purpose)
export const sendTradeAlert = (phoneNumber: string, data: any) => 
  smsService.sendTradeAlert(phoneNumber, data)
export const sendLogin2FA = (phoneNumber: string) => smsService.sendLogin2FA(phoneNumber)


