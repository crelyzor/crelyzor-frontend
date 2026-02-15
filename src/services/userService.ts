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
};
