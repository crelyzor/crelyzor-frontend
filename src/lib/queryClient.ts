import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from './apiClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Never retry auth/permission errors — they will not resolve on their own
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error: unknown) => {
        const message =
          import.meta.env.PROD || !(error instanceof Error)
            ? 'Something went wrong'
            : error.message;
        toast.error(message);
      },
    },
  },
});
