import { apiClient } from '@/lib/apiClient';
import type {
  RecurringAvailability,
  CustomSlot,
  BlockedTime,
  AvailableSlot,
  DayOfWeek,
} from '@/types';

export type CreateRecurringPayload = {
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
};

export type CreateBookingPayload = {
  title: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  guestMessage?: string;
};

export const availabilityApi = {
  /** GET /availability/recurring — get recurring patterns */
  getRecurring: (orgMemberId?: string) =>
    apiClient.get<RecurringAvailability[]>('/availability/recurring', {
      params: orgMemberId ? { orgMemberId } : undefined,
    }),

  /** POST /availability/recurring — create single recurring pattern */
  createRecurring: (data: CreateRecurringPayload) =>
    apiClient.post<RecurringAvailability>('/availability/recurring', data),

  /** POST /availability/recurring/batch — create multiple patterns */
  createRecurringBatch: (slots: CreateRecurringPayload[]) =>
    apiClient.post<RecurringAvailability[]>('/availability/recurring/batch', {
      slots,
    }),

  /** PUT /availability/recurring/:id — update pattern */
  updateRecurring: (id: string, data: Partial<CreateRecurringPayload>) =>
    apiClient.put<RecurringAvailability>(`/availability/recurring/${id}`, data),

  /** DELETE /availability/recurring/:id */
  deleteRecurring: (id: string) =>
    apiClient.delete<void>(`/availability/recurring/${id}`),

  /** GET /availability/custom — get custom slots for date range */
  getCustomSlots: (startDate: string, endDate: string, orgMemberId?: string) =>
    apiClient.get<CustomSlot[]>('/availability/custom', {
      params: { startDate, endDate, ...(orgMemberId ? { orgMemberId } : {}) },
    }),

  /** POST /availability/custom — create custom slot */
  createCustomSlot: (data: {
    date: string;
    startTime: string;
    endTime: string;
  }) => apiClient.post<CustomSlot>('/availability/custom', data),

  /** DELETE /availability/custom/:id */
  deleteCustomSlot: (id: string) =>
    apiClient.delete<void>(`/availability/custom/${id}`),

  /** GET /availability/blocked — get blocked times */
  getBlockedTimes: (startDate: string, endDate: string, orgMemberId?: string) =>
    apiClient.get<BlockedTime[]>('/availability/blocked', {
      params: { startDate, endDate, ...(orgMemberId ? { orgMemberId } : {}) },
    }),

  /** POST /availability/blocked — create blocked time */
  createBlockedTime: (data: {
    startTime: string;
    endTime: string;
    reason?: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
  }) => apiClient.post<BlockedTime>('/availability/blocked', data),

  /** DELETE /availability/blocked/:id */
  deleteBlockedTime: (id: string) =>
    apiClient.delete<void>(`/availability/blocked/${id}`),

  /** GET /availability/slots/:orgMemberId — computed available slots */
  getAvailableSlots: (
    orgMemberId: string,
    startDate: string,
    endDate: string,
    slotDuration?: number
  ) =>
    apiClient.get<AvailableSlot[]>(`/availability/slots/${orgMemberId}`, {
      params: {
        startDate,
        endDate,
        ...(slotDuration ? { slotDuration: String(slotDuration) } : {}),
      },
    }),

  /** GET /public/booking/:shareToken — public booking profile (no auth) */
  getPublicBookingProfile: (shareToken: string) =>
    apiClient.get<{ consultant: unknown; slots: AvailableSlot[] }>(
      `/public/booking/${shareToken}`
    ),

  /** POST /public/booking/:shareToken/request — guest requests meeting (no auth) */
  createPublicBooking: (shareToken: string, data: CreateBookingPayload) =>
    apiClient.post<{ meetingId: string }>(
      `/public/booking/${shareToken}/request`,
      data
    ),
};
