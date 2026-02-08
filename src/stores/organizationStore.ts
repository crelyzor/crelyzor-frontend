import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization, CurrentUser } from '@/types';

type OrganizationStore = {
  // State
  currentOrg: Organization | null;
  organizations: Organization[];
  currentUser: CurrentUser | null;

  // Actions
  setCurrentOrg: (org: Organization) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentUser: (user: CurrentUser) => void;
  switchOrg: (orgId: string) => void;
  reset: () => void;
};

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set, get) => ({
      currentOrg: null,
      organizations: [],
      currentUser: null,

      setCurrentOrg: (org) => set({ currentOrg: org }),
      setOrganizations: (orgs) => {
        set({ organizations: orgs });
        // Auto-select first org if none selected
        if (!get().currentOrg && orgs.length > 0) {
          set({ currentOrg: orgs[0] });
        }
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      switchOrg: (orgId) => {
        const org = get().organizations.find((o) => o.id === orgId);
        if (org) set({ currentOrg: org });
      },
      reset: () =>
        set({ currentOrg: null, organizations: [], currentUser: null }),
    }),
    {
      name: 'calendar-org',
      partialize: (state) => ({
        currentOrg: state.currentOrg,
      }),
    }
  )
);
