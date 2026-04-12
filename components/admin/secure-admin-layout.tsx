"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  sessionId: string
  loginTime: string
}

interface SecureAdminLayoutProps {
  children: React.ReactNode
}

export default function SecureAdminLayout({ children }: SecureAdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ["/admin/login"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Skip auth check for public routes
        if (isPublicRoute) {
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        if (typeof window === "undefined") {
          setIsLoading(false)
          return
        }

        const token = localStorage.getItem("adminToken")
        const userData = localStorage.getItem("adminData")

        if (!token || !userData) {
          console.log("No token or user data found, redirecting to login")
          setIsAuthenticated(false)
          setIsLoading(false)
          router.push("/admin/login")
          return
        }

        try {
          // Verify token with server
          const response = await fetch("/api/admin/verify-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              console.log("Authentication successful")
              setIsAuthenticated(true)
              setAdminUser(JSON.parse(userData))
            } else {
              throw new Error("Session verification failed")
            }
          } else {
            throw new Error(`Session verification failed: ${response.status}`)
          }
        } catch (fetchError) {
          console.error("Network error during authentication:", fetchError)
          // On network error, still allow access if we have stored data
          // This prevents issues when the API is temporarily unavailable
          try {
            const parsedUserData = JSON.parse(userData)
            setIsAuthenticated(true)
            setAdminUser(parsedUserData)
            console.log("Using cached authentication data due to network error")
          } catch (parseError) {
            throw new Error("Invalid stored user data")
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error)

        // Clear invalid tokens
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminToken")
          localStorage.removeItem("adminData")
          localStorage.removeItem("adminRefreshToken")
          localStorage.removeItem("adminCSRFToken")
        }

        setIsAuthenticated(false)

        if (!isPublicRoute) {
          router.push("/admin/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [pathname, isPublicRoute, router])

  const handleLogout = () => {
    // Clear all authentication data
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminData")
      localStorage.removeItem("adminRefreshToken")
      localStorage.removeItem("adminCSRFToken")
    }

    setIsAuthenticated(false)
    setAdminUser(null)
    router.push("/admin/login")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg">{isPublicRoute ? "Loading..." : "Verifying authentication..."}</div>
        </div>
      </div>
    )
  }

  // Public routes (like login page)
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Protected routes - require authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Authenticated - render children with admin context
  return (
    <div className="admin-layout min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-white">NEXURAL Admin Portal</h1>
            <p className="text-gray-400">Welcome back, {adminUser?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
