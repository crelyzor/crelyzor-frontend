import { apiClient } from '@/lib/apiClient';
import type { EventType } from '@/types';

export type CreateEventTypePayload = {
  title: string;
  slug?: string;
  description?: string;
  duration: number;
  scheduleId: string;
  bufferBefore?: number;
  bufferAfter?: number;
  minNotice?: number;
  maxAdvance?: number;
};

export type UpdateEventTypePayload = Partial<CreateEventTypePayload> & {
  isActive?: boolean;
};

export const eventTypeApi = {
  /** GET /event-types — list all event types */
  getEventTypes: () => apiClient.get<EventType[]>('/event-types'),

  /** GET /event-types/:id — get event type */
  getEventTypeById: (id: string) =>
    apiClient.get<EventType>(`/event-types/${id}`),

  /** POST /event-types — create event type */
  createEventType: (data: CreateEventTypePayload) =>
    apiClient.post<EventType>('/event-types', data),

  /** PUT /event-types/:id — update event type */
  updateEventType: (id: string, data: UpdateEventTypePayload) =>
    apiClient.put<EventType>(`/event-types/${id}`, data),

  /** DELETE /event-types/:id — delete event type */
  deleteEventType: (id: string) =>
    apiClient.delete<EventType>(`/event-types/${id}`),

  /** PATCH /event-types/:id/toggle — toggle active */
  toggleEventType: (id: string) =>
    apiClient.patch<EventType>(`/event-types/${id}/toggle`),
};
