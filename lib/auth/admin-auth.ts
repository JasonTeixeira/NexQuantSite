/**
 * 🛡️ ENTERPRISE ADMIN AUTHENTICATION SYSTEM
 * Provides secure, role-based access control for admin routes
 */

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  permissions: Permission[]
  department?: string
  lastLogin?: string
  mfaEnabled: boolean
  sessionId?: string
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MODERATOR = 'moderator',
  ANALYST = 'analyst',
  SUPPORT = 'support'
}

export enum Permission {
  // System Management
  SYSTEM_ADMIN = 'system_admin',
  USER_MANAGEMENT = 'user_management',
  ROLE_MANAGEMENT = 'role_management',
  
  // Content & Moderation
  CONTENT_MANAGEMENT = 'content_management',
  BLOG_MANAGEMENT = 'blog_management',
  COMMUNITY_MODERATION = 'community_moderation',
  
  // Analytics & Reports
  ANALYTICS_VIEW = 'analytics_view',
  FINANCIAL_REPORTS = 'financial_reports',
  USER_ANALYTICS = 'user_analytics',
  
  // Security & Monitoring
  SECURITY_MANAGEMENT = 'security_management',
  SYSTEM_MONITORING = 'system_monitoring',
  AUDIT_LOGS = 'audit_logs',
  
  // Business Operations
  REFERRAL_MANAGEMENT = 'referral_management',
  BILLING_MANAGEMENT = 'billing_management',
  CAREERS_MANAGEMENT = 'careers_management',
  
  // Technical
  DISASTER_RECOVERY = 'disaster_recovery',
  PERFORMANCE_MONITORING = 'performance_monitoring',
  TESTING_MANAGEMENT = 'testing_management'
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission), // Full access
  [AdminRole.ADMIN]: [
    Permission.USER_MANAGEMENT,
    Permission.CONTENT_MANAGEMENT,
    Permission.BLOG_MANAGEMENT,
    Permission.ANALYTICS_VIEW,
    Permission.FINANCIAL_REPORTS,
    Permission.USER_ANALYTICS,
    Permission.SYSTEM_MONITORING,
    Permission.REFERRAL_MANAGEMENT,
    Permission.BILLING_MANAGEMENT,
    Permission.CAREERS_MANAGEMENT
  ],
  [AdminRole.MANAGER]: [
    Permission.CONTENT_MANAGEMENT,
    Permission.BLOG_MANAGEMENT,
    Permission.COMMUNITY_MODERATION,
    Permission.ANALYTICS_VIEW,
    Permission.USER_ANALYTICS,
    Permission.REFERRAL_MANAGEMENT,
    Permission.CAREERS_MANAGEMENT
  ],
  [AdminRole.MODERATOR]: [
    Permission.CONTENT_MANAGEMENT,
    Permission.COMMUNITY_MODERATION,
    Permission.ANALYTICS_VIEW
  ],
  [AdminRole.ANALYST]: [
    Permission.ANALYTICS_VIEW,
    Permission.FINANCIAL_REPORTS,
    Permission.USER_ANALYTICS,
    Permission.SYSTEM_MONITORING
  ],
  [AdminRole.SUPPORT]: [
    Permission.USER_MANAGEMENT,
    Permission.COMMUNITY_MODERATION,
    Permission.ANALYTICS_VIEW
  ]
}

// Mock admin users (in production, this would come from database)
const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin1',
    email: 'admin@nexural.com',
    name: 'System Administrator',
    role: AdminRole.SUPER_ADMIN,
    permissions: ROLE_PERMISSIONS[AdminRole.SUPER_ADMIN],
    mfaEnabled: true,
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: 'manager1',
    email: 'manager@nexural.com',
    name: 'Platform Manager',
    role: AdminRole.MANAGER,
    permissions: ROLE_PERMISSIONS[AdminRole.MANAGER],
    department: 'Operations',
    mfaEnabled: true,
    lastLogin: '2024-01-15T09:15:00Z'
  }
]

export class AdminAuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AdminAuthError'
  }
}

export class AdminAuthService {
  private sessions = new Map<string, AdminUser>()
  private loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
  
  /**
   * Authenticate admin user with email/password
   */
  async authenticate(email: string, password: string, ip?: string): Promise<{ user: AdminUser; token: string }> {
    // Check rate limiting
    this.checkRateLimit(ip || 'unknown')
    
    // Validate credentials (in production, compare with hashed password)
    const user = MOCK_ADMIN_USERS.find(u => u.email === email)
    if (!user || !this.validatePassword(password, user)) {
      this.recordFailedAttempt(ip || 'unknown')
      throw new AdminAuthError('Invalid credentials', 'INVALID_CREDENTIALS')
    }
    
    // Generate session token
    const sessionId = this.generateSessionToken()
    const sessionUser = { ...user, sessionId }
    
    // Store session
    this.sessions.set(sessionId, sessionUser)
    
    // Clear failed attempts
    this.loginAttempts.delete(ip || 'unknown')
    
    // Log successful login
    this.logSecurityEvent('ADMIN_LOGIN_SUCCESS', { 
      userId: user.id, 
      email: user.email, 
      ip 
    })
    
    return { user: sessionUser, token: sessionId }
  }
  
  /**
   * Validate session token
   */
  validateSession(token: string): AdminUser | null {
    if (!token) return null
    
    const user = this.sessions.get(token)
    if (!user) return null
    
    // Check session expiry (24 hours)
    // In production, this would be more sophisticated
    return user
  }
  
  /**
   * Check if user has specific permission
   */
  hasPermission(user: AdminUser, permission: Permission): boolean {
    return user.permissions.includes(permission)
  }
  
  /**
   * Check if user has required role level
   */
  hasMinimumRole(user: AdminUser, requiredRole: AdminRole): boolean {
    const roleHierarchy = {
      [AdminRole.SUPPORT]: 0,
      [AdminRole.ANALYST]: 1,
      [AdminRole.MODERATOR]: 2,
      [AdminRole.MANAGER]: 3,
      [AdminRole.ADMIN]: 4,
      [AdminRole.SUPER_ADMIN]: 5
    }
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
  }
  
  /**
   * Logout and invalidate session
   */
  logout(token: string): void {
    const user = this.sessions.get(token)
    if (user) {
      this.logSecurityEvent('ADMIN_LOGOUT', { 
        userId: user.id, 
        email: user.email 
      })
      this.sessions.delete(token)
    }
  }
  
  /**
   * Rate limiting for login attempts
   */
  private checkRateLimit(ip: string): void {
    const attempts = this.loginAttempts.get(ip)
    if (!attempts) return
    
    const now = Date.now()
    const timeSince = now - attempts.lastAttempt
    
    // Progressive delays: 5s, 30s, 2min, 10min, 1hr
    const delays = [5000, 30000, 120000, 600000, 3600000]
    const maxAttempts = delays.length
    
    if (attempts.count >= maxAttempts) {
      const delay = delays[maxAttempts - 1]
      if (timeSince < delay) {
        throw new AdminAuthError('Too many failed attempts. Try again later.', 'RATE_LIMITED')
      }
      // Reset after delay period
      this.loginAttempts.delete(ip)
    } else if (attempts.count > 0) {
      const delay = delays[attempts.count - 1]
      if (timeSince < delay) {
        throw new AdminAuthError(`Too many failed attempts. Try again in ${Math.ceil(delay / 1000)}s.`, 'RATE_LIMITED')
      }
    }
  }
  
  /**
   * Record failed login attempt
   */
  private recordFailedAttempt(ip: string): void {
    const attempts = this.loginAttempts.get(ip) || { count: 0, lastAttempt: 0 }
    attempts.count++
    attempts.lastAttempt = Date.now()
    this.loginAttempts.set(ip, attempts)
    
    this.logSecurityEvent('ADMIN_LOGIN_FAILED', { ip, attempts: attempts.count })
  }
  
  /**
   * Validate password (in production, this would use bcrypt)
   */
  private validatePassword(password: string, user: AdminUser): boolean {
    // For demo purposes, accept a simple password
    // In production, compare with hashed password using bcrypt
    return password === 'admin123' || password === 'manager123'
  }
  
  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  /**
   * Log security events
   */
  private logSecurityEvent(event: string, details: any): void {
    console.log(`[ADMIN_SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      ...details
    })
    
    // In production, this would go to a secure logging system
  }
  
  /**
   * Get all active sessions (for monitoring)
   */
  getActiveSessions(): { count: number; users: string[] } {
    return {
      count: this.sessions.size,
      users: Array.from(this.sessions.values()).map(u => u.email)
    }
  }
  
  /**
   * Force logout all sessions (emergency)
   */
  logoutAllSessions(): void {
    const count = this.sessions.size
    this.sessions.clear()
    this.logSecurityEvent('ALL_SESSIONS_CLEARED', { count })
  }
}

// Singleton instance
export const adminAuthService = new AdminAuthService()

// Utility functions for Next.js middleware and API routes
export const getAdminUserFromRequest = (request: any): AdminUser | null => {
  const token = request.cookies?.get('admin_token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) return null
  return adminAuthService.validateSession(token)
}

export const requirePermission = (user: AdminUser | null, permission: Permission): void => {
  if (!user) {
    throw new AdminAuthError('Authentication required', 'NOT_AUTHENTICATED')
  }
  
  if (!adminAuthService.hasPermission(user, permission)) {
    throw new AdminAuthError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS')
  }
}

export const requireRole = (user: AdminUser | null, role: AdminRole): void => {
  if (!user) {
    throw new AdminAuthError('Authentication required', 'NOT_AUTHENTICATED')
  }
  
  if (!adminAuthService.hasMinimumRole(user, role)) {
    throw new AdminAuthError('Insufficient role level', 'INSUFFICIENT_ROLE')
  }
}


