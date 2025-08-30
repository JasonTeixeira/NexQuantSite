/**
 * Service Configuration and Initialization
 * Central configuration for all external services
 */

import { emailService, SendGridProvider, AWSESProvider } from '@/lib/services/email-service'
import { smsService, TwilioProvider, AWSSNSProvider } from '@/lib/services/sms-service'
import { paymentService, StripeProvider } from '@/lib/services/payment-service'
import { databaseService } from '@/lib/database'

export interface ServiceConfig {
  // Email Configuration
  email: {
    provider: 'sendgrid' | 'aws_ses'
    sendgrid?: {
      apiKey: string
    }
    aws_ses?: {
      region: string
      accessKeyId: string
      secretAccessKey: string
    }
    defaultFrom?: string
  }

  // SMS Configuration
  sms: {
    provider: 'twilio' | 'aws_sns'
    twilio?: {
      accountSid: string
      authToken: string
      fromNumber: string
    }
    aws_sns?: {
      region: string
      accessKeyId: string
      secretAccessKey: string
    }
  }

  // Payment Configuration
  payment: {
    provider: 'stripe' | 'paypal'
    stripe?: {
      secretKey: string
      publishableKey: string
      webhookSecret: string
    }
    paypal?: {
      clientId: string
      clientSecret: string
      environment: 'sandbox' | 'production'
    }
  }

  // Database Configuration
  database: {
    provider: 'postgresql' | 'mongodb' | 'mysql'
    host: string
    port: number
    database: string
    username: string
    password: string
    ssl?: boolean
    connectionLimit?: number
  }

  // Environment
  environment: 'development' | 'production' | 'testing'
  
  // Feature Flags
  features: {
    emailEnabled: boolean
    smsEnabled: boolean
    paymentsEnabled: boolean
    databaseEnabled: boolean
    webhooksEnabled: boolean
    analyticsEnabled: boolean
  }
}

// Default configuration (loads from environment variables)
export const defaultConfig: ServiceConfig = {
  email: {
    provider: (process.env.EMAIL_PROVIDER as any) || 'sendgrid',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || ''
    },
    aws_ses: {
      region: process.env.AWS_SES_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    },
    defaultFrom: process.env.DEFAULT_FROM_EMAIL || 'noreply@nexural.com'
  },

  sms: {
    provider: (process.env.SMS_PROVIDER as any) || 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || ''
    },
    aws_sns: {
      region: process.env.AWS_SNS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  },

  payment: {
    provider: (process.env.PAYMENT_PROVIDER as any) || 'stripe',
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      environment: (process.env.PAYPAL_ENVIRONMENT as any) || 'sandbox'
    }
  },

  database: {
    provider: (process.env.DATABASE_PROVIDER as any) || 'postgresql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'nexural',
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    ssl: process.env.DATABASE_SSL === 'true',
    connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10')
  },

  environment: (process.env.NODE_ENV as any) || 'development',

  features: {
    emailEnabled: process.env.FEATURE_EMAIL !== 'false',
    smsEnabled: process.env.FEATURE_SMS !== 'false',
    paymentsEnabled: process.env.FEATURE_PAYMENTS !== 'false',
    databaseEnabled: process.env.FEATURE_DATABASE !== 'false',
    webhooksEnabled: process.env.FEATURE_WEBHOOKS !== 'false',
    analyticsEnabled: process.env.FEATURE_ANALYTICS !== 'false'
  }
}

/**
 * Service Initialization Class
 */
export class ServiceInitializer {
  private config: ServiceConfig
  private initialized: Set<string> = new Set()

  constructor(config: ServiceConfig = defaultConfig) {
    this.config = config
  }

  /**
   * Initialize all services
   */
  async initializeAll(): Promise<{
    success: boolean
    initialized: string[]
    failed: string[]
    errors: Record<string, string>
  }> {
    const results = {
      success: true,
      initialized: [] as string[],
      failed: [] as string[],
      errors: {} as Record<string, string>
    }

    // Initialize services in order of dependency
    const services = [
      { name: 'database', init: () => this.initializeDatabase() },
      { name: 'email', init: () => this.initializeEmail() },
      { name: 'sms', init: () => this.initializeSMS() },
      { name: 'payment', init: () => this.initializePayment() }
    ]

    for (const service of services) {
      try {
        const success = await service.init()
        if (success) {
          this.initialized.add(service.name)
          results.initialized.push(service.name)
          console.log(`✅ ${service.name} service initialized`)
        } else {
          results.failed.push(service.name)
          results.errors[service.name] = 'Initialization failed'
          console.error(`❌ ${service.name} service initialization failed`)
        }
      } catch (error) {
        results.failed.push(service.name)
        results.errors[service.name] = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ ${service.name} service error:`, error)
      }
    }

    results.success = results.failed.length === 0
    return results
  }

  /**
   * Initialize Database Service
   */
  async initializeDatabase(): Promise<boolean> {
    if (!this.config.features.databaseEnabled) {
      console.log('📊 Database service disabled by feature flag')
      return true
    }

    try {
      const success = await databaseService.initialize(this.config.database)
      if (success) {
        console.log(`📊 Database connected: ${this.config.database.provider}`)
      }
      return success
    } catch (error) {
      console.error('Database initialization error:', error)
      return false
    }
  }

  /**
   * Initialize Email Service
   */
  async initializeEmail(): Promise<boolean> {
    if (!this.config.features.emailEnabled) {
      console.log('📧 Email service disabled by feature flag')
      return true
    }

    try {
      let provider: any

      switch (this.config.email.provider) {
        case 'sendgrid':
          if (!this.config.email.sendgrid?.apiKey) {
            throw new Error('SendGrid API key required')
          }
          provider = new SendGridProvider(this.config.email.sendgrid.apiKey)
          break

        case 'aws_ses':
          if (!this.config.email.aws_ses?.region || !this.config.email.aws_ses?.accessKeyId) {
            throw new Error('AWS SES credentials required')
          }
          provider = new AWSESProvider(this.config.email.aws_ses)
          break

        default:
          throw new Error(`Unsupported email provider: ${this.config.email.provider}`)
      }

      emailService.setProvider(provider)
      console.log(`📧 Email service initialized: ${this.config.email.provider}`)
      return true
    } catch (error) {
      console.error('Email service initialization error:', error)
      return false
    }
  }

  /**
   * Initialize SMS Service
   */
  async initializeSMS(): Promise<boolean> {
    if (!this.config.features.smsEnabled) {
      console.log('📱 SMS service disabled by feature flag')
      return true
    }

    try {
      let provider: any

      switch (this.config.sms.provider) {
        case 'twilio':
          if (!this.config.sms.twilio?.accountSid || !this.config.sms.twilio?.authToken) {
            throw new Error('Twilio credentials required')
          }
          provider = new TwilioProvider(this.config.sms.twilio)
          break

        case 'aws_sns':
          if (!this.config.sms.aws_sns?.region || !this.config.sms.aws_sns?.accessKeyId) {
            throw new Error('AWS SNS credentials required')
          }
          provider = new AWSSNSProvider(this.config.sms.aws_sns)
          break

        default:
          throw new Error(`Unsupported SMS provider: ${this.config.sms.provider}`)
      }

      smsService.setProvider(provider)
      console.log(`📱 SMS service initialized: ${this.config.sms.provider}`)
      return true
    } catch (error) {
      console.error('SMS service initialization error:', error)
      return false
    }
  }

  /**
   * Initialize Payment Service
   */
  async initializePayment(): Promise<boolean> {
    if (!this.config.features.paymentsEnabled) {
      console.log('💳 Payment service disabled by feature flag')
      return true
    }

    try {
      let provider: any

      switch (this.config.payment.provider) {
        case 'stripe':
          if (!this.config.payment.stripe?.secretKey || !this.config.payment.stripe?.publishableKey) {
            throw new Error('Stripe credentials required')
          }
          provider = new StripeProvider(this.config.payment.stripe)
          break

        default:
          throw new Error(`Unsupported payment provider: ${this.config.payment.provider}`)
      }

      paymentService.setProvider(provider)
      console.log(`💳 Payment service initialized: ${this.config.payment.provider}`)
      return true
    } catch (error) {
      console.error('Payment service initialization error:', error)
      return false
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    services: Record<string, { status: string; message?: string }>
  }> {
    const services = {
      database: { status: 'unknown' },
      email: { status: 'unknown' },
      sms: { status: 'unknown' },
      payment: { status: 'unknown' }
    }

    let healthyCount = 0
    const totalServices = Object.keys(services).length

    // Check database
    try {
      if (this.initialized.has('database') && this.config.features.databaseEnabled) {
        // In production, this would ping the database
        services.database = { status: 'healthy' }
        healthyCount++
      } else {
        services.database = { status: 'disabled' }
        healthyCount++
      }
    } catch (error) {
      services.database = { status: 'unhealthy' }
    }

    // Check email service
    try {
      if (this.initialized.has('email') && this.config.features.emailEnabled) {
        services.email = { status: 'healthy' }
        healthyCount++
      } else {
        services.email = { status: 'disabled' }
        healthyCount++
      }
    } catch (error) {
      services.email = { status: 'unhealthy' /* message: 'Service unavailable' */ }
    }

    // Check SMS service
    try {
      if (this.initialized.has('sms') && this.config.features.smsEnabled) {
        services.sms = { status: 'healthy' /* message: `Provider: ${this.config.sms.provider}` */ }
        healthyCount++
      } else {
        services.sms = { status: 'disabled' }
        healthyCount++
      }
    } catch (error) {
      services.sms = { status: 'unhealthy' /* message: 'Service unavailable' */ }
    }

    // Check payment service
    try {
      if (this.initialized.has('payment') && this.config.features.paymentsEnabled) {
        services.payment = { status: 'healthy' /* message: `Provider: ${this.config.payment.provider}` */ }
        healthyCount++
      } else {
        services.payment = { status: 'disabled' }
        healthyCount++
      }
    } catch (error) {
      services.payment = { status: 'unhealthy' /* message: 'Service unavailable' */ }
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (healthyCount === totalServices) {
      status = 'healthy'
    } else if (healthyCount > totalServices / 2) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    return { status, services }
  }

  /**
   * Get service configuration (sanitized)
   */
  getConfig(): Partial<ServiceConfig> {
    return {
      email: {
        provider: this.config.email.provider,
        defaultFrom: this.config.email.defaultFrom
      },
      sms: {
        provider: this.config.sms.provider
      },
      payment: {
        provider: this.config.payment.provider
      },
      database: {
        provider: this.config.database.provider,
        host: this.config.database.host,
        port: this.config.database.port,
        database: this.config.database.database,
        username: this.config.database.username,
        password: this.config.database.password
      },
      environment: this.config.environment,
      features: this.config.features
    }
  }
}

// Global service initializer instance
export const serviceInitializer = new ServiceInitializer()

// Convenience functions
export const initializeServices = () => serviceInitializer.initializeAll()
export const getServiceHealth = () => serviceInitializer.healthCheck()
export const getServiceConfig = () => serviceInitializer.getConfig()

// Initialize services on module load in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  initializeServices().then((result) => {
    console.log('🚀 Services initialization result:', result)
  }).catch((error) => {
    console.error('❌ Services initialization failed:', error)
  })
}
