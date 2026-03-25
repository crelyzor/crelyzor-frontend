import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { PageLoader } from '@/components/PageLoader';

type Props = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: profile, isLoading, isError } = useCurrentUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return <Navigate to="/signin" replace />;
  }

  if (profile && !profile.username && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
