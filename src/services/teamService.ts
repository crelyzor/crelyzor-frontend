/**
 * Phase 6 P9 — Team service. Mirrors the backend `/teams/*` surface.
 *
 * NOTE: every request from this service flows through the apiClient, which
 * automatically injects `X-Team-Id` from the team store. Endpoints under
 * `/teams/*` are intentionally NOT team-scoped on the backend — they manage
 * the team itself. The injected header is harmless on these calls.
 */
import { apiClient } from '@/lib/apiClient';
import type { Plan } from '@/types/organization';

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMembership {
  id: string;
  role: TeamRole;
  joinedAt: string;
  team: TeamSummary;
}

export interface CreateTeamPayload {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

export interface TeamDetail extends TeamSummary {
  ownerId: string;
  owner?: { id: string; name: string | null; email: string; plan: Plan };
}

export interface UpdateTeamPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
}

export interface TransferOwnershipPayload {
  targetUserId: string;
  teamNameConfirm: string;
}

export interface TeamMemberRow {
  id: string;
  role: TeamRole;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export type InviteRole = 'ADMIN' | 'MEMBER';

export type InviteMembersPayload =
  | { mode: 'email'; emails: string[]; role: InviteRole; message?: string }
  | { mode: 'user'; userId: string; role: InviteRole; message?: string };

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  invitedBy?: { id: string; name: string | null };
}

export interface InviteCreatedItem {
  invite: TeamInvite;
  emailSent: boolean;
}

export interface InviteCreateResult {
  created: InviteCreatedItem[];
  skipped: Array<{ email: string; reason: string }>;
}

export interface ChangeRolePayload {
  role: InviteRole;
}

export interface TeamUsageMemberRow {
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    avatarUrl: string | null;
  };
  role: TeamRole;
  transcriptionMinutes: number;
  recallHours: number;
  aiCredits: number;
  storageGb: number;
}

export interface TeamUsageLimits {
  transcriptionMinutes: number;
  recallHours: number;
  aiCredits: number;
  storageGb: number;
}

export interface TeamUsageResponse {
  team: { id: string; name: string; slug: string };
  summary: TeamUsageLimits;
  breakdown: TeamUsageMemberRow[];
  ownerLimits: TeamUsageLimits;
  periodStart: string | null;
  resetAt: string | null;
}

// Phase 6 P13 — invitee-side. Returned by GET /teams/me/invites and rendered
// in the workspace switcher dropdown + notifications panel.
export interface MyPendingInvite {
  id: string;
  role: InviteRole;
  expiresAt: string;
  createdAt: string;
  team: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  invitedBy: { id: string; name: string | null } | null;
}

export interface MyPendingInvitesResponse {
  invites: MyPendingInvite[];
}

export const teamService = {
  /** GET /teams — returns the user's active memberships */
  listMyTeams: () => apiClient.get<{ teams: TeamMembership[] }>('/teams'),

  /** POST /teams — create a new team (Pro+ gate enforced server-side) */
  createTeam: (payload: CreateTeamPayload) =>
    apiClient.post<{ team: TeamSummary }>('/teams', payload),

  /** GET /teams/:teamId — full detail of a single team */
  getTeam: (teamId: string) =>
    apiClient.get<{ team: TeamDetail }>(`/teams/${teamId}`),

  /** PATCH /teams/:teamId — update team metadata (Admin+ for most fields; slug requires Owner). */
  updateTeam: (teamId: string, payload: UpdateTeamPayload) =>
    apiClient.patch<{ team: TeamDetail }>(`/teams/${teamId}`, payload),

  /** DELETE /teams/:teamId — Owner-only soft delete. */
  deleteTeam: (teamId: string) => apiClient.delete<void>(`/teams/${teamId}`),

  /** POST /teams/:teamId/transfer-ownership — Owner-only. Requires team name confirmation. */
  transferOwnership: (teamId: string, payload: TransferOwnershipPayload) =>
    apiClient.post<{ team: TeamDetail }>(
      `/teams/${teamId}/transfer-ownership`,
      payload
    ),

  /** DELETE /teams/:teamId/leave — self-leave; Owner is blocked server-side. */
  leaveTeam: (teamId: string) =>
    apiClient.delete<void>(`/teams/${teamId}/leave`),

  /** GET /teams/:teamId/members — list active team members. */
  listMembers: (teamId: string) =>
    apiClient.get<{ members: TeamMemberRow[] }>(`/teams/${teamId}/members`),

  /** POST /teams/:teamId/members/invite — Admin+. Email-mode or user-mode. */
  inviteMembers: (teamId: string, payload: InviteMembersPayload) =>
    apiClient.post<InviteCreateResult>(
      `/teams/${teamId}/members/invite`,
      payload
    ),

  /** GET /teams/:teamId/invites — Admin+. Pending invites only. */
  listInvites: (teamId: string) =>
    apiClient.get<{ invites: TeamInvite[] }>(`/teams/${teamId}/invites`),

  /** POST /teams/:teamId/invites/:inviteId/resend — Admin+. Bumps expiry. */
  resendInvite: (teamId: string, inviteId: string) =>
    apiClient.post<{ invite: TeamInvite; emailSent: boolean }>(
      `/teams/${teamId}/invites/${inviteId}/resend`
    ),

  /** DELETE /teams/:teamId/invites/:inviteId — Admin+. */
  cancelInvite: (teamId: string, inviteId: string) =>
    apiClient.delete<void>(`/teams/${teamId}/invites/${inviteId}`),

  /** PATCH /teams/:teamId/members/:userId — Owner-only. ADMIN | MEMBER only. */
  changeMemberRole: (
    teamId: string,
    userId: string,
    payload: ChangeRolePayload
  ) =>
    apiClient.patch<{ member: TeamMemberRow }>(
      `/teams/${teamId}/members/${userId}`,
      payload
    ),

  /** DELETE /teams/:teamId/members/:userId — Admin+. Owner is protected server-side. */
  removeMember: (teamId: string, userId: string) =>
    apiClient.delete<void>(`/teams/${teamId}/members/${userId}`),

  /** GET /teams/:teamId/usage — Admin+. Per-member breakdown + owner plan limits. */
  getTeamUsage: (teamId: string) =>
    apiClient.get<TeamUsageResponse>(`/teams/${teamId}/usage`),

  /** GET /teams/me/invites — invitee-side pending invites (current user). */
  listMyInvites: () =>
    apiClient.get<MyPendingInvitesResponse>('/teams/me/invites'),

  /** POST /teams/:teamId/invites/accept — invitee-only. Joins the team. */
  acceptInvite: (teamId: string) =>
    apiClient.post<{ membership: TeamMembership }>(
      `/teams/${teamId}/invites/accept`
    ),

  /** POST /teams/:teamId/invites/decline — invitee-only. */
  declineInvite: (teamId: string) =>
    apiClient.post<void>(`/teams/${teamId}/invites/decline`),
};
