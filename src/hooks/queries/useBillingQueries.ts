import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { billingApi } from '@/services/billingService';
import { useAuthStore } from '@/stores';

/** Fetches the current user's plan, usage, limits, and reset date. */
export function useBillingUsage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.billing.usage(),
    queryFn: billingApi.getUsage,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
