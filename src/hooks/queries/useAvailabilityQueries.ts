import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { availabilityApi } from '@/services/availabilityService';
import type { CreateRecurringPayload, CreateBookingPayload } from '@/services/availabilityService';

export function useRecurringAvailability(orgMemberId?: string) {
  return useQuery({
    queryKey: queryKeys.availability.schedule(),
    queryFn: () => availabilityApi.getRecurring(orgMemberId),
  });
}

export function useCreateRecurringBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slots: CreateRecurringPayload[]) =>
      availabilityApi.createRecurringBatch(slots),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityApi.deleteRecurring(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability.all });
    },
  });
}

export function useAvailableSlots(orgMemberId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: queryKeys.availability.booking(orgMemberId),
    queryFn: () => availabilityApi.getAvailableSlots(orgMemberId, startDate, endDate),
    enabled: !!orgMemberId && !!startDate && !!endDate,
  });
}

export function usePublicBookingProfile(shareToken: string) {
  return useQuery({
    queryKey: queryKeys.availability.booking(shareToken),
    queryFn: () => availabilityApi.getPublicBookingProfile(shareToken),
    enabled: !!shareToken,
  });
}

export function useCreatePublicBooking(shareToken: string) {
  return useMutation({
    mutationFn: (data: CreateBookingPayload) =>
      availabilityApi.createPublicBooking(shareToken, data),
  });
}
