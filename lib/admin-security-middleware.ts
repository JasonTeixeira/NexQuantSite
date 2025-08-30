import crypto from "crypto"

interface AdminUser {
  id: string
  email: string
  role: string
  permissions: string[]
  sessionId: string
  lastLogin?: Date
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class AdminSecurityManager {
  private rateLimitMap = new Map<string, RateLimitEntry>()
  private readonly JWT_SECRET = process.env.JWT_SECRET || "nexural-admin-secret-key-2024"
  private readonly CSRF_SECRET = process.env.CSRF_SECRET || "nexural-csrf-secret-2024"

  // Rate limiting
  checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): { allowed: boolean; remaining: number } {
    const now = Date.now()
    const entry = this.rateLimitMap.get(key)

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return { allowed: true, remaining: maxAttempts - 1 }
    }

    if (entry.count >= maxAttempts) {
      return { allowed: false, remaining: 0 }
    }

    entry.count++
    return { allowed: true, remaining: maxAttempts - entry.count }
  }

  // Generate simple tokens
  generateTokens(user: AdminUser) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      sessionId: user.sessionId,
      iat: Date.now(),
      exp: Date.now() + 15 * 60 * 1000, // 15 minutes
    }

    const accessToken = Buffer.from(JSON.stringify(payload)).toString("base64")
    const refreshToken = crypto.randomUUID()

    return { accessToken, refreshToken }
  }

  // Verify token
  verifyToken(token: string): AdminUser | null {
    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString())

      // Check if token is expired
      if (Date.now() > payload.exp) {
        return null
      }

      return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        sessionId: payload.sessionId,
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      return null
    }
  }

  // Generate CSRF token
  generateCSRFToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    const data = `${sessionId}:${timestamp}`
    const hash = crypto.createHmac("sha256", this.CSRF_SECRET).update(data).digest("hex")
    return `${timestamp}.${hash}`
  }

  // Verify CSRF token
  verifyCSRFToken(token: string, sessionId: string): boolean {
    try {
      const [timestamp, hash] = token.split(".")
      const data = `${sessionId}:${timestamp}`
      const expectedHash = crypto.createHmac("sha256", this.CSRF_SECRET).update(data).digest("hex")

      // Check if token is not older than 1 hour
      const tokenAge = Date.now() - Number.parseInt(timestamp)
      const maxAge = 60 * 60 * 1000 // 1 hour

      return hash === expectedHash && tokenAge < maxAge
    } catch (error) {
      return false
    }
  }

  // Clean up expired rate limit entries
  cleanupRateLimit() {
    const now = Date.now()
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitMap.delete(key)
      }
    }
  }
}

export const adminSecurityManager = new AdminSecurityManager()

// Clean up rate limit entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      adminSecurityManager.cleanupRateLimit()
    },
    5 * 60 * 1000,
  )
}
