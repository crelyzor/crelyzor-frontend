import type { Organization, CurrentUser } from '@/types';

export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Harsh Keshari',
    role: 'OWNER',
    isPersonal: true,
    memberCount: 1,
    orgMemberId: 'om-1',
  },
  {
    id: '2',
    name: 'Acme Inc',
    role: 'OWNER',
    isPersonal: false,
    memberCount: 12,
    orgMemberId: 'om-2',
  },
  {
    id: '3',
    name: 'Design Studio',
    role: 'MEMBER',
    isPersonal: false,
    memberCount: 6,
    orgMemberId: 'om-3',
  },
  {
    id: '4',
    name: 'StartupHQ',
    role: 'ADMIN',
    isPersonal: false,
    memberCount: 15,
    orgMemberId: 'om-4',
  },
  {
    id: '5',
    name: 'Freelance Collective',
    role: 'MEMBER',
    isPersonal: false,
    memberCount: 8,
    orgMemberId: 'om-5',
  },
];

export const currentUser: CurrentUser = {
  id: 'u1',
  email: 'harshkeshari100@gmail.com',
  name: 'Harsh Keshari',
  username: 'harshkeshari',
  avatarUrl: undefined,
};
