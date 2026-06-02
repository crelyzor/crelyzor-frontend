import { Navigate, useParams } from 'react-router-dom';
import { useTeamStore } from '@/stores';

type Props = {
  children: React.ReactNode;
};

/**
 * Blocks team-scoped routes (e.g. /teams/:teamId/settings) when the user
 * is in personal mode. Redirects to home if no active team is selected, or
 * if the active team doesn't match the :teamId in the URL.
 */
export function TeamGuard({ children }: Props) {
  const activeTeamId = useTeamStore((s) => s.activeTeamId);
  const { teamId } = useParams<{ teamId: string }>();

  if (!activeTeamId || (teamId && activeTeamId !== teamId)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
