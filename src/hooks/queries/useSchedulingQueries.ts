import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import {
  eventTypesApi,
  schedulesApi,
  bookingsApi,
  type ListBookingsParams,
} from '@/services/settingsService';
import type {
  EventType,
  CreateEventTypePayload,
  UpdateEventTypePayload,
  AvailabilitySchedule,
  ScheduleAvailabilityDay,
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
        err.data?.message || err.message || 'Failed to create event type';
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
      toast.error(
        err.data?.message || err.message || 'Failed to update event type'
      );
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
        err.data?.message || err.message || 'Failed to delete event type';
      toast.error(msg);
    },
  });
}

// ── Availability Schedules ──

export function useSchedules() {
  return useQuery({
    queryKey: queryKeys.scheduling.schedules(),
    queryFn: schedulesApi.list,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; timezone: string }) =>
      schedulesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.schedules() });
      toast.success('Schedule created');
    },
    onError: () => toast.error('Failed to create schedule'),
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; timezone?: string };
    }) => schedulesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: queryKeys.scheduling.schedules() });
      const previous = qc.getQueryData<AvailabilitySchedule[]>(
        queryKeys.scheduling.schedules()
      );
      if (previous) {
        qc.setQueryData<AvailabilitySchedule[]>(
          queryKeys.scheduling.schedules(),
          previous.map((s) => (s.id === id ? { ...s, ...data } : s))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.scheduling.schedules(), context.previous);
      }
      toast.error('Failed to update schedule');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.schedules() });
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.schedules() });
      toast.success('Schedule deleted');
    },
    onError: (err: Error & { data?: { message?: string } }) => {
      const msg =
        err.data?.message || err.message || 'Failed to delete schedule';
      toast.error(msg);
    },
  });
}

export function useCopySchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      schedulesApi.copy(id, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.schedules() });
      toast.success('Schedule copied');
    },
    onError: () => toast.error('Failed to copy schedule'),
  });
}

export function useSetDefaultSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesApi.setDefault(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.schedules() });
      toast.success('Default schedule updated');
    },
    onError: () => toast.error('Failed to set default schedule'),
  });
}

// ── Schedule Slots ──

export function useScheduleSlots(scheduleId: string | null) {
  return useQuery({
    queryKey: queryKeys.scheduling.scheduleSlots(scheduleId ?? ''),
    queryFn: () => schedulesApi.getSlots(scheduleId!),
    enabled: !!scheduleId,
  });
}

export function useUpdateScheduleSlots(scheduleId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
    ) => schedulesApi.patchSlots(scheduleId!, slots),
    onMutate: async () => {
      if (!scheduleId) return;
      await qc.cancelQueries({
        queryKey: queryKeys.scheduling.scheduleSlots(scheduleId),
      });
      const previous = qc.getQueryData<ScheduleAvailabilityDay[]>(
        queryKeys.scheduling.scheduleSlots(scheduleId)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (scheduleId && context?.previous) {
        qc.setQueryData(
          queryKeys.scheduling.scheduleSlots(scheduleId),
          context.previous
        );
      }
      toast.error('Failed to update slots');
    },
    onSettled: () => {
      if (scheduleId) {
        qc.invalidateQueries({
          queryKey: queryKeys.scheduling.scheduleSlots(scheduleId),
        });
      }
    },
    onSuccess: () => toast.success('Availability saved'),
  });
}

// ── Schedule Overrides ──

export function useScheduleOverrides(scheduleId: string | null) {
  return useQuery({
    queryKey: queryKeys.scheduling.scheduleOverrides(scheduleId ?? ''),
    queryFn: () => schedulesApi.getOverrides(scheduleId!),
    enabled: !!scheduleId,
  });
}

export function useCreateScheduleOverride(scheduleId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) =>
      schedulesApi.createOverride(scheduleId!, date),
    onSuccess: () => {
      if (scheduleId) {
        qc.invalidateQueries({
          queryKey: queryKeys.scheduling.scheduleOverrides(scheduleId),
        });
      }
      toast.success('Date blocked');
    },
    onError: () => toast.error('Failed to block date'),
  });
}

export function useDeleteScheduleOverride(scheduleId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (overrideId: string) =>
      schedulesApi.deleteOverride(scheduleId!, overrideId),
    onSuccess: () => {
      if (scheduleId) {
        qc.invalidateQueries({
          queryKey: queryKeys.scheduling.scheduleOverrides(scheduleId),
        });
      }
      toast.success('Date unblocked');
    },
    onError: () => toast.error('Failed to unblock date'),
  });
}

// ── Bookings ──

export function useBookings(params: ListBookingsParams = {}) {
  return useQuery({
    queryKey: queryKeys.scheduling.bookings(params as Record<string, unknown>),
    queryFn: () => bookingsApi.list(params),
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.confirm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.bookings() });
      toast.success('Booking confirmed');
    },
    onError: (err: Error & { data?: { message?: string } }) => {
      const msg =
        err.data?.message || err.message || 'Failed to confirm booking';
      toast.error(msg);
    },
  });
}

export function useDeclineBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsApi.decline(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.bookings() });
      toast.success('Booking declined');
    },
    onError: () => toast.error('Failed to decline booking'),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsApi.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduling.bookings() });
      toast.success('Booking cancelled');
    },
    onError: () => toast.error('Failed to cancel booking'),
  });
}
