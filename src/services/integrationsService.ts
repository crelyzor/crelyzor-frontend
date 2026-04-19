import { apiClient } from '@/lib/apiClient';

export type SessionInfo = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  lastUsedAt?: string;
  isCurrent?: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string; // ISO string (serialized from Date by backend)
  endTime: string; // ISO string
  location?: string;
  meetLink?: string;
  source: 'GOOGLE';
};

export type GCalConnectionStatus = {
  connected: boolean;
  writable: boolean;
  email: string | null;
  syncEnabled: boolean;
  pushEnabled: boolean; // Phase 4.3: true when a push watch channel is active
};

export const sessionsApi = {
  /** GET /auth/sessions — list active sessions */
  list: () => apiClient.get<SessionInfo[]>('/auth/sessions'),

  /** DELETE /auth/sessions/:sessionId — revoke a session */
  revoke: (sessionId: string) =>
    apiClient.delete<void>(`/auth/sessions/${sessionId}`),
};

export const integrationsApi = {
  /** GET /integrations/google/status — GCal connection + sync state */
  getGoogleCalendarStatus: () =>
    apiClient.get<GCalConnectionStatus>('/integrations/google/status'),

  /** GET /integrations/google/events?start=&end= — events in window */
  getGoogleCalendarEvents: (start: string, end: string) =>
    apiClient.get<{ events: CalendarEvent[] }>('/integrations/google/events', {
      params: { start, end },
    }),

  /** DELETE /integrations/google/disconnect — strips calendar scopes and clears settings */
  disconnectGoogleCalendar: () =>
    apiClient.delete<void>('/integrations/google/disconnect'),

  /** POST /integrations/google/calendar/push/register — register push watch channel */
  registerGCalPushChannel: () =>
    apiClient.post<{ pushEnabled: boolean }>('/integrations/google/calendar/push/register'),
};
