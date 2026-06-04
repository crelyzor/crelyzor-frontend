import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from './apiClient';

function isDecryptFailed(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const data = error.data as { errorCode?: string } | null;
  return data?.errorCode === 'DECRYPT_FAILED';
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          return false;
        }
        if (isDecryptFailed(error)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        if (isDecryptFailed(error)) return;
        toast.error('Something went wrong');
      },
    },
  },
});
