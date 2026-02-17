import { apiClient } from '@/lib/apiClient';
import type {
  Card,
  CardTemplate,
  CardAnalytics,
  ContactsResponse,
  CardContact,
  CreateCardPayload,
  UpdateCardPayload,
  PreviewCardPayload,
  PreviewCardResponse,
} from '@/types';

export const cardsApi = {
  /** GET /cards/templates — available card templates */
  getTemplates: () => apiClient.get<CardTemplate[]>('/cards/templates'),

  /** POST /cards/preview — generate preview HTML without saving */
  preview: (data: PreviewCardPayload) =>
    apiClient.post<PreviewCardResponse>('/cards/preview', data),

  /** GET /cards — list all user's cards */
  list: () => apiClient.get<Card[]>('/cards'),

  /** GET /cards/:id — get card detail */
  getById: (id: string) => apiClient.get<Card>(`/cards/${id}`),

  /** POST /cards — create a card */
  create: (data: CreateCardPayload) => apiClient.post<Card>('/cards', data),

  /** PATCH /cards/:id — update a card */
  update: (id: string, data: UpdateCardPayload) =>
    apiClient.patch<Card>(`/cards/${id}`, data),

  /** DELETE /cards/:id — delete a card */
  delete: (id: string) => apiClient.delete(`/cards/${id}`),

  /** POST /cards/:id/duplicate — duplicate a card */
  duplicate: (id: string, slug: string) =>
    apiClient.post<Card>(`/cards/${id}/duplicate`, { slug }),

  /** GET /cards/:id/analytics — card analytics */
  analytics: (id: string, days?: number) =>
    apiClient.get<CardAnalytics>(`/cards/${id}/analytics`, {
      params: days ? { days } : undefined,
    }),

  /** GET /cards/contacts/all — paginated contacts */
  contacts: (params?: {
    cardId?: string;
    search?: string;
    tags?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get<ContactsResponse>('/cards/contacts/all', {
      params: params as Record<string, string>,
    }),

  /** PATCH /cards/contacts/:id/tags — update contact tags */
  updateContactTags: (id: string, tags: string[]) =>
    apiClient.patch<CardContact>(`/cards/contacts/${id}/tags`, { tags }),

  /** DELETE /cards/contacts/:id — delete a contact */
  deleteContact: (id: string) => apiClient.delete(`/cards/contacts/${id}`),

  /** GET /cards/contacts/export — export CSV */
  exportContacts: (cardId?: string) => {
    const params = cardId ? `?cardId=${cardId}` : '';
    return apiClient.get<string>(`/cards/contacts/export${params}`);
  },
};
