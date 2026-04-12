/**
 * Monitoring Utility
 * Centralized error reporting and monitoring functionality
 */

// Types for error reporting
export interface ErrorDetails {
  /** The component or module where the error occurred */
  component: string;
  
  /** The specific action or operation that was being performed */
  action: string;
  
  /** The error object or message */
  error: Error | unknown;
  
  /** User ID if available - useful for user-specific debugging */
  userId?: string;
  
  /** Any additional context that might be helpful for debugging */
  context?: Record<string, any>;
  
  /** Severity level of the error */
  severity?: 'low' | 'medium' | 'high' | 'critical';
  
  /** Tags for categorizing errors */
  tags?: string[];
}

// Convert unknown error to string for logging
function errorToString(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }
  
  return String(error);
}

/**
 * Report an error to the monitoring system
 * 
 * @example
 * // Basic usage
 * reportError({
 *   component: 'StrategyDashboard',
 *   action: 'fetchStrategies',
 *   error: error
 * });
 * 
 * @example
 * // With additional context
 * reportError({
 *   component: 'ApiClient',
 *   action: 'fetchData',
 *   error: error,
 *   userId: user.id,
 *   severity: 'high',
 *   context: { url, params, response },
 *   tags: ['api', 'data-fetch']
 * });
 */
export function reportError(details: ErrorDetails): void {
  // For development, log to console
  console.error('[ERROR REPORT]', {
    timestamp: new Date().toISOString(),
    component: details.component,
    action: details.action,
    error: errorToString(details.error),
    userId: details.userId,
    context: details.context,
    severity: details.severity || 'medium',
    tags: details.tags || [],
  });

  // In a production environment, this would send to a monitoring service
  // Example implementation with Sentry:
  /*
  import * as Sentry from '@sentry/browser';
  
  // Set severity
  Sentry.configureScope((scope) => {
    if (details.userId) {
      scope.setUser({ id: details.userId });
    }
    
    scope.setLevel(details.severity === 'critical' ? 'fatal' :
                  details.severity === 'high' ? 'error' :
                  details.severity === 'medium' ? 'warning' :
                  'info');
    
    if (details.tags) {
      details.tags.forEach(tag => scope.setTag('custom_tag', tag));
    }
    
    scope.setTag('component', details.component);
    scope.setTag('action', details.action);
    
    if (details.context) {
      scope.setContext('additional_context', details.context);
    }
  });
  
  if (details.error instanceof Error) {
    Sentry.captureException(details.error);
  } else {
    Sentry.captureMessage(String(details.error));
  }
  */
}

/**
 * Track a performance metric
 */
export function trackPerformance(
  metricName: string,
  durationMs: number,
  tags: Record<string, string> = {}
): void {
  // For development, log to console
  console.info('[PERFORMANCE]', {
    metric: metricName,
    durationMs,
    tags,
    timestamp: new Date().toISOString(),
  });

  // In production, this would send to a monitoring service
  /*
  // Example with DataDog:
  import { datadogRum } from '@datadog/browser-rum';
  
  datadogRum.addTiming(metricName, durationMs);
  
  // For custom metrics with context
  datadogRum.addAction('custom_metric', {
    name: metricName,
    value: durationMs,
    ...tags
  });
  */
}

/**
 * Monitor an async function and report performance
 * 
 * @example
 * // Basic usage
 * const data = await withPerformanceTracking(
 *   () => fetchData(),
 *   'fetchData'
 * );
 */
export async function withPerformanceTracking<T>(
  fn: () => Promise<T>,
  metricName: string,
  tags: Record<string, string> = {}
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    trackPerformance(metricName, duration, tags);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackPerformance(`${metricName}_error`, duration, {
      ...tags,
      error: 'true',
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    throw error;
  }
}

/**
 * Initialize the monitoring system
 * Should be called early in the application lifecycle
 */
export function initializeMonitoring(options: {
  environment: 'development' | 'staging' | 'production';
  release?: string;
  enableConsoleReporting?: boolean;
}): void {
  // Log initialization for development
  console.info('[MONITORING] Initializing monitoring system', options);
  
  // In production, this would initialize monitoring services
  /*
  // Example with Sentry:
  import * as Sentry from '@sentry/browser';
  import { BrowserTracing } from '@sentry/tracing';
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: options.environment,
    release: options.release,
    integrations: [new BrowserTracing()],
    tracesSampleRate: options.environment === 'production' ? 0.1 : 1.0,
  });
  
  // Example with DataDog:
  import { datadogRum } from '@datadog/browser-rum';
  
  datadogRum.init({
    applicationId: process.env.DATADOG_APPLICATION_ID,
    clientToken: process.env.DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'nexquant-trading',
    env: options.environment,
    version: options.release,
    sampleRate: 100,
    trackInteractions: true,
  });
  */
}
