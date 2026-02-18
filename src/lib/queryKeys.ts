/**
 * Centralized query key factory.
 * Provides consistent, type-safe cache keys for React Query.
 *
 * Usage:
 *   queryKeys.meetings.list()          → ['meetings', 'list']
 *   queryKeys.meetings.list({ type })  → ['meetings', 'list', { type }]
 *   queryKeys.meetings.detail(id)      → ['meetings', 'detail', id]
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // Organizations
  organizations: {
    all: ['organizations'] as const,
    list: () => [...queryKeys.organizations.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.organizations.all, 'detail', id] as const,
    members: (orgId: string) =>
      [...queryKeys.organizations.all, 'members', orgId] as const,
    settings: (orgId: string) =>
      [...queryKeys.organizations.all, 'settings', orgId] as const,
  },

  // Meetings
  meetings: {
    all: ['meetings'] as const,
    list: (filters?: Record<string, unknown>) =>
      [
        ...queryKeys.meetings.all,
        'list',
        ...(filters ? [filters] : []),
      ] as const,
    detail: (id: string | number) =>
      [...queryKeys.meetings.all, 'detail', id] as const,
    upcoming: () => [...queryKeys.meetings.all, 'upcoming'] as const,
    past: () => [...queryKeys.meetings.all, 'past'] as const,
    live: () => [...queryKeys.meetings.all, 'live'] as const,
  },

  // Schedules (user-level)
  schedules: {
    all: ['schedules'] as const,
    list: () => [...queryKeys.schedules.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.schedules.all, 'detail', id] as const,
    default: () => [...queryKeys.schedules.all, 'default'] as const,
  },

  // Event Types (user-level)
  eventTypes: {
    all: ['eventTypes'] as const,
    list: () => [...queryKeys.eventTypes.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.eventTypes.all, 'detail', id] as const,
  },

  // Availability (schedule-scoped)
  availability: {
    all: ['availability'] as const,
    recurring: (scheduleId: string) =>
      [...queryKeys.availability.all, 'recurring', scheduleId] as const,
    overrides: (scheduleId: string) =>
      [...queryKeys.availability.all, 'overrides', scheduleId] as const,
    blocked: (scheduleId: string) =>
      [...queryKeys.availability.all, 'blocked', scheduleId] as const,
    slots: (scheduleId: string, params?: Record<string, unknown>) =>
      [
        ...queryKeys.availability.all,
        'slots',
        scheduleId,
        ...(params ? [params] : []),
      ] as const,
  },

  // Public Booking (no auth)
  publicBooking: {
    all: ['publicBooking'] as const,
    page: (username: string, eventSlug: string) =>
      [...queryKeys.publicBooking.all, 'page', username, eventSlug] as const,
    slots: (username: string, eventSlug: string, date: string) =>
      [
        ...queryKeys.publicBooking.all,
        'slots',
        username,
        eventSlug,
        date,
      ] as const,
  },

  // Recordings
  recordings: {
    all: ['recordings'] as const,
    list: (filters?: Record<string, unknown>) =>
      [
        ...queryKeys.recordings.all,
        'list',
        ...(filters ? [filters] : []),
      ] as const,
    detail: (id: string) =>
      [...queryKeys.recordings.all, 'detail', id] as const,
  },

  // Transcripts
  transcripts: {
    all: ['transcripts'] as const,
    detail: (id: string) =>
      [...queryKeys.transcripts.all, 'detail', id] as const,
  },

  // Sync (Google Calendar)
  sync: {
    all: ['sync'] as const,
    status: () => [...queryKeys.sync.all, 'status'] as const,
  },
  // Cards
  cards: {
    all: ['cards'] as const,
    list: () => [...queryKeys.cards.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.cards.all, 'detail', id] as const,
    analytics: (id: string, days?: number) =>
      [...queryKeys.cards.all, 'analytics', id, days] as const,
    contacts: (filters?: Record<string, unknown>) =>
      [
        ...queryKeys.cards.all,
        'contacts',
        ...(filters ? [filters] : []),
      ] as const,
  },
} as const;
