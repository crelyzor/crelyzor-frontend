export type OrgRole = 'owner' | 'admin' | 'member';

export type Organization = {
  id: string;
  name: string;
  avatar?: string;
  role: OrgRole;
  isPersonal: boolean;
  plan?: string;
  memberCount?: number;
};

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
};
