/**
 * Advanced Security System - Enterprise Grade
 * Comprehensive security utilities for rate limiting, input validation, CSRF protection
 */

import crypto from 'crypto'

export interface SecurityConfig {
  rateLimit: {
    windowMs: number // Time window in milliseconds
    maxRequests: number // Max requests per window
    skipSuccessfulRequests?: boolean
    skipFailedRequests?: boolean
    keyGenerator?: (ip: string, path: string) => string
  }
  csrf: {
    enabled: boolean
    secret: string
    tokenLifetime: number // seconds
    cookieName: string
    headerName: string
  }
  inputValidation: {
    maxBodySize: number // bytes
    allowedFileTypes: string[]
    maxFileSize: number // bytes
    sanitizeInputs: boolean
  }
  bruteForce: {
    maxAttempts: number
    lockoutDuration: number // minutes
    progressiveDelay: boolean
  }
  monitoring: {
    enabled: boolean
    alertThreshold: number
    logSuspiciousActivity: boolean
  }
}

export interface RateLimitRecord {
  count: number
  resetTime: number
  firstRequest: number
  blocked: boolean
  violations: number
}

export interface BruteForceRecord {
  attempts: number
  lockedUntil?: number
  lastAttempt: number
  progressiveDelay: number
}

export interface SecurityThreat {
  id: string
  type: 'rate_limit' | 'brute_force' | 'xss' | 'sql_injection' | 'path_traversal' | 'csrf' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  ip: string
  userAgent?: string
  endpoint: string
  payload?: string
  timestamp: string
  blocked: boolean
  details: Record<string, any>
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  rateLimit: {
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 1000 : 15 * 60 * 1000, // 1 min dev, 15 min prod
    maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 dev, 100 prod
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  csrf: {
    enabled: true,
    secret: (() => {
      const secret = process.env.CSRF_SECRET
      if (!secret) {
        throw new Error('CSRF_SECRET environment variable is required for secure CSRF protection')
      }
      return secret
    })(),
    tokenLifetime: 3600, // 1 hour
    cookieName: 'csrf-token',
    headerName: 'x-csrf-token'
  },
  inputValidation: {
    maxBodySize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'csv', 'json'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    sanitizeInputs: true
  },
  bruteForce: {
    maxAttempts: process.env.NODE_ENV === 'development' ? 50 : 5, // 50 dev, 5 prod
    lockoutDuration: process.env.NODE_ENV === 'development' ? 1 : 30, // 1 min dev, 30 min prod
    progressiveDelay: process.env.NODE_ENV === 'development' ? false : true // off for dev
  },
  monitoring: {
    enabled: true,
    alertThreshold: 10,
    logSuspiciousActivity: true
  }
}

// In-memory stores (use Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>()
const bruteForceStore = new Map<string, BruteForceRecord>()
const csrfTokenStore = new Map<string, { token: string, expires: number }>()
const threatLog: SecurityThreat[] = []

export class AdvancedSecurityManager {
  private config: SecurityConfig

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config }
  }

  // Advanced Rate Limiting
  checkRateLimit(ip: string, path: string, userAgent?: string): { allowed: boolean, reason?: string, retryAfter?: number } {
    const keyGenerator = this.config.rateLimit.keyGenerator || ((ip: string, path: string) => `${ip}:${path}`)
    const key = keyGenerator(ip, path)
    const now = Date.now()
    
    // Get or create rate limit record
    let record = rateLimitStore.get(key)
    
    if (!record || now >= record.resetTime) {
      record = {
        count: 1,
        resetTime: now + this.config.rateLimit.windowMs,
        firstRequest: now,
        blocked: false,
        violations: record?.violations || 0
      }
      rateLimitStore.set(key, record)
      return { allowed: true }
    }

    // Check if currently blocked
    if (record.blocked) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      return { 
        allowed: false, 
        reason: 'Rate limit exceeded', 
        retryAfter 
      }
    }

    // Check if limit exceeded
    if (record.count >= this.config.rateLimit.maxRequests) {
      record.blocked = true
      record.violations++
      
      // Log threat
      this.logThreat({
        type: 'rate_limit',
        severity: 'medium',
        ip,
        endpoint: path,
        details: {
          requests: record.count,
          timeWindow: this.config.rateLimit.windowMs,
          violations: record.violations
        }
      })

      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      return { 
        allowed: false, 
        reason: 'Rate limit exceeded', 
        retryAfter 
      }
    }

    record.count++
    return { allowed: true }
  }

  // Brute Force Protection
  checkBruteForce(identifier: string, success: boolean = false): { allowed: boolean, delay?: number, reason?: string } {
    const now = Date.now()
    let record = bruteForceStore.get(identifier)

    if (success) {
      // Clear record on successful attempt
      if (record) {
        bruteForceStore.delete(identifier)
      }
      return { allowed: true }
    }

    if (!record) {
      record = {
        attempts: 1,
        lastAttempt: now,
        progressiveDelay: 0
      }
      bruteForceStore.set(identifier, record)
      return { allowed: true }
    }

    // Check if currently locked out
    if (record.lockedUntil && now < record.lockedUntil) {
      const delay = Math.ceil((record.lockedUntil - now) / 1000)
      return { 
        allowed: false, 
        delay, 
        reason: 'Account temporarily locked due to multiple failed attempts' 
      }
    }

    // Clear lockout if expired
    if (record.lockedUntil && now >= record.lockedUntil) {
      record.lockedUntil = undefined
      record.attempts = 0
    }

    record.attempts++
    record.lastAttempt = now

    // Check if max attempts exceeded
    if (record.attempts >= this.config.bruteForce.maxAttempts) {
      const lockoutDuration = this.config.bruteForce.lockoutDuration * 60 * 1000
      record.lockedUntil = now + lockoutDuration
      
      // Log threat
      this.logThreat({
        type: 'brute_force',
        severity: 'high',
        ip: identifier,
        endpoint: 'auth',
        details: {
          attempts: record.attempts,
          lockoutDuration: this.config.bruteForce.lockoutDuration
        }
      })

      return { 
        allowed: false, 
        delay: this.config.bruteForce.lockoutDuration * 60, 
        reason: 'Too many failed attempts. Account locked.' 
      }
    }

    // Progressive delay
    if (this.config.bruteForce.progressiveDelay && record.attempts > 2) {
      record.progressiveDelay = Math.min(record.attempts * 1000, 10000) // Max 10 seconds
      return { 
        allowed: true, 
        delay: Math.ceil(record.progressiveDelay / 1000) 
      }
    }

    return { allowed: true }
  }

  // CSRF Token Management
  generateCSRFToken(sessionId?: string): string {
    const tokenId = sessionId || crypto.randomBytes(16).toString('hex')
    const token = crypto.randomBytes(32).toString('hex')
    const signature = this.signCSRFToken(token)
    const fullToken = `${token}.${signature}`

    csrfTokenStore.set(tokenId, {
      token: fullToken,
      expires: Date.now() + (this.config.csrf.tokenLifetime * 1000)
    })

    return fullToken
  }

  validateCSRFToken(token: string, sessionId?: string): boolean {
    if (!this.config.csrf.enabled) return true
    if (!token) return false

    const [tokenPart, signature] = token.split('.')
    if (!tokenPart || !signature) return false

    // Verify signature
    const expectedSignature = this.signCSRFToken(tokenPart)
    if (signature !== expectedSignature) return false

    // Check if token exists and is valid
    if (sessionId) {
      const storedToken = csrfTokenStore.get(sessionId)
      if (!storedToken || storedToken.token !== token) return false
      if (Date.now() > storedToken.expires) {
        csrfTokenStore.delete(sessionId)
        return false
      }
    }

    return true
  }

  private signCSRFToken(token: string): string {
    return crypto
      .createHmac('sha256', this.config.csrf.secret)
      .update(token)
      .digest('hex')
  }

  // Advanced Input Validation
  validateInput(input: any, type: 'string' | 'email' | 'url' | 'number' | 'file' = 'string'): { valid: boolean, sanitized?: any, errors: string[] } {
    const errors: string[] = []
    let sanitized = input

    if (!input) {
      return { valid: true, sanitized, errors }
    }

    switch (type) {
      case 'string':
        sanitized = this.sanitizeString(input)
        if (this.detectXSS(input)) {
          errors.push('Potential XSS attack detected')
        }
        if (this.detectSQLInjection(input)) {
          errors.push('Potential SQL injection detected')
        }
        break

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(input)) {
          errors.push('Invalid email format')
        }
        sanitized = input.toLowerCase().trim()
        break

      case 'url':
        try {
          new URL(input)
          // Only allow HTTP/HTTPS
          if (!input.startsWith('http://') && !input.startsWith('https://')) {
            errors.push('Only HTTP/HTTPS URLs allowed')
          }
        } catch {
          errors.push('Invalid URL format')
        }
        break

      case 'number':
        const num = Number(input)
        if (isNaN(num)) {
          errors.push('Invalid number format')
        }
        sanitized = num
        break

      case 'file':
        const validationResult = this.validateFile(input)
        if (!validationResult.valid) {
          errors.push(...validationResult.errors)
        }
        break
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors
    }
  }

  // XSS Detection
  private detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }

  // SQL Injection Detection
  private detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/gi,
      /([\'\";].*(-{2}|#|\/\*))/gi,
      /(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b)/gi,
      /(benchmark\s*\(|sleep\s*\()/gi,
      /(\b(WAITFOR|DELAY)\b)/gi
    ]

    return sqlPatterns.some(pattern => pattern.test(input))
  }

  // String Sanitization
  private sanitizeString(input: string): string {
    if (!this.config.inputValidation.sanitizeInputs) return input

    return input
      .replace(/[<>]/g, '') // Remove < >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim()
  }

  // File Validation
  private validateFile(file: { name: string, size: number, type: string }): { valid: boolean, errors: string[] } {
    const errors: string[] = []

    // Check file size
    if (file.size > this.config.inputValidation.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.config.inputValidation.maxFileSize / 1024 / 1024}MB`)
    }

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension && !this.config.inputValidation.allowedFileTypes.includes(extension)) {
      errors.push(`File type '${extension}' is not allowed`)
    }

    // Check for suspicious file names
    if (this.detectPathTraversal(file.name)) {
      errors.push('Suspicious file name detected')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Path Traversal Detection
  private detectPathTraversal(path: string): boolean {
    const traversalPatterns = [
      /\.\.(\/|\\)/,
      /\.\.\\/,
      /\.\.\/\.\./,
      /~\//,
      /\$\{.*\}/,
      /%2e%2e/gi,
      /%5c/gi,
      /%2f/gi
    ]

    return traversalPatterns.some(pattern => pattern.test(path))
  }

  // Threat Logging
  private logThreat(threat: Partial<SecurityThreat>): void {
    if (!this.config.monitoring.enabled) return

    const fullThreat: SecurityThreat = {
      id: crypto.randomBytes(8).toString('hex'),
      type: threat.type || 'suspicious_activity',
      severity: threat.severity || 'medium',
      ip: threat.ip || 'unknown',
      userAgent: threat.userAgent,
      endpoint: threat.endpoint || 'unknown',
      payload: threat.payload,
      timestamp: new Date().toISOString(),
      blocked: true,
      details: threat.details || {}
    }

    threatLog.push(fullThreat)

    // Keep only last 1000 entries to prevent memory issues
    if (threatLog.length > 1000) {
      threatLog.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY THREAT] ${fullThreat.type}:`, fullThreat)
    }

    // In production, you would send this to your monitoring system
    if (process.env.NODE_ENV === 'production' && this.config.monitoring.logSuspiciousActivity) {
      // Send to monitoring service (Datadog, New Relic, etc.)
      this.sendToMonitoring(fullThreat)
    }
  }

  private sendToMonitoring(threat: SecurityThreat): void {
    // Implement your monitoring service integration here
    // Example: Datadog, New Relic, CloudWatch, etc.
    console.log('Sending threat to monitoring service:', threat.id)
  }

  // Security Analytics
  getThreatAnalytics(): {
    totalThreats: number
    threatsByType: Record<string, number>
    threatsBySeverity: Record<string, number>
    topAttackerIPs: Array<{ ip: string, count: number }>
    recentThreats: SecurityThreat[]
  } {
    const threatsByType: Record<string, number> = {}
    const threatsBySeverity: Record<string, number> = {}
    const ipCounts: Record<string, number> = {}

    threatLog.forEach(threat => {
      threatsByType[threat.type] = (threatsByType[threat.type] || 0) + 1
      threatsBySeverity[threat.severity] = (threatsBySeverity[threat.severity] || 0) + 1
      ipCounts[threat.ip] = (ipCounts[threat.ip] || 0) + 1
    })

    const topAttackerIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }))

    return {
      totalThreats: threatLog.length,
      threatsByType,
      threatsBySeverity,
      topAttackerIPs,
      recentThreats: threatLog.slice(-50)
    }
  }

  // Cleanup expired records
  cleanup(): void {
    const now = Date.now()

    // Cleanup rate limit records
    for (const [key, record] of rateLimitStore) {
      if (now >= record.resetTime) {
        rateLimitStore.delete(key)
      }
    }

    // Cleanup CSRF tokens
    for (const [key, token] of csrfTokenStore) {
      if (now >= token.expires) {
        csrfTokenStore.delete(key)
      }
    }

    // Cleanup brute force records (older than 24 hours)
    const dayAgo = now - (24 * 60 * 60 * 1000)
    for (const [key, record] of bruteForceStore) {
      if (record.lastAttempt < dayAgo && (!record.lockedUntil || now >= record.lockedUntil)) {
        bruteForceStore.delete(key)
      }
    }
  }
}

// Global instance
export const securityManager = new AdvancedSecurityManager()

// Periodic cleanup (run every 5 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    securityManager.cleanup()
  }, 5 * 60 * 1000)
}

// Export utility functions for easy usage
export const validateEmail = (email: string) => securityManager.validateInput(email, 'email')
export const validateURL = (url: string) => securityManager.validateInput(url, 'url')
export const sanitizeString = (str: string) => securityManager.validateInput(str, 'string').sanitized
export const generateCSRFToken = (sessionId?: string) => securityManager.generateCSRFToken(sessionId)
export const validateCSRFToken = (token: string, sessionId?: string) => securityManager.validateCSRFToken(token, sessionId)

// Export for testing
export const __testing__ = {
  rateLimitStore,
  bruteForceStore,
  csrfTokenStore,
  threatLog
}

