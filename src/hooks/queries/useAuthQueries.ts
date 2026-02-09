import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { authApi } from '@/services/authService';
import type { LoginPayload } from '@/services/authService';
import { useAuthStore, useOrganizationStore } from '@/stores';

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.me(),
    enabled: isAuthenticated,
  });
}

export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setCurrentUser = useOrganizationStore((s) => s.setCurrentUser);

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: (res) => {
      setAccessToken(res.accessToken);
      setCurrentUser({ email: res.user.email, name: res.user.name });
    },
  });
}

export function useGoogleLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setCurrentUser = useOrganizationStore((s) => s.setCurrentUser);

  return useMutation({
    mutationFn: (code: string) => authApi.googleLogin(code),
    onSuccess: (res) => {
      setAccessToken(res.accessToken);
      setCurrentUser({ email: res.user.email, name: res.user.name });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const resetOrg = useOrganizationStore((s) => s.reset);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      resetOrg();
    },
  });
}
