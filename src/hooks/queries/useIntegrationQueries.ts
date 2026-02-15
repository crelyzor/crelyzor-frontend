import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi, sessionsApi } from '@/services/integrationsService';
import { useAuthStore } from '@/stores';

export function useCalendarStatus() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['integrations', 'calendar', 'status'],
    queryFn: () => integrationsApi.getCalendarStatus(),
    enabled: isAuthenticated,
  });
}

export function useGoogleScopesStatus() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['integrations', 'google', 'scopes'],
    queryFn: () => integrationsApi.getScopesStatus(),
    enabled: isAuthenticated,
  });
}

export function useConnectCalendar() {
  return {
    connect: () => {
      const token = useAuthStore.getState().accessToken;
      const url = `${integrationsApi.getConnectCalendarUrl()}?token=${encodeURIComponent(token ?? '')}`;
      window.location.href = url;
    },
  };
}

export function useSessions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => sessionsApi.list(),
    enabled: isAuthenticated,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.revoke(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
  });
}
