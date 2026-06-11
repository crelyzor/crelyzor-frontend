/**
 * Phase 6 P10 — Create Team modal.
 *
 * Renders inside a Dialog. Handles four submit outcomes:
 *   201 → setActiveTeam(newTeam.id), toast, navigate "/"
 *   402 → close modal, openUpgradeModal('FEATURE_GATE')
 *   409 → inline error on slug field
 *   other → toast server message
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateTeam } from '@/hooks/queries/useTeamQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { useTeamStore, useUIStore } from '@/stores';
import { ApiError } from '@/lib/apiClient';
import { teamService } from '@/services/teamService';
import { toast } from 'sonner';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamModal({ open, onOpenChange }: CreateTeamModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const { setActiveTeam } = useTeamStore();
  const openUpgradeModal = useUIStore((s) => s.openUpgradeModal);
  const createMutation = useCreateTeam();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state every time the modal closes so a future re-open starts clean.
  useEffect(() => {
    if (!open) {
      setName('');
      setSlug('');
      setSlugManuallyEdited(false);
      setDescription('');
      setLogoUrl('');
      setSlugError(null);
      setSlugAvailable(null);
      setSlugChecking(false);
    }
  }, [open]);

  // Auto-derive slug from name unless the user has touched the slug field.
  useEffect(() => {
    if (!slugManuallyEdited) setSlug(slugify(name));
  }, [name, slugManuallyEdited]);

  // Debounced slug availability check — fires 500ms after the slug stabilises.
  useEffect(() => {
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    setSlugAvailable(null);

    if (!SLUG_REGEX.test(slug) || slug.length < 1) return;

    setSlugChecking(true);
    slugCheckTimer.current = setTimeout(async () => {
      try {
        const res = await teamService.checkSlug(slug);
        setSlugAvailable(res.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);

    return () => {
      if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    };
  }, [slug]);

  const slugValid =
    SLUG_REGEX.test(slug) && slug.length >= 1 && slug.length <= 60;
  const nameValid = name.trim().length >= 1 && name.length <= 100;
  const canSubmit =
    nameValid &&
    slugValid &&
    slugAvailable !== false &&
    !slugChecking &&
    !createMutation.isPending;

  const isFreeUser = !user?.plan || user.plan === 'FREE';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSlugError(null);

    try {
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
      });
      const newTeamId = result.team.id;

      setActiveTeam(newTeamId);
      queryClient.invalidateQueries();
      onOpenChange(false);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        // 402 is already handled by the apiClient interceptor (opens
        // UpgradeModal). Close our modal so the upgrade flow isn't stacked.
        if (err.status === 402) {
          onOpenChange(false);
          // Safety net in case the interceptor missed:
          openUpgradeModal('FEATURE_GATE');
          return;
        }
        if (err.status === 409) {
          setSlugError('This URL is taken — try another.');
          return;
        }
        const msg =
          (err.data as { message?: string } | null)?.message ??
          'Failed to create workspace';
        toast.error(msg);
        return;
      }
      toast.error('Failed to create workspace');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-neutral-100 dark:bg-white/5 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Create your workspace
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            A team workspace gets its own meetings, cards, tasks, and scheduling
            — separate from your personal space.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-name" className="text-xs font-medium">
              Team name
            </Label>
            <Input
              id="team-name"
              autoFocus
              maxLength={100}
              value={name}
              placeholder="Acme Inc."
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-slug" className="text-xs font-medium">
              Team URL
            </Label>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-muted-foreground select-none">
                crelyzor.app/t/
              </span>
              <Input
                id="team-slug"
                maxLength={60}
                value={slug}
                placeholder="acme"
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase());
                  setSlugManuallyEdited(true);
                  setSlugError(null);
                }}
                className="flex-1"
              />
              {slugValid && (
                <span className="text-[11px] shrink-0">
                  {slugChecking ? (
                    <span className="text-muted-foreground">checking…</span>
                  ) : slugAvailable === true ? (
                    <span className="text-green-600 dark:text-green-400">available</span>
                  ) : slugAvailable === false ? (
                    <span className="text-red-500 dark:text-red-400">taken</span>
                  ) : null}
                </span>
              )}
            </div>
            {slug && !slugValid && (
              <p className="text-[11px] text-red-500 dark:text-red-400">
                URLs use lowercase letters, numbers, and hyphens.
              </p>
            )}
            {slugError && (
              <p className="text-[11px] text-red-500 dark:text-red-400">
                {slugError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-description" className="text-xs font-medium">
              Description{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="team-description"
              maxLength={500}
              value={description}
              rows={3}
              placeholder="What's this workspace for?"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-logo" className="text-xs font-medium">
              Logo URL <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="team-logo"
              type="url"
              value={logoUrl}
              placeholder="https://…"
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          {isFreeUser && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] text-muted-foreground bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] rounded-lg px-3 py-2"
            >
              Teams are a Pro feature. You'll be prompted to upgrade when you
              create your first workspace.
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {createMutation.isPending ? 'Creating…' : 'Create workspace'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
