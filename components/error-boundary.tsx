/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Props for the error fallback render function
 */
interface FallbackRenderProps {
  error: Error | undefined;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  /**
   * UI to display when an error occurs - can be a React node or a render function
   */
  fallback: ReactNode | ((props: FallbackRenderProps) => ReactNode);
  
  /**
   * Optional callback to handle errors (e.g., for reporting to monitoring services)
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Components to render when no error occurs
   */
  children: ReactNode;
}

interface ErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  
  /**
   * The error that occurred, if any
   */
  error?: Error;
}

/**
 * Error Boundary component to catch rendering errors and display fallback UI
 * 
 * @example
 * // Basic usage
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 * 
 * @example
 * // With error reporting
 * <ErrorBoundary 
 *   fallback={<ErrorDisplay />}
 *   onError={(error) => reportError({ component: 'MyComponent', error })}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Update state when an error occurs - React will use this to render the fallback UI
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Catch and log errors - perfect place for error reporting
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report the error to the provided onError handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset the error state - useful for retry functionality
   */
  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If the fallback is a function, call it with the error and reset function
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary
        });
      }
      // Otherwise just render the fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with an error boundary
 */
export function withErrorBoundary<P>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}
