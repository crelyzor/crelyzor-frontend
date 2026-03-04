import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { smaApi } from '@/services/smaService';
import type { AIContentType, GeneratedContent } from '@/services/smaService';

export function useTranscript(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.transcript(meetingId),
    queryFn: () => smaApi.getTranscript(meetingId),
    enabled: !!meetingId && enabled,
    retry: false,
  });
}

export function useSummary(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.summary(meetingId),
    queryFn: () => smaApi.getSummary(meetingId),
    enabled: !!meetingId && enabled,
    retry: false,
  });
}

export function useTasks(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.tasks(meetingId),
    queryFn: () => smaApi.getTasks(meetingId),
    enabled: !!meetingId && enabled,
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
    mutationFn: (type: AIContentType) => smaApi.generateContent(meetingId, type),
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
