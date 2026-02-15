import { apiClient } from '@/lib/apiClient';
import type { Meeting, MeetingStatus, MeetingMode } from '@/types';

export type MeetingsListParams = {
  status?: MeetingStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
};

export type CreateMeetingPayload = {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  mode: MeetingMode;
  location?: string;
  participantMemberIds?: string[];
  guestEmails?: string[];
  notes?: string;
};

export type UpdateMeetingPayload = Partial<CreateMeetingPayload>;

export const meetingsApi = {
  /** GET /meetings — paginated list with filters */
  list: (params?: MeetingsListParams) =>
    apiClient.get<{ meetings: Meeting[]; total: number }>(
      '/meetings',
      { params: params as Record<string, string> }
    ),

  /** GET /meetings/without-pagination — all meetings (calendar view, max 1000) */
  listAll: (params?: { status?: MeetingStatus; startDate?: string; endDate?: string }) =>
    apiClient.get<Meeting[]>(
      '/meetings/without-pagination',
      { params: params as Record<string, string> }
    ),

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
  accept: (id: string) =>
    apiClient.patch<Meeting>(`/meetings/${id}/accept`),

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
  reschedule: (id: string, data: { newStartTime: string; newEndTime: string; reason?: string }) =>
    apiClient.post<void>(`/meetings/${id}/reschedule`, data),

  /** POST /meetings/public-booking/generate */
  generatePublicLink: () =>
    apiClient.post<{ shareToken: string; bookingUrl: string }>('/meetings/public-booking/generate'),

  /** GET /meetings/public-booking/status */
  getPublicBookingStatus: () =>
    apiClient.get<{ isActive: boolean; shareToken?: string }>('/meetings/public-booking/status'),

  /** POST /meetings/public-booking/disable */
  disablePublicBooking: () =>
    apiClient.post<void>('/meetings/public-booking/disable'),
};
