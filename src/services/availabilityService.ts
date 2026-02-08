import { apiClient } from '@/lib/apiClient';
import type { WeeklySchedule } from '@/types';

export type BookingSlot = {
  time: string;
  available: boolean;
};

export type CreateBookingPayload = {
  name: string;
  email: string;
  date: string;
  time: string;
  notes?: string;
};

export const availabilityApi = {
  getSchedule: () =>
    apiClient.get<{ schedule: WeeklySchedule }>('/availability'),

  updateSchedule: (schedule: WeeklySchedule) =>
    apiClient.put<{ schedule: WeeklySchedule }>('/availability', { schedule }),

  getBookingSlots: (token: string, date: string) =>
    apiClient.get<{ slots: BookingSlot[] }>(`/availability/book/${token}`, {
      params: { date },
    }),

  createBooking: (token: string, data: CreateBookingPayload) =>
    apiClient.post<{ success: boolean }>(`/availability/book/${token}`, data),
};
