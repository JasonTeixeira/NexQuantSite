/**
 * 🔐 SECURE ENVIRONMENT CONFIGURATION
 * Enterprise-grade environment variable validation with security enforcement
 */

// ===== REQUIRED ENVIRONMENT VARIABLES =====

interface RequiredEnvVars {
  // Authentication & Security
  JWT_SECRET: string
  CSRF_SECRET: string
  ENCRYPTION_KEY: string
  SESSION_SECRET: string
  
  // Database
  DATABASE_URL: string
  POSTGRES_PASSWORD: string
  
  // Redis
  REDIS_URL?: string
  REDIS_PASSWORD?: string
  
  // Email Service
  SENDGRID_API_KEY?: string
  SMTP_HOST?: string
  SMTP_USER?: string
  SMTP_PASS?: string
  
  // Payment Processing
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  
  // External APIs
  ALPACA_API_KEY?: string
  ALPACA_SECRET_KEY?: string
  POLYGON_API_KEY?: string
  
  // Application
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  NODE_ENV: string
}

interface OptionalEnvVars {
  // Development/Testing
  ENABLE_DEBUG_LOGGING?: string
  MOCK_EXTERNAL_APIS?: string
  
  // Performance
  DATABASE_POOL_SIZE?: string
  REDIS_POOL_SIZE?: string
  
  // Monitoring
  SENTRY_DSN?: string
  DATADOG_API_KEY?: string
}

// ===== VALIDATION FUNCTIONS =====

class EnvironmentValidator {
  private static requiredVars: (keyof RequiredEnvVars)[] = [
    'JWT_SECRET',
    'CSRF_SECRET', 
    'ENCRYPTION_KEY',
    'SESSION_SECRET',
    'DATABASE_URL',
    'POSTGRES_PASSWORD',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NODE_ENV'
  ]

  /**
   * Validate all required environment variables
   */
  static validateEnvironment(): {
    valid: boolean
    missing: string[]
    weak: string[]
    errors: string[]
  } {
    const missing: string[] = []
    const weak: string[] = []
    const errors: string[] = []

    // Check required variables
    for (const varName of this.requiredVars) {
      const value = process.env[varName]
      
      if (!value) {
        missing.push(varName)
      } else {
        // Validate security-critical variables
        const validation = this.validateSecurityVar(varName, value)
        if (!validation.valid) {
          weak.push(varName)
          errors.push(`${varName}: ${validation.error}`)
        }
      }
    }

    // Production-specific requirements
    if (process.env.NODE_ENV === 'production') {
      const productionVars = ['STRIPE_SECRET_KEY', 'SENDGRID_API_KEY', 'ALPACA_API_KEY']
      
      for (const varName of productionVars) {
        if (!process.env[varName]) {
          errors.push(`${varName} required in production`)
        }
      }
    }

    return {
      valid: missing.length === 0 && weak.length === 0,
      missing,
      weak,
      errors
    }
  }

  /**
   * Validate security-critical environment variables
   */
  private static validateSecurityVar(name: string, value: string): {
    valid: boolean
    error?: string
  } {
    switch (name) {
      case 'JWT_SECRET':
      case 'CSRF_SECRET':
      case 'ENCRYPTION_KEY':
      case 'SESSION_SECRET':
        if (value.length < 32) {
          return { valid: false, error: 'Must be at least 32 characters' }
        }
        if (value.includes('change-in-production') || value.includes('default') || value.includes('secret')) {
          return { valid: false, error: 'Default/weak secret detected' }
        }
        break
        
      case 'POSTGRES_PASSWORD':
        if (value.length < 16) {
          return { valid: false, error: 'Database password must be at least 16 characters' }
        }
        if (value.includes('password') || value.includes('admin') || value.includes('nexural')) {
          return { valid: false, error: 'Weak database password detected' }
        }
        break
        
      case 'DATABASE_URL':
        if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
          return { valid: false, error: 'Must be a valid PostgreSQL connection string' }
        }
        break
        
      case 'NODE_ENV':
        if (!['development', 'production', 'test'].includes(value)) {
          return { valid: false, error: 'Must be development, production, or test' }
        }
        break
    }
    
    return { valid: true }
  }

  /**
   * Get secure environment configuration
   */
  static getSecureConfig(): RequiredEnvVars & OptionalEnvVars {
    const validation = this.validateEnvironment()
    
    if (!validation.valid) {
      console.error('🚨 ENVIRONMENT VALIDATION FAILED:')
      console.error('Missing variables:', validation.missing)
      console.error('Weak variables:', validation.weak)
      console.error('Errors:', validation.errors)
      
      throw new Error(
        `Environment validation failed. Missing: [${validation.missing.join(', ')}]. ` +
        `Weak: [${validation.weak.join(', ')}]. Please check your environment configuration.`
      )
    }

    return process.env as RequiredEnvVars & OptionalEnvVars
  }

  /**
   * Initialize security configuration on startup
   */
  static initializeSecureEnvironment(): void {
    console.log('🔒 Initializing secure environment configuration...')
    
    try {
      const config = this.getSecureConfig()
      
      console.log('✅ Environment validation passed')
      console.log(`🌍 Running in ${config.NODE_ENV} mode`)
      
      if (config.NODE_ENV === 'production') {
        console.log('🛡️ Production security mode enabled')
      }
      
    } catch (error) {
      console.error('🚨 CRITICAL: Environment initialization failed')
      console.error(error)
      process.exit(1) // Fail fast on security configuration errors
    }
  }
}

// ===== SECURE GETTERS =====

/**
 * Get JWT secret with validation
 */
export const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

/**
 * Get CSRF secret with validation  
 */
export const getCSRFSecret = (): string => {
  const secret = process.env.CSRF_SECRET
  if (!secret) {
    throw new Error('CSRF_SECRET environment variable is required')
  }
  return secret
}

/**
 * Get database URL with validation
 */
export const getDatabaseURL = (): string => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  return url
}

/**
 * Get Redis configuration with validation
 */
export const getRedisConfig = (): {
  url?: string
  host: string
  port: number
  password?: string
  db: number
} => {
  const url = process.env.REDIS_URL
  const host = process.env.REDIS_HOST || 'localhost'
  const port = parseInt(process.env.REDIS_PORT || '6379')
  const password = process.env.REDIS_PASSWORD
  const db = parseInt(process.env.REDIS_DB || '0')
  
  // Require Redis authentication in production
  if (process.env.NODE_ENV === 'production' && !url && !password) {
    throw new Error('Redis authentication required in production')
  }

  return { url, host, port, password, db }
}

// ===== INITIALIZATION =====

// Validate environment on module load
if (process.env.NODE_ENV !== 'test') {
  EnvironmentValidator.initializeSecureEnvironment()
}

export { EnvironmentValidator }
export default EnvironmentValidator
