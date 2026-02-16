export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type Organization = {
  id: string;
  name: string;
  avatar?: string;
  role: OrgRole;
  isPersonal: boolean;
  orgMemberId: string;
  description?: string;
  orgLogoUrl?: string;
  memberCount?: number;
};

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
  organizations: {
    orgMemberId: string;
    orgId: string;
    orgName: string;
    orgLogoUrl?: string;
    orgDescription?: string;
    accessLevel: OrgRole;
    isPersonal?: boolean;
  }[];
};
