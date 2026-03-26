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
