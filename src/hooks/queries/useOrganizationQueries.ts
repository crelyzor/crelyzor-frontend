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
      const data = await organizationsApi.list();
      setOrganizations(data.organizations);
      return data;
    },
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(id),
    queryFn: () => organizationsApi.getById(id),
    enabled: !!id,
  });
}

export function useOrgMembers(orgId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.members(orgId),
    queryFn: () => organizationsApi.getMembers(orgId),
    enabled: !!orgId,
  });
}

export function useOrgSettings(orgId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.settings(orgId),
    queryFn: () => organizationsApi.getSettings(orgId),
    enabled: !!orgId,
  });
}

export function useUpdateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgPayload }) =>
      organizationsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });
}

export function useUpdateOrgSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: Record<string, unknown>;
    }) => organizationsApi.updateSettings(orgId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: queryKeys.organizations.settings(vars.orgId),
      });
    },
  });
}
