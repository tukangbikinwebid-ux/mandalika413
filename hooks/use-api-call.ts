"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ErrorHandler } from "@/lib/utils/error-handler";

interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiCallReturn<T> extends UseApiCallState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiCallReturn<T> {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use ref to store the latest apiFunction to avoid dependency issues
  const apiFunctionRef = useRef(apiFunction);
  useEffect(() => {
    apiFunctionRef.current = apiFunction;
  }, [apiFunction]);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunctionRef.current(...args);
        setState(prev => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (error) {
        const errorMessage = ErrorHandler.getErrorMessage(error);
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        return null;
      }
    },
    [] // Empty dependency array since we use ref
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
