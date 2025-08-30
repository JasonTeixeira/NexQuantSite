import { apiClient } from "@/lib/api/client"
import { useAdminStore } from "@/lib/stores/admin-store"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  status: "active" | "inactive" | "suspended"
  lastLogin: string
  createdAt: string
  subscription?: {
    plan: string
    status: string
    expiresAt: string
  }
  stats: {
    totalTrades: number
    totalPnL: number
    winRate: number
  }
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  systemHealth: "healthy" | "warning" | "critical"
  uptime: number
  responseTime: number
  errorRate: number
  serverLoad: number
  memoryUsage: number
  diskUsage: number
}

export interface AdminNotification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

class AdminService {
  async getUsers(params?: {
    search?: string
    role?: string
    status?: string
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<{ users: AdminUser[]; total: number }> {
    const response = await apiClient.get<{ users: AdminUser[]; total: number }>("/admin/users", {
      headers: { "X-Query-Params": JSON.stringify(params) },
    })

    // Update admin store
    const adminStore = useAdminStore.getState()
    adminStore.setUsers(response.data.users)

    return response.data
  }

  async getUser(id: string): Promise<AdminUser> {
    const response = await apiClient.get<AdminUser>(`/admin/users/${id}`)
    return response.data
  }

  async updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const response = await apiClient.put<AdminUser>(`/admin/users/${id}`, updates)

    // Update admin store
    const adminStore = useAdminStore.getState()
    const updatedUsers = adminStore.users.map(user => user.id === id ? response.data : user)
    adminStore.setUsers(updatedUsers)

    return response.data
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/admin/users/${id}`)

    // Update admin store
    const adminStore = useAdminStore.getState()
    const currentUsers = adminStore.users
    adminStore.setUsers(currentUsers.filter((user) => user.id !== id))

    return response.data
  }

  async bulkUpdateUsers(userIds: string[], updates: Partial<AdminUser>): Promise<{ message: string; updated: number }> {
    const response = await apiClient.put<{ message: string; updated: number }>("/admin/users/bulk", {
      userIds,
      updates,
    })
    return response.data
  }

  async getMetrics(timeframe?: "1h" | "24h" | "7d" | "30d"): Promise<SystemMetrics> {
    const response = await apiClient.get<SystemMetrics>("/admin/metrics", {
      headers: { "X-Timeframe": timeframe || "24h" },
    })

    // Update admin store
    const adminStore = useAdminStore.getState()
    adminStore.setMetrics(response.data as any)

    return response.data
  }

  async getAnalytics(params: {
    startDate: string
    endDate: string
    metrics: string[]
  }): Promise<{
    userGrowth: Array<{ date: string; users: number; active: number }>
    revenue: Array<{ date: string; amount: number; subscriptions: number }>
    trading: Array<{ date: string; signals: number; trades: number; volume: number }>
  }> {
    const response = await apiClient.post<{
      userGrowth: Array<{ date: string; users: number; active: number }>
      revenue: Array<{ date: string; amount: number; subscriptions: number }>
      trading: Array<{ date: string; signals: number; trades: number; volume: number }>
    }>("/admin/analytics", params)

    return response.data
  }

  async getNotifications(params?: {
    type?: string
    read?: boolean
    limit?: number
    offset?: number
  }): Promise<AdminNotification[]> {
    const response = await apiClient.get<AdminNotification[]>("/admin/notifications", {
      headers: { "X-Query-Params": JSON.stringify(params) },
    })

    // Update admin store
    const adminStore = useAdminStore.getState()
    adminStore.notifications = response.data as any

    return response.data
  }

  async markNotificationRead(id: string): Promise<void> {
    await apiClient.put(`/admin/notifications/${id}/read`)

    // Update admin store
    const adminStore = useAdminStore.getState()
    adminStore.markNotificationRead(id)
  }

  async createSignal(signal: {
    symbol: string
    type: "buy" | "sell"
    price: number
    confidence: number
    reasoning: string
  }): Promise<{ message: string; signalId: string }> {
    const response = await apiClient.post<{ message: string; signalId: string }>("/admin/signals", signal)
    return response.data
  }

  async getSystemLogs(params?: {
    level?: "info" | "warn" | "error"
    service?: string
    limit?: number
    offset?: number
  }): Promise<
    Array<{
      id: string
      level: string
      message: string
      service: string
      timestamp: string
      metadata?: any
    }>
  > {
    const response = await apiClient.get<
      Array<{
        id: string
        level: string
        message: string
        service: string
        timestamp: string
        metadata?: any
      }>
    >("/admin/logs", {
      headers: { "X-Query-Params": JSON.stringify(params) },
    })

    return response.data
  }

  async updateSystemSettings(settings: Record<string, any>): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>("/admin/settings", settings)
    return response.data
  }

  async getSystemSettings(): Promise<Record<string, any>> {
    const response = await apiClient.get<Record<string, any>>("/admin/settings")
    return response.data
  }

  async exportData(type: "users" | "trades" | "signals", format: "csv" | "json"): Promise<{ downloadUrl: string }> {
    const response = await apiClient.post<{ downloadUrl: string }>("/admin/export", { type, format })
    return response.data
  }

  async runSystemCheck(): Promise<{
    status: "healthy" | "warning" | "critical"
    checks: Array<{
      name: string
      status: "pass" | "fail" | "warning"
      message: string
      details?: any
    }>
  }> {
    const response = await apiClient.post<{
      status: "healthy" | "warning" | "critical"
      checks: Array<{
        name: string
        status: "pass" | "fail" | "warning"
        message: string
        details?: any
      }>
    }>("/admin/system-check")

    return response.data
  }
}

export const adminService = new AdminService()
