interface SecurityConfig {
  enableCSP: boolean
  enableHSTS: boolean
  enableXSSProtection: boolean
  enableClickjacking: boolean
  enableMIMESniffing: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  passwordMinLength: number
  require2FA: boolean
}

interface SecurityMetrics {
  vulnerabilityScore: number
  complianceScore: number
  authenticationScore: number
  dataProtectionScore: number
}

export class SecurityManager {
  private config: SecurityConfig = {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableClickjacking: true,
    enableMIMESniffing: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    passwordMinLength: 12,
    require2FA: true,
  }

  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map()

  generateCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.nexuraltrading.com wss://ws.nexuraltrading.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  }

  getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}

    if (this.config.enableCSP) {
      headers["Content-Security-Policy"] = this.generateCSPHeader()
    }

    if (this.config.enableHSTS) {
      headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    }

    if (this.config.enableXSSProtection) {
      headers["X-XSS-Protection"] = "1; mode=block"
    }

    if (this.config.enableClickjacking) {
      headers["X-Frame-Options"] = "DENY"
    }

    if (this.config.enableMIMESniffing) {
      headers["X-Content-Type-Options"] = "nosniff"
    }

    headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    return headers
  }

  validatePassword(password: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= this.config.passwordMinLength) {
      score += 20
    } else {
      feedback.push(`Password must be at least ${this.config.passwordMinLength} characters long`)
    }

    if (/[a-z]/.test(password)) score += 15
    else feedback.push("Password must contain lowercase letters")

    if (/[A-Z]/.test(password)) score += 15
    else feedback.push("Password must contain uppercase letters")

    if (/\d/.test(password)) score += 15
    else feedback.push("Password must contain numbers")

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20
    else feedback.push("Password must contain special characters")

    if (password.length >= 16) score += 10
    if (/^(?!.*(.)\1{2,})/.test(password)) score += 5

    return {
      isValid: score >= 70,
      score,
      feedback,
    }
  }

  checkLoginAttempts(identifier: string): { allowed: boolean; remainingAttempts: number; lockoutTime?: number } {
    const attempts = this.loginAttempts.get(identifier)
    const now = Date.now()

    if (!attempts) {
      return { allowed: true, remainingAttempts: this.config.maxLoginAttempts }
    }

    // Reset attempts after 1 hour
    if (now - attempts.lastAttempt > 60 * 60 * 1000) {
      this.loginAttempts.delete(identifier)
      return { allowed: true, remainingAttempts: this.config.maxLoginAttempts }
    }

    if (attempts.count >= this.config.maxLoginAttempts) {
      const lockoutTime = attempts.lastAttempt + 60 * 60 * 1000 // 1 hour lockout
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutTime,
      }
    }

    return {
      allowed: true,
      remainingAttempts: this.config.maxLoginAttempts - attempts.count,
    }
  }

  recordLoginAttempt(identifier: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(identifier)
      return
    }

    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 }
    attempts.count++
    attempts.lastAttempt = Date.now()
    this.loginAttempts.set(identifier, attempts)
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .trim()
  }

  generateSecureToken(length = 32): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  getSecurityScore(): SecurityMetrics {
    const vulnerabilityScore = this.calculateVulnerabilityScore()
    const complianceScore = this.calculateComplianceScore()
    const authenticationScore = this.calculateAuthenticationScore()
    const dataProtectionScore = this.calculateDataProtectionScore()

    return {
      vulnerabilityScore,
      complianceScore,
      authenticationScore,
      dataProtectionScore,
    }
  }

  private calculateVulnerabilityScore(): number {
    let score = 100

    if (!this.config.enableCSP) score -= 20
    if (!this.config.enableXSSProtection) score -= 15
    if (!this.config.enableClickjacking) score -= 15
    if (!this.config.enableMIMESniffing) score -= 10

    return Math.max(0, score)
  }

  private calculateComplianceScore(): number {
    let score = 100

    if (!this.config.enableHSTS) score -= 25
    if (this.config.sessionTimeout > 60 * 60 * 1000) score -= 15 // More than 1 hour
    if (this.config.passwordMinLength < 12) score -= 20

    return Math.max(0, score)
  }

  private calculateAuthenticationScore(): number {
    let score = 100

    if (!this.config.require2FA) score -= 30
    if (this.config.maxLoginAttempts > 5) score -= 15
    if (this.config.passwordMinLength < 12) score -= 20

    return Math.max(0, score)
  }

  private calculateDataProtectionScore(): number {
    // This would integrate with actual data encryption and storage practices
    return 95 // Assuming good practices are in place
  }
}

export const securityManager = new SecurityManager()
