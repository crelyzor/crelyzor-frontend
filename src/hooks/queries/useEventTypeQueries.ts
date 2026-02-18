import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { eventTypeApi } from '@/services/eventTypeService';
import type {
  CreateEventTypePayload,
  UpdateEventTypePayload,
} from '@/services/eventTypeService';

export function useEventTypes() {
  return useQuery({
    queryKey: queryKeys.eventTypes.list(),
    queryFn: () => eventTypeApi.getEventTypes(),
  });
}

export function useEventType(id: string) {
  return useQuery({
    queryKey: queryKeys.eventTypes.detail(id),
    queryFn: () => eventTypeApi.getEventTypeById(id),
    enabled: !!id,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventTypePayload) =>
      eventTypeApi.createEventType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.eventTypes.all });
    },
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventTypePayload }) =>
      eventTypeApi.updateEventType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.eventTypes.all });
    },
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventTypeApi.deleteEventType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.eventTypes.all });
    },
  });
}

export function useToggleEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventTypeApi.toggleEventType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.eventTypes.all });
    },
  });
}
