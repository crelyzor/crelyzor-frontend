/**
 * Phase 6 P11.b — Invite members Dialog (email-mode).
 *
 * Chip-style email input. Press Enter or comma to add. Backspace deletes
 * the last chip. Role select + optional message. Submits up to 10 emails
 * per batch (server cap).
 *
 * User-mode (typeahead existing users) deferred until a user-search
 * endpoint exists.
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInviteMembers } from '@/hooks/queries/useTeamQueries';
import type { InviteRole } from '@/services/teamService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMembersModal({
  teamId,
  open,
  onOpenChange,
}: {
  teamId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const inviteMutation = useInviteMembers(teamId);

  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [role, setRole] = useState<InviteRole>('MEMBER');
  const [message, setMessage] = useState('');

  const commit = (raw: string): boolean => {
    const v = raw.trim().toLowerCase();
    if (!v) return false;
    if (!EMAIL_REGEX.test(v)) return false;
    if (emails.includes(v)) return false;
    if (emails.length >= 10) return false;
    setEmails((prev) => [...prev, v]);
    return true;
  };

  const removeChip = (email: string) =>
    setEmails((prev) => prev.filter((e) => e !== email));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (commit(draft)) setDraft('');
    } else if (e.key === 'Backspace' && !draft && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (commit(draft)) setDraft('');
  };

  const reset = () => {
    setEmails([]);
    setDraft('');
    setRole('MEMBER');
    setMessage('');
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const canSubmit =
    emails.length > 0 && emails.length <= 10 && !inviteMutation.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await inviteMutation.mutateAsync({
        mode: 'email',
        emails,
        role,
        message: message.trim() || undefined,
      });
      close();
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Invite members
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Send an invite by email. Up to 10 at a time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Email chip input */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">Email addresses</Label>
            <div className="min-h-[42px] flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-md border border-input bg-transparent">
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[12px] text-neutral-700 dark:text-neutral-200"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeChip(email)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKey}
                onBlur={handleBlur}
                placeholder={emails.length === 0 ? 'name@example.com' : ''}
                className="flex-1 min-w-[140px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {emails.length}/10 — press Enter or comma to add
            </p>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as InviteRole)}
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">
              Personal note{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              value={message}
              maxLength={200}
              rows={3}
              placeholder="Hey! Join our workspace…"
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {message.length}/200
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={close}
            disabled={inviteMutation.isPending}
          >
            Cancel
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={handleSubmit}>
            {inviteMutation.isPending
              ? 'Sending…'
              : `Send ${emails.length || ''} invite${emails.length === 1 ? '' : 's'}`.trim()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
