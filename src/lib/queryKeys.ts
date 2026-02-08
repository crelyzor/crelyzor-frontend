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
    detail: (id: string) => [...queryKeys.organizations.all, 'detail', id] as const,
    members: (orgId: string) => [...queryKeys.organizations.all, 'members', orgId] as const,
    settings: (orgId: string) => [...queryKeys.organizations.all, 'settings', orgId] as const,
  },

  // Meetings
  meetings: {
    all: ['meetings'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.meetings.all, 'list', ...(filters ? [filters] : [])] as const,
    detail: (id: string | number) => [...queryKeys.meetings.all, 'detail', id] as const,
    upcoming: () => [...queryKeys.meetings.all, 'upcoming'] as const,
    past: () => [...queryKeys.meetings.all, 'past'] as const,
    live: () => [...queryKeys.meetings.all, 'live'] as const,
  },

  // Availability
  availability: {
    all: ['availability'] as const,
    schedule: () => [...queryKeys.availability.all, 'schedule'] as const,
    booking: (token: string) => [...queryKeys.availability.all, 'booking', token] as const,
  },

  // Recordings
  recordings: {
    all: ['recordings'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.recordings.all, 'list', ...(filters ? [filters] : [])] as const,
    detail: (id: string) => [...queryKeys.recordings.all, 'detail', id] as const,
  },

  // Transcripts
  transcripts: {
    all: ['transcripts'] as const,
    detail: (id: string) => [...queryKeys.transcripts.all, 'detail', id] as const,
  },

  // Sync (Google Calendar)
  sync: {
    all: ['sync'] as const,
    status: () => [...queryKeys.sync.all, 'status'] as const,
  },
} as const;
