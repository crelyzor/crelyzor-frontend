import { apiClient } from '@/lib/apiClient';

export type UpdateProfilePayload = {
  name?: string;
  avatarUrl?: string;
  countryCode?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  countryCode: string | null;
  phoneNumber: string | null;
  country: string | null;
  state: string | null;
  updatedAt: string;
};

export const userApi = {
  /** PATCH /users/profile — update current user profile */
  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.patch<UserProfile>('/users/profile', data),

  /** GET /users/search?q= — search other Crelyzor users by name/email */
  search: (q: string): Promise<{ users: UserSearchResult[] }> =>
    apiClient.get<{ users: UserSearchResult[] }>('/users/search', {
      params: { q },
    }),
};

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  username: string | null;
}
