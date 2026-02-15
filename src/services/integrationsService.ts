import { apiClient } from '@/lib/apiClient';

export type CalendarAccessStatus = {
  hasCalendarAccess: boolean;
  connectedAt: string | null;
};

export type GoogleScopesStatus = {
  hasAuth: boolean;
  hasCalendar: boolean;
  hasDrive: boolean;
};

export type SessionInfo = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  lastUsedAt?: string;
  isCurrent?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const integrationsApi = {
  /** GET /integrations/calendar/status — check Google Calendar connection */
  getCalendarStatus: () =>
    apiClient.get<CalendarAccessStatus>('/integrations/calendar/status'),

  /** GET /integrations/calendar/scopes/status — check Google scopes */
  getScopesStatus: () =>
    apiClient.get<GoogleScopesStatus>('/integrations/calendar/scopes/status'),

  /** Get the URL to redirect to for connecting Google Calendar */
  getConnectCalendarUrl: (): string => {
    return `${API_BASE_URL}/integrations/calendar/connect`;
  },
};

export const sessionsApi = {
  /** GET /auth/sessions — list active sessions */
  list: () => apiClient.get<SessionInfo[]>('/auth/sessions'),

  /** DELETE /auth/sessions/:sessionId — revoke a session */
  revoke: (sessionId: string) =>
    apiClient.delete<void>(`/auth/sessions/${sessionId}`),
};
