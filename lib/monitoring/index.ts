/**
 * 📊 COMPREHENSIVE MONITORING SYSTEM
 * Centralized logging, error tracking, and performance monitoring
 */

import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';

// Types
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport {
  id?: string;
  component: string;
  action: string;
  error: Error | string | any;
  context?: Record<string, any>;
  severity: ErrorSeverity;
  timestamp?: Date;
}

export interface PerformanceMetric {
  id?: string;
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent' | string;
  context?: Record<string, any>;
  timestamp?: Date;
}

export interface UsageMetric {
  id?: string;
  feature: string;
  action: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
  timestamp?: Date;
}

// Monitoring configuration
interface MonitoringConfig {
  enableConsoleLogging: boolean;
  enableMetricCollection: boolean;
  sampleRate: number;
  errorReportingEndpoint?: string;
  metricsEndpoint?: string;
  usageEndpoint?: string;
  flushInterval: number;
  maxBatchSize: number;
  sentryDSN?: string;
}

// Default configuration
const DEFAULT_CONFIG: MonitoringConfig = {
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableMetricCollection: true,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1, // Sample 10% in production, 100% in dev
  flushInterval: 30000, // 30 seconds
  maxBatchSize: 50
};

// Global monitoring state
class MonitoringSystem {
  private config: MonitoringConfig;
  private errorBuffer: ErrorReport[] = [];
  private metricBuffer: PerformanceMetric[] = [];
  private usageBuffer: UsageMetric[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private performanceMarks: Record<string, number> = {};

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initialize();
  }

  /**
   * Initialize the monitoring system
   */
  private initialize(): void {
    if (this.isInitialized) return;

    // Start flush timer
    if (typeof window !== 'undefined') {
      this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
    }

    // Set up unload handler to flush data
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }

    // Set up global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.reportError({
          component: 'window',
          action: 'global',
          error: event.error || event.message,
          context: {
            url: window.location.href,
            source: event.filename,
            line: event.lineno,
            column: event.colno
          },
          severity: 'high'
        });
      });
    }

    this.isInitialized = true;
  }

  /**
   * Flush all buffered data to endpoints
   */
  private async flush(): Promise<void> {
    // Only flush if there's data
    if (
      this.errorBuffer.length === 0 &&
      this.metricBuffer.length === 0 &&
      this.usageBuffer.length === 0
    ) {
      return;
    }

    // Clone and clear buffers
    const errors = [...this.errorBuffer];
    const metrics = [...this.metricBuffer];
    const usage = [...this.usageBuffer];

    this.errorBuffer = [];
    this.metricBuffer = [];
    this.usageBuffer = [];

    // Send data to endpoints
    try {
      await Promise.all([
        this.sendErrors(errors),
        this.sendMetrics(metrics),
        this.sendUsage(usage)
      ]);
    } catch (error) {
      console.error('Error flushing monitoring data:', error);
      
      // If sending fails, add the items back to the buffer
      this.errorBuffer.push(...errors);
      this.metricBuffer.push(...metrics);
      this.usageBuffer.push(...usage);
      
      // Truncate buffers if they get too large
      if (this.errorBuffer.length > this.config.maxBatchSize) {
        this.errorBuffer = this.errorBuffer.slice(-this.config.maxBatchSize);
      }
      if (this.metricBuffer.length > this.config.maxBatchSize) {
        this.metricBuffer = this.metricBuffer.slice(-this.config.maxBatchSize);
      }
      if (this.usageBuffer.length > this.config.maxBatchSize) {
        this.usageBuffer = this.usageBuffer.slice(-this.config.maxBatchSize);
      }
    }
  }

  /**
   * Send errors to endpoint
   */
  private async sendErrors(errors: ErrorReport[]): Promise<void> {
    if (errors.length === 0) return;

    if (this.config.errorReportingEndpoint) {
      try {
        await fetch(this.config.errorReportingEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ errors }),
          // Use keepalive to ensure the request completes even if the page is unloading
          keepalive: true
        });
      } catch (error) {
        console.error('Failed to send errors to endpoint:', error);
      }
    }
  }

  /**
   * Send metrics to endpoint
   */
  private async sendMetrics(metrics: PerformanceMetric[]): Promise<void> {
    if (metrics.length === 0) return;

    if (this.config.metricsEndpoint) {
      try {
        await fetch(this.config.metricsEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics }),
          keepalive: true
        });
      } catch (error) {
        console.error('Failed to send metrics to endpoint:', error);
      }
    }
  }

  /**
   * Send usage data to endpoint
   */
  private async sendUsage(usage: UsageMetric[]): Promise<void> {
    if (usage.length === 0) return;

    if (this.config.usageEndpoint) {
      try {
        await fetch(this.config.usageEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usage }),
          keepalive: true
        });
      } catch (error) {
        console.error('Failed to send usage data to endpoint:', error);
      }
    }
  }

  /**
   * Determine if an event should be sampled based on sample rate
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Format error object for reporting
   */
  private formatError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    if (typeof error === 'string') {
      return { message: error };
    }
    
    return error;
  }

  /**
   * Report an error to the monitoring system
   */
  reportError(report: Omit<ErrorReport, 'id' | 'timestamp'>): void {
    const formattedReport: ErrorReport = {
      ...report,
      id: uuidv4(),
      error: this.formatError(report.error),
      timestamp: new Date()
    };

    // Always log critical errors to console
    if (
      this.config.enableConsoleLogging ||
      formattedReport.severity === 'critical'
    ) {
      console.error(
        `[${formattedReport.severity.toUpperCase()}] ${formattedReport.component}:${
          formattedReport.action
        }`,
        formattedReport.error,
        formattedReport.context
      );
    }

    // Add to buffer if sampling passes
    if (this.shouldSample()) {
      this.errorBuffer.push(formattedReport);
      
      // Flush immediately for critical errors
      if (formattedReport.severity === 'critical') {
        this.flush();
      }
    }
  }

  /**
   * Track a performance metric
   */
  trackMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const formattedMetric: PerformanceMetric = {
      ...metric,
      id: uuidv4(),
      timestamp: new Date()
    };

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      console.log(
        `📊 METRIC ${formattedMetric.name}: ${formattedMetric.value}${formattedMetric.unit}`,
        formattedMetric.context
      );
    }

    // Add to buffer if collection is enabled and sampling passes
    if (this.config.enableMetricCollection && this.shouldSample()) {
      this.metricBuffer.push(formattedMetric);
    }
  }

  /**
   * Track usage of a feature
   */
  trackUsage(usage: Omit<UsageMetric, 'id' | 'timestamp'>): void {
    const formattedUsage: UsageMetric = {
      ...usage,
      id: uuidv4(),
      timestamp: new Date()
    };

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      console.log(
        `👤 USAGE ${formattedUsage.feature}:${formattedUsage.action}`,
        formattedUsage.context
      );
    }

    // Add to buffer if sampling passes
    if (this.shouldSample()) {
      this.usageBuffer.push(formattedUsage);
    }
  }

  /**
   * Start a performance measurement
   */
  startMeasurement(name: string): void {
    this.performanceMarks[name] = performance.now();
  }

  /**
   * End a performance measurement and record the metric
   */
  endMeasurement(name: string, context?: Record<string, any>): number | null {
    const startTime = this.performanceMarks[name];
    if (startTime === undefined) {
      this.reportError({
        component: 'Monitoring',
        action: 'endMeasurement',
        error: `No start mark found for measurement: ${name}`,
        severity: 'low'
      });
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track as a metric
    this.trackMetric({
      name: `duration.${name}`,
      value: duration,
      unit: 'ms',
      context
    });

    // Clean up
    delete this.performanceMarks[name];

    return duration;
  }

  /**
   * Measure the execution time of a function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    this.startMeasurement(name);
    try {
      const result = await fn();
      this.endMeasurement(name, context);
      return result;
    } catch (error) {
      this.endMeasurement(name, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Measure the execution time of a synchronous function
   */
  measure<T>(
    name: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    this.startMeasurement(name);
    try {
      const result = fn();
      this.endMeasurement(name, context);
      return result;
    } catch (error) {
      this.endMeasurement(name, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart timer with new interval if needed
    if (
      this.flushTimer &&
      config.flushInterval &&
      config.flushInterval !== this.config.flushInterval
    ) {
      clearInterval(this.flushTimer);
      this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
    }
  }

  /**
   * Create a monitoring instance for a specific component
   */
  createComponentMonitor(component: string): ComponentMonitor {
    return new ComponentMonitor(this, component);
  }
}

/**
 * Component-specific monitoring interface
 */
class ComponentMonitor {
  constructor(
    private monitoring: MonitoringSystem,
    private component: string
  ) {}

  /**
   * Report an error from this component
   */
  reportError(
    action: string,
    error: Error | string | any,
    options: {
      context?: Record<string, any>;
      severity?: ErrorSeverity;
    } = {}
  ): void {
    this.monitoring.reportError({
      component: this.component,
      action,
      error,
      context: options.context,
      severity: options.severity || 'medium'
    });
  }

  /**
   * Track a metric from this component
   */
  trackMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' | 'percent' | string,
    context?: Record<string, any>
  ): void {
    this.monitoring.trackMetric({
      name: `${this.component}.${name}`,
      value,
      unit,
      context
    });
  }

  /**
   * Track feature usage from this component
   */
  trackUsage(
    feature: string,
    action: string,
    options: {
      userId?: string;
      sessionId?: string;
      context?: Record<string, any>;
    } = {}
  ): void {
    this.monitoring.trackUsage({
      feature: `${this.component}.${feature}`,
      action,
      userId: options.userId,
      sessionId: options.sessionId,
      context: options.context
    });
  }

  /**
   * Start a performance measurement for this component
   */
  startMeasurement(name: string): void {
    this.monitoring.startMeasurement(`${this.component}.${name}`);
  }

  /**
   * End a performance measurement for this component
   */
  endMeasurement(name: string, context?: Record<string, any>): number | null {
    return this.monitoring.endMeasurement(`${this.component}.${name}`, context);
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    return this.monitoring.measureAsync(`${this.component}.${name}`, fn, context);
  }

  /**
   * Measure a synchronous function execution time
   */
  measure<T>(
    name: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    return this.monitoring.measure(`${this.component}.${name}`, fn, context);
  }
}

// Create global instance
const monitoring = new MonitoringSystem();

// Export monitoring functions for direct use
export const reportError = (report: Omit<ErrorReport, 'id' | 'timestamp'>): void => {
  monitoring.reportError(report);
};

export const trackMetric = (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void => {
  monitoring.trackMetric(metric);
};

export const trackUsage = (usage: Omit<UsageMetric, 'id' | 'timestamp'>): void => {
  monitoring.trackUsage(usage);
};

export const startMeasurement = (name: string): void => {
  monitoring.startMeasurement(name);
};

export const endMeasurement = (
  name: string,
  context?: Record<string, any>
): number | null => {
  return monitoring.endMeasurement(name, context);
};

export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  return monitoring.measureAsync(name, fn, context);
};

export const measure = <T>(
  name: string,
  fn: () => T,
  context?: Record<string, any>
): T => {
  return monitoring.measure(name, fn, context);
};

export const createComponentMonitor = (component: string): ComponentMonitor => {
  return monitoring.createComponentMonitor(component);
};

// Configure monitoring
export const configureMonitoring = (config: Partial<MonitoringConfig>): void => {
  monitoring.updateConfig(config);
};

// Export global instance and classes for advanced usage
export { monitoring, MonitoringSystem, ComponentMonitor };

// Default export
export default monitoring;
