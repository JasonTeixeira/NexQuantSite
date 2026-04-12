// 📧 RESEND EMAIL SERVICE
import { Resend } from 'resend'

// NEVER hardcode API keys!
const RESEND_API_KEY = process.env.RESEND_API_KEY
if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required')
}

const resend = new Resend(RESEND_API_KEY)

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@send.nexural.io',
  replyTo: process.env.EMAIL_REPLY_TO || 'contact@nexural.io',
  businessEmail: process.env.BUSINESS_EMAIL || 'contact@nexural.io',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@nexural.io',
  defaultName: 'Nexural Trading Platform'
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
  }>
  tags?: Array<{
    name: string
    value: string
  }>
}

// Send email function
export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || `${EMAIL_CONFIG.defaultName} <${EMAIL_CONFIG.from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo || EMAIL_CONFIG.replyTo,
      attachments: options.attachments,
      tags: options.tags
    })

    if (error) {
      console.error('❌ Resend error:', error)
      return { success: false, error }
    }

    console.log('✅ Email sent successfully:', data?.id)
    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Email send error:', error)
    return { success: false, error: error.message }
  }
}

// Email templates
export const EmailTemplates = {
  // Welcome email
  welcome: (userName: string, verificationUrl: string) => ({
    subject: 'Welcome to Nexural Trading Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066CC;">Welcome to Nexural Trading, ${userName}!</h1>
        <p>Thank you for joining our AI-powered trading platform.</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #0066CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link: ${verificationUrl}</p>
        <p>Best regards,<br>The Nexural Trading Team</p>
      </div>
    `,
    text: `Welcome to Nexural Trading, ${userName}!\n\nPlease verify your email: ${verificationUrl}\n\nBest regards,\nThe Nexural Trading Team`
  }),

  // Password reset
  passwordReset: (resetUrl: string) => ({
    subject: 'Reset Your Password - Nexural Trading',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066CC;">Password Reset Request</h1>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0066CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Best regards,<br>The Nexural Trading Team</p>
      </div>
    `,
    text: `Password Reset Request\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nBest regards,\nThe Nexural Trading Team`
  }),

  // Payment success
  paymentSuccess: (amount: number, planName: string) => ({
    subject: 'Payment Successful - Nexural Trading',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066CC;">Payment Successful!</h1>
        <p>Your payment of <strong>$${amount}</strong> for the <strong>${planName}</strong> plan has been processed successfully.</p>
        <p>Thank you for your subscription!</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Status:</strong> Active</p>
        </div>
        <p>You can manage your subscription in your account settings.</p>
        <p>Best regards,<br>The Nexural Trading Team</p>
      </div>
    `,
    text: `Payment Successful!\n\nAmount: $${amount}\nPlan: ${planName}\n\nThank you for your subscription!\n\nBest regards,\nThe Nexural Trading Team`
  }),

  // Trading signal alert
  tradingSignal: (signal: any) => ({
    subject: `🚨 Trading Signal: ${signal.pair} - ${signal.action}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${signal.action === 'BUY' ? '#00CC00' : '#CC0000'};">
          ${signal.action} Signal: ${signal.pair}
        </h1>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <p><strong>Pair:</strong> ${signal.pair}</p>
          <p><strong>Action:</strong> ${signal.action}</p>
          <p><strong>Price:</strong> ${signal.price}</p>
          <p><strong>Stop Loss:</strong> ${signal.stopLoss}</p>
          <p><strong>Take Profit:</strong> ${signal.takeProfit}</p>
          <p><strong>Confidence:</strong> ${signal.confidence}%</p>
        </div>
        <p style="color: #666; font-size: 12px;">
          This is an automated signal. Always do your own research before trading.
        </p>
      </div>
    `,
    text: `${signal.action} Signal: ${signal.pair}\n\nPrice: ${signal.price}\nStop Loss: ${signal.stopLoss}\nTake Profit: ${signal.takeProfit}\nConfidence: ${signal.confidence}%`
  })
}

// Batch email sending
export async function sendBatchEmails(emails: EmailOptions[]) {
  const results = []
  
  for (const email of emails) {
    const result = await sendEmail(email)
    results.push(result)
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

// Test email function
export async function sendTestEmail(to: string) {
  return sendEmail({
    to,
    subject: 'Test Email - Nexural Trading Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066CC;">Test Email Successful!</h1>
        <p>If you're receiving this, your email integration is working correctly.</p>
        <p>✅ Resend API: Connected</p>
        <p>✅ Environment: ${process.env.NODE_ENV}</p>
        <p>✅ Time: ${new Date().toISOString()}</p>
      </div>
    `,
    text: 'Test email successful! Your Resend integration is working.'
  })
}
