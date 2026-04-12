/**
 * Multi-Tenant SaaS Architecture - Phase 3 Enterprise Multi-tenancy
 * Tenant isolation, resource management, billing, and role-based access control
 */

import { randomBytes, createHash } from 'crypto'
import { getClusterManager } from '../database/cluster-manager'
import { getIntelligentCache } from '../caching/intelligent-cache'
import { getComplianceFramework } from '../compliance/compliance-framework'

export interface Tenant {
  id: string
  name: string
  domain: string
  subdomain: string
  plan: 'starter' | 'professional' | 'enterprise' | 'white_label'
  status: 'active' | 'suspended' | 'trial' | 'churned'
  settings: {
    timezone: string
    currency: string
    branding: {
      logo?: string
      primaryColor: string
      secondaryColor: string
      customCSS?: string
    }
    features: {
      advancedAI: boolean
      whiteLabel: boolean
      customDomain: boolean
      apiAccess: boolean
      prioritySupport: boolean
      dataRetention: number // days
      maxUsers: number
      maxPortfolios: number
      maxStrategies: number
    }
    compliance: {
      gdprEnabled: boolean
      soc2Required: boolean
      dataResidency: string
      auditRetention: number // days
    }
  }
  billing: {
    subscriptionId: string
    billingEmail: string
    plan: string
    status: 'active' | 'past_due' | 'canceled' | 'trialing'
    currentPeriodStart: Date
    currentPeriodEnd: Date
    trialEnd?: Date
    usage: {
      users: number
      portfolios: number
      strategies: number
      apiCalls: number
      aiRequests: number
    }
    limits: {
      users: number
      portfolios: number
      strategies: number
      apiCalls: number
      aiRequests: number
    }
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    lastActivity: Date
    onboardingCompleted: boolean
    integrations: string[]
  }
}

export interface TenantUser {
  id: string
  tenantId: string
  email: string
  firstName: string
  lastName: string
  role: 'owner' | 'admin' | 'analyst' | 'viewer' | 'api_user'
  status: 'active' | 'invited' | 'suspended'
  permissions: {
    canManageUsers: boolean
    canManageBilling: boolean
    canManageSettings: boolean
    canViewAuditLogs: boolean
    canExportData: boolean
    canUseAPI: boolean
    canUseAI: boolean
    portfolioAccess: 'all' | 'own' | 'none'
    strategyAccess: 'all' | 'own' | 'none'
  }
  mfa: {
    enabled: boolean
    secret?: string
    backupCodes?: string[]
  }
  metadata: {
    lastLogin?: Date
    loginCount: number
    createdAt: Date
    updatedAt: Date
    invitedBy?: string
  }
}

export interface ResourceUsage {
  tenantId: string
  date: Date
  metrics: {
    activeUsers: number
    portfolioCount: number
    strategyCount: number
    apiCalls: number
    aiRequests: number
    storageUsed: number // bytes
    bandwidthUsed: number // bytes
    computeTime: number // milliseconds
  }
}

export interface TenantIsolation {
  databaseSchema: string
  cacheNamespace: string
  fileStoragePath: string
  logStreamName: string
  encryptionKey: string
}

export class TenantManagement {
  private db = getClusterManager()
  private cache = getIntelligentCache()
  private compliance = getComplianceFramework()

  constructor() {
    this.initializeTenantSystem()
  }

  private async initializeTenantSystem() {
    try {
      await this.setupTenantTables()
      await this.setupDefaultRoles()
      await this.startUsageMonitoring()
      console.log('✅ Multi-tenant system initialized')
    } catch (error) {
      console.error('❌ Multi-tenant system initialization failed:', error)
    }
  }

  private async setupTenantTables() {
    const createTenantsTable = `
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255),
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        plan VARCHAR(50) NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise', 'white_label')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'suspended', 'trial', 'churned')),
        settings JSONB NOT NULL DEFAULT '{}',
        billing JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
      CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
      CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
    `

    const createTenantUsersTable = `
      CREATE TABLE IF NOT EXISTS tenant_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'analyst', 'viewer', 'api_user')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'invited', 'suspended')),
        permissions JSONB NOT NULL DEFAULT '{}',
        mfa JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(tenant_id, email)
      );
      
      CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);
      CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);
    `

    const createResourceUsageTable = `
      CREATE TABLE IF NOT EXISTS resource_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        metrics JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(tenant_id, date)
      );
      
      CREATE INDEX IF NOT EXISTS idx_resource_usage_tenant_date ON resource_usage(tenant_id, date);
    `

    const createTenantIsolationTable = `
      CREATE TABLE IF NOT EXISTS tenant_isolation (
        tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
        database_schema VARCHAR(100) NOT NULL,
        cache_namespace VARCHAR(100) NOT NULL,
        file_storage_path VARCHAR(255) NOT NULL,
        log_stream_name VARCHAR(100) NOT NULL,
        encryption_key TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `

    await this.db.query(createTenantsTable)
    await this.db.query(createTenantUsersTable)
    await this.db.query(createResourceUsageTable)
    await this.db.query(createTenantIsolationTable)
  }

  /**
   * Tenant Creation and Management
   */
  async createTenant(
    tenantData: Omit<Tenant, 'id' | 'metadata'> & { 
      ownerEmail: string
      ownerFirstName: string
      ownerLastName: string
    }
  ): Promise<{ tenant: Tenant; owner: TenantUser }> {
    console.log(`🏢 Creating new tenant: ${tenantData.name}`)

    try {
      return await this.db.transaction(async (client) => {
        // Create tenant
        const tenantId = randomBytes(16).toString('hex')
        
        const tenant: Tenant = {
          ...tenantData,
          id: tenantId,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: tenantData.ownerEmail,
            lastActivity: new Date(),
            onboardingCompleted: false,
            integrations: []
          }
        }

        await client.query(`
          INSERT INTO tenants (id, name, domain, subdomain, plan, status, settings, billing, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          tenantId,
          tenant.name,
          tenant.domain,
          tenant.subdomain,
          tenant.plan,
          tenant.status,
          JSON.stringify(tenant.settings),
          JSON.stringify(tenant.billing),
          JSON.stringify(tenant.metadata)
        ])

        // Create tenant isolation resources
        await this.createTenantIsolation(tenantId, client)

        // Create owner user
        const owner = await this.createTenantUser({
          tenantId,
          email: tenantData.ownerEmail,
          firstName: tenantData.ownerFirstName,
          lastName: tenantData.ownerLastName,
          role: 'owner',
          status: 'active',
          permissions: this.getDefaultPermissions('owner')
        }, client)

        // Log tenant creation
        await this.compliance.logAuditEvent({
          userId: owner.id,
          userEmail: owner.email,
          action: 'tenant_created',
          resource: 'tenant',
          resourceId: tenantId,
          ipAddress: '0.0.0.0',
          userAgent: 'system',
          sessionId: 'system',
          outcome: 'success',
          riskLevel: 'medium',
          complianceFrameworks: ['SOC2'],
          metadata: {
            authMethod: 'system',
            mfaUsed: false
          }
        })

        console.log(`✅ Tenant created: ${tenant.name} (${tenantId})`)
        return { tenant, owner }
      })

    } catch (error) {
      console.error(`❌ Failed to create tenant ${tenantData.name}:`, error)
      throw error
    }
  }

  private async createTenantIsolation(tenantId: string, client: any) {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`
    const isolation: TenantIsolation = {
      databaseSchema: schemaName,
      cacheNamespace: `tenant:${tenantId}`,
      fileStoragePath: `/data/tenants/${tenantId}`,
      logStreamName: `nexural-tenant-${tenantId}`,
      encryptionKey: randomBytes(32).toString('hex')
    }

    // Create database schema for tenant
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
    
    // Create tenant-specific tables
    await this.createTenantSchema(schemaName, client)

    // Store isolation config
    await client.query(`
      INSERT INTO tenant_isolation (tenant_id, database_schema, cache_namespace, file_storage_path, log_stream_name, encryption_key)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [tenantId, isolation.databaseSchema, isolation.cacheNamespace, isolation.fileStoragePath, isolation.logStreamName, isolation.encryptionKey])

    console.log(`🔒 Created tenant isolation for: ${tenantId}`)
  }

  private async createTenantSchema(schemaName: string, client: any) {
    const tables = [
      `CREATE TABLE IF NOT EXISTS ${schemaName}.portfolios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        user_id UUID NOT NULL,
        initial_balance DECIMAL(15,2) NOT NULL DEFAULT 100000,
        current_balance DECIMAL(15,2) NOT NULL DEFAULT 100000,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS ${schemaName}.trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        portfolio_id UUID NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
        quantity DECIMAL(15,8) NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS ${schemaName}.strategies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id UUID NOT NULL,
        code TEXT NOT NULL,
        parameters JSONB DEFAULT '{}',
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    ]

    for (const table of tables) {
      await client.query(table)
    }
  }

  /**
   * User Management with RBAC
   */
  async createTenantUser(
    userData: Omit<TenantUser, 'id' | 'metadata'> & { permissions?: Partial<TenantUser['permissions']> },
    client?: any
  ): Promise<TenantUser> {
    const userId = randomBytes(16).toString('hex')
    
    const user: TenantUser = {
      ...userData,
      id: userId,
      permissions: {
        ...this.getDefaultPermissions(userData.role),
        ...userData.permissions
      },
      mfa: userData.mfa || { enabled: false },
      metadata: {
        loginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    const queryClient = client || this.db

    await queryClient.query(`
      INSERT INTO tenant_users (id, tenant_id, email, first_name, last_name, role, status, permissions, mfa, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      userId,
      user.tenantId,
      user.email,
      user.firstName,
      user.lastName,
      user.role,
      user.status,
      JSON.stringify(user.permissions),
      JSON.stringify(user.mfa),
      JSON.stringify(user.metadata)
    ])

    console.log(`👤 Created tenant user: ${user.email} (${user.role})`)
    return user
  }

  private getDefaultPermissions(role: TenantUser['role']): TenantUser['permissions'] {
    const permissions: Record<TenantUser['role'], TenantUser['permissions']> = {
      owner: {
        canManageUsers: true,
        canManageBilling: true,
        canManageSettings: true,
        canViewAuditLogs: true,
        canExportData: true,
        canUseAPI: true,
        canUseAI: true,
        portfolioAccess: 'all',
        strategyAccess: 'all'
      },
      admin: {
        canManageUsers: true,
        canManageBilling: false,
        canManageSettings: true,
        canViewAuditLogs: true,
        canExportData: true,
        canUseAPI: true,
        canUseAI: true,
        portfolioAccess: 'all',
        strategyAccess: 'all'
      },
      analyst: {
        canManageUsers: false,
        canManageBilling: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canExportData: true,
        canUseAPI: true,
        canUseAI: true,
        portfolioAccess: 'own',
        strategyAccess: 'all'
      },
      viewer: {
        canManageUsers: false,
        canManageBilling: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canExportData: false,
        canUseAPI: false,
        canUseAI: false,
        portfolioAccess: 'own',
        strategyAccess: 'none'
      },
      api_user: {
        canManageUsers: false,
        canManageBilling: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canExportData: true,
        canUseAPI: true,
        canUseAI: true,
        portfolioAccess: 'own',
        strategyAccess: 'own'
      }
    }

    return permissions[role]
  }

  /**
   * Tenant Context and Isolation
   */
  async getTenantContext(identifier: string): Promise<{ tenant: Tenant; isolation: TenantIsolation } | null> {
    try {
      // Try to find by subdomain first, then by ID
      let query = 'SELECT * FROM tenants WHERE '
      let param = identifier

      if (identifier.includes('.') || !identifier.includes('-')) {
        query += 'subdomain = $1'
      } else {
        query += 'id = $1'
      }

      const tenantResult = await this.db.query(query, [param])
      
      if (tenantResult.rows.length === 0) {
        return null
      }

      const tenantRow = tenantResult.rows[0]
      const tenant: Tenant = {
        id: tenantRow.id,
        name: tenantRow.name,
        domain: tenantRow.domain,
        subdomain: tenantRow.subdomain,
        plan: tenantRow.plan,
        status: tenantRow.status,
        settings: tenantRow.settings,
        billing: tenantRow.billing,
        metadata: tenantRow.metadata
      }

      // Get isolation config
      const isolationResult = await this.db.query(
        'SELECT * FROM tenant_isolation WHERE tenant_id = $1',
        [tenant.id]
      )

      if (isolationResult.rows.length === 0) {
        throw new Error(`Isolation config not found for tenant: ${tenant.id}`)
      }

      const isolationRow = isolationResult.rows[0]
      const isolation: TenantIsolation = {
        databaseSchema: isolationRow.database_schema,
        cacheNamespace: isolationRow.cache_namespace,
        fileStoragePath: isolationRow.file_storage_path,
        logStreamName: isolationRow.log_stream_name,
        encryptionKey: isolationRow.encryption_key
      }

      // Cache for fast access
      await this.cache.set(
        'tenant',
        `context_${identifier}`,
        { tenant, isolation },
        { ttl: 3600, tags: ['tenant', 'context'] }
      )

      return { tenant, isolation }

    } catch (error) {
      console.error(`❌ Failed to get tenant context for ${identifier}:`, error)
      return null
    }
  }

  /**
   * Resource Usage Monitoring and Billing
   */
  async recordUsage(tenantId: string, metrics: Partial<ResourceUsage['metrics']>): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      await this.db.query(`
        INSERT INTO resource_usage (tenant_id, date, metrics)
        VALUES ($1, $2, $3)
        ON CONFLICT (tenant_id, date) 
        DO UPDATE SET metrics = resource_usage.metrics || $3
      `, [tenantId, today, JSON.stringify(metrics)])

      // Update tenant billing usage
      await this.updateBillingUsage(tenantId, metrics)

    } catch (error) {
      console.error(`❌ Failed to record usage for tenant ${tenantId}:`, error)
    }
  }

  private async updateBillingUsage(tenantId: string, metrics: Partial<ResourceUsage['metrics']>) {
    const tenant = await this.getTenant(tenantId)
    if (!tenant) return

    const currentUsage = tenant.billing.usage
    const newUsage = {
      users: Math.max(currentUsage.users, metrics.activeUsers || 0),
      portfolios: Math.max(currentUsage.portfolios, metrics.portfolioCount || 0),
      strategies: Math.max(currentUsage.strategies, metrics.strategyCount || 0),
      apiCalls: currentUsage.apiCalls + (metrics.apiCalls || 0),
      aiRequests: currentUsage.aiRequests + (metrics.aiRequests || 0)
    }

    await this.db.query(`
      UPDATE tenants 
      SET billing = billing || jsonb_build_object('usage', $1), updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(newUsage), tenantId])

    // Check for usage limits and alert if exceeded
    await this.checkUsageLimits(tenantId, newUsage, tenant.billing.limits)
  }

  private async checkUsageLimits(
    tenantId: string, 
    usage: ResourceUsage['metrics'], 
    limits: ResourceUsage['metrics']
  ) {
    const violations: string[] = []

    Object.entries(usage).forEach(([metric, value]) => {
      const limit = limits[metric as keyof ResourceUsage['metrics']]
      if (typeof value === 'number' && typeof limit === 'number' && value > limit) {
        violations.push(`${metric}: ${value}/${limit}`)
      }
    })

    if (violations.length > 0) {
      console.warn(`⚠️ Usage limits exceeded for tenant ${tenantId}: ${violations.join(', ')}`)
      // Would trigger billing alerts or plan upgrade notifications
    }
  }

  /**
   * Plan Management and Feature Gates
   */
  async upgradeTenantPlan(tenantId: string, newPlan: Tenant['plan']): Promise<void> {
    try {
      const tenant = await this.getTenant(tenantId)
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`)
      }

      const newSettings = this.getPlanSettings(newPlan)
      const newLimits = this.getPlanLimits(newPlan)

      await this.db.query(`
        UPDATE tenants 
        SET plan = $1, 
            settings = settings || $2,
            billing = billing || jsonb_build_object('limits', $3),
            updated_at = NOW()
        WHERE id = $4
      `, [newPlan, JSON.stringify({ features: newSettings }), JSON.stringify(newLimits), tenantId])

      // Clear tenant cache
      await this.cache.invalidateByTag(`tenant:${tenantId}`)

      console.log(`✅ Tenant ${tenantId} upgraded to ${newPlan} plan`)

    } catch (error) {
      console.error(`❌ Failed to upgrade tenant ${tenantId}:`, error)
      throw error
    }
  }

  private getPlanSettings(plan: Tenant['plan']): Tenant['settings']['features'] {
    const features: Record<Tenant['plan'], Tenant['settings']['features']> = {
      starter: {
        advancedAI: false,
        whiteLabel: false,
        customDomain: false,
        apiAccess: true,
        prioritySupport: false,
        dataRetention: 30,
        maxUsers: 3,
        maxPortfolios: 10,
        maxStrategies: 5
      },
      professional: {
        advancedAI: true,
        whiteLabel: false,
        customDomain: false,
        apiAccess: true,
        prioritySupport: true,
        dataRetention: 90,
        maxUsers: 15,
        maxPortfolios: 50,
        maxStrategies: 25
      },
      enterprise: {
        advancedAI: true,
        whiteLabel: true,
        customDomain: true,
        apiAccess: true,
        prioritySupport: true,
        dataRetention: 365,
        maxUsers: 100,
        maxPortfolios: 500,
        maxStrategies: 100
      },
      white_label: {
        advancedAI: true,
        whiteLabel: true,
        customDomain: true,
        apiAccess: true,
        prioritySupport: true,
        dataRetention: 730,
        maxUsers: -1, // unlimited
        maxPortfolios: -1,
        maxStrategies: -1
      }
    }

    return features[plan]
  }

  private getPlanLimits(plan: Tenant['plan']): ResourceUsage['metrics'] {
    const limits: Record<Tenant['plan'], ResourceUsage['metrics']> = {
      starter: {
        activeUsers: 3,
        portfolioCount: 10,
        strategyCount: 5,
        apiCalls: 10000,
        aiRequests: 100,
        storageUsed: 1024 * 1024 * 100, // 100MB
        bandwidthUsed: 1024 * 1024 * 1024, // 1GB
        computeTime: 3600 * 1000 // 1 hour
      },
      professional: {
        activeUsers: 15,
        portfolioCount: 50,
        strategyCount: 25,
        apiCalls: 100000,
        aiRequests: 1000,
        storageUsed: 1024 * 1024 * 1024, // 1GB
        bandwidthUsed: 1024 * 1024 * 1024 * 10, // 10GB
        computeTime: 3600 * 1000 * 10 // 10 hours
      },
      enterprise: {
        activeUsers: 100,
        portfolioCount: 500,
        strategyCount: 100,
        apiCalls: 1000000,
        aiRequests: 10000,
        storageUsed: 1024 * 1024 * 1024 * 10, // 10GB
        bandwidthUsed: 1024 * 1024 * 1024 * 100, // 100GB
        computeTime: 3600 * 1000 * 100 // 100 hours
      },
      white_label: {
        activeUsers: -1, // unlimited
        portfolioCount: -1,
        strategyCount: -1,
        apiCalls: -1,
        aiRequests: -1,
        storageUsed: -1,
        bandwidthUsed: -1,
        computeTime: -1
      }
    }

    return limits[plan]
  }

  /**
   * White Label Features
   */
  async updateTenantBranding(tenantId: string, branding: Tenant['settings']['branding']): Promise<void> {
    try {
      const tenant = await this.getTenant(tenantId)
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`)
      }

      if (!tenant.settings.features.whiteLabel) {
        throw new Error('White label features not available for this plan')
      }

      await this.db.query(`
        UPDATE tenants 
        SET settings = settings || jsonb_build_object('branding', $1),
            updated_at = NOW()
        WHERE id = $2
      `, [JSON.stringify(branding), tenantId])

      // Clear tenant cache
      await this.cache.invalidateByTag(`tenant:${tenantId}`)

      console.log(`🎨 Updated branding for tenant ${tenantId}`)

    } catch (error) {
      console.error(`❌ Failed to update tenant branding:`, error)
      throw error
    }
  }

  /**
   * Data Operations with Tenant Isolation
   */
  async executeTenantQuery(
    tenantId: string,
    query: string,
    params: any[] = []
  ): Promise<any> {
    const context = await this.getTenantContext(tenantId)
    if (!context) {
      throw new Error(`Tenant context not found: ${tenantId}`)
    }

    // Replace table references with schema-qualified names
    const schemaQuery = query.replace(
      /\b(portfolios|trades|strategies)\b/g,
      `${context.isolation.databaseSchema}.$1`
    )

    return await this.db.query(schemaQuery, params)
  }

  /**
   * Helper methods
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const result = await this.db.query('SELECT * FROM tenants WHERE id = $1', [tenantId])
      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        id: row.id,
        name: row.name,
        domain: row.domain,
        subdomain: row.subdomain,
        plan: row.plan,
        status: row.status,
        settings: row.settings,
        billing: row.billing,
        metadata: row.metadata
      }
    } catch (error) {
      console.error(`❌ Failed to get tenant ${tenantId}:`, error)
      return null
    }
  }

  async getTenantUser(userId: string): Promise<TenantUser | null> {
    try {
      const result = await this.db.query('SELECT * FROM tenant_users WHERE id = $1', [userId])
      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        id: row.id,
        tenantId: row.tenant_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        status: row.status,
        permissions: row.permissions,
        mfa: row.mfa,
        metadata: row.metadata
      }
    } catch (error) {
      console.error(`❌ Failed to get tenant user ${userId}:`, error)
      return null
    }
  }

  private async setupDefaultRoles() {
    // Default roles are defined in getDefaultPermissions method
    console.log('✅ Default tenant roles configured')
  }

  private startUsageMonitoring() {
    // Daily usage aggregation
    setInterval(async () => {
      await this.aggregateDailyUsage()
    }, 24 * 60 * 60 * 1000)

    console.log('📊 Usage monitoring started')
  }

  private async aggregateDailyUsage() {
    console.log('📊 Aggregating daily usage data...')
    
    try {
      const tenants = await this.db.query('SELECT id FROM tenants WHERE status = $1', ['active'])
      
      for (const tenant of tenants.rows) {
        // Would collect actual usage metrics from various sources
        const mockUsage: Partial<ResourceUsage['metrics']> = {
          activeUsers: Math.floor(Math.random() * 10),
          apiCalls: Math.floor(Math.random() * 1000),
          aiRequests: Math.floor(Math.random() * 50)
        }

        await this.recordUsage(tenant.id, mockUsage)
      }

      console.log('✅ Daily usage aggregation completed')

    } catch (error) {
      console.error('❌ Daily usage aggregation failed:', error)
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up tenant management system')
    // Any cleanup logic would go here
    console.log('✅ Tenant management cleanup completed')
  }
}

// Singleton instance
let tenantManagement: TenantManagement | null = null

export const getTenantManagement = (): TenantManagement => {
  if (!tenantManagement) {
    tenantManagement = new TenantManagement()
  }
  return tenantManagement
}

export default TenantManagement
