/**
 * Phase 6 P11.a — Danger zone on Team Settings.
 *
 * Actions:
 *   - **Leave team** (members only) — `DELETE /teams/:teamId/leave`
 *   - **Transfer ownership** (owner only) — Dialog with target select +
 *     team-name confirmation → `POST /teams/:teamId/transfer-ownership`
 *   - **Delete team** (owner only) — Dialog with team-name confirmation →
 *     `DELETE /teams/:teamId`
 *
 * Post-success: setActiveTeam(null) → navigate('/') so the stale scope
 * doesn't trigger 403s on the next request.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowRightLeft, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeamStore } from '@/stores';
import {
  useDeleteTeam,
  useLeaveTeam,
  useTeamMembers,
  useTransferOwnership,
} from '@/hooks/queries/useTeamQueries';
import type { TeamRole, TeamSummary } from '@/services/teamService';

interface Props {
  teamId: string;
  role: TeamRole;
  team: TeamSummary;
}

export function DangerSection({ teamId, role, team }: Props) {
  const navigate = useNavigate();
  const setActiveTeam = useTeamStore((s) => s.setActiveTeam);

  const isOwner = role === 'OWNER';

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const leaveMutation = useLeaveTeam(teamId);
  const transferMutation = useTransferOwnership(teamId);
  const deleteMutation = useDeleteTeam(teamId);

  const resetAndGoHome = () => {
    setActiveTeam(null);
    navigate('/', { replace: true });
  };

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync();
      setLeaveOpen(false);
      resetAndGoHome();
    } catch {
      /* toast handled in hook */
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      setDeleteOpen(false);
      resetAndGoHome();
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Danger zone"
        description="Irreversible actions that change your access to this team."
      />

      <Card className="border-red-200 dark:border-red-900/40">
        <CardContent className="p-0 divide-y divide-red-100 dark:divide-red-950/40">
          {!isOwner && (
            <DangerRow
              icon={LogOut}
              title="Leave this team"
              description="You'll lose access to everything in this workspace."
              actionLabel="Leave team"
              onClick={() => setLeaveOpen(true)}
            />
          )}

          {isOwner && (
            <DangerRow
              icon={ArrowRightLeft}
              title="Transfer ownership"
              description="Pick a current admin or member to become the new owner. You'll become an admin."
              actionLabel="Transfer…"
              onClick={() => setTransferOpen(true)}
            />
          )}

          {isOwner && (
            <DangerRow
              icon={Trash2}
              title="Delete this team"
              description="Soft-deletes the team and all of its content. This cannot be reversed without admin support."
              actionLabel="Delete team"
              destructive
              onClick={() => setDeleteOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      <LeaveDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        teamName={team.name}
        pending={leaveMutation.isPending}
        onConfirm={handleLeave}
      />

      {isOwner && (
        <TransferDialog
          open={transferOpen}
          onOpenChange={setTransferOpen}
          teamId={teamId}
          teamName={team.name}
          pending={transferMutation.isPending}
          onConfirm={async (targetUserId, teamNameConfirm) => {
            try {
              await transferMutation.mutateAsync({
                targetUserId,
                teamNameConfirm,
              });
              setTransferOpen(false);
              resetAndGoHome();
            } catch {
              /* toast handled in hook */
            }
          }}
        />
      )}

      {isOwner && (
        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          teamName={team.name}
          pending={deleteMutation.isPending}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// ── Reusable bits ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
        {description}
      </p>
    </div>
  );
}

function DangerRow({
  icon: Icon,
  title,
  description,
  actionLabel,
  onClick,
  destructive,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-red-500 dark:text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {title}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {description}
        </p>
      </div>
      <Button
        size="sm"
        variant={destructive ? 'destructive' : 'outline'}
        onClick={onClick}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

// ── Leave ───────────────────────────────────────────────────────────────────

function LeaveDialog({
  open,
  onOpenChange,
  teamName,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teamName: string;
  pending: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Leave {teamName}?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            You'll lose access to everything in this workspace until someone
            invites you back.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? 'Leaving…' : 'Leave team'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Transfer ────────────────────────────────────────────────────────────────

function TransferDialog({
  open,
  onOpenChange,
  teamId,
  teamName,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teamId: string;
  teamName: string;
  pending: boolean;
  onConfirm: (targetUserId: string, teamNameConfirm: string) => void;
}) {
  const { data: membersData, isLoading } = useTeamMembers(open ? teamId : null);
  const targets = membersData?.members.filter((m) => m.role !== 'OWNER') ?? [];

  const [targetUserId, setTargetUserId] = useState<string>('');
  const [confirm, setConfirm] = useState('');

  const canConfirm = !!targetUserId && confirm === teamName && !pending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Transfer ownership of {teamName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            The new owner pays for all team consumption. You'll be moved to
            Admin. This cannot be undone except by another transfer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">New owner</Label>
            {isLoading ? (
              <div className="h-9 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            ) : targets.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                No other members to transfer to. Invite someone first.
              </p>
            ) : (
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="">Choose a member…</option>
                {targets.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name ?? m.user.email} ({m.role.toLowerCase()})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">
              Type the team name to confirm
            </Label>
            <Input
              value={confirm}
              placeholder={teamName}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!canConfirm}
            onClick={() => onConfirm(targetUserId, confirm)}
          >
            {pending ? 'Transferring…' : 'Transfer ownership'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete ──────────────────────────────────────────────────────────────────

function DeleteDialog({
  open,
  onOpenChange,
  teamName,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teamName: string;
  pending: boolean;
  onConfirm: () => void;
}) {
  const [confirm, setConfirm] = useState('');
  const canConfirm = confirm === teamName && !pending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Delete {teamName}?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Soft-deletes the team and every member's access. Cards, meetings,
            and tasks scoped to this team will no longer be visible.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Label className="text-xs font-medium">
            Type the team name to confirm
          </Label>
          <Input
            value={confirm}
            placeholder={teamName}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {pending ? 'Deleting…' : 'Delete team'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
