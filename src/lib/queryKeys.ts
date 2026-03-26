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
    sessions: () => [...queryKeys.auth.all, 'sessions'] as const,
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

  // SMA (Smart Meeting Assistant)
  sma: {
    all: ['sma'] as const,
    transcript: (meetingId: string) =>
      [...queryKeys.sma.all, 'transcript', meetingId] as const,
    summary: (meetingId: string) =>
      [...queryKeys.sma.all, 'summary', meetingId] as const,
    tasks: (meetingId: string) =>
      [...queryKeys.sma.all, 'tasks', meetingId] as const,
    notes: (meetingId: string) =>
      [...queryKeys.sma.all, 'notes', meetingId] as const,
    recordings: (meetingId: string) =>
      [...queryKeys.sma.all, 'recordings', meetingId] as const,
    speakers: (meetingId: string) =>
      [...queryKeys.sma.all, 'speakers', meetingId] as const,
    generatedContents: (meetingId: string) =>
      [...queryKeys.sma.all, 'generated', meetingId] as const,
    share: (meetingId: string) =>
      [...queryKeys.sma.all, 'share', meetingId] as const,
    allTasks: () => [...queryKeys.sma.all, 'allTasks'] as const,
  },

  // Tags
  tags: {
    all: ['tags'] as const,
    userTags: () => [...queryKeys.tags.all, 'list'] as const,
    byMeeting: (meetingId: string) =>
      [...queryKeys.tags.all, 'meeting', meetingId] as const,
    byCard: (cardId: string) =>
      [...queryKeys.tags.all, 'card', cardId] as const,
  },

  // Attachments
  attachments: {
    all: ['attachments'] as const,
    byMeeting: (meetingId: string) =>
      [...queryKeys.attachments.all, 'meeting', meetingId] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    user: () => [...queryKeys.settings.all, 'user'] as const,
  },

  // Scheduling
  scheduling: {
    all: ['scheduling'] as const,
    eventTypes: () => [...queryKeys.scheduling.all, 'eventTypes'] as const,
    availability: () => [...queryKeys.scheduling.all, 'availability'] as const,
    overrides: () => [...queryKeys.scheduling.all, 'overrides'] as const,
  },

  // Cards
  cards: {
    all: ['cards'] as const,
    list: () => [...queryKeys.cards.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.cards.all, 'detail', id] as const,
    templates: () => [...queryKeys.cards.all, 'templates'] as const,
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
