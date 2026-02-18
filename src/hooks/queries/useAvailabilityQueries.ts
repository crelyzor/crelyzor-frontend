import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { availabilityApi } from '@/services/availabilityService';
import type { CreateRecurringPayload } from '@/services/availabilityService';

export function useRecurringAvailability(scheduleId?: string) {
  return useQuery({
    queryKey: queryKeys.availability.recurring(scheduleId ?? ''),
    queryFn: () => availabilityApi.getRecurring(scheduleId!),
    enabled: !!scheduleId,
  });
}

export function useCreateRecurringBatch(scheduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slots: CreateRecurringPayload[]) =>
      availabilityApi.createRecurringBatch(scheduleId, slots),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useDeleteRecurring(scheduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityApi.deleteRecurring(scheduleId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useOverrides(scheduleId?: string) {
  return useQuery({
    queryKey: queryKeys.availability.overrides(scheduleId ?? ''),
    queryFn: () => availabilityApi.getOverrides(scheduleId!),
    enabled: !!scheduleId,
  });
}

export function useCreateOverride(scheduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      date: string;
      startTime: string;
      endTime: string;
      notes?: string;
    }) => availabilityApi.createOverride(scheduleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useDeleteOverride(scheduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityApi.deleteOverride(scheduleId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useBlockedTimes(scheduleId?: string) {
  return useQuery({
    queryKey: queryKeys.availability.blocked(scheduleId ?? ''),
    queryFn: () => availabilityApi.getBlockedTimes(scheduleId!),
    enabled: !!scheduleId,
  });
}

export function useCreateBlockedTime(scheduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      startTime: string;
      endTime: string;
      reason?: string;
      recurrenceRule?: string;
      recurrenceEnd?: string;
    }) => availabilityApi.createBlockedTime(scheduleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useDeleteBlockedTime(scheduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      availabilityApi.deleteBlockedTime(scheduleId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useAvailableSlots(
  scheduleId: string,
  startDate: string,
  endDate: string,
  options?: { slotDuration?: number; eventTypeId?: string },
) {
  return useQuery({
    queryKey: queryKeys.availability.slots(scheduleId, {
      startDate,
      endDate,
      ...options,
    }),
    queryFn: () =>
      availabilityApi.getAvailableSlots(
        scheduleId,
        startDate,
        endDate,
        options?.slotDuration,
        options?.eventTypeId,
      ),
    enabled: !!scheduleId && !!startDate && !!endDate,
  });
}
