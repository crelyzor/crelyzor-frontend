import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
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
