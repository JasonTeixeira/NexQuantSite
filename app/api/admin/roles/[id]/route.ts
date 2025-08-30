import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'
import { 
  getRoleById, 
  updateRole, 
  deleteRole,
  canManageRoles 
} from '@/lib/auth/rbac-utils'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
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

    const role = getRoleById(params.id)
    
    if (!role) {
      return NextResponse.json({
        success: false,
        message: 'Role not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      role: {
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
      }
    })

  } catch (error) {
    console.error('Get role API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
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
        message: 'Insufficient permissions to update roles'
      }, { status: 403 })
    }

    const updates = await request.json()
    
    const result = updateRole(params.id, updates, user.id)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        role: result.role
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Update role API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
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
        message: 'Insufficient permissions to delete roles'
      }, { status: 403 })
    }

    const result = deleteRole(params.id, user.id)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Delete role API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
