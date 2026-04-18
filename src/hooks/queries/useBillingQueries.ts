import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { billingApi } from '@/services/billingService';

/** Fetches the current user's plan, usage, limits, and reset date. */
export function useBillingUsage() {
  return useQuery({
    queryKey: queryKeys.billing.usage(),
    queryFn: billingApi.getUsage,
    // Refresh every 5 minutes — usage counters change slowly
    staleTime: 5 * 60 * 1000,
  });
}
