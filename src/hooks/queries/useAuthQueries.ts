import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { authApi } from '@/services/authService';
import { useAuthStore } from '@/stores';

/**
 * Fetch current user profile.
 * Enabled only when we have an access token.
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.profile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Redirect to Google OAuth login page.
 */
export function useGoogleLogin() {
  return {
    login: () => {
      const callbackUrl = `${window.location.origin}/auth/callback`;
      window.location.href = authApi.getGoogleLoginUrl(callbackUrl);
    },
  };
}

/**
 * Logout mutation — clears tokens and stores.
 */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('calendar-refresh-token');
      return authApi.logout(refreshToken || undefined);
    },
    onSettled: () => {
      logout();
      qc.clear();
      localStorage.removeItem('calendar-refresh-token');
    },
  });
}
