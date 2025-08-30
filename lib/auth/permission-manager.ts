interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

interface Role {
  name: string
  permissions: string[]
  inherits?: string[]
}

interface Resource {
  name: string
  actions: string[]
}

export class PermissionManager {
  private roles = new Map<string, Role>()
  private resources = new Map<string, Resource>()

  constructor() {
    this.initializeDefaultRoles()
    this.initializeDefaultResources()
  }

  private initializeDefaultRoles(): void {
    // Define role hierarchy
    this.roles.set("guest", {
      name: "guest",
      permissions: ["read:public"],
    })

    this.roles.set("user", {
      name: "user",
      inherits: ["guest"],
      permissions: [
        "read:profile",
        "write:profile",
        "read:trades",
        "write:trades",
        "read:portfolio",
        "read:signals",
        "read:learning",
      ],
    })

    this.roles.set("premium", {
      name: "premium",
      inherits: ["user"],
      permissions: [
        "read:premium_signals",
        "write:advanced_trades",
        "read:analytics",
        "read:backtesting",
        "write:backtesting",
      ],
    })

    this.roles.set("moderator", {
      name: "moderator",
      inherits: ["premium"],
      permissions: ["read:users", "moderate:content", "read:reports", "write:announcements"],
    })

    this.roles.set("admin", {
      name: "admin",
      inherits: ["moderator"],
      permissions: [
        "read:admin",
        "write:admin",
        "manage:users",
        "manage:roles",
        "manage:system",
        "read:analytics_admin",
        "write:system_config",
      ],
    })

    this.roles.set("super_admin", {
      name: "super_admin",
      inherits: ["admin"],
      permissions: ["manage:admins", "manage:security", "manage:infrastructure", "read:audit_logs", "write:audit_logs"],
    })
  }

  private initializeDefaultResources(): void {
    this.resources.set("profile", {
      name: "profile",
      actions: ["read", "write", "delete"],
    })

    this.resources.set("trades", {
      name: "trades",
      actions: ["read", "write", "execute", "cancel"],
    })

    this.resources.set("portfolio", {
      name: "portfolio",
      actions: ["read", "write", "rebalance"],
    })

    this.resources.set("signals", {
      name: "signals",
      actions: ["read", "subscribe", "create", "manage"],
    })

    this.resources.set("admin", {
      name: "admin",
      actions: ["read", "write", "manage", "audit"],
    })

    this.resources.set("users", {
      name: "users",
      actions: ["read", "write", "manage", "ban", "delete"],
    })

    this.resources.set("system", {
      name: "system",
      actions: ["read", "write", "manage", "restart", "backup"],
    })
  }

  hasPermission(userRole: string, permission: string): boolean {
    const allPermissions = this.getAllPermissions(userRole)
    return allPermissions.includes(permission)
  }

  hasResourceAccess(userRole: string, resource: string, action: string): boolean {
    const permission = `${action}:${resource}`
    return this.hasPermission(userRole, permission)
  }

  getAllPermissions(roleName: string): string[] {
    const role = this.roles.get(roleName)
    if (!role) {
      return []
    }

    let allPermissions = [...role.permissions]

    // Add inherited permissions
    if (role.inherits) {
      for (const inheritedRole of role.inherits) {
        const inheritedPermissions = this.getAllPermissions(inheritedRole)
        allPermissions = [...allPermissions, ...inheritedPermissions]
      }
    }

    // Remove duplicates
    return [...new Set(allPermissions)]
  }

  canAccessRoute(userRole: string, route: string): boolean {
    const routePermissions: Record<string, string[]> = {
      "/dashboard": ["read:profile"],
      "/trading": ["read:trades"],
      "/portfolio": ["read:portfolio"],
      "/signals": ["read:signals"],
      "/premium": ["read:premium_signals"],
      "/admin": ["read:admin"],
      "/admin/users": ["read:users"],
      "/admin/system": ["manage:system"],
      "/backtesting": ["read:backtesting"],
      "/analytics": ["read:analytics"],
    }

    const requiredPermissions = routePermissions[route]
    if (!requiredPermissions) {
      return true // Public route
    }

    const userPermissions = this.getAllPermissions(userRole)
    return requiredPermissions.some((permission) => userPermissions.includes(permission))
  }

  getAccessibleRoutes(userRole: string): string[] {
    const allRoutes = [
      "/dashboard",
      "/trading",
      "/portfolio",
      "/signals",
      "/premium",
      "/admin",
      "/admin/users",
      "/admin/system",
      "/backtesting",
      "/analytics",
    ]

    return allRoutes.filter((route) => this.canAccessRoute(userRole, route))
  }

  addRole(role: Role): void {
    this.roles.set(role.name, role)
  }

  removeRole(roleName: string): boolean {
    return this.roles.delete(roleName)
  }

  addResource(resource: Resource): void {
    this.resources.set(resource.name, resource)
  }

  removeResource(resourceName: string): boolean {
    return this.resources.delete(resourceName)
  }

  getRoleHierarchy(): Record<string, string[]> {
    const hierarchy: Record<string, string[]> = {}

    for (const [roleName, role] of this.roles.entries()) {
      hierarchy[roleName] = role.inherits || []
    }

    return hierarchy
  }

  isRoleHigherThan(role1: string, role2: string): boolean {
    const role1Permissions = this.getAllPermissions(role1)
    const role2Permissions = this.getAllPermissions(role2)

    // Check if role1 has all permissions of role2 and more
    return (
      role2Permissions.every((permission) => role1Permissions.includes(permission)) &&
      role1Permissions.length > role2Permissions.length
    )
  }

  validatePermissionFormat(permission: string): boolean {
    const permissionRegex = /^[a-z_]+:[a-z_]+$/
    return permissionRegex.test(permission)
  }

  getPermissionsByResource(resource: string): string[] {
    const resourceData = this.resources.get(resource)
    if (!resourceData) {
      return []
    }

    return resourceData.actions.map((action) => `${action}:${resource}`)
  }

  getUserCapabilities(userRole: string): {
    permissions: string[]
    resources: Record<string, string[]>
    routes: string[]
  } {
    const permissions = this.getAllPermissions(userRole)
    const routes = this.getAccessibleRoutes(userRole)

    const resources: Record<string, string[]> = {}
    for (const [resourceName] of this.resources.entries()) {
      const resourcePermissions = this.getPermissionsByResource(resourceName)
      const userResourcePermissions = resourcePermissions.filter((permission) => permissions.includes(permission))

      if (userResourcePermissions.length > 0) {
        resources[resourceName] = userResourcePermissions.map((permission) => permission.split(":")[0])
      }
    }

    return { permissions, resources, routes }
  }
}

export const permissionManager = new PermissionManager()
