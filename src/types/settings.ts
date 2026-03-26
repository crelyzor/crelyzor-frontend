export interface UserSettings {
  id: string;
  userId: string;
  schedulingEnabled: boolean;
  minNoticeHours: number;
  maxWindowDays: number;
  defaultBufferMins: number;
  googleCalendarSyncEnabled: boolean;
  googleCalendarEmail: string | null;
  recallEnabled: boolean;
  autoTranscribe: boolean;
  autoAIProcess: boolean;
  defaultLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export type PatchUserSettingsPayload = Partial<
  Pick<
    UserSettings,
    | 'schedulingEnabled'
    | 'minNoticeHours'
    | 'maxWindowDays'
    | 'defaultBufferMins'
    | 'googleCalendarSyncEnabled'
    | 'recallEnabled'
    | 'autoTranscribe'
    | 'autoAIProcess'
    | 'defaultLanguage'
  >
>;

// ── Event Types ──

export type LocationType = 'IN_PERSON' | 'ONLINE';

export interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  locationType: LocationType;
  meetingLink: string | null;
  bufferBefore: number;
  bufferAfter: number;
  maxPerDay: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventTypePayload {
  title: string;
  slug: string;
  description?: string;
  duration: number;
  locationType: LocationType;
  meetingLink?: string;
  bufferBefore?: number;
  bufferAfter?: number;
  maxPerDay?: number;
  isActive?: boolean;
}

export type UpdateEventTypePayload = Partial<
  Omit<CreateEventTypePayload, 'slug'> & {
    slug?: string;
    meetingLink?: string | null;
    maxPerDay?: number | null;
  }
>;
