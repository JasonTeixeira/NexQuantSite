export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side instrumentation
    const { performanceAnalytics } = await import("@/lib/performance-analytics")

    // Initialize server-side monitoring
    console.log("🚀 Server-side performance monitoring initialized")

    // Track server startup metrics
    const startTime = Date.now()
    process.on("exit", () => {
      const uptime = Date.now() - startTime
      console.log(`📊 Server uptime: ${uptime}ms`)
    })
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime instrumentation
    console.log("⚡ Edge runtime performance monitoring initialized")
  }
}
