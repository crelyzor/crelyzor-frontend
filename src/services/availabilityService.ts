import { apiClient } from '@/lib/apiClient';
import type {
  RecurringAvailability,
  ScheduleOverride,
  BlockedTime,
  AvailableSlot,
  DayOfWeek,
} from '@/types';

export type CreateRecurringPayload = {
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
};

export const availabilityApi = {
  /** GET /availability/:scheduleId/recurring */
  getRecurring: (scheduleId: string) =>
    apiClient.get<RecurringAvailability[]>(
      `/availability/${scheduleId}/recurring`,
    ),

  /** POST /availability/:scheduleId/recurring */
  createRecurring: (scheduleId: string, data: CreateRecurringPayload) =>
    apiClient.post<RecurringAvailability>(
      `/availability/${scheduleId}/recurring`,
      data,
    ),

  /** POST /availability/:scheduleId/recurring/batch */
  createRecurringBatch: (scheduleId: string, slots: CreateRecurringPayload[]) =>
    apiClient.post<RecurringAvailability[]>(
      `/availability/${scheduleId}/recurring/batch`,
      { slots },
    ),

  /** PUT /availability/:scheduleId/recurring/:id */
  updateRecurring: (
    scheduleId: string,
    id: string,
    data: Partial<CreateRecurringPayload>,
  ) =>
    apiClient.put<RecurringAvailability>(
      `/availability/${scheduleId}/recurring/${id}`,
      data,
    ),

  /** DELETE /availability/:scheduleId/recurring/:id */
  deleteRecurring: (scheduleId: string, id: string) =>
    apiClient.delete<void>(`/availability/${scheduleId}/recurring/${id}`),

  /** GET /availability/:scheduleId/overrides */
  getOverrides: (
    scheduleId: string,
    startDate?: string,
    endDate?: string,
  ) =>
    apiClient.get<ScheduleOverride[]>(
      `/availability/${scheduleId}/overrides`,
      {
        params: startDate && endDate ? { startDate, endDate } : undefined,
      },
    ),

  /** POST /availability/:scheduleId/overrides */
  createOverride: (
    scheduleId: string,
    data: { date: string; startTime: string; endTime: string; notes?: string },
  ) =>
    apiClient.post<ScheduleOverride>(
      `/availability/${scheduleId}/overrides`,
      data,
    ),

  /** DELETE /availability/:scheduleId/overrides/:id */
  deleteOverride: (scheduleId: string, id: string) =>
    apiClient.delete<void>(`/availability/${scheduleId}/overrides/${id}`),

  /** GET /availability/:scheduleId/blocked */
  getBlockedTimes: (
    scheduleId: string,
    startDate?: string,
    endDate?: string,
  ) =>
    apiClient.get<BlockedTime[]>(`/availability/${scheduleId}/blocked`, {
      params: startDate && endDate ? { startDate, endDate } : undefined,
    }),

  /** POST /availability/:scheduleId/blocked */
  createBlockedTime: (
    scheduleId: string,
    data: {
      startTime: string;
      endTime: string;
      reason?: string;
      recurrenceRule?: string;
      recurrenceEnd?: string;
    },
  ) =>
    apiClient.post<BlockedTime>(`/availability/${scheduleId}/blocked`, data),

  /** DELETE /availability/:scheduleId/blocked/:id */
  deleteBlockedTime: (scheduleId: string, id: string) =>
    apiClient.delete<void>(`/availability/${scheduleId}/blocked/${id}`),

  /** GET /availability/:scheduleId/slots */
  getAvailableSlots: (
    scheduleId: string,
    startDate: string,
    endDate: string,
    slotDuration?: number,
    eventTypeId?: string,
  ) =>
    apiClient.get<AvailableSlot[]>(`/availability/${scheduleId}/slots`, {
      params: {
        startDate,
        endDate,
        ...(slotDuration ? { slotDuration: String(slotDuration) } : {}),
        ...(eventTypeId ? { eventTypeId } : {}),
      },
    }),
};
