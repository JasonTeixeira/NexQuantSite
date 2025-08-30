/**
 * 🔐 SECURE EMAIL SERVICE - Production Ready
 * Enterprise-grade email service with multiple providers and security features
 */

import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'

// ===== INTERFACES =====

interface EmailProvider {
  name: string
  type: 'sendgrid' | 'smtp' | 'aws_ses' | 'postmark'
  isConfigured: boolean
  priority: number
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  template?: string
  templateData?: Record<string, any>
  priority?: 'high' | 'normal' | 'low'
  category?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  provider?: string
  error?: string
}

// ===== EMAIL TEMPLATES =====

const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  email_verification: {
    subject: '🔐 Verify Your Nexural Trading Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #00bbff; font-size: 32px; margin: 0;">NEXURAL</h1>
          <p style="color: #888; font-size: 16px; margin: 10px 0 0 0;">AI-Powered Trading Platform</p>
        </div>
        
        <div style="background: #2a2a3e; padding: 30px; border-radius: 8px; border-left: 4px solid #00bbff;">
          <h2 style="color: #ffffff; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #cccccc; line-height: 1.6; margin-bottom: 30px;">
            Welcome to Nexural Trading! Click the button below to verify your email address and activate your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationUrl}}" style="background: linear-gradient(135deg, #00bbff, #0099dd); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours for security. If you didn't create this account, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px;">
            © 2024 Nexural Trading Platform. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      NEXURAL TRADING PLATFORM
      
      Verify Your Email Address
      
      Welcome to Nexural Trading! Please verify your email address by visiting:
      {{verificationUrl}}
      
      This link will expire in 24 hours for security.
      
      If you didn't create this account, please ignore this email.
      
      © 2024 Nexural Trading Platform
    `
  },
  
  password_reset: {
    subject: '🔒 Reset Your Nexural Trading Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #00bbff; font-size: 32px; margin: 0;">NEXURAL</h1>
          <p style="color: #888; font-size: 16px; margin: 10px 0 0 0;">AI-Powered Trading Platform</p>
        </div>
        
        <div style="background: #2a2a3e; padding: 30px; border-radius: 8px; border-left: 4px solid #ff6b35;">
          <h2 style="color: #ffffff; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #cccccc; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: linear-gradient(135deg, #ff6b35, #ff4757); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour for security. If you didn't request this reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px;">
            © 2024 Nexural Trading Platform. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      NEXURAL TRADING PLATFORM
      
      Reset Your Password
      
      We received a request to reset your password. Please visit:
      {{resetUrl}}
      
      This link will expire in 1 hour for security.
      
      If you didn't request this reset, please ignore this email.
      
      © 2024 Nexural Trading Platform
    `
  },
  
  welcome: {
    subject: '🎉 Welcome to Nexural Trading!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #00bbff; font-size: 32px; margin: 0;">NEXURAL</h1>
          <p style="color: #888; font-size: 16px; margin: 10px 0 0 0;">AI-Powered Trading Platform</p>
        </div>
        
        <div style="background: #2a2a3e; padding: 30px; border-radius: 8px; border-left: 4px solid #00ff88;">
          <h2 style="color: #ffffff; margin-top: 0;">Welcome to the Future of Trading! 🚀</h2>
          <p style="color: #cccccc; line-height: 1.6; margin-bottom: 30px;">
            Your account has been successfully verified. You now have access to our AI-powered trading tools, educational resources, and vibrant community.
          </p>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #00bbff; margin-bottom: 15px;">Get Started:</h3>
            <ul style="color: #cccccc; line-height: 1.8; padding-left: 20px;">
              <li>🤖 Deploy your first AI trading bot</li>
              <li>📚 Complete our trading fundamentals course</li>
              <li>💬 Join the community and connect with traders</li>
              <li>📊 Explore the testing engine and backtest strategies</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #00bbff, #0099dd); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Access Your Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px;">
            Need help? Contact us at support@nexural.com
          </p>
        </div>
      </div>
    `,
    text: `
      NEXURAL TRADING PLATFORM
      
      Welcome to the Future of Trading!
      
      Your account has been successfully verified. Get started:
      
      • Deploy your first AI trading bot
      • Complete our trading fundamentals course  
      • Join the community and connect with traders
      • Explore the testing engine and backtest strategies
      
      Access your dashboard: {{dashboardUrl}}
      
      Need help? Contact support@nexural.com
      
      © 2024 Nexural Trading Platform
    `
  }
}

// ===== EMAIL SERVICE CLASS =====

class SecureEmailService {
  private providers: EmailProvider[] = []
  private sendgridTransporter: any = null
  private smtpTransporter: any = null

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders(): void {
    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      this.providers.push({
        name: 'SendGrid',
        type: 'sendgrid',
        isConfigured: true,
        priority: 1
      })
      console.log('✅ SendGrid email service configured')
    }

    // Initialize SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.smtpTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      })

      this.providers.push({
        name: 'SMTP',
        type: 'smtp',
        isConfigured: true,
        priority: 2
      })
      console.log('✅ SMTP email service configured')
    }

    // Fallback warning
    if (this.providers.length === 0) {
      console.warn('⚠️ No email providers configured. Email functionality will be disabled.')
    }
  }

  /**
   * Send email with automatic provider failover
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    if (this.providers.length === 0) {
      return {
        success: false,
        error: 'No email providers configured'
      }
    }

    // Try providers in priority order
    for (const provider of this.providers.sort((a, b) => a.priority - b.priority)) {
      try {
        const result = await this.sendWithProvider(provider, options)
        if (result.success) {
          return result
        }
      } catch (error) {
        console.error(`Email provider ${provider.name} failed:`, error)
        continue
      }
    }

    return {
      success: false,
      error: 'All email providers failed'
    }
  }

  private async sendWithProvider(provider: EmailProvider, options: EmailOptions): Promise<EmailResult> {
    const fromEmail = process.env.FROM_EMAIL || 'noreply@nexural.com'
    const fromName = process.env.FROM_NAME || 'Nexural Trading'

    switch (provider.type) {
      case 'sendgrid':
        return this.sendWithSendGrid(options, fromEmail, fromName)
      case 'smtp':
        return this.sendWithSMTP(options, fromEmail, fromName)
      default:
        throw new Error(`Unsupported provider: ${provider.type}`)
    }
  }

  private async sendWithSendGrid(options: EmailOptions, fromEmail: string, fromName: string): Promise<EmailResult> {
    try {
      const msg = {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from: { email: fromEmail, name: fromName },
        subject: options.subject,
        html: options.html || '',
        text: options.text || '',
        categories: options.category ? [options.category] : ['transactional']
      }

      const [response] = await sgMail.send(msg)
      
      return {
        success: true,
        messageId: response.headers['x-message-id'],
        provider: 'SendGrid'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'SendGrid'
      }
    }
  }

  private async sendWithSMTP(options: EmailOptions, fromEmail: string, fromName: string): Promise<EmailResult> {
    try {
      const result = await this.smtpTransporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        priority: options.priority || 'normal'
      })

      return {
        success: true,
        messageId: result.messageId,
        provider: 'SMTP'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'SMTP'
      }
    }
  }

  /**
   * Send templated email
   */
  async sendTemplate(
    template: keyof typeof EMAIL_TEMPLATES,
    to: string,
    data: Record<string, any> = {}
  ): Promise<EmailResult> {
    const emailTemplate = EMAIL_TEMPLATES[template]
    if (!emailTemplate) {
      return {
        success: false,
        error: `Template '${template}' not found`
      }
    }

    // Replace template variables
    let { subject, html, text } = emailTemplate
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
      html = html.replace(new RegExp(placeholder, 'g'), String(value))
      text = text.replace(new RegExp(placeholder, 'g'), String(value))
    })

    return this.send({
      to,
      subject,
      html,
      text,
      category: template
    })
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string, token: string, userName?: string): Promise<EmailResult> {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
    
    return this.sendTemplate('email_verification', email, {
      userName: userName || email.split('@')[0],
      verificationUrl
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, token: string, userName?: string): Promise<EmailResult> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    
    return this.sendTemplate('password_reset', email, {
      userName: userName || email.split('@')[0],
      resetUrl
    })
  }

  /**
   * Send welcome email
   */
  async sendWelcome(email: string, userName?: string): Promise<EmailResult> {
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`
    
    return this.sendTemplate('welcome', email, {
      userName: userName || email.split('@')[0],
      dashboardUrl
    })
  }

  /**
   * Test email service configuration
   */
  async testConfiguration(): Promise<{
    providers: Array<{
      name: string
      configured: boolean
      tested: boolean
      working: boolean
      error?: string
    }>
  }> {
    const results = []
    
    for (const provider of this.providers) {
      try {
        // Test email send
        const testResult = await this.sendWithProvider(provider, {
          to: process.env.TEST_EMAIL || 'test@example.com',
          subject: 'Test Email - Nexural Trading Platform',
          text: 'This is a test email to verify email service configuration.',
          html: '<p>This is a test email to verify email service configuration.</p>'
        })

        results.push({
          name: provider.name,
          configured: provider.isConfigured,
          tested: true,
          working: testResult.success,
          error: testResult.error
        })
      } catch (error: any) {
        results.push({
          name: provider.name,
          configured: provider.isConfigured,
          tested: true,
          working: false,
          error: error.message
        })
      }
    }

    return { providers: results }
  }
}

// ===== SINGLETON INSTANCE =====

let emailService: SecureEmailService | null = null

export const getEmailService = (): SecureEmailService => {
  if (!emailService) {
    emailService = new SecureEmailService()
  }
  return emailService
}

// ===== EXPORTS =====

export { SecureEmailService, type EmailOptions, type EmailResult }
export default getEmailService
