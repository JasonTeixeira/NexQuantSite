"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jwtManager } from "./jwt-manager"
import { permissionManager } from "./permission-manager"
import { sessionManager } from "./session-manager"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermission?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

interface User {
  id: string
  email: string
  role: string
  permissions: string[]
  sessionId: string
}

export function AuthGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = "/login",
}: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Get token from localStorage or cookie
      const token = getStoredToken()

      if (!token) {
        handleUnauthorized()
        return
      }

      // Verify token
      const payload = await jwtManager.verifyAccessToken(token)

      if (!payload) {
        // Try to refresh token
        const refreshed = await refreshToken()
        if (!refreshed) {
          handleUnauthorized()
          return
        }
        return checkAuth() // Retry with new token
      }

      // Validate session
      const session = await sessionManager.validateSession(payload.sessionId)

      if (!session) {
        handleUnauthorized()
        return
      }

      const userData: User = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        sessionId: payload.sessionId,
      }

      setUser(userData)

      // Check authorization
      const authorized = checkAuthorization(userData)
      setIsAuthorized(authorized)

      if (!authorized && redirectTo) {
        router.push("/unauthorized")
        return
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      handleUnauthorized()
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuthorization = (userData: User): boolean => {
    // Check role requirement
    if (requiredRole && userData.role !== requiredRole) {
      // Check if user role is higher in hierarchy
      if (!permissionManager.isRoleHigherThan(userData.role, requiredRole)) {
        return false
      }
    }

    // Check permission requirement
    if (requiredPermission && !userData.permissions.includes(requiredPermission)) {
      return false
    }

    return true
  }

  const handleUnauthorized = () => {
    setUser(null)
    setIsAuthorized(false)
    setIsLoading(false)

    if (redirectTo) {
      router.push(redirectTo)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = getStoredRefreshToken()
      if (!refreshToken) return false

      const newAccessToken = await jwtManager.refreshAccessToken(refreshToken)
      if (!newAccessToken) return false

      storeToken(newAccessToken)
      return true
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }

  const getStoredToken = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
  }

  const getStoredRefreshToken = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token")
  }

  const storeToken = (token: string): void => {
    if (typeof window === "undefined") return
    localStorage.setItem("access_token", token)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !isAuthorized) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this resource.</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

// HOC for protecting components
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, "children"> = {},
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

// Hook for accessing user data
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = getStoredToken()
        if (!token) {
          setIsLoading(false)
          return
        }

        const payload = await jwtManager.verifyAccessToken(token)
        if (payload) {
          setUser({
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            permissions: payload.permissions,
            sessionId: payload.sessionId,
          })
        }
      } catch (error) {
        console.error("User check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  const getStoredToken = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      sessionStorage.removeItem("access_token")
      sessionStorage.removeItem("refresh_token")
    }
    setUser(null)
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.role === role || permissionManager.isRoleHigherThan(user.role, role)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    hasPermission,
    hasRole,
  }
}
