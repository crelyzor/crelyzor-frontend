import type { Organization, CurrentUser } from '@/types';

export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Harsh Keshari',
    role: 'owner',
    isPersonal: true,
    plan: 'Pro',
    memberCount: 1,
  },
  {
    id: '2',
    name: 'Acme Inc',
    role: 'owner',
    isPersonal: false,
    plan: 'Business',
    memberCount: 12,
  },
  {
    id: '3',
    name: 'Design Studio',
    role: 'member',
    isPersonal: false,
    plan: 'Business',
    memberCount: 6,
  },
  {
    id: '4',
    name: 'StartupHQ',
    role: 'admin',
    isPersonal: false,
    plan: 'Business',
    memberCount: 15,
  },
  {
    id: '5',
    name: 'Freelance Collective',
    role: 'member',
    isPersonal: false,
    plan: 'Free',
    memberCount: 8,
  },
];

export const currentUser: CurrentUser = {
  id: 'u1',
  email: 'harshkeshari100@gmail.com',
  name: 'Harsh Keshari',
  avatarUrl: undefined,
};
