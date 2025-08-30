/**
 * 🛡️ Security Utilities
 * Comprehensive security functions for authentication, validation, and protection
 */

import crypto from 'crypto'
import { NextRequest } from 'next/server'

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/['";]/g, '') // Remove quotes and semicolons to prevent injection
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000) // Limit length
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

// Password strength validation
export function isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generate secure token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Hash password with salt
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  
  return { hash, salt }
}

// Verify password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

// Check for suspicious activity
export function detectSuspiciousActivity(request: NextRequest): {
  isSuspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const url = request.url
  
  // Check for bot patterns
  const botPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /scrapy/i,
    /bot/i,
    /crawler/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    reasons.push('Automated request detected')
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /'.*or.*'/i,
    /--/,
    /;.*exec/i
  ]
  
  if (sqlPatterns.some(pattern => pattern.test(url))) {
    reasons.push('SQL injection attempt detected')
  }
  
  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /<iframe/i,
    /eval\(/i,
    /alert\(/i
  ]
  
  if (xssPatterns.some(pattern => pattern.test(url) || pattern.test(referer))) {
    reasons.push('XSS attempt detected')
  }
  
  // Check for path traversal
  if (/\.\.(\/|\\)/.test(url)) {
    reasons.push('Path traversal attempt detected')
  }
  
  // Check for unusual headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url'
  ]
  
  suspiciousHeaders.forEach(header => {
    if (request.headers.get(header)) {
      reasons.push(`Suspicious header detected: ${header}`)
    }
  })
  
  return {
    isSuspicious: reasons.length > 0,
    reasons
  }
}

// Validate request size
export function validateRequestSize(request: NextRequest, maxSizeKB: number = 1024): boolean {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) return true
  
  const sizeKB = parseInt(contentLength) / 1024
  return sizeKB <= maxSizeKB
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Validate CSRF token
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // In production, store CSRF tokens in session/database
  // For now, basic validation
  return typeof token === 'string' && token.length === 64 && /^[a-f0-9]+$/.test(token)
}

// IP address validation
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

// Validate JSON input
export function validateJSON(input: string): { isValid: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(input)
    return { isValid: true, data }
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' }
  }
}

// Check for common attack payloads
export const ATTACK_PATTERNS = {
  xss: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+onerror[^>]*>/gi
  ],
  
  sql: [
    /'(\s)*(or|and)(\s)*'.*=/gi,
    /union(\s)*select/gi,
    /drop(\s)*table/gi,
    /delete(\s)*from/gi,
    /insert(\s)*into/gi,
    /update(\s)*set/gi
  ],
  
  pathTraversal: [
    /\.\.\/|\.\.\\/g,
    /%2e%2e%2f/gi,
    /%252e%252e%252f/gi
  ],
  
  commandInjection: [
    /;\s*(ls|cat|wget|curl|nc|netcat|bash|sh)/gi,
    /\|\s*(ls|cat|wget|curl|nc|netcat|bash|sh)/gi,
    /`.*`/g,
    /\$\(.*\)/g
  ]
}

// Comprehensive security check
export function performSecurityCheck(input: string): {
  isSafe: boolean
  threats: string[]
  sanitizedInput: string
} {
  const threats: string[] = []
  
  // Check each attack pattern
  Object.entries(ATTACK_PATTERNS).forEach(([type, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push(`${type.toUpperCase()} attack pattern detected`)
      }
    })
  })
  
  return {
    isSafe: threats.length === 0,
    threats,
    sanitizedInput: sanitizeInput(input)
  }
}

// Security audit logging
export function logSecurityEvent(event: {
  type: 'authentication' | 'authorization' | 'suspicious_activity' | 'rate_limit' | 'input_validation'
  ip: string
  userAgent?: string
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event
  }
  
  // In production, send to security monitoring system
  console.warn('🛡️ SECURITY EVENT:', JSON.stringify(logEntry, null, 2))
  
  // For critical events, you might want to:
  // - Send alerts
  // - Block IP addresses
  // - Trigger additional security measures
  if (event.severity === 'critical') {
    console.error('🚨 CRITICAL SECURITY EVENT - IMMEDIATE ATTENTION REQUIRED')
  }
}

