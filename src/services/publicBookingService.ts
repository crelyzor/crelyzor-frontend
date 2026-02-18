import type { EventType, AvailableSlot } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

function buildUrl(path: string): string {
  const base = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `${window.location.origin}${API_BASE_URL}`;
  return `${base}${path}`;
}

async function publicFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(
      data?.message ?? `Request failed: ${res.status} ${res.statusText}`,
    );
  }

  const json = await res.json();

  if (json && typeof json === 'object' && 'data' in json && 'statusCode' in json) {
    return json.data as T;
  }

  return json as T;
}

export type BookingPageData = {
  user: { id: string; name: string; username: string; avatar?: string };
  eventType: EventType;
};

export type CreatePublicBookingPayload = {
  startTime: string;
  endTime: string;
  guestEmail: string;
  guestName: string;
  guestMessage?: string;
  timezone: string;
};

export const publicBookingApi = {
  /** GET /public/book/:username/:eventSlug — booking page data */
  getBookingPage: (username: string, eventSlug: string) =>
    publicFetch<BookingPageData>(`/public/book/${username}/${eventSlug}`),

  /** GET /public/book/:username/:eventSlug/slots?date=YYYY-MM-DD */
  getSlots: (username: string, eventSlug: string, date: string) =>
    publicFetch<AvailableSlot[]>(
      `/public/book/${username}/${eventSlug}/slots?date=${date}`,
    ),

  /** POST /public/book/:username/:eventSlug — submit booking */
  createBooking: (
    username: string,
    eventSlug: string,
    data: CreatePublicBookingPayload,
  ) =>
    publicFetch<{ meetingId: string }>(
      `/public/book/${username}/${eventSlug}`,
      { method: 'POST', body: JSON.stringify(data) },
    ),
};
