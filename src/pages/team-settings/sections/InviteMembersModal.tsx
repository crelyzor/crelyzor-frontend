/**
 * Phase 6 P11.b — Invite members dialog.
 *
 * Supports two modes:
 *  - "email"  → chip-style email input (original behaviour). Press Enter or
 *               comma to add. Backspace deletes the last chip.
 *  - "user"   → typeahead search against GET /users/search?q=. Selected users
 *               appear as chips. Submits one inviteMembers call per user
 *               (backend user-mode is single-userId per request).
 *
 * Role select + optional message are shared across both modes.
 * Switching mode resets only the relevant selection state.
 */
import { useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInviteMembers } from '@/hooks/queries/useTeamQueries';
import type { InviteRole } from '@/services/teamService';
import { userApi, type UserSearchResult } from '@/services/userService';
import { cn } from '@/lib/utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SELECTIONS = 10;

type InviteMode = 'email' | 'user';

// ── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[12px] text-neutral-700 dark:text-neutral-200">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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

  // ── Shared state ─────────────────────────────────────────────────────────
  const [mode, setMode] = useState<InviteMode>('email');
  const [role, setRole] = useState<InviteRole>('MEMBER');
  const [message, setMessage] = useState('');

  // ── Email-mode state ─────────────────────────────────────────────────────
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState('');

  // ── User-mode state ──────────────────────────────────────────────────────
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false); // true after first search completes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Email-mode helpers ───────────────────────────────────────────────────

  const commitEmail = (raw: string): boolean => {
    const v = raw.trim().toLowerCase();
    if (!v) return false;
    if (!EMAIL_REGEX.test(v)) return false;
    if (emails.includes(v)) return false;
    if (emails.length >= MAX_SELECTIONS) return false;
    setEmails((prev) => [...prev, v]);
    return true;
  };

  const removeEmail = (email: string) =>
    setEmails((prev) => prev.filter((e) => e !== email));

  const handleEmailKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (commitEmail(draft)) setDraft('');
    } else if (e.key === 'Backspace' && !draft && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleEmailBlur = () => {
    if (commitEmail(draft)) setDraft('');
  };

  // ── User-mode helpers ────────────────────────────────────────────────────

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await userApi.search(q.trim());
        // Filter out already-selected users
        const selectedIds = new Set(selectedUsers.map((u) => u.id));
        setResults(
          (data.users ?? []).filter((u) => !selectedIds.has(u.id)).slice(0, 5)
        );
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const selectUser = (user: UserSearchResult) => {
    if (selectedUsers.length >= MAX_SELECTIONS) return;
    if (selectedUsers.find((u) => u.id === user.id)) return;
    setSelectedUsers((prev) => [...prev, user]);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const removeUser = (id: string) =>
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));

  // ── Mode toggle ──────────────────────────────────────────────────────────

  const switchMode = (next: InviteMode) => {
    if (next === mode) return;
    setMode(next);
    // Reset only the mode-specific state
    if (next === 'email') {
      setSelectedUsers([]);
      setQuery('');
      setResults([]);
      setSearched(false);
    } else {
      setEmails([]);
      setDraft('');
    }
  };

  // ── Reset + close ────────────────────────────────────────────────────────

  const reset = () => {
    setEmails([]);
    setDraft('');
    setSelectedUsers([]);
    setQuery('');
    setResults([]);
    setSearched(false);
    setRole('MEMBER');
    setMessage('');
    setMode('email');
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const canSubmit =
    !inviteMutation.isPending &&
    (mode === 'email'
      ? emails.length > 0 && emails.length <= MAX_SELECTIONS
      : selectedUsers.length > 0 && selectedUsers.length <= MAX_SELECTIONS);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (mode === 'email') {
        await inviteMutation.mutateAsync({
          mode: 'email',
          emails,
          role,
          message: message.trim() || undefined,
        });
      } else {
        // Backend accepts one userId per request — fire in parallel.
        await Promise.all(
          selectedUsers.map((u) =>
            inviteMutation.mutateAsync({
              mode: 'user',
              userId: u.id,
              role,
              message: message.trim() || undefined,
            })
          )
        );
      }
      close();
    } catch {
      /* toast handled in hook */
    }
  };

  // ── Derived labels ────────────────────────────────────────────────────────

  const selectionCount =
    mode === 'email' ? emails.length : selectedUsers.length;
  const sendLabel = inviteMutation.isPending
    ? 'Sending…'
    : `Send ${selectionCount || ''} invite${selectionCount === 1 ? '' : 's'}`.trim();

  const showDropdown = query.trim().length > 0 && (searching || searched);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Invite members
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {mode === 'email'
              ? 'Send an invite by email. Up to 10 at a time.'
              : 'Search by name and add up to 10 existing users.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* ── Mode toggle ─────────────────────────────────────────────── */}
          <div className="flex gap-1 p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <button
              type="button"
              className={cn(
                'flex-1 py-1 text-xs rounded-md transition-colors',
                mode === 'email'
                  ? 'bg-white dark:bg-neutral-700 shadow-sm font-medium'
                  : 'text-muted-foreground'
              )}
              onClick={() => switchMode('email')}
            >
              By email
            </button>
            <button
              type="button"
              className={cn(
                'flex-1 py-1 text-xs rounded-md transition-colors',
                mode === 'user'
                  ? 'bg-white dark:bg-neutral-700 shadow-sm font-medium'
                  : 'text-muted-foreground'
              )}
              onClick={() => switchMode('user')}
            >
              By name
            </button>
          </div>

          {/* ── Email-mode chip input ────────────────────────────────────── */}
          {mode === 'email' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Email addresses</Label>
              <div className="min-h-[42px] flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-md border border-input bg-transparent">
                {emails.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onRemove={() => removeEmail(email)}
                  />
                ))}
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleEmailKey}
                  onBlur={handleEmailBlur}
                  placeholder={emails.length === 0 ? 'name@example.com' : ''}
                  className="flex-1 min-w-[140px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {emails.length}/10 — press Enter or comma to add
              </p>
            </div>
          )}

          {/* ── User-mode search ─────────────────────────────────────────── */}
          {mode === 'user' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Search users</Label>

              {/* Selected user chips */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedUsers.map((user) => (
                    <Chip
                      key={user.id}
                      label={user.name}
                      onRemove={() => removeUser(user.id)}
                    />
                  ))}
                </div>
              )}

              {/* Search input + dropdown */}
              <div className="relative">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-input bg-transparent">
                  {searching && (
                    <Loader2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 animate-spin" />
                  )}
                  <input
                    value={query}
                    onChange={handleQueryChange}
                    placeholder={
                      selectedUsers.length < MAX_SELECTIONS
                        ? 'Type a name or email…'
                        : 'Max 10 selected'
                    }
                    disabled={selectedUsers.length >= MAX_SELECTIONS}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed"
                  />
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
                    {searching && results.length === 0 ? (
                      <p className="px-3 py-2.5 text-xs text-muted-foreground">
                        Searching…
                      </p>
                    ) : results.length > 0 ? (
                      results.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectUser(user)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={user.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                              {initials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 min-w-0 text-sm font-medium truncate">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate shrink-0">
                            @{user.username ?? user.email}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2.5 text-xs text-muted-foreground">
                        No users found
                      </p>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground">
                {selectedUsers.length}/10 selected
              </p>
            </div>
          )}

          {/* ── Role ──────────────────────────────────────────────────────── */}
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

          {/* ── Message ───────────────────────────────────────────────────── */}
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
            {sendLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
