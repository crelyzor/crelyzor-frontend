import { apiClient } from '@/lib/apiClient';
import type { UserSettings, PatchUserSettingsPayload } from '@/types/settings';

export const settingsApi = {
  /** GET /settings/user — get or create user settings */
  getUserSettings: () => apiClient.get<UserSettings>('/settings/user'),

  /** PATCH /settings/user — update user settings */
  updateUserSettings: (data: PatchUserSettingsPayload) =>
    apiClient.patch<UserSettings>('/settings/user', data),
};
