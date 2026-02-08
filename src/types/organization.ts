export type OrgRole = 'owner' | 'admin' | 'member' | 'guest';

export type Organization = {
  id: string;
  name: string;
  avatar?: string;
  role: OrgRole;
  plan?: string;
  memberCount?: number;
};

export type CurrentUser = {
  email: string;
  name: string;
};
