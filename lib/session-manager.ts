import { SignJWT, jwtVerify } from "jose"

interface SessionData {
  userId: string
  email: string
  role: string
  permissions: string[]
  sessionId: string
  loginTime: string
  lastActivity: string
  ipAddress?: string
  userAgent?: string
}

interface SessionConfig {
  accessTokenExpiry: number // in seconds
  refreshTokenExpiry: number // in seconds
  sessionTimeout: number // in seconds
  maxConcurrentSessions: number
}

export class SessionManager {
  private static readonly JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default-jwt-secret-change-in-production",
  )

  private static readonly config: SessionConfig = {
    accessTokenExpiry: 30 * 60, // 30 minutes
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
    sessionTimeout: 24 * 60 * 60, // 24 hours
    maxConcurrentSessions: 5,
  }

  private static activeSessions = new Map<string, SessionData>()

  static async createSession(userData: Omit<SessionData, "sessionId" | "loginTime" | "lastActivity">): Promise<{
    accessToken: string
    refreshToken: string
    sessionId: string
  }> {
    const sessionId = crypto.randomUUID()
    const now = new Date().toISOString()

    const sessionData: SessionData = {
      ...userData,
      sessionId,
      loginTime: now,
      lastActivity: now,
    }

    // Store session
    this.activeSessions.set(sessionId, sessionData)

    // Clean up old sessions for this user
    await this.cleanupUserSessions(userData.userId)

    // Generate tokens
    const accessToken = await this.generateAccessToken(sessionData)
    const refreshToken = await this.generateRefreshToken(sessionId)

    return { accessToken, refreshToken, sessionId }
  }

  static async validateSession(token: string): Promise<SessionData | null> {
    try {
      const { payload } = await jwtVerify(token, this.JWT_SECRET)
      const sessionId = payload.sessionId as string

      const session = this.activeSessions.get(sessionId)
      if (!session) return null

      // Check if session has expired
      const lastActivity = new Date(session.lastActivity).getTime()
      const now = Date.now()
      if (now - lastActivity > this.config.sessionTimeout * 1000) {
        this.destroySession(sessionId)
        return null
      }

      // Update last activity
      session.lastActivity = new Date().toISOString()
      this.activeSessions.set(sessionId, session)

      return session
    } catch (error) {
      return null
    }
  }

  static async refreshSession(refreshToken: string): Promise<{
    accessToken: string
    refreshToken: string
  } | null> {
    try {
      const { payload } = await jwtVerify(refreshToken, this.JWT_SECRET)
      const sessionId = payload.sessionId as string

      const session = this.activeSessions.get(sessionId)
      if (!session) return null

      // Generate new tokens
      const newAccessToken = await this.generateAccessToken(session)
      const newRefreshToken = await this.generateRefreshToken(sessionId)

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      return null
    }
  }

  static destroySession(sessionId: string): void {
    this.activeSessions.delete(sessionId)
  }

  static destroyAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId)
      }
    }
  }

  static getUserSessions(userId: string): SessionData[] {
    return Array.from(this.activeSessions.values()).filter((session) => session.userId === userId)
  }

  static getActiveSessionsCount(): number {
    return this.activeSessions.size
  }

  private static async generateAccessToken(sessionData: SessionData): Promise<string> {
    return await new SignJWT({
      sub: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role,
      permissions: sessionData.permissions,
      sessionId: sessionData.sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${this.config.accessTokenExpiry}s`)
      .setIssuer("nexural-platform")
      .setAudience("nexural-users")
      .sign(this.JWT_SECRET)
  }

  private static async generateRefreshToken(sessionId: string): Promise<string> {
    return await new SignJWT({
      sessionId,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${this.config.refreshTokenExpiry}s`)
      .setIssuer("nexural-platform")
      .setAudience("nexural-users")
      .sign(this.JWT_SECRET)
  }

  private static async cleanupUserSessions(userId: string): Promise<void> {
    const userSessions = this.getUserSessions(userId)

    if (userSessions.length >= this.config.maxConcurrentSessions) {
      // Sort by last activity and remove oldest sessions
      userSessions
        .sort((a, b) => new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime())
        .slice(0, userSessions.length - this.config.maxConcurrentSessions + 1)
        .forEach((session) => this.destroySession(session.sessionId))
    }
  }

  // Cleanup expired sessions periodically
  static startCleanupTask(): void {
    setInterval(
      () => {
        const now = Date.now()
        for (const [sessionId, session] of this.activeSessions.entries()) {
          const lastActivity = new Date(session.lastActivity).getTime()
          if (now - lastActivity > this.config.sessionTimeout * 1000) {
            this.activeSessions.delete(sessionId)
          }
        }
      },
      5 * 60 * 1000,
    ) // Run every 5 minutes
  }
}

// Start the cleanup task
SessionManager.startCleanupTask()
