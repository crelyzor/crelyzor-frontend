import { apiClient } from '@/lib/apiClient';
import type { Tag, TagWithCounts, TagItemsRecord } from '@/types/meeting';

export const tagsApi = {
  // ── Tag CRUD ──────────────────────────────────────────────

  getTags: async (): Promise<Tag[]> => {
    const result = await apiClient.get<{ tags: Tag[] }>('/tags');
    return result.tags;
  },

  getTagsWithCounts: async (): Promise<TagWithCounts[]> => {
    const result = await apiClient.get<{ tags: TagWithCounts[] }>('/tags');
    return result.tags;
  },

  getTagItems: async (tagId: string): Promise<TagItemsRecord> => {
    return apiClient.get<TagItemsRecord>(`/tags/${tagId}/items`);
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

  attachTagToMeeting: async (
    meetingId: string,
    tagId: string
  ): Promise<void> => {
    await apiClient.post(`/meetings/${meetingId}/tags/${tagId}`);
  },

  detachTagFromMeeting: async (
    meetingId: string,
    tagId: string
  ): Promise<void> => {
    await apiClient.delete(`/meetings/${meetingId}/tags/${tagId}`);
  },

  // ── Card tags ─────────────────────────────────────────────

  getCardTags: async (cardId: string): Promise<Tag[]> => {
    const result = await apiClient.get<{ tags: Tag[] }>(
      `/cards/${cardId}/tags`
    );
    return result.tags;
  },

  attachTagToCard: async (cardId: string, tagId: string): Promise<void> => {
    await apiClient.post(`/cards/${cardId}/tags/${tagId}`);
  },

  detachTagFromCard: async (cardId: string, tagId: string): Promise<void> => {
    await apiClient.delete(`/cards/${cardId}/tags/${tagId}`);
  },

  // ── Task tags ───────────────────────────────────────────────

  getTaskTags: async (taskId: string): Promise<Tag[]> => {
    const result = await apiClient.get<{ tags: Tag[] }>(
      `/sma/tasks/${taskId}/tags`
    );
    return result.tags;
  },

  attachTagToTask: async (taskId: string, tagId: string): Promise<void> => {
    await apiClient.post(`/sma/tasks/${taskId}/tags/${tagId}`);
  },

  detachTagFromTask: async (taskId: string, tagId: string): Promise<void> => {
    await apiClient.delete(`/sma/tasks/${taskId}/tags/${tagId}`);
  },

  // ── Contact tags ──────────────────────────────────────────────

  getContactTags: async (cardId: string, contactId: string): Promise<Tag[]> => {
    const result = await apiClient.get<{ tags: Tag[] }>(
      `/cards/${cardId}/contacts/${contactId}/tags`
    );
    return result.tags;
  },

  attachTagToContact: async (
    cardId: string,
    contactId: string,
    tagId: string
  ): Promise<void> => {
    await apiClient.post(
      `/cards/${cardId}/contacts/${contactId}/tags/${tagId}`
    );
  },

  detachTagFromContact: async (
    cardId: string,
    contactId: string,
    tagId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/cards/${cardId}/contacts/${contactId}/tags/${tagId}`
    );
  },
};
