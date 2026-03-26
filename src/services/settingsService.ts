import { apiClient } from '@/lib/apiClient';
import type {
  UserSettings,
  PatchUserSettingsPayload,
  EventType,
  CreateEventTypePayload,
  UpdateEventTypePayload,
  AvailabilityDay,
  PatchAvailabilityDayPayload,
  AvailabilityOverride,
  HostBooking,
  BookingsResponse,
} from '@/types/settings';

export const settingsApi = {
  /** GET /settings/user — get or create user settings */
  getUserSettings: () => apiClient.get<UserSettings>('/settings/user'),

  /** PATCH /settings/user — update user settings */
  updateUserSettings: (data: PatchUserSettingsPayload) =>
    apiClient.patch<UserSettings>('/settings/user', data),

  /**
   * POST /auth/google/calendar/connect
   * Returns the Google OAuth URL to navigate to for calendar scope grant.
   * After getting the URL, the frontend must navigate: window.location.href = url
   */
  getCalendarConnectUrl: (redirectUrl: string) =>
    apiClient.post<{ url: string }>('/auth/google/calendar/connect', {
      redirectUrl,
    }),

  /**
   * PUT /settings/recall-api-key
   * Saves the Recall.ai API key (encrypted at rest).
   * The key is never returned — only a success response.
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

export const availabilityApi = {
  /** GET /scheduling/availability — 7-row weekly schedule */
  get: () =>
    apiClient
      .get<{ schedule: AvailabilityDay[] }>('/scheduling/availability')
      .then((r) => r.schedule),

  /** PATCH /scheduling/availability — bulk upsert weekly schedule */
  patch: (days: PatchAvailabilityDayPayload[]) =>
    apiClient
      .patch<{ schedule: AvailabilityDay[] }>('/scheduling/availability', {
        days,
      })
      .then((r) => r.schedule),

  /** GET /scheduling/availability/overrides */
  getOverrides: () =>
    apiClient
      .get<{
        overrides: AvailabilityOverride[];
      }>('/scheduling/availability/overrides')
      .then((r) => r.overrides),

  /** POST /scheduling/availability/overrides */
  createOverride: (date: string) =>
    apiClient
      .post<{
        override: AvailabilityOverride;
      }>('/scheduling/availability/overrides', { date, isBlocked: true })
      .then((r) => r.override),

  /** DELETE /scheduling/availability/overrides/:id */
  deleteOverride: (id: string) =>
    apiClient.delete<void>(`/scheduling/availability/overrides/${id}`),
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

  /** PATCH /scheduling/bookings/:id/cancel — host cancels a booking */
  cancel: (id: string, reason?: string) =>
    apiClient.patch<{
      booking: Pick<
        HostBooking,
        'id' | 'status' | 'cancelReason' | 'canceledAt'
      >;
    }>(`/scheduling/bookings/${id}/cancel`, { reason }),
};
