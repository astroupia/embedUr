import { useEffect, useState } from 'react';
import { useAuth } from '../auth-context';

interface UseProtectedApiOptions {
  skip?: boolean;
  onError?: (error: Error) => void;
}

export function useProtectedApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseProtectedApiOptions = {}
) {
  const { isAuthenticated, isInitialized } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if not initialized, not authenticated, or explicitly skipped
    if (!isInitialized || !isAuthenticated || options.skip) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiCall();
        setData(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isInitialized, isAuthenticated, options.skip, ...dependencies]);

  return { data, loading, error, refetch: () => {
    if (isInitialized && isAuthenticated && !options.skip) {
      apiCall().then(setData).catch(setError);
    }
  }};
} 