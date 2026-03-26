import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { eventTypesApi } from '@/services/settingsService';
import type {
  EventType,
  CreateEventTypePayload,
  UpdateEventTypePayload,
} from '@/types/settings';

// ── Event Types ──

export function useEventTypes() {
  return useQuery({
    queryKey: queryKeys.scheduling.eventTypes(),
    queryFn: eventTypesApi.list,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventTypePayload) => eventTypesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.eventTypes() });
      toast.success('Event type created');
    },
    onError: (err: Error & { data?: { message?: string } }) => {
      const msg =
        (err as { data?: { message?: string } }).data?.message ||
        err.message ||
        'Failed to create event type';
      toast.error(msg);
    },
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventTypePayload }) =>
      eventTypesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: queryKeys.scheduling.eventTypes() });
      const previous = qc.getQueryData<EventType[]>(
        queryKeys.scheduling.eventTypes()
      );
      if (previous) {
        qc.setQueryData<EventType[]>(
          queryKeys.scheduling.eventTypes(),
          previous.map((et) => (et.id === id ? { ...et, ...data } : et))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.scheduling.eventTypes(), context.previous);
      }
      const err = _err as Error & { data?: { message?: string } };
      const msg =
        err.data?.message || err.message || 'Failed to update event type';
      toast.error(msg);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.eventTypes() });
    },
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventTypesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.eventTypes() });
      toast.success('Event type deleted');
    },
    onError: (err: Error & { data?: { message?: string } }) => {
      const msg =
        (err as { data?: { message?: string } }).data?.message ||
        err.message ||
        'Failed to delete event type';
      toast.error(msg);
    },
  });
}
