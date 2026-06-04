/**
 * Phase 6 P11.a — Team settings page.
 *
 * URL: /teams/:teamId/settings?tab=<general|members|invites|usage|billing|danger>
 *
 * Vertical sidebar nav (md+) + horizontal pill nav (mobile) mirrors the
 * existing /settings page exactly. General + Danger tabs are wired; the
 * other four ship as "Coming in P11.b" stubs so the navigation surface is
 * complete and reviewable.
 */
import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Users,
  Mail,
  BarChart3,
  CreditCard,
  TriangleAlert,
  LayoutList,
} from 'lucide-react';
import { PageMotion } from '@/components/PageMotion';
import { useMyTeams } from '@/hooks/queries/useTeamQueries';
import { GeneralSection } from './sections/GeneralSection';
import { DangerSection } from './sections/DangerSection';
import { MembersSection } from './sections/MembersSection';
import { InvitesSection } from './sections/InvitesSection';
import { CardsSection } from './sections/CardsSection';
import { TeamEventTypesSection } from './sections/TeamEventTypesSection';
import { UsageSection } from './sections/UsageSection';
import { BillingSection } from './sections/BillingSection';

type TeamSettingsSection =
  | 'general'
  | 'members'
  | 'invites'
  | 'cards'
  | 'event-types'
  | 'usage'
  | 'billing'
  | 'danger';

const SECTIONS: Array<{
  id: TeamSettingsSection;
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'invites', label: 'Invites', icon: Mail },
  { id: 'cards', label: 'Cards', icon: CreditCard },
  { id: 'event-types', label: 'Event Types', icon: LayoutList },
  { id: 'usage', label: 'Usage', icon: BarChart3 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'danger', label: 'Danger zone', icon: TriangleAlert },
];

export default function TeamSettings() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSection = (searchParams.get('tab') ??
    'general') as TeamSettingsSection;
  const setActiveSection = (section: TeamSettingsSection) =>
    setSearchParams({ tab: section }, { replace: true });

  const { data: teamsData, isLoading } = useMyTeams();
  const membership = teamsData?.teams.find((m) => m.team.id === teamId);

  // Bounce non-members straight home.
  useEffect(() => {
    if (!teamId) return;
    if (isLoading) return;
    if (!membership) navigate('/', { replace: true });
  }, [isLoading, membership, navigate, teamId]);

  if (!teamId) return null;
  if (isLoading || !membership) {
    return (
      <PageMotion>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="h-7 w-48 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </PageMotion>
    );
  }

  return (
    <PageMotion>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            Team settings
          </p>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            {membership.team.name}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            crelyzor.app/t/{membership.team.slug}
          </p>
        </div>

        <div className="flex gap-6">
          {/* ── Sidebar ── */}
          <nav className="w-48 shrink-0 hidden md:block">
            <div className="space-y-0.5">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ── Mobile tab bar ── */}
          <div className="md:hidden w-full mb-4 -mt-2">
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0
                    ${
                      isActive
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">
            {activeSection === 'general' && (
              <GeneralSection
                teamId={teamId}
                role={membership.role}
                team={membership.team}
              />
            )}
            {activeSection === 'members' && (
              <MembersSection teamId={teamId} role={membership.role} />
            )}
            {activeSection === 'invites' && (
              <InvitesSection teamId={teamId} role={membership.role} />
            )}
            {activeSection === 'cards' && (
              <CardsSection
                teamId={teamId}
                role={membership.role}
                team={membership.team}
              />
            )}
            {activeSection === 'event-types' && (
              <TeamEventTypesSection
                teamId={teamId}
                role={membership.role}
                team={membership.team}
              />
            )}
            {activeSection === 'usage' && (
              <UsageSection teamId={teamId} role={membership.role} />
            )}
            {activeSection === 'billing' && (
              <BillingSection teamId={teamId} role={membership.role} />
            )}
            {activeSection === 'danger' && (
              <DangerSection
                teamId={teamId}
                role={membership.role}
                team={membership.team}
              />
            )}
          </div>
        </div>
      </div>
    </PageMotion>
  );
}
