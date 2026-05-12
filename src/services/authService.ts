import { apiClient } from '@/lib/apiClient';
import type { ProfileResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const authApi = {
  // Google OAuth: redirect to backend's Google login endpoint
  getGoogleLoginUrl: (redirectUrl: string): string => {
    return `${API_BASE_URL}/auth/google/login?redirectUrl=${encodeURIComponent(redirectUrl)}`;
  },

  // Get current user profile (includes organizations)
  profile: () => apiClient.get<ProfileResponse>('/auth/profile'),

  // Logout — refresh token is in httpOnly cookie, no need to pass it in body
  logout: () => apiClient.post<void>('/auth/logout'),

  // Refresh access token — cookie-based, returns only access token
  refreshToken: () =>
    apiClient.post<{ accessToken: string; expiresIn: number }>(
      '/auth/refresh-token'
    ),

  // Check username availability
  checkUsername: (username: string) =>
    apiClient.get<{ available: boolean }>(
      `/auth/username/check?username=${encodeURIComponent(username)}`
    ),

  // Set username (onboarding or update)
  setUsername: (username: string) =>
    apiClient.post<ProfileResponse>('/auth/username', { username }),
};
