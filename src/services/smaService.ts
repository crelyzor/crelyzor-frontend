import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores';
import type { Task } from '@/types';

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

export type SMASpeaker = {
  id: string;
  meetingId: string;
  speakerLabel: string;
  displayName: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MeetingNote = {
  id: string;
  meetingId: string;
  content: string;
  author: string; // userId
  timestamp: number | null;
  createdAt: string;
  updatedAt: string;
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

  getTasks: async (meetingId: string): Promise<Task[]> => {
    const result = await apiClient.get<{ tasks: Task[] }>(
      `/sma/meetings/${meetingId}/tasks`
    );
    return result.tasks;
  },

  createTask: async (
    meetingId: string,
    data: {
      title: string;
      description?: string;
      dueDate?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    }
  ): Promise<Task> => {
    const result = await apiClient.post<{ task: Task }>(
      `/sma/meetings/${meetingId}/tasks`,
      data
    );
    return result.task;
  },

  updateTask: async (
    taskId: string,
    data: {
      title?: string;
      description?: string | null;
      isCompleted?: boolean;
      dueDate?: string | null;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
    }
  ): Promise<Task> => {
    const result = await apiClient.patch<{ task: Task }>(
      `/sma/tasks/${taskId}`,
      data
    );
    return result.task;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/sma/tasks/${taskId}`);
  },

  getNotes: async (meetingId: string): Promise<MeetingNote[]> => {
    const result = await apiClient.get(`/sma/meetings/${meetingId}/notes`);
    return unwrap<MeetingNote[]>(result);
  },

  createNote: async (
    meetingId: string,
    data: { content: string; timestamp?: number }
  ): Promise<MeetingNote> => {
    const result = await apiClient.post(
      `/sma/meetings/${meetingId}/notes`,
      data
    );
    return unwrap<MeetingNote>(result);
  },

  deleteNote: async (noteId: string): Promise<void> => {
    await apiClient.delete(`/sma/notes/${noteId}`);
  },

  getRecordings: async (meetingId: string): Promise<SMARecording[]> => {
    const result = await apiClient.get(`/sma/meetings/${meetingId}/recordings`);
    return unwrap<SMARecording[]>(result);
  },

  getSpeakers: async (meetingId: string): Promise<SMASpeaker[]> => {
    const result = await apiClient.get(`/sma/meetings/${meetingId}/speakers`);
    return unwrap<SMASpeaker[]>(result);
  },

  renameSpeaker: async (
    meetingId: string,
    speakerId: string,
    data: { displayName?: string; role?: string }
  ): Promise<SMASpeaker> => {
    const result = await apiClient.patch(
      `/sma/meetings/${meetingId}/speakers/${speakerId}`,
      data
    );
    return unwrap<SMASpeaker>(result);
  },

  regenerateSummary: async (meetingId: string): Promise<SMAAISummary> => {
    const result = await apiClient.post(
      `/sma/meetings/${meetingId}/summary/regenerate`
    );
    return unwrap<SMAAISummary>(result);
  },

  regenerateTitle: async (meetingId: string): Promise<{ title: string }> => {
    const result = await apiClient.post(
      `/sma/meetings/${meetingId}/title/regenerate`
    );
    return unwrap<{ title: string }>(result);
  },

  triggerAI: async (meetingId: string): Promise<void> => {
    await apiClient.post(`/sma/meetings/${meetingId}/process-ai`);
  },

  // Ask AI — streaming SSE (cannot use apiClient; need raw Response stream)
  askAI: async (
    meetingId: string,
    question: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    const token = useAuthStore.getState().accessToken;
    const API_BASE =
      (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    const base = API_BASE.startsWith('http')
      ? API_BASE
      : `${window.location.origin}${API_BASE}`;

    let res: Response;
    try {
      res = await fetch(`${base}/sma/meetings/${meetingId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
        signal,
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      onError('Network error — could not reach AI');
      return;
    }

    if (!res.ok) {
      onError('Failed to get AI response');
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('Streaming not supported');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw) as {
              token?: string;
              done?: boolean;
              error?: string;
            };
            if (parsed.done) {
              onDone();
            } else if (parsed.token) {
              onToken(parsed.token);
            } else if (parsed.error) {
              onError(parsed.error);
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        onError('Stream interrupted');
      }
    }
  },

  // Multipart upload — cannot go through apiClient (it JSON.stringifies the body)
  uploadRecording: async (
    meetingId: string,
    file: File
  ): Promise<{ id: string }> => {
    const token = useAuthStore.getState().accessToken;
    const form = new FormData();
    // Backend multer expects field name "file"
    form.append('file', file, file.name);

    const API_BASE =
      (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
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
