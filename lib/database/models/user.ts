// 🔐 USER MODEL - Production Database Implementation
// Replaces all mock user data with real PostgreSQL persistence

import { query, transaction, batchInsert } from '../connection'
import { createHash, randomBytes } from 'crypto'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// INTERFACES
// ============================================================================

export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  bio?: string
  phone?: string
  dateOfBirth?: Date
  country?: string
  timezone: string
  language: string
  
  // Account Status
  status: 'active' | 'suspended' | 'banned' | 'pending'
  emailVerified: boolean
  phoneVerified: boolean
  kycStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected'
  
  // Subscription & Role
  role: 'user' | 'premium' | 'pro' | 'enterprise' | 'admin' | 'super_admin'
  subscriptionTier: string
  subscriptionStatus: string
  subscriptionExpiresAt?: Date
  
  // Security
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  backupCodes?: string[]
  lastPasswordChange: Date
  failedLoginAttempts: number
  lockedUntil?: Date
  
  // Tracking
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  loginCount: number
  
  // Preferences
  preferences: {
    theme: string
    notifications: {
      email: boolean
      browser: boolean
      mobile: boolean
      marketing: boolean
    }
    privacy: {
      profileVisibility: string
      activityVisibility: string
    }
    trading: {
      riskLevel: string
      paperTrading: boolean
    }
  }
  
  // Stats
  stats: {
    totalTrades: number
    totalProfit: number
    winRate: number
    referralsCount: number
    articlesRead: number
    coursesCompleted: number
    badgesEarned: string[]
    achievements: string[]
  }
  
  // Referral
  referralCode?: string
  referredByCode?: string
}

export interface CreateUserData {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  referralCode?: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  bio?: string
  phone?: string
  dateOfBirth?: Date
  country?: string
  timezone?: string
  language?: string
  avatarUrl?: string
  preferences?: Partial<User['preferences']>
}

export interface UserSession {
  id: string
  userId: string
  sessionToken: string
  refreshToken?: string
  deviceId?: string
  deviceInfo?: any
  ipAddress?: string
  userAgent?: string
  location?: any
  expiresAt: Date
  refreshExpiresAt?: Date
  isActive: boolean
  createdAt: Date
  lastAccessed: Date
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResult {
  success: boolean
  message: string
  user?: User
  session?: UserSession
  token?: string
  requiresTwoFactor?: boolean
  requiresEmailVerification?: boolean
  errors?: Record<string, string>
}

// ============================================================================
// USER DATA ACCESS OBJECT
// ============================================================================

export class UserDAO {
  // Create new user with secure password hashing
  static async create(userData: CreateUserData): Promise<User> {
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12)
    
    // Generate unique referral code
    const referralCode = generateReferralCode()
    
    const sql = `
      INSERT INTO users (
        email, username, password_hash, first_name, last_name, 
        referral_code, referred_by_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    
    const params = [
      userData.email.toLowerCase(),
      userData.username.toLowerCase(),
      passwordHash,
      userData.firstName,
      userData.lastName,
      referralCode,
      userData.referralCode
    ]
    
    const result = await query(sql, params)
    return this.mapRowToUser(result.rows[0])
  }
  
  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = $1'
    const result = await query(sql, [email.toLowerCase()])
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null
  }
  
  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE username = $1'
    const result = await query(sql, [username.toLowerCase()])
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null
  }
  
  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = $1'
    const result = await query(sql, [id])
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null
  }
  
  // Find user by referral code
  static async findByReferralCode(referralCode: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE referral_code = $1'
    const result = await query(sql, [referralCode])
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null
  }
  
  // Update user
  static async update(id: string, updateData: UpdateUserData): Promise<User | null> {
    const setClause: string[] = []
    const params: any[] = []
    let paramIndex = 1
    
    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key)
        
        if (key === 'preferences') {
          setClause.push(`preferences = preferences || $${paramIndex}::jsonb`)
        } else {
          setClause.push(`${columnName} = $${paramIndex}`)
        }
        
        params.push(typeof value === 'object' ? JSON.stringify(value) : value)
        paramIndex++
      }
    })
    
    if (setClause.length === 0) return null
    
    params.push(id)
    const sql = `
      UPDATE users 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    const result = await query(sql, params)
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null
  }
  
  // Verify user password
  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    const sql = 'SELECT password_hash FROM users WHERE id = $1'
    const result = await query(sql, [userId])
    
    if (!result.rows[0]) return false
    
    return bcrypt.compare(password, result.rows[0].password_hash)
  }
  
  // Update password
  static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const passwordHash = await bcrypt.hash(newPassword, 12)
    
    const sql = `
      UPDATE users 
      SET password_hash = $1, last_password_change = NOW(), updated_at = NOW()
      WHERE id = $2
    `
    
    const result = await query(sql, [passwordHash, userId])
    return result.rowCount > 0
  }
  
  // Update login tracking
  static async updateLoginTracking(userId: string, ipAddress?: string): Promise<void> {
    const sql = `
      UPDATE users 
      SET last_login_at = NOW(), login_count = login_count + 1, 
          failed_login_attempts = 0, updated_at = NOW()
      WHERE id = $1
    `
    
    await query(sql, [userId])
  }
  
  // Handle failed login attempt
  static async handleFailedLogin(email: string): Promise<void> {
    const sql = `
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1,
          locked_until = CASE 
            WHEN failed_login_attempts >= 5 THEN NOW() + INTERVAL '30 minutes'
            ELSE locked_until
          END,
          updated_at = NOW()
      WHERE email = $1
    `
    
    await query(sql, [email.toLowerCase()])
  }
  
  // Check if user is locked
  static async isUserLocked(email: string): Promise<boolean> {
    const sql = `
      SELECT locked_until FROM users 
      WHERE email = $1 AND locked_until > NOW()
    `
    
    const result = await query(sql, [email.toLowerCase()])
    return result.rows.length > 0
  }
  
  // Update user stats
  static async updateStats(userId: string, stats: Partial<User['stats']>): Promise<void> {
    const sql = `
      UPDATE users 
      SET stats = stats || $1::jsonb, updated_at = NOW()
      WHERE id = $2
    `
    
    await query(sql, [JSON.stringify(stats), userId])
  }
  
  // Search users with filters and pagination
  static async search(options: {
    query?: string
    role?: string
    status?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { query: searchQuery, role, status, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = options
    
    let sql = 'SELECT * FROM users WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1
    
    // Add search filter
    if (searchQuery) {
      sql += ` AND (username ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
      params.push(`%${searchQuery}%`)
      paramIndex++
    }
    
    // Add role filter
    if (role) {
      sql += ` AND role = $${paramIndex}`
      params.push(role)
      paramIndex++
    }
    
    // Add status filter
    if (status) {
      sql += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    
    // Add sorting
    const allowedSortFields = ['created_at', 'updated_at', 'username', 'email', 'login_count']
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at'
    const validSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'
    
    sql += ` ORDER BY ${validSortBy} ${validSortOrder}`
    
    // Add pagination
    const offset = (page - 1) * limit
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)
    
    // Get total count for pagination
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)')
      .replace(/ORDER BY .+ (ASC|DESC)/, '')
      .replace(/LIMIT .+ OFFSET .+/, '')
    
    const [dataResult, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2)) // Remove limit/offset params for count
    ])
    
    return {
      users: dataResult.rows.map(row => this.mapRowToUser(row)),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    }
  }
  
  // Get user activity stats
  static async getUserActivityStats(userId: string, days: number = 30) {
    const sql = `
      SELECT 
        COUNT(CASE WHEN ue.event_type = 'login' THEN 1 END) as login_count,
        COUNT(CASE WHEN ue.event_type = 'post_created' THEN 1 END) as posts_created,
        COUNT(CASE WHEN ue.event_type = 'comment_created' THEN 1 END) as comments_created,
        COUNT(CASE WHEN ue.event_type = 'strategy_purchased' THEN 1 END) as strategies_purchased,
        COUNT(CASE WHEN ue.event_type = 'course_completed' THEN 1 END) as courses_completed
      FROM user_events ue
      WHERE ue.user_id = $1 AND ue.created_at >= NOW() - INTERVAL '${days} days'
    `
    
    const result = await query(sql, [userId])
    return result.rows[0] || {
      login_count: 0,
      posts_created: 0,
      comments_created: 0,
      strategies_purchased: 0,
      courses_completed: 0
    }
  }
  
  // Soft delete user (set status to deleted instead of removing)
  static async softDelete(userId: string): Promise<boolean> {
    const sql = `
      UPDATE users 
      SET status = 'banned', updated_at = NOW()
      WHERE id = $1
    `
    
    const result = await query(sql, [userId])
    return result.rowCount > 0
  }
  
  // Helper method to map database row to User interface
  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      phone: row.phone,
      dateOfBirth: row.date_of_birth,
      country: row.country,
      timezone: row.timezone || 'UTC',
      language: row.language || 'en',
      status: row.status,
      emailVerified: row.email_verified,
      phoneVerified: row.phone_verified,
      kycStatus: row.kyc_status,
      role: row.role,
      subscriptionTier: row.subscription_tier,
      subscriptionStatus: row.subscription_status,
      subscriptionExpiresAt: row.subscription_expires_at,
      twoFactorEnabled: row.two_factor_enabled,
      twoFactorSecret: row.two_factor_secret,
      backupCodes: row.backup_codes,
      lastPasswordChange: row.last_password_change,
      failedLoginAttempts: row.failed_login_attempts,
      lockedUntil: row.locked_until,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      loginCount: row.login_count,
      preferences: row.preferences || {
        theme: 'dark',
        notifications: { email: true, browser: true, mobile: false, marketing: false },
        privacy: { profileVisibility: 'public', activityVisibility: 'public' },
        trading: { riskLevel: 'moderate', paperTrading: true }
      },
      stats: row.stats || {
        totalTrades: 0,
        totalProfit: 0,
        winRate: 0,
        referralsCount: 0,
        articlesRead: 0,
        coursesCompleted: 0,
        badgesEarned: [],
        achievements: []
      },
      referralCode: row.referral_code,
      referredByCode: row.referred_by_code
    }
  }
  
  // Helper to convert camelCase to snake_case
  private static camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export class SessionDAO {
  // Create new session
  static async create(userId: string, sessionData: {
    deviceId?: string
    deviceInfo?: any
    ipAddress?: string
    userAgent?: string
    location?: any
    expiresAt: Date
    rememberMe?: boolean
  }): Promise<UserSession> {
    const sessionToken = generateSecureToken()
    const refreshToken = generateSecureToken()
    const refreshExpiresAt = new Date(Date.now() + (sessionData.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000)
    
    const sql = `
      INSERT INTO user_sessions (
        user_id, session_token, refresh_token, device_id, device_info,
        ip_address, user_agent, location, expires_at, refresh_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `
    
    const params = [
      userId,
      sessionToken,
      refreshToken,
      sessionData.deviceId,
      sessionData.deviceInfo ? JSON.stringify(sessionData.deviceInfo) : null,
      sessionData.ipAddress,
      sessionData.userAgent,
      sessionData.location ? JSON.stringify(sessionData.location) : null,
      sessionData.expiresAt,
      refreshExpiresAt
    ]
    
    const result = await query(sql, params)
    return this.mapRowToSession(result.rows[0])
  }
  
  // Find session by token
  static async findByToken(sessionToken: string): Promise<UserSession | null> {
    const sql = `
      SELECT * FROM user_sessions 
      WHERE session_token = $1 AND is_active = true AND expires_at > NOW()
    `
    
    const result = await query(sql, [sessionToken])
    return result.rows[0] ? this.mapRowToSession(result.rows[0]) : null
  }
  
  // Update last accessed time
  static async updateLastAccessed(sessionId: string): Promise<void> {
    const sql = 'UPDATE user_sessions SET last_accessed = NOW() WHERE id = $1'
    await query(sql, [sessionId])
  }
  
  // Invalidate session
  static async invalidate(sessionToken: string): Promise<boolean> {
    const sql = 'UPDATE user_sessions SET is_active = false WHERE session_token = $1'
    const result = await query(sql, [sessionToken])
    return result.rowCount > 0
  }
  
  // Invalidate all user sessions
  static async invalidateAllUserSessions(userId: string): Promise<number> {
    const sql = 'UPDATE user_sessions SET is_active = false WHERE user_id = $1'
    const result = await query(sql, [userId])
    return result.rowCount
  }
  
  // Get user sessions
  static async getUserSessions(userId: string): Promise<UserSession[]> {
    const sql = `
      SELECT * FROM user_sessions 
      WHERE user_id = $1 AND is_active = true 
      ORDER BY last_accessed DESC
    `
    
    const result = await query(sql, [userId])
    return result.rows.map(row => this.mapRowToSession(row))
  }
  
  // Clean expired sessions
  static async cleanExpiredSessions(): Promise<number> {
    const sql = `
      UPDATE user_sessions 
      SET is_active = false 
      WHERE expires_at <= NOW() OR refresh_expires_at <= NOW()
    `
    
    const result = await query(sql)
    return result.rowCount
  }
  
  private static mapRowToSession(row: any): UserSession {
    return {
      id: row.id,
      userId: row.user_id,
      sessionToken: row.session_token,
      refreshToken: row.refresh_token,
      deviceId: row.device_id,
      deviceInfo: row.device_info,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      location: row.location,
      expiresAt: row.expires_at,
      refreshExpiresAt: row.refresh_expires_at,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastAccessed: row.last_accessed
    }
  }
}

// ============================================================================
// AUTHENTICATION SERVICE (Production Implementation)
// ============================================================================

export class AuthService {
  // Authenticate user with email/password
  static async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
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
      
      // Check if user is locked
      const isLocked = await UserDAO.isUserLocked(credentials.email)
      if (isLocked) {
        return {
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts',
          errors: { auth: 'Account locked' }
        }
      }
      
      // Find user
      const user = await UserDAO.findByEmail(credentials.email)
      if (!user) {
        await UserDAO.handleFailedLogin(credentials.email)
        return {
          success: false,
          message: 'Invalid email or password',
          errors: { auth: 'Invalid credentials' }
        }
      }
      
      // Verify password
      const isValidPassword = await UserDAO.verifyPassword(user.id, credentials.password)
      if (!isValidPassword) {
        await UserDAO.handleFailedLogin(credentials.email)
        return {
          success: false,
          message: 'Invalid email or password',
          errors: { auth: 'Invalid credentials' }
        }
      }
      
      // Check account status
      if (user.status !== 'active') {
        return {
          success: false,
          message: `Account is ${user.status}`,
          errors: { status: `Account ${user.status}` }
        }
      }
      
      // Check email verification
      if (!user.emailVerified) {
        return {
          success: false,
          message: 'Please verify your email address',
          requiresEmailVerification: true
        }
      }
      
      // Check 2FA
      if (user.twoFactorEnabled) {
        return {
          success: false,
          message: 'Two-factor authentication required',
          requiresTwoFactor: true,
          user
        }
      }
      
      // Create session
      const expiresAt = new Date(Date.now() + (credentials.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000)
      const session = await SessionDAO.create(user.id, {
        expiresAt,
        rememberMe: credentials.rememberMe
      })
      
      // Update login tracking
      await UserDAO.updateLoginTracking(user.id)
      
      return {
        success: true,
        message: 'Login successful',
        user,
        session,
        token: session.sessionToken
      }
      
    } catch (error) {
      console.error('Authentication error:', error)
      return {
        success: false,
        message: 'Authentication failed',
        errors: { system: 'Internal server error' }
      }
    }
  }
  
  // Register new user
  static async register(userData: CreateUserData): Promise<AuthResult> {
    try {
      // Validation
      const validation = this.validateRegistrationData(userData)
      if (!validation.valid) {
        return {
          success: false,
          message: 'Invalid registration data',
          errors: validation.errors
        }
      }
      
      // Check if email exists
      const existingEmail = await UserDAO.findByEmail(userData.email)
      if (existingEmail) {
        return {
          success: false,
          message: 'Email already registered',
          errors: { email: 'Email already in use' }
        }
      }
      
      // Check if username exists
      const existingUsername = await UserDAO.findByUsername(userData.username)
      if (existingUsername) {
        return {
          success: false,
          message: 'Username already taken',
          errors: { username: 'Username already taken' }
        }
      }
      
      // Create user
      const user = await UserDAO.create(userData)
      
      return {
        success: true,
        message: 'Registration successful',
        user
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: 'Registration failed',
        errors: { system: 'Internal server error' }
      }
    }
  }
  
  // Validate session token
  static async validateToken(token: string): Promise<{ valid: boolean; user?: User; session?: UserSession }> {
    try {
      const session = await SessionDAO.findByToken(token)
      if (!session) {
        return { valid: false }
      }
      
      const user = await UserDAO.findById(session.userId)
      if (!user || user.status !== 'active') {
        await SessionDAO.invalidate(token)
        return { valid: false }
      }
      
      // Update last accessed
      await SessionDAO.updateLastAccessed(session.id)
      
      return { valid: true, user, session }
    } catch (error) {
      console.error('Token validation error:', error)
      return { valid: false }
    }
  }
  
  // Logout user
  static async logout(token: string): Promise<boolean> {
    try {
      return await SessionDAO.invalidate(token)
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }
  
  private static validateRegistrationData(data: CreateUserData): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}
    
    // Email validation
    if (!data.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format'
    }
    
    // Username validation
    if (!data.username) {
      errors.username = 'Username is required'
    } else if (data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }
    
    // Password validation
    if (!data.password) {
      errors.password = 'Password is required'
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number'
    }
    
    return { valid: Object.keys(errors).length === 0, errors }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate secure token
function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

// Generate referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Export everything
export default {
  UserDAO,
  SessionDAO,
  AuthService,
  generateSecureToken,
  generateReferralCode
}

