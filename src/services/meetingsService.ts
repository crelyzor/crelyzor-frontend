import { apiClient } from '@/lib/apiClient';
import type { Meeting, ScheduledMeeting } from '@/types';

export type MeetingsListParams = {
  type?: 'upcoming' | 'past' | 'live';
  page?: number;
  limit?: number;
  search?: string;
};

export type CreateMeetingPayload = {
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: string[];
  type: string;
  location?: string;
};

export const meetingsApi = {
  list: (params?: MeetingsListParams) =>
    apiClient.get<{ meetings: ScheduledMeeting[]; total: number }>(
      '/meetings',
      { params: params as Record<string, string> }
    ),

  getById: (id: string | number) => apiClient.get<Meeting>(`/meetings/${id}`),

  create: (data: CreateMeetingPayload) =>
    apiClient.post<ScheduledMeeting>('/meetings', data),

  update: (id: string | number, data: Partial<CreateMeetingPayload>) =>
    apiClient.patch<ScheduledMeeting>(`/meetings/${id}`, data),

  cancel: (id: string | number) =>
    apiClient.patch<void>(`/meetings/${id}/cancel`),

  delete: (id: string | number) => apiClient.delete<void>(`/meetings/${id}`),
};
