import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'
import { 
  getAllRoles, 
  createRole, 
  canManageRoles,
  Role 
} from '@/lib/auth/rbac-utils'

export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') 
                   || request.cookies.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    const user = await getCurrentUser(authToken)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 })
    }

    // Check permissions
    if (!canManageRoles(user)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to view roles'
      }, { status: 403 })
    }

    const roles = getAllRoles()
    
    return NextResponse.json({
      success: true,
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        level: role.level,
        isSystem: role.isSystem,
        color: role.color,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }))
    })

  } catch (error) {
    console.error('Get roles API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') 
                   || request.cookies.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    const user = await getCurrentUser(authToken)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 })
    }

    // Check permissions
    if (!canManageRoles(user)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to create roles'
      }, { status: 403 })
    }

    const roleData = await request.json()
    
    // Validate required fields
    if (!roleData.name || !roleData.displayName) {
      return NextResponse.json({
        success: false,
        message: 'Role name and display name are required'
      }, { status: 400 })
    }

    const result = createRole(roleData, user.id)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        role: result.role
      }, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Create role API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}


