import { apiClient } from '@/lib/apiClient';
import type {
  UserSettings,
  PatchUserSettingsPayload,
  EventType,
  CreateEventTypePayload,
  UpdateEventTypePayload,
  AvailabilitySchedule,
  ScheduleAvailabilityDay,
  AvailabilityOverride,
  HostBooking,
  BookingsResponse,
} from '@/types/settings';

export const settingsApi = {
  /** GET /settings/user — get or create user settings */
  getUserSettings: () =>
    apiClient
      .get<{ settings: UserSettings }>('/settings/user')
      .then((r) => r.settings),

  /** PATCH /settings/user — update user settings */
  updateUserSettings: (data: PatchUserSettingsPayload) =>
    apiClient
      .patch<{ settings: UserSettings }>('/settings/user', data)
      .then((r) => r.settings),

  /**
   * POST /auth/google/calendar/connect
   * Returns the Google OAuth URL to navigate to for calendar scope grant.
   */
  getCalendarConnectUrl: (redirectUrl: string) =>
    apiClient.post<{ url: string }>('/auth/google/calendar/connect', {
      redirectUrl,
    }),

  /**
   * PUT /settings/recall-api-key
   * Saves the Recall.ai API key (encrypted at rest).
   */
  saveRecallApiKey: (apiKey: string) =>
    apiClient.put<{ recallEnabled: boolean }>('/settings/recall-api-key', {
      apiKey,
    }),
};

export const eventTypesApi = {
  /** GET /scheduling/event-types */
  list: () =>
    apiClient
      .get<{ eventTypes: EventType[] }>('/scheduling/event-types')
      .then((r) => r.eventTypes),

  /** POST /scheduling/event-types */
  create: (data: CreateEventTypePayload) =>
    apiClient
      .post<{ eventType: EventType }>('/scheduling/event-types', data)
      .then((r) => r.eventType),

  /** PATCH /scheduling/event-types/:id */
  update: (id: string, data: UpdateEventTypePayload) =>
    apiClient
      .patch<{ eventType: EventType }>(`/scheduling/event-types/${id}`, data)
      .then((r) => r.eventType),

  /** DELETE /scheduling/event-types/:id */
  delete: (id: string) =>
    apiClient.delete<void>(`/scheduling/event-types/${id}`),
};

export const schedulesApi = {
  /** GET /scheduling/schedules */
  list: () =>
    apiClient
      .get<{ schedules: AvailabilitySchedule[] }>('/scheduling/schedules')
      .then((r) => r.schedules),

  /** POST /scheduling/schedules */
  create: (data: { name: string; timezone: string }) =>
    apiClient
      .post<{ schedule: AvailabilitySchedule }>('/scheduling/schedules', data)
      .then((r) => r.schedule),

  /** PATCH /scheduling/schedules/:id */
  update: (id: string, data: { name?: string; timezone?: string }) =>
    apiClient
      .patch<{
        schedule: AvailabilitySchedule;
      }>(`/scheduling/schedules/${id}`, data)
      .then((r) => r.schedule),

  /** DELETE /scheduling/schedules/:id */
  delete: (id: string) => apiClient.delete<void>(`/scheduling/schedules/${id}`),

  /** POST /scheduling/schedules/:id/copy */
  copy: (id: string, name: string) =>
    apiClient
      .post<{
        schedule: AvailabilitySchedule;
      }>(`/scheduling/schedules/${id}/copy`, { name })
      .then((r) => r.schedule),

  /** POST /scheduling/schedules/:id/set-default */
  setDefault: (id: string) =>
    apiClient
      .post<{
        schedule: AvailabilitySchedule;
      }>(`/scheduling/schedules/${id}/set-default`, {})
      .then((r) => r.schedule),

  /** GET /scheduling/schedules/:id/availability */
  getSlots: (scheduleId: string) =>
    apiClient
      .get<{
        availability: ScheduleAvailabilityDay[];
      }>(`/scheduling/schedules/${scheduleId}/availability`)
      .then((r) => r.availability),

  /** PATCH /scheduling/schedules/:id/availability */
  patchSlots: (
    scheduleId: string,
    slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
  ) =>
    apiClient
      .patch<{
        availability: ScheduleAvailabilityDay[];
      }>(`/scheduling/schedules/${scheduleId}/availability`, { slots })
      .then((r) => r.availability),

  /** GET /scheduling/schedules/:id/overrides */
  getOverrides: (scheduleId: string) =>
    apiClient
      .get<{
        overrides: AvailabilityOverride[];
      }>(`/scheduling/schedules/${scheduleId}/overrides`)
      .then((r) => r.overrides),

  /** POST /scheduling/schedules/:id/overrides */
  createOverride: (scheduleId: string, date: string) =>
    apiClient
      .post<{
        override: AvailabilityOverride;
      }>(`/scheduling/schedules/${scheduleId}/overrides`, {
        date,
        isBlocked: true,
      })
      .then((r) => r.override),

  /** DELETE /scheduling/schedules/:id/overrides/:overrideId */
  deleteOverride: (scheduleId: string, overrideId: string) =>
    apiClient.delete<void>(
      `/scheduling/schedules/${scheduleId}/overrides/${overrideId}`
    ),
};

export interface ListBookingsParams {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const bookingsApi = {
  /** GET /scheduling/bookings — paginated list of host's bookings */
  list: (params: ListBookingsParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return apiClient
      .get<BookingsResponse>(`/scheduling/bookings${qs ? `?${qs}` : ''}`)
      .then((r) => r);
  },

  /** POST /scheduling/bookings/:id/confirm — host approves a PENDING booking */
  confirm: (id: string) =>
    apiClient.post<{
      booking: Pick<HostBooking, 'id' | 'status'>;
    }>(`/scheduling/bookings/${id}/confirm`, {}),

  /** POST /scheduling/bookings/:id/decline — host declines a PENDING booking */
  decline: (id: string, reason?: string) =>
    apiClient.post<{
      booking: Pick<
        HostBooking,
        'id' | 'status' | 'cancelReason' | 'canceledAt'
      >;
    }>(`/scheduling/bookings/${id}/decline`, { reason }),

  /** PATCH /scheduling/bookings/:id/cancel — host cancels a booking */
  cancel: (id: string, reason?: string) =>
    apiClient.patch<{
      booking: Pick<
        HostBooking,
        'id' | 'status' | 'cancelReason' | 'canceledAt'
      >;
    }>(`/scheduling/bookings/${id}/cancel`, { reason }),
};

// Legacy — kept for type compatibility only. No longer has backend routes.
// Use schedulesApi instead.
export const availabilityApi = {
  get: (): Promise<never[]> => Promise.resolve([]),
  patch: (): Promise<never[]> => Promise.resolve([]),
  getOverrides: (): Promise<never[]> => Promise.resolve([]),
  createOverride: (): Promise<AvailabilityOverride> =>
    Promise.reject(new Error('Use schedulesApi.createOverride')),
  deleteOverride: (): Promise<void> => Promise.resolve(),
};
