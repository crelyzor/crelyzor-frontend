import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { settingsApi } from '@/services/settingsService';
import { ApiError } from '@/lib/apiClient';
import type { UserSettings, PatchUserSettingsPayload } from '@/types/settings';

/** Extracts the backend's error message from an ApiError, falling back to a default. */
function getApiErrorMessage(err: unknown, fallback: string): string {
  if (
    err instanceof ApiError &&
    err.data !== null &&
    typeof (err.data as Record<string, unknown>).message === 'string'
  ) {
    return (err.data as Record<string, string>).message;
  }
  return fallback;
}

export function useUserSettings() {
  return useQuery({
    queryKey: queryKeys.settings.user(),
    queryFn: settingsApi.getUserSettings,
  });
}

export function useUpdateUserSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PatchUserSettingsPayload) =>
      settingsApi.updateUserSettings(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: queryKeys.settings.user() });
      const previous = qc.getQueryData<UserSettings>(queryKeys.settings.user());
      if (previous) {
        qc.setQueryData<UserSettings>(queryKeys.settings.user(), {
          ...previous,
          ...data,
        });
      }
      return { previous };
    },
    onError: (err, _data, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.settings.user(), context.previous);
      }
      toast.error(getApiErrorMessage(err, 'Failed to update settings'));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.user() });
    },
  });
}
