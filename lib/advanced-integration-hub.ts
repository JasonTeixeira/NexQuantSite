export interface Integration {
  id: string
  name: string
  provider: string
  type: "api" | "webhook" | "database" | "file" | "messaging"
  status: "active" | "inactive" | "error" | "pending"
  category: "trading" | "analytics" | "communication" | "payment" | "storage" | "other"
  config: IntegrationConfig
  metrics: IntegrationMetrics
  createdAt: Date
  lastSync: Date
}

export interface IntegrationConfig {
  endpoint?: string
  apiKey?: string
  secretKey?: string
  headers?: Record<string, string>
  parameters?: Record<string, any>
  authentication: "api_key" | "oauth" | "basic" | "bearer" | "none"
  rateLimits?: RateLimit
  retryPolicy?: RetryPolicy
  dataMapping?: DataMapping[]
}

export interface RateLimit {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  burstLimit: number
}

export interface RetryPolicy {
  maxRetries: number
  backoffStrategy: "linear" | "exponential" | "fixed"
  initialDelay: number
  maxDelay: number
}

export interface DataMapping {
  source: string
  target: string
  transformation?: string
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: "required" | "type" | "range" | "pattern" | "custom"
  value?: any
  message: string
}

export interface IntegrationMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  dataTransferred: number
  lastError?: string
  uptime: number
}

export interface DataFlow {
  id: string
  name: string
  sourceIntegrationId: string
  targetIntegrationId: string
  status: "active" | "paused" | "error"
  schedule: FlowSchedule
  transformations: DataTransformation[]
  metrics: FlowMetrics
  lastRun: Date
}

export interface FlowSchedule {
  type: "realtime" | "interval" | "cron"
  interval?: number // minutes
  cronExpression?: string
  timezone: string
}

export interface DataTransformation {
  id: string
  type: "filter" | "map" | "aggregate" | "validate" | "enrich"
  config: Record<string, any>
  order: number
}

export interface FlowMetrics {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  recordsProcessed: number
  averageRunTime: number
  lastError?: string
}

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers: Record<string, string>
  authentication: WebhookAuth
  events: string[]
  status: "active" | "inactive"
  metrics: WebhookMetrics
}

export interface WebhookAuth {
  type: "none" | "signature" | "basic" | "bearer"
  secret?: string
  username?: string
  password?: string
  token?: string
}

export interface WebhookMetrics {
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  averageResponseTime: number
  lastDelivery: Date
}

export interface APIEndpoint {
  id: string
  path: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  description: string
  parameters: APIParameter[]
  responses: APIResponse[]
  authentication: boolean
  rateLimit: RateLimit
  metrics: APIMetrics
}

export interface APIParameter {
  name: string
  type: "string" | "number" | "boolean" | "object" | "array"
  required: boolean
  description: string
  example?: any
}

export interface APIResponse {
  statusCode: number
  description: string
  schema?: Record<string, any>
  example?: any
}

export interface APIMetrics {
  totalRequests: number
  requestsByMethod: Record<string, number>
  requestsByStatus: Record<number, number>
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  errorRate: number
}

export class AdvancedIntegrationHub {
  private integrations: Integration[] = []
  private dataFlows: DataFlow[] = []
  private webhookEndpoints: WebhookEndpoint[] = []
  private apiEndpoints: APIEndpoint[] = []

  constructor() {
    this.initializeDefaultIntegrations()
    this.initializeDataFlows()
    this.initializeWebhooks()
    this.initializeAPIEndpoints()
  }

  private initializeDefaultIntegrations() {
    this.integrations = [
      {
        id: "1",
        name: "Binance API",
        provider: "Binance",
        type: "api",
        status: "active",
        category: "trading",
        config: {
          endpoint: "https://api.binance.com",
          authentication: "api_key",
          rateLimits: {
            requestsPerMinute: 1200,
            requestsPerHour: 72000,
            requestsPerDay: 1728000,
            burstLimit: 100,
          },
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: "exponential",
            initialDelay: 1000,
            maxDelay: 10000,
          },
        },
        metrics: {
          totalRequests: 125430,
          successfulRequests: 124890,
          failedRequests: 540,
          averageResponseTime: 145,
          dataTransferred: 2.5e9,
          uptime: 99.7,
        },
        createdAt: new Date("2024-01-01"),
        lastSync: new Date(),
      },
      {
        id: "2",
        name: "Stripe Payments",
        provider: "Stripe",
        type: "api",
        status: "active",
        category: "payment",
        config: {
          endpoint: "https://api.stripe.com",
          authentication: "bearer",
          rateLimits: {
            requestsPerMinute: 100,
            requestsPerHour: 6000,
            requestsPerDay: 144000,
            burstLimit: 25,
          },
        },
        metrics: {
          totalRequests: 45230,
          successfulRequests: 44980,
          failedRequests: 250,
          averageResponseTime: 320,
          dataTransferred: 1.2e8,
          uptime: 99.9,
        },
        createdAt: new Date("2024-01-05"),
        lastSync: new Date(),
      },
      {
        id: "3",
        name: "SendGrid Email",
        provider: "SendGrid",
        type: "api",
        status: "active",
        category: "communication",
        config: {
          endpoint: "https://api.sendgrid.com",
          authentication: "bearer",
          rateLimits: {
            requestsPerMinute: 600,
            requestsPerHour: 36000,
            requestsPerDay: 864000,
            burstLimit: 50,
          },
        },
        metrics: {
          totalRequests: 78450,
          successfulRequests: 77890,
          failedRequests: 560,
          averageResponseTime: 280,
          dataTransferred: 5.6e8,
          uptime: 99.5,
        },
        createdAt: new Date("2024-01-10"),
        lastSync: new Date(),
      },
      {
        id: "4",
        name: "AWS S3 Storage",
        provider: "Amazon Web Services",
        type: "api",
        status: "active",
        category: "storage",
        config: {
          endpoint: "https://s3.amazonaws.com",
          authentication: "api_key",
          rateLimits: {
            requestsPerMinute: 3500,
            requestsPerHour: 210000,
            requestsPerDay: 5040000,
            burstLimit: 200,
          },
        },
        metrics: {
          totalRequests: 234560,
          successfulRequests: 233890,
          failedRequests: 670,
          averageResponseTime: 95,
          dataTransferred: 15.8e9,
          uptime: 99.8,
        },
        createdAt: new Date("2024-01-03"),
        lastSync: new Date(),
      },
    ]
  }

  private initializeDataFlows() {
    this.dataFlows = [
      {
        id: "1",
        name: "Trading Data Sync",
        sourceIntegrationId: "1",
        targetIntegrationId: "4",
        status: "active",
        schedule: {
          type: "interval",
          interval: 5,
          timezone: "UTC",
        },
        transformations: [
          {
            id: "1",
            type: "filter",
            config: { condition: "volume > 1000" },
            order: 1,
          },
          {
            id: "2",
            type: "map",
            config: {
              mapping: {
                symbol: "trading_pair",
                price: "current_price",
                volume: "trading_volume",
              },
            },
            order: 2,
          },
        ],
        metrics: {
          totalRuns: 8640,
          successfulRuns: 8590,
          failedRuns: 50,
          recordsProcessed: 2.5e6,
          averageRunTime: 2.3,
          lastError: "Rate limit exceeded",
        },
        lastRun: new Date(),
      },
      {
        id: "2",
        name: "User Analytics Pipeline",
        sourceIntegrationId: "2",
        targetIntegrationId: "4",
        status: "active",
        schedule: {
          type: "cron",
          cronExpression: "0 */6 * * *",
          timezone: "UTC",
        },
        transformations: [
          {
            id: "3",
            type: "aggregate",
            config: {
              groupBy: ["user_id"],
              metrics: ["sum(amount)", "count(transactions)"],
            },
            order: 1,
          },
        ],
        metrics: {
          totalRuns: 1440,
          successfulRuns: 1435,
          failedRuns: 5,
          recordsProcessed: 450000,
          averageRunTime: 45.2,
        },
        lastRun: new Date(),
      },
    ]
  }

  private initializeWebhooks() {
    this.webhookEndpoints = [
      {
        id: "1",
        name: "Payment Notifications",
        url: "https://api.nexural.com/webhooks/payments",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Source": "stripe",
        },
        authentication: {
          type: "signature",
          secret: "whsec_...",
        },
        events: ["payment.succeeded", "payment.failed", "subscription.updated"],
        status: "active",
        metrics: {
          totalDeliveries: 12450,
          successfulDeliveries: 12380,
          failedDeliveries: 70,
          averageResponseTime: 150,
          lastDelivery: new Date(),
        },
      },
      {
        id: "2",
        name: "Trading Alerts",
        url: "https://api.nexural.com/webhooks/trading",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        authentication: {
          type: "bearer",
          token: "bearer_token_...",
        },
        events: ["price.alert", "order.filled", "position.closed"],
        status: "active",
        metrics: {
          totalDeliveries: 45670,
          successfulDeliveries: 45230,
          failedDeliveries: 440,
          averageResponseTime: 95,
          lastDelivery: new Date(),
        },
      },
    ]
  }

  private initializeAPIEndpoints() {
    this.apiEndpoints = [
      {
        id: "1",
        path: "/api/v1/users",
        method: "GET",
        description: "Retrieve user information",
        parameters: [
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Number of users to return",
            example: 50,
          },
          {
            name: "offset",
            type: "number",
            required: false,
            description: "Number of users to skip",
            example: 0,
          },
        ],
        responses: [
          {
            statusCode: 200,
            description: "Successful response",
            schema: {
              type: "object",
              properties: {
                users: { type: "array" },
                total: { type: "number" },
              },
            },
          },
        ],
        authentication: true,
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerHour: 6000,
          requestsPerDay: 144000,
          burstLimit: 20,
        },
        metrics: {
          totalRequests: 125430,
          requestsByMethod: { GET: 125430 },
          requestsByStatus: { 200: 124890, 400: 340, 500: 200 },
          averageResponseTime: 145,
          p95ResponseTime: 280,
          p99ResponseTime: 450,
          errorRate: 0.43,
        },
      },
      {
        id: "2",
        path: "/api/v1/trading/orders",
        method: "POST",
        description: "Create a new trading order",
        parameters: [
          {
            name: "symbol",
            type: "string",
            required: true,
            description: "Trading pair symbol",
            example: "BTCUSDT",
          },
          {
            name: "side",
            type: "string",
            required: true,
            description: "Order side (buy/sell)",
            example: "buy",
          },
          {
            name: "quantity",
            type: "number",
            required: true,
            description: "Order quantity",
            example: 0.001,
          },
        ],
        responses: [
          {
            statusCode: 201,
            description: "Order created successfully",
            schema: {
              type: "object",
              properties: {
                orderId: { type: "string" },
                status: { type: "string" },
              },
            },
          },
        ],
        authentication: true,
        rateLimit: {
          requestsPerMinute: 50,
          requestsPerHour: 3000,
          requestsPerDay: 72000,
          burstLimit: 10,
        },
        metrics: {
          totalRequests: 78450,
          requestsByMethod: { POST: 78450 },
          requestsByStatus: { 201: 77890, 400: 450, 500: 110 },
          averageResponseTime: 320,
          p95ResponseTime: 650,
          p99ResponseTime: 1200,
          errorRate: 0.71,
        },
      },
    ]
  }

  // Integration Management
  getIntegrations(): Integration[] {
    return this.integrations
  }

  getIntegration(id: string): Integration | null {
    return this.integrations.find((i) => i.id === id) || null
  }

  createIntegration(integration: Omit<Integration, "id" | "createdAt" | "lastSync" | "metrics">): Integration {
    const newIntegration: Integration = {
      ...integration,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastSync: new Date(),
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        dataTransferred: 0,
        uptime: 100,
      },
    }
    this.integrations.push(newIntegration)
    return newIntegration
  }

  updateIntegration(id: string, updates: Partial<Integration>): Integration | null {
    const index = this.integrations.findIndex((i) => i.id === id)
    if (index === -1) return null

    this.integrations[index] = { ...this.integrations[index], ...updates }
    return this.integrations[index]
  }

  deleteIntegration(id: string): boolean {
    const index = this.integrations.findIndex((i) => i.id === id)
    if (index === -1) return false

    this.integrations.splice(index, 1)
    return true
  }

  testIntegration(id: string): Promise<{ success: boolean; responseTime: number; error?: string }> {
    return new Promise((resolve) => {
      const integration = this.integrations.find((i) => i.id === id)
      if (!integration) {
        resolve({ success: false, responseTime: 0, error: "Integration not found" })
        return
      }

      // Simulate API test
      setTimeout(() => {
        const success = Math.random() > 0.1 // 90% success rate
        const responseTime = 50 + Math.random() * 500

        resolve({
          success,
          responseTime,
          error: success ? undefined : "Connection timeout",
        })
      }, 1000)
    })
  }

  // Data Flow Management
  getDataFlows(): DataFlow[] {
    return this.dataFlows
  }

  createDataFlow(flow: Omit<DataFlow, "id" | "lastRun" | "metrics">): DataFlow {
    const newFlow: DataFlow = {
      ...flow,
      id: Date.now().toString(),
      lastRun: new Date(),
      metrics: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        recordsProcessed: 0,
        averageRunTime: 0,
      },
    }
    this.dataFlows.push(newFlow)
    return newFlow
  }

  executeDataFlow(id: string): Promise<{ success: boolean; recordsProcessed: number; duration: number }> {
    return new Promise((resolve) => {
      const flow = this.dataFlows.find((f) => f.id === id)
      if (!flow) {
        resolve({ success: false, recordsProcessed: 0, duration: 0 })
        return
      }

      const startTime = Date.now()

      // Simulate flow execution
      setTimeout(
        () => {
          const success = Math.random() > 0.05 // 95% success rate
          const recordsProcessed = Math.floor(Math.random() * 10000) + 1000
          const duration = Date.now() - startTime

          // Update metrics
          flow.metrics.totalRuns++
          if (success) {
            flow.metrics.successfulRuns++
            flow.metrics.recordsProcessed += recordsProcessed
          } else {
            flow.metrics.failedRuns++
            flow.metrics.lastError = "Processing error occurred"
          }
          flow.metrics.averageRunTime =
            (flow.metrics.averageRunTime * (flow.metrics.totalRuns - 1) + duration) / flow.metrics.totalRuns
          flow.lastRun = new Date()

          resolve({ success, recordsProcessed, duration })
        },
        2000 + Math.random() * 3000,
      )
    })
  }

  // Webhook Management
  getWebhookEndpoints(): WebhookEndpoint[] {
    return this.webhookEndpoints
  }

  createWebhookEndpoint(webhook: Omit<WebhookEndpoint, "id" | "metrics">): WebhookEndpoint {
    const newWebhook: WebhookEndpoint = {
      ...webhook,
      id: Date.now().toString(),
      metrics: {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        averageResponseTime: 0,
        lastDelivery: new Date(),
      },
    }
    this.webhookEndpoints.push(newWebhook)
    return newWebhook
  }

  // API Endpoint Management
  getAPIEndpoints(): APIEndpoint[] {
    return this.apiEndpoints
  }

  // Analytics
  getIntegrationAnalytics() {
    const totalRequests = this.integrations.reduce((sum, i) => sum + i.metrics.totalRequests, 0)
    const totalErrors = this.integrations.reduce((sum, i) => sum + i.metrics.failedRequests, 0)
    const averageUptime = this.integrations.reduce((sum, i) => sum + i.metrics.uptime, 0) / this.integrations.length

    return {
      totalIntegrations: this.integrations.length,
      activeIntegrations: this.integrations.filter((i) => i.status === "active").length,
      totalRequests,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      averageUptime,
      integrationsByCategory: this.getIntegrationsByCategory(),
      topIntegrations: this.getTopIntegrations(),
      recentActivity: this.getRecentActivity(),
    }
  }

  private getIntegrationsByCategory() {
    const categories = this.integrations.reduce(
      (acc, integration) => {
        acc[integration.category] = (acc[integration.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      percentage: (count / this.integrations.length) * 100,
    }))
  }

  private getTopIntegrations() {
    return this.integrations
      .sort((a, b) => b.metrics.totalRequests - a.metrics.totalRequests)
      .slice(0, 5)
      .map((integration) => ({
        name: integration.name,
        provider: integration.provider,
        requests: integration.metrics.totalRequests,
        uptime: integration.metrics.uptime,
      }))
  }

  private getRecentActivity() {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).getHours(),
      requests: Math.floor(Math.random() * 1000) + 100,
      errors: Math.floor(Math.random() * 50),
    }))
  }

  getDataFlowAnalytics() {
    const totalRuns = this.dataFlows.reduce((sum, f) => sum + f.metrics.totalRuns, 0)
    const successfulRuns = this.dataFlows.reduce((sum, f) => sum + f.metrics.successfulRuns, 0)
    const totalRecords = this.dataFlows.reduce((sum, f) => sum + f.metrics.recordsProcessed, 0)

    return {
      totalFlows: this.dataFlows.length,
      activeFlows: this.dataFlows.filter((f) => f.status === "active").length,
      totalRuns,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
      totalRecordsProcessed: totalRecords,
      averageRunTime: this.dataFlows.reduce((sum, f) => sum + f.metrics.averageRunTime, 0) / this.dataFlows.length,
      flowPerformance: this.dataFlows.map((flow) => ({
        name: flow.name,
        successRate: flow.metrics.totalRuns > 0 ? (flow.metrics.successfulRuns / flow.metrics.totalRuns) * 100 : 0,
        averageRunTime: flow.metrics.averageRunTime,
        recordsProcessed: flow.metrics.recordsProcessed,
      })),
    }
  }

  getAPIAnalytics() {
    const totalRequests = this.apiEndpoints.reduce((sum, e) => sum + e.metrics.totalRequests, 0)
    const totalErrors = this.apiEndpoints.reduce(
      (sum, e) =>
        sum +
        Object.values(e.metrics.requestsByStatus)
          .filter((_, index) => Object.keys(e.metrics.requestsByStatus)[index] >= "400")
          .reduce((errorSum, count) => errorSum + count, 0),
      0,
    )

    return {
      totalEndpoints: this.apiEndpoints.length,
      totalRequests,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      averageResponseTime:
        this.apiEndpoints.reduce((sum, e) => sum + e.metrics.averageResponseTime, 0) / this.apiEndpoints.length,
      endpointPerformance: this.apiEndpoints.map((endpoint) => ({
        path: endpoint.path,
        method: endpoint.method,
        requests: endpoint.metrics.totalRequests,
        errorRate: endpoint.metrics.errorRate,
        averageResponseTime: endpoint.metrics.averageResponseTime,
      })),
      requestsByMethod: this.getRequestsByMethod(),
      responseTimeDistribution: this.getResponseTimeDistribution(),
    }
  }

  private getRequestsByMethod() {
    const methods = this.apiEndpoints.reduce(
      (acc, endpoint) => {
        acc[endpoint.method] = (acc[endpoint.method] || 0) + endpoint.metrics.totalRequests
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(methods).map(([method, count]) => ({
      method,
      count,
      percentage: (count / this.apiEndpoints.reduce((sum, e) => sum + e.metrics.totalRequests, 0)) * 100,
    }))
  }

  private getResponseTimeDistribution() {
    return this.apiEndpoints.map((endpoint) => ({
      path: endpoint.path,
      average: endpoint.metrics.averageResponseTime,
      p95: endpoint.metrics.p95ResponseTime,
      p99: endpoint.metrics.p99ResponseTime,
    }))
  }
}

export const advancedIntegrationHub = new AdvancedIntegrationHub()
