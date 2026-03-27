import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { userApi } from '@/services/userService';
import type { UpdateProfilePayload } from '@/services/userService';

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => userApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useUserSearch(q: string) {
  return useQuery({
    queryKey: queryKeys.users.search(q),
    queryFn: () => userApi.search(q),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
}
