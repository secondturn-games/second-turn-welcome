'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  FallbackComponent?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * A reusable error boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @component
 * @example
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call the onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { FallbackComponent } = this.props;
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} reset={this.handleReset} />;
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
          <h2 className="mb-4 text-xl font-bold">Something went wrong</h2>
          <pre className="mb-4 max-w-full overflow-auto rounded bg-muted p-4 text-sm">
            {this.state.error.toString()}
          </pre>
          <Button onClick={this.handleReset} variant="outline">
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A higher-order component that wraps a component with an ErrorBoundary
 *
 * @param Component - The component to wrap
 * @param FallbackComponent - Optional custom fallback component to render when an error occurs
 * @returns A new component wrapped with ErrorBoundary
 */
export function withErrorBoundary<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<{ error: Error; reset: () => void }>
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
