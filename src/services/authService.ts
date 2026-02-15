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

  // Logout
  logout: (refreshToken?: string) =>
    apiClient.post<void>('/auth/logout', { refreshToken }),

  // Refresh access token
  refreshToken: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/refresh-token',
      { refreshToken }
    ),
};
