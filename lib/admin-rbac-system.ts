export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  level: number
  isActive: boolean
}

export interface AdminUser {
  id: string
  email: string
  name: string
  roleId: string
  customPermissions: string[]
  isActive: boolean
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}

export class AdminRBACSystem {
  private permissions: Map<string, Permission> = new Map()
  private roles: Map<string, Role> = new Map()
  private users: Map<string, AdminUser> = new Map()

  constructor() {
    this.initializeDefaultPermissions()
    this.initializeDefaultRoles()
  }

  private initializeDefaultPermissions(): void {
    const defaultPermissions: Permission[] = [
      // User Management
      {
        id: "users.view",
        name: "View Users",
        description: "View user list and details",
        resource: "users",
        action: "read",
      },
      {
        id: "users.create",
        name: "Create Users",
        description: "Create new users",
        resource: "users",
        action: "create",
      },
      {
        id: "users.edit",
        name: "Edit Users",
        description: "Edit user information",
        resource: "users",
        action: "update",
      },
      { id: "users.delete", name: "Delete Users", description: "Delete users", resource: "users", action: "delete" },
      {
        id: "users.suspend",
        name: "Suspend Users",
        description: "Suspend/unsuspend users",
        resource: "users",
        action: "suspend",
      },

      // Trading Management
      {
        id: "trading.view",
        name: "View Trading Data",
        description: "View trading information",
        resource: "trading",
        action: "read",
      },
      {
        id: "trading.signals",
        name: "Manage Signals",
        description: "Create and manage trading signals",
        resource: "trading",
        action: "signals",
      },
      {
        id: "trading.bots",
        name: "Manage Bots",
        description: "Configure trading bots",
        resource: "trading",
        action: "bots",
      },
      {
        id: "trading.halt",
        name: "Emergency Halt",
        description: "Emergency stop trading operations",
        resource: "trading",
        action: "halt",
      },

      // Financial Management
      {
        id: "finance.view",
        name: "View Financial Data",
        description: "View financial reports and data",
        resource: "finance",
        action: "read",
      },
      {
        id: "finance.reports",
        name: "Generate Reports",
        description: "Generate financial reports",
        resource: "finance",
        action: "reports",
      },
      {
        id: "finance.transactions",
        name: "Manage Transactions",
        description: "View and manage transactions",
        resource: "finance",
        action: "transactions",
      },

      // Content Management
      {
        id: "content.view",
        name: "View Content",
        description: "View content and media",
        resource: "content",
        action: "read",
      },
      {
        id: "content.create",
        name: "Create Content",
        description: "Create new content",
        resource: "content",
        action: "create",
      },
      {
        id: "content.edit",
        name: "Edit Content",
        description: "Edit existing content",
        resource: "content",
        action: "update",
      },
      {
        id: "content.delete",
        name: "Delete Content",
        description: "Delete content",
        resource: "content",
        action: "delete",
      },
      {
        id: "content.publish",
        name: "Publish Content",
        description: "Publish/unpublish content",
        resource: "content",
        action: "publish",
      },

      // System Management
      {
        id: "system.view",
        name: "View System Info",
        description: "View system information",
        resource: "system",
        action: "read",
      },
      {
        id: "system.monitor",
        name: "System Monitoring",
        description: "Monitor system performance",
        resource: "system",
        action: "monitor",
      },
      {
        id: "system.config",
        name: "System Configuration",
        description: "Configure system settings",
        resource: "system",
        action: "config",
      },
      {
        id: "system.backup",
        name: "System Backup",
        description: "Perform system backups",
        resource: "system",
        action: "backup",
      },

      // Analytics
      {
        id: "analytics.view",
        name: "View Analytics",
        description: "View analytics and reports",
        resource: "analytics",
        action: "read",
      },
      {
        id: "analytics.export",
        name: "Export Analytics",
        description: "Export analytics data",
        resource: "analytics",
        action: "export",
      },

      // Support Management
      {
        id: "support.view",
        name: "View Support Tickets",
        description: "View support tickets",
        resource: "support",
        action: "read",
      },
      {
        id: "support.respond",
        name: "Respond to Tickets",
        description: "Respond to support tickets",
        resource: "support",
        action: "respond",
      },
      {
        id: "support.escalate",
        name: "Escalate Tickets",
        description: "Escalate support tickets",
        resource: "support",
        action: "escalate",
      },

      // Audit and Compliance
      { id: "audit.view", name: "View Audit Logs", description: "View audit logs", resource: "audit", action: "read" },
      {
        id: "audit.export",
        name: "Export Audit Logs",
        description: "Export audit logs",
        resource: "audit",
        action: "export",
      },
      {
        id: "compliance.manage",
        name: "Manage Compliance",
        description: "Manage compliance settings",
        resource: "compliance",
        action: "manage",
      },

      // Role Management
      {
        id: "roles.view",
        name: "View Roles",
        description: "View roles and permissions",
        resource: "roles",
        action: "read",
      },
      {
        id: "roles.create",
        name: "Create Roles",
        description: "Create new roles",
        resource: "roles",
        action: "create",
      },
      {
        id: "roles.edit",
        name: "Edit Roles",
        description: "Edit role permissions",
        resource: "roles",
        action: "update",
      },
      { id: "roles.delete", name: "Delete Roles", description: "Delete roles", resource: "roles", action: "delete" },
    ]

    defaultPermissions.forEach((permission) => {
      this.permissions.set(permission.id, permission)
    })
  }

  private initializeDefaultRoles(): void {
    const defaultRoles: Role[] = [
      {
        id: "super_admin",
        name: "Super Administrator",
        description: "Full system access with all permissions",
        level: 100,
        isActive: true,
        permissions: Array.from(this.permissions.keys()),
      },
      {
        id: "admin",
        name: "Administrator",
        description: "Administrative access with most permissions",
        level: 80,
        isActive: true,
        permissions: [
          "users.view",
          "users.create",
          "users.edit",
          "users.suspend",
          "trading.view",
          "trading.signals",
          "trading.bots",
          "finance.view",
          "finance.reports",
          "finance.transactions",
          "content.view",
          "content.create",
          "content.edit",
          "content.publish",
          "system.view",
          "system.monitor",
          "system.config",
          "analytics.view",
          "analytics.export",
          "support.view",
          "support.respond",
          "support.escalate",
          "audit.view",
        ],
      },
      {
        id: "moderator",
        name: "Moderator",
        description: "Content and user moderation access",
        level: 60,
        isActive: true,
        permissions: [
          "users.view",
          "users.suspend",
          "trading.view",
          "content.view",
          "content.edit",
          "content.publish",
          "support.view",
          "support.respond",
          "analytics.view",
        ],
      },
      {
        id: "analyst",
        name: "Analyst",
        description: "Analytics and reporting access",
        level: 40,
        isActive: true,
        permissions: [
          "users.view",
          "trading.view",
          "finance.view",
          "finance.reports",
          "analytics.view",
          "analytics.export",
          "system.view",
          "system.monitor",
        ],
      },
      {
        id: "viewer",
        name: "Viewer",
        description: "Read-only access to basic information",
        level: 20,
        isActive: true,
        permissions: ["users.view", "trading.view", "finance.view", "content.view", "analytics.view", "system.view"],
      },
    ]

    defaultRoles.forEach((role) => {
      this.roles.set(role.id, role)
    })
  }

  // Permission Management
  hasPermission(userId: string, permissionId: string): boolean {
    const user = this.users.get(userId)
    if (!user || !user.isActive) return false

    const role = this.roles.get(user.roleId)
    if (!role || !role.isActive) return false

    // Check role permissions
    if (role.permissions.includes(permissionId)) return true

    // Check custom user permissions
    if (user.customPermissions.includes(permissionId)) return true

    return false
  }

  hasAnyPermission(userId: string, permissionIds: string[]): boolean {
    return permissionIds.some((permissionId) => this.hasPermission(userId, permissionId))
  }

  hasAllPermissions(userId: string, permissionIds: string[]): boolean {
    return permissionIds.every((permissionId) => this.hasPermission(userId, permissionId))
  }

  getUserPermissions(userId: string): Permission[] {
    const user = this.users.get(userId)
    if (!user || !user.isActive) return []

    const role = this.roles.get(user.roleId)
    if (!role || !role.isActive) return []

    const allPermissionIds = [...new Set([...role.permissions, ...user.customPermissions])]
    return allPermissionIds
      .map((id) => this.permissions.get(id))
      .filter((permission): permission is Permission => permission !== undefined)
  }

  // Role Management
  createRole(roleData: Omit<Role, "id">): Role {
    const id = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const role: Role = { id, ...roleData }
    this.roles.set(id, role)
    return role
  }

  updateRole(roleId: string, updates: Partial<Role>): Role | null {
    const role = this.roles.get(roleId)
    if (!role) return null

    const updatedRole = { ...role, ...updates, id: roleId }
    this.roles.set(roleId, updatedRole)
    return updatedRole
  }

  deleteRole(roleId: string): boolean {
    // Don't allow deletion of default roles
    const defaultRoles = ["super_admin", "admin", "moderator", "analyst", "viewer"]
    if (defaultRoles.includes(roleId)) return false

    // Check if any users have this role
    const usersWithRole = Array.from(this.users.values()).filter((user) => user.roleId === roleId)
    if (usersWithRole.length > 0) return false

    return this.roles.delete(roleId)
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values()).sort((a, b) => b.level - a.level)
  }

  getRole(roleId: string): Role | null {
    return this.roles.get(roleId) || null
  }

  // User Management
  createUser(userData: Omit<AdminUser, "id" | "createdAt" | "updatedAt">): AdminUser {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    const user: AdminUser = {
      id,
      createdAt: now,
      updatedAt: now,
      ...userData,
    }
    this.users.set(id, user)
    return user
  }

  updateUser(userId: string, updates: Partial<AdminUser>): AdminUser | null {
    const user = this.users.get(userId)
    if (!user) return null

    const updatedUser = { ...user, ...updates, id: userId, updatedAt: new Date() }
    this.users.set(userId, updatedUser)
    return updatedUser
  }

  getUser(userId: string): AdminUser | null {
    return this.users.get(userId) || null
  }

  getAllUsers(): AdminUser[] {
    return Array.from(this.users.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Permission Checking Middleware
  requirePermission(permissionId: string) {
    return (userId: string): boolean => {
      return this.hasPermission(userId, permissionId)
    }
  }

  requireAnyPermission(permissionIds: string[]) {
    return (userId: string): boolean => {
      return this.hasAnyPermission(userId, permissionIds)
    }
  }

  requireRole(roleId: string) {
    return (userId: string): boolean => {
      const user = this.users.get(userId)
      return user?.roleId === roleId && user.isActive
    }
  }

  requireMinimumRole(minimumLevel: number) {
    return (userId: string): boolean => {
      const user = this.users.get(userId)
      if (!user || !user.isActive) return false

      const role = this.roles.get(user.roleId)
      return role ? role.level >= minimumLevel : false
    }
  }

  // Utility Methods
  getPermissionsByResource(resource: string): Permission[] {
    return Array.from(this.permissions.values()).filter((permission) => permission.resource === resource)
  }

  getRoleHierarchy(): { roleId: string; level: number; name: string }[] {
    return Array.from(this.roles.values())
      .map((role) => ({ roleId: role.id, level: role.level, name: role.name }))
      .sort((a, b) => b.level - a.level)
  }

  validateRolePermissions(roleId: string, permissionIds: string[]): { valid: boolean; invalidPermissions: string[] } {
    const invalidPermissions = permissionIds.filter((id) => !this.permissions.has(id))
    return {
      valid: invalidPermissions.length === 0,
      invalidPermissions,
    }
  }
}

// Export singleton instance
export const adminRBACSystem = new AdminRBACSystem()

// Initialize some demo users for testing
adminRBACSystem.createUser({
  email: "admin@nexural.com",
  name: "NEXURAL Admin",
  roleId: "super_admin",
  customPermissions: [],
  isActive: true,
  lastLogin: new Date(),
})

adminRBACSystem.createUser({
  email: "moderator@nexural.com",
  name: "Content Moderator",
  roleId: "moderator",
  customPermissions: ["support.escalate"],
  isActive: true,
  lastLogin: new Date(),
})
