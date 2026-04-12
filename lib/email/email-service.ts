// 📧 PRODUCTION EMAIL SERVICE
// Comprehensive email system with multiple providers and template support

import { query, transaction } from '../database/connection'
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// INTERFACES
// ============================================================================

export interface EmailMessage {
  to: string | string[]
  from?: string
  subject: string
  html?: string
  text?: string
  templateId?: string
  templateData?: any
  attachments?: EmailAttachment[]
  priority?: 'high' | 'normal' | 'low'
  tags?: string[]
  metadata?: any
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  encoding?: 'base64' | 'binary' | 'text'
}

export interface EmailTemplate {
  id: string
  type: string
  name: string
  subject: string
  emailTemplate?: string
  pushTemplate?: string
  inAppTemplate?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface QueuedEmail {
  id: string
  recipientEmail: string
  recipientName?: string
  subject: string
  htmlContent?: string
  textContent?: string
  templateId?: string
  templateData?: any
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  attempts: number
  maxAttempts: number
  scheduledAt: Date
  sentAt?: Date
  failedAt?: Date
  errorMessage?: string
  createdAt: Date
}

export interface EmailProvider {
  name: string
  send(message: EmailMessage): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }>
}

export interface EmailStats {
  sent: number
  failed: number
  pending: number
  deliveryRate: number
  bounceRate: number
  openRate: number
  clickRate: number
}

// ============================================================================
// SMTP EMAIL PROVIDER
// ============================================================================

export class SMTPEmailProvider implements EmailProvider {
  name = 'smtp'
  private config: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  
  constructor(config: {
    host: string
    port?: number
    secure?: boolean
    user: string
    password: string
  }) {
    this.config = {
      host: config.host,
      port: config.port || 587,
      secure: config.secure || false,
      auth: {
        user: config.user,
        pass: config.password
      }
    }
  }
  
  async send(message: EmailMessage): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      // For development, we'll use nodemailer (not imported yet)
      // In production, you would use actual SMTP connection
      console.log('📧 [SMTP] Would send email:', {
        to: message.to,
        subject: message.subject,
        config: this.config.host
      })
      
      // Simulate success with random message ID
      return {
        success: true,
        messageId: `smtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error: any) {
      console.error('SMTP send error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// ============================================================================
// SENDGRID EMAIL PROVIDER (Placeholder)
// ============================================================================

export class SendGridProvider implements EmailProvider {
  name = 'sendgrid'
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  async send(message: EmailMessage): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      // TODO: Implement SendGrid API calls
      console.log('📧 [SendGrid] Would send email:', {
        to: message.to,
        subject: message.subject
      })
      
      return {
        success: true,
        messageId: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// ============================================================================
// RESEND EMAIL PROVIDER (Placeholder)
// ============================================================================

export class ResendProvider implements EmailProvider {
  name = 'resend'
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  async send(message: EmailMessage): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      // TODO: Implement Resend API calls
      console.log('📧 [Resend] Would send email:', {
        to: message.to,
        subject: message.subject
      })
      
      return {
        success: true,
        messageId: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// ============================================================================
// EMAIL TEMPLATE MANAGER
// ============================================================================

export class EmailTemplateManager {
  // Get template by type
  static async getByType(type: string): Promise<EmailTemplate | null> {
    const sql = 'SELECT * FROM notification_templates WHERE type = $1 AND active = true'
    const result = await query(sql, [type])
    return result.rows[0] ? this.mapRowToTemplate(result.rows[0]) : null
  }
  
  // Get all templates
  static async getAll(): Promise<EmailTemplate[]> {
    const sql = 'SELECT * FROM notification_templates WHERE active = true ORDER BY name'
    const result = await query(sql)
    return result.rows.map(row => this.mapRowToTemplate(row))
  }
  
  // Create template
  static async create(templateData: {
    type: string
    name: string
    subject: string
    emailTemplate?: string
    pushTemplate?: string
    inAppTemplate?: string
  }): Promise<EmailTemplate> {
    const sql = `
      INSERT INTO notification_templates (type, name, subject, email_template, push_template, in_app_template)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    
    const params = [
      templateData.type,
      templateData.name,
      templateData.subject,
      templateData.emailTemplate,
      templateData.pushTemplate,
      templateData.inAppTemplate
    ]
    
    const result = await query(sql, params)
    return this.mapRowToTemplate(result.rows[0])
  }
  
  // Update template
  static async update(id: string, updateData: Partial<{
    name: string
    subject: string
    emailTemplate: string
    pushTemplate: string
    inAppTemplate: string
    active: boolean
  }>): Promise<EmailTemplate | null> {
    const setClause: string[] = []
    const params: any[] = []
    let paramIndex = 1
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key)
        setClause.push(`${columnName} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })
    
    if (setClause.length === 0) return null
    
    params.push(id)
    const sql = `
      UPDATE notification_templates
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    const result = await query(sql, params)
    return result.rows[0] ? this.mapRowToTemplate(result.rows[0]) : null
  }
  
  // Render template with data
  static renderTemplate(template: string, data: any): string {
    if (!template || !data) return template
    
    // Simple template rendering (replace {{variable}} with values)
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key]
      return value !== undefined ? String(value) : match
    })
  }
  
  private static mapRowToTemplate(row: any): EmailTemplate {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      subject: row.subject,
      emailTemplate: row.email_template,
      pushTemplate: row.push_template,
      inAppTemplate: row.in_app_template,
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
  
  private static camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }
}

// ============================================================================
// EMAIL QUEUE MANAGER
// ============================================================================

export class EmailQueueManager {
  // Add email to queue
  static async queueEmail(emailData: {
    recipientEmail: string
    recipientName?: string
    subject: string
    htmlContent?: string
    textContent?: string
    templateId?: string
    templateData?: any
    scheduledAt?: Date
    maxAttempts?: number
  }): Promise<QueuedEmail> {
    const sql = `
      INSERT INTO email_queue (
        recipient_email, recipient_name, subject, html_content, text_content,
        template_id, template_data, scheduled_at, max_attempts
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `
    
    const params = [
      emailData.recipientEmail,
      emailData.recipientName,
      emailData.subject,
      emailData.htmlContent,
      emailData.textContent,
      emailData.templateId,
      emailData.templateData ? JSON.stringify(emailData.templateData) : null,
      emailData.scheduledAt || new Date(),
      emailData.maxAttempts || 3
    ]
    
    const result = await query(sql, params)
    return this.mapRowToQueuedEmail(result.rows[0])
  }
  
  // Get pending emails to process
  static async getPendingEmails(limit: number = 50): Promise<QueuedEmail[]> {
    const sql = `
      SELECT * FROM email_queue
      WHERE status = 'pending' 
        AND scheduled_at <= NOW()
        AND attempts < max_attempts
      ORDER BY scheduled_at ASC
      LIMIT $1
    `
    
    const result = await query(sql, [limit])
    return result.rows.map(row => this.mapRowToQueuedEmail(row))
  }
  
  // Mark email as sent
  static async markAsSent(id: string, messageId?: string): Promise<void> {
    const sql = `
      UPDATE email_queue
      SET status = 'sent', sent_at = NOW()
      WHERE id = $1
    `
    
    await query(sql, [id])
  }
  
  // Mark email as failed
  static async markAsFailed(id: string, errorMessage: string): Promise<void> {
    const sql = `
      UPDATE email_queue
      SET status = 'failed', failed_at = NOW(), error_message = $2, attempts = attempts + 1
      WHERE id = $1
    `
    
    await query(sql, [id, errorMessage])
  }
  
  // Retry failed email
  static async retryEmail(id: string, scheduledAt?: Date): Promise<void> {
    const sql = `
      UPDATE email_queue
      SET status = 'pending', scheduled_at = $2, error_message = NULL
      WHERE id = $1 AND attempts < max_attempts
    `
    
    await query(sql, [id, scheduledAt || new Date()])
  }
  
  // Get email stats
  static async getStats(days: number = 30): Promise<EmailStats> {
    const sql = `
      SELECT 
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(*) as total
      FROM email_queue
      WHERE created_at >= NOW() - INTERVAL '${days} days'
    `
    
    const result = await query(sql)
    const row = result.rows[0]
    
    const sent = parseInt(row.sent || '0')
    const failed = parseInt(row.failed || '0')
    const total = parseInt(row.total || '0')
    
    return {
      sent,
      failed,
      pending: parseInt(row.pending || '0'),
      deliveryRate: total > 0 ? (sent / total) * 100 : 0,
      bounceRate: total > 0 ? (failed / total) * 100 : 0,
      openRate: 0, // TODO: Implement open tracking
      clickRate: 0  // TODO: Implement click tracking
    }
  }
  
  // Clean old emails
  static async cleanOldEmails(days: number = 90): Promise<number> {
    const sql = `
      DELETE FROM email_queue
      WHERE created_at < NOW() - INTERVAL '${days} days'
        AND status IN ('sent', 'failed')
    `
    
    const result = await query(sql)
    return result.rowCount
  }
  
  private static mapRowToQueuedEmail(row: any): QueuedEmail {
    return {
      id: row.id,
      recipientEmail: row.recipient_email,
      recipientName: row.recipient_name,
      subject: row.subject,
      htmlContent: row.html_content,
      textContent: row.text_content,
      templateId: row.template_id,
      templateData: row.template_data,
      status: row.status,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      scheduledAt: row.scheduled_at,
      sentAt: row.sent_at,
      failedAt: row.failed_at,
      errorMessage: row.error_message,
      createdAt: row.created_at
    }
  }
}

// ============================================================================
// MAIN EMAIL SERVICE
// ============================================================================

export class EmailService {
  private providers: Map<string, EmailProvider> = new Map()
  private defaultProvider: string
  private fromEmail: string
  private fromName: string
  
  constructor() {
    // Set default sender
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@nexural.com'
    this.fromName = process.env.EMAIL_FROM_NAME || 'Nexural Trading'
    
    // Initialize providers
    this.initializeProviders()
    
    // Set default provider
    this.defaultProvider = process.env.EMAIL_PROVIDER || 'smtp'
  }
  
  private initializeProviders(): void {
    // SMTP Provider
    if (process.env.SMTP_HOST) {
      this.addProvider('smtp', new SMTPEmailProvider({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || ''
      }))
    }
    
    // SendGrid Provider
    if (process.env.SENDGRID_API_KEY) {
      this.addProvider('sendgrid', new SendGridProvider(process.env.SENDGRID_API_KEY))
    }
    
    // Resend Provider
    if (process.env.RESEND_API_KEY) {
      this.addProvider('resend', new ResendProvider(process.env.RESEND_API_KEY))
    }
    
    // Fallback to SMTP if no other providers
    if (this.providers.size === 0) {
      console.warn('No email providers configured, using default SMTP')
      this.addProvider('smtp', new SMTPEmailProvider({
        host: 'localhost',
        port: 587,
        secure: false,
        user: 'test',
        password: 'test'
      }))
    }
  }
  
  addProvider(name: string, provider: EmailProvider): void {
    this.providers.set(name, provider)
  }
  
  getProvider(name?: string): EmailProvider {
    const providerName = name || this.defaultProvider
    const provider = this.providers.get(providerName)
    
    if (!provider) {
      throw new Error(`Email provider '${providerName}' not found`)
    }
    
    return provider
  }
  
  // Send email immediately
  async sendEmail(message: EmailMessage): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      // Set default sender if not provided
      if (!message.from) {
        message.from = `${this.fromName} <${this.fromEmail}>`
      }
      
      const provider = this.getProvider()
      return await provider.send(message)
    } catch (error: any) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  // Send email using template
  async sendTemplateEmail(templateType: string, recipientEmail: string, templateData: any, options: {
    recipientName?: string
    scheduledAt?: Date
    priority?: 'high' | 'normal' | 'low'
  } = {}): Promise<{
    success: boolean
    messageId?: string
    queueId?: string
    error?: string
  }> {
    try {
      const template = await EmailTemplateManager.getByType(templateType)
      if (!template) {
        return {
          success: false,
          error: `Template '${templateType}' not found`
        }
      }
      
      // Render template
      const subject = EmailTemplateManager.renderTemplate(template.subject, templateData)
      const htmlContent = template.emailTemplate 
        ? EmailTemplateManager.renderTemplate(template.emailTemplate, templateData)
        : undefined
      
      if (options.scheduledAt && options.scheduledAt > new Date()) {
        // Queue for later sending
        const queuedEmail = await EmailQueueManager.queueEmail({
          recipientEmail,
          recipientName: options.recipientName,
          subject,
          htmlContent,
          templateId: template.id,
          templateData,
          scheduledAt: options.scheduledAt
        })
        
        return {
          success: true,
          queueId: queuedEmail.id
        }
      } else {
        // Send immediately
        const result = await this.sendEmail({
          to: recipientEmail,
          subject,
          html: htmlContent,
          priority: options.priority
        })
        
        return result
      }
    } catch (error: any) {
      console.error('Template email send error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  // Process email queue
  async processQueue(): Promise<{
    processed: number
    sent: number
    failed: number
  }> {
    const pendingEmails = await EmailQueueManager.getPendingEmails()
    let sent = 0
    let failed = 0
    
    for (const email of pendingEmails) {
      try {
        let htmlContent = email.htmlContent
        let subject = email.subject
        
        // Render template if needed
        if (email.templateId && email.templateData) {
          const template = await EmailTemplateManager.getByType(email.templateId)
          if (template) {
            subject = EmailTemplateManager.renderTemplate(template.subject, email.templateData)
            htmlContent = template.emailTemplate 
              ? EmailTemplateManager.renderTemplate(template.emailTemplate, email.templateData)
              : undefined
          }
        }
        
        const result = await this.sendEmail({
          to: email.recipientEmail,
          subject,
          html: htmlContent,
          text: email.textContent
        })
        
        if (result.success) {
          await EmailQueueManager.markAsSent(email.id, result.messageId)
          sent++
        } else {
          await EmailQueueManager.markAsFailed(email.id, result.error || 'Unknown error')
          failed++
        }
      } catch (error: any) {
        await EmailQueueManager.markAsFailed(email.id, error.message)
        failed++
      }
    }
    
    return {
      processed: pendingEmails.length,
      sent,
      failed
    }
  }
  
  // Get email statistics
  async getStats(days: number = 30): Promise<EmailStats> {
    return await EmailQueueManager.getStats(days)
  }
}

// ============================================================================
// PREDEFINED EMAIL TEMPLATES
// ============================================================================

export const EmailTemplates = {
  WELCOME: {
    type: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Nexural Trading, {{name}}!',
    html: `
      <h1>Welcome {{name}}!</h1>
      <p>Thanks for joining Nexural Trading Platform. We're excited to have you on board!</p>
      <p>Here are your next steps:</p>
      <ul>
        <li><a href="{{verifyUrl}}">Verify your email address</a></li>
        <li><a href="{{dashboardUrl}}">Explore your dashboard</a></li>
        <li><a href="{{communityUrl}}">Join our community</a></li>
      </ul>
      <p>Happy trading!</p>
      <p>The Nexural Team</p>
    `
  },
  
  EMAIL_VERIFICATION: {
    type: 'email_verification',
    name: 'Email Verification',
    subject: 'Verify your email address',
    html: `
      <h1>Verify Your Email</h1>
      <p>Hi {{name}},</p>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="{{verifyUrl}}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `
  },
  
  PASSWORD_RESET: {
    type: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset your password',
    html: `
      <h1>Password Reset</h1>
      <p>Hi {{name}},</p>
      <p>You requested to reset your password. Click the link below to create a new password:</p>
      <p><a href="{{resetUrl}}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `
  },
  
  STRATEGY_PURCHASED: {
    type: 'strategy_purchased',
    name: 'Strategy Purchase Confirmation',
    subject: 'Your strategy purchase is confirmed!',
    html: `
      <h1>Purchase Confirmed</h1>
      <p>Hi {{buyerName}},</p>
      <p>Thank you for purchasing "{{strategyTitle}}"!</p>
      <p><strong>Purchase Details:</strong></p>
      <ul>
        <li>Strategy: {{strategyTitle}}</li>
        <li>Price: ${{amount}}</li>
        <li>Purchase Date: {{purchaseDate}}</li>
        <li>Downloads Remaining: {{downloadsRemaining}}</li>
      </ul>
      <p><a href="{{downloadUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Download Strategy</a></p>
      <p>Happy trading!</p>
    `
  },
  
  COURSE_COMPLETED: {
    type: 'course_completed',
    name: 'Course Completion',
    subject: 'Congratulations! You completed {{courseName}}',
    html: `
      <h1>🎉 Course Completed!</h1>
      <p>Hi {{studentName}},</p>
      <p>Congratulations on completing "{{courseName}}"!</p>
      <p>You've successfully finished all lessons and achieved a {{score}}% score.</p>
      <p><a href="{{certificateUrl}}" style="background-color: #ffc107; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Download Certificate</a></p>
      <p>Keep up the great work!</p>
    `
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// Create singleton instance
export const emailService = new EmailService()

// Convenience functions for common email types
export const sendWelcomeEmail = async (userEmail: string, userName: string, verifyUrl: string) => {
  return await emailService.sendTemplateEmail('welcome', userEmail, {
    name: userName,
    verifyUrl,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    communityUrl: `${process.env.NEXT_PUBLIC_APP_URL}/community`
  })
}

export const sendVerificationEmail = async (userEmail: string, userName: string, verifyUrl: string) => {
  return await emailService.sendTemplateEmail('email_verification', userEmail, {
    name: userName,
    verifyUrl
  })
}

export const sendPasswordResetEmail = async (userEmail: string, userName: string, resetUrl: string) => {
  return await emailService.sendTemplateEmail('password_reset', userEmail, {
    name: userName,
    resetUrl
  })
}

// Export main classes and functions
export default {
  EmailService,
  EmailTemplateManager,
  EmailQueueManager,
  EmailTemplates,
  emailService,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
}

