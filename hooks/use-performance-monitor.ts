/**
 * 📊 PERFORMANCE MONITORING HOOK
 * React hook for monitoring component performance and rendering
 */

import { useEffect, useRef, useCallback } from 'react';
import { createComponentMonitor } from '@/lib/monitoring/index';

interface PerformanceOptions {
  /**
   * Unique identifier for this component instance
   */
  instanceId?: string;
  
  /**
   * Additional context to include with performance metrics
   */
  context?: Record<string, any>;
  
  /**
   * Whether to track render times (defaults to true)
   */
  trackRenders?: boolean;
  
  /**
   * Whether to track mount/unmount times (defaults to true)
   */
  trackLifecycle?: boolean;
  
  /**
   * Whether to track effect executions (defaults to false)
   */
  trackEffects?: boolean;
  
  /**
   * Whether to track event handler executions (defaults to false)
   */
  trackEvents?: boolean;
}

/**
 * Custom hook for monitoring component performance
 */
export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceOptions = {}
) {
  // Default options
  const {
    instanceId = '',
    context = {},
    trackRenders = true,
    trackLifecycle = true,
    trackEffects = false,
    trackEvents = false
  } = options;

  // Create a monitor for this component
  const monitor = createComponentMonitor(
    `component.${componentName}${instanceId ? `.${instanceId}` : ''}`
  );

  // Track component instance ID and mount time
  const idRef = useRef<string>(instanceId || crypto.randomUUID().slice(0, 8));
  const mountTimeRef = useRef<number>(performance.now());
  const renderCountRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(performance.now());

  // Measure a function execution time
  const measureFn = useCallback(
    <T>(name: string, fn: () => T, eventContext: Record<string, any> = {}): T => {
      return monitor.measure(name, fn, {
        ...context,
        ...eventContext,
        instanceId: idRef.current,
        renderCount: renderCountRef.current
      });
    },
    [monitor, context]
  );

  // Measure an async function execution time
  const measureAsyncFn = useCallback(
    <T>(
      name: string,
      fn: () => Promise<T>,
      eventContext: Record<string, any> = {}
    ): Promise<T> => {
      return monitor.measureAsync(name, fn, {
        ...context,
        ...eventContext,
        instanceId: idRef.current,
        renderCount: renderCountRef.current
      });
    },
    [monitor, context]
  );

  // Create an event handler wrapper that measures performance
  const createMeasuredEventHandler = useCallback(
    <Args extends any[]>(
      name: string,
      handler: (...args: Args) => void,
      eventContext: Record<string, any> = {}
    ) => {
      if (!trackEvents) return handler;

      return (...args: Args) => {
        return measureFn(
          `event.${name}`,
          () => handler(...args),
          eventContext
        );
      };
    },
    [measureFn, trackEvents]
  );

  // Create an async event handler wrapper that measures performance
  const createMeasuredAsyncEventHandler = useCallback(
    <Args extends any[], Return>(
      name: string,
      handler: (...args: Args) => Promise<Return>,
      eventContext: Record<string, any> = {}
    ) => {
      if (!trackEvents) return handler;

      return async (...args: Args): Promise<Return> => {
        return await measureAsyncFn(
          `event.${name}`,
          () => handler(...args),
          eventContext
        );
      };
    },
    [measureAsyncFn, trackEvents]
  );

  // Measure effect execution time
  const measureEffect = useCallback(
    (
      name: string,
      effectFn: () => void | (() => void),
      deps: React.DependencyList = [],
      effectContext: Record<string, any> = {}
    ) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useEffect(() => {
        if (!trackEffects) return effectFn();

        let cleanup: void | (() => void);

        monitor.measure(
          `effect.${name}`,
          () => {
            cleanup = effectFn();
          },
          {
            ...context,
            ...effectContext,
            instanceId: idRef.current,
            renderCount: renderCountRef.current
          }
        );

        return () => {
          if (typeof cleanup === 'function') {
            monitor.measure(
              `effect.${name}.cleanup`,
              cleanup,
              {
                ...context,
                ...effectContext,
                instanceId: idRef.current,
                renderCount: renderCountRef.current
              }
            );
          }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, deps);
    },
    [monitor, trackEffects, context]
  );

  // Track component mount and unmount
  useEffect(() => {
    if (trackLifecycle) {
      const mountDuration = performance.now() - mountTimeRef.current;
      
      monitor.trackMetric('mount', mountDuration, 'ms', {
        ...context,
        instanceId: idRef.current
      });
      
      monitor.trackUsage('lifecycle', 'mount', {
        context: {
          ...context,
          instanceId: idRef.current
        }
      });
    }

    return () => {
      if (trackLifecycle) {
        const lifetimeDuration = performance.now() - mountTimeRef.current;
        
        monitor.trackMetric('lifetime', lifetimeDuration, 'ms', {
          ...context,
          instanceId: idRef.current,
          renderCount: renderCountRef.current
        });
        
        monitor.trackUsage('lifecycle', 'unmount', {
          context: {
            ...context,
            instanceId: idRef.current,
            renderCount: renderCountRef.current,
            lifetimeDuration
          }
        });
      }
    };
  }, [monitor, trackLifecycle, context]);

  // Track component renders
  useEffect(() => {
    if (trackRenders) {
      const now = performance.now();
      const renderDuration = now - lastRenderTimeRef.current;
      
      // Skip the first render since it's captured in the mount metric
      if (renderCountRef.current > 0) {
        monitor.trackMetric('render', renderDuration, 'ms', {
          ...context,
          instanceId: idRef.current,
          renderCount: renderCountRef.current
        });
      }
      
      renderCountRef.current++;
      lastRenderTimeRef.current = now;
    }
  });

  // Return utility functions for measuring performance
  return {
    /**
     * Measure a synchronous function execution
     */
    measureFn,
    
    /**
     * Measure an asynchronous function execution
     */
    measureAsyncFn,
    
    /**
     * Create a measured synchronous event handler
     */
    createMeasuredEventHandler,
    
    /**
     * Create a measured asynchronous event handler
     */
    createMeasuredAsyncEventHandler,
    
    /**
     * Measure an effect execution (similar to useEffect)
     */
    measureEffect,
    
    /**
     * The component monitor instance
     */
    monitor,
    
    /**
     * Instance ID for this component
     */
    instanceId: idRef.current,
    
    /**
     * Current render count
     */
    renderCount: renderCountRef.current
  };
}

export default usePerformanceMonitor;
