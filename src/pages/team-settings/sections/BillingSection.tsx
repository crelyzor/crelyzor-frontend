/**
 * Phase 6 P11.c — Team Billing tab.
 *
 * All team consumption is billed to the team owner's plan. This tab makes
 * that explicit and links the Owner (if they're viewing) to their personal
 * billing flow. Admins/Members see a read-only attribution copy.
 */
import { useNavigate } from 'react-router-dom';
import { CreditCard, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlanBadge } from '@/components/PlanBadge';
import { useTeam } from '@/hooks/queries/useTeamQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import type { TeamRole } from '@/services/teamService';

interface Props {
  teamId: string;
  role: TeamRole;
}

export function BillingSection({ teamId, role }: Props) {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: teamData, isLoading } = useTeam(teamId);
  const team = teamData?.team;

  const ownerName = team?.owner?.name ?? team?.owner?.email ?? 'the team owner';
  const ownerPlan = team?.owner?.plan ?? 'FREE';
  const isViewerOwner =
    role === 'OWNER' || (user && team && user.id === team.ownerId);

  if (isLoading || !team) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Billing"
          description="How this team's consumption is paid for."
        />
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6">
            <div className="h-4 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse mb-3" />
            <div className="h-3 w-1/3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Billing"
        description="How this team's consumption is paid for."
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {isViewerOwner
                    ? "You're paying for this team's consumption"
                    : `${ownerName} pays for this team's consumption`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Every transcription, AI credit, Recall hour, and stored byte
                  on this team counts against the owner's plan limits.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              {ownerPlan === 'FREE' ? (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  Free plan
                </span>
              ) : (
                <PlanBadge plan={ownerPlan} />
              )}
            </div>
          </div>

          {isViewerOwner && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/settings?tab=billing')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Manage billing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {role === 'OWNER' && ownerPlan === 'FREE' && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              You're on the Free plan
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              Team workspaces are typically only available to Pro and Business
              accounts. If you're seeing this, the team was created during a
              trial or manually by admin.
            </p>
          </CardContent>
        </Card>
      )}
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
