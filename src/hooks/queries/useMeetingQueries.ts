import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { meetingsApi } from '@/services/meetingsService';
import type {
  MeetingsListParams,
  CreateMeetingPayload,
  UpdateMeetingPayload,
} from '@/services/meetingsService';

export function useMeetings(params?: MeetingsListParams) {
  return useQuery({
    queryKey: queryKeys.meetings.list(params),
    queryFn: () => meetingsApi.list(params),
    staleTime: 60 * 1000,
  });
}

export function useMeetingsAll(params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: queryKeys.meetings.list({ ...params, noPagination: true }),
    queryFn: async () => {
      const result = await meetingsApi.listAll(params as MeetingsListParams);
      return result.meetings;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: queryKeys.meetings.detail(id),
    queryFn: () => meetingsApi.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeetingPayload) => meetingsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
      toast.success('Meeting created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create meeting');
    },
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMeetingPayload }) =>
      meetingsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update meeting');
    },
  });
}

export function useAcceptMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingsApi.accept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept meeting');
    },
  });
}

export function useDeclineMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      meetingsApi.decline(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to decline meeting');
    },
  });
}

export function useCancelMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      meetingsApi.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel meeting');
    },
  });
}

export function useCompleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingsApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete meeting');
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingsApi.deleteMeeting(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete meeting');
    },
  });
}

export function useVoiceNotes() {
  return useQuery({
    queryKey: queryKeys.meetings.list({
      type: 'VOICE_NOTE',
      noPagination: true,
    }),
    queryFn: async () => {
      const result = await meetingsApi.listAll({ type: 'VOICE_NOTE' });
      return result.meetings;
    },
    staleTime: 60 * 1000,
  });
}
