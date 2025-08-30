/**
 * Load Balancing Configuration and Utilities
 * Handles traffic distribution, health checks, and failover
 */

// Load Balancer Configuration
export interface LoadBalancerConfig {
  strategy: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash' | 'health_based'
  healthCheckInterval: number
  failoverTimeout: number
  maxRetries: number
  stickySession: boolean
  backoffStrategy: 'linear' | 'exponential'
}

export interface ServerNode {
  id: string
  host: string
  port: number
  weight: number
  healthy: boolean
  activeConnections: number
  totalRequests: number
  responseTime: number
  lastHealthCheck: number
  region?: string
  datacenter?: string
  capabilities?: string[]
}

export interface HealthCheckConfig {
  endpoint: string
  timeout: number
  interval: number
  retries: number
  expectedStatus: number[]
  expectedHeaders?: Record<string, string>
  expectedBody?: string
}

// Load Balancer Implementation
export class LoadBalancer {
  private servers: Map<string, ServerNode> = new Map()
  private config: LoadBalancerConfig
  private healthCheckConfig: HealthCheckConfig
  private roundRobinIndex = 0
  private sessionMap: Map<string, string> = new Map() // sessionId -> serverId
  
  constructor(
    config: Partial<LoadBalancerConfig> = {},
    healthCheckConfig: Partial<HealthCheckConfig> = {}
  ) {
    this.config = {
      strategy: 'round_robin',
      healthCheckInterval: 30000, // 30 seconds
      failoverTimeout: 5000,
      maxRetries: 3,
      stickySession: false,
      backoffStrategy: 'exponential',
      ...config
    }
    
    this.healthCheckConfig = {
      endpoint: '/health',
      timeout: 10000,
      interval: 30000,
      retries: 3,
      expectedStatus: [200],
      ...healthCheckConfig
    }
    
    this.startHealthChecks()
  }
  
  // Add server to the pool
  addServer(server: Omit<ServerNode, 'healthy' | 'activeConnections' | 'totalRequests' | 'responseTime' | 'lastHealthCheck'>): void {
    const fullServer: ServerNode = {
      ...server,
      healthy: false,
      activeConnections: 0,
      totalRequests: 0,
      responseTime: 0,
      lastHealthCheck: 0
    }
    
    this.servers.set(server.id, fullServer)
    console.log(`🔧 LoadBalancer: Added server ${server.id} (${server.host}:${server.port})`)
    
    // Immediate health check
    this.performHealthCheck(server.id)
  }
  
  // Remove server from the pool
  removeServer(serverId: string): boolean {
    const removed = this.servers.delete(serverId)
    if (removed) {
      console.log(`🗑️ LoadBalancer: Removed server ${serverId}`)
    }
    return removed
  }
  
  // Select next server based on strategy
  selectServer(sessionId?: string): ServerNode | null {
    const healthyServers = Array.from(this.servers.values()).filter(s => s.healthy)
    
    if (healthyServers.length === 0) {
      console.warn('❌ LoadBalancer: No healthy servers available')
      return null
    }
    
    // Handle sticky sessions
    if (this.config.stickySession && sessionId) {
      const stickyServerId = this.sessionMap.get(sessionId)
      if (stickyServerId) {
        const stickyServer = this.servers.get(stickyServerId)
        if (stickyServer && stickyServer.healthy) {
          return stickyServer
        } else {
          // Remove stale session mapping
          this.sessionMap.delete(sessionId)
        }
      }
    }
    
    let selectedServer: ServerNode | null = null
    
    switch (this.config.strategy) {
      case 'round_robin':
        selectedServer = this.selectRoundRobin(healthyServers)
        break
      case 'least_connections':
        selectedServer = this.selectLeastConnections(healthyServers)
        break
      case 'weighted':
        selectedServer = this.selectWeighted(healthyServers)
        break
      case 'ip_hash':
        selectedServer = this.selectIpHash(healthyServers, sessionId || 'default')
        break
      case 'health_based':
        selectedServer = this.selectHealthBased(healthyServers)
        break
      default:
        selectedServer = healthyServers[0]
    }
    
    // Update session mapping for sticky sessions
    if (this.config.stickySession && sessionId && selectedServer) {
      this.sessionMap.set(sessionId, selectedServer.id)
    }
    
    return selectedServer
  }
  
  // Record request completion
  recordRequest(serverId: string, responseTime: number, success: boolean): void {
    const server = this.servers.get(serverId)
    if (server) {
      server.totalRequests++
      server.responseTime = (server.responseTime + responseTime) / 2 // Simple moving average
      server.activeConnections = Math.max(0, server.activeConnections - 1)
      
      if (!success) {
        console.warn(`⚠️ LoadBalancer: Request failed on server ${serverId}`)
      }
    }
  }
  
  // Start request tracking
  startRequest(serverId: string): void {
    const server = this.servers.get(serverId)
    if (server) {
      server.activeConnections++
    }
  }
  
  // Health check for specific server
  async performHealthCheck(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId)
    if (!server) return false
    
    const startTime = Date.now()
    let isHealthy = false
    
    try {
      const url = `http://${server.host}:${server.port}${this.healthCheckConfig.endpoint}`
      
      // In production, use actual HTTP client
      // const response = await fetch(url, {
      //   method: 'GET',
      //   timeout: this.healthCheckConfig.timeout
      // })
      
      // Mock health check for demo
      const mockResponse = {
        status: Math.random() > 0.05 ? 200 : 500, // 95% healthy
        ok: true
      }
      
      isHealthy = this.healthCheckConfig.expectedStatus.includes(mockResponse.status)
      
      const responseTime = Date.now() - startTime
      server.responseTime = responseTime
      server.lastHealthCheck = Date.now()
      
    } catch (error) {
      console.error(`❌ LoadBalancer: Health check failed for ${serverId}:`, error)
      isHealthy = false
    }
    
    // Update server health status
    const wasHealthy = server.healthy
    server.healthy = isHealthy
    
    if (wasHealthy !== isHealthy) {
      console.log(`${isHealthy ? '✅' : '❌'} LoadBalancer: Server ${serverId} is now ${isHealthy ? 'healthy' : 'unhealthy'}`)
    }
    
    return isHealthy
  }
  
  // Start periodic health checks
  private startHealthChecks(): void {
    setInterval(async () => {
      const healthCheckPromises = Array.from(this.servers.keys()).map(serverId =>
        this.performHealthCheck(serverId)
      )
      
      await Promise.allSettled(healthCheckPromises)
    }, this.config.healthCheckInterval)
  }
  
  // Selection strategies
  private selectRoundRobin(servers: ServerNode[]): ServerNode {
    const server = servers[this.roundRobinIndex % servers.length]
    this.roundRobinIndex++
    return server
  }
  
  private selectLeastConnections(servers: ServerNode[]): ServerNode {
    return servers.reduce((least, current) =>
      current.activeConnections < least.activeConnections ? current : least
    )
  }
  
  private selectWeighted(servers: ServerNode[]): ServerNode {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const server of servers) {
      random -= server.weight
      if (random <= 0) {
        return server
      }
    }
    
    return servers[servers.length - 1] // Fallback
  }
  
  private selectIpHash(servers: ServerNode[], sessionId: string): ServerNode {
    const hash = this.hashString(sessionId)
    const index = hash % servers.length
    return servers[index]
  }
  
  private selectHealthBased(servers: ServerNode[]): ServerNode {
    // Sort by response time and connection count
    return servers.sort((a, b) => {
      const scoreA = a.responseTime + (a.activeConnections * 10)
      const scoreB = b.responseTime + (b.activeConnections * 10)
      return scoreA - scoreB
    })[0]
  }
  
  // Utility methods
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }
  
  // Get load balancer statistics
  getStats() {
    const servers = Array.from(this.servers.values())
    const healthyCount = servers.filter(s => s.healthy).length
    const totalRequests = servers.reduce((sum, s) => sum + s.totalRequests, 0)
    const totalConnections = servers.reduce((sum, s) => sum + s.activeConnections, 0)
    const avgResponseTime = servers.length > 0 
      ? servers.reduce((sum, s) => sum + s.responseTime, 0) / servers.length 
      : 0
    
    return {
      totalServers: servers.length,
      healthyServers: healthyCount,
      unhealthyServers: servers.length - healthyCount,
      totalRequests,
      totalActiveConnections: totalConnections,
      averageResponseTime: avgResponseTime,
      stickySessionsActive: this.sessionMap.size,
      config: this.config,
      servers: servers.map(s => ({
        id: s.id,
        host: s.host,
        port: s.port,
        healthy: s.healthy,
        activeConnections: s.activeConnections,
        totalRequests: s.totalRequests,
        responseTime: s.responseTime,
        weight: s.weight
      }))
    }
  }
  
  // Export configuration for external load balancers (nginx, haproxy, etc.)
  exportNginxConfig(): string {
    const servers = Array.from(this.servers.values())
      .filter(s => s.healthy)
      .map(s => `    server ${s.host}:${s.port} weight=${s.weight} max_fails=3 fail_timeout=30s;`)
      .join('\n')
    
    return `
upstream nexural_backend {
    ${this.config.strategy === 'least_connections' ? 'least_conn;' : ''}
    ${this.config.strategy === 'ip_hash' ? 'ip_hash;' : ''}
    
${servers}
    
    # Health check
    keepalive 32;
}

server {
    listen 80;
    server_name nexuraltrading.com;
    
    location / {
        proxy_pass http://nexural_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Load balancing headers
        proxy_set_header X-LB-Server $upstream_addr;
        proxy_set_header X-LB-Response-Time $upstream_response_time;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Health check
        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
}
    `.trim()
  }
  
  exportHAProxyConfig(): string {
    const servers = Array.from(this.servers.values())
      .filter(s => s.healthy)
      .map(s => `    server ${s.id} ${s.host}:${s.port} check weight ${s.weight}`)
      .join('\n')
    
    return `
global
    maxconn 4096
    
defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httpclose
    option redispatch
    retries 3
    
backend nexural_backend
    balance ${this.config.strategy === 'round_robin' ? 'roundrobin' : 
              this.config.strategy === 'least_connections' ? 'leastconn' : 'roundrobin'}
    option httpchk GET /health
    
${servers}
    
frontend nexural_frontend
    bind *:80
    default_backend nexural_backend
    
    # Health check endpoint
    acl health_check path_beg /health
    http-request return status 200 content-type text/plain string "healthy" if health_check
    `.trim()
  }
}

// Circuit Breaker for fault tolerance
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private monitoringPeriod: number = 10000 // 10 seconds
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
        console.log('🔄 CircuitBreaker: Transitioning to HALF_OPEN')
      } else {
        throw new Error('Circuit breaker is OPEN - operation blocked')
      }
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failures = 0
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED'
      console.log('✅ CircuitBreaker: Transitioning to CLOSED')
    }
  }
  
  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
      console.log('❌ CircuitBreaker: Transitioning to OPEN')
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      isOperational: this.state !== 'OPEN'
    }
  }
}

// Global load balancer instance
export const globalLoadBalancer = new LoadBalancer({
  strategy: 'least_connections',
  stickySession: true,
  healthCheckInterval: 30000
})

// Example server setup (would be configured based on your infrastructure)
if (process.env.NODE_ENV === 'production') {
  // Add production servers
  const servers = [
    { id: 'server-1', host: 'app-1.nexuraltrading.com', port: 3000, weight: 10, region: 'us-east-1' },
    { id: 'server-2', host: 'app-2.nexuraltrading.com', port: 3000, weight: 10, region: 'us-east-1' },
    { id: 'server-3', host: 'app-3.nexuraltrading.com', port: 3000, weight: 8, region: 'us-west-2' },
  ]
  
  servers.forEach(server => globalLoadBalancer.addServer(server))
}

// Load balancing utilities
export const lbUtils = {
  // Create a load-balanced fetch function
  createLoadBalancedFetch(loadBalancer: LoadBalancer) {
    return async function(path: string, options: RequestInit = {}, sessionId?: string): Promise<Response> {
      const server = loadBalancer.selectServer(sessionId)
      
      if (!server) {
        throw new Error('No healthy servers available')
      }
      
      const url = `http://${server.host}:${server.port}${path}`
      const startTime = Date.now()
      
      loadBalancer.startRequest(server.id)
      
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'X-LB-Server': server.id,
            'X-Forwarded-For': '127.0.0.1', // Would be actual client IP
          }
        })
        
        const responseTime = Date.now() - startTime
        loadBalancer.recordRequest(server.id, responseTime, response.ok)
        
        return response
      } catch (error) {
        const responseTime = Date.now() - startTime
        loadBalancer.recordRequest(server.id, responseTime, false)
        throw error
      }
    }
  },
  
  // Health check all registered load balancers
  async performGlobalHealthCheck(): Promise<Record<string, any>> {
    return {
      globalLoadBalancer: globalLoadBalancer.getStats()
    }
  }
}

export default {
  LoadBalancer,
  CircuitBreaker,
  globalLoadBalancer,
  lbUtils
}


