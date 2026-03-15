import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { smaApi } from '@/services/smaService';
import type {
  AIContentType,
  GeneratedContent,
  MeetingShare,
} from '@/services/smaService';

export function useTranscript(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.transcript(meetingId),
    queryFn: () => smaApi.getTranscript(meetingId),
    enabled: !!meetingId && enabled,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSummary(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.summary(meetingId),
    queryFn: () => smaApi.getSummary(meetingId),
    enabled: !!meetingId && enabled,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTasks(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.tasks(meetingId),
    queryFn: () => smaApi.getTasks(meetingId),
    enabled: !!meetingId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes — tasks change more often than tags
  });
}

export function useCreateTask(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      dueDate?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    }) => smaApi.createTask(meetingId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sma.tasks(meetingId) });
    },
    onError: () => toast.error('Failed to create task'),
  });
}

export function useUpdateTask(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: {
        title?: string;
        description?: string | null;
        isCompleted?: boolean;
        dueDate?: string | null;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
      };
    }) => smaApi.updateTask(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sma.tasks(meetingId) });
    },
    onError: () => toast.error('Failed to update task'),
  });
}

export function useDeleteTask(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => smaApi.deleteTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sma.tasks(meetingId) });
    },
    onError: () => toast.error('Failed to delete task'),
  });
}

export function useNotes(meetingId: string) {
  return useQuery({
    queryKey: queryKeys.sma.notes(meetingId),
    queryFn: () => smaApi.getNotes(meetingId),
    enabled: !!meetingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateNote(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; timestamp?: number }) =>
      smaApi.createNote(meetingId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sma.notes(meetingId) });
    },
    onError: () => toast.error('Failed to add note'),
  });
}

export function useDeleteNote(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => smaApi.deleteNote(noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sma.notes(meetingId) });
    },
    onError: () => toast.error('Failed to delete note'),
  });
}

export function useRecordings(meetingId: string) {
  return useQuery({
    queryKey: queryKeys.sma.recordings(meetingId),
    queryFn: () => smaApi.getRecordings(meetingId),
    enabled: !!meetingId,
  });
}

export function useGeneratedContents(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.generatedContents(meetingId),
    queryFn: () => smaApi.getGeneratedContents(meetingId),
    enabled: !!meetingId && enabled,
    staleTime: Infinity, // session cache — never auto-refetch
  });
}

export function useGenerateContent(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: AIContentType) =>
      smaApi.generateContent(meetingId, type),
    onSuccess: (result) => {
      qc.setQueryData(
        queryKeys.sma.generatedContents(meetingId),
        (old: GeneratedContent[] | undefined) => {
          const filtered = (old ?? []).filter((c) => c.type !== result.type);
          return [...filtered, result];
        }
      );
    },
    onError: () => toast.error('Failed to generate content'),
  });
}

export function useShare(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.share(meetingId),
    queryFn: () => smaApi.getShare(meetingId),
    enabled: !!meetingId && enabled,
    staleTime: 30_000,
  });
}

export function useUpdateShare(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<MeetingShare, 'shortId'>>) =>
      smaApi.updateShare(meetingId, data),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.sma.share(meetingId), updated);
    },
    onError: () => toast.error('Failed to update share settings'),
  });
}

export function useRegenerateSummary(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => smaApi.regenerateSummary(meetingId),
    onSuccess: () => {
      toast.success('Summary regenerated');
      qc.invalidateQueries({ queryKey: queryKeys.sma.summary(meetingId) });
    },
    onError: () => toast.error('Failed to regenerate summary'),
  });
}

export function useRegenerateTitle(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => smaApi.regenerateTitle(meetingId),
    onSuccess: () => {
      toast.success('Title regenerated');
      qc.invalidateQueries({ queryKey: queryKeys.meetings.detail(meetingId) });
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
    onError: () => toast.error('Failed to regenerate title'),
  });
}

export function useTriggerAI(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => smaApi.triggerAI(meetingId),
    onSuccess: () => {
      toast.success('AI processing started…');
      qc.invalidateQueries({ queryKey: queryKeys.meetings.detail(meetingId) });
      qc.invalidateQueries({ queryKey: queryKeys.sma.summary(meetingId) });
      qc.invalidateQueries({ queryKey: queryKeys.sma.tasks(meetingId) });
    },
    onError: () => toast.error('Failed to start AI processing'),
  });
}

export function useSpeakers(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.speakers(meetingId),
    queryFn: () => smaApi.getSpeakers(meetingId),
    enabled: !!meetingId && enabled,
  });
}

export function useRenameSpeaker(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      speakerId,
      displayName,
      role,
    }: {
      speakerId: string;
      displayName?: string;
      role?: string;
    }) => smaApi.renameSpeaker(meetingId, speakerId, { displayName, role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sma.speakers(meetingId) });
    },
    onError: () => toast.error('Failed to rename speaker'),
  });
}

export function useUpdateSegment(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ segmentId, text }: { segmentId: string; text: string }) =>
      smaApi.patchSegment(meetingId, segmentId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sma.transcript(meetingId) });
    },
    onError: () => toast.error('Failed to save segment'),
  });
}

export function useUpdateSummary(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      summary?: string;
      keyPoints?: string[];
      title?: string;
    }) => smaApi.patchSummary(meetingId, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: queryKeys.sma.summary(meetingId) });
      if (result.title !== undefined) {
        qc.invalidateQueries({
          queryKey: queryKeys.meetings.detail(meetingId),
        });
        qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
      }
      toast.success('Saved');
    },
    onError: () => toast.error('Failed to save'),
  });
}

export function useRegenerateTranscript(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => smaApi.regenerateTranscript(meetingId),
    onSuccess: () => {
      toast.success('Transcription starting…');
      qc.invalidateQueries({ queryKey: queryKeys.meetings.detail(meetingId) });
      qc.invalidateQueries({ queryKey: queryKeys.sma.transcript(meetingId) });
      qc.invalidateQueries({ queryKey: queryKeys.sma.speakers(meetingId) });
    },
    onError: () => toast.error('Failed to start transcription'),
  });
}

export function useChangeLanguage(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (language: string) =>
      smaApi.changeLanguage(meetingId, language),
    onSuccess: () => {
      toast.success('Transcription starting…');
      qc.invalidateQueries({ queryKey: queryKeys.meetings.detail(meetingId) });
      qc.invalidateQueries({ queryKey: queryKeys.sma.transcript(meetingId) });
      qc.invalidateQueries({ queryKey: queryKeys.sma.speakers(meetingId) });
    },
    onError: () => toast.error('Failed to change language'),
  });
}

export function useUploadRecording(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => smaApi.uploadRecording(meetingId, file),
    onSuccess: () => {
      toast.success('Recording uploaded — transcription starting…');
      qc.invalidateQueries({ queryKey: queryKeys.meetings.detail(meetingId) });
      qc.invalidateQueries({ queryKey: queryKeys.sma.recordings(meetingId) });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Upload failed. Please try again.'
      );
    },
  });
}
