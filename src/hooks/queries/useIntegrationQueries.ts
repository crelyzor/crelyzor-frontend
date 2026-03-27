import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sessionsApi, integrationsApi } from '@/services/integrationsService';
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

export function useGoogleCalendarStatus() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.integrations.google.status(),
    queryFn: () => integrationsApi.getGoogleCalendarStatus(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useGoogleCalendarEvents(start: string, end: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.integrations.google.events(start, end),
    queryFn: () => integrationsApi.getGoogleCalendarEvents(start, end),
    enabled: isAuthenticated && start.length > 0 && end.length > 0,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.events,
  });
}

export function useDisconnectGoogleCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => integrationsApi.disconnectGoogleCalendar(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.integrations.google.status(),
      });
      qc.invalidateQueries({ queryKey: queryKeys.settings.all });
      toast.success('Google Calendar disconnected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disconnect Google Calendar');
    },
  });
}
