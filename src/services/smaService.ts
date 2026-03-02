import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores';
import type { ActionItem } from '@/types';

export type SMATranscriptSegment = {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker: string;
};

export type SMATranscript = {
  id: string;
  fullText: string;
  segments: SMATranscriptSegment[];
};

export type SMAAISummary = {
  id: string;
  summary: string;
  keyPoints: string[];
};

export type SMARecording = {
  id: string;
  meetingId: string;
  fileName: string;
  fileSize: number;
  duration: number;
  uploadedAt: string;
  uploadedBy: string;
  signedUrl?: string;
};

// SMA controllers return { success, data } without statusCode,
// so apiClient won't auto-unwrap. Unwrap manually.
function unwrap<T>(result: unknown): T {
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T }).data;
  }
  return result as T;
}

export const smaApi = {
  getTranscript: async (meetingId: string): Promise<SMATranscript> => {
    const result = await apiClient.get(`/sma/meetings/${meetingId}/transcript`);
    return unwrap<SMATranscript>(result);
  },

  getSummary: async (meetingId: string): Promise<SMAAISummary> => {
    const result = await apiClient.get(`/sma/meetings/${meetingId}/summary`);
    return unwrap<SMAAISummary>(result);
  },

  getActionItems: async (meetingId: string): Promise<ActionItem[]> => {
    const result = await apiClient.get(`/sma/meetings/${meetingId}/action-items`);
    return unwrap<ActionItem[]>(result);
  },

  getRecordings: async (meetingId: string): Promise<SMARecording[]> => {
    const result = await apiClient.get(`/sma/meetings/${meetingId}/recordings`);
    return unwrap<SMARecording[]>(result);
  },

  // Multipart upload — cannot go through apiClient (it JSON.stringifies the body)
  uploadRecording: async (meetingId: string, file: File): Promise<{ id: string }> => {
    const token = useAuthStore.getState().accessToken;
    const form = new FormData();
    // Backend multer expects field name "file"
    form.append('file', file, file.name);

    const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    const base = API_BASE.startsWith('http')
      ? API_BASE
      : `${window.location.origin}${API_BASE}`;

    const res = await fetch(`${base}/sma/meetings/${meetingId}/recordings`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? `Upload failed: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data ?? json;
  },
};
