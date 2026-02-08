import { apiClient } from '@/lib/apiClient';
import type { Organization } from '@/types';

export type UpdateOrgPayload = {
  name?: string;
  plan?: string;
};

export const organizationsApi = {
  list: () =>
    apiClient.get<{ organizations: Organization[] }>('/organizations'),

  getById: (id: string) => apiClient.get<Organization>(`/organizations/${id}`),

  update: (id: string, data: UpdateOrgPayload) =>
    apiClient.patch<Organization>(`/organizations/${id}`, data),

  getMembers: (orgId: string) =>
    apiClient.get<{
      members: { id: string; name: string; email: string; role: string }[];
    }>(`/organizations/${orgId}/members`),

  getSettings: (orgId: string) =>
    apiClient.get<Record<string, unknown>>(`/organizations/${orgId}/settings`),

  updateSettings: (orgId: string, data: Record<string, unknown>) =>
    apiClient.patch<Record<string, unknown>>(
      `/organizations/${orgId}/settings`,
      data
    ),
};
