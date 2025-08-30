/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascade failures and improves system resilience
 */

interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number // ms
  monitoringPeriod: number // ms
  expectedFailureRate: number // 0-1
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN', 
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime: number
  lastSuccessTime: number
  totalRequests: number
  failureRate: number
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private successes: number = 0
  private lastFailureTime: number = 0
  private lastSuccessTime: number = 0
  private lastStateChangeTime: number = Date.now()
  private totalRequests: number = 0

  constructor(config: CircuitBreakerConfig) {
    this.config = config
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++
    
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN
        this.lastStateChangeTime = Date.now()
      } else {
        throw new Error(`Circuit breaker is OPEN. Last failure: ${new Date(this.lastFailureTime).toISOString()}`)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.successes++
    this.lastSuccessTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN) {
      // If half-open and we got a success, close the circuit
      this.state = CircuitState.CLOSED
      this.failures = 0
      this.lastStateChangeTime = Date.now()
    }
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN) {
      // If half-open and we got a failure, go back to open
      this.state = CircuitState.OPEN
      this.lastStateChangeTime = Date.now()
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we should open the circuit
      if (this.failures >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN
        this.lastStateChangeTime = Date.now()
      }
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout
  }

  getStats(): CircuitBreakerStats {
    const now = Date.now()
    const timeSinceLastChange = now - this.lastStateChangeTime
    const failureRate = this.totalRequests > 0 ? this.failures / this.totalRequests : 0

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      failureRate
    }
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.totalRequests = 0
    this.lastStateChangeTime = Date.now()
  }
}

// Circuit breaker configurations for different services
export const CIRCUIT_BREAKER_CONFIGS = {
  api: {
    failureThreshold: 5,
    resetTimeout: 30000, // 30 seconds
    monitoringPeriod: 60000, // 1 minute
    expectedFailureRate: 0.1 // 10%
  },
  external: {
    failureThreshold: 3,
    resetTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    expectedFailureRate: 0.2 // 20%
  },
  critical: {
    failureThreshold: 2,
    resetTimeout: 10000, // 10 seconds
    monitoringPeriod: 30000, // 30 seconds
    expectedFailureRate: 0.05 // 5%
  }
}

// Global circuit breaker instances
export const circuitBreakers = {
  api: new CircuitBreaker(CIRCUIT_BREAKER_CONFIGS.api),
  external: new CircuitBreaker(CIRCUIT_BREAKER_CONFIGS.external),
  critical: new CircuitBreaker(CIRCUIT_BREAKER_CONFIGS.critical)
}

// Enhanced fetch with circuit breaker
export async function resilientFetch(
  url: string,
  options?: RequestInit,
  circuitBreakerType: keyof typeof circuitBreakers = 'api'
): Promise<Response> {
  const circuitBreaker = circuitBreakers[circuitBreakerType]
  
  return circuitBreaker.execute(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  })
}

// Circuit breaker middleware for API client
export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  circuitBreakerType: keyof typeof circuitBreakers = 'api'
): T {
  const circuitBreaker = circuitBreakers[circuitBreakerType]
  
  return (async (...args: Parameters<T>) => {
    return circuitBreaker.execute(() => fn(...args))
  }) as T
}

// Circuit breaker status endpoint data
export function getCircuitBreakerStatus() {
  return {
    timestamp: new Date().toISOString(),
    breakers: Object.entries(circuitBreakers).map(([name, breaker]) => ({
      name,
      ...breaker.getStats()
    }))
  }
}
