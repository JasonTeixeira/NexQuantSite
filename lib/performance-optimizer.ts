interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  totalBlockingTime: number
}

interface OptimizationResult {
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  loadTimeImprovement: number
}

interface CacheConfig {
  maxAge: number
  staleWhileRevalidate: number
  mustRevalidate: boolean
}

export class PerformanceOptimizer {
  private performanceEntries: PerformanceEntry[] = []
  private observers: PerformanceObserver[] = []

  // Cache configurations for different resource types
  private cacheConfigs: Record<string, CacheConfig> = {
    "static-assets": { maxAge: 31536000, staleWhileRevalidate: 86400, mustRevalidate: false }, // 1 year
    "api-data": { maxAge: 300, staleWhileRevalidate: 60, mustRevalidate: true }, // 5 minutes
    "user-data": { maxAge: 0, staleWhileRevalidate: 0, mustRevalidate: true }, // No cache
    images: { maxAge: 2592000, staleWhileRevalidate: 86400, mustRevalidate: false }, // 30 days
    fonts: { maxAge: 31536000, staleWhileRevalidate: 86400, mustRevalidate: false }, // 1 year
    "css-js": { maxAge: 86400, staleWhileRevalidate: 3600, mustRevalidate: false }, // 1 day
  }

  initializePerformanceMonitoring(): void {
    if (typeof window === "undefined") return

    // Core Web Vitals monitoring
    this.observeWebVitals()

    // Resource timing monitoring
    this.observeResourceTiming()

    // Navigation timing monitoring
    this.observeNavigationTiming()

    // Long task monitoring
    this.observeLongTasks()
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric("LCP", lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
    this.observers.push(lcpObserver)

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.recordMetric("FID", entry.processingStart - entry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ["first-input"] })
    this.observers.push(fidObserver)

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.recordMetric("CLS", clsValue)
    })
    clsObserver.observe({ entryTypes: ["layout-shift"] })
    this.observers.push(clsObserver)
  }

  private observeResourceTiming(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceResourceTiming) => {
        this.analyzeResourcePerformance(entry)
      })
    })
    resourceObserver.observe({ entryTypes: ["resource"] })
    this.observers.push(resourceObserver)
  }

  private observeNavigationTiming(): void {
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceNavigationTiming) => {
        this.analyzeNavigationPerformance(entry)
      })
    })
    navigationObserver.observe({ entryTypes: ["navigation"] })
    this.observers.push(navigationObserver)
  }

  private observeLongTasks(): void {
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        this.recordMetric("LongTask", entry.duration)
        console.warn(`Long task detected: ${entry.duration}ms`)
      })
    })
    longTaskObserver.observe({ entryTypes: ["longtask"] })
    this.observers.push(longTaskObserver)
  }

  private recordMetric(name: string, value: number): void {
    // In a real implementation, this would send to analytics
    console.log(`Performance Metric - ${name}: ${value}`)
  }

  private analyzeResourcePerformance(entry: PerformanceResourceTiming): void {
    const loadTime = entry.responseEnd - entry.requestStart
    const resourceType = this.getResourceType(entry.name)

    // Flag slow resources
    if (loadTime > 1000) {
      console.warn(`Slow resource detected: ${entry.name} (${loadTime}ms)`)
    }

    // Analyze cache effectiveness
    if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
      console.log(`Resource served from cache: ${entry.name}`)
    }
  }

  private analyzeNavigationPerformance(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.connectEnd - entry.secureConnectionStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domProcessing: entry.domContentLoadedEventStart - entry.responseEnd,
      total: entry.loadEventEnd - entry.fetchStart,
    }

    console.log("Navigation Performance:", metrics)
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return "image"
    if (url.match(/\.(css)$/i)) return "stylesheet"
    if (url.match(/\.(js)$/i)) return "script"
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return "font"
    if (url.includes("/api/")) return "api"
    return "other"
  }

  // Image optimization utilities
  optimizeImage(
    imageUrl: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: "webp" | "avif" | "jpeg" | "png"
    } = {},
  ): string {
    const { width, height, quality = 80, format = "webp" } = options

    // In a real implementation, this would integrate with an image optimization service
    const params = new URLSearchParams()
    if (width) params.set("w", width.toString())
    if (height) params.set("h", height.toString())
    params.set("q", quality.toString())
    params.set("f", format)

    return `${imageUrl}?${params.toString()}`
  }

  // Generate responsive image srcSet
  generateResponsiveImageSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes.map((size) => `${this.optimizeImage(baseUrl, { width: size })} ${size}w`).join(", ")
  }

  // Lazy loading implementation
  implementLazyLoading(): void {
    if (typeof window === "undefined") return

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            if (src) {
              img.src = src
              img.removeAttribute("data-src")
              imageObserver.unobserve(img)
            }
          }
        })
      },
      { rootMargin: "50px" },
    )

    // Observe all images with data-src attribute
    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img)
    })
  }

  // Critical CSS extraction
  extractCriticalCSS(): string {
    if (typeof window === "undefined") return ""

    const criticalElements = document.querySelectorAll("*")
    const criticalStyles: string[] = []

    criticalElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const isAboveFold = rect.top < window.innerHeight && rect.bottom > 0

      if (isAboveFold) {
        const computedStyle = window.getComputedStyle(element)
        // Extract critical styles (simplified implementation)
        const criticalProps = [
          "display",
          "position",
          "top",
          "left",
          "width",
          "height",
          "margin",
          "padding",
          "border",
          "background",
          "color",
          "font-family",
          "font-size",
          "font-weight",
          "line-height",
        ]

        const elementStyles = criticalProps
          .map((prop) => `${prop}: ${computedStyle.getPropertyValue(prop)}`)
          .filter((style) => !style.includes("initial") && !style.includes("auto"))
          .join("; ")

        if (elementStyles) {
          const selector = this.generateCSSSelector(element)
          criticalStyles.push(`${selector} { ${elementStyles} }`)
        }
      }
    })

    return criticalStyles.join("\n")
  }

  private generateCSSSelector(element: Element): string {
    if (element.id) return `#${element.id}`
    if (element.className) {
      const classes = element.className.split(" ").filter(Boolean)
      if (classes.length > 0) return `.${classes.join(".")}`
    }
    return element.tagName.toLowerCase()
  }

  // Bundle analysis and optimization
  analyzeBundleSize(): {
    totalSize: number
    chunks: Array<{ name: string; size: number; gzipSize: number }>
    recommendations: string[]
  } {
    // This would integrate with webpack-bundle-analyzer or similar
    const mockAnalysis = {
      totalSize: 2500000, // 2.5MB
      chunks: [
        { name: "main", size: 800000, gzipSize: 200000 },
        { name: "vendor", size: 1200000, gzipSize: 300000 },
        { name: "runtime", size: 50000, gzipSize: 15000 },
        { name: "pages", size: 450000, gzipSize: 120000 },
      ],
      recommendations: [
        "Consider code splitting for vendor libraries",
        "Implement dynamic imports for non-critical components",
        "Use tree shaking to eliminate unused code",
        "Optimize images and use modern formats (WebP, AVIF)",
      ],
    }

    return mockAnalysis
  }

  // Service Worker implementation for caching
  generateServiceWorker(): string {
    return `
const CACHE_NAME = 'nexural-v1'
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/images/logo.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
`
  }

  // Performance budget monitoring
  checkPerformanceBudget(): {
    passed: boolean
    results: Array<{ metric: string; value: number; budget: number; passed: boolean }>
  } {
    const budgets = {
      "First Contentful Paint": 1500, // 1.5s
      "Largest Contentful Paint": 2500, // 2.5s
      "First Input Delay": 100, // 100ms
      "Cumulative Layout Shift": 0.1, // 0.1
      "Total Blocking Time": 300, // 300ms
      "Bundle Size": 2000000, // 2MB
    }

    // Mock current values - in real implementation, get from actual metrics
    const currentValues = {
      "First Contentful Paint": 1200,
      "Largest Contentful Paint": 2100,
      "First Input Delay": 80,
      "Cumulative Layout Shift": 0.08,
      "Total Blocking Time": 250,
      "Bundle Size": 1800000,
    }

    const results = Object.entries(budgets).map(([metric, budget]) => ({
      metric,
      value: currentValues[metric as keyof typeof currentValues],
      budget,
      passed: currentValues[metric as keyof typeof currentValues] <= budget,
    }))

    const passed = results.every((result) => result.passed)

    return { passed, results }
  }

  // Generate performance report
  generatePerformanceReport(): {
    score: number
    metrics: PerformanceMetrics
    optimizations: string[]
    criticalIssues: string[]
  } {
    // Mock implementation - in real app, collect actual metrics
    const metrics: PerformanceMetrics = {
      loadTime: 1200,
      firstContentfulPaint: 800,
      largestContentfulPaint: 1500,
      cumulativeLayoutShift: 0.05,
      firstInputDelay: 50,
      timeToInteractive: 2000,
      totalBlockingTime: 150,
    }

    const score = this.calculatePerformanceScore(metrics)

    const optimizations = [
      "Implement image lazy loading",
      "Enable gzip compression",
      "Use CDN for static assets",
      "Implement service worker caching",
      "Optimize critical rendering path",
      "Minify CSS and JavaScript",
      "Use modern image formats (WebP, AVIF)",
    ]

    const criticalIssues = []
    if (metrics.largestContentfulPaint > 2500) {
      criticalIssues.push("Largest Contentful Paint exceeds 2.5s threshold")
    }
    if (metrics.cumulativeLayoutShift > 0.1) {
      criticalIssues.push("Cumulative Layout Shift exceeds 0.1 threshold")
    }
    if (metrics.firstInputDelay > 100) {
      criticalIssues.push("First Input Delay exceeds 100ms threshold")
    }

    return { score, metrics, optimizations, criticalIssues }
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100

    // LCP scoring
    if (metrics.largestContentfulPaint > 4000) score -= 25
    else if (metrics.largestContentfulPaint > 2500) score -= 15
    else if (metrics.largestContentfulPaint > 1500) score -= 5

    // FID scoring
    if (metrics.firstInputDelay > 300) score -= 25
    else if (metrics.firstInputDelay > 100) score -= 15
    else if (metrics.firstInputDelay > 50) score -= 5

    // CLS scoring
    if (metrics.cumulativeLayoutShift > 0.25) score -= 25
    else if (metrics.cumulativeLayoutShift > 0.1) score -= 15
    else if (metrics.cumulativeLayoutShift > 0.05) score -= 5

    // FCP scoring
    if (metrics.firstContentfulPaint > 3000) score -= 15
    else if (metrics.firstContentfulPaint > 1800) score -= 10
    else if (metrics.firstContentfulPaint > 1000) score -= 5

    // TTI scoring
    if (metrics.timeToInteractive > 7300) score -= 10
    else if (metrics.timeToInteractive > 3800) score -= 5

    return Math.max(0, score)
  }

  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

export const performanceOptimizer = new PerformanceOptimizer()
