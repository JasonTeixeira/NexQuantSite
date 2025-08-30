export const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[DEBUG ${new Date().toISOString()}] ${message}`,
        'color: #00ff00; font-weight: bold',
        data || ''
      );
    }
  },
  
  error: (message: string, error?: any) => {
    try {
      console.error(
        `%c[ERROR ${new Date().toISOString()}] ${message}`,
        'color: #ff0000; font-weight: bold'
      );
      if (error) {
        console.error(error);
      }
      // Send to Sentry in production
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error);
      }
    } catch (e) {
      // Fallback if debug logging fails
      console.error('Debug logging error:', e);
    }
  },
  
  warn: (message: string, data?: any) => {
    console.warn(
      `%c[WARN ${new Date().toISOString()}] ${message}`,
      'color: #ffaa00; font-weight: bold',
      data || ''
    );
  },
  
  table: (data: any) => {
    console.table(data);
  },
  
  time: (label: string) => {
    console.time(label);
  },
  
  timeEnd: (label: string) => {
    console.timeEnd(label);
  },

  // Quant-specific debugging
  backtest: (config: any, results: any) => {
    debug.log('Backtest Configuration', config);
    debug.log('Backtest Results', {
      sharpe: results?.sharpe,
      totalReturn: results?.totalReturn,
      maxDrawdown: results?.maxDrawdown,
      trades: results?.trades
    });
  },

  performance: (component: string, renderTime: number) => {
    if (renderTime > 16) { // 60fps threshold
      debug.warn(`Slow render in ${component}: ${renderTime}ms`);
    }
  },

  api: (endpoint: string, method: string, duration: number) => {
    if (duration > 1000) {
      debug.warn(`Slow API call: ${method} ${endpoint} took ${duration}ms`);
    }
  },

  memory: () => {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory;
      const used = Math.round(mem.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(mem.totalJSHeapSize / 1024 / 1024);
      if (used > total * 0.8) {
        debug.warn(`High memory usage: ${used}MB / ${total}MB`);
      }
    }
  }
};

// Performance monitoring
export const performanceMonitor = {
  start: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      debug.log(`Performance: ${label}`, `${Math.round(measure.duration)}ms`);
    }
  }
};

// Error boundary helper
export const captureError = (error: Error, context?: any) => {
  try {
    // Simple error logging to avoid recursive errors
    console.error('[ERROR BOUNDARY]', error.message);
    if (context) {
      console.error('[ERROR CONTEXT]', context);
    }
    
    // Send to analytics (optional, don't let it fail)
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/analytics/error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        }).catch(() => {}); // Don't let error reporting fail
      } catch {}
    }
  } catch (e) {
    // Ultimate fallback - don't let error reporting crash the app
    console.error('Error reporting failed:', e);
  }
};
