"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthSession, getCurrentUser, logoutUser, refreshUserSession } from './auth-utils'

interface AuthContextType {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User, session: AuthSession) => void
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!session

  // Initialize auth state from stored session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedRefreshToken = localStorage.getItem('refresh_token')
        
        if (storedToken) {
          const currentUser = await getCurrentUser(storedToken)
          
          if (currentUser) {
            setUser(currentUser)
            setSession({
              id: 'stored_session',
              userId: currentUser.id,
              token: storedToken,
              refreshToken: storedRefreshToken || '',
              expiresAt: localStorage.getItem('session_expires') || '',
              createdAt: localStorage.getItem('session_created') || '',
              ipAddress: '127.0.0.1',
              userAgent: navigator.userAgent,
              isActive: true
            })
          } else {
            // Token invalid, clear storage
            clearAuthStorage()
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        clearAuthStorage()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const clearAuthStorage = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('session_expires')
    localStorage.removeItem('session_created')
    localStorage.removeItem('user_data')
  }

  const login = (newUser: User, newSession: any) => {
    console.log('🔐 Auth Context Login called:', { newUser, newSession })
    
    setUser(newUser)
    
    // Handle both API response format and AuthSession format
    const sessionToken = newSession.sessionToken || newSession.token
    const refreshToken = newSession.refreshToken  
    const expiresAt = newSession.expiresAt
    const createdAt = newSession.createdAt || new Date().toISOString()
    
    console.log('🔑 Extracted session data:', { sessionToken, refreshToken, expiresAt, createdAt })
    
    // Create proper session object
    const properSession: AuthSession = {
      id: 'session_' + Date.now(),
      userId: newUser.id,
      token: sessionToken,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      createdAt: createdAt,
      ipAddress: '127.0.0.1',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      isActive: true
    }
    
    setSession(properSession)
    console.log('💾 Setting session state:', properSession)
    
    // Store session data
    localStorage.setItem('auth_token', sessionToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('session_expires', expiresAt)
    localStorage.setItem('session_created', createdAt)
    localStorage.setItem('user_data', JSON.stringify(newUser))
    console.log('💾 Session data saved to localStorage')
  }

  const logout = async () => {
    try {
      if (session?.token) {
        await logoutUser(session.token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setSession(null)
      clearAuthStorage()
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
    }
  }

  const refreshSession = async (): Promise<boolean> => {
    try {
      if (!session?.refreshToken) return false

      const newSession = await refreshUserSession(session.refreshToken)
      if (newSession) {
        setSession(newSession)
        localStorage.setItem('auth_token', newSession.token)
        localStorage.setItem('refresh_token', newSession.refreshToken)
        localStorage.setItem('session_expires', newSession.expiresAt)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Session refresh failed:', error)
      return false
    }
  }

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!session || !isAuthenticated) return

    const checkSessionExpiry = () => {
      const expiresAt = new Date(session.expiresAt)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()
      
      // Refresh if less than 5 minutes remaining
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refreshSession()
      }
    }

    const interval = setInterval(checkSessionExpiry, 60 * 1000) // Check every minute
    return () => clearInterval(interval)
  }, [session, isAuthenticated])

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hook for protected routes
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect to login
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
    }
  }, [auth.isLoading, auth.isAuthenticated])

  return auth
}

// Custom hook for admin routes
export function useRequireAdmin() {
  const auth = useRequireAuth()
  
  useEffect(() => {
    if (auth.user && !['admin', 'super_admin'].includes(auth.user.role)) {
      // Redirect to dashboard or show unauthorized
      window.location.href = '/dashboard'
    }
  }, [auth.user])

  return auth
}


