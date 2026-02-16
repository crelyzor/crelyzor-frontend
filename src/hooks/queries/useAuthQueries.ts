import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { authApi } from '@/services/authService';
import { useAuthStore, useOrganizationStore } from '@/stores';
import type { Organization } from '@/types';

/**
 * Fetch current user profile + populate stores.
 * Enabled only when we have an access token.
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setCurrentUser = useOrganizationStore((s) => s.setCurrentUser);
  const setOrganizations = useOrganizationStore((s) => s.setOrganizations);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const profile = await authApi.profile();

      // Populate stores from profile
      setCurrentUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      });

      // Map backend org shape to frontend Organization type
      const orgs: Organization[] = profile.organizations.map((o) => ({
        id: o.orgId,
        name: o.orgName,
        orgMemberId: o.orgMemberId,
        role: (o.accessLevel as Organization['role']) ?? 'MEMBER',
        isPersonal: o.isPersonal ?? false,
        description: o.orgDescription,
        orgLogoUrl: o.orgLogoUrl,
      }));
      setOrganizations(orgs);

      return profile;
    },
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
  const resetOrg = useOrganizationStore((s) => s.reset);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('calendar-refresh-token');
      return authApi.logout(refreshToken || undefined);
    },
    onSettled: () => {
      logout();
      resetOrg();
      qc.clear();
      localStorage.removeItem('calendar-refresh-token');
    },
  });
}
