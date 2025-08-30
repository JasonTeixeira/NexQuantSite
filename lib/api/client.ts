import { config } from "@/lib/config"

interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface ApiError {
  message: string
  code: string
  status: number
  details?: any
}

export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: boolean
}

class ApiClient {
  private baseURL: string
  private timeout: number
  private maxRetries: number
  private requestCache = new Map<string, { data: any; timestamp: number }>()
  private pendingRequests = new Map<string, Promise<any>>()

  constructor() {
    this.baseURL = config.api.baseUrl
    this.timeout = config.api.timeout
    this.maxRetries = config.api.retries
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const requestKey = `${method}:${url}:${JSON.stringify(data)}`

    // Check for pending identical requests (deduplication)
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)
    }

    // Check cache for GET requests
    if (method === "GET" && options.cache !== false) {
      const cached = this.requestCache.get(requestKey)
      if (cached && Date.now() - cached.timestamp < 60000) {
        // Cache valid for 1 minute
        return cached.data
      }
    }

    const requestPromise = this.executeRequest<T>(method, url, data, options)
    this.pendingRequests.set(requestKey, requestPromise)

    try {
      const result = await requestPromise

      // Cache successful GET requests
      if (method === "GET" && options.cache !== false) {
        this.requestCache.set(requestKey, {
          data: result,
          timestamp: Date.now(),
        })
      }

      return result
    } finally {
      this.pendingRequests.delete(requestKey)
    }
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    options: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...options.headers,
    }

    // Add auth token if available
    const token = this.getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Add CSRF token for non-GET requests
    if (method !== "GET") {
      const csrfToken = this.getCSRFToken()
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken
      }
    }

    const requestConfig: RequestInit = {
      method,
      headers,
      signal: controller.signal,
      credentials: "include",
    }

    if (data && method !== "GET") {
      requestConfig.body = JSON.stringify(data)
    }

    let lastError: ApiError
    const maxRetries = options.retries ?? this.maxRetries

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, requestConfig)
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw {
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            code: errorData.code || `HTTP_${response.status}`,
            status: response.status,
            details: errorData,
          } as ApiError
        }

        const result = await response.json()
        return result
      } catch (error) {
        clearTimeout(timeoutId)

        if (error.name === "AbortError") {
          lastError = {
            message: "Request timeout",
            code: "TIMEOUT",
            status: 408,
          }
        } else if (error.message?.includes("fetch")) {
          lastError = {
            message: "Network error",
            code: "NETWORK_ERROR",
            status: 0,
          }
        } else {
          lastError = error as ApiError
        }

        // Don't retry on client errors (4xx) except 408, 429
        if (lastError.status >= 400 && lastError.status < 500 && ![408, 429].includes(lastError.status)) {
          break
        }

        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
  }

  private getCSRFToken(): string | null {
    if (typeof window === "undefined") return null
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || null
  }

  // Public methods
  async get<T>(endpoint: string, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("GET", endpoint, undefined, options)
  }

  async post<T>(endpoint: string, data?: any, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("POST", endpoint, data, options)
  }

  async put<T>(endpoint: string, data?: any, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("PUT", endpoint, data, options)
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("PATCH", endpoint, data, options)
  }

  async delete<T>(endpoint: string, options?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("DELETE", endpoint, undefined, options)
  }

  // Utility methods
  clearCache(): void {
    this.requestCache.clear()
  }

  setAuthToken(token: string, persistent = false): void {
    if (typeof window === "undefined") return

    if (persistent) {
      localStorage.setItem("auth_token", token)
    } else {
      sessionStorage.setItem("auth_token", token)
    }
  }

  removeAuthToken(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem("auth_token")
    sessionStorage.removeItem("auth_token")
  }
}

export const apiClient = new ApiClient()
