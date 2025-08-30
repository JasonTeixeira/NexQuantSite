/**
 * Authentication Utilities - Professional Grade
 * Handles user authentication, session management, and security
 */

import { createHash, randomBytes } from 'crypto'

// Types
export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  role: UserRole
  subscription: SubscriptionTier
  isEmailVerified: boolean
  isTwoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  loginCount: number
  referralCode: string
  referredBy?: string
  preferences: UserPreferences
  stats: UserStats
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto'
  language: string
  timezone: string
  notifications: {
    email: boolean
    browser: boolean
    mobile: boolean
    marketing: boolean
    product: boolean
    security: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    activityVisibility: 'public' | 'private' | 'friends'
    allowDirectMessages: boolean
    allowFollowing: boolean
  }
  trading: {
    riskLevel: 'conservative' | 'moderate' | 'aggressive'
    autoInvesting: boolean
    paperTradingMode: boolean
  }
}

export interface UserStats {
  totalTrades: number
  totalProfit: number
  winRate: number
  referralsCount: number
  articlesRead: number
  coursesCompleted: number
  badgesEarned: string[]
  achievementsUnlocked: string[]
}

export type UserRole = 
  | 'user'           // Regular user
  | 'premium'        // Premium subscriber  
  | 'pro'           // Professional tier
  | 'moderator'     // Community moderator
  | 'author'        // Content author
  | 'admin'         // Administrator
  | 'super_admin'   // Super administrator

export type SubscriptionTier = 
  | 'free' 
  | 'basic' 
  | 'premium' 
  | 'pro' 
  | 'enterprise'

export interface AuthSession {
  id: string
  userId: string
  token: string
  refreshToken: string
  expiresAt: string
  createdAt: string
  ipAddress: string
  userAgent: string
  isActive: boolean
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet'
    browser: string
    os: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  captchaToken?: string
}

export interface RegisterData {
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  allowMarketing?: boolean
  referralCode?: string
  captchaToken?: string
}

export interface AuthResult {
  success: boolean
  message: string
  user?: User
  session?: AuthSession
  errors?: Record<string, string>
  requiresTwoFactor?: boolean
  requiresEmailVerification?: boolean
}

// Mock Database (In production, replace with actual database)
let mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'demo@nexural.com',
    username: 'demo_user',
    firstName: 'Demo',
    lastName: 'User',
    avatar: '/placeholder.svg?height=100&width=100',
    bio: 'Demo user account for testing',
    role: 'premium',
    subscription: 'premium',
    isEmailVerified: true,
    isTwoFactorEnabled: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-01-15T10:30:00.000Z',
    loginCount: 42,
    referralCode: 'DEMO2024',
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        browser: true,
        mobile: false,
        marketing: false,
        product: true,
        security: true
      },
      privacy: {
        profileVisibility: 'public',
        activityVisibility: 'friends',
        allowDirectMessages: true,
        allowFollowing: true
      },
      trading: {
        riskLevel: 'moderate',
        autoInvesting: false,
        paperTradingMode: true
      }
    },
    stats: {
      totalTrades: 156,
      totalProfit: 2847.32,
      winRate: 0.68,
      referralsCount: 12,
      articlesRead: 89,
      coursesCompleted: 3,
      badgesEarned: ['early_adopter', 'consistent_trader', 'knowledge_seeker'],
      achievementsUnlocked: ['first_trade', 'first_profit', 'read_50_articles']
    }
  }
]

let mockSessions: AuthSession[] = []

// Utility Functions
export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha512').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(':')
  const verifyHash = createHash('sha512').update(password + salt).digest('hex')
  return hash === verifyHash
}

export const generateToken = (): string => {
  return randomBytes(32).toString('hex')
}

export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Authentication Functions
export const authenticateUser = async (credentials: LoginCredentials): Promise<AuthResult> => {
  try {
    // Input validation
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        message: 'Email and password are required',
        errors: {
          email: !credentials.email ? 'Email is required' : '',
          password: !credentials.password ? 'Password is required' : ''
        }
      }
    }

    // Find user by email
    const user = mockUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase())
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: { auth: 'Invalid credentials' }
      }
    }

    // In production, verify actual password hash
    // For demo, accept any password for demo@nexural.com
    const isValidPassword = user.email === 'demo@nexural.com' || verifyPassword(credentials.password, 'mock_hash')
    
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: { auth: 'Invalid credentials' }
      }
    }

    // Check if email verification required
    if (!user.isEmailVerified) {
      return {
        success: false,
        message: 'Please verify your email address before logging in',
        requiresEmailVerification: true
      }
    }

    // Check if 2FA required  
    if (user.isTwoFactorEnabled) {
      return {
        success: false,
        message: 'Two-factor authentication required',
        requiresTwoFactor: true,
        user: { ...user }
      }
    }

    // Create session
    const session: AuthSession = {
      id: generateToken(),
      userId: user.id,
      token: generateToken(),
      refreshToken: generateToken(),
      expiresAt: new Date(Date.now() + (credentials.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In production, get real IP
      userAgent: 'Mock User Agent',
      isActive: true,
      deviceInfo: {
        type: 'desktop',
        browser: 'Chrome',
        os: 'Windows'
      }
    }

    // Update user stats
    user.lastLoginAt = new Date().toISOString()
    user.loginCount += 1
    user.updatedAt = new Date().toISOString()

    // Store session
    mockSessions.push(session)

    return {
      success: true,
      message: 'Login successful',
      user,
      session
    }

  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred during login',
      errors: { system: 'Internal server error' }
    }
  }
}

export const registerUser = async (data: RegisterData): Promise<AuthResult> => {
  try {
    // Input validation
    const errors: Record<string, string> = {}

    if (!data.email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format'

    if (!data.username) errors.username = 'Username is required'
    else if (data.username.length < 3) errors.username = 'Username must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) errors.username = 'Username can only contain letters, numbers, and underscores'

    if (!data.firstName) errors.firstName = 'First name is required'
    if (!data.lastName) errors.lastName = 'Last name is required'

    if (!data.password) errors.password = 'Password is required'
    else if (data.password.length < 8) errors.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(data.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character'
    }

    if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    if (!data.acceptTerms) errors.acceptTerms = 'You must accept the terms of service'

    // Check for existing users
    const existingEmail = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase())
    if (existingEmail) errors.email = 'Email address is already registered'

    const existingUsername = mockUsers.find(u => u.username.toLowerCase() === data.username.toLowerCase())
    if (existingUsername) errors.username = 'Username is already taken'

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Please correct the errors below',
        errors
      }
    }

    // Create new user
    const newUser: User = {
      id: generateUserId(),
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
      subscription: 'free',
      isEmailVerified: false, // Require email verification
      isTwoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loginCount: 0,
      referralCode: generateReferralCode(),
      referredBy: data.referralCode || undefined,
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          browser: true,
          mobile: false,
          marketing: data.allowMarketing || false,
          product: true,
          security: true
        },
        privacy: {
          profileVisibility: 'public',
          activityVisibility: 'friends',
          allowDirectMessages: true,
          allowFollowing: true
        },
        trading: {
          riskLevel: 'conservative',
          autoInvesting: false,
          paperTradingMode: true
        }
      },
      stats: {
        totalTrades: 0,
        totalProfit: 0,
        winRate: 0,
        referralsCount: 0,
        articlesRead: 0,
        coursesCompleted: 0,
        badgesEarned: [],
        achievementsUnlocked: []
      }
    }

    // Add to mock database
    mockUsers.push(newUser)

    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: newUser,
      requiresEmailVerification: true
    }

  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred during registration',
      errors: { system: 'Internal server error' }
    }
  }
}

export const getCurrentUser = async (token: string): Promise<User | null> => {
  try {
    const session = mockSessions.find(s => s.token === token && s.isActive && new Date(s.expiresAt) > new Date())
    if (!session) return null

    const user = mockUsers.find(u => u.id === session.userId)
    return user || null
  } catch {
    return null
  }
}

export const updateUser = async (userId: string, updates: Partial<User>): Promise<AuthResult> => {
  try {
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      }
    }

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return {
      success: true,
      message: 'User updated successfully',
      user: mockUsers[userIndex]
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update user',
      errors: { system: 'Internal server error' }
    }
  }
}

export const logoutUser = async (token: string): Promise<boolean> => {
  try {
    const sessionIndex = mockSessions.findIndex(s => s.token === token)
    if (sessionIndex !== -1) {
      mockSessions[sessionIndex].isActive = false
    }
    return true
  } catch {
    return false
  }
}

export const refreshUserSession = async (refreshToken: string): Promise<AuthSession | null> => {
  try {
    const sessionIndex = mockSessions.findIndex(s => s.refreshToken === refreshToken && s.isActive)
    if (sessionIndex === -1) return null

    // Create new session
    const newSession: AuthSession = {
      ...mockSessions[sessionIndex],
      id: generateToken(),
      token: generateToken(),
      refreshToken: generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }

    // Deactivate old session
    mockSessions[sessionIndex].isActive = false

    // Add new session
    mockSessions.push(newSession)

    return newSession
  } catch {
    return null
  }
}

// Role and Permission Utils
export const hasRole = (user: User, role: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    premium: 2,
    pro: 3,
    moderator: 4,
    author: 5,
    admin: 8,
    super_admin: 10
  }

  return roleHierarchy[user.role] >= roleHierarchy[role]
}

export const hasPermission = (user: User, permission: string): boolean => {
  const permissions: Record<UserRole, string[]> = {
    user: ['read_content', 'create_comments'],
    premium: ['read_content', 'create_comments', 'access_premium_features'],
    pro: ['read_content', 'create_comments', 'access_premium_features', 'access_pro_features'],
    moderator: ['read_content', 'create_comments', 'moderate_comments', 'ban_users'],
    author: ['read_content', 'create_comments', 'create_articles', 'edit_own_articles'],
    admin: ['*'], // All permissions
    super_admin: ['*'] // All permissions
  }

  const userPermissions = permissions[user.role] || []
  return userPermissions.includes('*') || userPermissions.includes(permission)
}

export const canAccessAdminDashboard = (user: User): boolean => {
  return hasRole(user, 'moderator')
}

// Export all functions for testing
export const __testing__ = {
  mockUsers,
  mockSessions,
  clearMockData: () => {
    mockUsers.length = 0
    mockSessions.length = 0
  }
}


