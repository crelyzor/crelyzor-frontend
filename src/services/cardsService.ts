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
  Meeting,
} from '@/types';

export type ContactImportResult = {
  created: number;
  skipped: number;
  errors: string[];
};

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

  /** GET /cards/contacts/export — export CSV with active filters */
  exportContacts: (filters?: {
    cardId?: string;
    search?: string;
    tags?: string;
  }) =>
    apiClient.getText('/cards/contacts/export', {
      params: {
        cardId: filters?.cardId,
        search: filters?.search,
        tags: filters?.tags,
      },
    }),

  /** GET /cards/:cardId/meetings — meetings linked to this card via participant email matching */
  getCardMeetings: (cardId: string) =>
    apiClient.get<Meeting[]>(`/cards/${cardId}/meetings`),

  /** POST /cards/:cardId/contacts/import — import CSV contacts into a card */
  importContactsCsv: (cardId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.postForm<ContactImportResult>(
      `/cards/${cardId}/contacts/import`,
      form
    );
  },
};
