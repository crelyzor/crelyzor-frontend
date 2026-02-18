import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  publicBookingApi,
  type CreatePublicBookingPayload,
} from '@/services/publicBookingService';

export function usePublicBookingPage(username: string, eventSlug: string) {
  return useQuery({
    queryKey: queryKeys.publicBooking.page(username, eventSlug),
    queryFn: () => publicBookingApi.getBookingPage(username, eventSlug),
    enabled: !!username && !!eventSlug,
  });
}

export function usePublicBookingSlots(
  username: string,
  eventSlug: string,
  date: string,
) {
  return useQuery({
    queryKey: queryKeys.publicBooking.slots(username, eventSlug, date),
    queryFn: () => publicBookingApi.getSlots(username, eventSlug, date),
    enabled: !!username && !!eventSlug && !!date,
  });
}

export function useCreatePublicBooking(username: string, eventSlug: string) {
  return useMutation({
    mutationFn: (data: CreatePublicBookingPayload) =>
      publicBookingApi.createBooking(username, eventSlug, data),
  });
}
