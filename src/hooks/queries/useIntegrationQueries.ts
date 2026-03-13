import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sessionsApi } from '@/services/integrationsService';
import { useAuthStore } from '@/stores';
import { queryKeys } from '@/lib/queryKeys';

export function useSessions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.auth.sessions(),
    queryFn: () => sessionsApi.list(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.revoke(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.sessions() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke session');
    },
  });
}
