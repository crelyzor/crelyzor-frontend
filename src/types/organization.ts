export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatarUrl?: string;
};

// Shape returned by GET /auth/profile
export type ProfileResponse = {
  id: string;
  email: string;
  username: string | null;
  emailVerified: boolean;
  name: string;
  avatarUrl?: string;
  countryCode?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  lastLoginAt?: string;
  isActive: boolean;
  timezone: string;
};
