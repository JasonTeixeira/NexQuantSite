import crypto from "crypto"
import bcrypt from "bcryptjs"
import { rateLimit } from "express-rate-limit"

interface PasswordValidation {
  isValid: boolean
  score: number
  feedback: string[]
}

interface CSRFToken {
  token: string
  timestamp: number
  used: boolean
}

export class SecurityUtils {
  private csrfTokens = new Map<string, CSRFToken>()
  private readonly csrfTokenExpiry = 60 * 60 * 1000 // 1 hour
  private readonly saltRounds = 12

  // Password Security
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  validatePasswordStrength(password: string): PasswordValidation {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length < 8) {
      feedback.push("Password must be at least 8 characters long")
    } else if (password.length >= 12) {
      score += 2
    } else {
      score += 1
    }

    // Character variety checks
    if (!/[a-z]/.test(password)) {
      feedback.push("Password must contain lowercase letters")
    } else {
      score += 1
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push("Password must contain uppercase letters")
    } else {
      score += 1
    }

    if (!/\d/.test(password)) {
      feedback.push("Password must contain numbers")
    } else {
      score += 1
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      feedback.push("Password must contain special characters")
    } else {
      score += 1
    }

    // Common patterns check
    if (/(.)\1{2,}/.test(password)) {
      feedback.push("Avoid repeating characters")
      score -= 1
    }

    if (/123|abc|qwe|password|admin/i.test(password)) {
      feedback.push("Avoid common patterns and words")
      score -= 2
    }

    const isValid = feedback.length === 0 && score >= 4
    return { isValid, score: Math.max(0, score), feedback }
  }

  // Input Sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/['"]/g, "") // Remove quotes
      .replace(/[;&|`$]/g, "") // Remove command injection chars
      .trim()
  }

  sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    return usernameRegex.test(username)
  }

  // CSRF Protection
  generateCSRFToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString("hex")

    this.csrfTokens.set(sessionId, {
      token,
      timestamp: Date.now(),
      used: false,
    })

    // Clean up expired tokens
    this.cleanupExpiredCSRFTokens()

    return token
  }

  validateCSRFToken(sessionId: string, token: string): boolean {
    const storedToken = this.csrfTokens.get(sessionId)

    if (!storedToken || storedToken.used) {
      return false
    }

    if (Date.now() - storedToken.timestamp > this.csrfTokenExpiry) {
      this.csrfTokens.delete(sessionId)
      return false
    }

    if (storedToken.token !== token) {
      return false
    }

    // Mark token as used (one-time use)
    storedToken.used = true
    this.csrfTokens.set(sessionId, storedToken)

    return true
  }

  private cleanupExpiredCSRFTokens(): void {
    const now = Date.now()
    for (const [sessionId, token] of this.csrfTokens.entries()) {
      if (now - token.timestamp > this.csrfTokenExpiry || token.used) {
        this.csrfTokens.delete(sessionId)
      }
    }
  }

  // Rate Limiting
  createRateLimiter(windowMs: number, max: number, message?: string) {
    return rateLimit({
      windowMs,
      max,
      message: message || "Too many requests, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: "Rate limit exceeded",
          retryAfter: Math.ceil(windowMs / 1000),
        })
      },
    })
  }

  // Encryption/Decryption
  encrypt(text: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_MASTER_KEY
    if (!encryptionKey) {
      throw new Error("Encryption key not provided")
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    return iv.toString("hex") + ":" + encrypted
  }

  decrypt(encryptedText: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_MASTER_KEY
    if (!encryptionKey) {
      throw new Error("Encryption key not provided")
    }

    const [ivHex, encrypted] = encryptedText.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  // Secure Random Generation
  generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }

  generateSecureNumericCode(length = 6): string {
    const digits = "0123456789"
    let result = ""

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length)
      result += digits[randomIndex]
    }

    return result
  }

  // IP and User Agent Validation
  isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  sanitizeUserAgent(userAgent: string): string {
    return userAgent.substring(0, 500).replace(/[<>]/g, "")
  }

  // Security Headers
  getSecurityHeaders(): Record<string, string> {
    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    }
  }

  // Audit Logging
  logSecurityEvent(event: {
    type: "login" | "logout" | "failed_login" | "permission_denied" | "suspicious_activity"
    userId?: string
    ip: string
    userAgent: string
    details?: any
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event,
    }

    // In production, this would write to a secure audit log
    console.log("SECURITY_EVENT:", JSON.stringify(logEntry))
  }
}

export const securityUtils = new SecurityUtils()
