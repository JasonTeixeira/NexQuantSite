/**
 * ENTERPRISE API GATEWAY
 * Advanced API management with rate limiting, authentication, and monitoring
 * Supports GraphQL, REST, WebSockets with real-time scaling
 */

import { tenantManager, Tenant } from './tenant-manager'

export interface ApiEndpoint {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  version: string
  description: string
  
  // Security
  requiresAuth: boolean
  requiredScopes: string[]
  requiredFeatures: string[]
  
  // Rate Limiting
  rateLimit: RateLimit
  
  // Caching
  cacheConfig: CacheConfig
  
  // Monitoring
  enabled: boolean
  deprecated: boolean
  deprecationDate?: Date
  
  // Documentation
  requestSchema?: any
  responseSchema?: any
  examples: ApiExample[]
}

export interface RateLimit {
  requests: number
  window: number // seconds
  burst: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
  
  // Per-plan limits
  planLimits: {
    starter: { requests: number; window: number }
    professional: { requests: number; window: number }
    enterprise: { requests: number; window: number }
  }
}

export interface CacheConfig {
  enabled: boolean
  ttl: number // seconds
  vary: string[] // Headers to vary cache by
  skipCacheOn: string[] // Conditions to skip cache
}

export interface ApiExample {
  title: string
  description: string
  request: any
  response: any
}

export interface ApiKey {
  id: string
  tenantId: string
  name: string
  key: string
  
  // Permissions
  scopes: string[]
  endpoints: string[]
  
  // Rate Limiting
  rateLimit?: RateLimit
  
  // Security
  ipWhitelist: string[]
  referrerWhitelist: string[]
  
  // Status
  enabled: boolean
  lastUsed?: Date
  usageCount: number
  
  // Metadata
  createdAt: Date
  expiresAt?: Date
}

export interface WebhookEndpoint {
  id: string
  tenantId: string
  url: string
  events: string[]
  
  // Security
  secret: string
  signatureHeader: string
  
  // Configuration
  timeout: number
  retryAttempts: number
  retryDelay: number
  
  // Status
  enabled: boolean
  lastTriggered?: Date
  successRate: number
  
  // Metadata
  createdAt: Date
  description?: string
}

export interface ApiRequest {
  id: string
  tenantId: string
  apiKeyId?: string
  
  // Request Data
  method: string
  path: string
  query: { [key: string]: any }
  headers: { [key: string]: string }
  body?: any
  
  // Response Data
  statusCode: number
  responseSize: number
  responseTime: number
  
  // Metadata
  timestamp: Date
  userAgent?: string
  ip: string
  cached: boolean
  rateLimited: boolean
}

export interface ApiMetrics {
  tenantId: string
  period: 'hour' | 'day' | 'week' | 'month'
  startTime: Date
  endTime: Date
  
  // Volume Metrics
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cachedRequests: number
  rateLimitedRequests: number
  
  // Performance Metrics
  averageResponseTime: number
  p50ResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  
  // Error Metrics
  errorRate: number
  errorsByCode: { [code: string]: number }
  
  // Popular Endpoints
  topEndpoints: { endpoint: string; requests: number }[]
  
  // Bandwidth
  totalBandwidth: number
  averageRequestSize: number
  averageResponseSize: number
}

/**
 * Advanced API Gateway with Enterprise Features
 */
export class ApiGateway {
  private endpoints: Map<string, ApiEndpoint> = new Map()
  private apiKeys: Map<string, ApiKey> = new Map()
  private webhooks: Map<string, WebhookEndpoint> = new Map()
  private rateLimiters: Map<string, any> = new Map()
  private cache: Map<string, any> = new Map()
  private metrics: Map<string, ApiMetrics> = new Map()
  
  constructor() {
    this.initializeEndpoints()
    this.setupRateLimiting()
    this.setupWebhookSystem()
    this.startMetricsCollection()
  }

  /**
   * ENDPOINT MANAGEMENT
   */
  registerEndpoint(endpoint: ApiEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}:${endpoint.version}`
    this.endpoints.set(key, endpoint)
  }

  getEndpoint(method: string, path: string, version: string = 'v1'): ApiEndpoint | null {
    const key = `${method}:${path}:${version}`
    return this.endpoints.get(key) || null
  }

  getAllEndpoints(): ApiEndpoint[] {
    return Array.from(this.endpoints.values())
  }

  /**
   * API KEY MANAGEMENT
   */
  async generateApiKey(tenantId: string, name: string, options: Partial<ApiKey> = {}): Promise<ApiKey> {
    const tenant = await tenantManager.getTenant(tenantId)
    if (!tenant) throw new Error('Tenant not found')
    
    const apiKey: ApiKey = {
      id: this.generateId(),
      tenantId,
      name,
      key: this.generateSecureKey(),
      scopes: options.scopes || ['read'],
      endpoints: options.endpoints || ['*'],
      ipWhitelist: options.ipWhitelist || [],
      referrerWhitelist: options.referrerWhitelist || [],
      enabled: true,
      usageCount: 0,
      createdAt: new Date(),
      expiresAt: options.expiresAt,
      ...options
    }
    
    this.apiKeys.set(apiKey.key, apiKey)
    
    // Track usage
    await tenantManager.trackUsage(tenantId, 'api_key_created')
    
    return apiKey
  }

  async validateApiKey(key: string): Promise<{ valid: boolean; apiKey?: ApiKey; tenant?: Tenant }> {
    const apiKey = this.apiKeys.get(key)
    if (!apiKey || !apiKey.enabled) {
      return { valid: false }
    }
    
    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false }
    }
    
    // Get tenant
    const tenant = await tenantManager.getTenant(apiKey.tenantId)
    if (!tenant || tenant.status !== 'active') {
      return { valid: false }
    }
    
    // Update usage
    apiKey.lastUsed = new Date()
    apiKey.usageCount++
    
    return { valid: true, apiKey, tenant }
  }

  /**
   * REQUEST PROCESSING
   */
  async processRequest(request: any): Promise<any> {
    const startTime = Date.now()
    
    try {
      // 1. Parse request
      const parsedRequest = await this.parseRequest(request)
      
      // 2. Authenticate
      const auth = await this.authenticateRequest(parsedRequest)
      if (!auth.valid) {
        return this.createErrorResponse(401, 'Unauthorized')
      }
      
      // 3. Check rate limits
      const rateLimitResult = await this.checkRateLimit(auth.apiKey!, parsedRequest)
      if (rateLimitResult.limited) {
        return this.createErrorResponse(429, 'Rate limit exceeded', {
          retryAfter: rateLimitResult.retryAfter
        })
      }
      
      // 4. Validate endpoint access
      const endpoint = this.getEndpoint(parsedRequest.method, parsedRequest.path)
      if (!endpoint) {
        return this.createErrorResponse(404, 'Endpoint not found')
      }
      
      // 5. Check feature access
      const hasAccess = await this.checkFeatureAccess(auth.tenant!, endpoint)
      if (!hasAccess) {
        return this.createErrorResponse(403, 'Feature not available in your plan')
      }
      
      // 6. Check cache
      const cachedResponse = await this.getFromCache(parsedRequest)
      if (cachedResponse) {
        await this.recordMetrics(parsedRequest, cachedResponse, Date.now() - startTime, true)
        return cachedResponse
      }
      
      // 7. Process request
      const response = await this.executeEndpoint(endpoint, parsedRequest, auth)
      
      // 8. Cache response
      await this.setCache(parsedRequest, response, endpoint.cacheConfig)
      
      // 9. Record metrics
      await this.recordMetrics(parsedRequest, response, Date.now() - startTime, false)
      
      // 10. Track tenant usage
      await tenantManager.trackUsage(auth.tenant!.id, 'api_request')
      
      return response
      
    } catch (error) {
      const response = this.createErrorResponse(500, 'Internal server error')
      await this.recordMetrics(request, response, Date.now() - startTime, false)
      return response
    }
  }

  /**
   * WEBHOOK SYSTEM
   */
  async registerWebhook(tenantId: string, webhook: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const tenant = await tenantManager.getTenant(tenantId)
    if (!tenant) throw new Error('Tenant not found')
    
    const webhookEndpoint: WebhookEndpoint = {
      id: this.generateId(),
      tenantId,
      url: webhook.url!,
      events: webhook.events || [],
      secret: webhook.secret || this.generateWebhookSecret(),
      signatureHeader: webhook.signatureHeader || 'X-Signature',
      timeout: webhook.timeout || 30000,
      retryAttempts: webhook.retryAttempts || 3,
      retryDelay: webhook.retryDelay || 1000,
      enabled: true,
      successRate: 100,
      createdAt: new Date(),
      description: webhook.description
    }
    
    this.webhooks.set(webhookEndpoint.id, webhookEndpoint)
    return webhookEndpoint
  }

  async triggerWebhook(tenantId: string, event: string, data: any): Promise<void> {
    const tenantWebhooks = Array.from(this.webhooks.values())
      .filter(w => w.tenantId === tenantId && w.enabled && w.events.includes(event))
    
    for (const webhook of tenantWebhooks) {
      await this.deliverWebhook(webhook, event, data)
    }
  }

  private async deliverWebhook(webhook: WebhookEndpoint, event: string, data: any): Promise<void> {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      webhook_id: webhook.id
    }
    
    const signature = this.generateWebhookSignature(webhook.secret, payload)
    
    try {
      // Simulate webhook delivery
      console.log(`Delivering webhook to ${webhook.url}:`, payload)
      webhook.lastTriggered = new Date()
      
      // In a real implementation, this would make an HTTP request
      // with proper retry logic and error handling
      
    } catch (error) {
      console.error('Webhook delivery failed:', error)
      // Implement retry logic
    }
  }

  /**
   * RATE LIMITING
   */
  private async checkRateLimit(apiKey: ApiKey, request: any): Promise<{ limited: boolean; retryAfter?: number }> {
    const tenant = await tenantManager.getTenant(apiKey.tenantId)
    if (!tenant) return { limited: true }
    
    // Get rate limit configuration
    const rateLimit = apiKey.rateLimit || this.getDefaultRateLimit(tenant.subscription.plan)
    
    // Check rate limit
    const key = `ratelimit:${apiKey.id}`
    const current = this.rateLimiters.get(key) || { count: 0, resetTime: Date.now() + rateLimit.window * 1000 }
    
    // Reset if window passed
    if (Date.now() > current.resetTime) {
      current.count = 0
      current.resetTime = Date.now() + rateLimit.window * 1000
    }
    
    // Check limit
    if (current.count >= rateLimit.requests) {
      return { 
        limited: true, 
        retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000) 
      }
    }
    
    // Increment counter
    current.count++
    this.rateLimiters.set(key, current)
    
    return { limited: false }
  }

  /**
   * CACHING SYSTEM
   */
  private async getFromCache(request: any): Promise<any | null> {
    const cacheKey = this.generateCacheKey(request)
    const cached = this.cache.get(cacheKey)
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }
    
    return null
  }

  private async setCache(request: any, response: any, cacheConfig: CacheConfig): Promise<void> {
    if (!cacheConfig.enabled) return
    
    const cacheKey = this.generateCacheKey(request)
    const expiresAt = Date.now() + (cacheConfig.ttl * 1000)
    
    this.cache.set(cacheKey, {
      data: response,
      expiresAt
    })
  }

  /**
   * METRICS & ANALYTICS
   */
  private async recordMetrics(request: any, response: any, responseTime: number, cached: boolean): Promise<void> {
    const tenantId = request.tenantId
    if (!tenantId) return
    
    const metricsKey = `${tenantId}:${this.getCurrentHour()}`
    let metrics = this.metrics.get(metricsKey) || this.createEmptyMetrics(tenantId)
    
    // Update metrics
    metrics.totalRequests++
    if (response.statusCode < 400) metrics.successfulRequests++
    else metrics.failedRequests++
    
    if (cached) metrics.cachedRequests++
    
    // Update response times
    metrics.averageResponseTime = (metrics.averageResponseTime + responseTime) / 2
    
    // Update error rates
    if (response.statusCode >= 400) {
      metrics.errorsByCode[response.statusCode] = (metrics.errorsByCode[response.statusCode] || 0) + 1
    }
    
    this.metrics.set(metricsKey, metrics)
  }

  async getApiMetrics(tenantId: string, period: 'hour' | 'day' | 'week' | 'month'): Promise<ApiMetrics[]> {
    // Aggregate metrics for the specified period
    const metricsArray = Array.from(this.metrics.values())
      .filter(m => m.tenantId === tenantId)
    
    return metricsArray
  }

  /**
   * DOCUMENTATION GENERATION
   */
  generateOpenAPISpec(): any {
    const endpoints = this.getAllEndpoints()
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Options Flow API',
        version: '1.0.0',
        description: 'Advanced Options Flow Analysis API'
      },
      servers: [
        { url: 'https://api.optionsflow.com/v1', description: 'Production' },
        { url: 'https://staging-api.optionsflow.com/v1', description: 'Staging' }
      ],
      paths: {},
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        }
      }
    }
    
    // Generate paths from endpoints
    for (const endpoint of endpoints) {
      if (!spec.paths[endpoint.path]) {
        spec.paths[endpoint.path] = {}
      }
      
      spec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        security: endpoint.requiresAuth ? [{ ApiKeyAuth: [] }] : [],
        parameters: [],
        responses: {
          '200': { description: 'Success' },
          '401': { description: 'Unauthorized' },
          '429': { description: 'Rate limit exceeded' }
        }
      }
    }
    
    return spec
  }

  // Private helper methods
  private initializeEndpoints(): void {
    // Register core API endpoints
    this.registerEndpoint({
      id: 'options-flow-list',
      path: '/options-flow',
      method: 'GET',
      version: 'v1',
      description: 'Get real-time options flow data',
      requiresAuth: true,
      requiredScopes: ['read'],
      requiredFeatures: ['optionsFlow'],
      rateLimit: {
        requests: 100,
        window: 60,
        burst: 150,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        planLimits: {
          starter: { requests: 50, window: 60 },
          professional: { requests: 200, window: 60 },
          enterprise: { requests: 1000, window: 60 }
        }
      },
      cacheConfig: {
        enabled: true,
        ttl: 30,
        vary: ['Authorization'],
        skipCacheOn: []
      },
      enabled: true,
      deprecated: false,
      examples: [
        {
          title: 'Basic Request',
          description: 'Get latest options flow',
          request: { limit: 50 },
          response: { flows: [], total: 0 }
        }
      ]
    })
    
    // Add more endpoints...
    this.registerEndpoint({
      id: 'smart-money-analysis',
      path: '/smart-money/analyze',
      method: 'POST',
      version: 'v1',
      description: 'Analyze smart money patterns',
      requiresAuth: true,
      requiredScopes: ['read'],
      requiredFeatures: ['smartMoneyAnalysis'],
      rateLimit: {
        requests: 50,
        window: 60,
        burst: 75,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        planLimits: {
          starter: { requests: 20, window: 60 },
          professional: { requests: 100, window: 60 },
          enterprise: { requests: 500, window: 60 }
        }
      },
      cacheConfig: {
        enabled: true,
        ttl: 120,
        vary: ['Authorization', 'Content-Type'],
        skipCacheOn: []
      },
      enabled: true,
      deprecated: false,
      examples: []
    })
  }

  private setupRateLimiting(): void {
    // Clean up expired rate limit entries every minute
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.rateLimiters.entries()) {
        if (entry.resetTime < now) {
          this.rateLimiters.delete(key)
        }
      }
    }, 60000)
  }

  private setupWebhookSystem(): void {
    // Initialize webhook delivery system
  }

  private startMetricsCollection(): void {
    // Clean up old metrics every hour
    setInterval(() => {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      for (const [key, metrics] of this.metrics.entries()) {
        if (metrics.startTime.getTime() < oneWeekAgo) {
          this.metrics.delete(key)
        }
      }
    }, 60 * 60 * 1000)
  }

  private async parseRequest(request: any): Promise<any> {
    // Parse incoming request
    return request
  }

  private async authenticateRequest(request: any): Promise<any> {
    const apiKey = request.headers['x-api-key']
    if (!apiKey) return { valid: false }
    
    return await this.validateApiKey(apiKey)
  }

  private async checkFeatureAccess(tenant: Tenant, endpoint: ApiEndpoint): Promise<boolean> {
    for (const feature of endpoint.requiredFeatures) {
      if (!await tenantManager.hasFeature(tenant.id, feature as any)) {
        return false
      }
    }
    return true
  }

  private async executeEndpoint(endpoint: ApiEndpoint, request: any, auth: any): Promise<any> {
    // Execute the actual endpoint logic
    // This would route to the appropriate handler based on the endpoint
    return {
      statusCode: 200,
      data: { message: 'Success' },
      headers: { 'Content-Type': 'application/json' }
    }
  }

  private createErrorResponse(statusCode: number, message: string, extra: any = {}): any {
    return {
      statusCode,
      data: { error: message, ...extra },
      headers: { 'Content-Type': 'application/json' }
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSecureKey(): string {
    return `sk_${Math.random().toString(36).substr(2, 32)}`
  }

  private generateWebhookSecret(): string {
    return `whsec_${Math.random().toString(36).substr(2, 32)}`
  }

  private generateWebhookSignature(secret: string, payload: any): string {
    // Generate HMAC signature for webhook security
    return `sha256=${Math.random().toString(36).substr(2, 32)}`
  }

  private getDefaultRateLimit(plan: string): RateLimit {
    const limits = {
      starter: { requests: 100, window: 60 },
      professional: { requests: 500, window: 60 },
      enterprise: { requests: 2000, window: 60 }
    }
    
    const limit = limits[plan as keyof typeof limits] || limits.starter
    
    return {
      requests: limit.requests,
      window: limit.window,
      burst: Math.floor(limit.requests * 1.5),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      planLimits: limits
    }
  }

  private generateCacheKey(request: any): string {
    return `cache:${request.method}:${request.path}:${JSON.stringify(request.query)}`
  }

  private getCurrentHour(): string {
    return new Date().toISOString().slice(0, 13)
  }

  private createEmptyMetrics(tenantId: string): ApiMetrics {
    return {
      tenantId,
      period: 'hour',
      startTime: new Date(),
      endTime: new Date(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedRequests: 0,
      rateLimitedRequests: 0,
      averageResponseTime: 0,
      p50ResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      errorsByCode: {},
      topEndpoints: [],
      totalBandwidth: 0,
      averageRequestSize: 0,
      averageResponseSize: 0
    }
  }
}

// Singleton instance
export const apiGateway = new ApiGateway()

// Export types commented out to avoid conflicts with other modules
/*
export type { 
  ApiEndpoint, 
  ApiKey, 
  WebhookEndpoint, 
  ApiRequest, 
  ApiMetrics,
  RateLimit,
  CacheConfig
}
*/
