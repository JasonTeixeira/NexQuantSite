interface APIEndpoint {
  id: string
  name: string
  path: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  version: string
  status: "active" | "deprecated" | "maintenance" | "beta"
  description: string
  category: string
  authentication: {
    type: "none" | "api-key" | "bearer" | "oauth2" | "basic"
    required: boolean
    scopes?: string[]
  }
  rateLimit: {
    requests: number
    window: number
    unit: "second" | "minute" | "hour" | "day"
  }
  caching: {
    enabled: boolean
    ttl: number
    strategy: "memory" | "redis" | "cdn"
  }
  monitoring: {
    enabled: boolean
    alertThresholds: {
      errorRate: number
      responseTime: number
      requestVolume: number
    }
  }
  documentation: {
    summary: string
    parameters: Array<{
      name: string
      type: string
      required: boolean
      description: string
      example: any
    }>
    responses: Array<{
      code: number
      description: string
      schema: any
    }>
    examples: Array<{
      name: string
      request: any
      response: any
    }>
  }
  createdAt: string
  updatedAt: string
}

interface APIMetrics {
  endpointId: string
  timeframe: string
  metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorRate: number
    throughput: number
    uniqueUsers: number
    topUserAgents: Array<{ agent: string; count: number }>
    topIPs: Array<{ ip: string; count: number }>
    statusCodes: Record<string, number>
    errorTypes: Record<string, number>
  }
  trends: Array<{
    timestamp: string
    requests: number
    responseTime: number
    errors: number
  }>
}

interface APIKey {
  id: string
  name: string
  key: string
  hashedKey: string
  userId: string
  permissions: string[]
  rateLimit: {
    requests: number
    window: number
    unit: "second" | "minute" | "hour" | "day"
  }
  restrictions: {
    ipWhitelist?: string[]
    referrerWhitelist?: string[]
    allowedEndpoints?: string[]
  }
  usage: {
    totalRequests: number
    lastUsed: string
    monthlyUsage: number
    quotaUsed: number
    quotaLimit: number
  }
  status: "active" | "suspended" | "revoked"
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

interface APIAlert {
  id: string
  name: string
  description: string
  type: "error-rate" | "response-time" | "request-volume" | "availability"
  conditions: {
    metric: string
    operator: ">" | "<" | ">=" | "<=" | "=="
    threshold: number
    duration: number
  }
  endpoints: string[]
  notifications: {
    email: string[]
    webhook?: string
    slack?: string
  }
  isActive: boolean
  lastTriggered?: string
  createdAt: string
}

interface APIUsageReport {
  period: string
  startDate: string
  endDate: string
  summary: {
    totalRequests: number
    totalUsers: number
    totalEndpoints: number
    averageResponseTime: number
    errorRate: number
    topEndpoints: Array<{
      endpoint: string
      requests: number
      percentage: number
    }>
    topUsers: Array<{
      userId: string
      requests: number
      percentage: number
    }>
  }
  trends: {
    daily: Array<{
      date: string
      requests: number
      users: number
      errors: number
    }>
    hourly: Array<{
      hour: number
      requests: number
      responseTime: number
    }>
  }
  geography: Array<{
    country: string
    requests: number
    percentage: number
  }>
  devices: Array<{
    type: string
    requests: number
    percentage: number
  }>
}

export class APIManagementDashboard {
  private endpoints: Map<string, APIEndpoint> = new Map()
  private metrics: Map<string, APIMetrics> = new Map()
  private apiKeys: Map<string, APIKey> = new Map()
  private alerts: Map<string, APIAlert> = new Map()

  constructor() {
    this.initializeEndpoints()
    this.initializeMetrics()
    this.initializeAPIKeys()
    this.initializeAlerts()
  }

  private initializeEndpoints() {
    const endpoints: APIEndpoint[] = [
      {
        id: "api-001",
        name: "Get Trading Signals",
        path: "/api/v1/signals",
        method: "GET",
        version: "1.2.0",
        status: "active",
        description: "Retrieve real-time trading signals with confidence scores",
        category: "Trading",
        authentication: {
          type: "api-key",
          required: true,
          scopes: ["signals:read"],
        },
        rateLimit: {
          requests: 1000,
          window: 1,
          unit: "hour",
        },
        caching: {
          enabled: true,
          ttl: 300,
          strategy: "redis",
        },
        monitoring: {
          enabled: true,
          alertThresholds: {
            errorRate: 5,
            responseTime: 2000,
            requestVolume: 10000,
          },
        },
        documentation: {
          summary: "Get real-time trading signals with AI-powered confidence scores",
          parameters: [
            {
              name: "symbol",
              type: "string",
              required: false,
              description: "Trading pair symbol (e.g., BTC/USD)",
              example: "BTC/USD",
            },
            {
              name: "timeframe",
              type: "string",
              required: false,
              description: "Signal timeframe",
              example: "1h",
            },
            {
              name: "limit",
              type: "integer",
              required: false,
              description: "Number of signals to return",
              example: 10,
            },
          ],
          responses: [
            {
              code: 200,
              description: "Successful response",
              schema: {
                type: "object",
                properties: {
                  signals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        symbol: { type: "string" },
                        direction: { type: "string" },
                        confidence: { type: "number" },
                        timestamp: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            {
              code: 401,
              description: "Unauthorized - Invalid API key",
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          ],
          examples: [
            {
              name: "Get BTC signals",
              request: {
                url: "/api/v1/signals?symbol=BTC/USD&limit=5",
                headers: {
                  "X-API-Key": "your-api-key",
                },
              },
              response: {
                signals: [
                  {
                    id: "signal-001",
                    symbol: "BTC/USD",
                    direction: "buy",
                    confidence: 0.85,
                    timestamp: "2024-01-20T10:30:00Z",
                  },
                ],
              },
            },
          ],
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "api-002",
        name: "Create User",
        path: "/api/v1/users",
        method: "POST",
        version: "2.0.0",
        status: "active",
        description: "Create a new user account",
        category: "User Management",
        authentication: {
          type: "bearer",
          required: true,
          scopes: ["users:write"],
        },
        rateLimit: {
          requests: 100,
          window: 1,
          unit: "hour",
        },
        caching: {
          enabled: false,
          ttl: 0,
          strategy: "memory",
        },
        monitoring: {
          enabled: true,
          alertThresholds: {
            errorRate: 10,
            responseTime: 5000,
            requestVolume: 1000,
          },
        },
        documentation: {
          summary: "Create a new user account with email verification",
          parameters: [
            {
              name: "email",
              type: "string",
              required: true,
              description: "User email address",
              example: "user@example.com",
            },
            {
              name: "password",
              type: "string",
              required: true,
              description: "User password (min 8 characters)",
              example: "securePassword123",
            },
            {
              name: "firstName",
              type: "string",
              required: true,
              description: "User first name",
              example: "John",
            },
            {
              name: "lastName",
              type: "string",
              required: true,
              description: "User last name",
              example: "Doe",
            },
          ],
          responses: [
            {
              code: 201,
              description: "User created successfully",
              schema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  email: { type: "string" },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  createdAt: { type: "string" },
                },
              },
            },
            {
              code: 400,
              description: "Bad request - Invalid input",
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" },
                  details: { type: "array" },
                },
              },
            },
          ],
          examples: [
            {
              name: "Create user",
              request: {
                url: "/api/v1/users",
                method: "POST",
                headers: {
                  Authorization: "Bearer your-token",
                  "Content-Type": "application/json",
                },
                body: {
                  email: "john.doe@example.com",
                  password: "securePassword123",
                  firstName: "John",
                  lastName: "Doe",
                },
              },
              response: {
                id: "user-001",
                email: "john.doe@example.com",
                firstName: "John",
                lastName: "Doe",
                createdAt: "2024-01-20T10:30:00Z",
              },
            },
          ],
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-10T14:20:00Z",
      },
      {
        id: "api-003",
        name: "Get Market Data",
        path: "/api/v1/market-data",
        method: "GET",
        version: "1.5.0",
        status: "maintenance",
        description: "Retrieve real-time market data and price information",
        category: "Market Data",
        authentication: {
          type: "api-key",
          required: true,
          scopes: ["market:read"],
        },
        rateLimit: {
          requests: 5000,
          window: 1,
          unit: "hour",
        },
        caching: {
          enabled: true,
          ttl: 60,
          strategy: "cdn",
        },
        monitoring: {
          enabled: true,
          alertThresholds: {
            errorRate: 3,
            responseTime: 1000,
            requestVolume: 50000,
          },
        },
        documentation: {
          summary: "Get real-time market data for trading pairs",
          parameters: [
            {
              name: "symbols",
              type: "string",
              required: false,
              description: "Comma-separated list of symbols",
              example: "BTC/USD,ETH/USD",
            },
            {
              name: "interval",
              type: "string",
              required: false,
              description: "Data interval",
              example: "1m",
            },
          ],
          responses: [
            {
              code: 200,
              description: "Market data retrieved successfully",
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        symbol: { type: "string" },
                        price: { type: "number" },
                        volume: { type: "number" },
                        change: { type: "number" },
                        timestamp: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          ],
          examples: [
            {
              name: "Get BTC and ETH prices",
              request: {
                url: "/api/v1/market-data?symbols=BTC/USD,ETH/USD",
                headers: {
                  "X-API-Key": "your-api-key",
                },
              },
              response: {
                data: [
                  {
                    symbol: "BTC/USD",
                    price: 42500.0,
                    volume: 1250000,
                    change: 2.5,
                    timestamp: "2024-01-20T10:30:00Z",
                  },
                ],
              },
            },
          ],
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-18T08:45:00Z",
      },
    ]

    endpoints.forEach((endpoint) => this.endpoints.set(endpoint.id, endpoint))
  }

  private initializeMetrics() {
    const metricsData: APIMetrics[] = [
      {
        endpointId: "api-001",
        timeframe: "24h",
        metrics: {
          totalRequests: 15420,
          successfulRequests: 15397,
          failedRequests: 23,
          averageResponseTime: 145,
          p95ResponseTime: 280,
          p99ResponseTime: 450,
          errorRate: 0.15,
          throughput: 642.5,
          uniqueUsers: 1250,
          topUserAgents: [
            { agent: "NEXURAL-Mobile/2.1.0", count: 8500 },
            { agent: "NEXURAL-Web/1.5.0", count: 4200 },
            { agent: "PostmanRuntime/7.32.0", count: 1800 },
          ],
          topIPs: [
            { ip: "192.168.1.100", count: 2500 },
            { ip: "10.0.0.50", count: 1800 },
            { ip: "172.16.0.25", count: 1200 },
          ],
          statusCodes: {
            "200": 15397,
            "401": 15,
            "429": 5,
            "500": 3,
          },
          errorTypes: {
            "Authentication Error": 15,
            "Rate Limit Exceeded": 5,
            "Internal Server Error": 3,
          },
        },
        trends: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          requests: Math.floor(Math.random() * 800) + 400,
          responseTime: Math.floor(Math.random() * 100) + 100,
          errors: Math.floor(Math.random() * 5),
        })),
      },
      {
        endpointId: "api-002",
        timeframe: "24h",
        metrics: {
          totalRequests: 8750,
          successfulRequests: 8738,
          failedRequests: 12,
          averageResponseTime: 89,
          p95ResponseTime: 150,
          p99ResponseTime: 220,
          errorRate: 0.14,
          throughput: 364.6,
          uniqueUsers: 890,
          topUserAgents: [
            { agent: "NEXURAL-Web/1.5.0", count: 5200 },
            { agent: "NEXURAL-Mobile/2.1.0", count: 2800 },
            { agent: "curl/7.68.0", count: 750 },
          ],
          topIPs: [
            { ip: "203.0.113.10", count: 1500 },
            { ip: "198.51.100.20", count: 1200 },
            { ip: "192.0.2.30", count: 900 },
          ],
          statusCodes: {
            "201": 8738,
            "400": 8,
            "409": 3,
            "500": 1,
          },
          errorTypes: {
            "Validation Error": 8,
            "Duplicate Email": 3,
            "Database Error": 1,
          },
        },
        trends: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          requests: Math.floor(Math.random() * 500) + 200,
          responseTime: Math.floor(Math.random() * 50) + 60,
          errors: Math.floor(Math.random() * 3),
        })),
      },
      {
        endpointId: "api-003",
        timeframe: "24h",
        metrics: {
          totalRequests: 25600,
          successfulRequests: 25444,
          failedRequests: 156,
          averageResponseTime: 234,
          p95ResponseTime: 450,
          p99ResponseTime: 680,
          errorRate: 0.61,
          throughput: 1066.7,
          uniqueUsers: 2100,
          topUserAgents: [
            { agent: "NEXURAL-Mobile/2.1.0", count: 12800 },
            { agent: "NEXURAL-Web/1.5.0", count: 8500 },
            { agent: "TradingBot/3.2.1", count: 3200 },
          ],
          topIPs: [
            { ip: "172.16.254.1", count: 3500 },
            { ip: "10.0.0.100", count: 2800 },
            { ip: "192.168.100.50", count: 2200 },
          ],
          statusCodes: {
            "200": 25444,
            "503": 120,
            "429": 25,
            "500": 11,
          },
          errorTypes: {
            "Service Unavailable": 120,
            "Rate Limit Exceeded": 25,
            "Internal Server Error": 11,
          },
        },
        trends: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          requests: Math.floor(Math.random() * 1200) + 800,
          responseTime: Math.floor(Math.random() * 150) + 150,
          errors: Math.floor(Math.random() * 10) + 2,
        })),
      },
    ]

    metricsData.forEach((metrics) => this.metrics.set(metrics.endpointId, metrics))
  }

  private initializeAPIKeys() {
    const keys: APIKey[] = [
      {
        id: "key-001",
        name: "Production Key - Mobile App",
        key: "nexural_prod_1234567890abcdef",
        hashedKey: "sha256:a1b2c3d4e5f6...",
        userId: "user-001",
        permissions: ["signals:read", "market:read", "portfolio:read"],
        rateLimit: {
          requests: 10000,
          window: 1,
          unit: "hour",
        },
        restrictions: {
          allowedEndpoints: ["api-001", "api-003"],
        },
        usage: {
          totalRequests: 125000,
          lastUsed: "2024-01-20T14:30:00Z",
          monthlyUsage: 45000,
          quotaUsed: 8500,
          quotaLimit: 10000,
        },
        status: "active",
        expiresAt: "2024-12-31T23:59:59Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "key-002",
        name: "Development Key",
        key: "nexural_dev_abcdef1234567890",
        hashedKey: "sha256:b2c3d4e5f6g7...",
        userId: "user-002",
        permissions: ["signals:read", "market:read"],
        rateLimit: {
          requests: 1000,
          window: 1,
          unit: "hour",
        },
        restrictions: {
          ipWhitelist: ["192.168.1.0/24", "10.0.0.0/8"],
        },
        usage: {
          totalRequests: 15000,
          lastUsed: "2024-01-20T12:15:00Z",
          monthlyUsage: 8500,
          quotaUsed: 750,
          quotaLimit: 1000,
        },
        status: "active",
        expiresAt: "2024-06-30T23:59:59Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-10T14:20:00Z",
      },
      {
        id: "key-003",
        name: "Testing Key - Suspended",
        key: "nexural_test_567890abcdef1234",
        hashedKey: "sha256:c3d4e5f6g7h8...",
        userId: "user-003",
        permissions: ["signals:read", "market:read", "users:write"],
        rateLimit: {
          requests: 5000,
          window: 1,
          unit: "hour",
        },
        restrictions: {},
        usage: {
          totalRequests: 85000,
          lastUsed: "2024-01-18T18:45:00Z",
          monthlyUsage: 25000,
          quotaUsed: 0,
          quotaLimit: 5000,
        },
        status: "suspended",
        expiresAt: "2024-03-31T23:59:59Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-18T20:00:00Z",
      },
    ]

    keys.forEach((key) => this.apiKeys.set(key.id, key))
  }

  private initializeAlerts() {
    const alerts: APIAlert[] = [
      {
        id: "alert-001",
        name: "High Error Rate Alert",
        description: "Alert when error rate exceeds 5% for any endpoint",
        type: "error-rate",
        conditions: {
          metric: "error_rate",
          operator: ">",
          threshold: 5,
          duration: 300,
        },
        endpoints: ["api-001", "api-002", "api-003"],
        notifications: {
          email: ["admin@nexural.com", "devops@nexural.com"],
          webhook: "https://hooks.slack.com/services/...",
          slack: "#alerts",
        },
        isActive: true,
        lastTriggered: "2024-01-19T15:30:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "alert-002",
        name: "Slow Response Time Alert",
        description: "Alert when average response time exceeds 2 seconds",
        type: "response-time",
        conditions: {
          metric: "avg_response_time",
          operator: ">",
          threshold: 2000,
          duration: 600,
        },
        endpoints: ["api-001", "api-003"],
        notifications: {
          email: ["performance@nexural.com"],
          slack: "#performance",
        },
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "alert-003",
        name: "High Request Volume Alert",
        description: "Alert when request volume exceeds normal patterns",
        type: "request-volume",
        conditions: {
          metric: "request_count",
          operator: ">",
          threshold: 50000,
          duration: 3600,
        },
        endpoints: ["api-003"],
        notifications: {
          email: ["scaling@nexural.com"],
          webhook: "https://hooks.slack.com/services/...",
        },
        isActive: false,
        createdAt: "2024-01-05T00:00:00Z",
      },
    ]

    alerts.forEach((alert) => this.alerts.set(alert.id, alert))
  }

  getEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values())
  }

  getEndpoint(id: string): APIEndpoint | undefined {
    return this.endpoints.get(id)
  }

  getEndpointMetrics(endpointId: string, timeframe = "24h"): APIMetrics | undefined {
    return this.metrics.get(endpointId)
  }

  getAPIKeys(): APIKey[] {
    return Array.from(this.apiKeys.values())
  }

  getAPIKey(id: string): APIKey | undefined {
    return this.apiKeys.get(id)
  }

  getAlerts(): APIAlert[] {
    return Array.from(this.alerts.values())
  }

  createAPIKey(keyData: Omit<APIKey, "id" | "key" | "hashedKey" | "createdAt" | "updatedAt">): string {
    const id = `key-${Date.now()}`
    const key = `nexural_${keyData.name.toLowerCase().replace(/\s+/g, "_")}_${Math.random().toString(36).substring(2, 15)}`
    const hashedKey = `sha256:${Math.random().toString(36).substring(2, 15)}...`

    const newKey: APIKey = {
      ...keyData,
      id,
      key,
      hashedKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.apiKeys.set(id, newKey)
    return id
  }

  updateAPIKey(keyId: string, updates: Partial<APIKey>): boolean {
    const key = this.apiKeys.get(keyId)
    if (!key) return false

    this.apiKeys.set(keyId, {
      ...key,
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    return true
  }

  revokeAPIKey(keyId: string): boolean {
    return this.updateAPIKey(keyId, { status: "revoked" })
  }

  createAlert(alertData: Omit<APIAlert, "id" | "createdAt">): string {
    const id = `alert-${Date.now()}`
    const newAlert: APIAlert = {
      ...alertData,
      id,
      createdAt: new Date().toISOString(),
    }

    this.alerts.set(id, newAlert)
    return id
  }

  updateEndpointStatus(endpointId: string, status: APIEndpoint["status"]): boolean {
    const endpoint = this.endpoints.get(endpointId)
    if (!endpoint) return false

    this.endpoints.set(endpointId, {
      ...endpoint,
      status,
      updatedAt: new Date().toISOString(),
    })
    return true
  }

  getUsageReport(period: "daily" | "weekly" | "monthly" = "daily"): APIUsageReport {
    const now = new Date()
    const startDate = new Date(now)
    const endDate = new Date(now)

    switch (period) {
      case "daily":
        startDate.setDate(now.getDate() - 1)
        break
      case "weekly":
        startDate.setDate(now.getDate() - 7)
        break
      case "monthly":
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const endpoints = this.getEndpoints()
    const totalRequests = endpoints.reduce((sum, endpoint) => {
      const metrics = this.getEndpointMetrics(endpoint.id)
      return sum + (metrics?.metrics.totalRequests || 0)
    }, 0)

    const totalUsers = Array.from(this.apiKeys.values()).filter((key) => key.status === "active").length
    const totalEndpoints = endpoints.filter((e) => e.status === "active").length

    const averageResponseTime =
      endpoints.reduce((sum, endpoint) => {
        const metrics = this.getEndpointMetrics(endpoint.id)
        return sum + (metrics?.metrics.averageResponseTime || 0)
      }, 0) / endpoints.length

    const errorRate =
      endpoints.reduce((sum, endpoint) => {
        const metrics = this.getEndpointMetrics(endpoint.id)
        return sum + (metrics?.metrics.errorRate || 0)
      }, 0) / endpoints.length

    const topEndpoints = endpoints
      .map((endpoint) => {
        const metrics = this.getEndpointMetrics(endpoint.id)
        return {
          endpoint: endpoint.name,
          requests: metrics?.metrics.totalRequests || 0,
          percentage: ((metrics?.metrics.totalRequests || 0) / totalRequests) * 100,
        }
      })
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)

    const topUsers = Array.from(this.apiKeys.values())
      .map((key) => ({
        userId: key.userId,
        requests: key.usage.monthlyUsage,
        percentage: (key.usage.monthlyUsage / totalRequests) * 100,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        totalRequests,
        totalUsers,
        totalEndpoints,
        averageResponseTime,
        errorRate,
        topEndpoints,
        topUsers,
      },
      trends: {
        daily: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          requests: Math.floor(Math.random() * 10000) + 5000,
          users: Math.floor(Math.random() * 500) + 200,
          errors: Math.floor(Math.random() * 100) + 10,
        })),
        hourly: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          requests: Math.floor(Math.random() * 2000) + 500,
          responseTime: Math.floor(Math.random() * 200) + 100,
        })),
      },
      geography: [
        { country: "United States", requests: Math.floor(totalRequests * 0.4), percentage: 40 },
        { country: "United Kingdom", requests: Math.floor(totalRequests * 0.2), percentage: 20 },
        { country: "Germany", requests: Math.floor(totalRequests * 0.15), percentage: 15 },
        { country: "Canada", requests: Math.floor(totalRequests * 0.1), percentage: 10 },
        { country: "Australia", requests: Math.floor(totalRequests * 0.08), percentage: 8 },
        { country: "Others", requests: Math.floor(totalRequests * 0.07), percentage: 7 },
      ],
      devices: [
        { type: "Mobile", requests: Math.floor(totalRequests * 0.6), percentage: 60 },
        { type: "Desktop", requests: Math.floor(totalRequests * 0.3), percentage: 30 },
        { type: "Tablet", requests: Math.floor(totalRequests * 0.07), percentage: 7 },
        { type: "API Client", requests: Math.floor(totalRequests * 0.03), percentage: 3 },
      ],
    }
  }

  getSystemHealth(): {
    overall: "healthy" | "warning" | "critical"
    endpoints: Array<{
      id: string
      name: string
      status: string
      health: "healthy" | "warning" | "critical"
      uptime: number
      lastCheck: string
    }>
    alerts: {
      active: number
      triggered: number
      resolved: number
    }
    performance: {
      averageResponseTime: number
      errorRate: number
      throughput: number
    }
  } {
    const endpoints = this.getEndpoints()
    const alerts = this.getAlerts()

    const endpointHealth = endpoints.map((endpoint) => {
      const metrics = this.getEndpointMetrics(endpoint.id)
      let health: "healthy" | "warning" | "critical" = "healthy"

      if (metrics) {
        if (metrics.metrics.errorRate > 10 || metrics.metrics.averageResponseTime > 5000) {
          health = "critical"
        } else if (metrics.metrics.errorRate > 5 || metrics.metrics.averageResponseTime > 2000) {
          health = "warning"
        }
      }

      return {
        id: endpoint.id,
        name: endpoint.name,
        status: endpoint.status,
        health,
        uptime: Math.random() * 10 + 95, // Mock uptime percentage
        lastCheck: new Date().toISOString(),
      }
    })

    const criticalCount = endpointHealth.filter((e) => e.health === "critical").length
    const warningCount = endpointHealth.filter((e) => e.health === "warning").length

    let overall: "healthy" | "warning" | "critical" = "healthy"
    if (criticalCount > 0) {
      overall = "critical"
    } else if (warningCount > 0) {
      overall = "warning"
    }

    const activeAlerts = alerts.filter((a) => a.isActive).length
    const triggeredAlerts = alerts.filter((a) => a.lastTriggered).length

    const totalRequests = endpoints.reduce((sum, endpoint) => {
      const metrics = this.getEndpointMetrics(endpoint.id)
      return sum + (metrics?.metrics.totalRequests || 0)
    }, 0)

    const averageResponseTime =
      endpoints.reduce((sum, endpoint) => {
        const metrics = this.getEndpointMetrics(endpoint.id)
        return sum + (metrics?.metrics.averageResponseTime || 0)
      }, 0) / endpoints.length

    const errorRate =
      endpoints.reduce((sum, endpoint) => {
        const metrics = this.getEndpointMetrics(endpoint.id)
        return sum + (metrics?.metrics.errorRate || 0)
      }, 0) / endpoints.length

    const throughput = totalRequests / 24 // Requests per hour

    return {
      overall,
      endpoints: endpointHealth,
      alerts: {
        active: activeAlerts,
        triggered: triggeredAlerts,
        resolved: alerts.length - triggeredAlerts,
      },
      performance: {
        averageResponseTime,
        errorRate,
        throughput,
      },
    }
  }

  searchEndpoints(
    query: string,
    filters?: {
      status?: string
      category?: string
      method?: string
    },
  ): APIEndpoint[] {
    const endpoints = this.getEndpoints()

    return endpoints.filter((endpoint) => {
      const matchesQuery =
        query === "" ||
        endpoint.name.toLowerCase().includes(query.toLowerCase()) ||
        endpoint.path.toLowerCase().includes(query.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(query.toLowerCase())

      const matchesStatus = !filters?.status || endpoint.status === filters.status
      const matchesCategory = !filters?.category || endpoint.category === filters.category
      const matchesMethod = !filters?.method || endpoint.method === filters.method

      return matchesQuery && matchesStatus && matchesCategory && matchesMethod
    })
  }
}

export const apiManagementDashboard = new APIManagementDashboard()
