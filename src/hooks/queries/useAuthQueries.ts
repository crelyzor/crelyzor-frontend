import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
 * Redirect to Google OAuth login page. Pass `next` to round-trip an internal
 * path that the AuthCallback should land on after a successful sign-in
 * (e.g. `/invite/<token>` for the email-invite flow). The receiver re-
 * validates `next` to prevent open-redirect via a tampered callback URL.
 */
export function useGoogleLogin() {
  return {
    login: (opts?: { next?: string }) => {
      const base = `${window.location.origin}/auth/callback`;
      const callbackUrl = opts?.next
        ? `${base}?next=${encodeURIComponent(opts.next)}`
        : base;
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
    mutationFn: () => authApi.logout(), // backend clears the httpOnly cookie
    onSettled: () => {
      logout();
      qc.clear();
    },
  });
}

/**
 * Deactivate account mutation — clears auth and redirects to signin.
 */
export function useDeactivateAccount() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => authApi.deactivateAccount(),
    onSuccess: () => {
      logout();
      navigate('/signin', { replace: true });
    },
  });
}
