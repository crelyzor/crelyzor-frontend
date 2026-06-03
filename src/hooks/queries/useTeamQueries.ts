/**
 * Phase 6 P9 — Team React Query hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  teamService,
  type ChangeRolePayload,
  type ChangeDesignationPayload,
  type CreateTeamPayload,
  type InviteMembersPayload,
  type TransferOwnershipPayload,
  type UpdateTeamPayload,
} from '@/services/teamService';
import { useTeamStore } from '@/stores';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';

export const useMyTeams = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: () => teamService.listMyTeams(),
    staleTime: 60_000,
    enabled: isAuthenticated,
  });
};

export const useTeam = (teamId: string | null) =>
  useQuery({
    queryKey: teamId
      ? queryKeys.teams.detail(teamId)
      : ['teams', 'detail', 'null'],
    queryFn: () => teamService.getTeam(teamId!),
    enabled: !!teamId,
  });

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => teamService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.list() });
      toast.success('Team created');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create team';
      toast.error(msg);
    },
  });
};

export const useUpdateTeam = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTeamPayload) =>
      teamService.updateTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId),
      });
    },
    // Errors are surfaced inline in the form — no toast here.
  });
};

export const useDeleteTeam = (teamId: string) => {
  const queryClient = useQueryClient();
  const { activeTeamId, setActiveTeam } = useTeamStore();
  return useMutation({
    mutationFn: () => teamService.deleteTeam(teamId),
    onSuccess: () => {
      if (activeTeamId === teamId) setActiveTeam(null);
      queryClient.invalidateQueries();
      toast.success('Team deleted');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete team';
      toast.error(msg);
    },
  });
};

export const useTransferOwnership = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferOwnershipPayload) =>
      teamService.transferOwnership(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId),
      });
      toast.success('Ownership transferred');
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Failed to transfer ownership';
      toast.error(msg);
    },
  });
};

export const useLeaveTeam = (teamId: string) => {
  const queryClient = useQueryClient();
  const { activeTeamId, setActiveTeam } = useTeamStore();
  return useMutation({
    mutationFn: () => teamService.leaveTeam(teamId),
    onSuccess: () => {
      if (activeTeamId === teamId) setActiveTeam(null);
      queryClient.invalidateQueries();
      toast.success('Left team');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to leave team';
      toast.error(msg);
    },
  });
};

export const useTeamMembers = (teamId: string | null) =>
  useQuery({
    queryKey: teamId
      ? ['teams', 'members', teamId]
      : ['teams', 'members', 'null'],
    queryFn: () => teamService.listMembers(teamId!),
    enabled: !!teamId,
  });

export const useTeamInvites = (teamId: string | null) =>
  useQuery({
    queryKey: teamId
      ? ['teams', 'invites', teamId]
      : ['teams', 'invites', 'null'],
    queryFn: () => teamService.listInvites(teamId!),
    enabled: !!teamId,
  });

export const useInviteMembers = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMembersPayload) =>
      teamService.inviteMembers(teamId, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'members', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams', 'invites', teamId] });
      const sentCount = result.created.length;
      const skippedCount = result.skipped.length;
      if (sentCount > 0) {
        toast.success(
          `${sentCount} invite${sentCount === 1 ? '' : 's'} sent${
            skippedCount ? ` · ${skippedCount} skipped` : ''
          }`
        );
      } else if (skippedCount > 0) {
        toast.error(`Nothing sent — ${skippedCount} skipped`);
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to send invites';
      toast.error(msg);
    },
  });
};

export const useResendInvite = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      teamService.resendInvite(teamId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'invites', teamId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.myInvites() });
      toast.success('Invite resent');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to resend';
      toast.error(msg);
    },
  });
};

export const useCancelInvite = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      teamService.cancelInvite(teamId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'invites', teamId] });
      toast.success('Invite cancelled');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to cancel';
      toast.error(msg);
    },
  });
};

export const useChangeMemberRole = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: ChangeRolePayload;
    }) => teamService.changeMemberRole(teamId, userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'members', teamId] });
      toast.success('Role updated');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to change role';
      toast.error(msg);
    },
  });
};

export const useUpdateMemberDesignation = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: ChangeDesignationPayload;
    }) => teamService.updateMemberDesignation(teamId, userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'members', teamId] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Failed to update designation';
      toast.error(msg);
    },
  });
};

export const useTeamUsage = (teamId: string | null) =>
  useQuery({
    queryKey: teamId ? ['teams', 'usage', teamId] : ['teams', 'usage', 'null'],
    queryFn: () => teamService.getTeamUsage(teamId!),
    enabled: !!teamId,
  });

export const useRemoveMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamService.removeMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'members', teamId] });
      toast.success('Member removed');
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Failed to remove member';
      toast.error(msg);
    },
  });
};

// ── Phase 6 P13 — invitee-side hooks ─────────────────────────────────────────

export const useMyPendingInvites = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.teams.myInvites(),
    queryFn: () => teamService.listMyInvites(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
};

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  const setActiveTeam = useTeamStore((s) => s.setActiveTeam);
  return useMutation({
    mutationFn: (teamId: string) => teamService.acceptInvite(teamId),
    onSuccess: (_data, teamId) => {
      setActiveTeam(teamId);
      queryClient.invalidateQueries();
      toast.success('Joined team');
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Failed to accept invite';
      toast.error(msg);
    },
  });
};

export const useDeclineInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => teamService.declineInvite(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.myInvites() });
      toast.success('Invite declined');
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Failed to decline invite';
      toast.error(msg);
    },
  });
};

// Phase 6 P14.b — email-flow accept/decline (token-scoped).

export const useAcceptInviteByToken = () => {
  const queryClient = useQueryClient();
  const setActiveTeam = useTeamStore((s) => s.setActiveTeam);
  return useMutation({
    mutationFn: (token: string) => teamService.acceptInviteByToken(token),
    onSuccess: (data) => {
      setActiveTeam(data.membership.team.id);
      queryClient.invalidateQueries();
    },
    // No toast — the InvitePage renders its own success / error states inline.
  });
};

export const useDeclineInviteByToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => teamService.declineInviteByToken(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.myInvites() });
    },
  });
};

// ── Invite link (Phase 6 P16) ─────────────────────────────────────────────

export const useTeamInviteLink = (teamId: string | null) =>
  useQuery({
    queryKey: teamId
      ? queryKeys.teams.inviteLink(teamId)
      : ['teams', 'invite-link', 'null'],
    queryFn: () => teamService.getInviteLink(teamId!),
    enabled: !!teamId,
    staleTime: 30_000,
  });

export const useGenerateInviteLink = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => teamService.generateInviteLink(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.inviteLink(teamId),
      });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Failed to generate link';
      toast.error(msg);
    },
  });
};

export const useRevokeInviteLink = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => teamService.revokeInviteLink(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.inviteLink(teamId),
      });
      toast.success('Invite link revoked');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to revoke link';
      toast.error(msg);
    },
  });
};

export const useJoinByLink = () => {
  const queryClient = useQueryClient();
  const setActiveTeam = useTeamStore((s) => s.setActiveTeam);
  return useMutation({
    mutationFn: (token: string) => teamService.joinByLink(token),
    onSuccess: (data) => {
      setActiveTeam(data.membership.teamId);
      queryClient.invalidateQueries();
    },
    onError: () => {
      // InviteLinkPage renders its own error states inline — no toast here.
    },
  });
};

// ── Phase 6 — Team cards ──────────────────────────────────────────────────────

export const useTeamCards = (teamId: string) =>
  useQuery({
    queryKey: queryKeys.teams.cards(teamId),
    queryFn: () => teamService.getTeamCards(teamId),
    staleTime: 60_000,
    enabled: !!teamId,
  });
