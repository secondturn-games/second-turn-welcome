import React, { useState, useCallback } from 'react';

/**
 * A custom hook to handle async operations with loading and error states
 * @template T - The type of the async function's return value
 * @param {(...args: any[]) => Promise<T>} asyncFunction - The async function to execute
 * @returns {[() => Promise<T | undefined>, boolean, Error | null, () => void]} - A tuple containing:
 * - execute: Function to execute the async operation
 * - isLoading: Boolean indicating if the operation is in progress
 * - error: Error object if the operation failed, null otherwise
 * - resetError: Function to reset the error state
 */
export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): [() => Promise<T | undefined>, boolean, Error | null, () => void] {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true);
        setError(null);
        return await asyncFunction(...args);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Async operation failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return [execute, isLoading, error, resetError];
}

/**
 * A wrapper component that handles loading and error states for async operations
 * @template T - The type of the data being loaded
 * @param {object} props - The component props
 * @param {() => Promise<T>} props.asyncFunction - The async function to execute
 * @param {(data: T) => React.ReactNode} props.children - Render prop that receives the loaded data
 * @param {React.ReactNode} [props.loadingFallback] - Optional custom loading UI
 * @param {(error: Error, retry: () => void) => React.ReactNode} [props.errorFallback] - Optional custom error UI
 * @returns {React.ReactNode} - The rendered component
 */
export function AsyncHandler<T>({
  asyncFunction,
  children,
  loadingFallback,
  errorFallback,
}: {
  asyncFunction: () => Promise<T>;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: Error, retry: () => void) => React.ReactNode;
}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Failed to load data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  // Load data on mount
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return loadingFallback || <div>Loading...</div>;
  }

  if (error) {
    if (errorFallback) {
      return <>{errorFallback(error, loadData)}</>;
    }
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={loadData}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return <>{children(data)}</>;
}
