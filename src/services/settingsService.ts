import { apiClient } from '@/lib/apiClient';
import type {
  UserSettings,
  PatchUserSettingsPayload,
  EventType,
  CreateEventTypePayload,
  UpdateEventTypePayload,
} from '@/types/settings';

export const settingsApi = {
  /** GET /settings/user — get or create user settings */
  getUserSettings: () => apiClient.get<UserSettings>('/settings/user'),

  /** PATCH /settings/user — update user settings */
  updateUserSettings: (data: PatchUserSettingsPayload) =>
    apiClient.patch<UserSettings>('/settings/user', data),
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
