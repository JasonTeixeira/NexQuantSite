import { create } from "zustand"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "super_admin"
  permissions: string[]
  lastLogin: string
  isActive: boolean
  createdAt: string
}

export interface SystemMetrics {
  users: {
    total: number
    active: number
    new: number
    growth: number
  }
  trading: {
    totalVolume: number
    totalTrades: number
    activeSignals: number
    botPerformance: number
  }
  revenue: {
    mrr: number
    arr: number
    churn: number
    ltv: number
  }
  system: {
    uptime: number
    responseTime: number
    errorRate: number
    cpuUsage: number
    memoryUsage: number
  }
}

export interface AdminNotification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  createdAt: string
  isRead: boolean
  actionUrl?: string
}

interface AdminState {
  currentAdmin: AdminUser | null
  users: any[]
  metrics: SystemMetrics | null
  notifications: AdminNotification[]
  isLoading: boolean
  error: string | null
  selectedUsers: string[]
  filters: {
    userStatus: "all" | "active" | "inactive"
    userPlan: "all" | "free" | "pro" | "elite"
    dateRange: string
  }
}

interface AdminActions {
  setCurrentAdmin: (admin: AdminUser) => void
  setUsers: (users: any[]) => void
  setMetrics: (metrics: SystemMetrics) => void
  addNotification: (notification: AdminNotification) => void
  markNotificationRead: (id: string) => void
  setSelectedUsers: (userIds: string[]) => void
  updateFilters: (filters: Partial<AdminState["filters"]>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAdminStore = create<AdminState & AdminActions>((set) => ({
  // State
  currentAdmin: null,
  users: [],
  metrics: null,
  notifications: [],
  isLoading: false,
  error: null,
  selectedUsers: [],
  filters: {
    userStatus: "all",
    userPlan: "all",
    dateRange: "30d",
  },

  // Actions
  setCurrentAdmin: (currentAdmin) => set({ currentAdmin }),
  setUsers: (users) => set({ users }),
  setMetrics: (metrics) => set({ metrics }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)),
    })),

  setSelectedUsers: (selectedUsers) => set({ selectedUsers }),

  updateFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
