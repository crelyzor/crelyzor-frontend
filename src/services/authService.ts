import { apiClient } from '@/lib/apiClient';

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export type CurrentUserResponse = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  googleLogin: (code: string) =>
    apiClient.post<AuthResponse>('/auth/google', { code }),

  me: () => apiClient.get<CurrentUserResponse>('/auth/me'),

  logout: () => apiClient.post<void>('/auth/logout'),
};
