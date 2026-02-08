import type { Organization, CurrentUser } from '@/types';

export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: "Harsh's Workspace",
    role: 'owner',
    plan: 'Pro Plan',
    memberCount: 1,
  },
  {
    id: '2',
    name: 'Acme Inc',
    role: 'member',
    plan: 'Business',
    memberCount: 24,
  },
  {
    id: '3',
    name: 'Design Team',
    role: 'guest',
  },
  {
    id: '4',
    name: 'Freelance Projects',
    role: 'guest',
  },
];

export const currentUser: CurrentUser = {
  email: 'harshkeshari100@gmail.com',
  name: 'Harsh Keshari',
};
