"use client"

import { useEffect, useCallback } from "react"

interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  totalBlockingTime: number
  resourceLoadTimes: Record<string, number>
  apiResponseTimes: Record<string, number>
  memoryUsage: number
  jsHeapSize: number
}

interface PerformanceThreshold {
  good: number
  needsImprovement: number
  poor: number
}

interface PerformanceReport {
  score: number
  metrics: PerformanceMetrics
  recommendations: string[]
  criticalIssues: string[]
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []
  private apiTimings = new Map<string, number>()

  private thresholds: Record<keyof PerformanceMetrics, PerformanceThreshold> = {
    pageLoadTime: { good: 1000, needsImprovement: 2500, poor: 4000 },
    firstContentfulPaint: { good: 1800, needsImprovement: 3000, poor: 4000 },
    largestContentfulPaint: { good: 2500, needsImprovement: 4000, poor: 6000 },
    cumulativeLayoutShift: { good: 0.1, needsImprovement: 0.25, poor: 0.5 },
    firstInputDelay: { good: 100, needsImprovement: 300, poor: 500 },
    timeToInteractive: { good: 3800, needsImprovement: 7300, poor: 10000 },
    totalBlockingTime: { good: 200, needsImprovement: 600, poor: 1000 },
    resourceLoadTimes: { good: 1000, needsImprovement: 2000, poor: 3000 },
    apiResponseTimes: { good: 500, needsImprovement: 1000, poor: 2000 },
    memoryUsage: { good: 50, needsImprovement: 100, poor: 200 },
    jsHeapSize: { good: 20, needsImprovement: 50, poor: 100 },
  }

  initialize(): void {
    if (typeof window === "undefined") return

    this.observeWebVitals()
    this.observeResourceTiming()
    this.observeNavigationTiming()
    this.observeLongTasks()
    this.monitorMemoryUsage()
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.largestContentfulPaint = lastEntry.startTime
    })
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
    this.observers.push(lcpObserver)

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.metrics.firstInputDelay = entry.processingStart - entry.startTime
      })
    })
    fidObserver.observe({ entryTypes: ["first-input"] })
    this.observers.push(fidObserver)

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.metrics.cumulativeLayoutShift = clsValue
    })
    clsObserver.observe({ entryTypes: ["layout-shift"] })
    this.observers.push(clsObserver)
  }

  private observeResourceTiming(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceResourceTiming) => {
        const loadTime = entry.responseEnd - entry.requestStart
        const resourceType = this.getResourceType(entry.name)

        if (!this.metrics.resourceLoadTimes) {
          this.metrics.resourceLoadTimes = {}
        }

        this.metrics.resourceLoadTimes[resourceType] = Math.max(
          this.metrics.resourceLoadTimes[resourceType] || 0,
          loadTime,
        )
      })
    })
    resourceObserver.observe({ entryTypes: ["resource"] })
    this.observers.push(resourceObserver)
  }

  private observeNavigationTiming(): void {
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceNavigationTiming) => {
        this.metrics.pageLoadTime = entry.loadEventEnd - entry.fetchStart

        const paintEntries = performance.getEntriesByType("paint")
        const fcpEntry = paintEntries.find((e) => e.name === "first-contentful-paint")
        if (fcpEntry) {
          this.metrics.firstContentfulPaint = fcpEntry.startTime
        }
      })
    })
    navigationObserver.observe({ entryTypes: ["navigation"] })
    this.observers.push(navigationObserver)
  }

  private observeLongTasks(): void {
    let totalBlockingTime = 0
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.duration > 50) {
          totalBlockingTime += entry.duration - 50
        }
      })
      this.metrics.totalBlockingTime = totalBlockingTime
    })
    longTaskObserver.observe({ entryTypes: ["longtask"] })
    this.observers.push(longTaskObserver)
  }

  private monitorMemoryUsage(): void {
    if ("memory" in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024) // MB
      this.metrics.jsHeapSize = memory.totalJSHeapSize / (1024 * 1024) // MB
    }
  }

  trackApiCall(endpoint: string, startTime: number): void {
    const duration = Date.now() - startTime

    if (!this.metrics.apiResponseTimes) {
      this.metrics.apiResponseTimes = {}
    }

    this.metrics.apiResponseTimes[endpoint] = duration
    this.apiTimings.set(`${endpoint}_${Date.now()}`, duration)
  }

  trackComponentRender(componentName: string, renderTime: number): void {
    if (!this.metrics.resourceLoadTimes) {
      this.metrics.resourceLoadTimes = {}
    }

    const key = `component_${componentName}`
    this.metrics.resourceLoadTimes[key] = renderTime

    if (renderTime > 16) {
      // More than one frame
      console.warn(`[v0] Slow component render: ${componentName} took ${renderTime}ms`)
    }
  }

  trackBundleLoad(bundleName: string, size: number, loadTime: number): void {
    if (!this.metrics.resourceLoadTimes) {
      this.metrics.resourceLoadTimes = {}
    }

    this.metrics.resourceLoadTimes[`bundle_${bundleName}`] = loadTime

    // Track bundle size efficiency
    const efficiency = size / loadTime
    console.log(`[v0] Bundle ${bundleName}: ${size}KB in ${loadTime}ms (${efficiency.toFixed(2)} KB/ms)`)
  }

  generateReport(): PerformanceReport {
    const score = this.calculateOverallScore()
    const recommendations = this.generateRecommendations()
    const criticalIssues = this.identifyCriticalIssues()

    return {
      score,
      metrics: this.metrics as PerformanceMetrics,
      recommendations,
      criticalIssues,
    }
  }

  private calculateOverallScore(): number {
    const scores: number[] = []

    Object.entries(this.metrics).forEach(([key, value]) => {
      if (typeof value === "number") {
        const threshold = this.thresholds[key as keyof PerformanceMetrics]
        if (threshold) {
          const score = this.calculateMetricScore(value, threshold)
          scores.push(score)
        }
      }
    })

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  private calculateMetricScore(value: number, threshold: PerformanceThreshold): number {
    if (value <= threshold.good) return 100
    if (value <= threshold.needsImprovement) return 75
    if (value <= threshold.poor) return 50
    return 25
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.metrics.largestContentfulPaint && this.metrics.largestContentfulPaint > 2500) {
      recommendations.push("Optimize images and prioritize above-the-fold content")
    }

    if (this.metrics.cumulativeLayoutShift && this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push("Set explicit dimensions for images and avoid dynamic content insertion")
    }

    if (this.metrics.firstInputDelay && this.metrics.firstInputDelay > 100) {
      recommendations.push("Reduce JavaScript execution time and optimize event handlers")
    }

    if (this.metrics.totalBlockingTime && this.metrics.totalBlockingTime > 200) {
      recommendations.push("Break up long-running JavaScript tasks")
    }

    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 50) {
      recommendations.push("Optimize memory usage and clean up unused objects")
    }

    return recommendations
  }

  private identifyCriticalIssues(): string[] {
    const issues: string[] = []

    if (this.metrics.largestContentfulPaint && this.metrics.largestContentfulPaint > 4000) {
      issues.push("Critical: LCP exceeds 4 seconds")
    }

    if (this.metrics.cumulativeLayoutShift && this.metrics.cumulativeLayoutShift > 0.25) {
      issues.push("Critical: High layout shift detected")
    }

    if (this.metrics.firstInputDelay && this.metrics.firstInputDelay > 300) {
      issues.push("Critical: Poor input responsiveness")
    }

    return issues
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return "images"
    if (url.match(/\.(css)$/i)) return "stylesheets"
    if (url.match(/\.(js)$/i)) return "scripts"
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return "fonts"
    if (url.includes("/api/")) return "api"
    return "other"
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    this.apiTimings.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()

export function usePerformanceMonitor() {
  const trackRender = useCallback((componentName: string) => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      performanceMonitor.trackComponentRender(componentName, renderTime)
    }
  }, [])

  const trackAsyncOperation = useCallback((operationName: string) => {
    const startTime = Date.now()

    return () => {
      const endTime = Date.now()
      const duration = endTime - startTime
      performanceMonitor.trackApiCall(operationName, startTime)
    }
  }, [])

  return { trackRender, trackAsyncOperation }
}

export function useComponentPerformance(componentName: string) {
  const { trackRender } = usePerformanceMonitor()

  useEffect(() => {
    const endTracking = trackRender(componentName)
    return endTracking
  }, [componentName, trackRender])
}
