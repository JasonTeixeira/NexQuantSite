// 🗄️ MOCK DATABASE CONNECTION FOR DEVELOPMENT
// Temporary mock database to allow development without PostgreSQL setup

export interface MockQueryResult<T = any> {
  rows: T[]
  rowCount: number
  command: string
  fields: any[]
  oid: number
  executionTime: number
}

// Mock user data
const mockUsers = [
  {
    id: 'user-1',
    email: 'admin@nexural.com',
    username: 'admin',
    password_hash: '$2b$12$Gj2jqTYzQLt5hpYbp10lie6y6I8vhWvMdNlCHMrTQB9WR0Td7ymvi', // admin123
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    status: 'active',  // Add status field
    email_verified: true,
    emailVerified: true,  // Both formats
    phone_verified: false,
    two_factor_enabled: false,
    subscription_tier: 'enterprise',
    subscription_status: 'active',
    referral_code: 'ADMIN001',
    preferences: {
      theme: 'dark',
      notifications: { email: true, browser: true, mobile: true, marketing: false },
      privacy: { profileVisibility: 'private', activityVisibility: 'private' },
      trading: { riskLevel: 'conservative', paperTrading: false }
    },
    stats: {
      totalTrades: 0,
      totalProfit: 0,
      winRate: 0,
      referralsCount: 0,
      articlesRead: 0,
      coursesCompleted: 0,
      badgesEarned: [],
      achievements: []
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_login_at: null,
    login_count: 0
  },
  {
    id: 'user-2', 
    email: 'test@example.com',
    username: 'testuser',
    password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewC0o7MdMmQ6e8FW', // testpass
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
    email_verified: true,
    phone_verified: false,
    two_factor_enabled: false,
    subscription_tier: 'free',
    subscription_status: 'active',
    referral_code: 'TEST001',
    preferences: {
      theme: 'dark',
      notifications: { email: true, browser: false, mobile: false, marketing: true },
      privacy: { profileVisibility: 'public', activityVisibility: 'friends' },
      trading: { riskLevel: 'moderate', paperTrading: true }
    },
    stats: {
      totalTrades: 15,
      totalProfit: 250.50,
      winRate: 0.67,
      referralsCount: 3,
      articlesRead: 12,
      coursesCompleted: 2,
      badgesEarned: ['first-trade', 'profitable-week'],
      achievements: ['early-adopter']
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_login_at: null,
    login_count: 0
  }
]

const mockSessions = []
const mockPosts = []
const mockComments = []

// Mock query execution
export const query = async <T = any>(text: string, params?: any[]): Promise<MockQueryResult<T>> => {
  const startTime = Date.now()
  console.log('🔍 Mock Query:', text.substring(0, 100) + (text.length > 100 ? '...' : ''))
  
  // Simulate query delay
  await new Promise(resolve => setTimeout(resolve, 10))
  
  let rows: any[] = []
  let command = 'SELECT'
  
  try {
    // Parse query type  
    const queryUpper = text.toUpperCase().trim()
    console.log(`🎭 Mock Query Debug: "${text.replace(/\s+/g, ' ').trim()}"`)
    console.log(`🎭 Mock Params: [${params?.map(p => typeof p === 'string' ? `"${p}"` : p).join(', ')}]`)
    
    if (queryUpper.includes('SELECT * FROM USERS WHERE EMAIL =')) {
      // Find user by email
      const email = params?.[0]
      rows = mockUsers.filter(user => user.email === email)
      console.log(`📧 Mock: Finding user by email: ${email}, found: ${rows.length}`)
    } 
    else if (queryUpper.includes('SELECT * FROM USERS WHERE USERNAME =')) {
      // Find user by username
      const username = params?.[0]
      rows = mockUsers.filter(user => user.username === username)
      console.log(`👤 Mock: Finding user by username: ${username}, found: ${rows.length}`)
    }
    else if (queryUpper.includes('SELECT * FROM USERS WHERE ID =')) {
      // Find user by ID
      const id = params?.[0]
      rows = mockUsers.filter(user => user.id === id)
      console.log(`🆔 Mock: Finding user by ID: ${id}, found: ${rows.length}`)
    }
    else if (queryUpper.includes('SELECT PASSWORD_HASH FROM USERS') && queryUpper.includes('WHERE ID =')) {
      // Get password hash by user ID
      const id = params?.[0]
      const user = mockUsers.find(user => user.id === id)
      rows = user ? [{ password_hash: user.password_hash }] : []
      console.log(`🔐 Mock: Getting password hash for ID: ${id}, found: ${rows.length}, user: ${user?.email}`)
    }
    else if (queryUpper.includes('SELECT LOCKED_UNTIL FROM USERS')) {
      // Check if user is locked
      const email = params?.[0]
      // For mock, no users are locked
      rows = []
      console.log(`🔒 Mock: Checking lock status for: ${email}, locked: false`)
    }
    else if (queryUpper.includes('UPDATE USERS SET FAILED_LOGIN_ATTEMPTS')) {
      // Handle failed login attempts
      command = 'UPDATE'
      const email = params?.[0]
      console.log(`⚠️ Mock: Recording failed login attempt for: ${email}`)
      rows = [{ affected_rows: 1 }]
    }
    else if (queryUpper.includes('UPDATE USERS SET LAST_LOGIN_AT')) {
      // Handle successful login update
      command = 'UPDATE'  
      const userId = params?.[0]
      const user = mockUsers.find(user => user.id === userId)
      if (user) {
        user.last_login_at = new Date().toISOString()
        user.login_count = (user.login_count || 0) + 1
        user.failed_login_attempts = 0  // Reset failed attempts on success
      }
      rows = [{ affected_rows: 1 }]
      console.log(`✅ Mock: Updated login time for user: ${userId} (${user?.email})`)
    }
    else if (queryUpper.includes('INSERT INTO USERS')) {
      // Create new user
      command = 'INSERT'
      const newUser = {
        id: `user-${Date.now()}`,
        email: params?.[0] || 'new@example.com',
        username: params?.[1] || 'newuser',
        password_hash: params?.[2] || 'hashedpassword',
        first_name: params?.[3] || 'New',
        last_name: params?.[4] || 'User',
        role: 'user',
        status: 'active',  // Add status field
        email_verified: true,  // Auto-verify for testing
        emailVerified: true,  // Both formats for compatibility
        phone_verified: false,
        two_factor_enabled: false,
        subscription_tier: 'free',
        subscription_status: 'active',
        failed_login_attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: null,
        login_count: 0
      }
      mockUsers.push(newUser)
      rows = [newUser]
      console.log(`✅ Mock: Created new user: ${newUser.email}`)
    }
    else if (queryUpper.includes('INSERT INTO SESSIONS') || queryUpper.includes('INSERT INTO USER_SESSIONS')) {
      // Create new session
      command = 'INSERT'
      const newSession = {
        id: `session-${Date.now()}`,
        user_id: params?.[0] || 'unknown',
        session_token: params?.[1] || 'mock-token',
        refresh_token: params?.[2] || 'mock-refresh',
        device_info: params?.[3] || 'Mock Device',
        ip_address: '127.0.0.1',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        is_active: true
      }
      mockSessions.push(newSession)
      rows = [newSession]
      console.log(`🎫 Mock: Created new session for user: ${newSession.user_id}`)
    }
    else if (queryUpper.includes('SELECT * FROM SESSIONS') || queryUpper.includes('SELECT * FROM USER_SESSIONS')) {
      // Find session
      const token = params?.[0]
      rows = mockSessions.filter(session => 
        session.session_token === token || session.refresh_token === token
      )
      console.log(`🎫 Mock: Finding session by token, found: ${rows.length}`)
    }
    else if (queryUpper.includes('COMMUNITY_POSTS')) {
      // Handle community posts queries
      if (queryUpper.includes('INSERT INTO COMMUNITY_POSTS')) {
        command = 'INSERT'
        const newPost = {
          id: `post-${Date.now()}`,
          title: params?.[0] || 'New Post',
          content: params?.[1] || 'Post content',
          author_id: params?.[2] || 'user-1',
          status: 'published',
          visibility: 'public',
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        mockPosts.push(newPost)
        rows = [newPost]
        console.log(`📝 Mock: Created new post: ${newPost.title}`)
      }
      else if (queryUpper.includes('SELECT') && queryUpper.includes('FROM COMMUNITY_POSTS')) {
        // Return mock posts with pagination
        const limit = params?.find(p => typeof p === 'number' && p <= 100) || 10
        rows = mockPosts.slice(0, limit)
        console.log(`📰 Mock: Returning ${rows.length} posts`)
      }
      else if (queryUpper.includes('COUNT(*)') && queryUpper.includes('COMMUNITY_POSTS')) {
        // Return count for pagination
        rows = [{ count: mockPosts.length }]
        console.log(`📊 Mock: Post count: ${mockPosts.length}`)
      }
    }
    else if (queryUpper.includes('COMMUNITY_COMMENTS')) {
      // Handle community comments
      if (queryUpper.includes('INSERT INTO COMMUNITY_COMMENTS')) {
        command = 'INSERT'
        const newComment = {
          id: `comment-${Date.now()}`,
          post_id: params?.[0] || 'post-1',
          content: params?.[1] || 'Comment content',
          author_id: params?.[2] || 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        mockComments.push(newComment)
        rows = [newComment]
        console.log(`💬 Mock: Created new comment`)
      }
      else if (queryUpper.includes('SELECT') && queryUpper.includes('FROM COMMUNITY_COMMENTS')) {
        rows = mockComments
        console.log(`💬 Mock: Returning ${rows.length} comments`)
      }
    }
    else if (queryUpper.includes('SELECT NOW()')) {
      // Health check query
      rows = [{ current_time: new Date().toISOString(), db_version: 'Mock Database v1.0' }]
      console.log('💚 Mock: Health check query')
    }
    else {
      // Default empty result - but handle common patterns
      if (queryUpper.includes('COUNT(*)')) {
        rows = [{ count: 0 }]
        console.log('📊 Mock: Returning count 0 for unhandled query')
      } else {
        rows = []
        console.log('📝 Mock: Unhandled query, returning empty result')
      }
    }
  } catch (error) {
    console.error('❌ Mock query error:', error)
    throw error
  }
  
  const executionTime = Date.now() - startTime
  
  return {
    rows,
    rowCount: rows.length,
    command,
    fields: [],
    oid: 0,
    executionTime
  }
}

// Mock transaction
export const transaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
  console.log('🔄 Mock: Starting transaction')
  const mockClient = { query }
  return await callback(mockClient)
}

// Mock health check
export const checkDatabaseHealth = async () => {
  return {
    healthy: true,
    latency: 5,
    connections: { total: 1, idle: 0, waiting: 0 }
  }
}

console.log('🎭 Mock database connection initialized')
