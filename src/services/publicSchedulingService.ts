/**
 * Phase 6 P12 — Public scheduling read endpoints + internal booking create.
 *
 * These endpoints are no-auth on the backend, but the apiClient still
 * attaches X-Team-Id from the team store. That's harmless — server-side
 * public handlers ignore the header.
 */
import { apiClient } from '@/lib/apiClient';

export interface PublicScheduledEventType {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  locationType: string;
}

export interface PublicTeamMemberSchedulingProfile {
  team: { name: string; slug: string; logoUrl: string | null };
  user: {
    name: string | null;
    username: string;
    avatarUrl: string | null;
    timezone: string | null;
  };
  eventTypes: PublicScheduledEventType[];
}

export interface PublicSlot {
  startTime: string;
  endTime: string;
}

export interface CreatePublicBookingPayload {
  username: string;
  eventTypeSlug: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
  guestNote?: string;
  guestTimezone: string;
  teamSlug?: string;
}

export interface PublicBookingResult {
  booking: {
    id: string;
    status: string;
    startTime: string;
    endTime: string;
  };
}

export const publicSchedulingService = {
  /** GET /public/scheduling/team/:slug/:username — member's team event types. */
  getTeamMemberScheduling: (slug: string, username: string) =>
    apiClient.get<PublicTeamMemberSchedulingProfile>(
      `/public/scheduling/team/${slug}/${username}`
    ),

  /** GET /public/scheduling/slots/:username/:eventTypeSlug?date=YYYY-MM-DD[&teamSlug=...] */
  getSlots: (username: string, eventTypeSlug: string, date: string, teamSlug?: string) =>
    apiClient.get<{ slots: PublicSlot[] }>(
      `/public/scheduling/slots/${username}/${eventTypeSlug}`,
      { params: { date, ...(teamSlug ? { teamSlug } : {}) } }
    ),

  /** POST /public/bookings — creates a PENDING booking. */
  createBooking: (payload: CreatePublicBookingPayload) =>
    apiClient.post<PublicBookingResult>('/public/bookings', payload),
};
