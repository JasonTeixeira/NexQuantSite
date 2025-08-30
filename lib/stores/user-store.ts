import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface User {
  id: string
  email: string
  name: string
  username: string
  avatar?: string
  role: "user" | "admin" | "super_admin"
  permissions: string[]
  plan: "free" | "pro" | "elite"
  isVerified: boolean
  twoFactorEnabled: boolean
  preferences: UserPreferences
  profile: UserProfile
  subscription?: UserSubscription
  createdAt: string
  lastLoginAt?: string
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    trading: boolean
    marketing: boolean
  }
  trading: {
    defaultRisk: number
    confirmTrades: boolean
    showPnL: boolean
  }
}

export interface UserProfile {
  bio?: string
  location?: string
  website?: string
  experience: "beginner" | "intermediate" | "advanced" | "professional"
  tradingGoals: string[]
  riskTolerance: "conservative" | "moderate" | "aggressive"
}

export interface UserSubscription {
  plan: string
  status: "active" | "canceled" | "past_due" | "unpaid"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  sessionExpiry: number | null
}

interface UserActions {
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  setSessionExpiry: (expiry: number) => void
  isSessionValid: () => boolean
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiry: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
          sessionExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          sessionExpiry: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      updatePreferences: (preferences) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                preferences: { ...state.user.preferences, ...preferences },
              }
            : null,
        })),

      updateProfile: (profile) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                profile: { ...state.user.profile, ...profile },
              }
            : null,
        })),

      setSessionExpiry: (expiry) => set({ sessionExpiry: expiry }),

      isSessionValid: () => {
        const { sessionExpiry } = get()
        return sessionExpiry ? Date.now() < sessionExpiry : false
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
)
