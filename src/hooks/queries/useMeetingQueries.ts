import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  });
}

export function useMeetingsAll(params?: { status?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.meetings.list({ ...params, noPagination: true }),
    queryFn: () => meetingsApi.listAll(params as any),
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: queryKeys.meetings.detail(id),
    queryFn: () => meetingsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeetingPayload) => meetingsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
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
  });
}

export function useAcceptMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingsApi.accept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
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
  });
}

export function useCompleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingsApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
}
