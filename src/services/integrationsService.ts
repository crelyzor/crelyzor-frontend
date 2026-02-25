import { apiClient } from '@/lib/apiClient';

export type SessionInfo = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  lastUsedAt?: string;
  isCurrent?: boolean;
};

export const sessionsApi = {
  /** GET /auth/sessions — list active sessions */
  list: () => apiClient.get<SessionInfo[]>('/auth/sessions'),

  /** DELETE /auth/sessions/:sessionId — revoke a session */
  revoke: (sessionId: string) =>
    apiClient.delete<void>(`/auth/sessions/${sessionId}`),
};
