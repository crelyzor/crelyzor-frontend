import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { meetingsApi } from '@/services/meetingsService';
import type { MeetingsListParams, CreateMeetingPayload } from '@/services/meetingsService';

export function useMeetings(params?: MeetingsListParams) {
  return useQuery({
    queryKey: queryKeys.meetings.list(params),
    queryFn: () => meetingsApi.list(params),
  });
}

export function useMeeting(id: string | number) {
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
    mutationFn: ({ id, data }: { id: string | number; data: Partial<CreateMeetingPayload> }) =>
      meetingsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
}

export function useCancelMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => meetingsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => meetingsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
}
