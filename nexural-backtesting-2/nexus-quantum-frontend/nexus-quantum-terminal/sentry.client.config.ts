import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://your-sentry-dsn@your-org.ingest.sentry.io/your-project",
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  
  // Debug mode
  debug: process.env.NODE_ENV === "development",
  
  // Before send filter
  beforeSend(event, hint) {
    // Filter out certain errors in development
    if (process.env.NODE_ENV === "development") {
      // Don't send console errors in development
      if (event.exception && event.exception.values) {
        const isConsoleError = event.exception.values.some(
          (exception) => exception.value?.includes("console.error")
        );
        if (isConsoleError) return null;
      }
    }
    
    // Add quant-specific context
    if (event.contexts?.app) {
      event.contexts.app.name = "Nexus Quant Terminal";
      event.contexts.app.version = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Initial scope
  initialScope: {
    tags: {
      component: "quant-terminal",
      environment: process.env.NODE_ENV,
    },
  },
});
