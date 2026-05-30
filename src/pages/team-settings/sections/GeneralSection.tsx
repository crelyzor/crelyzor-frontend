/**
 * Phase 6 P11.a — General tab on Team Settings.
 *
 * Fields:
 *   - Team name (Admin+)
 *   - Team URL slug (Owner-only — disabled with hint for other roles)
 *   - Description (Admin+)
 *   - Logo URL (Admin+) — full upload UX deferred to a later P11.x chunk
 *
 * On Save:
 *   200 → invalidate teams.list + detail, toast "Saved"
 *   403 → inline error on slug (owner-only) or toast for the rest
 *   409 → inline error on slug ("This URL is taken")
 *   other → toast server message
 */
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUpdateTeam } from '@/hooks/queries/useTeamQueries';
import { ApiError } from '@/lib/apiClient';
import { toast } from 'sonner';
import type { TeamRole, TeamSummary } from '@/services/teamService';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface Props {
  teamId: string;
  role: TeamRole;
  team: TeamSummary;
}

export function GeneralSection({ teamId, role, team }: Props) {
  const updateMutation = useUpdateTeam(teamId);

  const isOwner = role === 'OWNER';
  const canEditMost = role === 'OWNER' || role === 'ADMIN';

  const [name, setName] = useState(team.name);
  const [slug, setSlug] = useState(team.slug);
  const [description, setDescription] = useState(team.description ?? '');
  const [logoUrl, setLogoUrl] = useState(team.logoUrl ?? '');
  const [slugError, setSlugError] = useState<string | null>(null);

  // Resync if the team prop changes (e.g. after a successful save).
  useEffect(() => {
    setName(team.name);
    setSlug(team.slug);
    setDescription(team.description ?? '');
    setLogoUrl(team.logoUrl ?? '');
    setSlugError(null);
  }, [team]);

  const slugValid =
    SLUG_REGEX.test(slug) && slug.length >= 1 && slug.length <= 60;
  const nameValid = name.trim().length >= 1 && name.length <= 100;

  const dirty =
    name !== team.name ||
    slug !== team.slug ||
    description !== (team.description ?? '') ||
    logoUrl !== (team.logoUrl ?? '');

  const canSave =
    canEditMost && dirty && nameValid && slugValid && !updateMutation.isPending;

  const handleSave = async () => {
    if (!canSave) return;
    setSlugError(null);
    try {
      await updateMutation.mutateAsync({
        name: name.trim() !== team.name ? name.trim() : undefined,
        slug: slug !== team.slug ? slug : undefined,
        description:
          description !== (team.description ?? '')
            ? description.trim() || null
            : undefined,
        logoUrl:
          logoUrl !== (team.logoUrl ?? '') ? logoUrl.trim() || null : undefined,
      });
      toast.success('Team updated');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setSlugError('This URL is taken — try another.');
          return;
        }
        if (err.status === 403) {
          // Slug change requires Owner — surface inline on slug field.
          if (slug !== team.slug) {
            setSlugError('Only the team owner can change the URL.');
            return;
          }
          toast.error("You don't have permission to make these changes.");
          return;
        }
        const msg =
          (err.data as { message?: string } | null)?.message ??
          'Failed to save changes';
        toast.error(msg);
        return;
      }
      toast.error('Failed to save changes');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="General"
        description="Manage your team's identity."
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-name" className="text-xs font-medium">
              Team name
            </Label>
            <Input
              id="team-name"
              maxLength={100}
              value={name}
              disabled={!canEditMost}
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
                disabled={!isOwner}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase());
                  setSlugError(null);
                }}
                className="flex-1"
              />
            </div>
            {!isOwner && (
              <p className="text-[11px] text-muted-foreground">
                Only the team owner can change the URL.
              </p>
            )}
            {isOwner && slug && !slugValid && (
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
              disabled={!canEditMost}
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
              disabled={!canEditMost}
              placeholder="https://…"
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" disabled={!canSave} onClick={handleSave}>
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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
