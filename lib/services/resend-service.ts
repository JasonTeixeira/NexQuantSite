/**
 * RESEND EMAIL SERVICE
 * World-class newsletter system with comprehensive email marketing capabilities
 * Designed for maximum conversions and professional email campaigns
 */

interface SubscriberData {
  email: string
  firstName?: string
  lastName?: string
  source: string // Where they subscribed from
  tags?: string[]
  customFields?: Record<string, any>
  subscribedAt: Date
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained'
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  previewText?: string
  category: 'welcome' | 'newsletter' | 'promotion' | 'update' | 'custom'
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

interface NewsletterCampaign {
  id: string
  name: string
  subject: string
  templateId: string
  audienceSegment: string[]
  scheduledAt?: Date
  sentAt?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    unsubscribed: number
    bounced: number
    complained: number
  }
}

interface EmailMetrics {
  totalSubscribers: number
  activeSubscribers: number
  recentSignups: number
  openRate: number
  clickRate: number
  unsubscribeRate: number
  bounceRate: number
  growthRate: number
}

class ResendNewsletterService {
  private apiKey: string
  private baseUrl = 'https://api.resend.com'
  
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ''
    if (!this.apiKey) {
      console.warn('⚠️ RESEND_API_KEY not found in environment variables')
    }
  }

  /**
   * SUBSCRIBER MANAGEMENT
   */
  async subscribe(subscriberData: Omit<SubscriberData, 'subscribedAt' | 'status'>): Promise<{
    success: boolean
    subscriber?: SubscriberData
    error?: string
  }> {
    try {
      console.log(`📧 Subscribing: ${subscriberData.email} from ${subscriberData.source}`)

      // Create subscriber in Resend
      const response = await fetch(`${this.baseUrl}/audiences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: subscriberData.email,
          first_name: subscriberData.firstName,
          last_name: subscriberData.lastName,
          tags: subscriberData.tags,
          custom_fields: subscriberData.customFields,
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to subscribe: ${response.statusText}`)
      }

      const newSubscriber: SubscriberData = {
        ...subscriberData,
        subscribedAt: new Date(),
        status: 'active'
      }

      // Send welcome email
      await this.sendWelcomeEmail(subscriberData.email, subscriberData.firstName)

      // Track subscription analytics
      await this.trackSubscription(subscriberData.source)

      return {
        success: true,
        subscriber: newSubscriber
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription failed'
      }
    }
  }

  async unsubscribe(email: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📧 Unsubscribing: ${email}`)

      const response = await fetch(`${this.baseUrl}/audiences/unsubscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reason: reason || 'User requested'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to unsubscribe: ${response.statusText}`)
      }

      return { success: true }

    } catch (error) {
      console.error('Newsletter unsubscription error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unsubscription failed'
      }
    }
  }

  /**
   * EMAIL SENDING
   */
  async sendWelcomeEmail(email: string, firstName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const welcomeTemplate = this.getWelcomeEmailTemplate(firstName)
      
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Nexural Trading <noreply@nexural.com>',
          to: email,
          subject: `Welcome to Nexural ${firstName ? firstName : ''}! 🚀`,
          html: welcomeTemplate.html,
          text: welcomeTemplate.text,
          tags: ['welcome', 'onboarding']
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send welcome email: ${response.statusText}`)
      }

      return { success: true }

    } catch (error) {
      console.error('Welcome email error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send welcome email'
      }
    }
  }

  async sendNewsletter(campaign: NewsletterCampaign, subscriberEmails: string[]): Promise<{
    success: boolean
    sentCount: number
    errors: string[]
  }> {
    try {
      console.log(`📧 Sending newsletter: ${campaign.name} to ${subscriberEmails.length} subscribers`)

      const template = await this.getEmailTemplate(campaign.templateId)
      const errors: string[] = []
      let sentCount = 0

      // Send in batches to avoid rate limits
      const batchSize = 50
      for (let i = 0; i < subscriberEmails.length; i += batchSize) {
        const batch = subscriberEmails.slice(i, i + batchSize)
        
        try {
          const response = await fetch(`${this.baseUrl}/emails/batch`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Nexural Trading <newsletter@nexural.com>',
              to: batch,
              subject: campaign.subject,
              html: template.htmlContent,
              text: template.textContent,
              tags: ['newsletter', campaign.id]
            })
          })

          if (response.ok) {
            sentCount += batch.length
          } else {
            errors.push(`Batch ${i / batchSize + 1} failed: ${response.statusText}`)
          }

        } catch (batchError) {
          errors.push(`Batch ${i / batchSize + 1} error: ${batchError}`)
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      return {
        success: errors.length === 0,
        sentCount,
        errors
      }

    } catch (error) {
      console.error('Newsletter sending error:', error)
      return {
        success: false,
        sentCount: 0,
        errors: [error instanceof Error ? error.message : 'Newsletter sending failed']
      }
    }
  }

  /**
   * TEMPLATES
   */
  private getWelcomeEmailTemplate(firstName?: string): { html: string; text: string } {
    const name = firstName ? firstName : 'Trader'
    
    return {
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Nexural Trading</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #000; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 32px; font-weight: bold; color: #06B6D4; margin-bottom: 10px; }
            .subtitle { color: #9CA3AF; font-size: 18px; }
            .content { background: linear-gradient(135deg, #1F2937, #111827); border-radius: 16px; padding: 32px; margin: 32px 0; border: 1px solid #374151; }
            .cta { background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; margin: 24px 0; }
            .features { margin: 32px 0; }
            .feature { margin: 16px 0; padding: 16px; background: rgba(6, 182, 212, 0.1); border-radius: 8px; border-left: 4px solid #06B6D4; }
            .footer { text-align: center; margin-top: 40px; color: #6B7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">NEXURAL</div>
              <div class="subtitle">Advanced Quantitative Trading Platform</div>
            </div>
            
            <div class="content">
              <h1>Welcome to the Future of Trading, ${name}! 🚀</h1>
              <p>You've just joined an exclusive community of quantitative traders using AI-powered strategies to democratize institutional-grade trading.</p>
              
              <div class="features">
                <div class="feature">
                  <h3>🤖 AI Trading Bots</h3>
                  <p>Automated strategies powered by advanced machine learning</p>
                </div>
                <div class="feature">
                  <h3>📊 Real-time Analytics</h3>
                  <p>Professional-grade market analysis and performance tracking</p>
                </div>
                <div class="feature">
                  <h3>🎓 Educational Platform</h3>
                  <p>Learn from institutional-grade strategies and backtesting</p>
                </div>
                <div class="feature">
                  <h3>👥 Trading Community</h3>
                  <p>Connect with other quantitative traders and share insights</p>
                </div>
              </div>
              
              <a href="http://localhost:3045/dashboard" class="cta">Start Trading Now →</a>
            </div>
            
            <div class="footer">
              <p>© 2024 Nexural Trading. All rights reserved.</p>
              <p>New York, NY • London, UK</p>
              <p><a href="http://localhost:3045/terms" style="color: #06B6D4;">Terms</a> | <a href="http://localhost:3045/privacy" style="color: #06B6D4;">Privacy</a> | <a href="mailto:unsubscribe@nexural.com" style="color: #06B6D4;">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Nexural Trading, ${name}!

You've just joined an exclusive community of quantitative traders using AI-powered strategies.

What you get:
• AI Trading Bots - Automated strategies powered by ML
• Real-time Analytics - Professional market analysis  
• Educational Platform - Learn institutional strategies
• Trading Community - Connect with other traders

Get started: http://localhost:3045/dashboard

© 2024 Nexural Trading
Unsubscribe: unsubscribe@nexural.com
      `
    }
  }

  async getEmailTemplate(templateId: string): Promise<EmailTemplate> {
    // Mock template - in production, this would fetch from database
    return {
      id: templateId,
      name: 'Weekly Newsletter',
      subject: 'Your Weekly Trading Insights',
      htmlContent: this.getNewsletterTemplate(),
      textContent: 'Your weekly trading insights and market analysis...',
      category: 'newsletter',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  }

  private getNewsletterTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Trading Insights</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #000; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #1F2937, #111827); border-radius: 12px; }
          .logo { font-size: 28px; font-weight: bold; color: #06B6D4; }
          .content { background: #1F2937; padding: 30px; border-radius: 12px; margin: 20px 0; }
          .metric { background: rgba(6, 182, 212, 0.1); padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #06B6D4; }
          .footer { text-align: center; color: #6B7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NEXURAL WEEKLY</div>
            <p>Your Trading Performance & Market Insights</p>
          </div>
          
          <div class="content">
            <h2>📈 This Week's Highlights</h2>
            <div class="metric">
              <h3>🤖 Bot Performance</h3>
              <p>Your AI trading bots generated +12.4% returns this week, outperforming the market by 8.7%</p>
            </div>
            
            <div class="metric">
              <h3>📊 Market Analysis</h3>
              <p>Key opportunities identified in tech stocks and crypto markets. New strategy recommendations available.</p>
            </div>
            
            <div class="metric">
              <h3>🎓 Educational Content</h3>
              <p>New course: "Advanced Options Strategies" - Learn institutional-grade techniques</p>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2024 Nexural Trading | <a href="#" style="color: #06B6D4;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * ANALYTICS & METRICS
   */
  async getNewsletterMetrics(): Promise<EmailMetrics> {
    try {
      // In production, this would fetch real metrics from Resend API
      const response = await fetch(`${this.baseUrl}/analytics`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }

      // Mock metrics for now
      return {
        totalSubscribers: 12547,
        activeSubscribers: 11923,
        recentSignups: 234,
        openRate: 68.4,
        clickRate: 12.7,
        unsubscribeRate: 1.2,
        bounceRate: 2.1,
        growthRate: 15.3
      }

    } catch (error) {
      console.error('Failed to fetch newsletter metrics:', error)
      // Return mock data on error
      return {
        totalSubscribers: 0,
        activeSubscribers: 0,
        recentSignups: 0,
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0,
        bounceRate: 0,
        growthRate: 0
      }
    }
  }

  private async trackSubscription(source: string): Promise<void> {
    try {
      // Track subscription analytics
      console.log(`📊 Tracking subscription from: ${source}`)
      // In production, send to analytics service
    } catch (error) {
      console.error('Failed to track subscription:', error)
    }
  }

  /**
   * BULK OPERATIONS
   */
  async importSubscribers(subscribers: Array<Omit<SubscriberData, 'subscribedAt' | 'status'>>): Promise<{
    success: boolean
    imported: number
    errors: string[]
  }> {
    const errors: string[] = []
    let imported = 0

    for (const subscriber of subscribers) {
      const result = await this.subscribe(subscriber)
      if (result.success) {
        imported++
      } else {
        errors.push(`${subscriber.email}: ${result.error}`)
      }
    }

    return {
      success: errors.length === 0,
      imported,
      errors
    }
  }

  async exportSubscribers(): Promise<SubscriberData[]> {
    try {
      // In production, fetch from Resend API
      const response = await fetch(`${this.baseUrl}/audiences/export`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to export subscribers')
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to export subscribers:', error)
      return []
    }
  }
}

// Singleton instance
export const resendService = new ResendNewsletterService()

// Export types
export type {
  SubscriberData,
  EmailTemplate,
  NewsletterCampaign,
  EmailMetrics
}


