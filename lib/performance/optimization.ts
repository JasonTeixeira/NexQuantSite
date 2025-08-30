/**
 * Performance Optimization Module - Phase 2 Performance Enhancement
 * Lazy loading, code splitting, bundle optimization, and performance monitoring
 */

import { lazy, Suspense, ComponentType, ReactNode } from 'react'

// Performance monitoring interface
export interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number
  bundleSize: number
  jsHeapSize: number
  connectionType: string
  effectiveType: string
}

// Performance budgets and thresholds
export const PERFORMANCE_BUDGETS = {
  pageLoadTime: 3000, // 3 seconds
  firstContentfulPaint: 1800, // 1.8 seconds
  largestContentfulPaint: 2500, // 2.5 seconds
  firstInputDelay: 100, // 100ms
  cumulativeLayoutShift: 0.1, // 0.1 score
  timeToInteractive: 3800, // 3.8 seconds
  bundleSize: 500 * 1024, // 500KB
  jsHeapSize: 50 * 1024 * 1024, // 50MB
}

// Component loading states
export const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bbff]"></div>
    <p className="text-sm text-[#a0a0b8]">{message}</p>
  </div>
)

export const LoadingCard = ({ height = '300px' }: { height?: string }) => (
  <div 
    className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg animate-pulse"
    style={{ height }}
  >
    <div className="p-6 space-y-4">
      <div className="h-4 bg-[#2a2a3e] rounded w-3/4"></div>
      <div className="h-4 bg-[#2a2a3e] rounded w-1/2"></div>
      <div className="h-32 bg-[#2a2a3e] rounded"></div>
    </div>
  </div>
)

// Lazy-loaded components with performance optimization
export const LazyComponents = {
  // Portfolio components
  LiveMarketTicker: lazy(() => 
    import('../components/realtime/live-market-ticker').then(module => ({
      default: module.default
    }))
  ),
  
  LivePaperPortfolio: lazy(() => 
    import('../components/realtime/live-paper-portfolio').then(module => ({
      default: module.default
    }))
  ),
  
  StrategySignalsDashboard: lazy(() => 
    import('../components/realtime/strategy-signals-dashboard').then(module => ({
      default: module.default
    }))
  ),
  
  // Mobile components
  MobileOptimizedTerminal: lazy(() => 
    import('../components/mobile/mobile-optimized-terminal').then(module => ({
      default: module.default
    }))
  ),
  
  // Advanced components (loaded on demand)
  AdvancedCharting: lazy(() => 
    import('../components/charts/advanced-charting').catch(() => ({
      default: () => <div>Chart loading failed - fallback view</div>
    }))
  ),
  
  AIAnalysisPanel: lazy(() => 
    import('../components/ai/analysis-panel').catch(() => ({
      default: () => <div>AI analysis temporarily unavailable</div>
    }))
  ),
  
  BacktestEngine: lazy(() => 
    import('../components/backtesting/backtest-engine').catch(() => ({
      default: () => <div>Backtesting engine loading...</div>
    }))
  ),
  
  RiskDashboard: lazy(() => 
    import('../components/risk/risk-dashboard').catch(() => ({
      default: () => <div>Risk dashboard loading...</div>
    }))
  ),
}

// High-order component for lazy loading with error boundaries
export function withLazyLoading<P extends {}>(
  LazyComponent: ComponentType<P>,
  fallback: ReactNode = <LoadingSpinner />,
  errorFallback: ReactNode = <div>Failed to load component</div>
) {
  return function LazyLoadedComponent(props: P) {
    try {
      return (
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      )
    } catch (error) {
      console.error('Lazy loading error:', error)
      return <>{errorFallback}</>
    }
  }
}

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observer?: PerformanceObserver
  private connectionObserver?: any

  constructor() {
    this.initializeMonitoring()
  }

  private initializeMonitoring() {
    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.largestContentfulPaint = entry.startTime
          }
          if (entry.entryType === 'first-input') {
            this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime
          }
          if (entry.entryType === 'layout-shift') {
            this.metrics.cumulativeLayoutShift = (this.metrics.cumulativeLayoutShift || 0) + (entry as any).value
          }
        })
      })

      this.observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

      // Network Information API
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        this.metrics.connectionType = connection.type
        this.metrics.effectiveType = connection.effectiveType

        connection.addEventListener('change', () => {
          this.metrics.connectionType = connection.type
          this.metrics.effectiveType = connection.effectiveType
          this.reportNetworkChange()
        })
      }
    }

    // Page load metrics
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.collectPageMetrics()
        }, 0)
      })
    }
  }

  private collectPageMetrics() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
      this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart
      
      paint.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime
        }
      })

      // Memory usage
      if ('memory' in performance) {
        this.metrics.jsHeapSize = (performance as any).memory.usedJSHeapSize
      }

      // Bundle size estimation (from resource timing)
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      let totalBundleSize = 0

      resources.forEach((resource) => {
        if (resource.name.includes('_next/static/') || resource.name.includes('.js')) {
          totalBundleSize += resource.transferSize || 0
        }
      })

      this.metrics.bundleSize = totalBundleSize

      // Report metrics
      this.reportMetrics()

    } catch (error) {
      console.error('Error collecting performance metrics:', error)
    }
  }

  private reportMetrics() {
    const budgetViolations = this.checkBudgetViolations()
    
    console.group('📊 Performance Metrics')
    console.table(this.metrics)
    
    if (budgetViolations.length > 0) {
      console.group('⚠️ Performance Budget Violations')
      budgetViolations.forEach(violation => {
        console.warn(`${violation.metric}: ${violation.actual} > ${violation.budget} (${violation.severity})`)
      })
      console.groupEnd()
    } else {
      console.log('✅ All performance budgets met')
    }
    
    console.groupEnd()

    // Send to analytics (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(this.metrics, budgetViolations)
    }
  }

  private checkBudgetViolations(): Array<{ metric: string; actual: number; budget: number; severity: string }> {
    const violations = []

    for (const [metric, budget] of Object.entries(PERFORMANCE_BUDGETS)) {
      const actual = this.metrics[metric as keyof PerformanceMetrics]
      
      if (typeof actual === 'number' && actual > budget) {
        const ratio = actual / budget
        let severity = 'low'
        
        if (ratio > 2) severity = 'high'
        else if (ratio > 1.5) severity = 'medium'
        
        violations.push({ metric, actual, budget, severity })
      }
    }

    return violations
  }

  private reportNetworkChange() {
    console.log('📡 Network changed:', {
      type: this.metrics.connectionType,
      effectiveType: this.metrics.effectiveType
    })

    // Adjust behavior based on connection
    this.adaptToConnection()
  }

  private adaptToConnection() {
    const effectiveType = this.metrics.effectiveType

    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      // Disable heavy features for slow connections
      document.body.classList.add('slow-connection')
      console.log('🐌 Slow connection detected - reducing feature set')
    } else {
      document.body.classList.remove('slow-connection')
    }
  }

  private async sendToAnalytics(metrics: Partial<PerformanceMetrics>, violations: any[]) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          violations,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        })
      })
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  getScore(): number {
    const weights = {
      pageLoadTime: 0.25,
      firstContentfulPaint: 0.15,
      largestContentfulPaint: 0.25,
      firstInputDelay: 0.15,
      cumulativeLayoutShift: 0.15,
      timeToInteractive: 0.05,
    }

    let score = 100
    let totalWeight = 0

    for (const [metric, weight] of Object.entries(weights)) {
      const actual = this.metrics[metric as keyof PerformanceMetrics]
      const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS]
      
      if (typeof actual === 'number' && budget) {
        totalWeight += weight
        if (actual > budget) {
          const penalty = Math.min((actual / budget - 1) * 50, 40) // Max 40 point penalty per metric
          score -= penalty * weight / 0.25 // Normalize weight
        }
      }
    }

    return Math.max(0, Math.round(score))
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Resource hints for preloading
export const ResourceHints = {
  preloadCritical: () => {
    if (typeof document !== 'undefined') {
      // Preload critical CSS
      const criticalCSS = document.createElement('link')
      criticalCSS.rel = 'preload'
      criticalCSS.as = 'style'
      criticalCSS.href = '/_next/static/css/critical.css'
      document.head.appendChild(criticalCSS)

      // Preload critical fonts
      const fontPreload = document.createElement('link')
      fontPreload.rel = 'preload'
      fontPreload.as = 'font'
      fontPreload.type = 'font/woff2'
      fontPreload.crossOrigin = 'anonymous'
      fontPreload.href = '/fonts/inter-var-latin.woff2'
      document.head.appendChild(fontPreload)
    }
  },

  prefetchNextPage: (url: string) => {
    if (typeof document !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        document.head.appendChild(link)
      })
    }
  },

  preconnectToAPIs: () => {
    if (typeof document !== 'undefined') {
      const domains = [
        'https://api.nexural.com',
        'https://ws.nexural.com',
        'https://ai.nexural.com',
      ]

      domains.forEach(domain => {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = domain
        document.head.appendChild(link)
      })
    }
  },
}

// Bundle optimization utilities
export const BundleOptimization = {
  // Dynamic import with error handling
  importComponent: async <T>(importFunc: () => Promise<{ default: T }>): Promise<T | null> => {
    try {
      const module = await importFunc()
      return module.default
    } catch (error) {
      console.error('Dynamic import failed:', error)
      return null
    }
  },

  // Chunk splitting strategies
  shouldSplitChunk: (moduleName: string): boolean => {
    const heavyLibraries = ['chart.js', 'd3', 'three.js', 'tensorflow']
    return heavyLibraries.some(lib => moduleName.includes(lib))
  },

  // Code splitting by route
  getRouteChunks: () => ({
    home: () => import('../pages/home'),
    portfolio: () => import('../pages/portfolio'),
    trading: () => import('../pages/trading'),
    analysis: () => import('../pages/analysis'),
    settings: () => import('../pages/settings'),
  }),
}

// Performance optimization hooks
export const usePerformanceOptimization = () => {
  const monitor = new PerformanceMonitor()

  return {
    getMetrics: () => monitor.getMetrics(),
    getScore: () => monitor.getScore(),
    cleanup: () => monitor.cleanup(),
  }
}

// Image optimization utilities
export const ImageOptimization = {
  // Generate responsive image sources
  generateSrcSet: (baseUrl: string, sizes: number[]): string => {
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=75 ${size}w`)
      .join(', ')
  },

  // Lazy loading with Intersection Observer
  createLazyLoadObserver: (callback: (element: Element) => void) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null
    }

    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback(entry.target)
          }
        })
      },
      { rootMargin: '50px' }
    )
  },

  // WebP support detection
  supportsWebP: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false)
        return
      }

      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  },
}

// Initialize performance monitoring
export const initializePerformanceOptimization = () => {
  if (typeof window !== 'undefined') {
    // Initialize resource hints
    ResourceHints.preloadCritical()
    ResourceHints.preconnectToAPIs()

    // Start performance monitoring
    const monitor = new PerformanceMonitor()

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      monitor.cleanup()
    })

    return monitor
  }

  return null
}

console.log('⚡ Performance optimization module loaded')
