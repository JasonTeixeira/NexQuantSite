// 👥 ADMIN USER MANAGEMENT API
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/verify'

// Mock user data for admin
const mockAdminUsers = [
  {
    id: 'user-1',
    email: 'admin@nexural.com',
    username: 'admin',
    role: 'admin',
    status: 'active',
    subscription: 'enterprise',
    joinedAt: '2024-01-01',
    lastLogin: new Date().toISOString(),
    stats: {
      trades: 0,
      profit: 0,
      posts: 0
    }
  },
  {
    id: 'user-2',
    email: 'john@example.com',
    username: 'john_trader',
    role: 'user',
    status: 'active',
    subscription: 'professional',
    joinedAt: '2024-01-15',
    lastLogin: '2024-01-20T10:30:00Z',
    stats: {
      trades: 234,
      profit: 12453.32,
      posts: 45
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Admin access required' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    
    let filteredUsers = [...mockAdminUsers]
    
    // Apply filters
    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.email.includes(search) || user.username.includes(search)
      )
    }
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }
    
    // Pagination
    const start = (page - 1) * limit
    const paginatedUsers = filteredUsers.slice(start, start + limit)
    
    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        total: filteredUsers.length,
        page,
        limit,
        pages: Math.ceil(filteredUsers.length / limit)
      }
    })
  } catch (error: any) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Update user (ban, role change, etc.)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Admin access required' },
        { status: 401 }
      )
    }
    
    const { userId, updates } = await request.json()
    
    // Validate dangerous operations
    if (updates.role === 'admin' || updates.role === 'super_admin') {
      // Only super_admin can promote to admin
      if (authResult.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Insufficient privileges' },
          { status: 403 }
        )
      }
    }
    
    console.log(`Admin ${authResult.userId} updated user ${userId}:`, updates)
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      userId,
      updates
    })
  } catch (error: any) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Admin access required' },
        { status: 401 }
      )
    }
    
    const { userId } = await request.json()
    
    // Cannot delete self
    if (userId === authResult.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }
    
    console.log(`Admin ${authResult.userId} deleted user ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      userId
    })
  } catch (error: any) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

