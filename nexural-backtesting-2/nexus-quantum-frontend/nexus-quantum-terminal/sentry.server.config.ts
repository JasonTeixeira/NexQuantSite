import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://your-sentry-dsn@your-org.ingest.sentry.io/your-project",
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.APP_VERSION || "1.0.0",
  
  // Debug mode
  debug: process.env.NODE_ENV === "development",
  
  // Before send filter
  beforeSend(event, hint) {
    // Add quant-specific context
    if (event.contexts?.app) {
      event.contexts.app.name = "Nexus Quant Terminal Server";
      event.contexts.app.version = process.env.APP_VERSION || "1.0.0";
    }
    
    // Add server-specific tags
    event.tags = {
      ...event.tags,
      component: "quant-terminal-server",
      environment: process.env.NODE_ENV,
    };
    
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.nodeTracingIntegration(),
  ],
  
  // Initial scope
  initialScope: {
    tags: {
      component: "quant-terminal-server",
      environment: process.env.NODE_ENV,
    },
  },
});
