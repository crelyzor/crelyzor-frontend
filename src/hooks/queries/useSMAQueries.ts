import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { smaApi } from '@/services/smaService';

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

export function useActionItems(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sma.actionItems(meetingId),
    queryFn: () => smaApi.getActionItems(meetingId),
    enabled: !!meetingId && enabled,
  });
}

export function useRecordings(meetingId: string) {
  return useQuery({
    queryKey: queryKeys.sma.recordings(meetingId),
    queryFn: () => smaApi.getRecordings(meetingId),
    enabled: !!meetingId,
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
      qc.invalidateQueries({ queryKey: queryKeys.sma.actionItems(meetingId) });
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
    }: { speakerId: string; displayName?: string; role?: string }) =>
      smaApi.renameSpeaker(meetingId, speakerId, { displayName, role }),
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
