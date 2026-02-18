import { apiClient } from '@/lib/apiClient';
import type { AvailabilitySchedule } from '@/types';

export type CreateSchedulePayload = {
  name?: string;
  timezone?: string;
};

export type UpdateSchedulePayload = {
  name?: string;
  timezone?: string;
  isActive?: boolean;
};

export const scheduleApi = {
  /** GET /schedules — list all schedules */
  getSchedules: () => apiClient.get<AvailabilitySchedule[]>('/schedules'),

  /** GET /schedules/default — get or auto-create default */
  getDefaultSchedule: () =>
    apiClient.get<AvailabilitySchedule>('/schedules/default'),

  /** POST /schedules — create schedule */
  createSchedule: (data: { name?: string; timezone?: string }) =>
    apiClient.post<AvailabilitySchedule>('/schedules', data),

  /** PUT /schedules/:id — update schedule */
  updateSchedule: (
    id: string,
    data: { name?: string; timezone?: string; isActive?: boolean }
  ) => apiClient.put<AvailabilitySchedule>(`/schedules/${id}`, data),

  /** DELETE /schedules/:id — delete schedule */
  deleteSchedule: (id: string) =>
    apiClient.delete<AvailabilitySchedule>(`/schedules/${id}`),

  /** PATCH /schedules/:id/default — set as default */
  setDefaultSchedule: (id: string) =>
    apiClient.patch<AvailabilitySchedule>(`/schedules/${id}/default`),
};
