import { apiClient } from '@/lib/apiClient';

export type NotificationType =
  | 'BOOKING_RECEIVED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REMINDER'
  | 'MEETING_AI_COMPLETE'
  | 'TASK_DUE_SOON';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsPage {
  notifications: Notification[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const notificationsApi = {
  list: (cursor?: string, limit = 20) =>
    apiClient.get<NotificationsPage>('/notifications', {
      params: { ...(cursor ? { cursor } : {}), limit },
    }),

  unreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    apiClient.patch<{ notification: Notification }>(
      `/notifications/${id}/read`
    ),

  markAllRead: () =>
    apiClient.patch<{ count: number }>('/notifications/read-all'),

  delete: (id: string) => apiClient.delete<void>(`/notifications/${id}`),
};
