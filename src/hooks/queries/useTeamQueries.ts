/**
 * Phase 6 P9 — Team React Query hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  teamService,
  type ChangeRolePayload,
  type CreateTeamPayload,
  type InviteMembersPayload,
  type TransferOwnershipPayload,
  type UpdateTeamPayload,
} from '@/services/teamService';
import { toast } from 'sonner';

export const useMyTeams = () =>
  useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: () => teamService.listMyTeams(),
    staleTime: 60_000,
  });

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
  return useMutation({
    mutationFn: () => teamService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.list() });
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
  return useMutation({
    mutationFn: () => teamService.leaveTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.list() });
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
