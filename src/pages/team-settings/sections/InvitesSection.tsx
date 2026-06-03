/**
 * Phase 6 P11.b — Invites tab.
 *
 * Lists pending invites; per-row Resend + Cancel.
 */
import { useState } from 'react';
import {
  Copy,
  Link,
  Mail,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  useCancelInvite,
  useGenerateInviteLink,
  useResendInvite,
  useRevokeInviteLink,
  useTeamInviteLink,
  useTeamInvites,
} from '@/hooks/queries/useTeamQueries';
import type { TeamInvite, TeamRole } from '@/services/teamService';

const ROLE_BADGE: Record<TeamRole, string> = {
  OWNER:
    'inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-neutral-700 dark:text-neutral-200',
  ADMIN:
    'inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-neutral-500 dark:text-neutral-400',
  MEMBER:
    'inline-flex items-center rounded-full border border-transparent bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-neutral-500 dark:text-neutral-400',
};

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function expiryLabel(iso: string): { label: string; expired: boolean } {
  const expires = new Date(iso);
  const diffMs = expires.getTime() - Date.now();
  const days = Math.ceil(diffMs / 86_400_000);
  if (days < 0) return { label: 'expired', expired: true };
  if (days === 0) return { label: 'expires today', expired: false };
  if (days === 1) return { label: 'expires tomorrow', expired: false };
  return { label: `expires in ${days} days`, expired: false };
}

function InviteLinkCard({ teamId }: { teamId: string }) {
  const { data: linkData, isLoading } = useTeamInviteLink(teamId);
  const generateMutation = useGenerateInviteLink(teamId);
  const revokeMutation = useRevokeInviteLink(teamId);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const handleCopy = () => {
    if (!linkData?.linkUrl) return;
    navigator.clipboard.writeText(linkData.linkUrl).then(() => {
      toast.success('Link copied to clipboard');
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 animate-pulse">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-24 mb-3" />
        <div className="h-8 bg-neutral-100 dark:bg-neutral-900 rounded-lg w-full" />
      </div>
    );
  }

  const hasLink = linkData?.enabled && linkData.linkUrl;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">
            Invite link
          </span>
        </div>
        {hasLink && !confirmRevoke && (
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400 h-6 px-2"
            onClick={() => setConfirmRevoke(true)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Revoke
          </Button>
        )}
      </div>

      {hasLink ? (
        <>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={linkData.linkUrl!}
              className="text-xs h-8 font-mono bg-neutral-50 dark:bg-neutral-900 cursor-default select-all"
              onFocus={(e) => e.target.select()}
            />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleCopy}
              title="Copy link"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              title="Regenerate link"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Anyone with this link can join as a member. Regenerating immediately
            invalidates the old link.
          </p>
          {confirmRevoke && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground flex-1">
                Revoke this link? Anyone who has it won't be able to join.
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setConfirmRevoke(false)}
                className="h-6 px-2 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="xs"
                onClick={() =>
                  revokeMutation.mutate(undefined, {
                    onSuccess: () => setConfirmRevoke(false),
                  })
                }
                disabled={revokeMutation.isPending}
                className="h-6 px-2 text-xs"
              >
                {revokeMutation.isPending ? 'Revoking…' : 'Revoke'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Generate a link anyone can use to join this team.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="h-7 text-xs shrink-0 ml-3"
          >
            {generateMutation.isPending ? 'Generating…' : 'Generate link'}
          </Button>
        </div>
      )}
    </div>
  );
}

interface Props {
  teamId: string;
  role: TeamRole;
}

export function InvitesSection({ teamId, role }: Props) {
  const canManage = role === 'OWNER' || role === 'ADMIN';
  const { data: invitesData, isLoading } = useTeamInvites(
    canManage ? teamId : null
  );
  const invites = invitesData?.invites ?? [];

  if (!canManage) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Pending invites"
          description="Only owners and admins can see pending invites."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pending invites"
        description={
          isLoading
            ? ''
            : `${invites.length} pending invite${invites.length === 1 ? '' : 's'}`
        }
      />

      {canManage && <InviteLinkCard teamId={teamId} />}

      {isLoading ? (
        <InvitesSkeleton />
      ) : invites.length === 0 ? (
        <EmptyInvites />
      ) : (
        <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {invites.map((invite) => (
              <InviteRow key={invite.id} teamId={teamId} invite={invite} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function InviteRow({ teamId, invite }: { teamId: string; invite: TeamInvite }) {
  const resendMutation = useResendInvite(teamId);
  const cancelMutation = useCancelInvite(teamId);
  const expiry = expiryLabel(invite.expiresAt);
  const initial = invite.email[0]?.toUpperCase() ?? '?';

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 shrink-0">
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {invite.email}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          Sent {formatDateShort(invite.createdAt)} ·{' '}
          <span
            className={expiry.expired ? 'text-red-500 dark:text-red-400' : ''}
          >
            {expiry.label}
          </span>
        </p>
      </div>

      <span className={ROLE_BADGE[invite.role]}>{invite.role}</span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => resendMutation.mutate(invite.id)}
          disabled={resendMutation.isPending}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          aria-label="Resend invite"
          title="Resend"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => cancelMutation.mutate(invite.id)}
          disabled={cancelMutation.isPending}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
          aria-label="Cancel invite"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  );
}

// ── Empty + skeleton + header ───────────────────────────────────────────────

function EmptyInvites() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
      <Mail className="w-10 h-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium">No pending invites</p>
      <p className="text-xs text-muted-foreground mt-1">
        Invite people from the Members tab.
      </p>
    </div>
  );
}

function InvitesSkeleton() {
  return (
    <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {Array.from({ length: 2 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-1/3" />
              <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
            </div>
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
