import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { scheduleApi } from '@/services/scheduleService';
import type {
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from '@/services/scheduleService';

export function useSchedules() {
  return useQuery({
    queryKey: queryKeys.schedules.list(),
    queryFn: () => scheduleApi.getSchedules(),
  });
}

export function useDefaultSchedule() {
  return useQuery({
    queryKey: queryKeys.schedules.default(),
    queryFn: () => scheduleApi.getDefaultSchedule(),
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSchedulePayload) =>
      scheduleApi.createSchedule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchedulePayload }) =>
      scheduleApi.updateSchedule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleApi.deleteSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
  });
}

export function useSetDefaultSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleApi.setDefaultSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
  });
}
