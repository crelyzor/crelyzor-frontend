import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { organizationsApi } from '@/services/organizationsService';
import type { UpdateOrgPayload } from '@/services/organizationsService';
import { useOrganizationStore } from '@/stores';

export function useOrganizations() {
  const setOrganizations = useOrganizationStore((s) => s.setOrganizations);

  return useQuery({
    queryKey: queryKeys.organizations.list(),
    queryFn: async () => {
      const orgs = await organizationsApi.list();
      setOrganizations(orgs);
      return orgs;
    },
  });
}

export function useCurrentOrganization() {
  return useQuery({
    queryKey: queryKeys.organizations.detail('current'),
    queryFn: () => organizationsApi.getCurrent(),
  });
}

export function useOrgMembers() {
  return useQuery({
    queryKey: queryKeys.organizations.members('current'),
    queryFn: () => organizationsApi.getMembers(),
  });
}

export function useUpdateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrgPayload) => organizationsApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });
}

export function useCreateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => organizationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });
}
