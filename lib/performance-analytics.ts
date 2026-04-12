interface PerformanceMetric {
  name: string
  value: number
  rating: "good" | "needs-improvement" | "poor"
  timestamp: number
}

interface WebVitalsData {
  CLS: number
  FID: number
  FCP: number
  LCP: number
  TTFB: number
  INP?: number
}

interface AnalyticsEvent {
  type: "performance" | "error" | "user" | "business"
  category: string
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
}

export class PerformanceAnalytics {
  private static instance: PerformanceAnalytics
  private sessionId: string
  private userId?: string
  private events: AnalyticsEvent[] = []
  private webVitals: Partial<WebVitalsData> = {}
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceAnalytics {
    if (!PerformanceAnalytics.instance) {
      PerformanceAnalytics.instance = new PerformanceAnalytics()
    }
    return PerformanceAnalytics.instance
  }

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeWebVitalsTracking()
    this.initializeResourceTracking()
    this.initializeNavigationTracking()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string): void {
    this.userId = userId
  }

  private initializeWebVitalsTracking(): void {
    if (typeof window === "undefined") return

    // Core Web Vitals tracking
    this.trackCLS()
    this.trackFID()
    this.trackFCP()
    this.trackLCP()
    this.trackTTFB()
    this.trackINP()
  }

  private trackCLS(): void {
    let clsValue = 0
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value
        }
      }
      this.webVitals.CLS = clsValue
      this.trackMetric("CLS", clsValue, this.getRating("CLS", clsValue))
    })
    observer.observe({ entryTypes: ["layout-shift"] })
    this.observers.push(observer)
  }

  private trackFID(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any
        const fidValue = fidEntry.processingStart - fidEntry.startTime
        this.webVitals.FID = fidValue
        this.trackMetric("FID", fidValue, this.getRating("FID", fidValue))
      }
    })
    observer.observe({ entryTypes: ["first-input"] })
    this.observers.push(observer)
  }

  private trackFCP(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          this.webVitals.FCP = entry.startTime
          this.trackMetric("FCP", entry.startTime, this.getRating("FCP", entry.startTime))
        }
      }
    })
    observer.observe({ entryTypes: ["paint"] })
    this.observers.push(observer)
  }

  private trackLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.webVitals.LCP = lastEntry.startTime
      this.trackMetric("LCP", lastEntry.startTime, this.getRating("LCP", lastEntry.startTime))
    })
    observer.observe({ entryTypes: ["largest-contentful-paint"] })
    this.observers.push(observer)
  }

  private trackTTFB(): void {
    window.addEventListener("load", () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      const ttfb = navigation.responseStart - navigation.fetchStart
      this.webVitals.TTFB = ttfb
      this.trackMetric("TTFB", ttfb, this.getRating("TTFB", ttfb))
    })
  }

  private trackINP(): void {
    // Interaction to Next Paint (experimental)
    if ("PerformanceEventTiming" in window) {
      const observer = new PerformanceObserver((list) => {
        let maxDuration = 0
        for (const entry of list.getEntries()) {
          const eventEntry = entry as any
          if (eventEntry.duration > maxDuration) {
            maxDuration = eventEntry.duration
          }
        }
        if (maxDuration > 0) {
          this.webVitals.INP = maxDuration
          this.trackMetric("INP", maxDuration, this.getRating("INP", maxDuration))
        }
      })
      observer.observe({ entryTypes: ["event"] })
      this.observers.push(observer)
    }
  }

  private initializeResourceTracking(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        this.trackEvent({
          type: "performance",
          category: "resource",
          action: "load",
          label: resource.name,
          value: resource.duration,
          metadata: {
            type: resource.initiatorType,
            size: resource.transferSize,
            cached: resource.transferSize === 0,
          },
        })
      }
    })
    observer.observe({ entryTypes: ["resource"] })
    this.observers.push(observer)
  }

  private initializeNavigationTracking(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navigation = entry as PerformanceNavigationTiming
        this.trackEvent({
          type: "performance",
          category: "navigation",
          action: "page-load",
          value: navigation.loadEventEnd - navigation.fetchStart,
          metadata: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstByte: navigation.responseStart - navigation.fetchStart,
            domComplete: navigation.domComplete - navigation.fetchStart,
          },
        })
      }
    })
    observer.observe({ entryTypes: ["navigation"] })
    this.observers.push(observer)
  }

  private getRating(metric: keyof WebVitalsData, value: number): "good" | "needs-improvement" | "poor" {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    }

    const threshold = thresholds[metric]
    if (!threshold) return "good"

    if (value <= threshold.good) return "good"
    if (value <= threshold.poor) return "needs-improvement"
    return "poor"
  }

  private trackMetric(name: string, value: number, rating: "good" | "needs-improvement" | "poor"): void {
    this.trackEvent({
      type: "performance",
      category: "web-vitals",
      action: name,
      value,
      metadata: { rating },
    })
  }

  trackEvent(event: Omit<AnalyticsEvent, "timestamp" | "sessionId">): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    }

    this.events.push(fullEvent)
    this.sendToAnalytics(fullEvent)
  }

  trackPageView(path: string, title?: string): void {
    this.trackEvent({
      type: "user",
      category: "navigation",
      action: "page-view",
      label: path,
      metadata: { title, referrer: document.referrer },
    })
  }

  trackUserInteraction(element: string, action: string, value?: number): void {
    this.trackEvent({
      type: "user",
      category: "interaction",
      action,
      label: element,
      value,
    })
  }

  trackBusinessEvent(category: string, action: string, value?: number, metadata?: Record<string, any>): void {
    this.trackEvent({
      type: "business",
      category,
      action,
      value,
      metadata,
    })
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent({
      type: "error",
      category: "javascript",
      action: error.name,
      label: error.message,
      metadata: {
        stack: error.stack,
        context,
      },
    })
  }

  private async sendToAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      // Send to multiple analytics providers
      await Promise.allSettled([
        this.sendToVercelAnalytics(event),
        this.sendToGoogleAnalytics(event),
        this.sendToCustomAnalytics(event),
      ])
    } catch (error) {
      console.error("Failed to send analytics event:", error)
    }
  }

  private async sendToVercelAnalytics(event: AnalyticsEvent): Promise<void> {
    if (typeof window !== "undefined" && (window as any).va) {
      ;(window as any).va("track", event.action, {
        category: event.category,
        label: event.label,
        value: event.value,
      })
    }
  }

  private async sendToGoogleAnalytics(event: AnalyticsEvent): Promise<void> {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_parameters: event.metadata,
      })
    }
  }

  private async sendToCustomAnalytics(event: AnalyticsEvent): Promise<void> {
    // Send to your custom analytics endpoint
    if (process.env.NODE_ENV === "production") {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch(() => {}) // Fail silently
    }
  }

  getPerformanceReport(): {
    webVitals: WebVitalsData
    score: number
    recommendations: string[]
    events: AnalyticsEvent[]
  } {
    const score = this.calculatePerformanceScore()
    const recommendations = this.generateRecommendations()

    return {
      webVitals: this.webVitals as WebVitalsData,
      score,
      recommendations,
      events: this.events.filter((e) => e.type === "performance"),
    }
  }

  private calculatePerformanceScore(): number {
    const vitals = this.webVitals
    const scores: number[] = []

    Object.entries(vitals).forEach(([metric, value]) => {
      if (value !== undefined) {
        const rating = this.getRating(metric as keyof WebVitalsData, value)
        const score = rating === "good" ? 100 : rating === "needs-improvement" ? 75 : 50
        scores.push(score)
      }
    })

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const vitals = this.webVitals

    if (vitals.LCP && vitals.LCP > 2500) {
      recommendations.push("Optimize Largest Contentful Paint by compressing images and preloading critical resources")
    }
    if (vitals.FID && vitals.FID > 100) {
      recommendations.push("Reduce First Input Delay by optimizing JavaScript execution and using web workers")
    }
    if (vitals.CLS && vitals.CLS > 0.1) {
      recommendations.push("Improve Cumulative Layout Shift by setting explicit dimensions for images and ads")
    }
    if (vitals.FCP && vitals.FCP > 1800) {
      recommendations.push("Optimize First Contentful Paint by reducing render-blocking resources")
    }

    return recommendations
  }

  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    this.events = []
  }
}

// React hooks for analytics
export function usePerformanceAnalytics() {
  const analytics = PerformanceAnalytics.getInstance()

  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserInteraction: analytics.trackUserInteraction.bind(analytics),
    trackBusinessEvent: analytics.trackBusinessEvent.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    getReport: analytics.getPerformanceReport.bind(analytics),
  }
}

export const performanceAnalytics = PerformanceAnalytics.getInstance()
