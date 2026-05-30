/**
 * Phase 6 P11.b — Members tab.
 *
 * Roster table:
 *   - Avatar + name/email
 *   - Role (badge for non-Owner; OWNER can inline-change to ADMIN/MEMBER via select)
 *   - Joined date (relative)
 *   - Kebab (Admin+ only, hidden on OWNER row and on self-row) → "Remove…"
 *
 * Header has "Invite member" button (Admin+).
 */
import { useState } from 'react';
import { MoreVertical, Plus, Users2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useChangeMemberRole,
  useRemoveMember,
  useTeamMembers,
} from '@/hooks/queries/useTeamQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { InviteMembersModal } from './InviteMembersModal';
import type {
  InviteRole,
  TeamMemberRow,
  TeamRole,
} from '@/services/teamService';

const ROLE_RANK: Record<TeamRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

const ROLE_BADGE: Record<TeamRole, string> = {
  OWNER:
    'inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-neutral-700 dark:text-neutral-200',
  ADMIN:
    'inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-neutral-500 dark:text-neutral-400',
  MEMBER:
    'inline-flex items-center rounded-full border border-transparent bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-neutral-500 dark:text-neutral-400',
};

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

interface Props {
  teamId: string;
  role: TeamRole;
}

export function MembersSection({ teamId, role }: Props) {
  const { data: user } = useCurrentUser();
  const { data: membersData, isLoading } = useTeamMembers(teamId);
  const [inviteOpen, setInviteOpen] = useState(false);

  const canInvite = role === 'OWNER' || role === 'ADMIN';
  const members = membersData?.members ?? [];

  const sorted = [...members].sort((a, b) => {
    const r = ROLE_RANK[b.role] - ROLE_RANK[a.role];
    if (r !== 0) return r;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SectionHeader
          title="Members"
          description={
            isLoading
              ? ''
              : `${members.length} active member${members.length === 1 ? '' : 's'}`
          }
        />
        {canInvite && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Invite member
          </Button>
        )}
      </div>

      {isLoading ? (
        <MembersSkeleton />
      ) : members.length === 0 ? (
        <EmptyMembers
          onInvite={() => setInviteOpen(true)}
          canInvite={canInvite}
        />
      ) : (
        <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sorted.map((m) => (
              <MemberRow
                key={m.id}
                teamId={teamId}
                viewerRole={role}
                viewerUserId={user?.id ?? null}
                member={m}
              />
            ))}
          </ul>
        </Card>
      )}

      <InviteMembersModal
        teamId={teamId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────

function MemberRow({
  teamId,
  viewerRole,
  viewerUserId,
  member,
}: {
  teamId: string;
  viewerRole: TeamRole;
  viewerUserId: string | null;
  member: TeamMemberRow;
}) {
  const isSelf = viewerUserId === member.user.id;
  const isOwnerRow = member.role === 'OWNER';
  const canChangeRole = viewerRole === 'OWNER' && !isOwnerRow && !isSelf;
  const canRemove =
    !isOwnerRow &&
    !isSelf &&
    (viewerRole === 'OWNER' || viewerRole === 'ADMIN');

  const initials = (member.user.name ?? member.user.email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {/* Avatar */}
      {member.user.avatarUrl ? (
        <img
          src={member.user.avatarUrl}
          alt={member.user.name ?? member.user.email}
          className="w-7 h-7 rounded-full object-cover shrink-0"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 shrink-0">
          {initials}
        </div>
      )}

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {member.user.name ?? '—'}{' '}
          {isSelf && (
            <span className="text-[10px] text-muted-foreground">(you)</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {member.user.email}
        </p>
      </div>

      {/* Role */}
      <div className="shrink-0">
        {canChangeRole ? (
          <RoleSelect
            teamId={teamId}
            userId={member.user.id}
            currentRole={member.role}
          />
        ) : (
          <span className={ROLE_BADGE[member.role]}>{member.role}</span>
        )}
      </div>

      {/* Joined */}
      <span className="text-[11px] text-muted-foreground shrink-0 w-24 text-right hidden sm:block">
        {relativeTime(member.joinedAt)}
      </span>

      {/* Kebab */}
      <div className="shrink-0 w-8 flex items-center justify-end">
        {canRemove && <RemoveMember teamId={teamId} member={member} />}
      </div>
    </li>
  );
}

function RoleSelect({
  teamId,
  userId,
  currentRole,
}: {
  teamId: string;
  userId: string;
  currentRole: TeamRole;
}) {
  const changeMutation = useChangeMemberRole(teamId);
  return (
    <select
      value={currentRole === 'OWNER' ? 'ADMIN' : currentRole}
      disabled={changeMutation.isPending}
      onChange={(e) =>
        changeMutation.mutate({
          userId,
          payload: { role: e.target.value as InviteRole },
        })
      }
      className="h-7 rounded-md border border-input bg-transparent px-2 text-xs"
    >
      <option value="MEMBER">Member</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}

function RemoveMember({
  teamId,
  member,
}: {
  teamId: string;
  member: TeamMemberRow;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeMutation = useRemoveMember(teamId);

  const handleConfirm = async () => {
    try {
      await removeMutation.mutateAsync(member.user.id);
      setConfirmOpen(false);
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Remove member"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Remove {member.user.name ?? member.user.email}?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              They'll lose access to this workspace immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmOpen(false)}
              disabled={removeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={removeMutation.isPending}
              onClick={handleConfirm}
            >
              {removeMutation.isPending ? 'Removing…' : 'Remove member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Empty + skeleton + header ───────────────────────────────────────────────

function EmptyMembers({
  onInvite,
  canInvite,
}: {
  onInvite: () => void;
  canInvite: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
      <Users2 className="w-10 h-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium">Just you for now</p>
      <p className="text-xs text-muted-foreground mt-1">
        Invite your team to start collaborating.
      </p>
      {canInvite && (
        <Button size="sm" className="mt-4" onClick={onInvite}>
          <Plus className="w-3.5 h-3.5" /> Invite member
        </Button>
      )}
    </div>
  );
}

function MembersSkeleton() {
  return (
    <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-1/3" />
              <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
            </div>
            <div className="h-5 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

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
