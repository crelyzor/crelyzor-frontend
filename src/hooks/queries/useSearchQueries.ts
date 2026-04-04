import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { searchApi } from '@/services/searchService';

export function useSearch(q: string) {
  return useQuery({
    queryKey: queryKeys.search.results(q),
    queryFn: () => searchApi.globalSearch(q),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
