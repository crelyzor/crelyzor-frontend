import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { availabilityApi } from '@/services/availabilityService';
import type { CreateBookingPayload } from '@/services/availabilityService';
import type { WeeklySchedule } from '@/types';

export function useAvailabilitySchedule() {
  return useQuery({
    queryKey: queryKeys.availability.schedule(),
    queryFn: () => availabilityApi.getSchedule(),
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (schedule: WeeklySchedule) =>
      availabilityApi.updateSchedule(schedule),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useBookingSlots(token: string, date: string) {
  return useQuery({
    queryKey: queryKeys.availability.booking(token),
    queryFn: () => availabilityApi.getBookingSlots(token, date),
    enabled: !!token && !!date,
  });
}

export function useCreateBooking(token: string) {
  return useMutation({
    mutationFn: (data: CreateBookingPayload) =>
      availabilityApi.createBooking(token, data),
  });
}
