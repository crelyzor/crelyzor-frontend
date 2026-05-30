/**
 * Phase 6 P9.a — Workspace switcher (replaces the legacy UserMenu trigger).
 *
 * Dropdown sections:
 *   1. Active workspace identity (avatar + name + role/plan)
 *   2. Workspace list — personal at top, then each team. Tap to switch.
 *   3. Create team CTA.
 *   4. Divider + account actions (Profile / Settings / Getting started / Sign out).
 *
 * On switch:
 *   - useTeamStore.setActiveTeam(id | null)
 *   - queryClient.invalidateQueries() — broad refetch; team scope is implicit in every cache key
 *
 * The Layout wraps its children in a motion.div keyed by activeTeamId so the
 * route subtree cross-fades on workspace switch.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Check,
  ChevronDown,
  LogOut,
  Plus,
  Settings,
  Settings2,
  Sparkles,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrentUser, useLogout } from '@/hooks/queries/useAuthQueries';
import { useMyTeams } from '@/hooks/queries/useTeamQueries';
import { useTeamStore } from '@/stores';
import { PlanBadge } from '@/components/PlanBadge';
import type { TeamRole } from '@/services/teamService';

const ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: user } = useCurrentUser();
  const { data: teamsData } = useMyTeams();
  const logoutMutation = useLogout();

  const { activeTeamId, setActiveTeam } = useTeamStore();
  const teams = teamsData?.teams ?? [];
  const active = activeTeamId
    ? teams.find((t) => t.team.id === activeTeamId)
    : null;

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const showAvatar = !!user?.avatarUrl && !imgError;

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const switchWorkspace = (teamId: string | null) => {
    if (teamId === activeTeamId) {
      close();
      return;
    }
    setActiveTeam(teamId);
    // Broad invalidation — every cache key implicitly belongs to a scope.
    queryClient.invalidateQueries();
    close();
  };

  const handleLogout = () => {
    close();
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate('/signin', { replace: true }),
    });
  };

  // Identity shown on the trigger: team if active, else the user.
  const displayName = active?.team.name ?? user?.name ?? '…';

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="absolute top-full left-0 mt-1.5 z-50 w-[280px]"
          >
            <div className="rounded-[20px] p-1.5 flex flex-col bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-white/[0.06] shadow-xl dark:shadow-black/50">
              {/* User header */}
              <div className="px-3 py-2.5">
                <p className="text-[13px] font-semibold text-neutral-900 dark:text-white truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                  {user?.email}
                </p>
                <div className="mt-1.5">
                  {!user?.plan || user.plan === 'FREE' ? (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      Free plan
                    </span>
                  ) : (
                    <PlanBadge plan={user.plan} />
                  )}
                </div>
              </div>

              <div className="h-px bg-neutral-100 dark:bg-white/[0.06] mx-1 my-0.5" />

              {/* Workspaces label */}
              <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Workspaces
              </p>

              {/* Personal */}
              <WorkspaceRow
                avatarText={initials}
                avatarUrl={showAvatar ? user!.avatarUrl! : undefined}
                title="Personal"
                subtitle={user?.name ?? ''}
                isActive={activeTeamId === null}
                onClick={() => switchWorkspace(null)}
              />

              {/* Team rows */}
              {teams.map((m) => (
                <WorkspaceRow
                  key={m.team.id}
                  avatarText={m.team.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                  avatarUrl={m.team.logoUrl ?? undefined}
                  title={m.team.name}
                  subtitle={ROLE_LABEL[m.role]}
                  isActive={activeTeamId === m.team.id}
                  onClick={() => switchWorkspace(m.team.id)}
                />
              ))}

              {active && (
                <MenuItem
                  icon={Settings2}
                  label="Team settings"
                  onClick={() => {
                    close();
                    navigate(`/teams/${active.team.id}/settings`);
                  }}
                />
              )}

              <button
                onClick={() => {
                  close();
                  navigate('/teams/new');
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-[13px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition-colors active:scale-[0.98] w-full text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Plus className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                </div>
                Create team
              </button>

              <div className="h-px bg-neutral-100 dark:bg-white/[0.06] mx-1 my-0.5" />

              <MenuItem
                icon={User}
                label="Profile"
                onClick={() => {
                  close();
                  navigate('/settings?tab=profile');
                }}
              />
              <MenuItem
                icon={Settings}
                label="Settings"
                onClick={() => {
                  close();
                  navigate('/settings?tab=appearance');
                }}
              />
              <MenuItem
                icon={Sparkles}
                label="Getting started"
                onClick={() => {
                  close();
                  if (user?.id) {
                    localStorage.removeItem(
                      `crelyzor_onboarding_done:${user.id}`
                    );
                  }
                  navigate('/', { state: { forceOnboarding: true } });
                }}
              />

              <div className="h-px bg-neutral-100 dark:bg-white/[0.06] mx-1 my-0.5" />

              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors active:scale-[0.98] w-full text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                </div>
                {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        {active ? (
          active.team.logoUrl ? (
            <img
              src={active.team.logoUrl}
              alt={active.team.name}
              className="w-6 h-6 rounded-md object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          )
        ) : showAvatar ? (
          <img
            src={user!.avatarUrl!}
            alt={user!.name}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 max-w-[140px] truncate">
          {displayName}
        </span>
        <PlanBadge plan={user?.plan ?? 'FREE'} />
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </motion.div>
      </button>
    </div>
  );
}

function WorkspaceRow({
  avatarText,
  avatarUrl,
  title,
  subtitle,
  isActive,
  onClick,
}: {
  avatarText: string;
  avatarUrl?: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors active:scale-[0.98] w-full text-left"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={title}
          className="w-7 h-7 rounded-md object-cover shrink-0"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 shrink-0">
          {avatarText}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-neutral-900 dark:text-white truncate leading-tight">
          {title}
        </p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
          {subtitle}
        </p>
      </div>
      {isActive && (
        <Check className="w-4 h-4 text-neutral-600 dark:text-neutral-300 shrink-0" />
      )}
    </button>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-[13px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition-colors active:scale-[0.98] w-full text-left"
    >
      <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
      </div>
      {label}
    </button>
  );
}
