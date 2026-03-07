import { apiClient } from '@/lib/apiClient';
import type { Tag } from '@/types/meeting';

export const tagsApi = {
  // ── Tag CRUD ──────────────────────────────────────────────

  getTags: async (): Promise<Tag[]> => {
    const result = await apiClient.get<{ tags: Tag[] }>('/tags');
    return result.tags;
  },

  createTag: async (data: { name: string; color?: string }): Promise<Tag> => {
    const result = await apiClient.post<{ tag: Tag }>('/tags', data);
    return result.tag;
  },

  updateTag: async (
    tagId: string,
    data: { name?: string; color?: string }
  ): Promise<Tag> => {
    const result = await apiClient.patch<{ tag: Tag }>(`/tags/${tagId}`, data);
    return result.tag;
  },

  deleteTag: async (tagId: string): Promise<void> => {
    await apiClient.delete(`/tags/${tagId}`);
  },

  // ── Meeting tags ──────────────────────────────────────────

  getMeetingTags: async (meetingId: string): Promise<Tag[]> => {
    const result = await apiClient.get<{ tags: Tag[] }>(
      `/meetings/${meetingId}/tags`
    );
    return result.tags;
  },

  attachTagToMeeting: async (meetingId: string, tagId: string): Promise<void> => {
    await apiClient.post(`/meetings/${meetingId}/tags/${tagId}`);
  },

  detachTagFromMeeting: async (meetingId: string, tagId: string): Promise<void> => {
    await apiClient.delete(`/meetings/${meetingId}/tags/${tagId}`);
  },

  // ── Card tags ─────────────────────────────────────────────

  getCardTags: async (cardId: string): Promise<Tag[]> => {
    const result = await apiClient.get<{ tags: Tag[] }>(`/cards/${cardId}/tags`);
    return result.tags;
  },

  attachTagToCard: async (cardId: string, tagId: string): Promise<void> => {
    await apiClient.post(`/cards/${cardId}/tags/${tagId}`);
  },

  detachTagFromCard: async (cardId: string, tagId: string): Promise<void> => {
    await apiClient.delete(`/cards/${cardId}/tags/${tagId}`);
  },
};
