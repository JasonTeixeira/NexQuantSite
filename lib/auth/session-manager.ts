interface SessionData {
  userId: string
  email: string
  role: string
  permissions: string[]
  sessionId: string
  lastActivity: number
  ipAddress: string
  userAgent: string
  isActive: boolean
}

interface SessionConfig {
  maxInactiveTime: number // milliseconds
  maxSessionTime: number // milliseconds
  warningTime: number // milliseconds before expiry
}

export class SessionManager {
  private sessions = new Map<string, SessionData>()
  private sessionConfig: SessionConfig = {
    maxInactiveTime: 30 * 60 * 1000, // 30 minutes
    maxSessionTime: 8 * 60 * 60 * 1000, // 8 hours
    warningTime: 5 * 60 * 1000, // 5 minutes warning
  }

  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredSessions()
      },
      5 * 60 * 1000,
    )
  }

  async createSession(
    userId: string,
    email: string,
    role: string,
    permissions: string[],
    ipAddress: string,
    userAgent: string,
  ): Promise<string> {
    const sessionId = this.generateSessionId()
    const now = Date.now()

    const sessionData: SessionData = {
      userId,
      email,
      role,
      permissions,
      sessionId,
      lastActivity: now,
      ipAddress,
      userAgent,
      isActive: true,
    }

    this.sessions.set(sessionId, sessionData)

    // In production, store in database
    await this.persistSession(sessionData)

    return sessionId
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      return null
    }

    const now = Date.now()
    const timeSinceLastActivity = now - session.lastActivity

    // Check if session is expired due to inactivity
    if (timeSinceLastActivity > this.sessionConfig.maxInactiveTime) {
      await this.invalidateSession(sessionId)
      return null
    }

    // Check if session has exceeded maximum time
    const sessionAge = now - (session.lastActivity - timeSinceLastActivity)
    if (sessionAge > this.sessionConfig.maxSessionTime) {
      await this.invalidateSession(sessionId)
      return null
    }

    return session
  }

  async updateSessionActivity(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      return false
    }

    session.lastActivity = Date.now()
    this.sessions.set(sessionId, session)

    // In production, update database
    await this.persistSession(session)

    return true
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isActive = false
      this.sessions.set(sessionId, session)
    }

    // In production, update database
    await this.removeSessionFromDatabase(sessionId)
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        await this.invalidateSession(sessionId)
      }
    }
  }

  getSessionTimeRemaining(sessionId: string): number {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      return 0
    }

    const now = Date.now()
    const timeSinceLastActivity = now - session.lastActivity
    const remainingInactiveTime = this.sessionConfig.maxInactiveTime - timeSinceLastActivity

    const sessionAge = now - (session.lastActivity - timeSinceLastActivity)
    const remainingSessionTime = this.sessionConfig.maxSessionTime - sessionAge

    return Math.min(remainingInactiveTime, remainingSessionTime)
  }

  shouldShowWarning(sessionId: string): boolean {
    const timeRemaining = this.getSessionTimeRemaining(sessionId)
    return timeRemaining > 0 && timeRemaining <= this.sessionConfig.warningTime
  }

  async extendSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      return false
    }

    // Reset last activity to extend the session
    session.lastActivity = Date.now()
    this.sessions.set(sessionId, session)

    await this.persistSession(session)
    return true
  }

  getActiveSessions(userId: string): SessionData[] {
    return Array.from(this.sessions.values()).filter((session) => session.userId === userId && session.isActive)
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now()

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now - session.lastActivity

      if (timeSinceLastActivity > this.sessionConfig.maxInactiveTime || !session.isActive) {
        this.sessions.delete(sessionId)
      }
    }
  }

  private async persistSession(session: SessionData): Promise<void> {
    // Placeholder for database persistence
    // In production, this would save to your database
    console.log(`Persisting session: ${session.sessionId}`)
  }

  private async removeSessionFromDatabase(sessionId: string): Promise<void> {
    // Placeholder for database removal
    // In production, this would remove from your database
    console.log(`Removing session from database: ${sessionId}`)
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.sessions.clear()
  }
}

export const sessionManager = new SessionManager()
