"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "trader" | "analyst"
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate authentication check on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check for stored session (in real app, validate with backend)
      const storedUser = localStorage.getItem("nexus-user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error("[v0] Error parsing stored user:", error)
          localStorage.removeItem("nexus-user")
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Demo users (replace with real authentication)
      const demoUsers: Record<string, User> = {
        "admin@nexus.com": {
          id: "1",
          email: "admin@nexus.com",
          name: "Admin User",
          role: "admin",
          permissions: ["all"],
        },
        "trader@nexus.com": {
          id: "2",
          email: "trader@nexus.com",
          name: "Senior Trader",
          role: "trader",
          permissions: ["trade", "view_positions", "view_analytics"],
        },
        "analyst@nexus.com": {
          id: "3",
          email: "analyst@nexus.com",
          name: "Quant Analyst",
          role: "analyst",
          permissions: ["view_analytics", "run_backtests", "view_research"],
        },
      }

      const authenticatedUser = demoUsers[email]
      if (authenticatedUser && password === "nexus123") {
        setUser(authenticatedUser)
        localStorage.setItem("nexus-user", JSON.stringify(authenticatedUser))
        console.log(`[v0] User authenticated: ${authenticatedUser.name}`)
        return true
      }

      return false
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("nexus-user")
    console.log("[v0] User logged out")
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes("all") || user.permissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
