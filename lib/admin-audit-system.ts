import crypto from "crypto"

export interface AuditLogEntry {
  id: string
  userId: string
  userEmail: string
  userName: string
  sessionId: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  details: any
  ipAddress: string
  userAgent: string
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
  category: "authentication" | "authorization" | "data_change" | "system" | "security" | "user_action"
  success: boolean
  errorMessage?: string
  duration?: number
  metadata?: Record<string, any>
}

export interface AuditFilter {
  userId?: string
  userEmail?: string
  action?: string
  resource?: string
  category?: string
  severity?: string
  success?: boolean
  startDate?: Date
  endDate?: Date
  ipAddress?: string
  limit?: number
  offset?: number
  sortBy?: "timestamp" | "severity" | "action"
  sortOrder?: "asc" | "desc"
}

export interface AuditStats {
  totalEntries: number
  entriesByCategory: Record<string, number>
  entriesBySeverity: Record<string, number>
  topUsers: { userId: string; userEmail: string; count: number }[]
  topActions: { action: string; count: number }[]
  failureRate: number
  recentActivity: AuditLogEntry[]
}

export class AdminAuditSystem {
  private logs: AuditLogEntry[] = []
  private maxLogEntries = 100000 // Keep last 100k entries in memory
  private retentionDays = 90 // Keep logs for 90 days

  constructor() {
    // Clean up old logs periodically
    setInterval(() => this.cleanupOldLogs(), 24 * 60 * 60 * 1000) // Daily cleanup
  }

  // Log an action
  log(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const auditEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...entry,
    }

    this.logs.push(auditEntry)

    // Keep memory usage under control
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-Math.floor(this.maxLogEntries * 0.8))
    }

    // In production, send to secure logging service
    this.sendToExternalLogging(auditEntry)

    return auditEntry
  }

  // Convenience methods for common actions
  logAuthentication(
    userId: string,
    userEmail: string,
    userName: string,
    sessionId: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    details: any = {},
  ) {
    return this.log({
      userId,
      userEmail,
      userName,
      sessionId,
      action: success ? "login_success" : "login_failed",
      resource: "authentication",
      details,
      ipAddress,
      userAgent,
      severity: success ? "low" : "medium",
      category: "authentication",
      success,
    })
  }

  logDataChange(
    userId: string,
    userEmail: string,
    userName: string,
    sessionId: string,
    resource: string,
    resourceId: string,
    oldValues: any,
    newValues: any,
    ipAddress: string,
    userAgent: string,
  ) {
    return this.log({
      userId,
      userEmail,
      userName,
      sessionId,
      action: "data_update",
      resource,
      resourceId,
      oldValues,
      newValues,
      details: { changes: this.calculateChanges(oldValues, newValues) },
      ipAddress,
      userAgent,
      severity: "medium",
      category: "data_change",
      success: true,
    })
  }

  logSecurityEvent(
    userId: string,
    userEmail: string,
    userName: string,
    sessionId: string,
    action: string,
    details: any,
    ipAddress: string,
    userAgent: string,
    severity: "medium" | "high" | "critical" = "high",
  ) {
    return this.log({
      userId,
      userEmail,
      userName,
      sessionId,
      action,
      resource: "security",
      details,
      ipAddress,
      userAgent,
      severity,
      category: "security",
      success: false,
    })
  }

  logSystemEvent(action: string, details: any, severity: "low" | "medium" | "high" = "low") {
    return this.log({
      userId: "system",
      userEmail: "system",
      userName: "System",
      sessionId: "system",
      action,
      resource: "system",
      details,
      ipAddress: "localhost",
      userAgent: "system",
      severity,
      category: "system",
      success: true,
    })
  }

  logUserAction(
    userId: string,
    userEmail: string,
    userName: string,
    sessionId: string,
    action: string,
    resource: string,
    resourceId: string | undefined,
    details: any,
    ipAddress: string,
    userAgent: string,
    success = true,
  ) {
    return this.log({
      userId,
      userEmail,
      userName,
      sessionId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      severity: "low",
      category: "user_action",
      success,
    })
  }

  // Query logs
  getLogs(filter: AuditFilter = {}): { logs: AuditLogEntry[]; total: number } {
    let filteredLogs = [...this.logs]

    // Apply filters
    if (filter.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filter.userId)
    }
    if (filter.userEmail) {
      filteredLogs = filteredLogs.filter((log) => log.userEmail.toLowerCase().includes(filter.userEmail!.toLowerCase()))
    }
    if (filter.action) {
      filteredLogs = filteredLogs.filter((log) => log.action.toLowerCase().includes(filter.action!.toLowerCase()))
    }
    if (filter.resource) {
      filteredLogs = filteredLogs.filter((log) => log.resource.toLowerCase().includes(filter.resource!.toLowerCase()))
    }
    if (filter.category) {
      filteredLogs = filteredLogs.filter((log) => log.category === filter.category)
    }
    if (filter.severity) {
      filteredLogs = filteredLogs.filter((log) => log.severity === filter.severity)
    }
    if (filter.success !== undefined) {
      filteredLogs = filteredLogs.filter((log) => log.success === filter.success)
    }
    if (filter.ipAddress) {
      filteredLogs = filteredLogs.filter((log) => log.ipAddress === filter.ipAddress)
    }
    if (filter.startDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= filter.startDate!)
    }
    if (filter.endDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= filter.endDate!)
    }

    const total = filteredLogs.length

    // Sort
    const sortBy = filter.sortBy || "timestamp"
    const sortOrder = filter.sortOrder || "desc"

    filteredLogs.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "timestamp":
          aValue = a.timestamp.getTime()
          bValue = b.timestamp.getTime()
          break
        case "severity":
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          aValue = severityOrder[a.severity]
          bValue = severityOrder[b.severity]
          break
        case "action":
          aValue = a.action
          bValue = b.action
          break
        default:
          aValue = a.timestamp.getTime()
          bValue = b.timestamp.getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Pagination
    const offset = filter.offset || 0
    const limit = filter.limit || 50
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    return { logs: paginatedLogs, total }
  }

  // Get audit statistics
  getStats(days = 30): AuditStats {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentLogs = this.logs.filter((log) => log.timestamp >= cutoffDate)

    const entriesByCategory: Record<string, number> = {}
    const entriesBySeverity: Record<string, number> = {}
    const userCounts: Record<string, { userEmail: string; count: number }> = {}
    const actionCounts: Record<string, number> = {}

    let totalFailures = 0

    recentLogs.forEach((log) => {
      // Category stats
      entriesByCategory[log.category] = (entriesByCategory[log.category] || 0) + 1

      // Severity stats
      entriesBySeverity[log.severity] = (entriesBySeverity[log.severity] || 0) + 1

      // User stats
      if (log.userId !== "system") {
        if (!userCounts[log.userId]) {
          userCounts[log.userId] = { userEmail: log.userEmail, count: 0 }
        }
        userCounts[log.userId].count++
      }

      // Action stats
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1

      // Failure stats
      if (!log.success) {
        totalFailures++
      }
    })

    const topUsers = Object.entries(userCounts)
      .map(([userId, data]) => ({ userId, userEmail: data.userEmail, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const failureRate = recentLogs.length > 0 ? (totalFailures / recentLogs.length) * 100 : 0

    const recentActivity = this.logs.slice(-20).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return {
      totalEntries: recentLogs.length,
      entriesByCategory,
      entriesBySeverity,
      topUsers,
      topActions,
      failureRate,
      recentActivity,
    }
  }

  // Export logs
  exportLogs(filter: AuditFilter = {}, format: "json" | "csv" = "json"): string {
    const { logs } = this.getLogs(filter)

    if (format === "csv") {
      const headers = [
        "ID",
        "Timestamp",
        "User ID",
        "User Email",
        "User Name",
        "Action",
        "Resource",
        "Resource ID",
        "IP Address",
        "User Agent",
        "Severity",
        "Category",
        "Success",
        "Details",
        "Old Values",
        "New Values",
      ]

      const csvRows = [
        headers.join(","),
        ...logs.map((log) =>
          [
            log.id,
            log.timestamp.toISOString(),
            log.userId,
            log.userEmail,
            log.userName,
            log.action,
            log.resource,
            log.resourceId || "",
            log.ipAddress,
            log.userAgent,
            log.severity,
            log.category,
            log.success.toString(),
            JSON.stringify(log.details).replace(/"/g, '""'),
            JSON.stringify(log.oldValues || {}).replace(/"/g, '""'),
            JSON.stringify(log.newValues || {}).replace(/"/g, '""'),
          ]
            .map((field) => `"${field}"`)
            .join(","),
        ),
      ]

      return csvRows.join("\n")
    }

    return JSON.stringify(logs, null, 2)
  }

  // Private helper methods
  private calculateChanges(oldValues: any, newValues: any): any {
    if (!oldValues || !newValues) return {}

    const changes: any = {}

    // Compare objects
    if (typeof oldValues === "object" && typeof newValues === "object") {
      const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])

      allKeys.forEach((key) => {
        if (oldValues[key] !== newValues[key]) {
          changes[key] = {
            from: oldValues[key],
            to: newValues[key],
          }
        }
      })
    }

    return changes
  }

  private cleanupOldLogs(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays)

    const initialCount = this.logs.length
    this.logs = this.logs.filter((log) => log.timestamp >= cutoffDate)

    const removedCount = initialCount - this.logs.length
    if (removedCount > 0) {
      this.logSystemEvent("audit_cleanup", { removedEntries: removedCount, cutoffDate })
    }
  }

  private sendToExternalLogging(entry: AuditLogEntry): void {
    // In production, send to external logging service like:
    // - AWS CloudWatch
    // - Elasticsearch
    // - Splunk
    // - DataDog

    // For now, just console log critical events
    if (entry.severity === "critical") {
      console.error("[CRITICAL AUDIT]", JSON.stringify(entry))
    }
  }

  // Real-time monitoring
  getRealtimeAlerts(): AuditLogEntry[] {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000)

    return this.logs.filter(
      (log) =>
        log.timestamp >= last5Minutes && (log.severity === "critical" || log.severity === "high" || !log.success),
    )
  }

  // Compliance reporting
  generateComplianceReport(startDate: Date, endDate: Date): any {
    const logs = this.logs.filter((log) => log.timestamp >= startDate && log.timestamp <= endDate)

    return {
      period: { startDate, endDate },
      totalEvents: logs.length,
      securityEvents: logs.filter((log) => log.category === "security").length,
      dataChanges: logs.filter((log) => log.category === "data_change").length,
      authenticationEvents: logs.filter((log) => log.category === "authentication").length,
      failedLogins: logs.filter((log) => log.action === "login_failed").length,
      privilegedActions: logs.filter(
        (log) => log.action.includes("delete") || log.action.includes("admin") || log.severity === "high",
      ).length,
      uniqueUsers: new Set(logs.map((log) => log.userId)).size,
      topRiskyActions: this.getTopRiskyActions(logs),
    }
  }

  private getTopRiskyActions(logs: AuditLogEntry[]): any[] {
    const riskyActions = logs.filter((log) => log.severity === "high" || log.severity === "critical" || !log.success)

    const actionCounts: Record<string, number> = {}
    riskyActions.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
    })

    return Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
}

// Export singleton instance
export const adminAuditSystem = new AdminAuditSystem()
