/**
 * Role-Based Access Control (RBAC) System - Professional Grade
 * Handles user roles, permissions, and access control
 */

import { User, UserRole } from './auth-utils'

export interface Permission {
  id: string
  name: string
  description: string
  category: PermissionCategory
  level: PermissionLevel
}

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
  level: number
  isSystem: boolean // Cannot be deleted
  color: string
  createdAt: string
  updatedAt: string
}

export interface RoleAssignment {
  userId: string
  roleId: string
  assignedBy: string
  assignedAt: string
  expiresAt?: string
  isActive: boolean
  reason?: string
}

export type PermissionCategory = 
  | 'user_management'
  | 'content_management' 
  | 'financial_management'
  | 'system_administration'
  | 'analytics_reporting'
  | 'security_compliance'
  | 'community_moderation'
  | 'api_access'

export type PermissionLevel = 
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'

// Comprehensive Permission System
export const PERMISSIONS: Record<string, Permission> = {
  // User Management
  'users.read': {
    id: 'users.read',
    name: 'View Users',
    description: 'View user profiles and basic information',
    category: 'user_management',
    level: 'read'
  },
  'users.write': {
    id: 'users.write',
    name: 'Edit Users',
    description: 'Edit user profiles and settings',
    category: 'user_management',
    level: 'write'
  },
  'users.delete': {
    id: 'users.delete',
    name: 'Delete Users',
    description: 'Delete user accounts',
    category: 'user_management',
    level: 'delete'
  },
  'users.roles': {
    id: 'users.roles',
    name: 'Manage User Roles',
    description: 'Assign and manage user roles',
    category: 'user_management',
    level: 'admin'
  },

  // Content Management
  'content.read': {
    id: 'content.read',
    name: 'View Content',
    description: 'View all content including drafts',
    category: 'content_management',
    level: 'read'
  },
  'content.write': {
    id: 'content.write',
    name: 'Create/Edit Content',
    description: 'Create and edit blog posts, articles, and pages',
    category: 'content_management',
    level: 'write'
  },
  'content.publish': {
    id: 'content.publish',
    name: 'Publish Content',
    description: 'Publish and unpublish content',
    category: 'content_management',
    level: 'admin'
  },
  'content.delete': {
    id: 'content.delete',
    name: 'Delete Content',
    description: 'Delete content permanently',
    category: 'content_management',
    level: 'delete'
  },

  // Financial Management
  'finance.read': {
    id: 'finance.read',
    name: 'View Financial Data',
    description: 'View revenue, subscriptions, and financial reports',
    category: 'financial_management',
    level: 'read'
  },
  'finance.write': {
    id: 'finance.write',
    name: 'Manage Billing',
    description: 'Manage subscriptions and billing settings',
    category: 'financial_management',
    level: 'write'
  },
  'finance.refunds': {
    id: 'finance.refunds',
    name: 'Process Refunds',
    description: 'Process refunds and billing disputes',
    category: 'financial_management',
    level: 'admin'
  },

  // System Administration
  'system.settings': {
    id: 'system.settings',
    name: 'System Settings',
    description: 'Access and modify system settings',
    category: 'system_administration',
    level: 'admin'
  },
  'system.logs': {
    id: 'system.logs',
    name: 'View System Logs',
    description: 'Access system logs and audit trails',
    category: 'system_administration',
    level: 'read'
  },
  'system.maintenance': {
    id: 'system.maintenance',
    name: 'System Maintenance',
    description: 'Perform system maintenance and updates',
    category: 'system_administration',
    level: 'admin'
  },

  // Analytics & Reporting
  'analytics.read': {
    id: 'analytics.read',
    name: 'View Analytics',
    description: 'View user analytics and platform statistics',
    category: 'analytics_reporting',
    level: 'read'
  },
  'analytics.export': {
    id: 'analytics.export',
    name: 'Export Reports',
    description: 'Export analytics and generate reports',
    category: 'analytics_reporting',
    level: 'write'
  },

  // Security & Compliance
  'security.audit': {
    id: 'security.audit',
    name: 'Security Auditing',
    description: 'Access security logs and audit trails',
    category: 'security_compliance',
    level: 'read'
  },
  'security.manage': {
    id: 'security.manage',
    name: 'Security Management',
    description: 'Manage security settings and policies',
    category: 'security_compliance',
    level: 'admin'
  },

  // Community Moderation
  'community.moderate': {
    id: 'community.moderate',
    name: 'Moderate Community',
    description: 'Moderate comments, posts, and user interactions',
    category: 'community_moderation',
    level: 'write'
  },
  'community.ban': {
    id: 'community.ban',
    name: 'Ban Users',
    description: 'Ban or suspend users from the platform',
    category: 'community_moderation',
    level: 'admin'
  },

  // API Access
  'api.read': {
    id: 'api.read',
    name: 'Read API Access',
    description: 'Access read-only API endpoints',
    category: 'api_access',
    level: 'read'
  },
  'api.write': {
    id: 'api.write',
    name: 'Write API Access',
    description: 'Access write API endpoints',
    category: 'api_access',
    level: 'write'
  }
}

// Default Role Definitions
export const DEFAULT_ROLES: Record<string, Role> = {
  'super_admin': {
    id: 'super_admin',
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.keys(PERMISSIONS),
    level: 10,
    isSystem: true,
    color: 'red',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'admin': {
    id: 'admin',
    name: 'admin', 
    displayName: 'Administrator',
    description: 'Administrative access with most permissions',
    permissions: [
      'users.read', 'users.write', 'users.roles',
      'content.read', 'content.write', 'content.publish', 'content.delete',
      'finance.read', 'finance.write',
      'analytics.read', 'analytics.export',
      'community.moderate', 'community.ban',
      'system.logs', 'security.audit'
    ],
    level: 8,
    isSystem: true,
    color: 'purple',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'moderator': {
    id: 'moderator',
    name: 'moderator',
    displayName: 'Moderator',
    description: 'Community moderation and basic user management',
    permissions: [
      'users.read',
      'content.read', 'content.write',
      'community.moderate',
      'analytics.read'
    ],
    level: 4,
    isSystem: true,
    color: 'blue',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'author': {
    id: 'author',
    name: 'author',
    displayName: 'Content Author',
    description: 'Create and manage own content',
    permissions: [
      'content.read', 'content.write'
    ],
    level: 3,
    isSystem: true,
    color: 'green',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'premium': {
    id: 'premium',
    name: 'premium',
    displayName: 'Premium User',
    description: 'Premium subscription with enhanced features',
    permissions: [
      'api.read'
    ],
    level: 2,
    isSystem: true,
    color: 'yellow',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'user': {
    id: 'user',
    name: 'user',
    displayName: 'Regular User', 
    description: 'Basic user with standard permissions',
    permissions: [],
    level: 1,
    isSystem: true,
    color: 'gray',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
}

// Mock database
let mockRoles: Role[] = Object.values(DEFAULT_ROLES)
let mockRoleAssignments: RoleAssignment[] = []

// RBAC Utility Functions
export const getAllRoles = (): Role[] => {
  return mockRoles.sort((a, b) => b.level - a.level)
}

export const getRoleById = (roleId: string): Role | null => {
  return mockRoles.find(role => role.id === roleId) || null
}

export const getRoleByName = (roleName: string): Role | null => {
  return mockRoles.find(role => role.name === roleName) || null
}

export const getUserRoles = (userId: string): Role[] => {
  const assignments = mockRoleAssignments.filter(
    assignment => assignment.userId === userId && 
    assignment.isActive &&
    (!assignment.expiresAt || new Date(assignment.expiresAt) > new Date())
  )
  
  return assignments
    .map(assignment => getRoleById(assignment.roleId))
    .filter(role => role !== null) as Role[]
}

export const getUserPermissions = (userId: string): Permission[] => {
  const userRoles = getUserRoles(userId)
  const permissionIds = new Set<string>()
  
  userRoles.forEach(role => {
    role.permissions.forEach(permissionId => {
      permissionIds.add(permissionId)
    })
  })
  
  return Array.from(permissionIds)
    .map(permissionId => PERMISSIONS[permissionId])
    .filter(permission => permission !== undefined)
}

export const hasPermission = (user: User, permissionId: string): boolean => {
  const userPermissions = getUserPermissions(user.id)
  return userPermissions.some(permission => permission.id === permissionId)
}

export const hasAnyPermission = (user: User, permissionIds: string[]): boolean => {
  return permissionIds.some(permissionId => hasPermission(user, permissionId))
}

export const hasAllPermissions = (user: User, permissionIds: string[]): boolean => {
  return permissionIds.every(permissionId => hasPermission(user, permissionId))
}

export const canAccessAdminDashboard = (user: User): boolean => {
  const adminRoles = ['super_admin', 'admin', 'moderator']
  return adminRoles.includes(user.role)
}

export const canManageUsers = (user: User): boolean => {
  return hasAnyPermission(user, ['users.write', 'users.delete', 'users.roles'])
}

export const canManageRoles = (user: User): boolean => {
  return hasPermission(user, 'users.roles')
}

// Role Management Functions
export const createRole = (roleData: Partial<Role>, createdBy: string): { success: boolean, message: string, role?: Role } => {
  try {
    // Validation
    if (!roleData.name || !roleData.displayName) {
      return { success: false, message: 'Role name and display name are required' }
    }

    // Check for duplicate name
    if (mockRoles.some(role => role.name === roleData.name)) {
      return { success: false, message: 'Role name already exists' }
    }

    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: roleData.name,
      displayName: roleData.displayName,
      description: roleData.description || '',
      permissions: roleData.permissions || [],
      level: roleData.level || 1,
      isSystem: false,
      color: roleData.color || 'gray',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockRoles.push(newRole)
    
    return { success: true, message: 'Role created successfully', role: newRole }
  } catch (error) {
    return { success: false, message: 'Failed to create role' }
  }
}

export const updateRole = (roleId: string, updates: Partial<Role>, updatedBy: string): { success: boolean, message: string, role?: Role } => {
  try {
    const roleIndex = mockRoles.findIndex(role => role.id === roleId)
    if (roleIndex === -1) {
      return { success: false, message: 'Role not found' }
    }

    const existingRole = mockRoles[roleIndex]
    
    // Prevent updating system roles beyond permissions
    if (existingRole.isSystem && updates.name && updates.name !== existingRole.name) {
      return { success: false, message: 'Cannot modify system role name' }
    }

    mockRoles[roleIndex] = {
      ...existingRole,
      ...updates,
      id: existingRole.id, // Never allow ID changes
      isSystem: existingRole.isSystem, // Never allow system flag changes
      updatedAt: new Date().toISOString()
    }

    return { success: true, message: 'Role updated successfully', role: mockRoles[roleIndex] }
  } catch (error) {
    return { success: false, message: 'Failed to update role' }
  }
}

export const deleteRole = (roleId: string, deletedBy: string): { success: boolean, message: string } => {
  try {
    const roleIndex = mockRoles.findIndex(role => role.id === roleId)
    if (roleIndex === -1) {
      return { success: false, message: 'Role not found' }
    }

    const role = mockRoles[roleIndex]
    
    // Prevent deleting system roles
    if (role.isSystem) {
      return { success: false, message: 'Cannot delete system roles' }
    }

    // Check if role is assigned to any users
    const assignedUsers = mockRoleAssignments.filter(
      assignment => assignment.roleId === roleId && assignment.isActive
    )
    
    if (assignedUsers.length > 0) {
      return { success: false, message: `Cannot delete role assigned to ${assignedUsers.length} user(s)` }
    }

    mockRoles.splice(roleIndex, 1)
    
    return { success: true, message: 'Role deleted successfully' }
  } catch (error) {
    return { success: false, message: 'Failed to delete role' }
  }
}

// Role Assignment Functions
export const assignRole = (userId: string, roleId: string, assignedBy: string, expiresAt?: string): { success: boolean, message: string } => {
  try {
    // Check if role exists
    const role = getRoleById(roleId)
    if (!role) {
      return { success: false, message: 'Role not found' }
    }

    // Check for existing active assignment
    const existingAssignment = mockRoleAssignments.find(
      assignment => assignment.userId === userId && 
      assignment.roleId === roleId && 
      assignment.isActive
    )

    if (existingAssignment) {
      return { success: false, message: 'User already has this role' }
    }

    const newAssignment: RoleAssignment = {
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date().toISOString(),
      expiresAt,
      isActive: true
    }

    mockRoleAssignments.push(newAssignment)
    
    return { success: true, message: 'Role assigned successfully' }
  } catch (error) {
    return { success: false, message: 'Failed to assign role' }
  }
}

export const revokeRole = (userId: string, roleId: string, revokedBy: string): { success: boolean, message: string } => {
  try {
    const assignmentIndex = mockRoleAssignments.findIndex(
      assignment => assignment.userId === userId && 
      assignment.roleId === roleId && 
      assignment.isActive
    )

    if (assignmentIndex === -1) {
      return { success: false, message: 'Role assignment not found' }
    }

    mockRoleAssignments[assignmentIndex].isActive = false
    
    return { success: true, message: 'Role revoked successfully' }
  } catch (error) {
    return { success: false, message: 'Failed to revoke role' }
  }
}

// Permission utilities
export const getPermissionsByCategory = (category: PermissionCategory): Permission[] => {
  return Object.values(PERMISSIONS).filter(permission => permission.category === category)
}

export const getAllPermissions = (): Permission[] => {
  return Object.values(PERMISSIONS)
}

export const getPermissionCategories = (): PermissionCategory[] => {
  return [
    'user_management',
    'content_management', 
    'financial_management',
    'system_administration',
    'analytics_reporting',
    'security_compliance',
    'community_moderation',
    'api_access'
  ]
}

// Export for testing
export const __testing__ = {
  mockRoles,
  mockRoleAssignments,
  clearMockData: () => {
    mockRoles = Object.values(DEFAULT_ROLES)
    mockRoleAssignments = []
  }
}


