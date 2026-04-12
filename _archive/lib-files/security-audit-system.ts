import { randomBytes } from "crypto"

interface SecurityEvent {
  id: string
  userId?: string
  type:
    | "login"
    | "logout"
    | "password_change"
    | "profile_update"
    | "admin_action"
    | "api_access"
    | "suspicious_activity"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface SecurityThreat {
  type: "brute_force" | "sql_injection" | "xss_attempt" | "csrf_attempt" | "rate_limit_exceeded" | "suspicious_pattern"
  severity: "low" | "medium" | "high" | "critical"
  source: string
  description: string
  blocked: boolean
  timestamp: Date
}

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  blockedThreats: number
  uniqueUsers: number
  suspiciousIPs: string[]
  topThreats: { type: string; count: number }[]
}

export class SecurityAuditSystem {
  private events: SecurityEvent[] = []
  private threats: SecurityThreat[] = []
  private suspiciousIPs: Map<string, { count: number; lastSeen: Date }> = new Map()
  private rateLimits: Map<string, { requests: number; resetTime: Date }> = new Map()

  private readonly maxEventsInMemory = 10000
  private readonly suspiciousThreshold = 10
  private readonly rateLimitWindow = 60 * 1000 // 1 minute
  private readonly maxRequestsPerMinute = 100

  logSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp">): string {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
    }

    this.events.push(securityEvent)
    this.cleanupOldEvents()

    // Check for suspicious patterns
    this.analyzeSuspiciousActivity(securityEvent)

    // Store in persistent storage (would integrate with database)
    this.persistEvent(securityEvent)

    return securityEvent.id
  }

  detectThreat(type: SecurityThreat["type"], source: string, description: string, request?: any): SecurityThreat {
    const severity = this.calculateThreatSeverity(type, source)
    const shouldBlock = severity === "high" || severity === "critical"

    const threat: SecurityThreat = {
      type,
      severity,
      source,
      description,
      blocked: shouldBlock,
      timestamp: new Date(),
    }

    this.threats.push(threat)

    if (shouldBlock) {
      this.blockIP(source)
    }

    // Log as security event
    this.logSecurityEvent({
      type: "suspicious_activity",
      severity,
      description: `Threat detected: ${description}`,
      ipAddress: source,
      userAgent: request?.headers?.["user-agent"] || "Unknown",
    })

    return threat
  }

  checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: Date } {
    const now = new Date()
    const limit = this.rateLimits.get(identifier)

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      const resetTime = new Date(now.getTime() + this.rateLimitWindow)
      this.rateLimits.set(identifier, { requests: 1, resetTime })
      return { allowed: true, remaining: this.maxRequestsPerMinute - 1, resetTime }
    }

    if (limit.requests >= this.maxRequestsPerMinute) {
      // Rate limit exceeded
      this.detectThreat("rate_limit_exceeded", identifier, `Rate limit exceeded: ${limit.requests} requests`)
      return { allowed: false, remaining: 0, resetTime: limit.resetTime }
    }

    // Increment request count
    limit.requests++
    return {
      allowed: true,
      remaining: this.maxRequestsPerMinute - limit.requests,
      resetTime: limit.resetTime,
    }
  }

  analyzeSecurityPosture(): SecurityMetrics {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentEvents = this.events.filter((event) => event.timestamp > last24Hours)
    const criticalEvents = recentEvents.filter((event) => event.severity === "critical")
    const blockedThreats = this.threats.filter((threat) => threat.blocked && threat.timestamp > last24Hours)

    const uniqueUsers = new Set(recentEvents.map((event) => event.userId).filter(Boolean)).size
    const suspiciousIPs = Array.from(this.suspiciousIPs.keys())

    // Calculate top threats
    const threatCounts = new Map<string, number>()
    this.threats.forEach((threat) => {
      const count = threatCounts.get(threat.type) || 0
      threatCounts.set(threat.type, count + 1)
    })

    const topThreats = Array.from(threatCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalEvents: recentEvents.length,
      criticalEvents: criticalEvents.length,
      blockedThreats: blockedThreats.length,
      uniqueUsers,
      suspiciousIPs,
      topThreats,
    }
  }

  generateSecurityReport(): {
    summary: SecurityMetrics
    recentThreats: SecurityThreat[]
    criticalEvents: SecurityEvent[]
    recommendations: string[]
  } {
    const summary = this.analyzeSecurityPosture()
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentThreats = this.threats
      .filter((threat) => threat.timestamp > last24Hours)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    const criticalEvents = this.events
      .filter((event) => event.severity === "critical" && event.timestamp > last24Hours)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    const recommendations = this.generateSecurityRecommendations(summary)

    return {
      summary,
      recentThreats,
      criticalEvents,
      recommendations,
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${randomBytes(8).toString("hex")}`
  }

  private calculateThreatSeverity(type: SecurityThreat["type"], source: string): SecurityThreat["severity"] {
    const suspiciousIP = this.suspiciousIPs.get(source)
    const baseSeverity = {
      brute_force: "high",
      sql_injection: "critical",
      xss_attempt: "high",
      csrf_attempt: "medium",
      rate_limit_exceeded: "medium",
      suspicious_pattern: "low",
    }[type] as SecurityThreat["severity"]

    // Escalate severity for repeat offenders
    if (suspiciousIP && suspiciousIP.count > this.suspiciousThreshold) {
      return "critical"
    }

    return baseSeverity
  }

  private analyzeSuspiciousActivity(event: SecurityEvent): void {
    const suspicious = this.suspiciousIPs.get(event.ipAddress) || { count: 0, lastSeen: new Date() }

    if (event.severity === "high" || event.severity === "critical") {
      suspicious.count++
      suspicious.lastSeen = new Date()
      this.suspiciousIPs.set(event.ipAddress, suspicious)
    }
  }

  private blockIP(ipAddress: string): void {
    // In a real implementation, this would integrate with a firewall or load balancer
    console.log(`🚫 Blocking IP address: ${ipAddress}`)

    // Add to blocked IPs list (would persist to database)
    this.logSecurityEvent({
      type: "admin_action",
      severity: "high",
      description: `IP address blocked due to security threat: ${ipAddress}`,
      ipAddress: "system",
      userAgent: "Security System",
    })
  }

  private cleanupOldEvents(): void {
    if (this.events.length > this.maxEventsInMemory) {
      this.events = this.events.slice(-this.maxEventsInMemory)
    }
  }

  private persistEvent(event: SecurityEvent): void {
    // In a real implementation, this would save to database
    // For now, we'll just log critical events
    if (event.severity === "critical") {
      console.error("🚨 CRITICAL SECURITY EVENT:", event)
    }
  }

  private generateSecurityRecommendations(metrics: SecurityMetrics): string[] {
    const recommendations: string[] = []

    if (metrics.criticalEvents > 5) {
      recommendations.push("High number of critical security events detected. Review and strengthen access controls.")
    }

    if (metrics.suspiciousIPs.length > 10) {
      recommendations.push("Multiple suspicious IP addresses detected. Consider implementing IP-based blocking.")
    }

    if (metrics.topThreats.some((threat) => threat.type === "brute_force" && threat.count > 5)) {
      recommendations.push("Brute force attacks detected. Implement account lockout policies and CAPTCHA.")
    }

    if (metrics.topThreats.some((threat) => threat.type === "sql_injection")) {
      recommendations.push("SQL injection attempts detected. Review and strengthen database query sanitization.")
    }

    if (recommendations.length === 0) {
      recommendations.push("Security posture is good. Continue monitoring and regular security audits.")
    }

    return recommendations
  }
}

export const securityAudit = new SecurityAuditSystem()
