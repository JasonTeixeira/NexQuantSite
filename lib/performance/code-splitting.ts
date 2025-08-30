import { lazy } from "react"

export const lazyComponents = {
  // Dashboard Components - keeping only verified existing components
  AdminDashboard: lazy(() => import("@/components/admin/admin-dashboard-client")),
  BusinessAnalytics: lazy(() => import("@/components/admin/BusinessAnalyticsAdmin")),
  AdminUserManagement: lazy(() => import("@/components/admin/admin-users-client")),

  // Learning Components - only existing ones
  VideoPlayer: lazy(() => import("@/components/learning/video-player")),
  QuizSystem: lazy(() => import("@/components/learning/quiz-system")),

  // Trading Components - only existing ones
  LiveTradingInterface: lazy(() => import("@/components/trading/live-trading-interface")),
  BacktestingEngine: lazy(() => import("@/components/backtesting-page-client")),

  // Content Components - commonly existing pages
  BlogPage: lazy(() => import("@/components/BlogPageClient")),
  AboutPage: lazy(() => import("@/components/AboutPageClient")),
  GlossaryPage: lazy(() => import("@/components/GlossaryPageClient")),
}

export function preloadCriticalComponents() {
  if (typeof window !== "undefined") {
    // Preload admin components for admin users
    const userRole = localStorage.getItem("userRole")
    if (userRole === "admin") {
      setTimeout(() => {
        import("@/components/admin/admin-dashboard-client")
        import("@/components/admin/BusinessAnalyticsAdmin")
      }, 2000)
    }

    // Preload content components after initial load
    setTimeout(() => {
      import("@/components/BlogPageClient")
      import("@/components/trading/live-trading-interface")
    }, 3000)
  }
}

export const routeComponents = {
  "/trading": lazyComponents.LiveTradingInterface,
  "/backtesting": lazyComponents.BacktestingEngine,
  "/learning/video": lazyComponents.VideoPlayer,
  "/learning/quiz": lazyComponents.QuizSystem,
  "/blog": lazyComponents.BlogPage,
  "/about": lazyComponents.AboutPage,
  "/glossary": lazyComponents.GlossaryPage,
  "/admin/dashboard": lazyComponents.AdminDashboard,
  "/admin/analytics": lazyComponents.BusinessAnalytics,
  "/admin/users": lazyComponents.AdminUserManagement,
}

export async function dynamicImport<T>(importFn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await importFn()
  } catch (error) {
    if (retries > 0) {
      console.warn(`[v0] Dynamic import failed, retrying... (${retries} attempts left)`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return dynamicImport(importFn, retries - 1, delay * 2)
    }
    throw error
  }
}

export function analyzeBundleSize() {
  if (typeof window !== "undefined" && "performance" in window) {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    const jsResources = resources.filter((r) => r.name.includes(".js"))

    const bundleAnalysis = {
      totalJSSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      largestBundle: jsResources.reduce((largest, r) =>
        (r.transferSize || 0) > (largest.transferSize || 0) ? r : largest,
      ),
      bundleCount: jsResources.length,
      slowestBundle: jsResources.reduce((slowest, r) => ((r.duration || 0) > (slowest.duration || 0) ? r : slowest)),
    }

    console.log("[v0] Bundle Analysis:", bundleAnalysis)
    return bundleAnalysis
  }
}
