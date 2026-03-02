import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores';
import type { Meeting, MeetingStatus, MeetingKind } from '@/types';

export type MeetingsListParams = {
  status?: MeetingStatus;
  type?: MeetingKind;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
};

export type CreateMeetingPayload = {
  title?: string;
  description?: string;
  type?: MeetingKind;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  location?: string;
  participantUserIds?: string[];
  notes?: string;
};

export type UpdateMeetingPayload = Partial<CreateMeetingPayload>;

export const meetingsApi = {
  /** GET /meetings — paginated list with filters */
  list: (params?: MeetingsListParams) =>
    apiClient.get<{ meetings: Meeting[]; pagination: { count: number } }>(
      '/meetings',
      { params: params as Record<string, string> }
    ),

  /** GET /meetings/without-pagination — all meetings (calendar view, max 1000) */
  listAll: (params?: {
    status?: MeetingStatus;
    type?: MeetingKind;
    startDate?: string;
    endDate?: string;
  }) =>
    apiClient.get<Meeting[]>('/meetings/without-pagination', {
      params: params as Record<string, string>,
    }),

  /** GET /meetings/:id */
  getById: (id: string) => apiClient.get<Meeting>(`/meetings/${id}`),

  /** POST /meetings — create meeting (auto-accepted) */
  create: (data: CreateMeetingPayload) =>
    apiClient.post<Meeting>('/meetings', data),

  /** POST /meetings/request — request meeting (pending acceptance) */
  request: (data: CreateMeetingPayload) =>
    apiClient.post<Meeting>('/meetings/request', data),

  /** PATCH /meetings/:id */
  update: (id: string, data: UpdateMeetingPayload) =>
    apiClient.patch<Meeting>(`/meetings/${id}`, data),

  /** PATCH /meetings/:id/accept */
  accept: (id: string) => apiClient.patch<Meeting>(`/meetings/${id}/accept`),

  /** PATCH /meetings/:id/decline */
  decline: (id: string, reason?: string) =>
    apiClient.patch<Meeting>(`/meetings/${id}/decline`, { reason }),

  /** PATCH /meetings/:id/cancel */
  cancel: (id: string, reason?: string) =>
    apiClient.patch<Meeting>(`/meetings/${id}/cancel`, { reason }),

  /** PATCH /meetings/:id/complete */
  complete: (id: string) =>
    apiClient.patch<Meeting>(`/meetings/${id}/complete`),

  /** POST /meetings/:id/reschedule */
  reschedule: (
    id: string,
    data: { newStartTime: string; newEndTime: string; reason?: string }
  ) => apiClient.post<void>(`/meetings/${id}/reschedule`, data),

  /** POST /meetings/public-booking/generate */
  generatePublicLink: () =>
    apiClient.post<{ shareToken: string; bookingUrl: string }>(
      '/meetings/public-booking/generate'
    ),

  /** GET /meetings/public-booking/status */
  getPublicBookingStatus: () =>
    apiClient.get<{ isActive: boolean; shareToken?: string }>(
      '/meetings/public-booking/status'
    ),

  /** POST /meetings/public-booking/disable */
  disablePublicBooking: () =>
    apiClient.post<void>('/meetings/public-booking/disable'),

  /** POST /sma/meetings/:id/recordings — upload audio blob */
  uploadRecording: async (
    meetingId: string,
    blob: Blob,
    duration: number
  ): Promise<{ id: string }> => {
    const token = useAuthStore.getState().accessToken;
    const form = new FormData();
    // Backend multer expects field name "file"
    const filename = `recording.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`;
    form.append('file', blob, filename);
    form.append('duration', String(Math.round(duration)));

    const API_BASE =
      (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    const base = API_BASE.startsWith('http')
      ? API_BASE
      : `${window.location.origin}${API_BASE}`;

    const res = await fetch(`${base}/sma/meetings/${meetingId}/recordings`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? `Upload failed: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data ?? json;
  },
};
