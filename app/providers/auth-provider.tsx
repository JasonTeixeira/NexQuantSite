'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { backendConnector } from '@/lib/api/backend-connector'
import type { User } from '@/lib/database/models'

interface AuthContextValue {
  user: User | null
  loading: boolean
  authenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      // Verify token and get user profile
      const profile = await backendConnector.getUserProfile()
      setUser(profile)
      setAuthenticated(true)
    } catch (error) {
      console.error('Session check failed:', error)
      // Clear invalid tokens
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const user = await backendConnector.login(email, password)
      setUser(user)
      setAuthenticated(true)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const user = await backendConnector.register(userData)
      // After registration, user needs to verify email
      router.push('/verify-email')
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await backendConnector.logout()
    } finally {
      // Clear state regardless of API response
      setUser(null)
      setAuthenticated(false)
      router.push('/login')
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await backendConnector.updateUserProfile(updates)
      setUser(updatedUser)
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }

  const refreshSession = async () => {
    try {
      await backendConnector.refreshAccessToken()
      await checkSession()
    } catch (error) {
      console.error('Session refresh failed:', error)
      setAuthenticated(false)
      router.push('/login')
    }
  }

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!authenticated) return

    const refreshInterval = setInterval(() => {
      refreshSession()
    }, 10 * 60 * 1000) // Refresh every 10 minutes

    return () => clearInterval(refreshInterval)
  }, [authenticated])

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        authenticated,
        login,
        register,
        logout,
        updateProfile,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string
    roles?: string[]
  }
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, authenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !authenticated) {
        router.push(options?.redirectTo || '/login')
      }

      if (user && options?.roles && !options.roles.includes(user.role)) {
        router.push('/unauthorized')
      }
    }, [loading, authenticated, user])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!authenticated) {
      return null
    }

    if (options?.roles && user && !options.roles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
