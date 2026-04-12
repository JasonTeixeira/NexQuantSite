interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
}

interface PerformanceThresholds {
  excellent: number
  good: number
  needsImprovement: number
}

const PERFORMANCE_THRESHOLDS: Record<keyof PerformanceMetrics, PerformanceThresholds> = {
  pageLoadTime: { excellent: 1000, good: 2000, needsImprovement: 3000 },
  firstContentfulPaint: { excellent: 1000, good: 1800, needsImprovement: 3000 },
  largestContentfulPaint: { excellent: 2500, good: 4000, needsImprovement: 6000 },
  cumulativeLayoutShift: { excellent: 0.1, good: 0.25, needsImprovement: 0.5 },
  firstInputDelay: { excellent: 100, good: 300, needsImprovement: 500 },
  timeToInteractive: { excellent: 3800, good: 7300, needsImprovement: 10000 },
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    // Core Web Vitals Observer
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        this.metrics.largestContentfulPaint = lastEntry.startTime
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
      this.observers.push(lcpObserver)

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime
        })
      })
      fidObserver.observe({ entryTypes: ["first-input"] })
      this.observers.push(fidObserver)

      // CLS Observer
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
  }

  measurePageLoad(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("load", () => {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart

        const paintEntries = performance.getEntriesByType("paint")
        const fcpEntry = paintEntries.find((entry) => entry.name === "first-contentful-paint")
        if (fcpEntry) {
          this.metrics.firstContentfulPaint = fcpEntry.startTime
        }
      })
    }
  }

  getPerformanceScore(): number {
    const scores: number[] = []

    Object.entries(this.metrics).forEach(([key, value]) => {
      const thresholds = PERFORMANCE_THRESHOLDS[key as keyof PerformanceMetrics]
      if (thresholds && value !== undefined) {
        if (value <= thresholds.excellent) scores.push(100)
        else if (value <= thresholds.good) scores.push(75)
        else if (value <= thresholds.needsImprovement) scores.push(50)
        else scores.push(25)
      }
    })

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  getDetailedReport(): { score: number; metrics: PerformanceMetrics; recommendations: string[] } {
    const score = this.getPerformanceScore()
    const recommendations: string[] = []

    Object.entries(this.metrics).forEach(([key, value]) => {
      const thresholds = PERFORMANCE_THRESHOLDS[key as keyof PerformanceMetrics]
      if (thresholds && value !== undefined && value > thresholds.good) {
        recommendations.push(this.getRecommendation(key as keyof PerformanceMetrics))
      }
    })

    return {
      score,
      metrics: this.metrics as PerformanceMetrics,
      recommendations,
    }
  }

  private getRecommendation(metric: keyof PerformanceMetrics): string {
    const recommendations = {
      pageLoadTime: "Optimize server response time and reduce bundle size",
      firstContentfulPaint: "Optimize critical rendering path and reduce render-blocking resources",
      largestContentfulPaint: "Optimize images and prioritize above-the-fold content",
      cumulativeLayoutShift: "Set explicit dimensions for images and avoid dynamic content insertion",
      firstInputDelay: "Reduce JavaScript execution time and optimize event handlers",
      timeToInteractive: "Minimize main thread work and reduce JavaScript bundle size",
    }
    return recommendations[metric]
  }

  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

export const performanceMonitor = new PerformanceMonitor()
