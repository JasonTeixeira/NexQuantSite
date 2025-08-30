import { NextRequest, NextResponse } from "next/server"

// Email notification service - In production, use a service like SendGrid, Mailgun, or AWS SES
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface NotificationRecipient {
  email: string
  name: string
  type: 'admin' | 'guest_author' | 'subscriber'
}

// Mock email service
class EmailNotificationService {
  private static instance: EmailNotificationService
  private emailQueue: any[] = []
  private subscribers: NotificationRecipient[] = [
    {
      email: "admin@nexural.com",
      name: "Nexural Admin",
      type: "admin"
    },
    {
      email: "notifications@nexural.com", 
      name: "Nexural Notifications",
      type: "admin"
    }
  ]

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService()
    }
    return EmailNotificationService.instance
  }

  async sendEmail(
    to: NotificationRecipient[], 
    template: EmailTemplate,
    data: any = {}
  ): Promise<boolean> {
    try {
      // In production, replace with actual email service
      const emailJob = {
        id: Date.now(),
        to,
        template,
        data,
        status: 'queued',
        createdAt: new Date().toISOString(),
        sentAt: null,
        error: null
      }

      this.emailQueue.push(emailJob)
      
      // Simulate email sending delay
      setTimeout(() => {
        emailJob.status = 'sent'
        emailJob.sentAt = new Date().toISOString()
        console.log(`📧 Email sent to ${to.map(r => r.email).join(', ')}: ${template.subject}`)
      }, 1000)

      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  // Get email templates
  getTemplate(type: string, data: any): EmailTemplate {
    const baseStyles = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #0a0a0a; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #00ff66, #0099cc); padding: 20px; border-radius: 8px 8px 0 0; }
        .header h1 { color: #000; margin: 0; font-size: 24px; }
        .content { padding: 20px; background-color: #2a2a2a; color: #fff; }
        .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00ff66, #0099cc); color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #666; background-color: #1a1a1a; border-radius: 0 0 8px 8px; }
        .post-meta { background-color: #333; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .author-badge { display: inline-block; padding: 4px 8px; background-color: #00ff66; color: #000; border-radius: 4px; font-size: 12px; font-weight: bold; }
      </style>
    `

    switch (type) {
      case 'new_post_published':
        return {
          subject: `New Post Published: ${data.postTitle}`,
          html: `
            ${baseStyles}
            <div class="container">
              <div class="header">
                <h1>📚 New Blog Post Published</h1>
              </div>
              <div class="content">
                <h2>${data.postTitle}</h2>
                <div class="post-meta">
                  <p><strong>Author:</strong> <span class="author-badge">${data.authorName}</span></p>
                  <p><strong>Category:</strong> ${data.category}</p>
                  <p><strong>Published:</strong> ${new Date(data.publishedAt).toLocaleDateString()}</p>
                </div>
                <p><strong>Excerpt:</strong></p>
                <p style="font-style: italic; color: #ccc;">${data.excerpt}</p>
                <a href="${data.postUrl}" class="button">Read Full Article</a>
                <div style="margin-top: 20px;">
                  <p><strong>Tags:</strong> ${data.tags?.join(', ') || 'None'}</p>
                </div>
              </div>
              <div class="footer">
                <p>This post was published on <strong>Nexural Trading Blog</strong></p>
                <p><a href="${data.unsubscribeUrl}" style="color: #666;">Unsubscribe</a> | <a href="${data.blogUrl}" style="color: #666;">View All Posts</a></p>
              </div>
            </div>
          `,
          text: `New Blog Post Published: ${data.postTitle}\n\nAuthor: ${data.authorName}\nCategory: ${data.category}\n\n${data.excerpt}\n\nRead more: ${data.postUrl}`
        }

      case 'post_awaiting_approval':
        return {
          subject: `📝 Post Awaiting Approval: ${data.postTitle}`,
          html: `
            ${baseStyles}
            <div class="container">
              <div class="header">
                <h1>📝 Post Awaiting Approval</h1>
              </div>
              <div class="content">
                <p>A new blog post is awaiting your approval:</p>
                <h2>${data.postTitle}</h2>
                <div class="post-meta">
                  <p><strong>Author:</strong> <span class="author-badge">${data.authorName}</span></p>
                  <p><strong>Author Type:</strong> ${data.authorType}</p>
                  <p><strong>Category:</strong> ${data.category}</p>
                  <p><strong>Submitted:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
                  <p><strong>Word Count:</strong> ${data.wordCount} words</p>
                </div>
                <p><strong>Excerpt:</strong></p>
                <p style="font-style: italic; color: #ccc;">${data.excerpt}</p>
                <div style="margin: 20px 0;">
                  <a href="${data.approveUrl}" class="button" style="background: linear-gradient(135deg, #22c55e, #16a34a);">✅ Approve Post</a>
                  <a href="${data.reviewUrl}" class="button" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">👀 Review Post</a>
                  <a href="${data.rejectUrl}" class="button" style="background: linear-gradient(135deg, #ef4444, #dc2626);">❌ Reject Post</a>
                </div>
              </div>
              <div class="footer">
                <p>Manage all posts in the <a href="${data.adminUrl}" style="color: #00ff66;">Admin Dashboard</a></p>
              </div>
            </div>
          `,
          text: `Post Awaiting Approval: ${data.postTitle}\n\nAuthor: ${data.authorName}\nCategory: ${data.category}\n\n${data.excerpt}\n\nReview: ${data.reviewUrl}`
        }

      case 'comment_awaiting_approval':
        return {
          subject: `💬 New Comment Awaiting Approval`,
          html: `
            ${baseStyles}
            <div class="container">
              <div class="header">
                <h1>💬 Comment Awaiting Approval</h1>
              </div>
              <div class="content">
                <p>A new comment is awaiting your approval:</p>
                <div class="post-meta">
                  <p><strong>Post:</strong> ${data.postTitle}</p>
                  <p><strong>Commenter:</strong> ${data.commenterName}</p>
                  <p><strong>Submitted:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
                <div style="background-color: #333; padding: 15px; border-left: 4px solid #00ff66; margin: 15px 0;">
                  <p style="margin: 0;">${data.commentContent}</p>
                </div>
                <div style="margin: 20px 0;">
                  <a href="${data.approveUrl}" class="button" style="background: linear-gradient(135deg, #22c55e, #16a34a);">✅ Approve Comment</a>
                  <a href="${data.rejectUrl}" class="button" style="background: linear-gradient(135deg, #ef4444, #dc2626);">❌ Reject Comment</a>
                </div>
              </div>
              <div class="footer">
                <p>Manage all comments in the <a href="${data.adminUrl}" style="color: #00ff66;">Admin Dashboard</a></p>
              </div>
            </div>
          `,
          text: `New Comment Awaiting Approval\n\nPost: ${data.postTitle}\nCommenter: ${data.commenterName}\n\n${data.commentContent}\n\nReview: ${data.reviewUrl}`
        }

      case 'author_application':
        return {
          subject: `👤 New Guest Author Application`,
          html: `
            ${baseStyles}
            <div class="container">
              <div class="header">
                <h1>👤 New Guest Author Application</h1>
              </div>
              <div class="content">
                <p>A new guest author has applied to join the blog:</p>
                <div class="post-meta">
                  <p><strong>Name:</strong> ${data.authorName}</p>
                  <p><strong>Email:</strong> ${data.authorEmail}</p>
                  <p><strong>Applied:</strong> ${new Date(data.appliedAt).toLocaleDateString()}</p>
                </div>
                <p><strong>Bio:</strong></p>
                <p style="color: #ccc;">${data.bio}</p>
                
                ${data.expertise?.length > 0 ? `
                <p><strong>Expertise:</strong> ${data.expertise.join(', ')}</p>
                ` : ''}
                
                ${data.credentials?.length > 0 ? `
                <p><strong>Credentials:</strong> ${data.credentials.join(', ')}</p>
                ` : ''}
                
                <div style="margin: 20px 0;">
                  <a href="${data.approveUrl}" class="button" style="background: linear-gradient(135deg, #22c55e, #16a34a);">✅ Approve Author</a>
                  <a href="${data.reviewUrl}" class="button" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">👀 Review Application</a>
                  <a href="${data.rejectUrl}" class="button" style="background: linear-gradient(135deg, #ef4444, #dc2626);">❌ Reject Application</a>
                </div>
              </div>
              <div class="footer">
                <p>Manage all authors in the <a href="${data.adminUrl}" style="color: #00ff66;">Admin Dashboard</a></p>
              </div>
            </div>
          `,
          text: `New Guest Author Application\n\nName: ${data.authorName}\nEmail: ${data.authorEmail}\n\n${data.bio}\n\nReview: ${data.reviewUrl}`
        }

      case 'post_approved':
        return {
          subject: `🎉 Your Post Has Been Approved!`,
          html: `
            ${baseStyles}
            <div class="container">
              <div class="header">
                <h1>🎉 Post Approved!</h1>
              </div>
              <div class="content">
                <p>Great news! Your blog post has been approved and published:</p>
                <h2>${data.postTitle}</h2>
                <div class="post-meta">
                  <p><strong>Published:</strong> ${new Date(data.publishedAt).toLocaleDateString()}</p>
                  <p><strong>Category:</strong> ${data.category}</p>
                  <p><strong>Tags:</strong> ${data.tags?.join(', ') || 'None'}</p>
                </div>
                <a href="${data.postUrl}" class="button">View Published Post</a>
                <div style="margin-top: 20px;">
                  <p>🚀 <strong>What's Next?</strong></p>
                  <ul style="color: #ccc;">
                    <li>Share your post on social media</li>
                    <li>Engage with readers in the comments</li>
                    <li>Check your analytics in the author portal</li>
                    <li>Start writing your next post!</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>Access your <a href="${data.authorPortalUrl}" style="color: #00ff66;">Author Portal</a></p>
              </div>
            </div>
          `,
          text: `Your post "${data.postTitle}" has been approved and published!\n\nView it here: ${data.postUrl}\n\nAuthor Portal: ${data.authorPortalUrl}`
        }

      default:
        return {
          subject: 'Nexural Trading Blog Notification',
          html: '<p>You have a new notification from Nexural Trading Blog.</p>',
          text: 'You have a new notification from Nexural Trading Blog.'
        }
    }
  }

  // Add subscriber
  async addSubscriber(email: string, name: string, type: 'admin' | 'guest_author' | 'subscriber' = 'subscriber'): Promise<boolean> {
    const existingSubscriber = this.subscribers.find(s => s.email === email)
    if (!existingSubscriber) {
      this.subscribers.push({ email, name, type })
      return true
    }
    return false
  }

  // Get subscribers by type
  getSubscribers(types: string[] = ['admin', 'subscriber']): NotificationRecipient[] {
    return this.subscribers.filter(s => types.includes(s.type))
  }

  // Get email queue status
  getEmailQueue(): any[] {
    return this.emailQueue
  }
}

const emailService = EmailNotificationService.getInstance()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, recipients } = body

    let targetRecipients: NotificationRecipient[] = []

    // Determine recipients based on notification type
    switch (type) {
      case 'new_post_published':
        targetRecipients = emailService.getSubscribers(['admin', 'subscriber'])
        break
      case 'post_awaiting_approval':
      case 'comment_awaiting_approval':
      case 'author_application':
        targetRecipients = emailService.getSubscribers(['admin'])
        break
      case 'post_approved':
      case 'post_rejected':
        if (data.authorEmail) {
          targetRecipients = [{ email: data.authorEmail, name: data.authorName, type: 'guest_author' }]
        }
        break
      default:
        if (recipients) {
          targetRecipients = recipients
        }
    }

    if (targetRecipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients specified' },
        { status: 400 }
      )
    }

    // Get email template
    const template = emailService.getTemplate(type, {
      ...data,
      postUrl: data.postUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${data.postSlug}`,
      blogUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
      adminUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/blog`,
      authorPortalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/author-portal`,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe`,
      approveUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/blog?action=approve&id=${data.id}`,
      rejectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/blog?action=reject&id=${data.id}`,
      reviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/blog?id=${data.id}`
    })

    // Send email
    const success = await emailService.sendEmail(targetRecipients, template, data)

    return NextResponse.json({
      success,
      message: success ? 'Notification sent successfully' : 'Failed to send notification',
      recipients: targetRecipients.length,
      type
    })
  } catch (error) {
    console.error('Failed to send notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'queue') {
      // Return email queue status
      const queue = emailService.getEmailQueue()
      return NextResponse.json({
        success: true,
        queue: queue.slice(-50), // Last 50 emails
        stats: {
          total: queue.length,
          sent: queue.filter(e => e.status === 'sent').length,
          failed: queue.filter(e => e.status === 'failed').length,
          queued: queue.filter(e => e.status === 'queued').length
        }
      })
    }

    if (action === 'subscribers') {
      // Return subscribers list (admin only)
      const subscribers = emailService.getSubscribers()
      return NextResponse.json({
        success: true,
        subscribers: subscribers.map(s => ({ ...s })), // Remove sensitive data in production
        total: subscribers.length
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error) {
    console.error('Failed to process request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, name, type } = body

    if (action === 'subscribe') {
      const success = await emailService.addSubscriber(email, name, type)
      return NextResponse.json({
        success,
        message: success ? 'Subscribed successfully' : 'Already subscribed'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error) {
    console.error('Failed to process subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}


