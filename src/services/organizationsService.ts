import { apiClient } from '@/lib/apiClient';
import type { Organization } from '@/types';

export type UpdateOrgPayload = {
  name?: string;
};

export type OrgMember = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  roles: { id: string; roleName: string }[];
  joinedAt: string;
};

export const organizationsApi = {
  /** GET /organizations/list — all orgs for current user */
  list: () => apiClient.get<Organization[]>('/organizations/list'),

  /** POST /organizations — create team org */
  create: (data: { name: string }) =>
    apiClient.post<Organization>('/organizations', data),

  /** GET /organizations — details of current org (uses x-organization-id header) */
  getCurrent: () => apiClient.get<Organization>('/organizations'),

  /** PATCH /organizations — update current org */
  update: (data: UpdateOrgPayload) =>
    apiClient.patch<Organization>('/organizations', data),

  /** DELETE /organizations — delete current org */
  delete: () => apiClient.delete<void>('/organizations'),

  /** GET /organizations/members — list members of current org */
  getMembers: () => apiClient.get<OrgMember[]>('/organizations/members'),

  /** GET /organizations/members/:memberId */
  getMember: (memberId: string) =>
    apiClient.get<OrgMember>(`/organizations/members/${memberId}`),

  /** DELETE /organizations/members/:memberId */
  removeMember: (memberId: string) =>
    apiClient.delete<void>(`/organizations/members/${memberId}`),

  /** PATCH /organizations/members/:memberId/role */
  updateMemberRole: (memberId: string, role: string) =>
    apiClient.patch<void>(`/organizations/members/${memberId}/role`, { role }),
};
