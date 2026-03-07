import { apiClient } from '@/lib/apiClient';
import type { Attachment } from '@/types/meeting';

export const attachmentsApi = {
  getAttachments: async (meetingId: string): Promise<Attachment[]> => {
    const result = await apiClient.get<{ attachments: Attachment[] }>(
      `/meetings/${meetingId}/attachments`
    );
    return result.attachments;
  },

  addLink: async (
    meetingId: string,
    data: { url: string; name?: string }
  ): Promise<Attachment> => {
    const result = await apiClient.post<{ attachment: Attachment }>(
      `/meetings/${meetingId}/attachments/link`,
      data
    );
    return result.attachment;
  },

  uploadFile: async (
    meetingId: string,
    file: File,
    name?: string
  ): Promise<Attachment> => {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);

    const result = await apiClient.postForm<{ attachment: Attachment }>(
      `/meetings/${meetingId}/attachments/file`,
      form
    );
    return result.attachment;
  },

  deleteAttachment: async (
    meetingId: string,
    attachmentId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/meetings/${meetingId}/attachments/${attachmentId}`
    );
  },
};
