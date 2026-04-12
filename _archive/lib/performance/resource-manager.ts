interface ResourceConfig {
  maxConcurrentRequests: number
  requestTimeout: number
  retryAttempts: number
  retryDelay: number
  circuitBreakerThreshold: number
  circuitBreakerTimeout: number
}

interface RequestMetrics {
  url: string
  method: string
  startTime: number
  endTime?: number
  status?: number
  error?: string
  retryCount: number
}

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  state: "closed" | "open" | "half-open"
}

export class ResourceManager {
  private config: ResourceConfig
  private activeRequests = new Map<string, RequestMetrics>()
  private requestQueue: Array<() => Promise<any>> = []
  private circuitBreakers = new Map<string, CircuitBreakerState>()
  private metrics: RequestMetrics[] = []

  constructor(config: Partial<ResourceConfig> = {}) {
    this.config = {
      maxConcurrentRequests: 10,
      requestTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      ...config,
    }
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const requestId = this.generateRequestId()
    const baseUrl = new URL(url).origin

    // Check circuit breaker
    if (this.isCircuitOpen(baseUrl)) {
      throw new Error(`Circuit breaker is open for ${baseUrl}`)
    }

    // Check if we need to queue the request
    if (this.activeRequests.size >= this.config.maxConcurrentRequests) {
      await this.queueRequest()
    }

    const metrics: RequestMetrics = {
      url,
      method: options.method || "GET",
      startTime: Date.now(),
      retryCount: 0,
    }

    this.activeRequests.set(requestId, metrics)

    try {
      const response = await this.executeRequest(url, options, metrics)
      this.recordSuccess(baseUrl)
      return response
    } catch (error) {
      this.recordFailure(baseUrl, error as Error)
      throw error
    } finally {
      this.activeRequests.delete(requestId)
      this.metrics.push(metrics)

      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000)
      }
    }
  }

  private async executeRequest(url: string, options: RequestInit, metrics: RequestMetrics): Promise<Response> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        metrics.retryCount = attempt

        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
        }, this.config.requestTimeout)

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        metrics.endTime = Date.now()
        metrics.status = response.status

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return response
      } catch (error) {
        lastError = error as Error
        metrics.error = lastError.message

        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          break
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt))
        }
      }
    }

    throw lastError
  }

  private async queueRequest(): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push(async () => {
        resolve()
        return Promise.resolve()
      })
    })
  }

  private isCircuitOpen(baseUrl: string): boolean {
    const breaker = this.circuitBreakers.get(baseUrl)
    if (!breaker) return false

    if (breaker.state === "open") {
      // Check if we should transition to half-open
      if (Date.now() - breaker.lastFailureTime > this.config.circuitBreakerTimeout) {
        breaker.state = "half-open"
        return false
      }
      return true
    }

    return false
  }

  private recordSuccess(baseUrl: string): void {
    const breaker = this.circuitBreakers.get(baseUrl)
    if (breaker) {
      if (breaker.state === "half-open") {
        // Reset circuit breaker
        breaker.state = "closed"
        breaker.failures = 0
      }
    }
  }

  private recordFailure(baseUrl: string, error: Error): void {
    let breaker = this.circuitBreakers.get(baseUrl)
    if (!breaker) {
      breaker = {
        failures: 0,
        lastFailureTime: 0,
        state: "closed",
      }
      this.circuitBreakers.set(baseUrl, breaker)
    }

    breaker.failures++
    breaker.lastFailureTime = Date.now()

    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.state = "open"
      console.warn(`Circuit breaker opened for ${baseUrl} after ${breaker.failures} failures`)
    }
  }

  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase()
    return (
      message.includes("400") || // Bad Request
      message.includes("401") || // Unauthorized
      message.includes("403") || // Forbidden
      message.includes("404") || // Not Found
      message.includes("422") // Unprocessable Entity
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  // Public methods for monitoring
  getActiveRequestCount(): number {
    return this.activeRequests.size
  }

  getQueuedRequestCount(): number {
    return this.requestQueue.length
  }

  getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
    return Object.fromEntries(this.circuitBreakers.entries())
  }

  getMetrics(): {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    slowestRequest: RequestMetrics | null
    fastestRequest: RequestMetrics | null
  } {
    const successful = this.metrics.filter((m) => m.status && m.status < 400)
    const failed = this.metrics.filter((m) => !m.status || m.status >= 400 || m.error)

    const responseTimes = this.metrics.filter((m) => m.endTime).map((m) => m.endTime! - m.startTime)

    const avgResponseTime =
      responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0

    const slowest = this.metrics
      .filter((m) => m.endTime)
      .reduce(
        (slowest, current) => {
          const currentTime = current.endTime! - current.startTime
          const slowestTime = slowest ? slowest.endTime! - slowest.startTime : 0
          return currentTime > slowestTime ? current : slowest
        },
        null as RequestMetrics | null,
      )

    const fastest = this.metrics
      .filter((m) => m.endTime)
      .reduce(
        (fastest, current) => {
          const currentTime = current.endTime! - current.startTime
          const fastestTime = fastest ? fastest.endTime! - fastest.startTime : Number.POSITIVE_INFINITY
          return currentTime < fastestTime ? current : fastest
        },
        null as RequestMetrics | null,
      )

    return {
      totalRequests: this.metrics.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: avgResponseTime,
      slowestRequest: slowest,
      fastestRequest: fastest,
    }
  }

  // Reset circuit breaker manually
  resetCircuitBreaker(baseUrl: string): void {
    const breaker = this.circuitBreakers.get(baseUrl)
    if (breaker) {
      breaker.state = "closed"
      breaker.failures = 0
      breaker.lastFailureTime = 0
      console.log(`Circuit breaker reset for ${baseUrl}`)
    }
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = []
  }
}

export const resourceManager = new ResourceManager()
