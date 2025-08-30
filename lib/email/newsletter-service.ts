// 📧 NEWSLETTER EMAIL SERVICE
import { sendEmail } from './resend-service'
import { NewsletterWelcomeTemplate } from './email-templates'

export interface NewsletterSubscriber {
  email: string
  name: string
  source?: string
  interests?: string[]
}

// Newsletter welcome email
export const sendNewsletterWelcome = async (subscriber: NewsletterSubscriber) => {
  return await sendEmail({
    to: subscriber.email,
    subject: 'Welcome to Nexural Insights! 📈 Your Weekly Trading Intelligence',
    html: NewsletterWelcomeTemplate(subscriber.name),
    text: `
Welcome to Nexural Insights!

Hi ${subscriber.name},

Welcome to Nexural Insights – your exclusive gateway to AI-powered trading intelligence!

What you'll receive every week:
- Market Analysis – AI-driven insights on trending assets
- Trading Strategies – Proven techniques from our experts  
- Platform Updates – New features and improvements
- Exclusive Content – Member-only educational resources

Your first newsletter arrives this Friday at 9:00 AM.

Explore your dashboard: https://nexural.io/dashboard

Questions? Reply to contact@nexural.io

Best regards,
The Nexural Trading Team
    `,
    tags: [
      { name: 'type', value: 'newsletter-welcome' },
      { name: 'user', value: subscriber.name },
      { name: 'source', value: subscriber.source || 'website' }
    ]
  })
}

// Weekly newsletter template
export const sendWeeklyNewsletter = async (subscribers: NewsletterSubscriber[], content: {
  subject: string
  headline: string
  marketInsights: string
  tradingTip: string
  platformUpdate?: string
  featuredStrategy?: string
}) => {
  const results = []
  
  for (const subscriber of subscribers) {
    const result = await sendEmail({
      to: subscriber.email,
      subject: `📈 ${content.subject} - Nexural Insights`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0066CC 0%, #004499 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">📈 Nexural Insights</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Weekly AI-Powered Trading Intelligence</p>
          </div>
          
          <!-- Content -->
          <div style="background: white; padding: 40px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 18px; color: #1e293b; margin: 0 0 25px 0;">Hi ${subscriber.name},</p>
            
            <h2 style="color: #0066CC; margin: 0 0 20px 0;">${content.headline}</h2>
            
            <!-- Market Insights -->
            <div style="background: #f0f9ff; border-left: 4px solid #0066CC; padding: 25px; margin: 25px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #0066CC;">🎯 This Week's Market Insights</h3>
              <p style="margin: 0; color: #334155; line-height: 1.6;">${content.marketInsights}</p>
            </div>
            
            <!-- Trading Tip -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 25px; margin: 25px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #92400e;">💡 Pro Trading Tip</h3>
              <p style="margin: 0; color: #92400e; line-height: 1.6;">${content.tradingTip}</p>
            </div>
            
            ${content.platformUpdate ? `
            <!-- Platform Update -->
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 25px; margin: 25px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #059669;">🚀 Platform Update</h3>
              <p style="margin: 0; color: #065f46; line-height: 1.6;">${content.platformUpdate}</p>
            </div>
            ` : ''}
            
            ${content.featuredStrategy ? `
            <!-- Featured Strategy -->
            <div style="background: #fdf4ff; border-left: 4px solid #a855f7; padding: 25px; margin: 25px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #7c3aed;">📊 Featured Strategy</h3>
              <p style="margin: 0; color: #581c87; line-height: 1.6;">${content.featuredStrategy}</p>
            </div>
            ` : ''}
            
            <!-- CTA -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://nexural.io/dashboard" style="background: linear-gradient(135deg, #0066CC 0%, #1E40AF 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View in Dashboard
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
              Happy trading!<br>
              The Nexural Team
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 15px 0; color: #64748b; font-size: 12px;">
              📧 <a href="mailto:contact@nexural.io" style="color: #0066CC;">contact@nexural.io</a> | 
              🌐 <a href="https://nexural.io" style="color: #0066CC;">nexural.io</a>
            </p>
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
              <a href="https://nexural.io/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #94a3b8;">Unsubscribe</a> | 
              <a href="https://nexural.io/privacy" style="color: #94a3b8;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `,
      text: `
NEXURAL INSIGHTS - ${content.subject}

Hi ${subscriber.name},

${content.headline}

THIS WEEK'S MARKET INSIGHTS:
${content.marketInsights}

PRO TRADING TIP:
${content.tradingTip}

${content.platformUpdate ? `PLATFORM UPDATE:\n${content.platformUpdate}\n\n` : ''}
${content.featuredStrategy ? `FEATURED STRATEGY:\n${content.featuredStrategy}\n\n` : ''}

View in dashboard: https://nexural.io/dashboard

Happy trading!
The Nexural Team

Unsubscribe: https://nexural.io/unsubscribe?email=${encodeURIComponent(subscriber.email)}
      `,
      tags: [
        { name: 'type', value: 'newsletter-weekly' },
        { name: 'user', value: subscriber.name }
      ]
    })
    
    results.push(result)
  }
  
  return results
}

