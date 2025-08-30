// 🎨 PROFESSIONAL EMAIL TEMPLATES
// Matching Nexural.io website design

export const EMAIL_STYLES = {
  // Brand colors from website
  primary: '#0066CC',
  secondary: '#004499', 
  accent: '#1E40AF',
  success: '#10B981',
  warning: '#F59E0B',
  
  // Layout
  maxWidth: '600px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  
  // Gradients matching website
  headerGradient: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
  buttonGradient: 'linear-gradient(135deg, #0066CC 0%, #1E40AF 100%)',
}

// 🎯 EMAIL HEADER COMPONENT
export const EmailHeader = (title: string, subtitle?: string) => `
<div style="
  background: ${EMAIL_STYLES.headerGradient};
  color: white;
  padding: 40px 30px;
  text-align: center;
  border-radius: 12px 12px 0 0;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="white" opacity="0.1"><path d="M0,20 Q250,80 500,20 T1000,20 V100 H0 Z"/></svg>');
">
  <h1 style="
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  ">${title}</h1>
  ${subtitle ? `<p style="margin: 0; font-size: 16px; opacity: 0.9; font-weight: 400;">${subtitle}</p>` : ''}
</div>
`

// 🚀 CTA BUTTON COMPONENT  
export const CTAButton = (text: string, link: string, style: 'primary' | 'secondary' = 'primary') => `
<div style="text-align: center; margin: 30px 0;">
  <a href="${link}" style="
    display: inline-block;
    background: ${style === 'primary' ? EMAIL_STYLES.buttonGradient : EMAIL_STYLES.secondary};
    color: white;
    padding: 16px 32px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
    transition: all 0.3s ease;
  ">${text}</a>
</div>
`

// 📱 EMAIL FOOTER
export const EmailFooter = () => `
<div style="
  background: #f8fafc;
  padding: 30px;
  text-align: center;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e2e8f0;
">
  <div style="margin-bottom: 20px;">
    <img src="https://nexural.io/logo.png" alt="Nexural" style="height: 32px; margin-bottom: 15px;" />
    <h3 style="margin: 0; color: ${EMAIL_STYLES.primary}; font-size: 18px; font-weight: 700;">
      Nexural Trading Platform
    </h3>
    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">
      AI-Powered Trading Solutions
    </p>
  </div>
  
  <div style="margin: 25px 0;">
    <a href="https://nexural.io/dashboard" style="color: ${EMAIL_STYLES.primary}; text-decoration: none; margin: 0 15px; font-weight: 500;">Dashboard</a>
    <a href="https://nexural.io/learning" style="color: ${EMAIL_STYLES.primary}; text-decoration: none; margin: 0 15px; font-weight: 500;">Learning</a>
    <a href="https://nexural.io/community" style="color: ${EMAIL_STYLES.primary}; text-decoration: none; margin: 0 15px; font-weight: 500;">Community</a>
    <a href="https://nexural.io/support" style="color: ${EMAIL_STYLES.primary}; text-decoration: none; margin: 0 15px; font-weight: 500;">Support</a>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 25px;">
    <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
      📧 <a href="mailto:contact@nexural.io" style="color: ${EMAIL_STYLES.primary};">contact@nexural.io</a> | 
      🌐 <a href="https://nexural.io" style="color: ${EMAIL_STYLES.primary};">nexural.io</a><br>
      <a href="https://nexural.io/unsubscribe" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a> | 
      <a href="https://nexural.io/privacy" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a>
    </p>
  </div>
</div>
`

// 🎨 BASE EMAIL WRAPPER
export const EmailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexural Trading Platform</title>
</head>
<body style="
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  font-family: ${EMAIL_STYLES.fontFamily};
  line-height: 1.6;
">
  <div style="
    max-width: ${EMAIL_STYLES.maxWidth};
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  ">
    ${content}
  </div>
</body>
</html>
`

// 📧 1. NEWSLETTER WELCOME EMAIL
export const NewsletterWelcomeTemplate = (name: string) => EmailWrapper(`
  ${EmailHeader('Welcome to Nexural Insights! 📈', 'Your weekly dose of trading intelligence')}
  
  <div style="padding: 40px 30px;">
    <p style="font-size: 18px; color: #1e293b; margin: 0 0 25px 0;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="color: #334155; margin: 0 0 20px 0; font-size: 16px;">
      Welcome to <strong>Nexural Insights</strong> – your exclusive gateway to AI-powered trading intelligence!
    </p>
    
    <div style="
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-left: 4px solid ${EMAIL_STYLES.primary};
      padding: 25px;
      border-radius: 8px;
      margin: 25px 0;
    ">
      <h3 style="margin: 0 0 15px 0; color: ${EMAIL_STYLES.primary}; font-size: 18px;">
        🎯 What you'll receive every week:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 8px;"><strong>Market Analysis</strong> – AI-driven insights on trending assets</li>
        <li style="margin-bottom: 8px;"><strong>Trading Strategies</strong> – Proven techniques from our experts</li>
        <li style="margin-bottom: 8px;"><strong>Platform Updates</strong> – New features and improvements</li>
        <li style="margin-bottom: 8px;"><strong>Exclusive Content</strong> – Member-only educational resources</li>
      </ul>
    </div>
    
    <p style="color: #334155; margin: 20px 0; font-size: 16px;">
      Your first newsletter will arrive this <strong>Friday at 9:00 AM</strong>. 
      Get ready to elevate your trading game!
    </p>
    
    ${CTAButton('Explore Your Dashboard', 'https://nexural.io/dashboard')}
    
    <div style="
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    ">
      <p style="margin: 0; color: #92400e; font-weight: 600;">
        💡 <strong>Pro Tip:</strong> Add contact@nexural.io to your contacts to ensure delivery!
      </p>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
      Questions? Reply to this email or reach out at 
      <a href="mailto:support@nexural.io" style="color: ${EMAIL_STYLES.primary};">support@nexural.io</a>
    </p>
  </div>
  
  ${EmailFooter()}
`)

// 💳 2. SUBSCRIPTION WELCOME EMAIL  
export const SubscriptionWelcomeTemplate = (name: string, planName: string, features: string[]) => EmailWrapper(`
  ${EmailHeader('Welcome to Nexural Pro! 🚀', `You're now on the ${planName} plan`)}
  
  <div style="padding: 40px 30px;">
    <p style="font-size: 18px; color: #1e293b; margin: 0 0 25px 0;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="color: #334155; margin: 0 0 20px 0; font-size: 16px;">
      🎉 <strong>Congratulations!</strong> You've just unlocked the full power of Nexural's AI trading platform.
    </p>
    
    <div style="
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid ${EMAIL_STYLES.success};
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    ">
      <h2 style="margin: 0 0 15px 0; color: ${EMAIL_STYLES.success}; font-size: 24px;">
        🏆 ${planName} Plan Activated
      </h2>
      <p style="margin: 0; color: #166534; font-size: 16px; font-weight: 500;">
        Your trading journey just got supercharged!
      </p>
    </div>
    
    <h3 style="color: ${EMAIL_STYLES.primary}; margin: 30px 0 20px 0;">
      🔥 Your new superpowers include:
    </h3>
    
    <div style="margin: 25px 0;">
      ${features.map(feature => `
        <div style="
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        ">
          <span style="
            background: ${EMAIL_STYLES.success};
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-right: 15px;
          ">✓</span>
          <span style="color: #334155; font-weight: 500;">${feature}</span>
        </div>
      `).join('')}
    </div>
    
    ${CTAButton('Start Trading Now', 'https://nexural.io/dashboard')}
    
    <div style="
      background: #f8fafc;
      border-left: 4px solid ${EMAIL_STYLES.primary};
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    ">
      <h4 style="margin: 0 0 10px 0; color: ${EMAIL_STYLES.primary};">
        🎯 Quick Start Guide:
      </h4>
      <ol style="margin: 0; padding-left: 20px; color: #475569;">
        <li>Complete your profile setup</li>
        <li>Connect your first trading account</li>
        <li>Explore our AI trading signals</li>
        <li>Join our exclusive community</li>
      </ol>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
      Need help getting started? Our support team is ready to assist at 
      <a href="mailto:support@nexural.io" style="color: ${EMAIL_STYLES.primary};">support@nexural.io</a>
    </p>
  </div>
  
  ${EmailFooter()}
`)

// 💰 3. PAYMENT CONFIRMATION EMAIL
export const PaymentConfirmationTemplate = (name: string, amount: string, planName: string, invoiceUrl: string, nextBillingDate: string) => EmailWrapper(`
  ${EmailHeader('Payment Confirmed ✅', 'Your Nexural subscription is active')}
  
  <div style="padding: 40px 30px;">
    <p style="font-size: 18px; color: #1e293b; margin: 0 0 25px 0;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="color: #334155; margin: 0 0 30px 0; font-size: 16px;">
      Thank you! Your payment has been successfully processed.
    </p>
    
    <div style="
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid ${EMAIL_STYLES.success};
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
    ">
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="
          background: ${EMAIL_STYLES.success};
          color: white;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 15px;
        ">✓</div>
        <h2 style="margin: 0; color: ${EMAIL_STYLES.success}; font-size: 24px;">
          Payment Successful
        </h2>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0; color: #166534; font-weight: 600;">Plan:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0; color: #166534; text-align: right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0; color: #166534; font-weight: 600;">Amount:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0; color: #166534; text-align: right; font-size: 18px; font-weight: 700;">${amount}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #166534; font-weight: 600;">Next Billing:</td>
          <td style="padding: 12px 0; color: #166534; text-align: right;">${nextBillingDate}</td>
        </tr>
      </table>
    </div>
    
    ${CTAButton('Download Invoice', invoiceUrl, 'secondary')}
    
    <div style="
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    ">
      <h4 style="margin: 0 0 10px 0; color: #92400e;">
        💡 What's Next?
      </h4>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        Your account has been automatically upgraded. All premium features are now active in your dashboard.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://nexural.io/dashboard" style="
        color: ${EMAIL_STYLES.primary};
        text-decoration: none;
        font-weight: 600;
        margin-right: 20px;
      ">🚀 Go to Dashboard</a>
      <a href="https://nexural.io/billing" style="
        color: ${EMAIL_STYLES.primary};
        text-decoration: none;
        font-weight: 600;
        margin-right: 20px;
      ">💳 Manage Billing</a>
      <a href="mailto:billing@nexural.io" style="
        color: ${EMAIL_STYLES.primary};
        text-decoration: none;
        font-weight: 600;
      ">📧 Billing Support</a>
    </div>
    
    <p style="color: #64748b; font-size: 12px; margin: 30px 0 0 0;">
      This is an automated receipt. For billing questions, contact 
      <a href="mailto:billing@nexural.io" style="color: ${EMAIL_STYLES.primary};">billing@nexural.io</a>
    </p>
  </div>
  
  ${EmailFooter()}
`)

// 📱 4. CONTACT CONFIRMATION EMAIL (Enhanced)
export const ContactConfirmationTemplate = (name: string, subject: string) => EmailWrapper(`
  ${EmailHeader('Message Received ✉️', 'We\'ll respond within 2-4 hours')}
  
  <div style="padding: 40px 30px;">
    <p style="font-size: 18px; color: #1e293b; margin: 0 0 25px 0;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="color: #334155; margin: 0 0 20px 0; font-size: 16px;">
      Thank you for reaching out to Nexural Trading Platform! We've received your message about 
      "<strong>${subject}</strong>" and our team is already on it.
    </p>
    
    <div style="
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-left: 4px solid ${EMAIL_STYLES.primary};
      padding: 25px;
      border-radius: 8px;
      margin: 25px 0;
    ">
      <h3 style="margin: 0 0 15px 0; color: ${EMAIL_STYLES.primary}; font-size: 18px;">
        ⚡ What happens next?
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
        <li><strong>Within 2-4 hours:</strong> We'll review your message</li>
        <li><strong>Same business day:</strong> You'll get a detailed response</li>
        <li><strong>For urgent issues:</strong> Email support@nexural.io directly</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <h4 style="color: ${EMAIL_STYLES.primary}; margin: 0 0 20px 0;">
        While you wait, explore these resources:
      </h4>
      
      <div style="display: flex; justify-content: space-around; margin: 25px 0;">
        <a href="https://nexural.io/learning" style="
          background: ${EMAIL_STYLES.buttonGradient};
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          margin: 0 5px;
        ">📚 Learning Center</a>
        
        <a href="https://nexural.io/community" style="
          background: ${EMAIL_STYLES.success};
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          margin: 0 5px;
        ">💬 Community</a>
        
        <a href="https://nexural.io/help" style="
          background: #6b7280;
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          margin: 0 5px;
        ">❓ Help Center</a>
      </div>
    </div>
    
    <div style="
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    ">
      <p style="margin: 0; color: #92400e; font-weight: 600;">
        🏆 <strong>VIP Support:</strong> Premium members get priority support in under 1 hour!
      </p>
      ${CTAButton('Upgrade to Premium', 'https://nexural.io/pricing', 'secondary')}
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
      This email was sent automatically. Please don't reply to this email. 
      For immediate assistance, contact <a href="mailto:support@nexural.io" style="color: ${EMAIL_STYLES.primary};">support@nexural.io</a>
    </p>
  </div>
  
  ${EmailFooter()}
`)

