import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTeamStore, useUIStore } from '@/stores';
import { useMyTeams } from '@/hooks/queries/useTeamQueries';
import type { TeamMembership } from '@/services/teamService';

/**
 * Phase 6 P9.b — Global Cmd/Ctrl+1..9 workspace keybinds.
 *
 * Cmd+1 → Personal, Cmd+2..9 → teams[0..7] (in list order).
 * Fires a broad cache invalidation on switch — same pattern as WorkspaceSwitcher.
 *
 * Note: calls useMyTeams() internally. React Query deduplicates the network
 * request with WorkspaceSwitcher's identical call; the only overhead is a
 * second subscriber (negligible).
 */
export function useWorkspaceKeybinds() {
  const qc = useQueryClient();
  const { data: teamsData } = useMyTeams();
  const teams = teamsData?.teams ?? [];

  // Ref avoids re-registering the listener on every teams refetch
  const teamsRef = useRef<TeamMembership[]>(teams);
  teamsRef.current = teams;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const digit = parseInt(e.key, 10);
      if (isNaN(digit) || digit < 1 || digit > 9) return;

      // Don't fire when command palette is open
      if (useUIStore.getState().commandPaletteOpen) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;

      e.preventDefault();

      const { setActiveTeam } = useTeamStore.getState();
      if (digit === 1) {
        setActiveTeam(null);
      } else {
        const membership = teamsRef.current[digit - 2];
        if (membership) {
          setActiveTeam(membership.team.id);
        }
      }
      // Broad invalidation — same as WorkspaceSwitcher: every cached key is
      // implicitly team-scoped so the full invalidation is correct here.
      qc.invalidateQueries();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [qc]);
}
