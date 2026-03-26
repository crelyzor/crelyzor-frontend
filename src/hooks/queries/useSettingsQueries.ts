import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { settingsApi } from '@/services/settingsService';
import type { UserSettings, PatchUserSettingsPayload } from '@/types/settings';

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
      const previous = qc.getQueryData<UserSettings>(
        queryKeys.settings.user()
      );
      if (previous) {
        qc.setQueryData<UserSettings>(queryKeys.settings.user(), {
          ...previous,
          ...data,
        });
      }
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.settings.user(), context.previous);
      }
      toast.error('Failed to update settings');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.user() });
    },
  });
}
