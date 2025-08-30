export class AdvancedInputSanitizer {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
  ]

  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /('|(\\')|(;)|(--)|(\|)|(\*)|(%27)|(%3D)|(%3B)|(%2D%2D))/gi,
    /(\b(WAITFOR|DELAY)\b)/gi,
    /(\b(CAST|CONVERT|SUBSTRING|ASCII|CHAR)\b)/gi,
  ]

  private static readonly COMMAND_INJECTION_PATTERNS = [
    /(\||&|;|`|\$\(|\${)/g,
    /(\.\.\/|\.\.\\)/g,
    /(\bnc\b|\bnetcat\b|\bwget\b|\bcurl\b)/gi,
    /(\bchmod\b|\bchown\b|\brm\b|\bmv\b|\bcp\b)/gi,
  ]

  static sanitizeInput(
    input: string,
    options: {
      allowHtml?: boolean
      maxLength?: number
      stripSql?: boolean
      stripCommands?: boolean
    } = {},
  ): string {
    if (!input || typeof input !== "string") return ""

    let sanitized = input

    // Trim and limit length
    sanitized = sanitized.trim()
    if (options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength)
    }

    // Remove XSS patterns
    if (!options.allowHtml) {
      this.XSS_PATTERNS.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, "")
      })
    }

    // Remove SQL injection patterns
    if (options.stripSql !== false) {
      this.SQL_INJECTION_PATTERNS.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, "")
      })
    }

    // Remove command injection patterns
    if (options.stripCommands !== false) {
      this.COMMAND_INJECTION_PATTERNS.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, "")
      })
    }

    // Encode remaining special characters
    sanitized = sanitized
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")

    return sanitized
  }

  static validateAndSanitize(
    input: string,
    type: "email" | "username" | "password" | "text" | "html",
  ): {
    isValid: boolean
    sanitized: string
    errors: string[]
  } {
    const errors: string[] = []
    let sanitized = input

    switch (type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(input)) {
          errors.push("Invalid email format")
        }
        sanitized = this.sanitizeInput(input, { maxLength: 254, stripSql: true })
        break

      case "username":
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
        if (!usernameRegex.test(input)) {
          errors.push("Username must be 3-20 characters, alphanumeric, underscore, or dash only")
        }
        sanitized = this.sanitizeInput(input, { maxLength: 20, stripSql: true })
        break

      case "password":
        if (input.length < 8) {
          errors.push("Password must be at least 8 characters")
        }
        // Don't sanitize passwords, just validate
        sanitized = input
        break

      case "html":
        sanitized = this.sanitizeInput(input, { allowHtml: true, maxLength: 10000 })
        break

      default:
        sanitized = this.sanitizeInput(input, { maxLength: 1000 })
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
    }
  }

  static detectSuspiciousPatterns(input: string): {
    isSuspicious: boolean
    threats: string[]
    riskScore: number
  } {
    const threats: string[] = []
    let riskScore = 0

    // Check for XSS
    this.XSS_PATTERNS.forEach((pattern) => {
      if (pattern.test(input)) {
        threats.push("XSS attempt detected")
        riskScore += 30
      }
    })

    // Check for SQL injection
    this.SQL_INJECTION_PATTERNS.forEach((pattern) => {
      if (pattern.test(input)) {
        threats.push("SQL injection attempt detected")
        riskScore += 40
      }
    })

    // Check for command injection
    this.COMMAND_INJECTION_PATTERNS.forEach((pattern) => {
      if (pattern.test(input)) {
        threats.push("Command injection attempt detected")
        riskScore += 35
      }
    })

    // Check for suspicious length
    if (input.length > 10000) {
      threats.push("Unusually long input detected")
      riskScore += 10
    }

    // Check for encoded payloads
    if (/%[0-9a-fA-F]{2}/.test(input)) {
      const decoded = decodeURIComponent(input)
      if (decoded !== input) {
        const decodedCheck = this.detectSuspiciousPatterns(decoded)
        if (decodedCheck.isSuspicious) {
          threats.push("Encoded malicious payload detected")
          riskScore += 25
        }
      }
    }

    return {
      isSuspicious: riskScore > 20,
      threats,
      riskScore: Math.min(100, riskScore),
    }
  }
}
