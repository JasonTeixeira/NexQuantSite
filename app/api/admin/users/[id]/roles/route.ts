import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'
import { 
  getUserRoles, 
  assignRole, 
  revokeRole,
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
        message: 'Insufficient permissions to view user roles'
      }, { status: 403 })
    }

    const userRoles = getUserRoles(params.id)
    
    return NextResponse.json({
      success: true,
      roles: userRoles.map(role => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        level: role.level,
        isSystem: role.isSystem,
        color: role.color
      }))
    })

  } catch (error) {
    console.error('Get user roles API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
        message: 'Insufficient permissions to assign roles'
      }, { status: 403 })
    }

    const { roleId, expiresAt } = await request.json()
    
    if (!roleId) {
      return NextResponse.json({
        success: false,
        message: 'Role ID is required'
      }, { status: 400 })
    }

    const result = assignRole(params.id, roleId, user.id, expiresAt)
    
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
    console.error('Assign role API error:', error)
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
        message: 'Insufficient permissions to revoke roles'
      }, { status: 403 })
    }

    const { roleId } = await request.json()
    
    if (!roleId) {
      return NextResponse.json({
        success: false,
        message: 'Role ID is required'
      }, { status: 400 })
    }

    const result = revokeRole(params.id, roleId, user.id)
    
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
    console.error('Revoke role API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
